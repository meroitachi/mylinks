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

  res.setHeader("Content-Type", "text/html");
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Premium Stream</title>
    <style>
        :root {
            --primary: #3498db;
            --glass: rgba(255, 255, 255, 0.1);
            --glass-heavy: rgba(0, 0, 0, 0.7);
        }

        body {
            margin: 0;
            padding: 0;
            background: radial-gradient(circle at center, #1a1a2e 0%, #0a0a0b 100%);
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            overflow: hidden;
            color: white;
        }

        .player-container {
            position: relative;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            group: hover;
        }

        video {
            width: 100%;
            height: 100%;
            object-fit: contain;
            box-shadow: 0 20px 50px rgba(0,0,0,0.5);
        }

        /* Overlay UI */
        .ui-overlay {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            top: 0;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 40px;
            background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 40%, transparent 60%, rgba(0,0,0,0.6) 100%);
            transition: opacity 0.5s ease;
            z-index: 10;
        }

        .ui-hide { opacity: 0; cursor: none; }

        .top-info h1 {
            margin: 0;
            font-weight: 300;
            letter-spacing: 2px;
            font-size: 1.5rem;
            text-shadow: 0 2px 4px rgba(0,0,0,0.5);
        }

        .controls-cluster {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 20px;
            width: 100%;
            max-width: 900px;
            margin: 0 auto;
        }

        .progress-container {
            width: 100%;
            height: 6px;
            background: rgba(255,255,255,0.2);
            border-radius: 10px;
            cursor: pointer;
            position: relative;
        }

        .progress-bar {
            height: 100%;
            background: var(--primary);
            border-radius: 10px;
            width: 0%;
            box-shadow: 0 0 15px var(--primary);
        }

        .button-row {
            display: flex;
            align-items: center;
            gap: 30px;
        }

        .btn {
            background: var(--glass);
            border: 1px solid rgba(255,255,255,0.1);
            backdrop-filter: blur(10px);
            color: white;
            padding: 15px 25px;
            border-radius: 50px;
            cursor: pointer;
            transition: all 0.2s;
            font-size: 1.2rem;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .btn:hover {
            background: rgba(255,255,255,0.2);
            transform: scale(1.1);
        }

        .btn-play {
            width: 70px;
            height: 70px;
            background: white;
            color: black;
            border-radius: 50%;
        }

        .hint {
            font-size: 0.8rem;
            opacity: 0.5;
            margin-top: 10px;
        }
    </style>
</head>
<body>

<div class="player-container" id="container">
    <video id="player" playsinline>
        <source src="${videoUrl}" type="video/mp4">
    </video>

    <div class="ui-overlay" id="ui">
        <div class="top-info">
            <h1>NOW PLAYING</h1>
        </div>

        <div class="controls-cluster">
            <div class="progress-container" onclick="seek(event)">
                <div class="progress-bar" id="progress"></div>
            </div>
            
            <div class="button-row">
                <button class="btn" onclick="skip(-10)">⏪ 10s</button>
                <button class="btn btn-play" id="playBtn" onclick="togglePlay()">▶</button>
                <button class="btn" onclick="skip(10)">10s ⏩</button>
            </div>
            <div class="hint">Use Arrow Keys to Seek • Space to Pause</div>
        </div>
    </div>
</div>

<script>
    const video = document.getElementById('player');
    const ui = document.getElementById('ui');
    const progress = document.getElementById('progress');
    const playBtn = document.getElementById('playBtn');
    let uiTimeout;

    // Toggle Play/Pause
    function togglePlay() {
        if (video.paused) {
            video.play();
            playBtn.innerHTML = '⏸';
        } else {
            video.pause();
            playBtn.innerHTML = '▶';
        }
    }

    function skip(amount) {
        video.currentTime += amount;
        showUI();
    }

    // Progress Bar Update
    video.addEventListener('timeupdate', () => {
        const percentage = (video.currentTime / video.duration) * 100;
        progress.style.width = percentage + '%';
    });

    // Seek on click
    function seek(e) {
        const rect = e.target.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        video.currentTime = pos * video.duration;
    }

    // Auto-hide UI logic
    function showUI() {
        ui.classList.remove('ui-hide');
        clearTimeout(uiTimeout);
        uiTimeout = setTimeout(() => {
            if (!video.paused) ui.classList.add('ui-hide');
        }, 3000);
    }

    document.addEventListener('mousemove', showUI);
    
    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
        showUI();
        if (e.code === 'Space') { e.preventDefault(); togglePlay(); }
        if (e.code === 'ArrowRight') skip(10);
        if (e.code === 'ArrowLeft') skip(-10);
        if (e.code === 'KeyF') video.requestFullscreen();
    });

    // Auto-play
    video.addEventListener('canplay', () => {
        // Most browsers block autoplay without interaction, 
        // but it will trigger once the user interacts with the UI.
    });
</script>

</body>
</html>
`);
}
