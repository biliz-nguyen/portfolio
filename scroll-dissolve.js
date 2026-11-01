/**
 * Stardust Dissolve — scroll-aware content transition into the orbiting navbar.
 * Decorative only: the document structure and ordinary links stay untouched.
 */
(() => {
  "use strict";
  const header = document.querySelector("body.cosmic-site > header.nav");
  const main = document.querySelector("body.cosmic-site > main");
  if (!header || !main) return;

  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const regions = [main, document.querySelector("body.cosmic-site > footer")].filter(Boolean);
  const dustLayer = document.createElement("div");
  dustLayer.className = "stardust-layer";
  dustLayer.setAttribute("aria-hidden", "true");
  document.body.appendChild(dustLayer);

  let frameId = 0;
  let lastScrollY = window.scrollY;
  let lastBurstAt = 0;
  let screenReaderMotion = reduceMotion.matches;
  let dustCount = 0;

  const rand = (min, max) => min + Math.random() * (max - min);

  function findContact(edge) {
    // Only create particles when an actual content element is near the panel.
    const selectors = "h1,h2,h3,p,.field,.note-card,.telemetry,.hero-figure,.research-method,.search-bar,.prose pre,.prose blockquote";
    const hits = [];
    const bounds = header.getBoundingClientRect();
    main.querySelectorAll(selectors).forEach(node => {
      const box = node.getBoundingClientRect();
      if (box.bottom < edge - 8 || box.top > edge + 57 ||
          box.right < bounds.left || box.left > bounds.right ||
          box.width < 30 || box.height < 9) return;
      hits.push(box);
    });
    return hits;
  }

  function emitDust(edge, candidates) {
    if (!candidates.length || screenReaderMotion || window.innerWidth < 650 ||
        document.hidden || dustCount > 32) return;
    const region = candidates[Math.floor(Math.random() * candidates.length)];
    const left = Math.max(header.getBoundingClientRect().left + 15, region.left + 6);
    const right = Math.min(header.getBoundingClientRect().right - 15, region.right - 6);
    if (right <= left) return;

    for (let i = 0; i < 4 && dustCount < 36; i++) {
      const piece = document.createElement("span");
      piece.className = "stardust-pixel";
      const size = Math.random() > .70 ? 3 : 2;
      piece.style.width = size + "px";
      piece.style.height = size + "px";
      piece.style.left = rand(left, right).toFixed(1) + "px";
      piece.style.top = (edge + rand(9, 34)).toFixed(1) + "px";
      piece.style.setProperty("--drift-x", rand(-24, 24).toFixed(1) + "px");
      piece.style.setProperty("--drift-y", rand(-28, -52).toFixed(1) + "px");
      piece.style.setProperty("--dust-duration", rand(510, 880).toFixed(0) + "ms");
      piece.style.setProperty("--dust-color", Math.random() > .45 ? "#ccdcff" : "#83b6ff");
      dustLayer.appendChild(piece);
      dustCount++;
      piece.addEventListener("animationend", () => {
        piece.remove();
        dustCount = Math.max(0, dustCount - 1);
      }, {once: true});
    }
  }

  function update() {
    frameId = 0;
    const bounds = header.getBoundingClientRect();
    const edge = bounds.bottom;

    // Coordinates of the fixed panel edge expressed in each scrolling element.
    // A 68px fade erases glyphs/cards BEFORE they can touch the navbar.
    let anyContact = false;
    regions.forEach(region => {
      const rect = region.getBoundingClientRect();
      const localCut = edge - rect.top - 18;
      const active = localCut > -1 && rect.bottom > edge;
      region.classList.toggle("scroll-dissolving", active);
      if (active) {
        region.style.setProperty("--dissolve-cut", Math.round(localCut / 2) * 2 + "px");
        anyContact = true;
      } else {
        region.style.removeProperty("--dissolve-cut");
      }
    });

    const y = window.scrollY;
    const descending = y > lastScrollY + .4;
    lastScrollY = y;
    const now = performance.now();

    // The border blooms very subtly when content reaches the fade zone.
    const nearby = anyContact && y > 10 && main.getBoundingClientRect().bottom > edge;
    if (descending && nearby && !screenReaderMotion && now - lastBurstAt > 115) {
      const candidates = findContact(edge);
      if (candidates.length) {
        header.classList.add("stardust-contact");
        emitDust(edge, candidates);
        lastBurstAt = now;
      } else {
        header.classList.remove("stardust-contact");
      }
    } else if (!nearby || !descending) {
      header.classList.remove("stardust-contact");
    }
  }

  function schedule() {
    if (frameId) return;
    frameId = requestAnimationFrame(update);
  }

  window.addEventListener("scroll", schedule, {passive: true});
  window.addEventListener("resize", schedule, {passive: true});
  window.addEventListener("pageshow", schedule);
  const changeMotion = event => {
    screenReaderMotion = event.matches;
    if (screenReaderMotion) {
      dustLayer.replaceChildren();
      dustCount = 0;
      header.classList.remove("stardust-contact");
    }
    schedule();
  };
  if (reduceMotion.addEventListener) reduceMotion.addEventListener("change", changeMotion);
  else reduceMotion.addListener(changeMotion);

  update();
})();