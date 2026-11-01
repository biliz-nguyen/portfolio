/**
 * Pixel Meteor Shards — BILIZ Research Atlas
 * Broken meteor fragments form the edge of the navigation panel:
 * no CSS/SVG border and no continuously connected outline.
 * Scroll up => shards scatter and recollect; scroll down => gentler response.
 * A luminous pixel-energy current passes through the scattered rocks.
 */
(() => {
  "use strict";
  const nav = document.querySelector("body.cosmic-site > header.nav");
  if (!nav) return;

  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const canvas = document.createElement("canvas");
  canvas.className = "nav-shard-canvas";
  canvas.setAttribute("aria-hidden", "true");
  canvas.setAttribute("role", "presentation");
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d", {alpha:true});
  if (!ctx) { canvas.remove(); return; }

  const TAU = Math.PI * 2;
  const MARGIN = 48;
  const VERSION = 3;
  let width = 0, height = 0, radius = 20, perimeter = 1, scale = 1;
  let rect = null, shards = [], sparks = [], frame = 0;
  let lastTime = performance.now(), lastScroll = window.scrollY;
  let energy = 0, hover = false, streamDistance = 70;
  let lastRectX = NaN, lastRectY = NaN;

  // Consistent shard arrangement across visits and resize.
  function seededRandom(seed) {
    return () => {
      seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
      return seed / 4294967296;
    };
  }

  function borderPoint(distance) {
    let d = ((distance % perimeter) + perimeter) % perimeter;
    const horizontal = width - 2*radius;
    const vertical = height - 2*radius;
    const arc = Math.PI*radius/2;
    const curve = (cx,cy,angle)=>({
      x:cx + Math.cos(angle)*radius,
      y:cy + Math.sin(angle)*radius,
      nx:Math.cos(angle),ny:Math.sin(angle),
      tx:-Math.sin(angle),ty:Math.cos(angle)
    });
    if(d<horizontal) return {x:radius+d,y:0,nx:0,ny:-1,tx:1,ty:0};
    d-=horizontal;
    if(d<arc) return curve(width-radius,radius,-Math.PI/2+d/radius);
    d-=arc;
    if(d<vertical) return {x:width,y:radius+d,nx:1,ny:0,tx:0,ty:1};
    d-=vertical;
    if(d<arc) return curve(width-radius,height-radius,d/radius);
    d-=arc;
    if(d<horizontal) return {x:width-radius-d,y:height,nx:0,ny:1,tx:-1,ty:0};
    d-=horizontal;
    if(d<arc) return curve(radius,height-radius,Math.PI/2+d/radius);
    d-=arc;
    if(d<vertical) return {x:0,y:height-radius-d,nx:-1,ny:0,tx:0,ty:-1};
    d-=vertical;
    return curve(radius,radius,Math.PI+d/radius);
  }

  function generateShards() {
    const random = seededRandom(20261101 + VERSION);
    const count = Math.max(54, Math.min(130, Math.floor(perimeter/22)));
    shards = [];
    for(let i=0;i<count;i++) {
      const stagger = (random()-.5)*perimeter/count*.8;
      shards.push({
        distance:(i+.15)/count*perimeter+stagger,
        size:3+random()*4.2,
        length:4+random()*8,
        phase:random()*TAU,
        rotation:(random()-.5)*.45,
        scatter:.6+random()*1.3,
        shade:random(),
        glint:random()>.87
      });
    }
  }

  function placeCanvas() {
    const b = nav.getBoundingClientRect();
    rect = b;
    if(Math.abs(lastRectX-b.left)>.2 || Math.abs(lastRectY-b.top)>.2) {
      canvas.style.left = (b.left-MARGIN)+"px";
      canvas.style.top = (b.top-MARGIN)+"px";
      lastRectX=b.left;
      lastRectY=b.top;
    }
  }

  function fit() {
    placeCanvas();
    const w = Math.max(1,rect.width),h=Math.max(1,rect.height);
    const px = Math.min(window.devicePixelRatio||1,1.6);
    if(Math.abs(width-w)<.5 && Math.abs(height-h)<.5 && scale===px)return;
    width=w;height=h;scale=px;
    const computed = parseFloat(getComputedStyle(nav).borderTopLeftRadius)||20;
    radius = Math.max(8,Math.min(computed,width/2-2,height/2-2));
    perimeter=2*(width-2*radius)+2*(height-2*radius)+TAU*radius;
    canvas.width=Math.ceil((width+MARGIN*2)*scale);
    canvas.height=Math.ceil((height+MARGIN*2)*scale);
    canvas.style.width=(width+MARGIN*2)+"px";
    canvas.style.height=(height+MARGIN*2)+"px";
    ctx.setTransform(scale,0,0,scale,0,0);
    ctx.imageSmoothingEnabled=false;
    generateShards();
    sparks=[];
    streamDistance %= perimeter;
  }

  // Each rock is an irregular polygon made of sharply stepped pixel-like facets.
  function drawRock(shard,p,time,reaction) {
    const float = Math.sin(time*.65+shard.phase)*.7;
    const pop = reaction*(6+shard.scatter*10);
    const tangent = Math.cos(time*.8+shard.phase)*.55 + reaction*shard.scatter*4;
    const x = Math.round(p.x+p.nx*(2.5+float+pop)+p.tx*tangent+MARGIN);
    const y = Math.round(p.y+p.ny*(2.5+float+pop)+p.ty*tangent+MARGIN);
    const angle = Math.atan2(p.ty,p.tx)+shard.rotation+
      Math.sin(time*.6+shard.phase)*.065+reaction*(shard.scatter-.4)*.25;
    const len = shard.length, thick = shard.size;
    ctx.save();
    ctx.translate(x,y);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(Math.round(-len*.55),Math.round(-thick*.2));
    ctx.lineTo(Math.round(-len*.32),Math.round(-thick*.62));
    ctx.lineTo(Math.round(len*.37),Math.round(-thick*.58));
    ctx.lineTo(Math.round(len*.52),Math.round(-thick*.12));
    ctx.lineTo(Math.round(len*.17),Math.round(thick*.54));
    ctx.lineTo(Math.round(-len*.48),Math.round(thick*.46));
    ctx.closePath();
    const a = .19+shard.shade*.16+reaction*.19;
    ctx.fillStyle="rgba(108,138,191,"+a.toFixed(3)+")";
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(Math.round(-len*.34),Math.round(-thick*.62));
    ctx.lineTo(Math.round(len*.37),Math.round(-thick*.58));
    ctx.lineTo(Math.round(len*.17),Math.round(-thick*.12));
    ctx.lineTo(Math.round(-len*.42),Math.round(-thick*.08));
    ctx.closePath();
    ctx.fillStyle="rgba(165,195,243,"+(.09+reaction*.17).toFixed(3)+")";
    ctx.fill();
    if(shard.glint) {
      ctx.fillStyle="rgba(215,236,255,"+(.32+reaction*.25).toFixed(3)+")";
      ctx.fillRect(-1,-1,2,2);
    }
    ctx.restore();
  }

  function drawStream(time,reaction,dt) {
    streamDistance=(streamDistance+(104+reaction*135)*dt)%perimeter;
    const strength = .78+reaction*.22;
    // Dotted tail flows through the cracks; one bright comet-like head.
    for(let i=28;i>=0;i--) {
      const fade=1-i/29;
      const p=borderPoint(streamDistance-i*(6.5+reaction*3.4));
      const wave=Math.sin(time*4.1+i*.47)* (2.3+reaction*5);
      const x=p.x+p.nx*wave+MARGIN;
      const y=p.y+p.ny*wave+MARGIN;
      const alpha=(.025+fade*fade*.52)*strength;
      const size=i===0?5.4:1+fade*3.1;
      ctx.fillStyle="rgba(128,190,255,"+alpha.toFixed(3)+")";
      ctx.fillRect(Math.round(x-size/2),Math.round(y-size/2),size,size);
    }
    const point=borderPoint(streamDistance);
    const wave=Math.sin(time*4.1)*(2.3+reaction*5);
    const x=point.x+point.nx*wave+MARGIN,y=point.y+point.ny*wave+MARGIN;
    const halo=16+reaction*13;
    const g=ctx.createRadialGradient(x,y,0,x,y,halo);
    g.addColorStop(0,"rgba(248,253,255,.95)");
    g.addColorStop(.14,"rgba(211,237,255,.75)");
    g.addColorStop(.4,"rgba(114,173,255,"+(.28+reaction*.26).toFixed(3)+")");
    g.addColorStop(1,"rgba(85,156,255,0)");
    ctx.fillStyle=g;
    ctx.fillRect(x-halo,y-halo,halo*2,halo*2);
    ctx.fillStyle="#ffffff";
    ctx.fillRect(Math.round(x-2.5),Math.round(y-2.5),5,5);
  }

  function burst(impact) {
    if(motion.matches || !rect)return;
    const amount=impact>.65?11:5;
    const random=seededRandom(((performance.now()*1000)|0)>>>0);
    for(let i=0;i<amount && sparks.length<65;i++) {
      const origin=borderPoint(random()*perimeter);
      const speed=16+random()*48;
      sparks.push({
        x:origin.x+MARGIN,y:origin.y+MARGIN,
        vx:origin.nx*speed+(random()-.5)*24,
        vy:origin.ny*speed+(random()-.5)*24,
        size:1.3+random()*2.4,
        life:.4+random()*.65,
        age:0
      });
    }
  }

  function drawSparks(dt) {
    for(let i=sparks.length-1;i>=0;i--){
      const p=sparks[i];
      p.age+=dt;
      if(p.age>=p.life){sparks.splice(i,1);continue;}
      p.x+=p.vx*dt;p.y+=p.vy*dt;
      const fade=(1-p.age/p.life);
      ctx.fillStyle="rgba(164,206,255,"+(fade*.62).toFixed(3)+")";
      ctx.fillRect(Math.round(p.x),Math.round(p.y),p.size,p.size);
    }
  }

  function draw(now,dt) {
    ctx.clearRect(0,0,width+MARGIN*2,height+MARGIN*2);
    const time=now/1000;
    const reaction=Math.max(energy,hover?.12:0);
    for(const shard of shards){
      drawRock(shard,borderPoint(shard.distance),time,reaction);
    }
    drawStream(time,reaction,dt);
    drawSparks(dt);
  }

  function tick(now) {
    frame=0;
    if(document.hidden)return;
    const dt=Math.max(0,Math.min(.065,(now-lastTime)/1000));
    lastTime=now;
    energy*=Math.exp(-2.8*dt);
    placeCanvas();
    if(!motion.matches){
      draw(now,dt);
      frame=requestAnimationFrame(tick);
    }
  }

  function refresh() {
    cancelAnimationFrame(frame);
    frame=0;
    fit();
    lastTime=performance.now();
    ctx.clearRect(0,0,width+MARGIN*2,height+MARGIN*2);
    if(motion.matches) {
      // A calm static field when animation is disabled.
      for(const s of shards)drawRock(s,borderPoint(s.distance),0,0);
      return;
    }
    draw(lastTime,.016);
    if(!document.hidden)frame=requestAnimationFrame(tick);
  }

  function onScroll() {
    const now=window.scrollY;
    const dy=now-lastScroll;
    lastScroll=now;
    if(Math.abs(dy)>.4 && !motion.matches) {
      // Scroll up is dramatic; scroll down retains mild physical feedback.
      const sensitivity=dy<0?1:.28;
      const impulse=Math.min(1,Math.abs(dy)/65*sensitivity+(dy<0?.18:.045));
      energy=Math.min(1,Math.max(energy,impulse));
      if(dy<0 && impulse>.22)burst(impulse);
    }
    placeCanvas();
  }

  nav.addEventListener("pointerenter",()=>{hover=true;});
  nav.addEventListener("pointerleave",()=>{hover=false;});
  window.addEventListener("scroll",onScroll,{passive:true});
  window.addEventListener("resize",refresh,{passive:true});
  document.addEventListener("visibilitychange",refresh);
  window.addEventListener("pageshow",refresh);
  window.addEventListener("pagehide",()=>cancelAnimationFrame(frame));
  if(motion.addEventListener)motion.addEventListener("change",refresh);
  else motion.addListener(refresh);
  if(typeof ResizeObserver!=="undefined"){
    let timeout=0;
    new ResizeObserver(()=>{
      if(timeout)return;
      timeout=requestAnimationFrame(()=>{timeout=0;refresh();});
    }).observe(nav);
  }
  refresh();
})();