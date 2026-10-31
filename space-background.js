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

  // Textures are rendered on an intentionally low-resolution grid and upscaled
  // with nearest-neighbour sampling: genuine pixel art, not a CSS filter.
  const planetCache = new Map();
  function pixelPlanetTexture(kind) {
    if (planetCache.has(kind)) return planetCache.get(kind);
    const n = kind === "main" ? 72 : 42;
    const layer = document.createElement("canvas");
    layer.width = layer.height = n;
    const c = layer.getContext("2d");
    const palette = kind === "main"
      ? ["#101a3d","#243362","#3b5385","#6175b3","#819ac9","#c4cdf1"]
      : kind === "ice"
        ? ["#172e46","#215570","#367d99","#5db0c1","#9de0db","#d4fff0"]
        : ["#2b214b","#493567","#765685","#a47d9f","#e1afaa","#ffdbc7"];
    const rand = randomGenerator(kind === "main" ? 4132 : kind === "ice" ? 7478 : 3831);
    for(let j=0;j<n;j++) for(let i=0;i<n;i++){
      const a=(i+0.5-n/2)/(n/2-1),b=(j+0.5-n/2)/(n/2-1);
      const dist=a*a+b*b;
      if(dist>1)continue;
      const light = -a*0.58-b*0.38 + 0.38;
      const bands = Math.sin(j*0.48 + Math.sin(i*0.14)*2.2)*0.65;
      const mottling = (rand()-0.5)*1.1;
      const shade = Math.min(5,Math.max(0,Math.floor(2.1+light*2.4+bands+mottling)));
      c.fillStyle=palette[shade];
      c.fillRect(i,j,1,1);
    }
    planetCache.set(kind,layer);
    return layer;
  }

  function pixelOrbit(x,y,rx,ry,angle,color,step=0.023) {
    ctx.save();
    ctx.translate(x,y);
    ctx.rotate(angle);
    ctx.fillStyle=color;
    for(let a=0;a<TAU;a+=step){
      if(Math.floor(a/step)%5===0)continue;
      const px=Math.cos(a)*rx,py=Math.sin(a)*ry;
      ctx.fillRect(Math.round(px/3)*3,Math.round(py/3)*3,2,2);
    }
    ctx.restore();
  }

  function renderPlanet(kind,x,y,r,opacity=1) {
    ctx.save();
    ctx.globalAlpha=opacity;
    ctx.imageSmoothingEnabled=false;
    ctx.drawImage(pixelPlanetTexture(kind),Math.round(x-r),Math.round(y-r),r*2,r*2);
    ctx.restore();
  }

  function formulaAt(text,x,y,alpha) {
    ctx.save();
    ctx.font="11px 'DM Mono', monospace";
    const pad=9,width=ctx.measureText(text).width + pad*2;
    // Quiet HUD label, readable without competing with the main headline.
    x=Math.max(8,Math.min(w-width-8,x-width/2));
    y=Math.max(18,Math.min(h-15,y));
    ctx.globalAlpha=alpha;
    ctx.fillStyle="rgba(7,16,39,.79)";
    ctx.fillRect(x,y-14,width,23);
    ctx.strokeStyle="rgba(150,189,248,.4)";
    ctx.strokeRect(x+.5,y-13.5,width-1,22);
    ctx.fillStyle="#c7d9ff";
    ctx.textBaseline="middle";
    ctx.fillText(text,x+pad,y-2);
    ctx.restore();
  }

  function orbitalPhysics(x,y,r,t) {
    const mobile=mobileQuery.matches;
    const entries=mobile
      ? [{formula:"v = √(GM/r)",a:-0.35,rx:2.1,ry:1.44}]
      : [
          {formula:"F = Gm₁m₂ / r²",a:-1.75,rx:2.6,ry:1.75},
          {formula:"v = √(GM/r)",a:0.13,rx:2.85,ry:1.42},
          {formula:"T² = 4π²r³ / GM",a:1.85,rx:2.6,ry:1.62}
        ];
    for(let i=0;i<entries.length;i++){
      const item=entries[i], angle=item.a + (reducedMotion?0:t*0.055)*(i%2===0?1:-1);
      const fx=x+Math.cos(angle)*r*item.rx;
      const fy=y+Math.sin(angle)*r*item.ry;
      formulaAt(item.formula,fx,fy,mobile?.53:.76);
    }
    if(!mobile){
      ctx.save();
      ctx.fillStyle="rgba(156,192,247,.7)";
      ctx.font="10px 'DM Mono', monospace";
      ctx.fillText("ORBITAL MECHANICS  //  CONCEPTUAL",Math.min(w-260,Math.max(12,x-115)),Math.min(h-8,y+r*2.65));
      ctx.restore();
    }
  }

  function planetarySurvey(t) {
    const mobile=mobileQuery.matches;
    const x=w*(mobile?.79:.83), y=h*(mobile?.22:.30);
    const r=Math.max(38,Math.min(mobile?64:110,w*(mobile?.125:.078),h*(mobile?.105:.145)));
    const motion=reducedMotion?0:t;

    glow(x,y,r*2.9,"rgba(83,99,210,.26)","rgba(48,46,129,0)");
    pixelOrbit(x,y,r*2.6,r*1.30,-0.34,"rgba(138,176,246,.20)");
    pixelOrbit(x,y,r*3.2,r*1.83,.38,"rgba(125,158,234,.12)",.032);
    pixelOrbit(x,y,r*1.93,r*2.45,-.11,"rgba(165,178,235,.09)",.036);

    // Pixelated orbital belt passes behind and in front of the planetary body.
    ctx.save();
    ctx.translate(x,y);
    ctx.rotate(-.34);
    for(let a=0;a<Math.PI;a+=.023){
      ctx.fillStyle="rgba(171,190,248,.48)";
      ctx.fillRect(Math.round(Math.cos(a)*r*1.62/3)*3,Math.round(Math.sin(a)*r*.58/3)*3,3,3);
    }
    ctx.restore();
    renderPlanet("main",x,y,r,mobile?.65:.96);
    ctx.save();
    ctx.translate(x,y);
    ctx.rotate(-.34);
    for(let a=Math.PI;a<TAU;a+=.017){
      ctx.fillStyle="rgba(202,207,255,.73)";
      ctx.fillRect(Math.round(Math.cos(a)*r*1.62/3)*3,Math.round(Math.sin(a)*r*.58/3)*3,3,3);
    }
    ctx.restore();

    const a=motion*.075+1.4;
    const satelliteX=x+Math.cos(a)*r*2.6;
    const satelliteY=y+Math.sin(a)*r*1.3;
    renderPlanet("ice",satelliteX,satelliteY,Math.max(6,r*.105),.92);

    if(!mobile){
      const mx=w*.19,my=h*.72;
      glow(mx,my,85,"rgba(52,153,171,.11)","rgba(17,60,93,0)");
      renderPlanet("ice",mx,my,31,.72);
      pixelOrbit(mx,my,65,25,.2,"rgba(134,212,234,.15)",.055);
      renderPlanet("dust",w*.955,h*.86,43,.70);
    }
    orbitalPhysics(x,y,r,motion);
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

  function flame(x,y,px,width,height,t,alpha) {
    ctx.save();
    ctx.translate(x,y);
    ctx.globalAlpha=alpha;
    const nozzle=-width/2, side=height*.17;
    const cycle=reducedMotion?0:t;
    // Flames share the ship coordinate system: exhaust remains attached
    // when the ship turns, rather than sliding across the screen.
    const color=["#fff7c0","#ffd47a","#ff8c63","#ac87ff","#6faaff"];
    for(let engine=-1;engine<=1;engine+=2){
      const cy=engine*side;
      const length=px*(9+3*Math.sin(cycle*7+engine));
      const g=ctx.createRadialGradient(nozzle-length*.40,cy,1,nozzle-length*.40,cy,length*.85);
      g.addColorStop(0,"rgba(255,155,87,.3)");
      g.addColorStop(1,"rgba(72,97,217,0)");
      ctx.fillStyle=g;
      ctx.fillRect(nozzle-length*1.4,cy-length*.9,length*1.7,length*1.8);
      for(let j=0;j<13;j++){
        const dist=j/12;
        const cell=px*(dist<.5?1.0:.7);
        const edge=1.7*(1-dist);
        const bx=nozzle-px*(j+.8);
        const wobble=Math.round(Math.sin(cycle*10+j*1.8+engine)*.85);
        for(let k=-2;k<=2;k++){
          if(Math.abs(k)>edge || (j>9 && Math.abs(k)>0))continue;
          ctx.fillStyle=color[Math.min(4,Math.max(0,Math.floor(dist*4 + Math.abs(k)*.38)))];
          ctx.globalAlpha=alpha*(1-dist*.68);
          ctx.fillRect(Math.round(bx),Math.round(cy+(k+wobble)*px*.68),cell+1,cell+1);
        }
      }
      for(let j=0;j<7;j++){
        const dist=(j*.21+(cycle*.35)%1.6);
        ctx.globalAlpha=alpha*.6*(1-j/8);
        ctx.fillStyle=j%2?"#fdb679":"#a2b9ff";
        ctx.fillRect(nozzle-px*(16+dist*7),cy+Math.sin(j*4.1+cycle*1.4)*px*3,px*.52,px*.52);
      }
    }
    ctx.restore();
  }

  function spacecraft(t) {
    const mobile=mobileQuery.matches;
    const drift=reducedMotion?0:t;
    const bigPx=mobile?3.15:Math.min(5.4,Math.max(4.0,w/370));
    const littlePx=mobile?2.0:Math.min(4.0,Math.max(3.0,w/520));
    const mainX=w*(mobile?.73:.82)+Math.sin(drift*.18)*13;
    const mainY=h*(mobile?.70:.66)+Math.cos(drift*.20)*8;
    const probeX=w*(mobile?.24:.15)+Math.cos(drift*.15)*12;
    const probeY=h*(mobile?.88:.83)+Math.sin(drift*.19)*9;

    ctx.save();
    ctx.strokeStyle="rgba(122,178,252,.21)";
    ctx.lineWidth=1;
    ctx.setLineDash([2,8]);
    ctx.beginPath();
    ctx.moveTo(mainX-220,mainY+65);
    ctx.quadraticCurveTo(mainX-90,mainY-75,mainX-13,mainY+8);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(probeX-130,probeY+38);
    ctx.quadraticCurveTo(probeX-36,probeY-57,probeX+4,probeY+8);
    ctx.stroke();
    ctx.restore();

    function oneShip(sprite,x,y,px,angle,alpha) {
      ctx.save();
      ctx.translate(x,y);
      ctx.rotate(angle);
      flame(0,0,px,sprite[0].length*px,sprite.length*px,drift,alpha);
      ctx.restore();
      pixelShip(sprite,x,y,px,angle,alpha);
    }

    oneShip(explorer,mainX,mainY,bigPx,-.10,mobile?.72:.93);
    oneShip(probe,probeX,probeY,littlePx,.20,mobile?.57:.86);

    // Tiny autonomous scout: an additional ship orbiting at a slower rate.
    if(!mobile){
      const sx=w*.71+Math.sin(drift*.10)*22,sy=h*.86+Math.cos(drift*.15)*13;
      oneShip(probe,sx,sy,littlePx*.78,-.27,.63);
      ctx.save();
      ctx.fillStyle="rgba(175,199,251,.67)";
      ctx.font="10px 'DM Mono', monospace";
      ctx.fillText("EXPLORER-01 // ION THRUST",mainX-80,mainY+bigPx*8.8);
      ctx.fillText("PROBE-02 // SCIENCE PAYLOAD",probeX-36,probeY+littlePx*8.3);
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
