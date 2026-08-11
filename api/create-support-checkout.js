import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

const SITE_URL = 'https://thehumanmosaic.art';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
  amount,
  type,
  requestId,
} = req.body || {};

    if (type === "sponsor") {
  if (!requestId) {
    return res.status(400).json({
      error: 'Missing sponsor request ID'
    });
  }

  const {
    data: sponsorRequest,
    error: sponsorError,
  } = await supabaseAdmin
    .from('sponsor_requests')
    .select(`
      id,
      company,
      email,
      status,
      payment_status,
      quoted_price_cents,
      currency,
      approved_placement,
      requested_placement,
      requested_days,
      sponsor_plans (
        name,
        placement,
        duration_days
      )
    `)
    .eq('id', requestId)
    .single();

  if (sponsorError || !sponsorRequest) {
    console.error(
      'Sponsor checkout load error:',
      sponsorError
    );

    return res.status(404).json({
      error: 'Sponsor request not found'
    });
  }

  if (sponsorRequest.status !== 'approved') {
    return res.status(409).json({
      error: 'Sponsor request is not approved'
    });
  }

  if (sponsorRequest.payment_status === 'paid') {
    return res.status(409).json({
      error: 'This partnership has already been paid'
    });
  }

  const priceCents =
    Number(sponsorRequest.quoted_price_cents);

  if (
    !Number.isInteger(priceCents) ||
    priceCents <= 0
  ) {
    return res.status(400).json({
      error: 'Invalid sponsor price'
    });
  }

  const currency =
    String(
      sponsorRequest.currency || 'EUR'
    ).toLowerCase();

  const placement =
    sponsorRequest.approved_placement ||
    sponsorRequest.requested_placement ||
    sponsorRequest.sponsor_plans?.placement ||
    '';

  const durationDays =
    Number(
      sponsorRequest.requested_days ||
      sponsorRequest.sponsor_plans?.duration_days ||
      30
    );

  const metadata = {
    source: 'sponsor',
    requestId: sponsorRequest.id,
    placement: String(placement),
    durationDays: String(durationDays),
  };

  const sponsorSession =
    await stripe.checkout.sessions.create({
      payment_method_types: [
        'card',
        'paypal',
      ],

      mode: 'payment',

      customer_email:
        sponsorRequest.email || undefined,

      client_reference_id:
        sponsorRequest.id,

      line_items: [
        {
          price_data: {
            currency,

            product_data: {
              name:
                sponsorRequest.sponsor_plans?.name ||
                'The Human Mosaic Museum Partnership',
            },

            unit_amount: priceCents,
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

  return res.status(200).json({
    url: sponsorSession.url,
    sessionId: sponsorSession.id,
  });
}

    // Mappa prezzi
    const priceMap = {
      5: 'price_1TJC99CmOTGOWOkzMHvbZt41',
      10: 'price_1TJCBACmOTGOWOkzXHWHcqKT',
      25: 'price_1TJCBLCmOTGOWOkzCYzOjNhs',
      50: 'price_1TJCBSCmOTGOWOkzJiaMoRTI'
    };

    const priceId = priceMap[amount];

    if (!priceId) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${req.headers.origin}/support-success.html`,
      cancel_url: `${req.headers.origin}/support.html`,
    });

    res.status(200).json({ url: session.url });

  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
