import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

function createAdminToken() {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!secret) {
    throw new Error("Missing ADMIN_SESSION_SECRET");
  }

  const issuedAt = Date.now().toString();

  const signature = crypto
    .createHmac("sha256", secret)
    .update(issuedAt)
    .digest("hex");

  return `${issuedAt}.${signature}`;
}

function getAdminTokenFromRequest(req) {
  const cookieHeader = req.headers.cookie || "";

  const cookies = cookieHeader
    .split(";")
    .map((cookie) => cookie.trim())
    .filter(Boolean);

  const adminCookie = cookies.find((cookie) =>
    cookie.startsWith("thm_admin_session=")
  );

  if (!adminCookie) {
    return null;
  }

  return adminCookie.substring("thm_admin_session=".length);
}

function verifyAdminToken(token) {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!secret || !token) {
    return false;
  }

  const separatorIndex = token.indexOf(".");

  if (separatorIndex === -1) {
    return false;
  }

  const issuedAt = token.substring(0, separatorIndex);
  const receivedSignature = token.substring(separatorIndex + 1);

  if (!issuedAt || !receivedSignature) {
    return false;
  }

  const timestamp = Number(issuedAt);

  if (!Number.isFinite(timestamp)) {
    return false;
  }

  const maxAge = 8 * 60 * 60 * 1000;

  if (Date.now() - timestamp > maxAge || timestamp > Date.now()) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(issuedAt)
    .digest("hex");

  const receivedBuffer = Buffer.from(receivedSignature, "hex");
  const expectedBuffer = Buffer.from(expectedSignature, "hex");

  if (receivedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(receivedBuffer, expectedBuffer);
}

function getSupabaseAdmin() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase environment variables");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

export default async function handler(req, res) {
  try {

    // ---------------------------------------------------------
    // GET ?action=manual-gallery-v2-check
    // Verify Admin authentication for Gallery V2.
    // Read-only: no database changes.
    // ---------------------------------------------------------
    if (
      req.method === "GET" &&
      req.query?.action === "manual-gallery-v2-check"
    ) {
      const token = getAdminTokenFromRequest(req);

      if (!verifyAdminToken(token)) {
        return res.status(401).json({
          success: false,
          error: "Unauthorized",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Gallery V2 Admin authentication verified",
        mode: "read-only",
      });
    }

        // ---------------------------------------------------------
    // GET ?action=manual-gallery-v2-ready
    // Check that the manual submission RPC exists.
    // No submissions or slot changes.
    // ---------------------------------------------------------
    if (
      req.method === "GET" &&
      req.query?.action === "manual-gallery-v2-ready"
    ) {
      const token = getAdminTokenFromRequest(req);

      if (!verifyAdminToken(token)) {
        return res.status(401).json({
          success: false,
          error: "Unauthorized",
        });
      }

      const supabase = getSupabaseAdmin();

      const { data, error } = await supabase
        .rpc("admin_create_manual_submission", {
          p_slot_code: null,
          p_submission_id: null,
          p_full_name: null,
          p_email: null,
          p_country: null,
          p_note: null,
          p_image_file_name: null,
          p_image_url: null,
        });

      if (error) {
        const message = error.message || "";

        if (message.includes("Missing required submission data")) {
          return res.status(200).json({
            success: true,
            message: "Gallery V2 manual submission RPC verified",
            mode: "validation-only",
          });
        }

        console.error("Manual Gallery V2 RPC check:", error);

        return res.status(500).json({
          success: false,
          error: "Manual submission RPC verification failed",
        });
      }

      return res.status(500).json({
        success: false,
        error: "Unexpected RPC response",
      });
    }

        // ---------------------------------------------------------
    // GET ?action=manual-gallery-v2-slots
    // Read available Gallery V2 slots for authenticated Admin.
    // ---------------------------------------------------------
    if (
      req.method === "GET" &&
      req.query?.action === "manual-gallery-v2-slots"
    ) {
      const token = getAdminTokenFromRequest(req);

      if (!verifyAdminToken(token)) {
        return res.status(401).json({
          success: false,
          error: "Unauthorized",
        });
      }

      const { room, wall, section } = req.query || {};

      const validRooms = ["Identity", "Love", "Creativity"];
      const validWalls = ["Front Wall", "Left Wall", "Right Wall"];

      if (
        !validRooms.includes(room) ||
        !validWalls.includes(wall) ||
        !/^(F([1-9]|10)|L[1-6]|R[1-6])$/.test(section || "") ||
        (wall === "Front Wall" && !section.startsWith("F")) ||
        (wall === "Left Wall" && !section.startsWith("L")) ||
        (wall === "Right Wall" && !section.startsWith("R"))
      ) {
        return res.status(400).json({
          success: false,
          error: "Invalid Gallery V2 position",
        });
      }

      const supabase = getSupabaseAdmin();

      const { data, error } = await supabase
        .from("slots")
        .select(
          "slot_code, room, wall, section, row_number, col_number, section_number, view_number"
        )
        .eq("room", room)
        .eq("wall", wall)
        .eq("section", section)
        .eq("status", "available")
        .eq("payment_confirmed", false)
        .is("submission_id", null)
        .order("row_number", { ascending: true })
        .order("col_number", { ascending: true })
        .limit(600);

      if (error) {
        console.error("Admin Gallery V2 slots error:", error);

        return res.status(500).json({
          success: false,
          error: "Failed to load Gallery V2 slots",
        });
      }

      return res.status(200).json({
        success: true,
        room,
        wall,
        section,
        total: data?.length || 0,
        slots: data || [],
      });
    }

        // ---------------------------------------------------------
    // POST ?action=manual-gallery-v2-upload-url
    // STEP 7.17 — Admin authentication test only.
    // No uploads or database changes.
    // ---------------------------------------------------------
    if (
      req.method === "POST" &&
      req.query?.action === "manual-gallery-v2-upload-url"
    ) {
      const token = getAdminTokenFromRequest(req);

      if (!verifyAdminToken(token)) {
        return res.status(401).json({
          success: false,
          error: "Unauthorized",
        });
      }

            // STEP 7.18 — Validate image metadata.
      // No signed URL or upload is created yet.

      const { fileName, fileType, fileSize } = req.body || {};

      const allowedTypes = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
      };

      const maxFileSize = 5 * 1024 * 1024;

      if (
        typeof fileName !== "string" ||
        !fileName.trim() ||
        fileName.length > 255 ||
        !Object.prototype.hasOwnProperty.call(allowedTypes, fileType) ||
        !Number.isSafeInteger(fileSize) ||
        fileSize <= 0 ||
        fileSize > maxFileSize
      ) {
        return res.status(400).json({
          success: false,
          error: "Invalid image metadata",
        });
      }

            // STEP 7.19 — Generate a unique Storage upload path.
      const supabase = getSupabaseAdmin();

      const imageId = crypto.randomUUID();

      const storagePath =
        `manual-admin/${imageId}.${allowedTypes[fileType]}`;

      const { data, error } = await supabase.storage
        .from("images")
        .createSignedUploadUrl(storagePath);

      if (error || !data?.token) {
        console.error("Gallery V2 signed upload error:", error);

        return res.status(500).json({
          success: false,
          error: "Failed to prepare image upload",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Gallery V2 signed upload URL generated",
        upload: {
          path: storagePath,
          token: data.token,
          signedUrl: data.signedUrl,
        },
      });
    }

        // ---------------------------------------------------------
    // GET ?action=manual-gallery-v2-verify-image
    // STEP 7.23 — Read-only Storage verification.
    // ---------------------------------------------------------
    if (
      req.method === "GET" &&
      req.query?.action === "manual-gallery-v2-verify-image"
    ) {
      const token = getAdminTokenFromRequest(req);

      if (!verifyAdminToken(token)) {
        return res.status(401).json({
          success: false,
          error: "Unauthorized",
        });
      }

      const { path } = req.query || {};

      const validPath =
        typeof path === "string" &&
        /^manual-admin\/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(jpg|png|webp)$/i.test(path);

      if (!validPath) {
        return res.status(400).json({
          success: false,
          error: "Invalid manual image path",
        });
      }

      const supabase = getSupabaseAdmin();

      const fileName = path.split("/")[1];

      const { data, error } = await supabase.storage
        .from("images")
        .list("manual-admin", {
          search: fileName,
          limit: 100,
        });

      if (error) {
        console.error("Manual image verification error:", error);

        return res.status(500).json({
          success: false,
          error: "Failed to verify image",
        });
      }

      const file = (data || []).find(
        (item) => item.name === fileName
      );

      if (!file) {
        return res.status(404).json({
          success: false,
          error: "Image not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Manual image found in Storage",
        mode: "read-only",
        path,
      });
    }
    
        // ---------------------------------------------------------
    // GET ?action=impact-donations
    // Load Humanity Impact donations for the authenticated admin.
    // ---------------------------------------------------------
    if (
      req.method === "GET" &&
      req.query?.action === "impact-donations"
    ) {
      const token = getAdminTokenFromRequest(req);

      if (!verifyAdminToken(token)) {
        return res.status(401).json({
          error: "Unauthorized",
        });
      }

      const supabase = getSupabaseAdmin();

      const { data, error } = await supabase
        .from("impact_donations")
        .select(
          "id, title, organization_name, cause, description, amount, currency, donation_date, is_published, created_at, updated_at"
        )
        .order("donation_date", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) {
        console.error(
          "Admin impact donations query error:",
          error
        );

        return res.status(500).json({
          error: "Failed to load impact donations",
        });
      }

      return res.status(200).json({
        success: true,
        donations: data || [],
      });
    }

    // ---------------------------------------------------------
    // POST ?action=create-impact-donation
    // Create a Humanity Impact donation as authenticated admin.
    // ---------------------------------------------------------
    if (
      req.method === "POST" &&
      req.query?.action === "create-impact-donation"
    ) {
      const token = getAdminTokenFromRequest(req);

      if (!verifyAdminToken(token)) {
        return res.status(401).json({
          error: "Unauthorized",
        });
      }

      const {
        title,
        organizationName,
        cause,
        description,
        amount,
        currency,
        donationDate,
        isPublished,
      } = req.body || {};

      const cleanTitle =
        typeof title === "string" ? title.trim() : "";

      const cleanOrganizationName =
        typeof organizationName === "string"
          ? organizationName.trim()
          : "";

      const cleanCause =
        typeof cause === "string" && cause.trim()
          ? cause.trim()
          : null;

      const cleanDescription =
        typeof description === "string" && description.trim()
          ? description.trim()
          : null;

      const numericAmount = Number(amount);

      const cleanCurrency =
        typeof currency === "string"
          ? currency.trim().toUpperCase()
          : "";

      const cleanDonationDate =
        typeof donationDate === "string"
          ? donationDate.trim()
          : "";

      if (!cleanTitle) {
        return res.status(400).json({
          error: "Title is required",
        });
      }

      if (!cleanOrganizationName) {
        return res.status(400).json({
          error: "Organization name is required",
        });
      }

      if (
        !Number.isFinite(numericAmount) ||
        numericAmount <= 0
      ) {
        return res.status(400).json({
          error: "Amount must be greater than zero",
        });
      }

      if (!/^[A-Z]{3}$/.test(cleanCurrency)) {
        return res.status(400).json({
          error: "Currency must be a valid 3-letter code",
        });
      }

      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(cleanDonationDate)
      ) {
        return res.status(400).json({
          error: "Donation date must use YYYY-MM-DD format",
        });
      }

      const parsedDate = new Date(
        `${cleanDonationDate}T00:00:00Z`
      );

      if (
        Number.isNaN(parsedDate.getTime()) ||
        parsedDate.toISOString().slice(0, 10) !==
          cleanDonationDate
      ) {
        return res.status(400).json({
          error: "Invalid donation date",
        });
      }

      const supabase = getSupabaseAdmin();

      const { data, error } = await supabase
        .from("impact_donations")
        .insert({
          title: cleanTitle,
          organization_name: cleanOrganizationName,
          cause: cleanCause,
          description: cleanDescription,
          amount: numericAmount,
          currency: cleanCurrency,
          donation_date: cleanDonationDate,
          is_published: isPublished === true,
        })
        .select(
          "id, title, organization_name, cause, description, amount, currency, donation_date, is_published, created_at, updated_at"
        )
        .single();

      if (error) {
        console.error(
          "Admin impact donation create error:",
          error
        );

        return res.status(500).json({
          error: "Failed to create impact donation",
        });
      }

      return res.status(201).json({
        success: true,
        donation: data,
      });
    }

        // ---------------------------------------------------------
    // POST ?action=update-impact-donation
    // Update a Humanity Impact donation as authenticated admin.
    // ---------------------------------------------------------
    if (
      req.method === "POST" &&
      req.query?.action === "update-impact-donation"
    ) {
      const token = getAdminTokenFromRequest(req);

      if (!verifyAdminToken(token)) {
        return res.status(401).json({
          error: "Unauthorized",
        });
      }

      const {
        id,
        title,
        organizationName,
        cause,
        description,
        amount,
        currency,
        donationDate,
        isPublished,
      } = req.body || {};

      const cleanId =
        typeof id === "string" ? id.trim() : "";

      const cleanTitle =
        typeof title === "string" ? title.trim() : "";

      const cleanOrganizationName =
        typeof organizationName === "string"
          ? organizationName.trim()
          : "";

      const cleanCause =
        typeof cause === "string" && cause.trim()
          ? cause.trim()
          : null;

      const cleanDescription =
        typeof description === "string" && description.trim()
          ? description.trim()
          : null;

      const numericAmount = Number(amount);

      const cleanCurrency =
        typeof currency === "string"
          ? currency.trim().toUpperCase()
          : "";

      const cleanDonationDate =
        typeof donationDate === "string"
          ? donationDate.trim()
          : "";

      if (
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
          cleanId
        )
      ) {
        return res.status(400).json({
          error: "Invalid donation ID",
        });
      }

      if (!cleanTitle) {
        return res.status(400).json({
          error: "Title is required",
        });
      }

      if (!cleanOrganizationName) {
        return res.status(400).json({
          error: "Organization name is required",
        });
      }

      if (
        !Number.isFinite(numericAmount) ||
        numericAmount <= 0
      ) {
        return res.status(400).json({
          error: "Amount must be greater than zero",
        });
      }

      if (!/^[A-Z]{3}$/.test(cleanCurrency)) {
        return res.status(400).json({
          error: "Currency must be a valid 3-letter code",
        });
      }

      if (!/^\d{4}-\d{2}-\d{2}$/.test(cleanDonationDate)) {
        return res.status(400).json({
          error: "Donation date must use YYYY-MM-DD format",
        });
      }

      const parsedDate = new Date(
        `${cleanDonationDate}T00:00:00Z`
      );

      if (
        Number.isNaN(parsedDate.getTime()) ||
        parsedDate.toISOString().slice(0, 10) !==
          cleanDonationDate
      ) {
        return res.status(400).json({
          error: "Invalid donation date",
        });
      }

      const supabase = getSupabaseAdmin();

      const { data, error } = await supabase
        .from("impact_donations")
        .update({
          title: cleanTitle,
          organization_name: cleanOrganizationName,
          cause: cleanCause,
          description: cleanDescription,
          amount: numericAmount,
          currency: cleanCurrency,
          donation_date: cleanDonationDate,
          is_published: isPublished === true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", cleanId)
        .select(
          "id, title, organization_name, cause, description, amount, currency, donation_date, is_published, created_at, updated_at"
        )
        .maybeSingle();

      if (error) {
        console.error(
          "Admin impact donation update error:",
          error
        );

        return res.status(500).json({
          error: "Failed to update impact donation",
        });
      }

      if (!data) {
        return res.status(404).json({
          error: "Impact donation not found",
        });
      }

      return res.status(200).json({
        success: true,
        donation: data,
      });
    }

        // ---------------------------------------------------------
    // POST ?action=delete-impact-donation
    // Delete a Humanity Impact donation as authenticated admin.
    // ---------------------------------------------------------
    if (
      req.method === "POST" &&
      req.query?.action === "delete-impact-donation"
    ) {
      const token = getAdminTokenFromRequest(req);

      if (!verifyAdminToken(token)) {
        return res.status(401).json({
          error: "Unauthorized",
        });
      }

      const { id } = req.body || {};

      const cleanId =
        typeof id === "string" ? id.trim() : "";

      if (
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
          cleanId
        )
      ) {
        return res.status(400).json({
          error: "Invalid donation ID",
        });
      }

      const supabase = getSupabaseAdmin();

      const { data, error } = await supabase
        .from("impact_donations")
        .delete()
        .eq("id", cleanId)
        .select("id, title")
        .maybeSingle();

      if (error) {
        console.error(
          "Admin impact donation delete error:",
          error
        );

        return res.status(500).json({
          error: "Failed to delete impact donation",
        });
      }

      if (!data) {
        return res.status(404).json({
          error: "Impact donation not found",
        });
      }

      return res.status(200).json({
        success: true,
        deletedDonation: data,
      });
    }

    // ---------------------------------------------------------
    // GET ?action=comments
    
    // ---------------------------------------------------------
    // GET ?action=comments
    // Load comments for the authenticated admin.
    // ---------------------------------------------------------
    if (req.method === "GET") {
      if (req.query?.action !== "comments") {
        return res.status(400).json({
          error: "Invalid action",
        });
      }

      const token = getAdminTokenFromRequest(req);

      if (!verifyAdminToken(token)) {
        return res.status(401).json({
          error: "Unauthorized",
        });
      }

      const supabase = getSupabaseAdmin();

      const { data, error } = await supabase
        .from("photo_comments")
        .select(
          "id, submission_id, user_id, comment, created_at, approval_status, moderation_flagged, moderation_categories, moderation_model, moderated_at, approved_at"
        )
        .order("created_at", { ascending: false })
        .limit(200);

      if (error) {
        console.error("Admin comments query error:", error);

        return res.status(500).json({
          error: "Failed to load comments",
        });
      }

      return res.status(200).json({
        success: true,
        comments: data || [],
      });
    }

    // ---------------------------------------------------------
    // POST ?action=moderate-comment
    // Approve or reject a photo comment.
    // ---------------------------------------------------------
    if (
      req.method === "POST" &&
      req.query?.action === "moderate-comment"
    ) {
      const token = getAdminTokenFromRequest(req);

      if (!verifyAdminToken(token)) {
        return res.status(401).json({
          error: "Unauthorized",
        });
      }

      const { commentId, decision } = req.body || {};

      if (!commentId) {
        return res.status(400).json({
          error: "Missing commentId",
        });
      }

      if (decision !== "approve" && decision !== "reject") {
        return res.status(400).json({
          error: "Invalid decision",
        });
      }

      const supabase = getSupabaseAdmin();

      const updateData =
        decision === "approve"
          ? {
              approval_status: "approved",
              approved_at: new Date().toISOString(),
            }
          : {
              approval_status: "rejected",
              approved_at: null,
            };

      const { data, error } = await supabase
        .from("photo_comments")
        .update(updateData)
        .eq("id", commentId)
        .select(
          "id, submission_id, comment, approval_status, moderation_flagged, approved_at"
        )
        .maybeSingle();

      if (error) {
        console.error("Admin comment moderation error:", error);

        return res.status(500).json({
          error: "Failed to moderate comment",
        });
      }

      if (!data) {
        return res.status(404).json({
          error: "Comment not found",
        });
      }

      return res.status(200).json({
        success: true,
        comment: data,
      });
    }

    // ---------------------------------------------------------
    // POST
    // Existing admin login.
    // ---------------------------------------------------------
    if (req.method === "POST") {
      const { password } = req.body || {};

      if (!password) {
        return res.status(400).json({
          error: "Missing password",
        });
      }

      if (
        !process.env.ADMIN_PANEL_PASSWORD ||
        password !== process.env.ADMIN_PANEL_PASSWORD
      ) {
        return res.status(401).json({
          error: "Invalid password",
        });
      }

      const token = createAdminToken();

      res.setHeader(
        "Set-Cookie",
        [
          `thm_admin_session=${token}`,
          "Path=/",
          "HttpOnly",
          "Secure",
          "SameSite=Strict",
          "Max-Age=28800",
        ].join("; ")
      );

      return res.status(200).json({
        success: true,
      });
    }

    return res.status(405).json({
      error: "Method not allowed",
    });
  } catch (error) {
    console.error("Admin API error:", error);

    return res.status(500).json({
      error: "Server error",
    });
  }
}
