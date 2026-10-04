import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY
);

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

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
    const authorization =
      req.headers.authorization || "";

    const accessToken =
      authorization.startsWith("Bearer ")
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
    } = await supabaseAdmin.auth.getUser(
      accessToken
    );

    if (userError || !user) {
      return res.status(401).json({
        error:
          "Invalid or expired authentication",
      });
    }

    const {
      session_id: sessionId,
      slotCode: expectedSlotCode,
    } = req.body || {};

    if (!sessionId || !expectedSlotCode) {
      return res.status(400).json({
        error:
          "Missing payment verification data",
      });
    }

    const checkoutSession =
      await stripe.checkout.sessions.retrieve(
        sessionId
      );

    const metadata =
      checkoutSession.metadata || {};

    if (metadata.source !== "immersive_app") {
      return res.status(403).json({
        error:
          "This payment does not belong to the immersive app",
      });
    }

    if (metadata.userId !== user.id) {
      return res.status(403).json({
        error:
          "This payment does not belong to the authenticated user",
      });
    }

    if (
      metadata.slotCode !== expectedSlotCode ||
      checkoutSession.client_reference_id !==
        expectedSlotCode
    ) {
      return res.status(409).json({
        error:
          "The payment does not match the reserved position",
      });
    }

    if (
      checkoutSession.payment_status !== "paid"
    ) {
      return res.status(402).json({
        success: false,
        paymentConfirmed: false,
        error: "Payment not completed",
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
          reserved_by,
          payment_confirmed,
          payment_confirmed_at
          `
        )
        .eq(
          "slot_code",
          expectedSlotCode
        )
        .maybeSingle();

    if (slotError) {
      throw slotError;
    }

    if (!slot) {
      return res.status(404).json({
        error: "Reserved position not found",
      });
    }

    if (
      slot.reserved_by &&
      slot.reserved_by !== user.id
    ) {
      return res.status(403).json({
        error:
          "This position belongs to another participant",
      });
    }

    /*
     * Stripe può aver confermato il pagamento qualche
     * istante prima che il webhook abbia aggiornato
     * Supabase. In quel caso chiediamo al client di
     * riprovare, senza aprire ancora l'upload.
     */
    if (slot.payment_confirmed !== true) {
      return res.status(202).json({
        success: false,
        paymentConfirmed: false,
        webhookPending: true,
        message:
          "Payment received. Final confirmation is still being processed.",
      });
    }

    return res.status(200).json({
      success: true,
      paymentConfirmed: true,
      sessionId: checkoutSession.id,
      customerEmail:
        checkoutSession.customer_details
          ?.email ||
        user.email ||
        null,
      slot: {
        room: slot.room,
        wall: slot.wall,
        section: slot.section,
        slotCode: slot.slot_code,
        status: slot.status,
        paymentConfirmedAt:
          slot.payment_confirmed_at,
      },
      checkout: {
        amountTotal:
          checkoutSession.amount_total,
        currency: checkoutSession.currency,
        formattedPrice:
          metadata.formattedPrice || "",
        earlyAccess:
          metadata.earlyAccess === "true",
      },
    });
  } catch (error) {
    console.error(
      "APP PAYMENT VERIFICATION ERROR:",
      error
    );

    return res.status(500).json({
      error:
        error.message ||
        "Payment verification failed",
    });
  }
}
