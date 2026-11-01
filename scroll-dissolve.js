/**
 * Stardust Dissolve v2 — scroll content evaporates before reaching the navbar.
 * Lightweight, decorative, and independent of portfolio article content.
 */
(() => {
  "use strict";

  const header = document.querySelector("body.cosmic-site > header.nav");
  const main = document.querySelector("body.cosmic-site > main");
  if (!header || !main) return;

  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const dustLayer = document.createElement("div");
  dustLayer.className = "stardust-layer";
  dustLayer.setAttribute("aria-hidden", "true");

  const scanner = document.createElement("div");
  scanner.className = "stardust-scanner";
  dustLayer.appendChild(scanner);
  document.body.appendChild(dustLayer);

  const targets = [main, document.querySelector("body.cosmic-site > footer")].filter(Boolean);
  let scrollFrame = 0;
  let oldY = window.scrollY;
  let lastEmission = 0;
  let activeDust = 0;
  let isReduced = reduced.matches;

  function random(min, max) {
    return min + Math.random() * (max - min);
  }

  function selectContact(edge) {
    // A larger sampling zone makes the effect visible during normal scrolling.
    const selectors = "h1,h2,h3,p,.lead,.field,.note-card,.telemetry,.hero-figure,.research-method,.search-bar,.prose,.manifesto";
    const hits = [];
    const headerRect = header.getBoundingClientRect();
    const elements = main.querySelectorAll(selectors);
    for (const node of elements) {
      const box = node.getBoundingClientRect();
      if (box.bottom < edge - 80 || box.top > edge + 115 ||
          box.right < headerRect.left + 10 ||
          box.left > headerRect.right - 10 ||
          box.height < 12) continue;
      hits.push(box);
      if (hits.length >= 18) break;
    }
    return hits;
  }

  function createParticles(edge, contacts) {
    if (isReduced || document.hidden || activeDust > 70) return;
    const viewport = header.getBoundingClientRect();
    const narrow = window.innerWidth < 650;
    const total = narrow ? 3 : 8;
    for (let i = 0; i < total && activeDust < 75; i++) {
      const hit = contacts.length
        ? contacts[Math.floor(Math.random() * contacts.length)]
        : null;
      // If the scroll passes whitespace, keep only a few traces of stardust.
      if (!hit && i >= 2) break;
      const minX = Math.max(viewport.left + 18, hit ? hit.left : viewport.left + 35);
      const maxX = Math.min(viewport.right - 18, hit ? hit.right : viewport.right - 35);
      if (maxX <= minX) continue;
      const size = Math.random() < .28 ? 4 : (Math.random() < .53 ? 3 : 2);
      const pixel = document.createElement("span");
      pixel.className = "stardust-pixel";
      pixel.style.left = random(minX, maxX).toFixed(1) + "px";
      pixel.style.top = random(edge - 10, edge + 35).toFixed(1) + "px";
      pixel.style.width = size + "px";
      pixel.style.height = size + "px";
      pixel.style.setProperty("--drift-x", random(-40, 40).toFixed(1) + "px");
      pixel.style.setProperty("--drift-y", random(-46, -92).toFixed(1) + "px");
      pixel.style.setProperty("--dust-duration", random(670, 1100).toFixed(0) + "ms");
      pixel.style.setProperty("--dust-color", Math.random() < .30 ? "#ffffff" : Math.random() < .68 ? "#b1d0ff" : "#6aafff");
      dustLayer.appendChild(pixel);
      activeDust++;
      pixel.addEventListener("animationend", () => {
        pixel.remove();
        activeDust = Math.max(0, activeDust - 1);
      }, {once: true});
    }
  }

  function render() {
    scrollFrame = 0;
    const panel = header.getBoundingClientRect();
    const edge = panel.bottom;
    const scrolled = window.scrollY;
    const descending = scrolled > oldY + .5;
    const scrolling = Math.abs(scrolled - oldY) > .5;
    oldY = scrolled;

    // Use plain pixel stops for reliable -webkit-mask-image and mask-image.
    // Text is invisible through the panel, then returns gradually below it.
    let overlapsContent = false;
    for (const region of targets) {
      const rect = region.getBoundingClientRect();
      const overlaps = rect.top < edge + 110 && rect.bottom > edge + 10;
      region.classList.toggle("scroll-dissolving", overlaps);
      if (overlaps) {
        const start = Math.max(0, edge + 12 - rect.top);
        const end = Math.max(start + 65, edge + 82 - rect.top);
        region.style.setProperty("--dissolve-start", start.toFixed(0) + "px");
        region.style.setProperty("--dissolve-end", end.toFixed(0) + "px");
        overlapsContent = true;
      } else {
        region.style.removeProperty("--dissolve-start");
        region.style.removeProperty("--dissolve-end");
      }
    }

    scanner.style.left = (panel.left + 20).toFixed(0) + "px";
    scanner.style.width = Math.max(0, panel.width - 40).toFixed(0) + "px";
    scanner.style.top = (edge - 2).toFixed(0) + "px";

    // Visible whenever scrolling under the sticky bar, stronger at contact.
    const enabled = scrolled > 28 && overlapsContent;
    scanner.classList.toggle("active", enabled && !isReduced);
    const now = performance.now();
    if (enabled && !isReduced && scrolling) {
      header.classList.add("stardust-contact");
      if (descending && now - lastEmission > 65) {
        createParticles(edge, selectContact(edge));
        lastEmission = now;
      }
    } else {
      header.classList.remove("stardust-contact");
    }
    if (isReduced) header.classList.remove("stardust-contact");
  }

  function schedule() {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(render);
  }

  function changeMotion(event) {
    isReduced = event.matches;
    if (isReduced) {
      dustLayer.querySelectorAll(".stardust-pixel").forEach(el => el.remove());
      activeDust = 0;
    }
    schedule();
  }

  window.addEventListener("scroll", schedule, {passive: true});
  window.addEventListener("resize", schedule, {passive: true});
  window.addEventListener("pageshow", schedule);
  document.addEventListener("visibilitychange", schedule);
  if (reduced.addEventListener) reduced.addEventListener("change", changeMotion);
  else reduced.addListener(changeMotion);
  render();
})();