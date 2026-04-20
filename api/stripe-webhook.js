import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const config = {
  api: {
    bodyParser: false,
  },
};

async function getRawBody(req) {
  return await new Promise((resolve, reject) => {
    const chunks = [];

    req.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

async function markSlotAsPaid(supabase, payload) {
  const {
    slotCode,
    sessionId = null,
    paymentStatus = "paid",
    customerEmail = null,
    room = null,
    fullName = null,
    country = null
  } = payload;

  if (!slotCode) {
    console.error("❌ Missing slotCode while marking payment");
    return;
  }

  const now = new Date().toISOString();

  const { error: slotError } = await supabase
    .from("slots")
    .update({
      payment_confirmed: true,
      payment_confirmed_at: now
    })
    .eq("slot_code", slotCode);

  if (slotError) {
    console.error("❌ SLOT PAYMENT UPDATE ERROR:", slotError);
  } else {
    console.log("✅ Slot marked as paid:", slotCode);
  }

  const row = {
    stripe_session_id: sessionId,
    payment_status: paymentStatus,
    customer_email: customerEmail,
    room,
    slot_code: slotCode,
    full_name: fullName,
    country
  };

  const { error: paymentInsertError } = await supabase
    .from("stripe_payments")
    .insert([row]);

  if (paymentInsertError) {
    console.error("❌ STRIPE_PAYMENTS INSERT ERROR:", paymentInsertError);
  } else {
    console.log("✅ stripe_payments row inserted");
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  console.log("📩 Stripe webhook received");

  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!stripeSecretKey) {
      console.error("❌ Missing STRIPE_SECRET_KEY");
      return res.status(200).json({ received: true });
    }

    if (!stripeWebhookSecret) {
      console.error("❌ Missing STRIPE_WEBHOOK_SECRET");
      return res.status(200).json({ received: true });
    }

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
      return res.status(200).json({ received: true });
    }

    const stripe = new Stripe(stripeSecretKey);
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    const signature = req.headers["stripe-signature"];

    if (!signature) {
      console.error("❌ Missing Stripe-Signature header");
      return res.status(200).json({ received: true });
    }

    const rawBody = await getRawBody(req);

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        stripeWebhookSecret
      );
    } catch (err) {
      console.error("❌ STRIPE WEBHOOK SIGNATURE ERROR:", err.message);
      return res.status(200).json({ received: true });
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      const slotCode =
        session.metadata?.slotCode ||
        session.client_reference_id ||
        null;

      console.log("✅ checkout.session.completed", {
        sessionId: session.id,
        slotCode,
        paymentStatus: session.payment_status || null,
        email: session.metadata?.email || session.customer_details?.email || null,
      });

      await markSlotAsPaid(supabase, {
        slotCode,
        sessionId: session.id,
        paymentStatus: session.payment_status || "paid",
        customerEmail: session.metadata?.email || session.customer_details?.email || null,
        room: session.metadata?.room || null,
        fullName: session.metadata?.fullName || null,
        country: session.metadata?.country || null
      });
    }

    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;
      const slotCode = paymentIntent.metadata?.slotCode || null;

      console.log("✅ payment_intent.succeeded", {
        paymentIntentId: paymentIntent.id,
        slotCode,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency
      });

      await markSlotAsPaid(supabase, {
        slotCode,
        sessionId: paymentIntent.id,
        paymentStatus: "paid",
        customerEmail: paymentIntent.metadata?.email || null,
        room: paymentIntent.metadata?.room || null,
        fullName: paymentIntent.metadata?.fullName || null,
        country: paymentIntent.metadata?.country || null
      });
    }

    if (event.type === "checkout.session.expired") {
      const session = event.data.object;
      const slotCode =
        session.metadata?.slotCode ||
        session.client_reference_id ||
        null;

      console.log("⌛ checkout.session.expired", {
        sessionId: session.id,
        slotCode,
        email: session.metadata?.email || null,
      });

      if (slotCode) {
        const { error } = await supabase
          .from("slots")
          .update({
            status: "available",
            reserved_at: null,
            submission_id: null,
          })
          .eq("slot_code", slotCode)
          .eq("status", "reserved");

        if (error) {
          console.error("❌ DB UPDATE ERROR (expired):", error);
        } else {
          console.log("✅ Expired reserved slot released");
        }
      }
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error("❌ STRIPE WEBHOOK FATAL ERROR:", err.message);
    return res.status(200).json({ received: true });
  }
}
