// api/create-checkout-session.js
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const DOMAIN = process.env.DOMAIN || `https://${req.headers.host}`;
    // Replace with the Price ID you create in Stripe dashboard.
    const priceId = process.env.STRIPE_PRICE_ID; // e.g. "price_abc123"

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${DOMAIN}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${DOMAIN}/`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server_error' });
  }
}
