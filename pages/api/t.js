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
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Streaming</title>

<style>
body{
  margin:0;
  background:#000;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  height:100vh;
  color:white;
  font-family:Arial, sans-serif;
}

h1{
  margin-bottom:15px;
  font-size:22px;
}

.video-wrapper{
  position:relative;
  width:95%;
  max-width:1100px;
}

video{
  width:100%;
  border-radius:12px;
  background:black;
}

.controls{
  position:absolute;
  bottom:20px;
  left:50%;
  transform:translateX(-50%);
  display:flex;
  gap:20px;
  background:rgba(0,0,0,0.6);
  padding:10px 20px;
  border-radius:30px;
}

button{
  background:#ffffff22;
  color:white;
  border:1px solid #ffffff55;
  padding:10px 18px;
  font-size:18px;
  border-radius:20px;
  cursor:pointer;
}

button:active{
  background:#ffffff55;
}

.footer{
  margin-top:12px;
  font-size:14px;
  opacity:0.6;
}
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

// Trick to play any attachment/download link
fetch("${videoUrl}")
  .then(res => res.blob())
  .then(blob => {
    // Detect MIME type, fallback to video/mp4 if unknown
    let mime = blob.type || "video/mp4";
    let url = URL.createObjectURL(blob);
    video.src = url;

    // Play after loaded
    video.addEventListener("canplay", function(){
      video.play();
    });
  })
  .catch(err => {
    console.error("Failed to load video:", err);
    alert("Video cannot be played");
  });

// 10 sec forward/backward
function forward(){ video.currentTime += 10; }
function backward(){ video.currentTime -= 10; }

// TV Remote Support
document.addEventListener("keydown", function(e){
  if(e.keyCode === 39){ forward(); }
  if(e.keyCode === 37){ backward(); }
});
</script>

</body>
</html>
`);
}
