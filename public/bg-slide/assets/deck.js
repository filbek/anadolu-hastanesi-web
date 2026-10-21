(() => {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private mode */ } }
  };
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const stage = $("#stage");
  const slides = $$(".slide", stage);
  const N = slides.length;
  let cur = -1;
  let lang = "tr";

  /* ---------------- stage scaling ---------------- */
  function fit() {
    const s = Math.min(innerWidth / 1920, innerHeight / 1080);
    document.documentElement.style.setProperty("--s", s);
    stage.style.setProperty("--s", s);
  }
  addEventListener("resize", fit);
  fit();

  /* ---------------- icons ---------------- */
  if (window.lucide) lucide.createIcons();

  /* ---------------- split text ---------------- */
  function splitEl(el) {
    const frag = document.createDocumentFragment();
    const pushWords = (text, cls) => {
      text.split(/(\s+)/).forEach(tok => {
        if (!tok) return;
        if (/^\s+$/.test(tok)) { frag.appendChild(document.createTextNode(" ")); return; }
        // keep stray punctuation (closing quotes etc.) glued to the previous word
        const last = frag.lastChild;
        if (/^[\p{P}]+$/u.test(tok) && last && last.className === "w") { last.firstChild.textContent += tok; return; }
        const w = document.createElement("span"); w.className = "w";
        const inner = document.createElement("span"); inner.textContent = tok;
        if (cls) inner.className = cls;
        w.appendChild(inner); frag.appendChild(w);
      });
    };
    el.childNodes.forEach(n => {
      if (n.nodeType === 3) pushWords(n.textContent, "");
      else if (n.nodeName === "BR") frag.appendChild(document.createElement("br"));
      else pushWords(n.textContent, n.className);
    });
    el.innerHTML = "";
    el.appendChild(frag);
    $$(".w > span", el).forEach((s, i) => s.style.setProperty("--wi", i));
  }

  function indexSlide(slide) {
    $$("[data-a]", slide).forEach((el, i) => el.style.setProperty("--i", i));
    $$(".split", slide).forEach(el => {
      // start words a touch after the element's own slot in the sequence
      const prev = $$("[data-a]", slide).filter(a => a.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING).length;
      el.style.setProperty("--sd", (prev * 85 + 320) + "ms");
    });
  }

  /* ---------------- number formatting & counters ---------------- */
  const SEP = { tr: ".", bg: " ", en: "," };
  const fmt = (v, plain) => plain ? String(v) : String(v).replace(/\B(?=(\d{3})+(?!\d))/g, SEP[lang]);
  const counters = $$("[data-count]");
  counters.forEach(el => { el._target = +el.dataset.count; el._plain = el.hasAttribute("data-plain"); });

  function setFinal(el) { el.textContent = fmt(el._target, el._plain); }
  function runCounters(slide) {
    $$("[data-count]", slide).forEach(el => {
      cancelAnimationFrame(el._raf);
      const host = el.closest("[data-a]");
      const delay = host ? (parseFloat(host.style.getPropertyValue("--i")) || 0) * 85 + 450 : 450;
      const from = el._plain ? el._target - 45 : 0;
      const dur = 2000;
      if (reduced) { setFinal(el); return; }
      el.textContent = fmt(from, el._plain);
      const t0 = performance.now() + delay;
      const tick = now => {
        const p = Math.min(1, Math.max(0, (now - t0) / dur));
        const e = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
        el.textContent = fmt(Math.round(from + (el._target - from) * e), el._plain);
        if (p < 1) el._raf = requestAnimationFrame(tick);
      };
      el._raf = requestAnimationFrame(tick);
    });
  }

  /* ---------------- i18n ---------------- */
  const i18nEls = $$("[data-i18n]");
  i18nEls.forEach(el => { el._tr = el.innerHTML; });
  slides.forEach(s => { s._trSection = s.dataset.section || ""; });
  const T = (k, fallback) => (lang === "tr" ? (window.I18N_TR_MAP || {})[k] : ((window.I18N || {})[lang] || {})[k]) || fallback;

  function applyLang(l) {
    lang = l;
    document.documentElement.lang = l;
    const dict = (window.I18N || {})[l] || {};
    i18nEls.forEach(el => {
      const html = l === "tr" ? el._tr : (dict[el.dataset.i18n] ?? el._tr);
      el.innerHTML = html;
      if (el.classList.contains("split")) splitEl(el);
    });
    slides.forEach(s => {
      const k = s.dataset.i18nSection;
      s._section = l === "tr" || !k ? s._trSection : (dict[k] || s._trSection);
    });
    counters.forEach(el => { if (!el._raf || !slides[cur] || !slides[cur].contains(el)) setFinal(el); });
    $$("#langs button").forEach(b => b.classList.toggle("on", b.dataset.lang === l));
    $$("[data-map-label]").forEach(t => { t.textContent = T(t.dataset.mapLabel, t.textContent); });
    if (cur >= 0) $("#hudSection").textContent = slides[cur]._section;
    store.set("deck-lang", l);
  }

  /* ---------------- navigation ---------------- */
  const hooks = { enter: new Map(), leave: new Map() };
  const onEnter = (sel, fn) => $$(sel).forEach(s => hooks.enter.set(s, fn));
  const onLeave = (sel, fn) => $$(sel).forEach(s => hooks.leave.set(s, fn));
  const pad = n => String(n).padStart(2, "0");

  function go(n, opts = {}) {
    n = Math.max(0, Math.min(N - 1, n));
    if (n === cur && !opts.force) return;
    const prev = slides[cur];
    if (prev) {
      prev.classList.remove("is-active");
      const lv = hooks.leave.get(prev); if (lv) lv(prev);
      $$("video", prev).forEach(v => setTimeout(() => v.pause(), 900));
    }
    slides.forEach((s, i) => s.classList.toggle("is-past", i < n));
    cur = n;
    const s = slides[n];
    // force restart of transitions
    void s.offsetWidth;
    s.classList.add("is-active");
    $$("video", s).forEach(v => { try { v.currentTime = 0; } catch (e) {} const p = v.play(); if (p) p.catch(() => {}); });
    runCounters(s);
    const en = hooks.enter.get(s); if (en) en(s);

    document.body.classList.toggle("hud-min", s.dataset.hud === "min");
    $("#hudNow").textContent = pad(n + 1);
    $("#hudSection").textContent = s._section || "";
    $("#progress").style.width = ((n + 1) / N * 100) + "%";
    if (prev && !reduced) { const sw = $("#sweep"); sw.classList.remove("go"); void sw.offsetWidth; sw.classList.add("go"); }
    history.replaceState(null, "", "#" + (n + 1));
  }
  const next = () => go(cur + 1);
  const prevS = () => go(cur - 1);

  /* ---------------- overview ---------------- */
  function layoutOverview() {
    const cols = 5, sc = .18, w = 1920 * sc, h = 1080 * sc, gx = 30, gy = 34;
    const rows = Math.ceil(N / cols);
    const x0 = (1920 - (cols * w + (cols - 1) * gx)) / 2, y0 = (1080 - (rows * h + (rows - 1) * gy)) / 2;
    slides.forEach((s, i) => {
      s.style.setProperty("--ox", (x0 + (i % cols) * (w + gx)) + "px");
      s.style.setProperty("--oy", (y0 + Math.floor(i / cols) * (h + gy)) + "px");
    });
  }
  function toggleOverview(on) {
    const want = on ?? !document.body.classList.contains("overview");
    layoutOverview();
    document.body.classList.toggle("overview", want);
  }
  slides.forEach((s, i) => s.addEventListener("click", e => {
    if (!document.body.classList.contains("overview")) return;
    e.stopPropagation(); toggleOverview(false); go(i, { force: true });
  }));

  /* ---------------- input ---------------- */
  addEventListener("keydown", e => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const k = e.key;
    if (document.body.classList.contains("is-black") && k !== "b" && k !== "B" && k !== ".") {
      document.body.classList.remove("is-black");
    }
    switch (k) {
      case "ArrowRight": case "ArrowDown": case "PageDown": case " ": case "Enter": e.preventDefault(); next(); break;
      case "ArrowLeft": case "ArrowUp": case "PageUp": case "Backspace": e.preventDefault(); prevS(); break;
      case "Home": go(0); break;
      case "End": go(N - 1); break;
      case "f": case "F": case "F5":
        e.preventDefault();
        if (!document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => {});
        else document.exitFullscreen?.();
        break;
      case "o": case "O": toggleOverview(); break;
      case "Escape": toggleOverview(false); $("#help").classList.remove("on"); break;
      case "b": case "B": case ".": document.body.classList.toggle("is-black"); break;
      case "l": case "L": { const L = ["tr", "bg", "en"]; applyLang(L[(L.indexOf(lang) + 1) % L.length]); break; }
      case "h": case "H": case "?": $("#help").classList.toggle("on"); break;
      default:
        if (/^[1-9]$/.test(k) && e.shiftKey === false && document.body.classList.contains("overview")) go(+k - 1);
    }
  });
  $$("#langs button").forEach(b => b.addEventListener("click", e => { e.stopPropagation(); applyLang(b.dataset.lang); }));

  stage.addEventListener("click", e => {
    if (document.body.classList.contains("overview")) return;
    if (e.target.closest("button, a")) return;
    (e.clientX < innerWidth * .25 ? prevS : next)();
  });

  let wheelLock = 0;
  addEventListener("wheel", e => {
    if (document.body.classList.contains("overview")) return;
    const now = Date.now();
    if (now < wheelLock || Math.abs(e.deltaY) < 30) return;
    wheelLock = now + 1100;
    (e.deltaY > 0 ? next : prevS)();
  }, { passive: true });

  let tx = null;
  addEventListener("touchstart", e => { tx = e.touches[0].clientX; }, { passive: true });
  addEventListener("touchend", e => {
    if (tx === null) return;
    const dx = e.changedTouches[0].clientX - tx; tx = null;
    if (Math.abs(dx) > 50) (dx < 0 ? next : prevS)();
  });

  let idle;
  addEventListener("mousemove", e => {
    document.body.classList.remove("hide-cursor");
    clearTimeout(idle); idle = setTimeout(() => document.body.classList.add("hide-cursor"), 2200);
    const c = e.target.closest && e.target.closest(".card");
    if (c) { const r = c.getBoundingClientRect(); c.style.setProperty("--mx", ((e.clientX - r.left) / r.width * 100) + "%"); }
  });

  /* ---------------- ambient background ---------------- */
  const amb = $("#ambient"), ac = amb.getContext("2d");
  const blobs = [
    { c: [227, 32, 42], a: .30, r: .55, x: .15, y: .2, sx: .07, sy: .05, p: 0 },
    { c: [40, 60, 160], a: .35, r: .7, x: .85, y: .8, sx: .05, sy: .07, p: 2 },
    { c: [143, 13, 19], a: .30, r: .5, x: .8, y: .1, sx: .06, sy: .04, p: 4 },
    { c: [0, 160, 116], a: .0, r: .45, x: .25, y: .9, sx: .05, sy: .05, p: 1 }
  ];
  let greenTarget = 0;
  const dust = Array.from({ length: 70 }, () => ({ x: Math.random(), y: Math.random(), r: Math.random() * 1.6 + .4, v: Math.random() * .00012 + .00004, a: Math.random() * .5 + .1 }));
  function sizeAmb() { amb.width = Math.round(innerWidth / 2); amb.height = Math.round(innerHeight / 2); }
  addEventListener("resize", sizeAmb); sizeAmb();
  function ambient(t) {
    const W = amb.width, H = amb.height, m = Math.max(W, H);
    ac.globalCompositeOperation = "source-over";
    ac.fillStyle = "#05080f"; ac.fillRect(0, 0, W, H);
    ac.globalCompositeOperation = "lighter";
    blobs[3].a += (greenTarget - blobs[3].a) * .02;
    const s = t * .001;
    for (const b of blobs) {
      if (b.a < .005) continue;
      const x = (b.x + Math.sin(s * .2 + b.p) * b.sx * 2) * W, y = (b.y + Math.cos(s * .17 + b.p) * b.sy * 2) * H;
      const g = ac.createRadialGradient(x, y, 0, x, y, b.r * m);
      g.addColorStop(0, `rgba(${b.c},${b.a})`); g.addColorStop(1, `rgba(${b.c},0)`);
      ac.fillStyle = g; ac.fillRect(0, 0, W, H);
    }
    ac.globalCompositeOperation = "source-over";
    for (const d of dust) {
      d.y -= d.v * 16; if (d.y < -.02) { d.y = 1.02; d.x = Math.random(); }
      ac.fillStyle = `rgba(255,220,220,${d.a * (.6 + .4 * Math.sin(s + d.x * 20))})`;
      ac.beginPath(); ac.arc(d.x * W + Math.sin(s * .3 + d.y * 8) * 10, d.y * H, d.r, 0, 6.283); ac.fill();
    }
    requestAnimationFrame(ambient);
  }
  requestAnimationFrame(ambient);

  /* ---------------- map ---------------- */
  const MD = window.MAP_DATA;
  const mapEl = $("#map");
  let mapAnim = null;
  if (MD && mapEl) {
    const W = MD.w, H = MD.h, KX = W / 12, KY = H / 5.4;
    const P = (lon, lat) => [(lon - 21.2) * KX, (44.6 - lat) * KY];
    const cv = document.createElement("canvas");
    cv.width = 2160; cv.height = Math.round(2160 * H / W);
    mapEl.appendChild(cv);
    const g = cv.getContext("2d"), k = cv.width / W;
    const hs = ["silivri", "avcilar", "canakkale", "eregli"].map(n => MD.cities[n]);
    const origin = MD.cities.silivri;
    const dots = MD.dots.map(([x, y, c]) => {
      let near = 1e9; for (const h of hs) near = Math.min(near, Math.hypot(x - h[0], y - h[1]));
      return { x, y, c, d: Math.hypot(x - origin[0], y - origin[1]), heat: Math.max(0, 1 - near / 60) };
    });
    const maxD = Math.max(...dots.map(d => d.d));
    function drawMap(p) {
      g.clearRect(0, 0, cv.width, cv.height);
      for (const d of dots) {
        const local = Math.min(1, Math.max(0, (p * (maxD + 160) - d.d) / 160));
        if (local <= 0) continue;
        let col;
        if (d.c === "bg") col = `rgba(0,200,145,${.62 * local})`;
        else if (d.c === "tr") col = d.heat > 0 ? `rgba(255,${Math.round(255 - 190 * d.heat)},${Math.round(255 - 185 * d.heat)},${(.3 + .55 * d.heat) * local})` : `rgba(255,255,255,${.26 * local})`;
        else col = `rgba(160,175,210,${.09 * local})`;
        g.fillStyle = col;
        g.beginPath(); g.arc(d.x * k, d.y * k, (2.4 + d.heat * 1.2) * k * (.5 + .5 * local), 0, 6.283); g.fill();
      }
    }
    drawMap(1);

    const C = MD.cities, ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    const sofia = C.sofia, sil = C.silivri;
    const routeD = `M${sofia[0]},${sofia[1]} C${C.plovdiv[0]},${C.plovdiv[1] - 70} ${C.edirne[0] - 30},${C.edirne[1] - 70} ${sil[0]},${sil[1]}`;
    const lbl = (x, y, key, cls, size, anchor = "middle") =>
      `<text x="${x}" y="${y}" class="${cls}" font-size="${size}" text-anchor="${anchor}" data-map-label="${key}">${T(key, "")}</text>`;
    const city = (n, dx, dy, anchor) => `<circle cx="${C[n][0]}" cy="${C[n][1]}" r="4" fill="#cfe9df"/>` + lbl(C[n][0] + dx, C[n][1] + dy, "map." + n, "city", 15, anchor);
    const marker = (n, big, dx, dy, anchor) => `<g class="marker"><circle class="pulse" cx="${C[n][0]}" cy="${C[n][1]}" r="${big ? 12 : 8}"/><circle class="core" cx="${C[n][0]}" cy="${C[n][1]}" r="${big ? 8 : 5.5}"/>${big ? `<circle cx="${C[n][0]}" cy="${C[n][1]}" r="3" fill="#fff"/>` : ""}</g>` +
      lbl(C[n][0] + dx, C[n][1] + dy, "map." + n, "hlabel" + (big ? " big" : ""), big ? 20 : 15, anchor);
    const bgL = P(25.5, 43.45), trL = P(31.2, 40.35), seaL = P(30.2, 43.35), mmL = P(27.9, 40.62), aeL = P(24.6, 39.55);
    svg.innerHTML = `
      <defs><linearGradient id="routeGrad" x1="0" x2="1"><stop offset="0" stop-color="#2fe0aa"/><stop offset="1" stop-color="#ff4049"/></linearGradient></defs>
      ${lbl(bgL[0], bgL[1], "map.bg", "lbl bg", 34)}
      ${lbl(trL[0], trL[1], "map.tr", "lbl", 40)}
      ${lbl(seaL[0], seaL[1], "map.sea", "sea", 26)}
      ${lbl(mmL[0], mmL[1], "map.marmara", "sea", 15)}
      ${lbl(aeL[0], aeL[1], "map.aegean", "sea", 18)}
      <path d="${routeD}" class="route route-draw" stroke-linecap="round" style="stroke-dasharray:1400"/>
      <circle r="6" fill="#fff" style="filter:drop-shadow(0 0 8px #ff4049)"><animateMotion dur="3.6s" repeatCount="indefinite" path="${routeD}" keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines=".6 0 .3 1"/></circle>
      ${city("sofia", 0, -16)}${city("plovdiv", 0, 26)}${city("varna", 12, 5, "start")}${city("burgas", 12, 5, "start")}${city("edirne", -12, 5, "end")}
      ${marker("avcilar", false, 14, 18, "start")}
      ${marker("canakkale", false, 14, 5, "start")}
      ${marker("eregli", false, 0, -18)}
      ${marker("silivri", true, -6, -24, "middle")}
    `;
    mapEl.appendChild(svg);

    mapAnim = {
      start() {
        if (reduced) { drawMap(1); return; }
        const t0 = performance.now() + 500;
        cancelAnimationFrame(this.raf);
        drawMap(0);
        const tick = now => {
          const p = Math.min(1, Math.max(0, (now - t0) / 2200));
          drawMap(1 - Math.pow(1 - p, 3));
          if (p < 1) this.raf = requestAnimationFrame(tick);
        };
        this.raf = requestAnimationFrame(tick);
      },
      stop() { cancelAnimationFrame(this.raf); }
    };
    onEnter(".s-network", () => mapAnim.start());
    onLeave(".s-network", () => mapAnim.stop());
  }

  /* ---------------- globe ---------------- */
  const GD = window.GLOBE_DOTS, gcv = $("#globe");
  if (GD && gcv) {
    const g = gcv.getContext("2d");
    const S = gcv.width, cx = S / 2, cy = S / 2, R = S * .43;
    const rad = Math.PI / 180;
    const pts = [];
    for (let i = 0; i < GD.length; i += 3) pts.push({ la: GD[i] * rad, lo: GD[i + 1] * rad, tag: GD[i + 2] });
    const IST = [41.0, 29.0];
    const origins = [[42.7, 23.3, 1], [44.4, 26.1], [51.5, -0.1], [52.5, 13.4], [55.75, 37.6], [40.4, 49.9], [25.2, 55.3], [24.7, 46.7], [32.9, 13.2],
      [50.45, 30.5], [52.37, 4.9], [41.7, 44.8], [43.24, 76.9], [33.3, 44.4], [48.85, 2.35], [59.33, 18.07], [42.0, 21.43], [47.5, 19.05], [36.8, 10.2], [30.0, 31.2]];
    let run = false, raf = 0, t0 = 0;
    const tilt = 34 * rad;
    function proj(la, lo, lon0, alt = 1) {
      const x = Math.cos(la) * Math.sin(lo - lon0), y = Math.sin(la), z = Math.cos(la) * Math.cos(lo - lon0);
      const y2 = y * Math.cos(tilt) - z * Math.sin(tilt), z2 = y * Math.sin(tilt) + z * Math.cos(tilt);
      return [cx + R * alt * x, cy - R * alt * y2, z2];
    }
    function slerp(a, b, t) {
      const va = [Math.cos(a[0]) * Math.cos(a[1]), Math.cos(a[0]) * Math.sin(a[1]), Math.sin(a[0])];
      const vb = [Math.cos(b[0]) * Math.cos(b[1]), Math.cos(b[0]) * Math.sin(b[1]), Math.sin(b[0])];
      const d = Math.acos(Math.min(1, va[0] * vb[0] + va[1] * vb[1] + va[2] * vb[2]));
      const sa = Math.sin((1 - t) * d) / Math.sin(d), sb = Math.sin(t * d) / Math.sin(d);
      const v = [sa * va[0] + sb * vb[0], sa * va[1] + sb * vb[1], sa * va[2] + sb * vb[2]];
      return [Math.asin(v[2]), Math.atan2(v[1], v[0])];
    }
    const arcs = origins.map((o, i) => {
      const a = [o[0] * rad, o[1] * rad], b = [IST[0] * rad, IST[1] * rad];
      const path = Array.from({ length: 48 }, (_, k) => slerp(a, b, k / 47));
      return { path, home: !!o[2], off: i * .37, dur: 2.6 + (i % 4) * .3 };
    });
    function frame(now) {
      const t = (now - t0) / 1000;
      const lon0 = (IST[1] - 8 + Math.sin(t * .12) * 26) * rad;
      g.clearRect(0, 0, S, S);
      const halo = g.createRadialGradient(cx, cy, R * .6, cx, cy, R * 1.25);
      halo.addColorStop(0, "rgba(227,32,42,0)"); halo.addColorStop(.75, "rgba(227,32,42,.10)"); halo.addColorStop(1, "rgba(227,32,42,0)");
      g.fillStyle = halo; g.fillRect(0, 0, S, S);
      const body = g.createRadialGradient(cx - R * .35, cy - R * .4, R * .1, cx, cy, R);
      body.addColorStop(0, "rgba(40,55,110,.55)"); body.addColorStop(1, "rgba(8,12,28,.9)");
      g.fillStyle = body; g.beginPath(); g.arc(cx, cy, R, 0, 6.283); g.fill();
      g.strokeStyle = "rgba(255,255,255,.08)"; g.lineWidth = 2; g.stroke();
      for (const p of pts) {
        const [x, y, z] = proj(p.la, p.lo, lon0);
        if (z <= 0) continue;
        const a = .15 + .7 * z;
        g.fillStyle = p.tag === 1 ? `rgba(0,220,160,${a})` : p.tag === 2 ? `rgba(255,70,78,${a})` : `rgba(210,220,245,${a * .55})`;
        g.beginPath(); g.arc(x, y, (p.tag ? 4.2 : 3.2) * (.5 + .5 * z), 0, 6.283); g.fill();
      }
      for (const A of arcs) {
        const cyc = ((t + A.off * 3) % (A.dur + 1.2)) / A.dur;
        if (cyc > 1.4) continue;
        const head = Math.min(1, cyc), tail = Math.max(0, cyc - .45);
        const n = A.path.length - 1;
        g.lineWidth = A.home ? 5 : 3;
        g.lineCap = "round";
        let last = null;
        for (let k = Math.floor(tail * n); k <= Math.floor(head * n); k++) {
          const f = k / n, alt = 1 + .22 * Math.sin(Math.PI * f);
          const [x, y, z] = proj(A.path[k][0], A.path[k][1], lon0, alt);
          if (last && z > -.15) {
            const fade = (f - tail) / Math.max(.001, head - tail);
            g.strokeStyle = A.home ? `rgba(80,255,190,${.9 * fade})` : `rgba(255,90,98,${.85 * fade})`;
            g.beginPath(); g.moveTo(last[0], last[1]); g.lineTo(x, y); g.stroke();
          }
          last = [x, y, z];
        }
        if (last && cyc < 1 && last[2] > -.15) {
          g.fillStyle = "#fff"; g.shadowColor = A.home ? "#3effc0" : "#ff4049"; g.shadowBlur = 24;
          g.beginPath(); g.arc(last[0], last[1], A.home ? 7 : 5, 0, 6.283); g.fill(); g.shadowBlur = 0;
        }
      }
      const [ix, iy, iz] = proj(IST[0] * rad, IST[1] * rad, lon0);
      if (iz > 0) {
        const pulse = (t % 1.6) / 1.6;
        g.strokeStyle = `rgba(255,64,73,${1 - pulse})`; g.lineWidth = 3;
        g.beginPath(); g.arc(ix, iy, 10 + pulse * 46, 0, 6.283); g.stroke();
        g.fillStyle = "#fff"; g.shadowColor = "#ff4049"; g.shadowBlur = 30;
        g.beginPath(); g.arc(ix, iy, 9, 0, 6.283); g.fill(); g.shadowBlur = 0;
      }
      if (run) raf = requestAnimationFrame(frame);
    }
    t0 = performance.now();
    frame(t0);
    onEnter(".s-tourism", () => { if (!run) { run = true; raf = requestAnimationFrame(frame); } });
    onLeave(".s-tourism", () => { setTimeout(() => { run = false; cancelAnimationFrame(raf); }, 900); });
  }

  /* ---------------- friendship opener: two flags waving out from a shared centre ---------------- */
  const fcv = $("#flags");
  if (fcv) {
    const g = fcv.getContext("2d");
    const FH = 380, TOP = 120, CX = 960;
    function makeFlag(kind) {
      const w = kind === "bg" ? Math.round(FH * 5 / 3) : Math.round(FH * 1.5);
      const c = document.createElement("canvas"); c.width = w; c.height = FH;
      const x = c.getContext("2d");
      if (kind === "bg") {
        [["#ffffff", 0], ["#00966E", 1], ["#D62612", 2]].forEach(([col, i]) => { x.fillStyle = col; x.fillRect(0, i * FH / 3, w, FH / 3 + 1); });
      } else {
        // same geometry as the #flag-tr symbol (30 × 20 units)
        const k = FH / 20;
        x.fillStyle = "#E30A17"; x.fillRect(0, 0, w, FH);
        x.fillStyle = "#fff"; x.beginPath(); x.arc(10.5 * k, 10 * k, 5 * k, 0, 6.283); x.fill();
        x.fillStyle = "#E30A17"; x.beginPath(); x.arc(11.75 * k, 10 * k, 4 * k, 0, 6.283); x.fill();
        const star = [14.3, 10, 15.72, 9.51, 15.75, 8, 16.66, 9.2, 18.1, 8.77, 17.24, 10, 18.1, 11.23, 16.66, 10.8, 15.75, 12, 15.72, 10.49];
        x.fillStyle = "#fff"; x.beginPath();
        for (let i = 0; i < star.length; i += 2) x[i ? "lineTo" : "moveTo"](star[i] * k, star[i + 1] * k);
        x.closePath(); x.fill();
      }
      return c;
    }
    // hoists sit at the centre; Bulgaria flies left (its stripes are mirror-symmetric), Türkiye flies right in its true orientation
    const flags = [{ img: makeFlag("bg"), hoist: CX - 14, dir: -1, ph: 0 }, { img: makeFlag("tr"), hoist: CX + 14, dir: 1, ph: .9 }];
    let run = false, raf = 0;
    // each flag is rendered opaque into its own buffer, then faded at the fly end with a gradient mask (no slice seams)
    const buf = document.createElement("canvas"); buf.width = fcv.width; buf.height = fcv.height;
    const b = buf.getContext("2d");
    function draw(now) {
      const t = now / 1000;
      g.clearRect(0, 0, fcv.width, fcv.height);
      const SW = 2;
      for (const f of flags) {
        const W = f.img.width;
        b.clearRect(0, 0, buf.width, buf.height);
        for (let u = 0; u < W; u += SW) {
          const r = u / W;
          const phase = u * .011 - t * 2.4 + f.ph;
          const dy = 34 * Math.pow(r, .85) * Math.sin(phase) + 10 * r * Math.sin(t * .9 + f.ph);
          const x = f.dir > 0 ? f.hoist + u : f.hoist - u - SW;
          b.drawImage(f.img, u, 0, SW, FH, x - .5, TOP + dy, SW + 1, FH);
          const shade = Math.cos(phase) * Math.min(1, r * 3);
          b.fillStyle = shade > 0 ? `rgba(255,255,255,${shade * .14})` : `rgba(0,0,0,${-shade * .32})`;
          b.fillRect(x - .5, TOP + dy, SW + 1, FH);
        }
        const end = f.hoist + f.dir * W;
        const m = b.createLinearGradient(f.hoist, 0, end, 0);
        m.addColorStop(0, "#000"); m.addColorStop(.68, "#000"); m.addColorStop(1, "rgba(0,0,0,.1)");
        b.globalCompositeOperation = "destination-in"; b.fillStyle = m; b.fillRect(0, 0, buf.width, buf.height);
        b.globalCompositeOperation = "source-over";
        g.drawImage(buf, 0, 0);
      }
      g.globalAlpha = 1;
      // twin poles with finials
      for (const px of [CX - 14, CX + 14]) {
        const pg = g.createLinearGradient(px - 4, 0, px + 4, 0);
        pg.addColorStop(0, "#6b6f7a"); pg.addColorStop(.5, "#f4f1ea"); pg.addColorStop(1, "#5a5e68");
        g.fillStyle = pg; g.fillRect(px - 3.5, TOP - 26, 7, FH + 66);
        g.fillStyle = "#e9d9a8"; g.beginPath(); g.arc(px, TOP - 32, 9, 0, 6.283); g.fill();
      }
      if (run) raf = requestAnimationFrame(draw);
    }
    draw(performance.now());
    onEnter(".s-friend", () => { greenTarget = .3; if (!run) { run = true; raf = requestAnimationFrame(draw); } });
    onLeave(".s-friend", () => { greenTarget = 0; setTimeout(() => { run = false; cancelAnimationFrame(raf); }, 900); });
  }

  /* ---------------- closing: rotating thanks ---------------- */
  let thanksTimer;
  onEnter(".s-close", () => {
    const sp = $$("#thanks span"); let i = 0;
    sp.forEach((s, k) => s.classList.toggle("on", k === 0));
    clearInterval(thanksTimer);
    thanksTimer = setInterval(() => { sp[i].classList.remove("on"); i = (i + 1) % sp.length; sp[i].classList.add("on"); }, 2600);
  });
  onLeave(".s-close", () => clearInterval(thanksTimer));
  onEnter(".s-tourism", () => { greenTarget = .22; });
  onLeave(".s-tourism", () => { greenTarget = 0; });
  onEnter(".s-cover", () => { greenTarget = .16; });
  onLeave(".s-cover", () => { greenTarget = 0; });

  /* ---------------- boot ---------------- */
  slides.forEach(indexSlide);
  $("#hudTotal").textContent = pad(N);
  const savedLang = store.get("deck-lang");
  applyLang(["tr", "bg", "en"].includes(savedLang) ? savedLang : "tr");
  slides.forEach(indexSlide);
  const start = Math.max(0, Math.min(N - 1, (parseInt(location.hash.slice(1), 10) || 1) - 1));
  requestAnimationFrame(() => go(start, { force: true }));
})();
