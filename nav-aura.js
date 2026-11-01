/**
 * BILIZ / Aurora Flux Navigation
 * Asymmetric photonic ribbons, optical interference and a moving energy comet.
 * Progressive enhancement; no change to page content or link behavior.
 */
(() => {
  "use strict";
  const nav = document.querySelector("body.cosmic-site > header.nav");
  if (!nav) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const canvas = document.createElement("canvas");
  canvas.className = "nav-aura-canvas";
  canvas.setAttribute("aria-hidden", "true");
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d", {alpha:true});
  if (!ctx) { canvas.remove(); return; }

  const MARGIN = 46;
  const TAU = Math.PI * 2;
  let w=0, h=0, r=20, perimeter=1, dpr=1, bounds=null;
  let oldX=NaN, oldY=NaN, frame=0, last=performance.now();
  let position=95, energy=0, hover=false, previousScroll=window.scrollY;

  function resize() {
    bounds=nav.getBoundingClientRect();
    const nw=Math.max(1,bounds.width), nh=Math.max(1,bounds.height);
    const scale=Math.min(window.devicePixelRatio||1,1.7);
    const changed=Math.abs(w-nw)>.5 || Math.abs(h-nh)>.5 || scale!==dpr;
    w=nw;h=nh;dpr=scale;
    const cssRadius=parseFloat(getComputedStyle(nav).borderTopLeftRadius)||20;
    r=Math.max(8,Math.min(cssRadius,w/2-2,h/2-2));
    perimeter=2*(w-2*r)+2*(h-2*r)+TAU*r;
    if(changed) {
      canvas.width=Math.ceil((w+MARGIN*2)*dpr);
      canvas.height=Math.ceil((h+MARGIN*2)*dpr);
      canvas.style.width=(w+MARGIN*2)+"px";
      canvas.style.height=(h+MARGIN*2)+"px";
      ctx.setTransform(dpr,0,0,dpr,0,0);
    }
    placeCanvas();
  }

  function placeCanvas() {
    const next=nav.getBoundingClientRect();
    bounds=next;
    // Explicit NaN check: without it, the first frame can render off-screen.
    if(!Number.isFinite(oldX) || !Number.isFinite(oldY) ||
       Math.abs(next.left-oldX)>.25 || Math.abs(next.top-oldY)>.25) {
      canvas.style.left=(next.left-MARGIN)+"px";
      canvas.style.top=(next.top-MARGIN)+"px";
      oldX=next.left;oldY=next.top;
    }
  }

  function perimeterPoint(distance) {
    let d=((distance%perimeter)+perimeter)%perimeter;
    const hx=w-2*r, vy=h-2*r, arc=Math.PI*r*.5;
    function turn(cx,cy,a) {
      return {x:cx+r*Math.cos(a),y:cy+r*Math.sin(a),
        nx:Math.cos(a),ny:Math.sin(a)};
    }
    if(d<hx) return {x:r+d,y:0,nx:0,ny:-1};
    d-=hx;
    if(d<arc) return turn(w-r,r,-Math.PI/2+d/r);
    d-=arc;
    if(d<vy) return {x:w,y:r+d,nx:1,ny:0};
    d-=vy;
    if(d<arc) return turn(w-r,h-r,d/r);
    d-=arc;
    if(d<hx) return {x:w-r-d,y:h,nx:0,ny:1};
    d-=hx;
    if(d<arc) return turn(r,h-r,Math.PI/2+d/r);
    d-=arc;
    if(d<vy) return {x:0,y:h-r-d,nx:-1,ny:0};
    d-=vy;
    return turn(r,r,Math.PI+d/r);
  }

  function wavePoint(distance,time,amp,phase=0) {
    const p=perimeterPoint(distance);
    const wave = amp * (
      .66*Math.sin(distance*.033-time*1.65+phase) +
      .34*Math.cos(distance*.019+time*1.25-phase*.5)
    );
    return {x:p.x+MARGIN+p.nx*wave,y:p.y+MARGIN+p.ny*wave};
  }

  // A luminous band with tapered opacity. The wavy motion is normal to the
  // panel boundary; each strand has its own speed and phase (optical interference).
  function drawRibbonSegment(config,time,boost) {
    const {start,span,amp,alpha,phase,drift,coreWidth,haloWidth,haloBlur} = config;
    const motion=(time*drift) % 1;
    const begin=(start+motion)*perimeter;
    const len=span*perimeter;
    const steps=Math.max(32,Math.ceil(len/5));

    // Broad diffused halo and narrow luminous filament.
    // Each subsegment tapers toward its ends, leaving true dark gaps.
    for(let layer=0;layer<2;layer++) {
      ctx.save();
      ctx.lineCap="round";
      ctx.lineJoin="round";
      ctx.lineWidth=layer===0?haloWidth+boost*1.8:coreWidth+boost*.55;
      ctx.shadowBlur=layer===0?haloBlur+boost*8:7+boost*5;
      ctx.shadowColor=layer===0?"rgba(73,139,255,.36)":"rgba(173,219,255,.28)";
      let prev=wavePoint(begin,time,amp+(layer===0?.65:0)+boost*3.3,phase+(layer===0?.12:0));
      for(let i=1;i<=steps;i++) {
        const s=i/steps;
        const p=wavePoint(begin+s*len,time,amp+(layer===0?.65:0)+boost*3.3,phase+(layer===0?.12:0));
        // Gentle fade-in/out prevents visible hard line endings.
        const envelope=Math.pow(Math.max(0,Math.sin(Math.PI*(s-.5/steps))),.72);
        const opacity=(layer===0?alpha*.32:alpha) * envelope+
          boost*(layer===0?.05:.12)*envelope;
        ctx.strokeStyle=layer===0?
          "rgba(75,146,255,"+opacity.toFixed(3)+")":
          "rgba(203,231,255,"+opacity.toFixed(3)+")";
        ctx.beginPath();
        ctx.moveTo(prev.x,prev.y);
        ctx.lineTo(p.x,p.y);
        ctx.stroke();
        prev=p;
      }
      ctx.restore();
    }
  }

  function ribbons(time,boost) {
    ctx.save();
    const bands=[
      // Deliberately different lengths, luminosities, speeds and curvature.
      {start:.015,span:.18,amp:4.8,alpha:.24,phase:.20,drift:.009,coreWidth:1.23,haloWidth:5.8,haloBlur:18},
      {start:.11,span:.34,amp:2.9,alpha:.11,phase:1.85,drift:-.004,coreWidth:.90,haloWidth:4.1,haloBlur:13},
      {start:.58,span:.16,amp:3.8,alpha:.16,phase:2.75,drift:.006,coreWidth:1.05,haloWidth:4.8,haloBlur:14},
      {start:.77,span:.15,amp:5.6,alpha:.24,phase:4.10,drift:-.008,coreWidth:1.33,haloWidth:6.2,haloBlur:19}
    ];
    for(const band of bands)drawRibbonSegment(band,time,boost);

    // Two faint interference lines do not follow a perfect parallel path.
    // They are intentionally short so the panel never becomes a rigid frame.
    ctx.lineCap="round";
    for(let k=0;k<2;k++) {
      const from=(k===0?.22:.64)*perimeter;
      const span=(k===0?.12:.085)*perimeter;
      ctx.beginPath();
      for(let i=0;i<=30;i++) {
        const s=i/30;
        const d=from+span*s;
        const p=wavePoint(d,time,1.6+boost*1.4,3.1+k);
        const drift=Math.sin(time*1.2+i*.28+k)*2.1;
        if(i===0)ctx.moveTo(p.x,p.y+drift);
        else ctx.lineTo(p.x,p.y+drift);
      }
      ctx.strokeStyle="rgba(141,190,255,"+(.045+boost*.065).toFixed(3)+")";
      ctx.lineWidth=.7;ctx.shadowBlur=5;
      ctx.shadowColor="rgba(115,176,255,.16)";
      ctx.stroke();
    }
    ctx.restore();
  }

  function energyStream(time,boost) {
    const step=5.2+boost*3.2;
    const length=28+Math.round(boost*14);
    ctx.save();
    ctx.globalCompositeOperation="lighter";
    for(let i=length;i>=0;i--) {
      const strength=1-i/(length+1);
      const p=wavePoint(position-i*step,time,5.0+boost*7.4,2.6);
      const alpha=(.04+.48*strength*strength)*(1+boost*.38);
      const sz=.8+strength*(3.6+boost*1.4);
      ctx.fillStyle="rgba(137,188,255,"+Math.min(1,alpha).toFixed(3)+")";
      ctx.beginPath();ctx.arc(p.x,p.y,sz,0,TAU);ctx.fill();
      if(i%3===0) {
        ctx.fillStyle="rgba(234,246,255,"+Math.min(.7,alpha*.68).toFixed(3)+")";
        ctx.fillRect(p.x-.6,p.y-.6,1.2,1.2);
      }
    }
    const p=wavePoint(position,time,5.0+boost*7.4,2.6);
    const halo=20+boost*14;
    const grad=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,halo);
    grad.addColorStop(0,"rgba(255,255,255,.99)");
    grad.addColorStop(.14,"rgba(218,237,255,.84)");
    grad.addColorStop(.37,"rgba(121,178,255,"+(.33+boost*.2).toFixed(3)+")");
    grad.addColorStop(1,"rgba(80,155,255,0)");
    ctx.fillStyle=grad;
    ctx.fillRect(p.x-halo,p.y-halo,halo*2,halo*2);
    ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(p.x,p.y,2.8+boost*1.0,0,TAU);ctx.fill();
    // Partial rings move out of phase, like an optical interference halo.
    for(let q=0;q<2;q++) {
      const ripple=8+q*7+Math.sin(time*2.2+q)*1.8;
      ctx.strokeStyle="rgba(171,215,255,"+(.065-q*.021+boost*.04).toFixed(3)+")";
      ctx.lineWidth=.9;
      ctx.beginPath();ctx.arc(p.x,p.y,ripple,.1,Math.PI*1.55);ctx.stroke();
    }
    ctx.restore();
  }

  function draw(time,boost) {
    ctx.clearRect(0,0,w+MARGIN*2,h+MARGIN*2);
    ribbons(time,boost);
    energyStream(time,boost);
  }

  function tick(now) {
    frame=0;
    if(document.hidden)return;
    const dt=Math.min(.07,Math.max(0,(now-last)/1000));
    // Cap the rendering rate at approximately 30fps on high refresh screens.
    if(now-last<30) {frame=requestAnimationFrame(tick);return;}
    last=now;
    energy*=Math.exp(-2.4*dt);
    const boost=Math.max(energy,hover?.12:0);
    position=(position+(114+boost*148)*dt)%perimeter;
    placeCanvas();
    draw(now/1000,boost);
    if(!reduce.matches) frame=requestAnimationFrame(tick);
  }

  function start() {
    cancelAnimationFrame(frame);frame=0;
    resize();last=performance.now();
    draw(last/1000,0);
    if(!reduce.matches && !document.hidden)frame=requestAnimationFrame(tick);
  }

  nav.addEventListener("pointerenter",()=>{hover=true;});
  nav.addEventListener("pointerleave",()=>{hover=false;});
  window.addEventListener("scroll",()=>{
    const current=window.scrollY,delta=Math.abs(current-previousScroll);
    previousScroll=current;
    if(!reduce.matches && delta>.4) energy=Math.min(1,Math.max(energy,delta/70)+.08);
    placeCanvas();
  },{passive:true});
  window.addEventListener("resize",start,{passive:true});
  document.addEventListener("visibilitychange",start);
  window.addEventListener("pageshow",start);
  window.addEventListener("pagehide",()=>cancelAnimationFrame(frame));
  if(reduce.addEventListener)reduce.addEventListener("change",start);
  else reduce.addListener(start);
  if(typeof ResizeObserver!=="undefined") {
    let task=0;
    new ResizeObserver(()=>{
      if(task)return;
      task=requestAnimationFrame(()=>{task=0;start();});
    }).observe(nav);
  }
  start();
})();