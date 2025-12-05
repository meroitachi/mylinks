import { connectToDatabase } from "../../lib/mongo";
import Link from "../../models/Link";

export default async function handler(req, res) {
  await connectToDatabase();

  const links = await Link.find({});
  res.status(200).json(links);
}
