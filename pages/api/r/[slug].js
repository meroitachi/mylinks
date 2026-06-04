import { connectToDatabase } from "../../../lib/mongo";
import Link from "../../../models/Link";

export default async function handler(req, res) {
  await connectToDatabase();

  const slug = req.query.slug; 
  // slug is array like: ["example"] or undefined

  let query;

  if (!slug || slug.length === 0) {
    // /api/r → default redirect
    query = { title: /redirect/i };
  } else {
    // /api/r/example → match exact name
    query = { title: new RegExp(slug[0], "i") };
  }

  const redirectLink = await Link.findOne(query);

  if (redirectLink && redirectLink.url) {
    let url = redirectLink.url;

    if (!/^https?:\/\//i.test(url)) {
      url = "https://" + url;
    }

    res.writeHead(302, { Location: url });
    return res.end();
  }

  res.status(404).send("No redirect link found");
}
