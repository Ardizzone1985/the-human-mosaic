import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const APP_URL =
  "https://the-human-mosaic-immersive-app.vercel.app";

const EARLY_ACCESS_LIMIT = 1000;
const CHECKOUT_MINUTES = 30;
const ALLOWED_ORIGIN =
  "https://the-human-mosaic-immersive-app.vercel.app";

export default async function handler(req, res) {
  res.setHeader(
    "Access-Control-Allow-Origin",
    ALLOWED_ORIGIN
  );

  res.setHeader(
    "Access-Control-Allow-Methods",
    "POST, OPTIONS"
  );

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  res.setHeader("Vary", "Origin");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const authorization = req.headers.authorization || "";
    const accessToken = authorization.startsWith("Bearer ")
      ? authorization.slice(7)
      : "";

    if (!accessToken) {
      return res.status(401).json({
        error: "Authentication required",
      });
    }

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(accessToken);

    if (userError || !user) {
      return res.status(401).json({
        error: "Invalid or expired authentication",
      });
    }

    const {
      room,
      wall,
      section,
      spot,
      slotCode,
      fullName,
      email,
      country,
      note,
    } = req.body || {};

    if (
      !room ||
      !wall ||
      !section ||
      !spot ||
      !slotCode
    ) {
      return res.status(400).json({
        error: "Missing required checkout data",
      });
    }

    if (
      !["Identity", "Love", "Creativity"].includes(room)
    ) {
      return res.status(400).json({
        error: "Invalid Room",
      });
    }

    const { data: slot, error: slotError } =
      await supabaseAdmin
        .from("slots")
        .select(
          `
          id,
          room,
          wall,
          section,
          slot_code,
          status,
          reserved_at,
          reserved_by,
          reservation_id,
          payment_confirmed
          `
        )
        .eq("slot_code", slotCode)
        .maybeSingle();

    if (slotError) {
      throw slotError;
    }

    if (!slot) {
      return res.status(404).json({
        error: "Slot not found",
      });
    }

    if (
      slot.room !== room ||
      slot.wall !== wall ||
      slot.section !== section
    ) {
      return res.status(409).json({
        error: "Slot details do not match",
      });
    }

    if (
      slot.status !== "reserved" ||
      slot.reserved_by !== user.id
    ) {
      return res.status(409).json({
        error:
          "This position is not reserved by the authenticated user",
      });
    }

    if (slot.payment_confirmed === true) {
      return res.status(409).json({
        error: "This position has already been paid",
      });
    }

    // The checkout must belong to the exact reservation created by the RPC.
    // Do not create a new reservation ID here.
    if (!slot.reservation_id || !slot.reserved_at) {
      return res.status(409).json({
        error: "Reservation identity is missing",
      });
    }

    const reservationId = slot.reservation_id;
    const now = new Date();
    const reservationTime = new Date(slot.reserved_at).getTime();
    const reservationCutoff = new Date(now.getTime() - 35 * 60 * 1000);

    if (
      !Number.isFinite(reservationTime) ||
      reservationTime > now.getTime() ||
      reservationTime <= reservationCutoff.getTime()
    ) {
      return res.status(409).json({
        error: "Reservation has expired. Please reserve the position again",
      });
    }

    // Renew only this exact, still-valid reservation. Checking the returned
    // row prevents Stripe checkout from opening after a failed conditional update.
    const { data: refreshedSlots, error: refreshReservationError } =
      await supabaseAdmin
        .from("slots")
        .update({ reserved_at: now.toISOString() })
        .eq("slot_code", slotCode)
        .eq("reservation_id", reservationId)
        .eq("reserved_by", user.id)
        .eq("status", "reserved")
        .eq("payment_confirmed", false)
        .gt("reserved_at", reservationCutoff.toISOString())
        .select("id, reservation_id");

    if (refreshReservationError) {
      throw refreshReservationError;
    }

    if (
      refreshedSlots?.length !== 1 ||
      refreshedSlots[0].id !== slot.id ||
      refreshedSlots[0].reservation_id !== reservationId
    ) {
      return res.status(409).json({
        error: "Reservation changed or expired. Please try again",
      });
    }

    const { data: mosaicStats, error: statsError } =
  await supabaseAdmin
    .rpc("get_public_mosaic_stats")
    .single();

if (statsError || !mosaicStats) {
  throw new Error(
    "Unable to verify Early Access availability"
  );
}

const rawTotal = mosaicStats.total_memories;
const approvedPhotographs = Number(rawTotal);

if (
  rawTotal === null ||
  rawTotal === undefined ||
  rawTotal === "" ||
  !Number.isSafeInteger(approvedPhotographs) ||
  approvedPhotographs < 0
) {
  throw new Error(
    "Invalid approved photographs count"
  );
}

const earlyAccessActive =
  approvedPhotographs < EARLY_ACCESS_LIMIT;

    let finalPrice;
    let formattedPrice;

    if (earlyAccessActive) {
      finalPrice = room === "Creativity" ? 10 : 5;
      formattedPrice =
        `€${finalPrice} — early access participation fee`;
    } else {
      finalPrice = room === "Creativity" ? 20 : 15;
      formattedPrice =
        `€${finalPrice} — one-time participation fee`;
    }

    const metadata = {
      source: "immersive_app",
      userId: user.id,
      room,
      wall,
      section,
      spot,
      slotCode,
      reservationId,
      fullName: String(fullName || "").slice(0, 500),
      email: String(email || user.email || "").slice(0, 500),
      country: String(country || "").slice(0, 500),
      note: String(note || "").slice(0, 500),
      formattedPrice,
      earlyAccess: earlyAccessActive ? "true" : "false",
    };

    const expiresAt =
      Math.floor(Date.now() / 1000) +
      CHECKOUT_MINUTES * 60;

    const successUrl =
      `${APP_URL}/?payment=success` +
      `&session_id={CHECKOUT_SESSION_ID}`;

    const cancelUrl =
      `${APP_URL}/?payment=cancelled` +
      `&slotCode=${encodeURIComponent(slotCode)}`;

    const session =
      await stripe.checkout.sessions.create({
        payment_method_types: ["card", "paypal"],
        mode: "payment",
        client_reference_id: slotCode,
        customer_email: user.email || undefined,
        expires_at: expiresAt,

        line_items: [
          {
            price_data: {
              currency: "eur",
              product_data: {
                name:
                  `The Human Mosaic - ${room} Room`,
              },
              unit_amount: finalPrice * 100,
            },
            quantity: 1,
          },
        ],

        metadata,

        payment_intent_data: {
          metadata,
        },

        success_url: successUrl,
        cancel_url: cancelUrl,
      });

    return res.status(200).json({
      url: session.url,
      sessionId: session.id,
      price: finalPrice,
      formattedPrice,
      earlyAccessActive,
      expiresAt,
    });
  } catch (error) {
    console.error(
      "APP STRIPE CHECKOUT ERROR:",
      error
    );

    return res.status(500).json({
      error:
        error.message ||
        "Stripe session creation failed",
    });
  }
}
