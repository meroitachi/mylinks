import { connectToDatabase } from "../../lib/mongo";
import Link from "../../models/Link";

export default async function handler(req, res) {
  await connectToDatabase();

  const doc = await Link.findOne({ title: /stream/i });
  if (!doc?.url) {
    res.status(404).send("No streaming link found");
    return;
  }

  let videoUrl = doc.url;
  if (!/^https?:\/\//i.test(videoUrl)) videoUrl = "https://" + videoUrl;

  // Serve HTML page
  res.setHeader("Content-Type", "text/html");
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Streaming</title>
      <style>
        /* ... your CSS ... */
      </style>
    </head>
    <body>
      <h1>🎬 Now Streaming</h1>
      <div class="video-wrapper">
        <video id="player" controls preload="auto">
          Your browser does not support the video tag.
        </video>
        <div class="controls">
          <button onclick="backward()">⏪ 10s</button>
          <button onclick="forward()">10s ⏩</button>
        </div>
      </div>

      <script>
        var video = document.getElementById("player");

        // Use proxy endpoint
        video.src = "/api/proxy?url=" + encodeURIComponent("${videoUrl}");
        video.addEventListener("canplay", function(){
          video.play();
        });

        function forward(){ video.currentTime += 10; }
        function backward(){ video.currentTime -= 10; }

        document.addEventListener("keydown", function(e){
          if(e.keyCode === 39){ forward(); }
          if(e.keyCode === 37){ backward(); }
        });
      </script>

      <div class="footer">Use TV remote ◀ ▶ for 10s skip</div>
    </body>
    </html>
  `);
}
