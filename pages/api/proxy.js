export default async function handler(req, res) {
  const videoUrl = req.query.url;
  if (!videoUrl) return res.status(400).send("No URL provided");

  try {
    // Native fetch in Vercel serverless
    const response = await fetch(videoUrl);

    // Forward headers
    const contentType = response.headers.get("content-type") || "video/mp4";
    const contentLength = response.headers.get("content-length") || "0";

    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Length", contentLength);

    // Pipe the streamed response
    const reader = response.body.getReader();
    const stream = new ReadableStream({
      start(controller) {
        function push() {
          reader.read().then(({ done, value }) => {
            if (done) {
              controller.close();
              return;
            }
            controller.enqueue(value);
            push();
          });
        }
        push();
      },
    });

    new Response(stream).body.pipeTo(res);
  } catch (err) {
    res.status(500).send("Failed to fetch video");
  }
}
