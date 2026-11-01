/**
 * BILIZ Comet Orbit — a visible DOM layer above the navbar.
 * Its route follows the rounded border, with sin/cos normal oscillation.
 * Runs independently of the decorative molecular Canvas, so the comet
 * is visible even when Canvas compositing changes or cannot initialize.
 */
(() => {
  "use strict";

  const nav = document.querySelector("body.cosmic-site > header.nav");
  if (!nav) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const layer = document.createElement("div");
  layer.className = "nav-comet-layer";
  layer.setAttribute("aria-hidden", "true");

  const head = document.createElement("span");
  head.className = "nav-comet-head";
  layer.appendChild(head);

  const tails = [];
  for (let i = 0; i < 19; i++) {
    const dot = document.createElement("span");
    dot.className = "nav-comet-trail";
    layer.appendChild(dot);
    tails.push(dot);
  }
  document.body.appendChild(layer);

  let distance = 160;
  let energy = 0;
  let hover = false;
  let frameId = 0;
  let lastFrame = performance.now();
  let previousScroll = window.scrollY;

  // A single closed rounded-rectangle circuit in clockwise order.
  // Every edge gives an outward normal; rounded corners interpolate it.
  function borderAt(d, w, h, r) {
    const arc = Math.PI * r / 2;
    const hx = w - 2 * r;
    const vy = h - 2 * r;
    const length = 2 * (hx + vy) + 4 * arc;
    d = ((d % length) + length) % length;
    const corner = (cx,cy,a)=>({
      x: cx + Math.cos(a)*r,
      y: cy + Math.sin(a)*r,
      nx: Math.cos(a),
      ny: Math.sin(a),
      tx: -Math.sin(a),
      ty: Math.cos(a)
    });
    if (d < hx) return {x:r+d,y:1,nx:0,ny:-1,tx:1,ty:0};
    d -= hx;
    if (d < arc) return corner(w-r-1,r+1,-Math.PI/2+d/r);
    d -= arc;
    if (d < vy) return {x:w-1,y:r+d,nx:1,ny:0,tx:0,ty:1};
    d -= vy;
    if (d < arc) return corner(w-r-1,h-r-1,d/r);
    d -= arc;
    if (d < hx) return {x:w-r-d,y:h-1,nx:0,ny:1,tx:-1,ty:0};
    d -= hx;
    if (d < arc) return corner(r+1,h-r-1,Math.PI/2+d/r);
    d -= arc;
    if (d < vy) return {x:1,y:h-r-d,nx:-1,ny:0,tx:0,ty:-1};
    d -= vy;
    return corner(r+1,r+1,Math.PI+d/r);
  }

  function location(d, seconds, rect, r, boost) {
    const p = borderAt(d, rect.width, rect.height, r);
    const amp = 4.1 + boost * 7.3;
    const wave = amp * (.71 * Math.sin(d*.028 + seconds*2.7) +
                        .29 * Math.cos(d*.013 - seconds*1.8));
    const along = (1.5 + boost*2) * Math.sin(seconds*3.15);
    return {
      x: rect.left + p.x + p.nx*wave + p.tx*along,
      y: rect.top + p.y + p.ny*wave + p.ty*along
    };
  }

  function render(seconds) {
    const rect = nav.getBoundingClientRect();
    if (rect.width < 40 || rect.height < 25) return;
    const radius = parseFloat(getComputedStyle(nav).borderTopLeftRadius) || 20;
    const r = Math.max(8, Math.min(radius, rect.width/2 - 2, rect.height/2 - 2));
    const boost = Math.max(energy, hover ? .22 : 0);
    const x = location(distance, seconds, rect, r, boost);
    head.style.transform = "translate3d(" + (x.x-5) + "px," + (x.y-5) + "px,0)";
    head.style.setProperty("--comet-power", boost.toFixed(2));

    const reduced = prefersReducedMotion.matches;
    layer.classList.toggle("nav-comet-reduced", reduced);
    if (reduced) return;

    const spacing = 7 + boost*3.8;
    for (let i = 0; i < tails.length; i++) {
      const dot = tails[i];
      const pos = location(distance - (i+1)*spacing, seconds, rect, r, boost);
      dot.style.transform = "translate3d(" + (pos.x-2) + "px," + (pos.y-2) + "px,0) scale(" + Math.max(.42,1-i*.026) + ")";
      dot.style.opacity = Math.max(.035, (1-i/tails.length)**1.8 * (.80 + boost*.15)).toFixed(3);
    }
  }

  function tick(now) {
    frameId = 0;
    if (document.hidden) return;
    const delta = Math.min(.06, Math.max(0,(now-lastFrame)/1000));
    lastFrame = now;
    energy *= Math.exp(-delta*2.0);
    if (!prefersReducedMotion.matches) {
      distance += (160 + Math.max(energy,hover?.22:0)*190) * delta;
    }
    render(now/1000);
    frameId = requestAnimationFrame(tick);
  }

  function start() {
    cancelAnimationFrame(frameId);
    frameId = 0;
    lastFrame = performance.now();
    render(lastFrame/1000);
    if (!document.hidden) frameId = requestAnimationFrame(tick);
  }

  nav.addEventListener("pointerenter",()=>{hover=true;});
  nav.addEventListener("pointerleave",()=>{hover=false;});
  window.addEventListener("scroll",()=>{
    const dy = Math.abs(window.scrollY-previousScroll);
    previousScroll = window.scrollY;
    energy = Math.min(1,Math.max(energy,dy/65)+.16);
  },{passive:true});
  window.addEventListener("resize",()=>render(performance.now()/1000),{passive:true});
  document.addEventListener("visibilitychange",start);
  if (prefersReducedMotion.addEventListener) prefersReducedMotion.addEventListener("change",start);
  else prefersReducedMotion.addListener(start);
  window.addEventListener("pageshow",start);
  window.addEventListener("pagehide",()=>cancelAnimationFrame(frameId));
  start();
})();