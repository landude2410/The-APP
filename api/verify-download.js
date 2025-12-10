import Stripe from "stripe";
import fs from "fs";
import path from "path";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  const session_id = req.query.session_id;

  if (!session_id) return res.status(400).send("Missing session ID");

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== "paid") {
      return res.status(403).send("Not paid");
    }

    const filePath = path.join(process.cwd(), "templates", "resume-pack.zip");
    const file = fs.readFileSync(filePath);

    res.setHeader("Content-Disposition", "attachment; filename=resume-pack.zip");
    res.setHeader("Content-Type", "application/zip");
    res.send(file);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
}
