import { connectToDatabase } from "../../lib/mongo";
import Link from "../../models/Link";

export default async function handler(req, res) {
  await connectToDatabase();

  // Get the link from MongoDB (similar to your redirect logic)
  const doc = await Link.findOne({ title: /stream/i });

  if (!doc?.url) {
    res.status(404).send("No streaming link found");
    return;
  }

  let videoUrl = doc.url;
  if (!/^https?:\/\//i.test(videoUrl)) videoUrl = "https://" + videoUrl;

  // Serve fully rendered HTML with video
  res.setHeader("Content-Type", "text/html");
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Streaming</title>
      <style>
        body {
          margin: 0;
          background: radial-gradient(circle at top left, #1e1e2f, #0f0f17 60%);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 100vh;
          color: #fff;
          font-family: sans-serif;
        }
        h1 {
          margin-bottom: 20px;
          font-size: 24px;
          text-align: center;
          background: linear-gradient(90deg, #ff4e50, #f9d423);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        video {
          width: 90%;
          max-width: 1000px;
          border-radius: 15px;
          background: black;
          box-shadow: 0 10px 30px rgba(0,0,0,0.7);
        }
        .footer {
          margin-top: 15px;
          font-size: 14px;
          opacity: 0.6;
        }
      </style>
    </head>
    <body>
      <h1>🎬 Now Streaming</h1>
      <video controls autoplay preload="metadata">
        <source src="${videoUrl}" type="video/mp4">
      </video>
      <div class="footer">Enjoy your movie 🍿</div>
    </body>
    </html>
  `);
}
