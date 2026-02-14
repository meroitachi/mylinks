import fetch from "node-fetch";

export default async function handler(req, res) {
  const videoUrl = req.query.url;
  if (!videoUrl) return res.status(400).send("No URL provided");

  try {
    const response = await fetch(videoUrl);
    const contentType = response.headers.get("content-type") || "video/mp4";
    const contentLength = response.headers.get("content-length") || 0;

    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Length", contentLength);

    // Stream directly
    response.body.pipe(res);
  } catch (err) {
    res.status(500).send("Failed to fetch video");
  }
}
