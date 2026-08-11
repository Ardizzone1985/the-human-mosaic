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

    req.on("data", (chunk) =>
      chunks.push(Buffer.from(chunk))
    );

    req.on("end", () =>
      resolve(Buffer.concat(chunks))
    );

    req.on("error", reject);
  });
}

async function markSlotAsPaid(
  supabase,
  payload
) {
  const {
    slotCode,
    sessionId = null,
    paymentStatus = "paid",
    customerEmail = null,
    room = null,
    fullName = null,
    country = null,
  } = payload;

  if (!slotCode) {
    console.error(
      "❌ Missing slotCode while marking payment"
    );
    return;
  }

  const now =
    new Date().toISOString();

  const { error: slotError } =
    await supabase
      .from("slots")
      .update({
        payment_confirmed: true,
        payment_confirmed_at: now,
      })
      .eq("slot_code", slotCode);

  if (slotError) {
    console.error(
      "❌ SLOT PAYMENT UPDATE ERROR:",
      slotError
    );
  } else {
    console.log(
      "✅ Slot marked as paid:",
      slotCode
    );
  }

  const row = {
    stripe_session_id:
      sessionId,
    payment_status:
      paymentStatus,
    customer_email:
      customerEmail,
    room,
    slot_code:
      slotCode,
    full_name:
      fullName,
    country,
  };

  const {
    error: paymentInsertError,
  } = await supabase
    .from("stripe_payments")
    .insert([row]);

  if (paymentInsertError) {
    console.error(
      "❌ STRIPE_PAYMENTS INSERT ERROR:",
      paymentInsertError
    );
  } else {
    console.log(
      "✅ stripe_payments row inserted"
    );
  }
}

function slugifyCompany(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function activateSponsorCampaign(
  supabase,
  payload
) {
  const {
    requestId,
    placement:
      metadataPlacement = null,
    durationDays:
      metadataDurationDays = null,
  } = payload;

  if (!requestId) {
    console.error(
      "❌ Missing sponsor requestId"
    );
    return;
  }

  const {
    data: sponsorRequest,
    error: requestError,
  } = await supabase
    .from("sponsor_requests")
    .select(`
      *,
      sponsor_plans (
        id,
        name,
        room,
        placement,
        duration_days
      )
    `)
    .eq("id", requestId)
    .single();

  if (
    requestError ||
    !sponsorRequest
  ) {
    console.error(
      "❌ Sponsor request not found:",
      requestError
    );
    return;
  }

  if (
    sponsorRequest.status !==
    "approved"
  ) {
    console.error(
      "❌ Sponsor request is not approved:",
      requestId
    );
    return;
  }

  /*
   * Prima segniamo il pagamento come confermato.
   */
  const {
    error: paymentUpdateError,
  } = await supabase
    .from("sponsor_requests")
    .update({
      payment_status: "paid",
      updated_at:
        new Date().toISOString(),
    })
    .eq("id", requestId);

  if (paymentUpdateError) {
    console.error(
      "❌ Sponsor payment status update error:",
      paymentUpdateError
    );
    return;
  }

  /*
   * Protezione idempotenza:
   * se Stripe reinvia lo stesso evento,
   * NON dobbiamo creare una seconda campagna
   * né ripartire con altri 30 giorni.
   */
  const {
    data: existingCampaign,
    error: existingCampaignError,
  } = await supabase
    .from("sponsor_campaigns")
    .select("id, status, starts_at, ends_at")
    .eq("request_id", requestId)
    .maybeSingle();

  if (existingCampaignError) {
    console.error(
      "❌ Sponsor campaign lookup error:",
      existingCampaignError
    );
    return;
  }

  if (existingCampaign) {
    console.log(
      "ℹ️ Sponsor campaign already exists:",
      existingCampaign.id
    );
    return;
  }

  const durationDays =
    Number(
      metadataDurationDays ||
      sponsorRequest.requested_days ||
      sponsorRequest
        .sponsor_plans
        ?.duration_days ||
      30
    );

  const safeDurationDays =
    Number.isFinite(durationDays) &&
    durationDays > 0
      ? durationDays
      : 30;

  const placement =
    metadataPlacement ||
    sponsorRequest.approved_placement ||
    sponsorRequest.requested_placement ||
    sponsorRequest
      .sponsor_plans
      ?.placement ||
    null;

  if (!placement) {
    console.error(
      "❌ Missing sponsor placement:",
      requestId
    );
    return;
  }

  const startsAt =
    new Date();

  const endsAt =
    new Date(
      startsAt.getTime() +
      safeDurationDays *
        24 *
        60 *
        60 *
        1000
    );

  const company =
    sponsorRequest.company ||
    "Museum Partner";

  const campaignRow = {
    request_id:
      sponsorRequest.id,

    company,

    company_slug:
      slugifyCompany(company),

    title:
      sponsorRequest
        .sponsor_plans
        ?.name ||
      `${company} Partner`,

    logo_url:
      sponsorRequest.logo_url ||
      null,

    website:
      sponsorRequest.website ||
      null,

    placement,

    status:
      "active",

    starts_at:
      startsAt.toISOString(),

    ends_at:
      endsAt.toISOString(),

    views_count:
      0,

    clicks_count:
      0,

    campaign_image_url:
      null,

    description:
      null,
  };

  const {
    data: campaign,
    error: campaignError,
  } = await supabase
    .from("sponsor_campaigns")
    .insert([campaignRow])
    .select("*")
    .single();

  if (campaignError) {
    console.error(
      "❌ SPONSOR CAMPAIGN INSERT ERROR:",
      campaignError
    );
    return;
  }

  console.log(
    "✅ Sponsor campaign activated:",
    {
      campaignId:
        campaign.id,
      requestId:
        sponsorRequest.id,
      placement,
      startsAt:
        campaign.starts_at,
      endsAt:
        campaign.ends_at,
    }
  );
}

export default async function handler(
  req,
  res
) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .send("Method Not Allowed");
  }

  console.log(
    "📩 Stripe webhook received"
  );

  try {
    const stripeSecretKey =
      process.env.STRIPE_SECRET_KEY;

    const stripeWebhookSecret =
      process.env.STRIPE_WEBHOOK_SECRET;

    const supabaseUrl =
      process.env.SUPABASE_URL;

    const supabaseServiceRoleKey =
      process.env
        .SUPABASE_SERVICE_ROLE_KEY;

    if (!stripeSecretKey) {
      console.error(
        "❌ Missing STRIPE_SECRET_KEY"
      );

      return res
        .status(200)
        .json({
          received: true,
        });
    }

    if (!stripeWebhookSecret) {
      console.error(
        "❌ Missing STRIPE_WEBHOOK_SECRET"
      );

      return res
        .status(200)
        .json({
          received: true,
        });
    }

    if (
      !supabaseUrl ||
      !supabaseServiceRoleKey
    ) {
      console.error(
        "❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
      );

      return res
        .status(200)
        .json({
          received: true,
        });
    }

    const stripe =
      new Stripe(
        stripeSecretKey
      );

    const supabase =
      createClient(
        supabaseUrl,
        supabaseServiceRoleKey
      );

    const signature =
      req.headers[
        "stripe-signature"
      ];

    if (!signature) {
      console.error(
        "❌ Missing Stripe-Signature header"
      );

      return res
        .status(200)
        .json({
          received: true,
        });
    }

    const rawBody =
      await getRawBody(req);

    let event;

    try {
      event =
        stripe.webhooks
          .constructEvent(
            rawBody,
            signature,
            stripeWebhookSecret
          );
    } catch (err) {
      console.error(
        "❌ STRIPE WEBHOOK SIGNATURE ERROR:",
        err.message
      );

      return res
        .status(200)
        .json({
          received: true,
        });
    }

    /*
     * CHECKOUT COMPLETATO
     */
    if (
      event.type ===
      "checkout.session.completed"
    ) {
      const session =
        event.data.object;

      const source =
        session.metadata
          ?.source ||
        "";

      /*
       * SPONSOR
       */
      if (
        source === "sponsor"
      ) {
        console.log(
          "🤝 Sponsor checkout completed:",
          {
            sessionId:
              session.id,
            requestId:
              session.metadata
                ?.requestId ||
              null,
            paymentStatus:
              session.payment_status ||
              null,
          }
        );

        /*
         * Attiviamo solo se Stripe
         * conferma realmente il pagamento.
         */
        if (
          session.payment_status ===
          "paid"
        ) {
          await activateSponsorCampaign(
            supabase,
            {
              requestId:
                session.metadata
                  ?.requestId ||
                session
                  .client_reference_id ||
                null,

              placement:
                session.metadata
                  ?.placement ||
                null,

              durationDays:
                session.metadata
                  ?.durationDays ||
                null,
            }
          );
        } else {
          console.log(
            "ℹ️ Sponsor checkout completed but payment is not yet paid"
          );
        }
      }

      /*
       * FOTO / MEMORY
       */
      else {
        const slotCode =
          session.metadata
            ?.slotCode ||
          session
            .client_reference_id ||
          null;

        console.log(
          "✅ checkout.session.completed",
          {
            sessionId:
              session.id,
            slotCode,
            paymentStatus:
              session.payment_status ||
              null,
            email:
              session.metadata
                ?.email ||
              session
                .customer_details
                ?.email ||
              null,
          }
        );

        await markSlotAsPaid(
          supabase,
          {
            slotCode,

            sessionId:
              session.id,

            paymentStatus:
              session
                .payment_status ||
              "paid",

            customerEmail:
              session.metadata
                ?.email ||
              session
                .customer_details
                ?.email ||
              null,

            room:
              session.metadata
                ?.room ||
              null,

            fullName:
              session.metadata
                ?.fullName ||
              null,

            country:
              session.metadata
                ?.country ||
              null,
          }
        );
      }
    }

    /*
     * PAYMENT INTENT
     */
    if (
      event.type ===
      "payment_intent.succeeded"
    ) {
      const paymentIntent =
        event.data.object;

      const source =
        paymentIntent
          .metadata
          ?.source ||
        "";

      /*
       * Lo sponsor viene già gestito
       * da checkout.session.completed.
       * Qui NON lo trattiamo come slot foto.
       */
      if (
        source === "sponsor"
      ) {
        console.log(
          "🤝 Sponsor PaymentIntent succeeded — handled by Checkout Session",
          {
            paymentIntentId:
              paymentIntent.id,
            requestId:
              paymentIntent
                .metadata
                ?.requestId ||
              null,
          }
        );
      } else {
        const slotCode =
          paymentIntent
            .metadata
            ?.slotCode ||
          null;

        console.log(
          "✅ payment_intent.succeeded",
          {
            paymentIntentId:
              paymentIntent.id,
            slotCode,
            amount:
              paymentIntent.amount,
            currency:
              paymentIntent.currency,
          }
        );

        await markSlotAsPaid(
          supabase,
          {
            slotCode,

            sessionId:
              paymentIntent.id,

            paymentStatus:
              "paid",

            customerEmail:
              paymentIntent
                .metadata
                ?.email ||
              null,

            room:
              paymentIntent
                .metadata
                ?.room ||
              null,

            fullName:
              paymentIntent
                .metadata
                ?.fullName ||
              null,

            country:
              paymentIntent
                .metadata
                ?.country ||
              null,
          }
        );
      }
    }

    /*
     * CHECKOUT SCADUTO
     */
    if (
      event.type ===
      "checkout.session.expired"
    ) {
      const session =
        event.data.object;

      const source =
        session.metadata
          ?.source ||
        "";

      /*
       * Per gli sponsor non liberiamo
       * alcuno slot fotografico.
       * La richiesta rimane approved/pending
       * e potrà generare una nuova Checkout.
       */
      if (
        source === "sponsor"
      ) {
        console.log(
          "⌛ Sponsor Checkout expired:",
          {
            sessionId:
              session.id,
            requestId:
              session.metadata
                ?.requestId ||
              null,
          }
        );
      } else {
        const slotCode =
          session.metadata
            ?.slotCode ||
          session
            .client_reference_id ||
          null;

        console.log(
          "⌛ checkout.session.expired",
          {
            sessionId:
              session.id,
            slotCode,
            email:
              session.metadata
                ?.email ||
              null,
          }
        );

        if (slotCode) {
          const {
            error,
          } =
            await supabase
              .from("slots")
              .update({
                status:
                  "available",
                reserved_at:
                  null,
                reserved_by:
                  null,
                submission_id:
                  null,
                payment_confirmed:
                  false,
                payment_confirmed_at:
                  null,
              })
              .eq(
                "slot_code",
                slotCode
              )
              .eq(
                "status",
                "reserved"
              )
              .eq(
                "payment_confirmed",
                false
              );

          if (error) {
            console.error(
              "❌ DB UPDATE ERROR (expired):",
              error
            );
          } else {
            console.log(
              "✅ Expired reserved slot released:",
              slotCode
            );
          }
        }
      }
    }

    return res
      .status(200)
      .json({
        received: true,
      });
  } catch (err) {
    console.error(
      "❌ STRIPE WEBHOOK FATAL ERROR:",
      err.message
    );

    return res
      .status(200)
      .json({
        received: true,
      });
  }
}
