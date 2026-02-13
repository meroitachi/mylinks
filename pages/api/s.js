// pages/r.js

import { connectToDatabase } from "../lib/mongo";
import Link from "../models/Link";

export async function getServerSideProps() {
  await connectToDatabase();

  const redirectLink = await Link.findOne({ title: /stream/i });

  let videoUrl = null;

  if (redirectLink && redirectLink.url) {
    videoUrl = redirectLink.url;

    if (!/^https?:\/\//i.test(videoUrl)) {
      videoUrl = "https://" + videoUrl;
    }
  }

  return {
    props: {
      videoUrl,
    },
  };
}

export default function StreamPage({ videoUrl }) {
  if (!videoUrl) {
    return <h1>No stream found</h1>;
  }

  return (
    <html>
      <head>
        <title>Movie Stream</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>{`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: sans-serif;
          }

          body {
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            background: radial-gradient(circle at top left, #1e1e2f, #0f0f17 60%);
            color: white;
          }

          .container {
            width: 95%;
            max-width: 1000px;
            padding: 20px;
            border-radius: 20px;
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(20px);
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7);
          }

          h1 {
            text-align: center;
            margin-bottom: 20px;
            font-size: 22px;
          }

          video {
            width: 100%;
            border-radius: 15px;
            background: black;
          }

          .footer {
            text-align: center;
            margin-top: 15px;
            font-size: 14px;
            opacity: 0.6;
          }
        `}</style>
      </head>

      <body>
        <div className="container">
          <h1>🎬 Now Streaming</h1>

          <video controls autoPlay preload="metadata">
            <source src={videoUrl} type="video/mp4" />
          </video>

          <div className="footer">
            Enjoy your movie 🍿
          </div>
        </div>
      </body>
    </html>
  );
  }
