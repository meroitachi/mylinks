import { connectToDatabase } from "../../../lib/mongo";
import Link from "../../../models/Link";

export default async function handler(req, res) {
  await connectToDatabase();

  const { slug } = req.query;

  const name = Array.isArray(slug) ? slug.join("/") : slug;

  const targetLink = await Link.findOne({
    title: new RegExp(name, "i"),
  });

  if (targetLink && targetLink.url) {
    let url = targetLink.url;

    if (!/^https?:\/\//i.test(url)) {
      url = "https://" + url;
    }

    res.writeHead(302, { Location: url });
    return res.end();
  }

  return res.status(404).send("Redirect link not found");
}
