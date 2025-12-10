// api/verify-download.js
import Stripe from 'stripe';
import fs from 'fs';
import path from 'path';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  const { session_id } = req.query;
  if (!session_id) return res.status(400).send('Missing session_id');

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session && (session.payment_status === 'paid' || session.status === 'complete')) {
      // Serve the file from the repo's templates directory
      const filePath = path.join(process.cwd(), 'templates', 'resume-pack.zip');
      const stat = fs.statSync(filePath);
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Length', stat.size);
      res.setHeader('Content-Disposition', 'attachment; filename=resume-pack.zip');
      const stream = fs.createReadStream(filePath);
      stream.pipe(res);
    } else {
      res.status(403).send('Payment not completed');
    }
  } catch (e) {
    console.error(e);
    res.status(500).send('Server error');
  }
}
