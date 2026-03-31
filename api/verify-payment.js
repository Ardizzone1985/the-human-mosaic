import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { session_id } = req.body;

    if (!session_id) {
      return res.status(400).json({ error: "Missing session_id" });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== "paid") {
      return res.status(401).json({ error: "Payment not completed" });
    }

    return res.status(200).json({
      success: true,
      customer_email: session.customer_details?.email || null
    });

  } catch (err) {
    console.error("VERIFY ERROR:", err);
    return res.status(500).json({
      error: err.message || "Verification failed"
    });
  }
}
