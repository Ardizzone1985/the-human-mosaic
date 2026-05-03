import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const supabaseClient = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      price,
      room,
      wall,
      section,
      spot,
      slot,
      fullName,
      email,
      country,
      note
    } = req.body || {};

    if (!price || !room || !slot) {
      return res.status(400).json({
        error: "Missing required checkout data"
      });
    }

    let finalPrice = 0;
let formattedPrice = "";

// EARLY ACCESS LOGIC (temporanea manuale)
const EARLY_ACCESS_LIMIT = 1000;

const { count, error: countError } = await supabaseClient
  .from("slots")
  .select("*", { count: "exact", head: true })
  .eq("payment_confirmed", true);

if (countError) {
  throw new Error("Unable to verify Early Access availability");
}

const EARLY_ACCESS_ACTIVE = count < EARLY_ACCESS_LIMIT;

if (EARLY_ACCESS_ACTIVE) {
  if (room === "Creativity") {
    finalPrice = 10;
    formattedPrice = "€10 — early access participation fee";
  } else {
    finalPrice = 5;
    formattedPrice = "€5 — early access participation fee";
  }
} else {
  if (room === "Creativity") {
    finalPrice = 20;
    formattedPrice = "€20 — one-time participation fee";
  } else {
    finalPrice = 15;
    formattedPrice = "€15 — one-time participation fee";
  }
}

    const successUrl =
      `https://thehumanmosaic.art/upload.html` +
      `?session_id={CHECKOUT_SESSION_ID}` +
      `&room=${encodeURIComponent(room)}` +
      `&wall=${encodeURIComponent(wall || "")}` +
      `&section=${encodeURIComponent(section || "")}` +
      `&spot=${encodeURIComponent(spot || "")}` +
      `&slotCode=${encodeURIComponent(slot)}` +
      `&price=${encodeURIComponent(formattedPrice)}` +
      `&fullName=${encodeURIComponent(fullName || "")}` +
      `&email=${encodeURIComponent(email || "")}` +
      `&country=${encodeURIComponent(country || "")}` +
      `&note=${encodeURIComponent(note || "")}`;

    const metadata = {
      room,
      wall: wall || "",
      section: section || "",
      spot: spot || "",
      slotCode: slot,
      fullName: fullName || "",
      email: email || "",
      country: country || "",
      note: note || "",
      price: String(price)
    };

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "paypal"],
      mode: "payment",
      client_reference_id: slot,
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `The Human Mosaic - ${room} Room`
            },
            unit_amount: finalPrice * 100
          },
          quantity: 1
        }
      ],
      metadata: metadata,
      success_url: successUrl,
      cancel_url:
        `https://thehumanmosaic.art/checkout.html` +
        `?room=${encodeURIComponent(room)}` +
        `&wall=${encodeURIComponent(wall || "")}` +
        `&section=${encodeURIComponent(section || "")}` +
        `&spot=${encodeURIComponent(spot || "")}` +
        `&slotCode=${encodeURIComponent(slot)}` +
        `&price=${encodeURIComponent(formattedPrice)}` +
        `&cancelled=1`
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("STRIPE ERROR:", err);

    return res.status(500).json({
      error: err.message || "Stripe session creation failed"
    });
  }
}
