/**
 * Biliz Research Atlas — luminous navigation & page transitions.
 * Progressive enhancement: ordinary HTML links work even without JavaScript.
 * Accessible: pauses while hidden and respects prefers-reduced-motion.
 */
(() => {
  "use strict";
  const header = document.querySelector("body.cosmic-site > header.nav");
  const navigation = header?.querySelector("nav");
  if (!header || !navigation) return;

  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const active = navigation.querySelector('a[aria-current="page"]') ||
                 navigation.querySelector("a.active");

  // A tiny indicator moves to the clicked tab before the next document enters.
  const indicator = document.createElement("span");
  indicator.className = "nav-selection";
  indicator.setAttribute("aria-hidden", "true");
  navigation.appendChild(indicator);

  function placeIndicator(link) {
    if (!link) {
      indicator.hidden = true;
      return;
    }
    indicator.hidden = false;
    const parent = navigation.getBoundingClientRect();
    const rect = link.getBoundingClientRect();
    indicator.style.width = rect.width + "px";
    indicator.style.transform = "translate3d(" + (rect.left - parent.left) + "px,0,0)";
  }

  const light = document.createElement("span");
  light.className = "nav-orbit-light";
  light.setAttribute("aria-hidden", "true");
  header.appendChild(light);

  let headerWidth = 0, headerHeight = 0, r = 17, perimeter = 0;
  let lastPaint = 0, animationFrame = 0, animatedFrom = performance.now();

  function measure() {
    headerWidth = header.clientWidth;
    headerHeight = header.clientHeight;
    const cssRadius = parseFloat(getComputedStyle(header).borderTopLeftRadius) || 17;
    r = Math.max(5, Math.min(cssRadius, headerHeight / 2 - 2, headerWidth / 2 - 2));
    perimeter = Math.max(1, 2 * (headerWidth - 2 * r) +
                         2 * (headerHeight - 2 * r) + Math.PI * 2 * r);
    placeIndicator(active);
  }

  // Follow straight edges and four genuine circular corner arcs.
  // This keeps the dot exactly on the rounded panel border, even on mobile.
  function pointOnPerimeter(position) {
    let d = ((position % perimeter) + perimeter) % perimeter;
    const horizontal = headerWidth - 2 * r;
    const vertical = headerHeight - 2 * r;
    const arc = Math.PI * r / 2;
    const corner = (centerX, centerY, angle) => ({
      x: centerX + r * Math.cos(angle),
      y: centerY + r * Math.sin(angle),
      direction: angle + Math.PI / 2
    });
    if (d < horizontal) return {x: r + d, y: 1, direction: 0};
    d -= horizontal;
    if (d < arc) return corner(headerWidth - r - 1, r + 1, -Math.PI / 2 + d / r);
    d -= arc;
    if (d < vertical) return {x: headerWidth - 1, y: r + d, direction: Math.PI / 2};
    d -= vertical;
    if (d < arc) return corner(headerWidth - r - 1, headerHeight - r - 1, d / r);
    d -= arc;
    if (d < horizontal) return {x: headerWidth - r - d, y: headerHeight - 1, direction: Math.PI};
    d -= horizontal;
    if (d < arc) return corner(r + 1, headerHeight - r - 1, Math.PI / 2 + d / r);
    d -= arc;
    if (d < vertical) return {x: 1, y: headerHeight - r - d, direction: -Math.PI / 2};
    d -= vertical;
    return corner(r + 1, r + 1, Math.PI + d / r);
  }

  function paintLight(seconds) {
    if (!perimeter) return;
    // Approximately one circuit every 13–24 seconds depending on viewport width.
    const distance = seconds * 104;
    const p = pointOnPerimeter(distance);
    light.style.transform =
      "translate3d(" + (p.x - 4) + "px," + (p.y - 4) + "px,0) rotate(" +
      p.direction + "rad)";
  }

  function frame(now) {
    animationFrame = 0;
    if (motion.matches || document.hidden) return;
    if (now - lastPaint >= 24) {
      paintLight((now - animatedFrom) / 1000);
      lastPaint = now;
    }
    animationFrame = requestAnimationFrame(frame);
  }

  function syncMotion() {
    cancelAnimationFrame(animationFrame);
    animationFrame = 0;
    if (motion.matches) {
      light.hidden = true;
    } else {
      light.hidden = false;
      if (!document.hidden) animationFrame = requestAnimationFrame(frame);
    }
  }

  measure();
  paintLight(0);
  syncMotion();

  if (typeof ResizeObserver === "function") {
    const observer = new ResizeObserver(measure);
    observer.observe(header);
    observer.observe(navigation);
  } else {
    window.addEventListener("resize", measure, {passive: true});
  }
  if (motion.addEventListener) motion.addEventListener("change", syncMotion);
  else motion.addListener(syncMotion);
  document.addEventListener("visibilitychange", syncMotion);

  // Let the browser navigate immediately. The CSS cross-document View
  // Transitions API animates between pages in supported browsers.
  // Avoid delaying clicks or blurring a huge scrolling page in JavaScript.
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) measure();
  });

  window.addEventListener("pagehide", () => {
    cancelAnimationFrame(animationFrame);
    animationFrame = 0;
  });

  window.addEventListener("pageshow", () => {
    measure();
    syncMotion();
  });
})();
