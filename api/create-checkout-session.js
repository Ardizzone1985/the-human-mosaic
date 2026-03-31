import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { price, room, slot } = req.body;

    if (!price || !room || !slot) {
      return res.status(400).json({ error: "Missing required checkout data" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `The Human Mosaic - ${room} Room`
            },
            unit_amount: Number(price) * 100
          },
          quantity: 1
        }
      ],
success_url: `https://thehumanmosaic.art/upload.html?room=${encodeURIComponent(room)}&slotCode=${encodeURIComponent(slot)}&fullName=${encodeURIComponent(req.body.fullName || "")}&email=${encodeURIComponent(req.body.email || "")}&country=${encodeURIComponent(req.body.country || "")}&note=${encodeURIComponent(req.body.note || "")}`      cancel_url: `https://thehumanmosaic.art/checkout.html`
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("STRIPE ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
}
