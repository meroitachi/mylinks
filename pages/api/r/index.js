import { connectToDatabase } from "../../../lib/mongo";
import Link from "../../../models/Link";

export default async function handler(req, res) {
  await connectToDatabase();

  const redirectLink = await Link.findOne({ title: /redirect/i });

  if (redirectLink && redirectLink.url) {
    let url = redirectLink.url;

    if (!/^https?:\/\//i.test(url)) {
      url = "https://" + url;
    }

    res.writeHead(302, { Location: url });
    return res.end();
  }

  return res.status(404).send("No redirect link found");
}
