import { connectToDatabase } from "../../lib/mongo";
import Link from "../../models/Link";
import mongoose from "mongoose";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { id } = req.body;

  if (!id) return res.status(400).json({ error: "No ID provided" });

  await connectToDatabase();

  try {
    const deleted = await Link.findByIdAndDelete(new mongoose.Types.ObjectId(id));

    if (!deleted) {
      return res.status(404).json({ error: "Link not found" });
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: err.message });
  }
}
