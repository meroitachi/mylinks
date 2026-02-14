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
    <title>Stream HD</title>
    <style>
        :root {
            --accent: #00d2ff;
            --bg: #050505;
            --ui-bg: rgba(0, 0, 0, 0.85);
        }

        body, html {
            margin: 0; padding: 0;
            background: var(--bg);
            height: 100%; width: 100%;
            overflow: hidden;
            font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        }

        /* Video Container */
        .viewport {
            position: relative;
            width: 100vw;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        video {
            width: 100%;
            height: 100%;
            background: #000;
        }

        /* Cinematic Overlay */
        .overlay {
            position: absolute;
            inset: 0;
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
            padding: 5% 8%; /* TV Safe Area */
            background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 50%);
            transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            z-index: 10;
        }

        .overlay.hidden { opacity: 0; cursor: none; }

        .title-area {
            position: absolute;
            top: 40px;
            left: 8%;
        }

        .title-area h1 {
            color: white;
            font-size: 28px;
            font-weight: 300;
            margin: 0;
            letter-spacing: 1px;
            text-shadow: 0 2px 10px rgba(0,0,0,0.8);
        }

        .status-badge {
            display: inline-block;
            background: var(--accent);
            color: black;
            padding: 2px 10px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 8px;
        }

        /* Modern Progress Bar */
        .timeline-container {
            width: 100%;
            height: 8px;
            background: rgba(255,255,255,0.1);
            border-radius: 10px;
            margin-bottom: 25px;
            position: relative;
            overflow: hidden;
        }

        .progress-fill {
            height: 100%;
            width: 0%;
            background: linear-gradient(90deg, #00d2ff, #3a7bd5);
            box-shadow: 0 0 15px var(--accent);
            transition: width 0.1s linear;
        }

        /* Large TV Controls */
        .controls {
            display: flex;
            align-items: center;
            gap: 25px;
        }

        .nav-btn {
            background: var(--ui-bg);
            border: 2px solid transparent;
            color: white;
            padding: 15px 30px;
            border-radius: 12px;
            font-size: 20px;
            cursor: pointer;
            transition: all 0.2s ease;
            outline: none;
        }

        /* Focus state for TV Remotes */
        .nav-btn:focus, .nav-btn:hover {
            border-color: var(--accent);
            transform: scale(1.1);
            box-shadow: 0 0 25px rgba(0, 210, 255, 0.4);
            background: white;
            color: black;
        }

        .play-pause {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 30px;
        }

        .time-display {
            color: rgba(255,255,255,0.6);
            font-variant-numeric: tabular-nums;
            font-size: 18px;
            margin-left: auto;
        }

    </style>
</head>
<body>

<div class="viewport" id="wrapper">
    <video id="v" preload="auto">
        <source src="${videoUrl}" type="video/mp4">
    </video>

    <div class="overlay" id="hud">
        <div class="title-area">
            <span class="status-badge">LIVE HD</span>
            <h1>Streaming Session</h1>
        </div>

        <div class="timeline-container">
            <div class="progress-fill" id="pBar"></div>
        </div>

        <div class="controls">
            <button class="nav-btn" onclick="rw()">⏪ 10s</button>
            <button class="nav-btn play-pause" id="playBtn" onclick="toggle()">▶</button>
            <button class="nav-btn" onclick="ff()">10s ⏩</button>
            
            <div class="time-display">
                <span id="cur">0:00</span> / <span id="dur">0:00</span>
            </div>
        </div>
    </div>
</div>

<script>
    const v = document.getElementById('v');
    const hud = document.getElementById('hud');
    const pBar = document.getElementById('pBar');
    const playBtn = document.getElementById('playBtn');
    const curTxt = document.getElementById('cur');
    const durTxt = document.getElementById('dur');
    
    let timer;

    function toggle() {
        if (v.paused) { v.play(); playBtn.innerHTML = '⏸'; }
        else { v.pause(); playBtn.innerHTML = '▶'; }
        wake();
    }

    function ff() { v.currentTime += 10; wake(); }
    function rw() { v.currentTime -= 10; wake(); }

    function wake() {
        hud.classList.remove('hidden');
        clearTimeout(timer);
        if (!v.paused) {
            timer = setTimeout(() => hud.classList.add('hidden'), 4000);
        }
    }

    function fmt(s) {
        const m = Math.floor(s / 60);
        s = Math.floor(s % 60);
        return m + ":" + (s < 10 ? '0' : '') + s;
    }

    v.ontimeupdate = () => {
        const pc = (v.currentTime / v.duration) * 100;
        pBar.style.width = pc + '%';
        curTxt.innerText = fmt(v.currentTime);
        if(!isNaN(v.duration)) durTxt.innerText = fmt(v.duration);
    };

    // TV Remote Key Support
    document.addEventListener('keydown', (e) => {
        wake();
        switch(e.keyCode) {
            case 13: toggle(); break; // OK / Enter
            case 37: rw(); break;     // Left
            case 39: ff(); break;     // Right
            case 32: toggle(); break; // Space
        }
    });

    document.addEventListener('mousemove', wake);
    
    // Initial Focus for TV
    window.onload = () => {
        playBtn.focus();
        wake();
    };
</script>

</body>
</html>
`);
}
