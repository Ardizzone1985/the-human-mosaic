import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function getRawBody(req) {
  return await new Promise((resolve, reject) => {
    const chunks = [];

    req.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  console.log("📩 Stripe webhook received");

  const signature = req.headers["stripe-signature"];

  if (!signature) {
    console.error("❌ Missing Stripe-Signature header");
    return res.status(200).json({ received: true });
  }

  let event;

  try {
    const rawBody = await getRawBody(req);

    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("❌ STRIPE WEBHOOK SIGNATURE ERROR:", err.message);
    return res.status(200).json({ received: true });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const slotCode = session.metadata?.slotCode || null;

      console.log("✅ PAYMENT CONFIRMED VIA WEBHOOK");
      console.log({
        sessionId: session.id,
        slotCode,
        email: session.metadata?.email || null,
        paymentStatus: session.payment_status || null
      });

      if (slotCode) {
        const { error } = await supabase
          .from("slots")
          .update({
            payment_confirmed: true,
            payment_confirmed_at: new Date().toISOString()
          })
          .eq("slot_code", slotCode);

        if (error) {
          console.error("❌ DB UPDATE ERROR (completed):", error);
        } else {
          console.log("✅ Slot marked as paid");
        }
      }
    }

    if (event.type === "checkout.session.expired") {
      const session = event.data.object;
      const slotCode = session.metadata?.slotCode || null;

      console.log("⌛ CHECKOUT SESSION EXPIRED");
      console.log({
        sessionId: session.id,
        slotCode,
        email: session.metadata?.email || null
      });

      if (slotCode) {
        const { error } = await supabase
          .from("slots")
          .update({
            status: "available",
            reserved_at: null,
            submission_id: null
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
    console.error("❌ STRIPE WEBHOOK PROCESSING ERROR:", err.message);
    return res.status(200).json({ received: true });
  }
}
