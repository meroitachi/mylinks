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
    <title>Cinema Premium</title>
    <style>
        :root {
            --accent: #00d2ff;
            --glass: rgba(15, 15, 20, 0.75);
            --border: rgba(255, 255, 255, 0.12);
            --text-main: #ffffff;
            --text-dim: rgba(255, 255, 255, 0.6);
        }

        body, html {
            margin: 0; padding: 0;
            background: #000;
            height: 100vh; width: 100vw;
            display: flex; align-items: center; justify-content: center;
            font-family: 'Inter', -apple-system, system-ui, sans-serif;
            overflow: hidden; color: var(--text-main);
        }

        .main-wrapper {
            position: relative;
            width: 100%; height: 100%;
            display: flex; align-items: center; justify-content: center;
        }

        video { width: 100%; height: 100%; object-fit: contain; z-index: 1; }

        /* The Docked Bottom UI */
        .bottom-ui {
            position: absolute;
            bottom: 0; left: 0; right: 0;
            padding: 40px 60px 50px 60px;
            background: linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.4) 60%, transparent 100%);
            z-index: 10;
            transition: transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.4s ease;
        }

        .hidden { transform: translateY(100%); opacity: 0; cursor: none; }

        /* Progress Area */
        .progress-container {
            margin-bottom: 25px;
            display: flex; align-items: center; gap: 20px;
        }

        .progress-rail {
            flex-grow: 1; height: 6px;
            background: rgba(255,255,255,0.15);
            border-radius: 10px; cursor: pointer;
            position: relative; overflow: hidden;
        }

        .progress-bar {
            height: 100%; width: 0%;
            background: var(--accent);
            box-shadow: 0 0 15px var(--accent);
            border-radius: 10px;
            transition: width 0.1s linear;
        }

        .time-display { font-size: 14px; font-weight: 600; font-variant-numeric: tabular-nums; width: 120px; }

        /* Button Layout */
        .controls-row {
            display: flex; align-items: center; justify-content: space-between;
        }

        .btn-stack { display: flex; align-items: center; gap: 15px; }

        /* Unique Button Styles */
        .icon-btn {
            background: var(--glass);
            border: 1px solid var(--border);
            backdrop-filter: blur(20px);
            color: white;
            padding: 14px;
            border-radius: 16px;
            cursor: pointer;
            transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
            display: flex; align-items: center; justify-content: center;
        }

        .icon-btn svg { width: 24px; height: 24px; fill: currentColor; }

        .icon-btn:hover, .icon-btn:focus {
            background: var(--accent);
            color: #000;
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(0, 210, 255, 0.3);
            outline: none;
        }

        .play-main {
            padding: 18px 40px;
            background: white;
            color: black;
            border-radius: 18px;
            font-size: 1.8rem;
            border: none;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .play-main:hover { transform: scale(1.05); background: var(--accent); }

        .speed-badge {
            font-size: 12px; font-weight: 800; border: 2px solid white;
            padding: 2px 6px; border-radius: 6px;
        }

        /* Download Link Hidden Utility */
        #downloadLink { display: none; }
    </style>
</head>
<body>

<div class="main-wrapper" id="shell">
    <video id="player" playsinline>
        <source src="${videoUrl}" type="video/mp4">
    </video>

    <div class="bottom-ui" id="controls">
        <div class="progress-container">
            <span class="time-display" id="currentTime">00:00</span>
            <div class="progress-rail" onclick="seek(event)">
                <div class="progress-bar" id="progressBar"></div>
            </div>
            <span class="time-display" id="totalTime">00:00</span>
        </div>

        <div class="controls-row">
            <div class="btn-stack">
                <button class="icon-btn" onclick="cycleSpeed()" title="Speed">
                    <span id="speedVal" class="speed-badge">1.0</span>
                </button>
                <button class="icon-btn" onclick="skip(-10)">
                    <svg viewBox="0 0 24 24"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8zM11 10h-1v1h1v-1zm2 0h-1v1h1v-1zm-3 2h1v1h-1v-1zm2 0h1v1h-1v-1z"/></svg>
                </button>
            </div>

            <button class="play-main" id="playBtn" onclick="togglePlay()">▶</button>

            <div class="btn-stack">
                <button class="icon-btn" onclick="skip(10)">
                    <svg viewBox="0 0 24 24"><path d="M12 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z"/></svg>
                </button>
                <button class="icon-btn" onclick="downloadVideo()" title="Download">
                    <svg viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
                </button>
                <button class="icon-btn" onclick="toggleFS()">
                    <svg viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>
                </button>
            </div>
        </div>
    </div>
</div>

<a id="downloadLink" href="${videoUrl}" download="video.mp4"></a>

<script>
    const video = document.getElementById('player');
    const controls = document.getElementById('controls');
    const progressBar = document.getElementById('progressBar');
    const playBtn = document.getElementById('playBtn');
    const curTimeTxt = document.getElementById('currentTime');
    const totTimeTxt = document.getElementById('totalTime');
    const speedVal = document.getElementById('speedVal');
    let timer;

    function formatTime(seconds) {
        let h = Math.floor(seconds / 3600);
        let m = Math.floor((seconds % 3600) / 60);
        let s = Math.floor(seconds % 60);
        return (h > 0 ? h + ":" : "") + (m < 10 ? "0" + m : m) + ":" + (s < 10 ? "0" + s : s);
    }

    function togglePlay() {
        video.paused ? (video.play(), playBtn.innerText = '⏸') : (video.pause(), playBtn.innerText = '▶');
        wakeUI();
    }

    function skip(val) { video.currentTime += val; wakeUI(); }

    function cycleSpeed() {
        const s = [1, 1.25, 1.5, 2];
        let n = s[(s.indexOf(video.playbackRate) + 1) % s.length];
        video.playbackRate = n;
        speedVal.innerText = n;
        wakeUI();
    }

    function downloadVideo() {
        document.getElementById('downloadLink').click();
    }

    function toggleFS() {
        if (!document.fullscreenElement) document.getElementById('shell').requestFullscreen();
        else document.exitFullscreen();
    }

    video.addEventListener('timeupdate', () => {
        progressBar.style.width = (video.currentTime / video.duration) * 100 + '%';
        curTimeTxt.innerText = formatTime(video.currentTime);
        totTimeTxt.innerText = formatTime(video.duration || 0);
    });

    function seek(e) {
        const rect = e.currentTarget.getBoundingClientRect();
        video.currentTime = ((e.clientX - rect.left) / rect.width) * video.duration;
    }

    function wakeUI() {
        controls.classList.remove('hidden');
        clearTimeout(timer);
        if (!video.paused) timer = setTimeout(() => controls.classList.add('hidden'), 4000);
    }

    // TV Remote & Keys
    document.addEventListener('keydown', (e) => {
        wakeUI();
        if (e.key === 'ArrowRight') skip(10);
        if (e.key === 'ArrowLeft') skip(-10);
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); togglePlay(); }
    });

    ['mousemove', 'touchstart', 'click'].forEach(ev => window.addEventListener(ev, wakeUI));
</script>

</body>
</html>
`);
}
