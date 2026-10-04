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

    /*
     * Rinnova l'inizio della riserva prima di aprire Stripe.
     * La durata di Checkout sarà di 30 minuti.
     */
    const now = new Date();
    const nowIso = now.toISOString();

    const { error: refreshReservationError } =
      await supabaseAdmin
        .from("slots")
        .update({
          reserved_at: nowIso,
        })
        .eq("slot_code", slotCode)
        .eq("reserved_by", user.id)
        .eq("status", "reserved")
        .eq("payment_confirmed", false);

    if (refreshReservationError) {
      throw refreshReservationError;
    }

    const { count, error: countError } =
      await supabaseAdmin
        .from("slots")
        .select("*", {
          count: "exact",
          head: true,
        })
        .eq("payment_confirmed", true);

    if (countError) {
      throw new Error(
        "Unable to verify Early Access availability"
      );
    }

    const earlyAccessActive =
      Number(count || 0) < EARLY_ACCESS_LIMIT;

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
