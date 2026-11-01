/**
 * Molecular Border / BILIZ Research Atlas
 * Tiny Canvas 2D particle system, no third-party libraries.
 * Delicate molecules hover near the panel border while idle;
 * scroll & hover add a quick (decaying) energy impulse.
 */
(() => {
  "use strict";
  const nav = document.querySelector("body.cosmic-site > header.nav");
  if (!nav) return;

  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const canvas = document.createElement("canvas");
  canvas.className = "nav-molecule-canvas";
  canvas.setAttribute("aria-hidden", "true");
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d", {alpha: true});
  if (!ctx) { canvas.remove(); return; }

  const margin = 46;
  const PI2 = Math.PI * 2;
  let width = 0, height = 0, radius = 20, perimeter = 1;
  let deviceScale = 1, frame = 0, lastTime = 0, lastPaint = 0, lastScrollY = scrollY;
  let boost = 0, hover = false, particles = [], emissionDebt = 0, reacting = false;
  let oldLeft = NaN, oldTop = NaN, oldWidth = 0, oldHeight = 0;

  function fit() {
    const b = nav.getBoundingClientRect();
    const newW = Math.max(1, b.width), newH = Math.max(1, b.height);
    const px = Math.min(devicePixelRatio || 1, 1.6);
    const changed = Math.abs(newW - oldWidth) > 0.5 ||
                    Math.abs(newH - oldHeight) > 0.5 || px !== deviceScale;
    width = newW; height = newH; deviceScale = px;
    const style = getComputedStyle(nav);
    radius = Math.min(Math.max(parseFloat(style.borderTopLeftRadius) || 20, 8), height / 2 - 2, width / 2 - 2);
    perimeter = 2 * (width - 2 * radius) + 2 * (height - 2 * radius) + PI2 * radius;

    if (changed) {
      canvas.width = Math.round((width + margin * 2) * px);
      canvas.height = Math.round((height + margin * 2) * px);
      canvas.style.width = (width + margin * 2) + "px";
      canvas.style.height = (height + margin * 2) + "px";
      ctx.setTransform(px, 0, 0, px, 0, 0);
      particles = [];
      emissionDebt = 0;
      oldWidth = width;
      oldHeight = height;
      for (let i = 0; i < 24; i++) spawn(0, Math.random() * 0.9);
    }
    if (Math.abs(b.left - oldLeft) > .1 || Math.abs(b.top - oldTop) > .1) {
      canvas.style.left = (b.left - margin) + "px";
      canvas.style.top = (b.top - margin) + "px";
      oldLeft = b.left; oldTop = b.top;
    }
  }

  // Border starts on the top-left straight line, travels clockwise.
  // Normal points away from the panel so particles drift into space.
  function borderPoint(position) {
    let d = ((position % perimeter) + perimeter) % perimeter;
    const horizontal = width - 2 * radius;
    const vertical = height - 2 * radius;
    const arc = Math.PI * radius * .5;
    const corner = (cx,cy,angle) => ({
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius,
      nx: Math.cos(angle),
      ny: Math.sin(angle),
      tx: -Math.sin(angle),
      ty: Math.cos(angle)
    });
    if (d < horizontal) return {x:radius+d,y:1,nx:0,ny:-1,tx:1,ty:0};
    d -= horizontal;
    if (d < arc) return corner(width-radius-1,radius+1,-Math.PI/2+d/radius);
    d -= arc;
    if (d < vertical) return {x:width-1,y:radius+d,nx:1,ny:0,tx:0,ty:1};
    d -= vertical;
    if (d < arc) return corner(width-radius-1,height-radius-1,d/radius);
    d -= arc;
    if (d < horizontal) return {x:width-radius-d,y:height-1,nx:0,ny:1,tx:-1,ty:0};
    d -= horizontal;
    if (d < arc) return corner(radius+1,height-radius-1,Math.PI/2+d/radius);
    d -= arc;
    if (d < vertical) return {x:1,y:height-radius-d,nx:-1,ny:0,tx:0,ty:-1};
    d -= vertical;
    return corner(radius+1,radius+1,Math.PI+d/radius);
  }

  function spawn(energy, initialAge=0) {
    if (particles.length >= 110) return;
    const p = borderPoint(Math.random() * perimeter);
    const tangent = (Math.random() - .5) * (5 + energy * 23);
    const out = 3 + Math.random() * 7 + energy * (16 + Math.random() * 27);
    const life = 1.4 + Math.random() * 1.8 - energy * .35;
    const initial = Math.min(initialAge, .95) * life;
    particles.push({
      x: p.x + margin, y:p.y + margin,
      vx:p.nx*out+p.tx*tangent,
      vy:p.ny*out+p.ty*tangent,
      age:initial, life,
      radius:Math.random() < .13 ? 1.8 : .7 + Math.random() * .6 + energy * .7,
      phase:Math.random() * PI2,
      bright:Math.random()>.82
    });
  }

  function draw(time,dt) {
    ctx.clearRect(0,0,width + margin * 2,height + margin * 2);
    if (reduce.matches) return;
    ctx.save();
    ctx.translate(margin,margin);

    // Discontinuous molecular fragments replace the former continuous border.
    const fragments = Math.max(42,Math.min(118,Math.floor(perimeter / 18)));
    for(let i=0;i<fragments;i++) {
      const progress = (i + .13 * Math.sin(time*.25+i*2.4)) / fragments;
      const pt = borderPoint(progress * perimeter);
      const pulse = .5 + .5 * Math.sin(time*.8 + i*1.87);
      const intensity = .065 + pulse*.12 + boost*.22;
      ctx.fillStyle = "rgba(132,177,248," + intensity.toFixed(3) + ")";
      const offset = Math.sin(i * 5.3 + time*.55) * (1 + boost*3);
      ctx.fillRect(pt.x + pt.nx*offset,pt.y + pt.ny*offset,1.4 + boost*.9,1.4 + boost*.9);
    }

    ctx.restore();
    for(let i=particles.length-1;i>=0;i--) {
      const p=particles[i];
      p.age+=dt;
      if(p.age>p.life){particles.splice(i,1);continue;}
      p.x+=p.vx*dt;p.y+=p.vy*dt;
      const progress=p.age/p.life;
      const alpha=Math.sin(Math.PI*progress)*(.27 + boost*.26 + (p.bright?.30:0));
      const px=Math.round(p.x*2)/2,py=Math.round(p.y*2)/2;
      ctx.fillStyle="rgba(165,199,255,"+alpha.toFixed(3)+")";
      const size=p.radius*(1+boost*.25);
      ctx.fillRect(px,py,size,size);
      if(p.bright) {
        ctx.fillStyle="rgba(225,239,255,"+(alpha*.45).toFixed(3)+")";
        ctx.fillRect(px-2,py,4.5,.5);
        ctx.fillRect(px,py-2,.5,4.5);
      }
    }
    // One understated moving energy cluster during stronger reactions.
    if(boost>.13) {
      const p=borderPoint(((time*56)%perimeter));
      const intensity = Math.min(.45,boost*.35);
      const g=ctx.createRadialGradient(p.x+margin,p.y+margin,0,p.x+margin,p.y+margin,16);
      g.addColorStop(0,"rgba(144,199,255,"+intensity.toFixed(3)+")");
      g.addColorStop(1,"rgba(144,199,255,0)");
      ctx.fillStyle=g;
      ctx.fillRect(p.x+margin-16,p.y+margin-16,32,32);
    }
  }

  function tick(now) {
    frame = 0;
    if(reduce.matches || document.hidden) return;
    if(now-lastPaint<28){frame=requestAnimationFrame(tick);return;}
    const dt=Math.min(.08,(now-lastTime)/1000 || .032);
    lastPaint=now;lastTime=now;
    boost=Math.max(0,boost*Math.exp(-dt*2.2));
    const strength=Math.max(boost,hover?.18:0);
    const active=strength>.2;
    if(active!==reacting){nav.classList.toggle("molecule-reacting",active);reacting=active;}
    // The nav stays alive at rest (~9 particles/sec) and bursts during scroll.
    emissionDebt+=dt*(8.5+strength*57);
    while(emissionDebt>1){spawn(strength);emissionDebt--;}
    draw(now/1000,dt);
    frame=requestAnimationFrame(tick);
  }

  function start() {
    cancelAnimationFrame(frame);frame=0;
    fit();
    if(reduce.matches){
      canvas.style.display="none";
      nav.classList.remove("molecule-reacting");
      reacting=false;
      return;
    }
    canvas.style.display="block";
    lastTime=performance.now();
    if(!document.hidden)frame=requestAnimationFrame(tick);
  }

  let resizeQueued=false;
  function handleLayout() {
    if(resizeQueued)return;
    resizeQueued=true;
    requestAnimationFrame(()=>{resizeQueued=false;fit();});
  }
  function onScroll() {
    const delta=Math.abs(scrollY-lastScrollY);
    lastScrollY=scrollY;
    if(delta>0)boost=Math.min(1,Math.max(boost,delta/95)+.15);
    handleLayout();
  }

  nav.addEventListener("pointerenter",()=>{hover=true;});
  nav.addEventListener("pointerleave",()=>{hover=false;});
  window.addEventListener("scroll",onScroll,{passive:true});
  window.addEventListener("resize",handleLayout,{passive:true});
  if(typeof ResizeObserver!=="undefined")new ResizeObserver(handleLayout).observe(nav);
  document.addEventListener("visibilitychange",()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else start();});
  if(reduce.addEventListener)reduce.addEventListener("change",start);
  else reduce.addListener(start);
  window.addEventListener("pagehide",()=>cancelAnimationFrame(frame));
  start();
})();