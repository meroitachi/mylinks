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
    <title>Cinema TV</title>
    <style>
        :root {
            --accent: #ffffff;
            --glow: rgba(0, 210, 255, 0.5);
            --panel: rgba(20, 20, 20, 0.85);
        }

        body, html {
            margin: 0; padding: 0; background: #000;
            height: 100vh; width: 100vw; overflow: hidden;
            font-family: 'Inter', system-ui, sans-serif;
            color: white;
        }

        .container {
            position: relative; width: 100%; height: 100%;
            display: flex; align-items: center; justify-content: center;
        }

        video { width: 100%; height: 100%; object-fit: contain; }

        /* --- Buffering Animation --- */
        .buffer-overlay {
            position: absolute; inset: 0;
            display: none; align-items: center; justify-content: center;
            background: rgba(0,0,0,0.2); z-index: 5;
        }

        .spinner {
            width: 80px; height: 80px;
            border: 4px solid rgba(255,255,255,0.1);
            border-left-color: var(--accent);
            border-radius: 50%;
            animation: spin 1s linear infinite, glow 2s ease-in-out infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes glow { 0%, 100% { box-shadow: 0 0 10px var(--glow); } 50% { box-shadow: 0 0 30px var(--glow); } }

        /* --- Bottom Middle UI --- */
        .player-ui {
            position: absolute; bottom: 50px; left: 50%;
            transform: translateX(-50%) translateY(20px);
            display: flex; flex-direction: column; align-items: center;
            gap: 20px; width: 90%; max-width: 800px;
            padding: 25px; border-radius: 30px;
            background: var(--panel); backdrop-filter: blur(30px);
            border: 1px solid rgba(255,255,255,0.1);
            transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
            opacity: 0; z-index: 10;
        }

        .player-ui.active { transform: translateX(-50%) translateY(0); opacity: 1; }

        .progress-box { width: 100%; display: flex; align-items: center; gap: 15px; }
        .rail { flex: 1; height: 6px; background: rgba(255,255,255,0.1); border-radius: 10px; cursor: pointer; overflow: hidden; }
        .fill { width: 0%; height: 100%; background: white; box-shadow: 0 0 15px white; }
        .time { font-size: 13px; font-weight: 500; font-variant-numeric: tabular-nums; opacity: 0.8; }

        /* Centered Side-by-Side Buttons */
        .button-cluster { display: flex; align-items: center; gap: 20px; }

        .btn {
            background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
            color: white; padding: 15px; border-radius: 20px; cursor: pointer;
            transition: all 0.3s; display: flex; align-items: center; justify-content: center;
        }

        .btn svg { width: 28px; height: 28px; fill: currentColor; }
        .btn:hover, .btn:focus { background: white; color: black; transform: scale(1.1); outline: none; }

        .play-btn { width: 80px; height: 80px; border-radius: 50%; background: white; color: black; border: none; }
        .play-btn svg { width: 35px; height: 35px; }

        .speed-btn { font-weight: 800; font-size: 14px; padding: 15px 25px; }
    </style>
</head>
<body>

<div class="container" id="shell">
    <div class="buffer-overlay" id="buffer">
        <div class="spinner"></div>
    </div>

    <video id="player" preload="auto">
        <source src="${videoUrl}" type="video/mp4">
    </video>

    <div class="player-ui" id="ui">
        <div class="progress-box">
            <span class="time" id="cur">00:00</span>
            <div class="rail" onclick="seek(event)">
                <div class="fill" id="fill"></div>
            </div>
            <span class="time" id="dur">00:00</span>
        </div>

        <div class="button-cluster">
            <button class="btn speed-btn" onclick="cycleSpeed()"><span id="spText">1.0</span>x</button>
            
            <button class="btn" onclick="skip(-10)">
                <svg viewBox="0 0 24 24"><path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z"/></svg>
            </button>

            <button class="btn play-btn" id="playBtn" onclick="togglePlay()">
                <svg id="playIcon" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            </button>

            <button class="btn" onclick="skip(10)">
                <svg viewBox="0 0 24 24"><path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/></svg>
            </button>

            <button class="btn" onclick="downloadVid()">
                <svg viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
            </button>
        </div>
    </div>
</div>

<a id="dl" href="${videoUrl}" download style="display:none"></a>

<script>
    const v = document.getElementById('player');
    const ui = document.getElementById('ui');
    const fill = document.getElementById('fill');
    const buffer = document.getElementById('buffer');
    const playIcon = document.getElementById('playIcon');
    const spText = document.getElementById('spText');
    let timer;

    // --- State Management ---
    function togglePlay() {
        if (v.paused) {
            v.play();
            playIcon.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
        } else {
            v.pause();
            playIcon.innerHTML = '<path d="M8 5v14l11-7z"/>';
        }
        showUI();
    }

    function skip(s) { v.currentTime += s; showUI(); }

    function cycleSpeed() {
        const rates = [1, 1.5, 2];
        v.playbackRate = rates[(rates.indexOf(v.playbackRate) + 1) % rates.length];
        spText.innerText = v.playbackRate;
        showUI();
    }

    function downloadVid() { document.getElementById('dl').click(); }

    // --- Buffering Logic ---
    v.addEventListener('waiting', () => buffer.style.display = 'flex');
    v.addEventListener('playing', () => buffer.style.display = 'none');
    v.addEventListener('canplay', () => buffer.style.display = 'none');

    // --- Progress Update ---
    v.addEventListener('timeupdate', () => {
        fill.style.width = (v.currentTime / v.duration * 100) + '%';
        document.getElementById('cur').innerText = format(v.currentTime);
        document.getElementById('dur').innerText = format(v.duration || 0);
    });

    function format(s) {
        const m = Math.floor(s / 60);
        const sec = Math.floor(s % 60);
        return m + ":" + (sec < 10 ? "0" + sec : sec);
    }

    function seek(e) {
        const r = e.currentTarget.getBoundingClientRect();
        v.currentTime = ((e.clientX - r.left) / r.width) * v.duration;
    }

    // --- Auto-Hide UI ---
    function showUI() {
        ui.classList.add('active');
        clearTimeout(timer);
        if (!v.paused) timer = setTimeout(() => ui.classList.remove('active'), 3000);
    }

    ['mousemove', 'keydown', 'touchstart', 'click'].forEach(e => {
        window.addEventListener(e, showUI);
    });

    // Remote Shortcuts
    document.addEventListener('keydown', (e) => {
        if(e.key === 'ArrowRight') skip(10);
        if(e.key === 'ArrowLeft') skip(-10);
        if(e.key === 'Enter') togglePlay();
    });
</script>

</body>
</html>
`);
}
