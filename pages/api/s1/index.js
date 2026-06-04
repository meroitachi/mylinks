import { connectToDatabase } from "../../../lib/mongo";
import Link from "../../../models/Link";
import renderPlayer from "../../../lib/renderPlayer";

export default async function handler(req, res) {
  await connectToDatabase();

  const doc = await Link.findOne({
    title: /stream/i
  });

  if (!doc?.url) {
    return res.status(404).send("Link not found");
  }

  return renderPlayer(res, doc.url);
}
