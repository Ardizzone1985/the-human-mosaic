import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import {
  sendSponsorApprovedEmail,
  sendSponsorRejectedEmail,
} from "../lib/sponsor-emails.js";

const ADMIN_SESSION_DURATION_MS = 8 * 60 * 60 * 1000;

function getCookie(req, cookieName) {
  const cookieHeader = req.headers.cookie || "";

  const cookies = cookieHeader
    .split(";")
    .map((cookie) => cookie.trim())
    .filter(Boolean);

  for (const cookie of cookies) {
    const separatorIndex = cookie.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const name = cookie.slice(0, separatorIndex);
    const value = cookie.slice(separatorIndex + 1);

    if (name === cookieName) {
      return decodeURIComponent(value);
    }
  }

  return null;
}

function isValidAdminSession(req) {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!secret) {
    console.error("Missing ADMIN_SESSION_SECRET");
    return false;
  }

  const token = getCookie(req, "thm_admin_session");

  if (!token) {
    return false;
  }

  const [issuedAtString, receivedSignature] = token.split(".");

  if (!issuedAtString || !receivedSignature) {
    return false;
  }

  const issuedAt = Number(issuedAtString);

  if (!Number.isFinite(issuedAt)) {
    return false;
  }

  const tokenAge = Date.now() - issuedAt;

  if (
    tokenAge < 0 ||
    tokenAge > ADMIN_SESSION_DURATION_MS
  ) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(issuedAtString)
    .digest("hex");

  const expectedBuffer = Buffer.from(
    expectedSignature,
    "utf8"
  );

  const receivedBuffer = Buffer.from(
    receivedSignature,
    "utf8"
  );

  if (expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(
    expectedBuffer,
    receivedBuffer
  );
}

function createSupabaseAdmin() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing Supabase server environment variables"
    );
  }

  return createClient(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

async function getRequestBody(req) {
  if (req.body && typeof req.body === "object") {
    return req.body;
  }

  return {};
}

async function getAvailableHumanityImpactPlacement(
  supabaseAdmin,
  currentRequestId = null
) {
  const humanityImpactPlacements = [
    "humanity-impact-left",
    "humanity-impact-right",
  ];

  const now = new Date().toISOString();

  /*
   * Load approved Humanity Impact requests that may
   * currently reserve one of the two physical placements.
   */
  let requestsQuery = supabaseAdmin
    .from("sponsor_requests")
    .select(`
      id,
      approved_placement,
      payment_status,
      payment_expires_at
    `)
    .eq("status", "approved")
    .in(
      "approved_placement",
      humanityImpactPlacements
    );

  if (currentRequestId) {
    requestsQuery = requestsQuery.neq(
      "id",
      currentRequestId
    );
  }

  const {
    data: approvedRequests,
    error: requestsError,
  } = await requestsQuery;

  if (requestsError) {
    console.error(
      "Humanity Impact placement lookup error:",
      requestsError
    );

    throw new Error(
      "Unable to verify Humanity Impact availability"
    );
  }

  const occupiedPlacements = new Set();

  for (const request of approvedRequests || []) {
    /*
     * An approved request with a still-valid payment
     * window temporarily reserves its placement.
     */
    if (
      request.payment_status === "pending" &&
      request.payment_expires_at &&
      request.payment_expires_at > now
    ) {
      occupiedPlacements.add(
        request.approved_placement
      );

      continue;
    }

    /*
     * A paid request occupies the placement only while
     * its corresponding campaign is currently active.
     */
    if (request.payment_status === "paid") {
      const {
        data: activeCampaign,
        error: campaignError,
      } = await supabaseAdmin
        .from("sponsor_campaigns")
        .select("id")
        .eq("request_id", request.id)
        .eq("status", "active")
        .lte("starts_at", now)
        .gt("ends_at", now)
        .maybeSingle();

      if (campaignError) {
        console.error(
          "Humanity Impact campaign lookup error:",
          campaignError
        );

        throw new Error(
          "Unable to verify Humanity Impact campaign availability"
        );
      }

      if (activeCampaign) {
        occupiedPlacements.add(
          request.approved_placement
        );
      }
    }
  }

  return (
    humanityImpactPlacements.find(
      (placement) =>
        !occupiedPlacements.has(placement)
    ) || null
  );
}

export default async function handler(req, res) {
  if (!isValidAdminSession(req)) {
    return res.status(401).json({
      error: "Unauthorized",
    });
  }

  let supabaseAdmin;

  try {
    supabaseAdmin = createSupabaseAdmin();
  } catch (error) {
    console.error(
      "Sponsor admin configuration error:",
      error
    );

    return res.status(500).json({
      error: "Server configuration error",
    });
  }

  /*
   * GET
   * Carica tutte le candidature sponsor.
   */
  if (req.method === "GET") {
    const { data, error } = await supabaseAdmin
      .from("sponsor_requests")
      .select(`
        *,
        sponsor_plans (
          id,
          name,
          slug,
          placement,
          room,
          duration_days,
          price_cents,
          currency
        )
      `)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(
        "Sponsor requests load error:",
        error
      );

      return res.status(500).json({
        error: "Unable to load sponsor requests",
      });
    }

    return res.status(200).json({
      requests: data || [],
    });
  }

  /*
   * PATCH
   * Approva o rifiuta una candidatura.
   */
  if (req.method === "PATCH") {
    const body = await getRequestBody(req);

    const requestId = String(
      body.requestId || ""
    ).trim();

    const action = String(
      body.action || ""
    ).trim();

    const rejectionReason = String(
  body.rejectionReason || ""
).trim();

    if (!requestId) {
      return res.status(400).json({
        error: "Missing request ID",
      });
    }

    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({
        error: "Invalid action",
      });
    }

    if (
  action === "reject" &&
  !rejectionReason
) {
  return res.status(400).json({
    error: "A rejection reason is required",
  });
}

if (rejectionReason.length > 1000) {
  return res.status(400).json({
    error: "The rejection reason is too long",
  });
}

    const {
      data: sponsorRequest,
      error: requestError,
    } = await supabaseAdmin
      .from("sponsor_requests")
      .select(`
        *,
        sponsor_plans (
          id,
          name,
          placement,
          room,
          duration_days,
          price_cents,
          currency
        )
      `)
      .eq("id", requestId)
      .single();

    if (requestError || !sponsorRequest) {
      console.error(
        "Sponsor request fetch error:",
        requestError
      );

      return res.status(404).json({
        error: "Sponsor request not found",
      });
    }

    if (sponsorRequest.status !== "pending") {
      return res.status(409).json({
        error:
          "This sponsor request has already been reviewed",
      });
    }

    const reviewedAt = new Date().toISOString();

    let updateData;

    if (action === "approve") {
      const selectedPlan =
        sponsorRequest.sponsor_plans || null;

      const paymentExpiresAt = new Date(
  Date.now() + 48 * 60 * 60 * 1000
).toISOString();

      updateData = {
        status: "approved",
        payment_status: "pending",
        rejection_reason: null,
        reviewed_at: reviewedAt,
        payment_expires_at: paymentExpiresAt,
        approved_placement:
          sponsorRequest.requested_placement ||
          selectedPlan?.placement ||
          null,
        quoted_price_cents:
          selectedPlan?.price_cents ?? null,
        currency:
          selectedPlan?.currency ||
          sponsorRequest.currency ||
          "EUR",
      };
    } else {
      updateData = {
  status: "rejected",
  payment_status: "not_requested",
  rejection_reason: rejectionReason,
  reviewed_at: reviewedAt,
};
    }

    const {
  data: updatedRequest,
  error: updateError,
} = await supabaseAdmin
  .from("sponsor_requests")
  .update(updateData)
  .eq("id", requestId)
  .select("*")
  .single();

if (updateError) {
  console.error(
    "Sponsor request update error:",
    updateError
  );

  return res.status(500).json({
    error:
      action === "approve"
        ? "Unable to approve sponsor request"
        : "Unable to reject sponsor request",
  });
}

let emailSent = false;
let emailError = null;

try {
  if (action === "approve") {
    const paymentUrl =
  `https://thehumanmosaic.art/sponsor-payment.html` +
  `?requestId=${encodeURIComponent(updatedRequest.id)}`;
    
    await sendSponsorApprovedEmail({
      email: sponsorRequest.email,
      contactName: sponsorRequest.contact_name,
      company: sponsorRequest.company,
      planName:
        sponsorRequest.sponsor_plans?.name ||
        "Partnership plan",
      preferredRoom:
        sponsorRequest.preferred_room ||
        sponsorRequest.sponsor_plans?.room,
      approvedPlacement:
        updatedRequest.approved_placement ||
        sponsorRequest.requested_placement,
      requestedDays:
        sponsorRequest.requested_days ||
        sponsorRequest.sponsor_plans?.duration_days,
      quotedPriceCents:
        updatedRequest.quoted_price_cents,
      currency:
        updatedRequest.currency || "EUR",
      paymentUrl,
    });
  } else {
    await sendSponsorRejectedEmail({
      email: sponsorRequest.email,
      contactName: sponsorRequest.contact_name,
      company: sponsorRequest.company,
      rejectionReason,
    });
  }

  emailSent = true;
} catch (error) {
  emailError =
    error.message ||
    "Unable to send sponsor notification email";

  console.error(
    "Sponsor notification email error:",
    error
  );
}

return res.status(200).json({
  success: true,
  request: updatedRequest,
  emailSent,
  emailError,
});
  }

  res.setHeader("Allow", "GET, PATCH");

  return res.status(405).json({
    error: "Method not allowed",
  });
}
