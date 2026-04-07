import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount } = req.body;

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
