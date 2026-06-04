export default function renderPlayer(res, videoUrl) {
  if (!/^https?:\/\//i.test(videoUrl)) {
    videoUrl = "https://" + videoUrl;
  }

  res.setHeader("Content-Type", "text/html");

  return res.send(`
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

        .player-ui.active {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
        }
    </style>
</head>

<body>

<div class="container">
    <div class="buffer-overlay" id="buffer">
        <div class="spinner"></div>
    </div>

    <video id="player" preload="auto">
        <source src="${videoUrl}" type="video/mp4">
    </video>

    <div class="player-ui" id="ui"></div>
</div>

<script>
    const v = document.getElementById('player');
    const buffer = document.getElementById('buffer');
    const ui = document.getElementById('ui');

    v.addEventListener('waiting', () => buffer.style.display = 'flex');
    v.addEventListener('playing', () => buffer.style.display = 'none');
    v.addEventListener('canplay', () => buffer.style.display = 'none');

    function showUI() {
        ui.classList.add('active');
    }

    window.addEventListener('mousemove', showUI);
    window.addEventListener('touchstart', showUI);
</script>

</body>
</html>
  `);
}
