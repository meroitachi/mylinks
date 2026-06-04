import { connectToDatabase } from "../../../lib/mongo";
import Link from "../../../models/Link";

export default async function handler(req, res) {
  await connectToDatabase();

  const { slug } = req.query;

  const name = (Array.isArray(slug) ? slug.join("/") : slug || "")
    .toLowerCase()
    .trim();

  // get all links
  const links = await Link.find({});

  // find best match by normalizing titles
  const targetLink = links.find((link) => {
    const cleanTitle = (link.title || "")
      .replace(/^IMG:/i, "")
      .toLowerCase()
      .trim();

    return cleanTitle === name;
  });

  // fallback redirect
  const fallback = links.find((l) =>
    (l.title || "").toLowerCase().trim() === "redirect"
  );

  const finalLink = targetLink || fallback;

  if (!finalLink || !finalLink.url) {
    return res.status(404).send("Redirect link not found");
  }

  let url = finalLink.url;

  if (!/^https?:\/\//i.test(url)) {
    url = "https://" + url;
  }

  res.writeHead(302, { Location: url });
  return res.end();
}
