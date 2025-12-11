// pages/api/checkredirect.js
import { connectToDatabase } from "../../lib/mongo";
import Link from "../../models/Link";

export default async function handler(req, res) {
  await connectToDatabase();

  const redirectLink = await Link.findOne({ title: /redirect/i });

  if (redirectLink && redirectLink.url) {
    let url = redirectLink.url;

    // Ensure it starts with http/https
    if (!/^https?:\/\//i.test(url)) {
      url = "https://" + url;
    }

    // Server-side HTTP redirect
    res.writeHead(302, { Location: url });
    res.end();
  } else {
    res.status(404).send("No redirect link found");
  }
}
