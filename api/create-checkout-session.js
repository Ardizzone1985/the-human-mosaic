import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const { price, room, slot } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",

      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `The Human Mosaic - ${room} Room`,
            },
            unit_amount: price * 100,
          },
          quantity: 1,
        },
      ],

      success_url: `https://thehumanmosaic.art/upload.html?room=${room}&slot=${slot}`,
      cancel_url: `https://thehumanmosaic.art/checkout.html`,
    });

    res.status(200).json({ url: session.url });
  catch (err) {
  console.error("STRIPE ERROR:", err);
  res.status(500).json({ error: err.message });
}
}
