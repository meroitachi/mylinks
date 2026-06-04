import { connectToDatabase } from "../../../lib/mongo";
import Link from "../../../models/Link";
import renderPlayer from "../../../lib/renderPlayer";

export default async function handler(req, res) {
  const { name } = req.query;

  await connectToDatabase();

  const doc = await Link.findOne({
    title: new RegExp(
      "^" +
      name.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      ) +
      "$",
      "i"
    )
  });

  if (!doc?.url) {
    return res
      .status(404)
      .send("Link not found");
  }

  return renderPlayer(res, doc.url);
}
