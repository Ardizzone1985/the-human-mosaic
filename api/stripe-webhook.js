import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // 🔥 IMPORTANTE
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

  const signature = req.headers["stripe-signature"];

  if (!signature) {
    return res.status(400).send("Missing Stripe-Signature header");
  }

  try {
    const rawBody = await getRawBody(req);

    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    // ============================
    // 🎯 PAYMENT COMPLETED
    // ============================
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      const slotCode = session.metadata?.slotCode;

      console.log("✅ PAYMENT CONFIRMED VIA WEBHOOK");
      console.log({
        sessionId: session.id,
        slotCode,
        email: session.metadata?.email
      });

      if (slotCode) {
        const { error } = await supabase
          .from("slots")
          .update({
            payment_confirmed: true
          })
          .eq("slot_code", slotCode);

        if (error) {
          console.error("❌ DB UPDATE ERROR:", error);
        } else {
          console.log("✅ Slot marked as paid");
        }
      }
    }

    return res.status(200).json({ received: true });

  } catch (err) {
    console.error("❌ STRIPE WEBHOOK ERROR:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
}
