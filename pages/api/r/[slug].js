// pages/api/r/[slug].js
import { connectToDatabase } from "../../../lib/mongo";
import Link from "../../../models/Link";

export default async function handler(req, res) {
  await connectToDatabase();

  const { slug } = req.query;

  let targetLink;

  // CASE 1: /api/r  (no slug)
  if (!slug || slug.length === 0) {
    targetLink = await Link.findOne({ title: /redirect/i });
  }

  // CASE 2: /api/r/example
  else {
    const name = Array.isArray(slug) ? slug.join("/") : slug;

    targetLink = await Link.findOne({
      title: new RegExp(name, "i"),
    });
  }

  if (targetLink && targetLink.url) {
    let url = targetLink.url;

    // ensure http/https
    if (!/^https?:\/\//i.test(url)) {
      url = "https://" + url;
    }

    res.writeHead(302, { Location: url });
    return res.end();
  }

  // fallback if not found
  return res.status(404).send("Redirect link not found");
}
