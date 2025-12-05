import { connectToDatabase } from "../../lib/mongo";
import Link from "../../models/Link";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { title, url } = req.body;

  await connectToDatabase();
  await Link.create({ title, url });

  res.status(200).json({ ok: true });
}
