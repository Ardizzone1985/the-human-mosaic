import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const SITE_URL = "https://thehumanmosaic.art";

function createSupabaseAdmin() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing Supabase server environment variables"
    );
  }

  return createClient(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const stripeSecretKey =
      process.env.STRIPE_SECRET_KEY;

    if (!stripeSecretKey) {
      throw new Error(
        "Missing STRIPE_SECRET_KEY"
      );
    }

    const requestId = String(
      req.body?.requestId || ""
    ).trim();

    if (!requestId) {
      return res.status(400).json({
        error: "Missing sponsor request ID",
      });
    }

    const stripe = new Stripe(
      stripeSecretKey
    );

    const supabaseAdmin =
      createSupabaseAdmin();

    const {
      data: sponsorRequest,
      error: requestError,
    } = await supabaseAdmin
      .from("sponsor_requests")
      .select(`
        *,
        sponsor_plans (
          id,
          name,
          room,
          placement,
          duration_days,
          price_cents,
          currency
        )
      `)
      .eq("id", requestId)
      .single();

    if (
      requestError ||
      !sponsorRequest
    ) {
      console.error(
        "Sponsor checkout request fetch error:",
        requestError
      );

      return res.status(404).json({
        error:
          "Sponsor request not found",
      });
    }

    if (
      sponsorRequest.status !==
      "approved"
    ) {
      return res.status(409).json({
        error:
          "Sponsor request is not approved",
      });
    }

    if (
      sponsorRequest.payment_status ===
      "paid"
    ) {
      return res.status(409).json({
        error:
          "This partnership has already been paid",
      });
    }

    const priceCents =
      Number(
        sponsorRequest
          .quoted_price_cents
      );

    if (
      !Number.isInteger(priceCents) ||
      priceCents <= 0
    ) {
      return res.status(400).json({
        error:
          "Invalid sponsor price",
      });
    }

    const currency =
      String(
        sponsorRequest.currency ||
        "EUR"
      ).toLowerCase();

    const placement =
      sponsorRequest
        .approved_placement ||
      sponsorRequest
        .requested_placement ||
      sponsorRequest
        .sponsor_plans
        ?.placement ||
      "";

    const durationDays =
      Number(
        sponsorRequest
          .requested_days ||
        sponsorRequest
          .sponsor_plans
          ?.duration_days ||
        30
      );

    const planName =
      sponsorRequest
        .sponsor_plans
        ?.name ||
      "Museum Partnership";

    const metadata = {
      source: "sponsor",
      requestId:
        sponsorRequest.id,
      placement:
        String(placement),
      durationDays:
        String(durationDays),
      company:
        String(
          sponsorRequest.company ||
          ""
        ).slice(0, 500),
    };

    const session =
      await stripe.checkout.sessions.create({
        mode: "payment",

        customer_email:
          sponsorRequest.email ||
          undefined,

        line_items: [
          {
            price_data: {
              currency,

              product_data: {
                name:
                  `The Human Mosaic — ${planName}`,
              },

              unit_amount:
                priceCents,
            },

            quantity: 1,
          },
        ],

        metadata,

        payment_intent_data: {
          metadata,
        },

        success_url:
          `${SITE_URL}/?sponsor_payment=success` +
          `&session_id={CHECKOUT_SESSION_ID}`,

        cancel_url:
          `${SITE_URL}/?sponsor_payment=cancelled`,
      });

    console.log(
      "✅ Sponsor Checkout Session created:",
      {
        requestId:
          sponsorRequest.id,
        sessionId:
          session.id,
        amount:
          priceCents,
        currency,
      }
    );

    return res.status(200).json({
      success: true,
      url: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error(
      "SPONSOR STRIPE CHECKOUT ERROR:",
      error
    );

    return res.status(500).json({
      error:
        error.message ||
        "Unable to create sponsor checkout session",
    });
  }
}
