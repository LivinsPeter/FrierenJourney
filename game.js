(() => {
  "use strict";

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Keep all drawing on the 240 × 160 logical canvas for crisp scaling.
  ctx.imageSmoothingEnabled = false;

  let started = false;
  let lastTime = 0;
  let elapsed = 0;

  function drawTitle() {
    ctx.fillStyle = "#263d35";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // A quiet horizon gives the title screen a little depth without external art.
    ctx.fillStyle = "#78918a";
    ctx.fillRect(0, 0, 240, 76);
    ctx.fillStyle = "#c5b98d";
    ctx.fillRect(180, 24, 12, 12);
    ctx.fillStyle = "#526d58";
    ctx.fillRect(0, 76, 240, 34);
    ctx.fillStyle = "#394f3d";
    ctx.fillRect(0, 110, 240, 50);
    ctx.fillStyle = "#b7a47c";
    ctx.fillRect(104, 76, 34, 84);
    ctx.fillStyle = "#d9d0ae";
    ctx.fillRect(108, 76, 3, 84);

    ctx.fillStyle = "#17251f";
    ctx.fillRect(37, 39, 166, 38);
    ctx.strokeStyle = "#d4c7a1";
    ctx.strokeRect(37.5, 39.5, 165, 37);
    ctx.fillStyle = "#f0e6c8";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 13px Georgia, serif";
    ctx.fillText("BEYOND THE", 120, 52);
    ctx.fillText("LONG ROAD", 120, 67);

    ctx.fillStyle = "#f0e6c8";
    ctx.font = "8px Georgia, serif";
    ctx.fillText(started ? "The road awaits..." : "Press Enter or Space", 120, 132);
    ctx.fillStyle = "#c9c09f";
    ctx.font = "6px Georgia, serif";
    ctx.fillText("A QUIET FANTASY JOURNEY", 120, 146);
  }

  function update(deltaSeconds) {
    elapsed += deltaSeconds;
    // Placeholder loop animation: a small firefly drifts along the path.
    if (started) {
      const x = 118 + Math.round(Math.sin(elapsed * 1.5) * 25);
      ctx.fillStyle = "#e6d59b";
      ctx.fillRect(x, 116 + Math.round(Math.sin(elapsed * 2) * 2), 2, 2);
    }
  }

  function frame(time) {
    const deltaSeconds = Math.min((time - lastTime) / 1000 || 0, 0.05);
    lastTime = time;
    drawTitle();
    update(deltaSeconds);
    requestAnimationFrame(frame);
  }

  function startGame() {
    started = true;
  }

  window.addEventListener("keydown", (event) => {
    if (event.code === "Enter" || event.code === "Space") {
      event.preventDefault();
      startGame();
    }
  });

  requestAnimationFrame(frame);
})();
