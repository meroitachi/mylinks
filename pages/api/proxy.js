export default async function handler(req, res) {
  const videoUrl = req.query.url;
  if (!videoUrl) return res.status(400).send("No URL provided");

  try {
    const response = await fetch(videoUrl);

    if (!response.ok) {
      return res.status(500).send("Failed to fetch video");
    }

    const contentType = response.headers.get("content-type") || "video/mp4";
    res.setHeader("Content-Type", contentType);

    // For TV browsers, allow seeking
    res.setHeader("Accept-Ranges", "bytes");

    // Get full data as ArrayBuffer
    const buffer = Buffer.from(await response.arrayBuffer());
    res.setHeader("Content-Length", buffer.length);
    res.status(200).end(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to fetch video");
  }
}
