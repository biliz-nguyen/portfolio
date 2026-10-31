/**
 * Biliz Research Atlas — Space Expedition background
 * Self-contained Canvas 2D scene. No external assets, packages, or tracking.
 * Deliberately illustrative (not observational astronomy data).
 */
(() => {
  "use strict";
  if (!document.body.classList.contains("cosmic-site")) return;

  const canvas = document.createElement("canvas");
  canvas.id = "space-expedition";
  canvas.setAttribute("aria-hidden", "true");
  canvas.setAttribute("role", "presentation");
  document.body.insertBefore(canvas, document.body.firstChild);

  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return;

  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const mobileQuery = window.matchMedia("(max-width: 650px)");
  const TAU = Math.PI * 2;
  let w = 0, h = 0, scale = 1, stars = [], frame = 0, lastFrame = 0;
  let pointerX = 0, pointerY = 0;
  let reducedMotion = motionQuery.matches;

  // Deterministic positions, so the scene doesn't jump between page navigations.
  function randomGenerator(seed) {
    return function () {
      seed |= 0;
      seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const rng = randomGenerator(20261031);

  const explorer = [
    "............A..............",
    "...........AAA.............",
    "......A...ABBAA............",
    "...AAAABAAABBBBAAAA........",
    "TTTCCCAAAABBBBAAAAAAAAAD..",
    "...AAAABAAABBBBAAAA........",
    "......A...ABBAA............",
    "...........AAA.............",
    "............A.............."
  ];
  const probe = [
    ".........D........",
    ".....A..ADA.......",
    "...AAABADDBBA.....",
    "TTCACAABBBBBBAADD.",
    "...AAABADDBBA.....",
    ".....A..ADA.......",
    ".........D........"
  ];

  function resize() {
    w = window.innerWidth;
    h = window.innerHeight;
    scale = Math.min(window.devicePixelRatio || 1, 1.6);
    canvas.width = Math.floor(w * scale);
    canvas.height = Math.floor(h * scale);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    stars = [];
    const count = Math.max(95, Math.min(255, Math.round(w * h / 8500)));
    for (let i = 0; i < count; i++) {
      stars.push({
        x: rng(), y: rng(), radius: rng() > 0.95 ? 1.45 : (rng() > 0.68 ? 1.0 : 0.55),
        phase: rng() * TAU, depth: 0.25 + rng() * 0.75,
        tint: rng() > 0.78 ? "#a5beff" : "#ecf5ff"
      });
    }
    draw(performance.now() * 0.001);
  }

  function glow(x, y, radius, color0, color1) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
    g.addColorStop(0, color0);
    g.addColorStop(1, color1);
    ctx.fillStyle = g;
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }

  function atmosphere() {
    // Cool research-grade palette rather than arcade neon.
    glow(w * 0.80, h * 0.26, Math.min(w, h) * 0.68,
      "rgba(71,76,158,.22)", "rgba(48,35,91,0)");
    glow(w * 0.18, h * 0.80, Math.min(w, h) * 0.59,
      "rgba(28,102,152,.12)", "rgba(10,28,57,0)");
    glow(w * 0.58, h * 0.90, Math.min(w, h) * 0.58,
      "rgba(91,46,125,.09)", "rgba(31,21,69,0)");
  }

  function starfield(t) {
    for (const s of stars) {
      const twinkle = reducedMotion ? 1 : 0.74 + 0.26 * Math.sin(t * (0.45 + s.depth) + s.phase);
      const x = s.x * w + pointerX * s.depth * 8;
      const y = s.y * h + pointerY * s.depth * 7;
      ctx.globalAlpha = s.depth * twinkle * 0.81;
      ctx.fillStyle = s.tint;
      ctx.fillRect(Math.round(x), Math.round(y), s.radius, s.radius);
      if (s.radius > 1.4) {
        ctx.globalAlpha *= 0.15;
        ctx.fillRect(x - 3, y, 7, 0.6);
        ctx.fillRect(x, y - 3, 0.6, 7);
      }
    }
    ctx.globalAlpha = 1;
  }

  function ellipse(x, y, a, b, angle, color, dash) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 0.75;
    ctx.setLineDash(dash || []);
    ctx.beginPath();
    ctx.ellipse(x, y, a, b, angle, 0, TAU);
    ctx.stroke();
    ctx.restore();
  }

  function planetarySurvey(t) {
    const small = mobileQuery.matches;
    const x = w * (small ? 0.85 : 0.815);
    const y = h * (small ? 0.20 : 0.29);
    const r = Math.min(small ? 52 : 87, w * 0.085, h * 0.135);
    const dx = reducedMotion ? 0 : Math.sin(t * 0.1) * 1.8;

    // Measured-looking orbit marks are decoration, not claimed scientific data.
    ctx.save();
    ctx.translate(dx, 0);
    ellipse(x, y, r * 2.5, r * 0.84, -0.38, "rgba(139,172,238,.23)");
    ellipse(x, y, r * 2.9, r * 1.48, 0.36, "rgba(128,160,226,.13)", [3, 8]);
    ellipse(x, y, r * 1.9, r * 1.80, -0.19, "rgba(166,178,243,.13)");

    glow(x, y, r * 2.4, "rgba(85,100,191,.22)", "rgba(69,68,147,0)");
    const planet = ctx.createRadialGradient(x - r * 0.38, y - r * 0.46, r * 0.06, x + r * 0.2, y + r * 0.1, r * 1.45);
    planet.addColorStop(0, "#9fa7d5");
    planet.addColorStop(0.45, "#545e9b");
    planet.addColorStop(0.8, "#1d285b");
    planet.addColorStop(1, "#080d25");
    ctx.globalAlpha = small ? 0.45 : 0.81;
    ctx.fillStyle = planet;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.fill();
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.clip();
    ctx.strokeStyle = "rgba(213,220,255,.09)";
    for (let i = -4; i <= 5; i++) {
      ctx.lineWidth = i % 2 ? 3 : 8;
      ctx.beginPath();
      ctx.moveTo(x - r * 1.1, y + i * r * 0.22);
      ctx.lineTo(x + r * 1.1, y + i * r * 0.22 - r * 0.5);
      ctx.stroke();
    }
    ctx.restore();
    ctx.globalAlpha = 1;

    const p = t * 0.055 + 0.6;
    const markerX = x + Math.cos(p) * r * 2.5;
    const markerY = y + Math.sin(p) * r * 0.84;
    ctx.fillStyle = "#b7d6ff";
    ctx.beginPath();
    ctx.arc(markerX, markerY, 2.2, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  function spectralChart() {
    if (mobileQuery.matches) return;
    const x = w * 0.085, y = h * 0.50;
    ctx.save();
    ctx.strokeStyle = "rgba(135,169,219,.13)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x - 12, y);
    ctx.lineTo(x + 60, y);
    ctx.moveTo(x, y - 12);
    ctx.lineTo(x, y + 40);
    ctx.stroke();
    ctx.setLineDash([2, 5]);
    ctx.beginPath();
    ctx.arc(x, y, 32, 0, TAU);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.font = "9px monospace";
    ctx.fillStyle = "rgba(154,182,226,.5)";
    ctx.fillText("SURVEY / FIELD", x + 15, y + 58);
    ctx.restore();
  }

  const pixelColors = {
    A: "#7894c9", B: "#e4f4ff", C: "#9bd6ff",
    D: "#c2cefa", T: "#6d8df1"
  };
  function pixelShip(sprite, x, y, px, angle, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.globalAlpha = alpha;
    // Crisp, legible pixels rather than a blurry image asset.
    const totalWidth = sprite[0].length * px;
    const totalHeight = sprite.length * px;
    ctx.translate(-totalWidth / 2, -totalHeight / 2);
    for (let row = 0; row < sprite.length; row++) {
      for (let col = 0; col < sprite[row].length; col++) {
        const k = sprite[row][col];
        if (pixelColors[k]) {
          ctx.fillStyle = pixelColors[k];
          ctx.fillRect(col * px, row * px, px, px);
        }
      }
    }
    ctx.restore();
  }

  function spacecraft(t) {
    const small = mobileQuery.matches;
    const base = small ? 1.65 : Math.min(3.15, Math.max(2.25, w / 560));
    const drift = reducedMotion ? 0 : t;
    const pX = w * (small ? 0.72 : 0.855) + Math.sin(drift * 0.12) * 12;
    const pY = h * (small ? 0.69 : 0.62) - Math.cos(drift * 0.17) * 6;
    const sX = w * (small ? 0.15 : 0.17) + Math.cos(drift * 0.09) * 8;
    const sY = h * (small ? 0.82 : 0.79) + Math.sin(drift * 0.13) * 7;

    ctx.save();
    ctx.strokeStyle = "rgba(129,167,246,.28)";
    ctx.setLineDash([2, 8]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pX - 160, pY + 38);
    ctx.quadraticCurveTo(pX - 70, pY - 52, pX - 14, pY + 10);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(sX - 130, sY + 23);
    ctx.quadraticCurveTo(sX - 40, sY - 35, sX - 8, sY + 8);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // Thruster particles: intentionally subtle and slow (exploration, not combat).
    for (let i = 0; i < 5; i++) {
      const flicker = reducedMotion ? 0.4 : (1 + Math.sin(t * 3 - i * 0.85)) / 2;
      ctx.globalAlpha = 0.18 + 0.25 * flicker;
      ctx.fillStyle = "#91b8ff";
      ctx.fillRect(pX - 47 * base / 2 - i * 12, pY + (i % 3 - 1) * 3, 3 + 2 * flicker, 1.5);
      ctx.fillRect(sX - 37 * base / 2 - i * 8, sY + (i % 2) * 3, 2 + flicker, 1);
    }
    ctx.globalAlpha = 1;

    pixelShip(explorer, pX, pY, base, -0.14, 0.94);
    pixelShip(probe, sX, sY, base * 0.70, 0.21, 0.75);

    if (!small) {
      ctx.save();
      ctx.font = "10px monospace";
      ctx.textBaseline = "top";
      ctx.fillStyle = "rgba(172,195,249,.72)";
      ctx.fillText("EXPLORER-01  /  SIMULATED", pX - 48, pY + base * 7.5);
      ctx.fillStyle = "rgba(154,178,226,.52)";
      ctx.fillText("REMOTE PROBE  /  CONCEPT", sX - 30, sY + base * 6);
      ctx.restore();
    }
  }

  function meteors(t) {
    // A rare, slow survey streak; no weapon fire or explosions.
    if (reducedMotion) return;
    const period = 19.0;
    const segment = (t + 4.7) % period;
    if (segment > 2.2) return;
    const progress = segment / 2.2;
    const x = w * 0.44 + progress * 190;
    const y = h * 0.13 + progress * 70;
    const grad = ctx.createLinearGradient(x - 105, y - 38, x, y);
    grad.addColorStop(0, "rgba(162,204,255,0)");
    grad.addColorStop(1, "rgba(185,220,255,.32)");
    ctx.strokeStyle = grad;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(x - 105, y - 38);
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function draw(t) {
    ctx.clearRect(0, 0, w, h);
    atmosphere();
    starfield(t);
    planetarySurvey(t);
    spectralChart();
    meteors(t);
    spacecraft(t);
  }

  function tick(timestamp) {
    frame = 0;
    if (document.hidden || reducedMotion) return;
    if (timestamp - lastFrame > 33) {
      draw(timestamp * 0.001);
      lastFrame = timestamp;
    }
    frame = window.requestAnimationFrame(tick);
  }

  function restart() {
    window.cancelAnimationFrame(frame);
    frame = 0;
    draw(performance.now() * 0.001);
    if (!reducedMotion && !document.hidden) frame = window.requestAnimationFrame(tick);
  }

  window.addEventListener("resize", () => { resize(); restart(); }, { passive: true });
  window.addEventListener("pointermove", event => {
    if (reducedMotion) return;
    pointerX = (event.clientX / Math.max(w, 1) - 0.5);
    pointerY = (event.clientY / Math.max(h, 1) - 0.5);
  }, { passive: true });
  document.addEventListener("visibilitychange", restart);
  const onMotionChange = event => { reducedMotion = event.matches; restart(); };
  if (motionQuery.addEventListener) motionQuery.addEventListener("change", onMotionChange);
  else motionQuery.addListener(onMotionChange);

  resize();
  restart();
})();
