import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  // Metodo consentito
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Prendiamo tutti i dati dal body
    const {
      price,
      room,
      slot,
      fullName,
      email,
      country,
      note
    } = req.body || {};

    // Validazione base
    if (!price || !room || !slot) {
      return res.status(400).json({
        error: "Missing required checkout data"
      });
    }

    // Costruiamo la URL di ritorno (IMPORTANTISSIMO)
    const successUrl =
  `https://thehumanmosaic.art/upload.html` +
  `?session_id={CHECKOUT_SESSION_ID}` +
      `&room=${encodeURIComponent(room)}` +
      `&slotCode=${encodeURIComponent(slot)}` +
      `&fullName=${encodeURIComponent(fullName || "")}` +
      `&email=${encodeURIComponent(email || "")}` +
      `&country=${encodeURIComponent(country || "")}` +
      `&note=${encodeURIComponent(note || "")}`;

    // Creazione sessione Stripe
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
      metadata: {
  room,
  slotCode: slot,
  fullName: fullName || "",
  email: email || "",
  country: country || "",
  note: note || ""
},
      success_url: successUrl,
      cancel_url:
  `https://thehumanmosaic.art/checkout.html` +
  `?room=${encodeURIComponent(room)}` +
  `&slotCode=${encodeURIComponent(slot)}` +
  `&cancelled=1`
    });

    // Ritorniamo URL Stripe
    return res.status(200).json({ url: session.url });

  } catch (err) {
    console.error("STRIPE ERROR:", err);

    return res.status(500).json({
      error: err.message || "Stripe session creation failed"
    });
  }
}
