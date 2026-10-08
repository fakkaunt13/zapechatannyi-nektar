/* ===== Lesson reader: near-full text narration with read-along page and an illustrated plate ===== */
const PL = { x:48, y:48, w:800, h:804 };   // plate area (left)
const RDX = { x:888, y:132, w:664, h:716 }; // reader page (right, HTML)
let RD = null;

/* time when the narration reaches a phrase of the current beat */
function w(ph, off=0){
  const i = NAR.plain.indexOf(ph);
  if(i < 0){ console.error('phrase not found: ' + ph); return off; }
  return est(i) + off;
}
/* clipped illustration plate with a manuscript frame */
function plate(p, o){
  o = Object.assign({ bg:null, night:false, scene:null }, o||{});
  const id = 'pl' + Math.random().toString(36).slice(2, 8);
  const cp = el('clipPath', DEFS, { id }); el('rect', cp, { x:PL.x, y:PL.y, width:PL.w, height:PL.h, rx:6 });
  const g = G(p); const inner = G(g); inner.setAttribute('clip-path', `url(#${id})`);
  rect(inner, PL.x, PL.y, PL.w, PL.h, { rx:6, fill:o.night ? '#13233b' : '#efe2c2', stroke:'none' });
  if(typeof scene === 'function'){
    if(o.scene === 'paper' || (!o.scene && !o.night)) inner.bgScene = paperBg(inner, { c:o.bg || '#f4e5c3' });
    else if(o.scene === 'interior'){ inner.bgScene = interior(inner, o); if(o.veil) veil(inner, o.veil); }
    else if(o.scene === 'blank'){}
    else if(o.scene) inner.bgScene = scene(inner, o.scene, o);
    else inner.bgScene = skyFill(inner, 'night', o);
  }
  const dark = o.dark ?? (o.night || (typeof DARKMODE === 'function' && DARKMODE(o.scene)));
  g.inner = inner; g.scene = inner.bgScene;
  g.frame = () => { if(typeof atmo === 'function'){ haloText(inner); atmo(inner, dark); }
    rect(g, PL.x, PL.y, PL.w, PL.h, { rx:6, fill:'none', stroke:COL.gold, 'stroke-width':3 }); rect(g, PL.x - 8, PL.y - 8, PL.w + 16, PL.h + 16, { rx:9, fill:'none', stroke:COL.gold, 'stroke-width':1 }); };
  return g;
}
/* caption strip at the bottom of the plate */
function plateCap(p, txt, t0, o){
  o = Object.assign({ y:PL.y + PL.h - 56, size:24, dark:false }, o||{});
  const g = G(p, { o:0 }); const W = Math.min(PL.w - 60, txt.length*o.size*.5 + 70);
  rect(g, PL.x + PL.w/2 - W/2, o.y - 24, W, 48, { rx:6, fill:o.dark ? 'rgba(10,20,36,.72)' : 'rgba(251,245,230,.92)', stroke:COL.gold, 'stroke-width':1.5 });
  T(g, txt, { x:PL.x + PL.w/2, y:o.y + 8, size:o.size, weight:700, font:SERIF, fill:o.dark ? '#f3e3b8' : COL.ink });
  show(g, t0); return g;
}
/* a dated tablet at the top of the plate */
function plateDate(p, txt, t0, o){
  o = Object.assign({ y:PL.y + 52 }, o||{});
  const t = tablet(p, PL.x + PL.w/2, o.y, Math.min(PL.w - 60, txt.length*12.5 + 80), 64, { o:0 }); show(t, t0);
  T(t, txt, { y:8, size:23, weight:700, font:SERIF }); return t;
}
/* quotation card on the plate (ayah or saying) */
function quoteCard(p, x, y, wdt, ar, ru, src, t0, o){
  o = Object.assign({ dark:false, size:26 }, o||{});
  const lines = ru.split('\n').length, h = (ar ? 92 : 30) + lines*o.size*1.3 + (src ? 44 : 0) + 34;
  const g = tablet(p, x, y, wdt, h, { o:0 }); show(g, t0, .7);
  let yy = -h/2 + 30;
  if(ar){ const asz = Math.min(o.ar || 46, (wdt - 60)/(ar.length*.3)); const a = T(g, ar, { y:yy + 46, size:asz, font:ARAB, fill:COL.emerald }); a.setAttribute('direction', 'rtl'); yy += 92; }
  T(g, ru, { y:yy + o.size*.9, size:o.size, italic:true, font:SERIF, lh:1.3, fill:COL.ink }); yy += lines*o.size*1.3;
  if(src) T(g, src, { y:yy + 30, size:20, fill:COL.dim, italic:true, font:SERIF });
  return g;
}
/* name chip (cartouche-like label) */
function chip(p, x, y, txt, t0, o){
  o = Object.assign({ c:COL.emerald, size:22, sub:null, anchor:'middle' }, o||{});
  const W = Math.max(txt.length, (o.sub || '').length*.8)*o.size*.55 + 44, H = o.sub ? 62 : 44;
  const g = G(p, { x, y, o:0 });
  rect(g, -W/2, -H/2, W, H, { rx:H/2, fill:'#fbf5e6', stroke:o.c, 'stroke-width':2.5, filter:'url(#shadow)' });
  T(g, txt, { y: o.sub ? -4 : 8, size:o.size, weight:700, font:SERIF, fill:o.c });
  if(o.sub) T(g, o.sub, { y:20, size:16, fill:COL.dim });
  show(g, t0); return g;
}

/* ---------- read-along page ---------- */
function reader(kicker, title){
  const old = CARDS.querySelector('.reader'); if(old) old.remove();
  const box = document.createElement('div'); box.className = 'reader';
  Object.assign(box.style, { left:RDX.x + 'px', top:RDX.y + 'px', width:RDX.w + 'px', height:RDX.h + 'px' });
  const marks = Object.entries(NAR.marks).sort((a, b) => a[1] - b[1]);
  const paras = marks.filter(([k]) => /^[pv]\d+$/.test(k)), lines = marks.filter(([k]) => /^l\d+$/.test(k)).map(x => x[1]);
  let html = `<div class="rk">${esc(kicker || '')}</div><div class="rt">${esc(title || '')}</div><div class="rb"><div class="rin">`;
  paras.forEach(([k, a], pi) => {
    const b = pi < paras.length - 1 ? paras[pi + 1][1] : NAR.plain.length;
    const cuts = new Set([a, b]);
    NAR.sents.forEach(s => { if(s.a > a && s.a < b) cuts.add(s.a); });
    lines.forEach(x => { if(x > a && x < b) cuts.add(x); });
    const cs = [...cuts].sort((x, y) => x - y);
    let ph = `<p class="${k[0] === 'v' ? 'verse' : ''}">`;
    for(let i = 0; i < cs.length - 1; i++){
      const x = cs[i], y = cs[i + 1]; const si = NAR.sents.findIndex(s => x >= s.a && x < s.b);
      if(i > 0 && lines.includes(x)) ph += '<br>';
      ph += `<span data-s="${si}">${esc(honor(NAR.plain.slice(x, y)))}</span>`;
    }
    html += ph + '</p>';
  });
  box.innerHTML = html + '</div></div>';
  CARDS.appendChild(box);
  RD = { box, body:box.querySelector('.rb'), spans:[...box.querySelectorAll('span[data-s]')], si:-2, y:0 };
  RD.spans.forEach(sp => sp.onclick = () => jumpTo(+sp.dataset.s));
  const hold = () => { RD.hold = performance.now() + 6000; }; ['touchstart', 'touchmove', 'wheel'].forEach(ev => RD.body.addEventListener(ev, hold, { passive:true }));
  S.reader = RD;
  readerTick(true);
  return box;
}
function readerTick(force){
  if(!RD || !RD.box.isConnected) return;
  const done = CLOCK >= ENDT - .25 && !SP.on;
  const ci = SP.on && SP.bound ? SP.lastCI : ciAt(CLOCK);
  let si = done ? 1e9 : NAR.sents.findIndex(s => ci < s.b); if(si < 0) si = 1e9;
  if(si !== RD.si || force){
    RD.si = si;
    let cur = null;
    RD.spans.forEach(sp => { const k = +sp.dataset.s; sp.className = k < si ? 'past' : k === si ? 'cur' : ''; if(k === si && !cur) cur = sp; });
    const target = cur ? Math.max(0, cur.offsetTop - RD.body.clientHeight*.28) : (done ? RD.body.scrollHeight : 0);
    RD.ty = Math.min(target, Math.max(0, RD.body.scrollHeight - RD.body.clientHeight));
    if(force || INSTANT) RD.body.scrollTop = RD.ty;
  }
  if(RD.hold && performance.now() < RD.hold) return;
  if(RD.ty != null){ const d = RD.ty - RD.body.scrollTop; if(Math.abs(d) > .5) RD.body.scrollTop += d*.08; }
}
/* click on a sentence: replay the beat from that sentence */
function jumpTo(si){
  const s = NAR.sents[si]; if(!s || WAITING) return;
  const t = est(s.a), i = CUR;
  seek(i, false); INSTANT = true; CLOCK = t; stepTL(t); INSTANT = false; readerTick(true);
  PLAYING = true; speakFrom(s.a); updBar();
}

/* ---------- beat builders ---------- */
/* reading beat: plateFn(p, D) draws the illustration using w('phrase') for timing */
function readBeat(id, title, kicker, plateFn){
  return [id, title, (m, D) => { const p = panel(0); plateFn(p, D, m); reader(kicker, title); }];
}
function lessonIntro(o){
  return ['intro', 'Начало урока', (m, D) => {
    const p = panel(0);
    rosette(p, 800, 150, 62, 8, { o:0 }); const ro = p.lastChild; show(ro, .1, .8);
    const k = T(p, `ГЛАВА ${o.ch} · УРОК ${o.n} ИЗ ${o.of}`, { x:800, y:262, size:24, weight:700, fill:COL.gold, font:UI, o:0 }); k.setAttribute('letter-spacing', 4); show(k, .3);
    let ttl = o.title; if(ttl.length > 34 && !ttl.includes('\n')){ const ws = ttl.split(' '); let a = ''; while(ws.length && (a + ' ' + ws[0]).length < ttl.length/2 + 4) a = (a + ' ' + ws.shift()).trim(); ttl = a + '\n' + ws.join(' '); }
    const nl = ttl.split('\n').length - 1, dy = nl*56;
    const t = T(p, ttl, { x:800, y:336, size:nl ? 50 : 58, lh:1.12, weight:700, font:SERIF, o:0 }); show(t, .5);
    const r = rule(p, 800, 380 + dy, 520, { o:0 }); show(r, .7);
    const s = T(p, o.chapter, { x:800, y:428 + dy, size:28, italic:true, font:SERIF, fill:COL.dim, o:0 }); show(s, .8);
    o.parts.forEach((x, i) => { const g = G(p, { x:520, y:500 + dy + i*52, o:0 }); star8(g, 0, -8, 11, { fill:COL.emerald, stroke:COL.gold2, 'stroke-width':1.5 }); T(g, x, { x:28, y:0, size:27, anchor:'start', font:SERIF }); show(g, 1.2 + i*.35); });
    const d = T(p, `≈ ${o.min} минут · текст книги почти полностью · вопросы в конце`, { x:800, y:540 + dy + o.parts.length*52, size:22, fill:COL.dim, o:0 }); show(d, 1.4 + o.parts.length*.35);
    p.classList.add('introsvg');
    const mi = document.createElement('div'); mi.className = 'mintro';
    mi.innerHTML = `<div class="mk">ГЛАВА ${o.ch} · УРОК ${o.n} ИЗ ${o.of}</div><h1>${esc(honor(o.title))}</h1><div class="mc">${esc(honor(o.chapter))}</div><ul>${o.parts.map(x => `<li>${esc(honor(x))}</li>`).join('')}</ul><div class="mm">≈ ${o.min} минут · текст книги почти полностью · вопросы в конце</div>`;
    CARDS.appendChild(mi);
  }];
}
function lessonWrap(items){ return ['wrap', 'Главное из урока', wrapRun('Главное из урока', items)]; }
function lessonQuiz(qs){ return ['quiz', 'Вопросы урока', (m, D) => { const p = panel(0); practiceIntro(p, 'Вопросы урока'); }, { ask: done => quiz(SCREEN, qs, done, 'Вопросы урока') }]; }

/* ---------- small symbolic drawings (no people) ---------- */
function sheep(p, x, y, s=1){ const g = G(p, { x, y, s }); el('ellipse', g, { cx:0, cy:0, rx:20, ry:13, fill:'#f4efe2', stroke:'#8d8676', 'stroke-width':2 }); el('ellipse', g, { cx:20, cy:-4, rx:8, ry:6, fill:'#4d4840' }); line(g, -10, 12, -10, 22, { stroke:'#4d4840', 'stroke-width':3 }); line(g, 10, 12, 10, 22, { stroke:'#4d4840', 'stroke-width':3 }); return g; }
function tent(p, x, y, s=1, o){ const g = G(p, { x, y, s, o:(o||{}).o ?? 1 }); path(g, 'M-90 40L-50 -40H50L90 40Z', { fill:'#5b4128', stroke:'#3a2a18', 'stroke-width':2 }); path(g, 'M-50 -40L0 -60L50 -40', { stroke:'#3a2a18', 'stroke-width':3 }); path(g, 'M-14 40V0H14V40Z', { fill:'#2a1d10', stroke:'none' }); return g; }
function camel(p, x, y, s=1, o){ // camel silhouette (animal), facing right
  o = Object.assign({ c:'#8a6236', o:1, flip:false }, o||{});
  const g = G(p, { x, y, s, o:o.o }); if(o.flip) g.setAttribute('transform', (g.getAttribute('transform') || '') + ' scale(-1 1)');
  path(g, 'M-70 -40C-70 -70 -50 -78 -38 -64C-30 -96 4 -100 12 -66C20 -62 34 -62 44 -70L60 -112C64 -122 82 -124 88 -114L96 -104L84 -100L70 -60C62 -40 50 -30 40 -28L-60 -24C-68 -28 -70 -34 -70 -40Z', { fill:o.c, stroke:'none' });
  [[-56, -26], [-40, -26], [24, -28], [38, -28]].forEach(([lx, ly], i) => path(g, `M${lx} ${ly}L${lx + (i%2 ? 4 : -4)} 40`, { stroke:o.c, 'stroke-width':8 }));
  return g;
}
function house(p, x, y, w=110, h=80, o){ o = Object.assign({ c:'#d9c496', line:'#8d7446', door:true, win:true, o:1 }, o||{});
  const g = G(p, { x, y, o:o.o }); rect(g, -w/2, -h, w, h, { rx:2, fill:o.c, stroke:o.line, 'stroke-width':2 }); rect(g, -w/2 - 4, -h - 8, w + 8, 10, { rx:2, fill:o.line, stroke:'none' });
  if(o.door) rect(g, -12, -40, 24, 40, { rx:2, fill:'#5b4128', stroke:'none' }); if(o.win) rect(g, w/2 - 30, -h + 18, 16, 14, { rx:1, fill:'#5b4128', stroke:'none' }); return g; }
function hmap(p, o){ const M = mapBase(p, Object.assign({ x:PL.x + 20, y:PL.y + 20, w:PL.w - 40, h:PL.h - 40, lon0:37.3, lon1:42.2, lat0:20.9, lat1:24.9, labels:false }, o||{}));
  if(typeof stone === 'function') mapRelief(M);
  M.lab('Красное море', 38.55, 22.5, { r:-72, size:24, fill:'#e3f4f7' }); return M; }
function mapRelief(M){ const g = G(M.inner), k = M.k, R = rng(11);
  [[40.25, 23.3, .45, 1.05], [39.82, 24.42, .14, .14], [39.45, 24.45, .12, .2], [40.55, 21.9, .3, .4]].forEach(([lo, la, rx, ry]) => { const [x, y] = M.P(lo, la);
    el('ellipse', g, { cx:x, cy:y, rx:rx*k, ry:ry*k*1.08, fill:'#5a4a40', opacity:.3, filter:'url(#soft8)' }); });
  const SP = [[40.5, 20.6], [40.35, 21.3], [40.2, 21.9], [39.95, 22.5], [39.75, 23.1], [39.6, 23.6], [39.75, 24.1], [40.0, 24.7], [40.1, 25.2]];
  const pk = [];
  for(let i = 0; i < SP.length - 1; i++) for(let j = 0; j < 14; j++){ const t = j/14, lo = SP[i][0] + (SP[i + 1][0] - SP[i][0])*t + (R() - .5)*.7, la = SP[i][1] + (SP[i + 1][1] - SP[i][1])*t + (R() - .5)*.25; pk.push([lo, la, .045 + R()*.06]); }
  pk.sort((a, b) => b[1] - a[1]).forEach(([lo, la, hh]) => { const [x, y] = M.P(lo, la), h = hh*k, w = h*1.7;
    path(g, `M${x - w} ${y}L${x - w*.1} ${y - h}L${x + w} ${y}Z`, { fill:'#c99a64', stroke:'none', opacity:.8 });
    path(g, `M${x - w*.1} ${y - h}L${x + w} ${y}L${x + w*.15} ${y}Z`, { fill:'#8a6440', stroke:'none', opacity:.7 });
    path(g, `M${x - w*.1} ${y - h}L${x - w*.45} ${y - h*.5}`, { stroke:'#f6e2b8', 'stroke-width':1.2, opacity:.7 }); });
  [[39.61, 24.47, .09], [39.62, 24.43, .05], [40.42, 21.27, .07], [38.98, 22.75, .03], [39.3, 23.7, .03]].forEach(([lo, la, r]) => { const [x, y] = M.P(lo, la); circ(g, x, y, r*k, { fill:'#5f9a45', stroke:'none', opacity:.55, filter:'url(#soft4)' }); for(let i = 0; i < 5; i++) circ(g, x + (R() - .5)*r*k*1.2, y + (R() - .5)*r*k*1.2, 2.5, { fill:'#3f7a30', stroke:'none' }); });
  return g; }
const ROUTE = [[39.83, 21.42], [39.85, 21.37], [39.75, 21.24], [39.45, 21.18], [39.2, 21.33], [39.1, 21.7], [39.25, 21.97], [39.2, 22.2], [39.3, 22.36], [39.05, 22.7], [38.95, 23.05], [39.0, 23.35], [39.25, 23.7], [39.4, 24.0], [39.55, 24.3], [39.62, 24.44]];
