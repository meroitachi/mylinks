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
    <title>Premium TV Stream</title>
    <style>
        :root {
            --accent: #00d2ff;
            --glass: rgba(255, 255, 255, 0.08);
            --glass-border: rgba(255, 255, 255, 0.15);
            --bg-dark: #050505;
        }

        body, html {
            margin: 0; padding: 0;
            background: var(--bg-dark);
            height: 100vh; width: 100vw;
            display: flex; align-items: center; justify-content: center;
            font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            overflow: hidden; color: white;
        }

        .video-container {
            position: relative;
            width: 100%; height: 100%;
            background: black;
            display: flex; align-items: center; justify-content: center;
        }

        video { width: 100%; height: 100%; object-fit: contain; }

        /* Cinematic Overlay */
        .overlay {
            position: absolute;
            inset: 0;
            display: flex; flex-direction: column;
            justify-content: flex-end;
            padding: 60px;
            background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 50%);
            transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            z-index: 10;
        }

        .hidden { opacity: 0; cursor: none; }

        /* Control Cluster */
        .controls-main {
            display: flex; flex-direction: column;
            align-items: center; gap: 35px;
            width: 100%; max-width: 1000px; margin: 0 auto;
        }

        /* Progress Bar */
        .progress-wrapper {
            width: 100%; height: 8px;
            background: rgba(255,255,255,0.1);
            border-radius: 20px; cursor: pointer;
            overflow: hidden; position: relative;
        }
        .progress-fill {
            height: 100%; width: 0%;
            background: linear-gradient(90deg, var(--accent), #3a7bd5);
            box-shadow: 0 0 20px rgba(0, 210, 255, 0.6);
            transition: width 0.1s linear;
        }

        /* Button Styling */
        .button-group {
            display: flex; align-items: center; gap: 40px;
        }

        .btn-circle {
            background: var(--glass);
            border: 1px solid var(--glass-border);
            backdrop-filter: blur(15px);
            color: white;
            cursor: pointer;
            display: flex; align-items: center; justify-content: center;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        }

        .btn-small { width: 65px; height: 65px; border-radius: 50%; font-size: 1.2rem; }
        .btn-play { 
            width: 90px; height: 90px; border-radius: 50%; 
            font-size: 2rem; background: white; color: black; border: none;
            box-shadow: 0 0 30px rgba(255,255,255,0.2);
        }

        .btn-speed {
            padding: 10px 20px; border-radius: 30px; font-weight: bold;
            letter-spacing: 1px; font-size: 0.9rem; min-width: 80px;
        }

        .btn-circle:hover, .btn-circle:focus {
            transform: scale(1.15);
            background: rgba(255,255,255,0.2);
            border-color: var(--accent);
            outline: none;
        }

        .btn-play:hover { transform: scale(1.1); background: #eee; }

        .title-tag {
            position: absolute; top: 40px; left: 60px;
            font-size: 0.8rem; letter-spacing: 4px; opacity: 0.5;
        }

        /* Speed Badge */
        .speed-val { color: var(--accent); }
    </style>
</head>
<body>

<div class="video-container" id="container">
    <video id="player" preload="auto">
        <source src="${videoUrl}" type="video/mp4">
    </video>

    <div class="overlay" id="overlay">
        <div class="title-tag">PREMIUM 4K STREAM</div>

        <div class="controls-main">
            <div class="progress-wrapper" onclick="seek(event)">
                <div class="progress-fill" id="progressFill"></div>
            </div>

            <div class="button-group">
                <button class="btn-circle btn-speed" onclick="cycleSpeed()">
                    <span id="speedTxt">1.0</span>x
                </button>

                <button class="btn-circle btn-small" onclick="skip(-10)">
                   <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M12.5 5.5v13L3 12l9.5-6.5zM21 5.5v13L11.5 12 21 5.5z"/></svg>
                </button>

                <button class="btn-circle btn-play" id="playBtn" onclick="togglePlay()">▶</button>

                <button class="btn-circle btn-small" onclick="skip(10)">
                   <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M11.5 18.5v-13L21 12l-9.5 6.5zM3 18.5v-13L12.5 12 3 18.5z"/></svg>
                </button>
                
                <button class="btn-circle btn-small" onclick="toggleFS()">
                   <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>
                </button>
            </div>
        </div>
    </div>
</div>

<script>
    const video = document.getElementById('player');
    const overlay = document.getElementById('overlay');
    const progressFill = document.getElementById('progressFill');
    const playBtn = document.getElementById('playBtn');
    const speedTxt = document.getElementById('speedTxt');
    let hideTimer;

    // Playback Logic
    function togglePlay() {
        if (video.paused) {
            video.play();
            playBtn.innerHTML = '⏸';
        } else {
            video.pause();
            playBtn.innerHTML = '▶';
        }
        resetTimer();
    }

    function skip(sec) {
        video.currentTime += sec;
        resetTimer();
    }

    function cycleSpeed() {
        const speeds = [1, 1.25, 1.5, 2];
        let current = speeds.indexOf(video.playbackRate);
        let next = speeds[(current + 1) % speeds.length];
        video.playbackRate = next;
        speedTxt.innerText = next;
        resetTimer();
    }

    function toggleFS() {
        if (!document.fullscreenElement) {
            document.getElementById('container').requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }

    // Progress
    video.addEventListener('timeupdate', () => {
        const pct = (video.currentTime / video.duration) * 100;
        progressFill.style.width = pct + '%';
    });

    function seek(e) {
        const rect = e.currentTarget.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        video.currentTime = pos * video.duration;
    }

    // Auto-hide UI
    function resetTimer() {
        overlay.classList.remove('hidden');
        clearTimeout(hideTimer);
        if (!video.paused) {
            hideTimer = setTimeout(() => overlay.classList.add('hidden'), 3500);
        }
    }

    // TV Remote Support (Arrows + Enter)
    document.addEventListener('keydown', (e) => {
        resetTimer();
        switch(e.key) {
            case 'ArrowRight': skip(10); break;
            case 'ArrowLeft': skip(-10); break;
            case 'Enter': 
            case ' ': togglePlay(); break;
            case 'f': toggleFS(); break;
        }
    });

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('touchstart', resetTimer);
</script>

</body>
</html>
`);
}
