/* Papermorph-style lesson engine — «Запечатанный нектар» edition (non-figurative manuscript theme).
   Stage: SVG 1600×900. Beats: [id, title, run(m, D), {ask}]. Narration: Web Speech API (ru-RU) with captions. */
'use strict';
const NS = 'http://www.w3.org/2000/svg';
const COL = { ink:'#2a2118', dim:'#76695a', faint:'#cdbb94', paper:'#f3e8cf', card:'#fbf5e6', hl:'#e8c766',
  gold:'#b8892f', gold2:'#d9b45a', emerald:'#1f6b57', lapis:'#24497e', night:'#0f2236', terra:'#a9502c', sand:'#dcc08a', sea:'#9cc3c9', land:'#ead9b0',
  orange:'#9a6a16', teal:'#1f6b57', blue:'#24497e', red:'#a9502c', green:'#4f7d3a', purple:'#6a4a7e', sky:'#7fb0c0', brown:'#7a5a36' };
const UI = '"Segoe UI","Trebuchet MS",system-ui,"Noto Sans",sans-serif';
const SERIF = '"Palatino Linotype","Book Antiqua",Palatino,Georgia,serif';
const ARAB = '"Traditional Arabic","Arabic Typesetting","Sakkal Majalla","Noto Naskh Arabic","Noto Sans Arabic","Times New Roman",serif';
const BOOK_TITLE = 'Запечатанный нектар';
/* honorifics: spoken in full, shown as signs in captions */
const HONOR = [[/,?\s*да благословит его Аллах и приветствует\s*,?/g, ' ﷺ'], [/,?\s*мир ему\s*,?/g, ' (мир ему)'], [/,?\s*да будет доволен(?: (?:Аллах|ими|ею|им|всеми|обоими)){1,4}\s*,?/g, ' (р.а.)']];
const honor = s => { HONOR.forEach(([re, r]) => { s = s.replace(re, r); }); return s.replace(/ ([.!?…:;])/g, '$1').replace(/\s{2,}/g, ' '); };
const MONO = 'Consolas,"Courier New",monospace';
let S = {};            // scene objects shared across beats
const SCORE = {};      // first-try results: id -> {r, t}
let TL = [];           // timeline items of the current beat
let CLOCK = 0, INSTANT = false, CUR = 0, PLAYING = false, WAITING = false, ASKED = false, ENDT = 0, NAR = null;
let WORLD, STAGE, CARDS, DEFS;

/* ---------- easing & colour ---------- */
const EASE = { lin:q=>q, io:q=>q<.5?2*q*q:1-Math.pow(-2*q+2,2)/2, out:q=>1-Math.pow(1-q,3), in:q=>q*q*q,
  back:q=>{const c=1.70158,c3=c+1;return 1+c3*Math.pow(q-1,3)+c*Math.pow(q-1,2)} };
const hex2 = h => { h=h.replace('#',''); if(h.length===3) h=h.split('').map(c=>c+c).join(''); return [0,2,4].map(i=>parseInt(h.substr(i,2),16)); };
const mixc = (a,b,q) => { const A=hex2(a),B=hex2(b); return '#'+A.map((v,i)=>Math.round(v+(B[i]-v)*q).toString(16).padStart(2,'0')).join(''); };
const clamp = (v,a,b) => Math.max(a,Math.min(b,v));
const lerp = (a,b,q) => a+(b-a)*q;

/* ---------- element state ---------- */
function render(e){
  const s = e._s; if(!s) return;
  if(e.namespaceURI === NS){
    const sc = s.s ?? 1, sx = (s.sx ?? 1)*sc, sy = (s.sy ?? 1)*sc;
    e.setAttribute('transform', `translate(${(s.x||0).toFixed(2)} ${(s.y||0).toFixed(2)})` + (s.r ? ` rotate(${s.r.toFixed(2)})` : '') + ((sx!==1||sy!==1) ? ` scale(${sx.toFixed(4)} ${sy.toFixed(4)})` : ''));
  }
  if('o' in s) e.style.opacity = clamp(s.o,0,1);
  if('d' in s) { e.style.strokeDasharray = '1 1'; e.style.strokeDashoffset = (1 - clamp(s.d,0,1)).toFixed(4); }
  for(const k in s){
    if(k.startsWith('a_')) e.setAttribute(k.slice(2), s[k]);
    else if(k.startsWith('c_')) e.setAttribute(k.slice(2), s[k]);
  }
}
function st(e, o){ e._s = Object.assign(e._s || {}, o || {}); render(e); return e; }
function el(tag, parent, attrs, state){
  const e = document.createElementNS(NS, tag);
  for(const k in (attrs||{})) if(attrs[k] != null) e.setAttribute(k, attrs[k]);
  if(state && 'd' in state) e.setAttribute('pathLength', 1);
  (parent || WORLD).appendChild(e);
  e._s = Object.assign({}, state || {}); render(e);
  return e;
}
const G = (p, s) => el('g', p, {}, s);
function path(p, d, attrs, s){ return el('path', p, Object.assign({ d, fill:'none', stroke:COL.ink, 'stroke-width':4, 'stroke-linecap':'round', 'stroke-linejoin':'round' }, attrs||{}), s); }
function rect(p, x, y, w, h, attrs, s){ return el('rect', p, Object.assign({ x, y, width:w, height:h, rx:10, fill:COL.card, stroke:COL.ink, 'stroke-width':3 }, attrs||{}), s); }
function circ(p, cx, cy, r, attrs, s){ return el('circle', p, Object.assign({ cx, cy, r, fill:COL.card, stroke:COL.ink, 'stroke-width':3 }, attrs||{}), s); }
function line(p, x1, y1, x2, y2, attrs, s){ return el('line', p, Object.assign({ x1, y1, x2, y2, stroke:COL.ink, 'stroke-width':4, 'stroke-linecap':'round' }, attrs||{}), s); }
/* text: str may contain \n for lines; opts {x,y,size,fill,font,weight,anchor,o,lh,italic} */
function star8(p, cx, cy, r, attrs, s){ // rub el hizb: two overlapping squares
  const pts = []; for(let i = 0; i < 16; i++){ const a = Math.PI/8*i - Math.PI/2, rr = i%2 ? r*.76 : r; pts.push((cx + rr*Math.cos(a)).toFixed(1) + ' ' + (cy + rr*Math.sin(a)).toFixed(1)); }
  return path(p, 'M' + pts.join('L') + 'Z', Object.assign({ fill:'none', stroke:COL.gold, 'stroke-width':3 }, attrs||{}), s);
}
function T(p, str, o){
  o = Object.assign({ x:0, y:0, size:32, fill:COL.ink, font:UI, weight:400, anchor:'middle' }, o||{});
  const g = el('text', p, { x:0, y:0, 'font-size':o.size, fill:o.fill, 'font-family':o.font, 'font-weight':o.weight, 'text-anchor':o.anchor, 'font-style':o.italic?'italic':null, 'letter-spacing':o.ls||null },
    { x:o.x, y:o.y, o:o.o ?? 1, s:o.s ?? 1, r:o.r || 0 });
  const lines = String(str).split('\n'), lh = (o.lh || 1.25) * o.size;
  lines.forEach((ln, i) => { const ts = document.createElementNS(NS,'tspan'); ts.setAttribute('x',0); ts.setAttribute('dy', i ? lh : 0); setRich(ts, ln); g.appendChild(ts); });
  return g;
}
/* *word* → highlighted orange bold inside SVG text */
function setRich(ts, s){
  const parts = s.split(/(\*[^*]+\*)/);
  for(const pt of parts){
    if(!pt) continue;
    if(pt[0]==='*' && pt.endsWith('*')){ const b=document.createElementNS(NS,'tspan'); b.setAttribute('font-weight',700); b.setAttribute('fill',COL.orange); b.textContent=pt.slice(1,-1); ts.appendChild(b); }
    else ts.appendChild(document.createTextNode(pt));
  }
}
function img(p, href, x, y, w, h, s){ return el('image', p, { href, x, y, width:w, height:h }, s); }

/* ---------- timeline ---------- */
function sched(it){ it.n = TL.length; TL.push(it); return it; }
function tw(e, to, t0=0, dur=.5, ease='io'){ return sched({ k:'tw', e, to, t0, dur, ease }), e; }
function prog(fn, t0=0, dur=.5, ease='io'){ sched({ k:'pr', fn, t0, dur, ease }); }
function at(t0, fn){ sched({ k:'at', fn, t0, dur:0 }); }
function show(e, t0=0, dur=.45){ if(e._s.o === undefined) st(e,{o:0}); return tw(e, { o:1 }, t0, dur); }
function hide(e, t0=0, dur=.35){ return tw(e, { o:0 }, t0, dur); }
function draw(e, t0=0, dur=.8, ease='io'){ if(!('d' in e._s)){ e.setAttribute('pathLength',1); st(e,{d:0}); } return tw(e, { d:1 }, t0, dur, ease); }
function pop(e, t0=0, dur=.5){ const s1 = e._s.s ?? 1; st(e, { s:s1*.4, o:0 }); return tw(e, { s:s1, o:1 }, t0, dur, 'back'); }
function pulse(e, t0=0, k=1.12){ const s0 = e._s.s ?? 1; sched({ k:'pr', t0, dur:.6, ease:'lin', fn:q=>{ st(e,{ s:s0*(1+(k-1)*Math.sin(Math.PI*q)) }); } }); return e; }
function moveTo(e, x, y, t0=0, dur=.7, ease='io'){ return tw(e, { x, y }, t0, dur, ease); }
function stream(e, str, t0=0, cps=28){ // typewriter for a text element (single line)
  const ts = e.querySelector('tspan') || e; ts.textContent=''; sched({ k:'pr', t0, dur:str.length/cps, ease:'lin', fn:q=>{ ts.textContent = str.slice(0, Math.round(q*str.length)); } });
}
function panel(t0=0){
  const old = S._panel;
  if(old){ hide(old, t0, .35); at(t0+.4, () => old.remove()); }
  const p = G(WORLD); S._panel = p; return p;
}
function stepTL(t){
  for(const it of TL){
    if(it.done || t < it.t0) continue;
    if(it.k === 'at'){ it.done = true; it.fn(INSTANT); continue; }
    const q = it.dur > 0 ? clamp((t - it.t0)/it.dur, 0, 1) : 1, eq = EASE[it.ease || 'io'](q);
    if(it.k === 'pr'){ it.fn(eq); if(q >= 1) it.done = true; continue; }
    const e = it.e, s = e._s;
    if(!it.from){ it.from = {}; for(const k in it.to){ let v = s[k]; if(v === undefined){ v = k==='s'||k==='sx'||k==='sy'||k==='o'||k==='d' ? 1 : k.startsWith('c_') ? (e.getAttribute(k.slice(2))||'#000000') : k.startsWith('a_') ? +e.getAttribute(k.slice(2)) : 0; } it.from[k] = v; } }
    for(const k in it.to){ const a = it.from[k], b = it.to[k]; s[k] = k.startsWith('c_') ? mixc(a, b, eq) : a + (b - a)*eq; }
    render(e); if(q >= 1) it.done = true;
  }
}
function finishTL(){ // complete every pending item in end-time order
  const items = TL.filter(i => !i.done).sort((a,b) => (a.t0+a.dur) - (b.t0+b.dur) || a.n - b.n);
  const was = INSTANT; INSTANT = true;
  for(const it of items){ const keep = TL; TL = [it]; stepTL(1e9); TL = keep; }
  INSTANT = was; TL = TL.filter(i => !i.done);
}
const tlEnd = () => TL.reduce((m,i) => Math.max(m, i.t0 + i.dur), 0);
/* answer effects run on their own clock */
function fx(fn, dur=.6, ease='io'){ const t0 = performance.now(); (function f(){ const q = clamp((performance.now()-t0)/(dur*1000),0,1); fn(EASE[ease](q)); if(q<1) requestAnimationFrame(f); })(); }
function fxTo(e, to, dur=.5, ease='io'){ const from = {}; for(const k in to) from[k] = e._s[k] ?? (k==='s'||k==='o'?1:0); fx(q => { for(const k in to) e._s[k] = from[k] + (to[k]-from[k])*q; render(e); }, dur, ease); }

/* ---------- narration ---------- */
let CPS = +(localStorage.getItem('pm:cps') || 14.5), RATE = +(localStorage.getItem('pm:rate') || 1), MUTED = localStorage.getItem('pm:muted') === '1', CAPS = localStorage.getItem('pm:caps') !== '0';
let VOICE = null, SPEECH_OK = 'speechSynthesis' in window, GEN = 0, SPK = null;
const LEAD = .35;
function parseNar(raw){
  raw = raw || ''; const marks = {}; let plain = '';
  raw.split(/(\[\[[\w-]+\]\])/).forEach(pt => { const mm = pt.match(/^\[\[([\w-]+)\]\]$/); if(mm) marks[mm[1]] = plain.length; else plain += pt; });
  plain = plain.replace(/\s+/g,' ');
  const sents = []; const re = /[^.!?…]+[.!?…]*["»)]*\s*/g; let m2;
  while((m2 = re.exec(plain))){ if(m2[0].trim()) sents.push({ a:m2.index, b:m2.index + m2[0].length, text:m2[0].trim() }); }
  return { plain, marks, sents };
}
function est(ci){ // seconds from beat start until char index ci is spoken (sentence pauses included)
  if(!NAR) return 0; let t = LEAD, cps = CPS*RATE;
  for(const s of NAR.sents){ if(ci >= s.b){ t += (s.b - s.a)/cps + .32; continue; } if(ci > s.a) t += (ci - s.a)/cps; break; }
  return t;
}
function narD(){ return NAR && NAR.plain.trim() ? est(1e9) + .2 : .8; }
function pickVoice(){
  if(!SPEECH_OK) return null;
  const vs = speechSynthesis.getVoices().filter(v => /^ru/i.test(v.lang));
  const saved = localStorage.getItem('pm:voice');
  return vs.find(v => v.name === saved) || vs.find(v => /Natural|Online/i.test(v.name)) || vs.find(v => /Google/i.test(v.name)) || vs.find(v=>/Milena|Yuri|Irina|Pavel|Svetlana|Dmitry/i.test(v.name)) || vs[0] || null;
}
if(SPEECH_OK){ speechSynthesis.onvoiceschanged = () => { VOICE = pickVoice(); }; VOICE = pickVoice(); }
const SP = { on:false, cap:1e9, lastCI:0, si:0, measured:[] };
function speakFrom(ci){
  GEN++; const g = GEN;
  if(SPEECH_OK) speechSynthesis.cancel();
  SP.on = false; SP.cap = 1e9;
  if(MUTED || !SPEECH_OK || !VOICE || !NAR || !NAR.plain.trim()) return;
  let si = NAR.sents.findIndex(s => s.b > ci); if(si < 0) return;
  SP.on = true;
  const say = (i, from) => {
    if(g !== GEN) return;
    if(i >= NAR.sents.length){ SP.on = false; SP.cap = 1e9; onSpeechEnd(); return; }
    const s = NAR.sents[i], start = Math.max(from, s.a), txt = NAR.plain.slice(start, s.b);
    const u = new SpeechSynthesisUtterance(txt); u.voice = VOICE; u.lang = VOICE.lang; u.rate = RATE;
    const t0 = performance.now();
    SP.si = i; SP.cap = est(s.b) + .15; SP.lastCI = start;
    u.onboundary = e => { if(g !== GEN || e.name === 'sentence') return; const c = start + e.charIndex; SP.lastCI = c; SP.bound = true;
      const nxt = NAR.plain.indexOf(' ', c + 1); SP.cap = est(nxt < 0 || nxt > s.b ? s.b : nxt + 1) + .15; CLOCK = Math.max(CLOCK, est(c)); };
    u.onend = () => { if(g !== GEN) return; const el = (performance.now()-t0)/1000;
      if(txt.length > 25 && el > .5){ const m = txt.length/el/RATE; CPS = clamp(CPS*.75 + m*.25, 8, 26); localStorage.setItem('pm:cps', CPS.toFixed(2)); }
      CLOCK = Math.max(CLOCK, est(s.b) - .3); say(i+1, 0); };
    u.onerror = () => { if(g !== GEN) return; SP.on = false; SP.cap = 1e9; };
    speechSynthesis.speak(u);
  };
  say(si, ci);
}
function stopSpeech(){ GEN++; if(SPEECH_OK) speechSynthesis.cancel(); SP.on = false; SP.cap = 1e9; }
function onSpeechEnd(){ ENDT = Math.max(Math.min(ENDT, CLOCK + .5), tlEnd() + .3, CLOCK + .3); }
function ciAt(t){ // inverse of est for captions
  if(!NAR) return 0; let lo = 0, hi = NAR.plain.length; while(lo < hi){ const mid = (lo+hi+1)>>1; if(est(mid) <= t) lo = mid; else hi = mid-1; } return lo;
}
function caption(){
  const c = document.getElementById('caption'); if(!c) return;
  if(S.reader && typeof readerTick === 'function'){ readerTick(); if(c.textContent) c.textContent = ''; return; }
  if(!CAPS || !NAR || !NAR.plain.trim() || WAITING){ c.textContent=''; return; }
  const ci = SP.on && SP.bound ? SP.lastCI : ciAt(CLOCK);
  const s = NAR.sents.find(s => ci < s.b) || null;
  const txt = s && CLOCK < ENDT - .2 ? honor(s.text) : '';
  if(c.textContent !== txt) c.textContent = txt;
}

/* ---------- beats ---------- */
let BEATS = [], CHAPTER = {}, NARR = {}, PARSED = {};
function mfun(id){ return (name, off=0) => { const p = PARSED[id]; if(!(name in p.marks)) throw new Error(`Mark [[${name}]] missing in beat ${id}`); const keep = NAR; NAR = p; const t = est(p.marks[name]); NAR = keep; return t + off; }; }
function runBeat(i){
  const [id, , run] = BEATS[i]; NAR = PARSED[id]; CLOCK = 0;
  const D = narD(); run(mfun(id), D);
  ENDT = Math.max(D, tlEnd()) + .4;
}
function resetScene(){
  stopSpeech(); TL = []; S = {}; WORLD.innerHTML = ''; CARDS.innerHTML = ''; WAITING = false; ASKED = false;
}
function seek(i, play=true){
  i = clamp(i, 0, BEATS.length - 1);
  resetScene();
  INSTANT = true;
  for(let j = 0; j < i; j++){ runBeat(j); finishTL(); const o = BEATS[j][3]; if(o && o.replay) o.replay(); }
  INSTANT = false;
  start(i, play);
}
function start(i, play=true){
  finishTL(); stopSpeech(); CARDS.querySelectorAll('.q,.reader,.mintro').forEach(c => c.remove()); S.reader = null;
  CUR = i; WAITING = false; ASKED = false; TL = [];
  runBeat(i);
  if(MOB) fit();
  saveProgress();
  updBar();
  PLAYING = play;
  if(play) speakFrom(0);
}
function next(){ if(CUR < BEATS.length - 1) start(CUR + 1, true); else { PLAYING = false; updBar(); } }
function loop(now){
  const dt = Math.min(.1, (now - (loop.t || now))/1000); loop.t = now;
  if(PLAYING && !WAITING){
    CLOCK += dt;
    if(SP.on) CLOCK = Math.min(CLOCK, SP.cap);
    stepTL(CLOCK);
    if(CLOCK >= ENDT && !SP.on){
      const o = BEATS[CUR][3] || {};
      if(o.ask && !ASKED){ ASKED = true; WAITING = true; finishTL(); updBar(); o.ask(() => { WAITING = false; next(); }); }
      else if(!o.ask) next();
    }
    const bi = document.querySelector('#segs i.cur b'); if(bi) bi.style.width = clamp(CLOCK/ENDT,0,1)*100 + '%';
  }
  caption();
  requestAnimationFrame(loop);
}
function togglePlay(){
  if(WAITING) return;
  PLAYING = !PLAYING;
  if(PLAYING){ if(CLOCK >= ENDT) { next(); return; } const ci = SP.bound ? SP.lastCI : ciAt(CLOCK); const s = NAR.sents.find(s => ci < s.b); speakFrom(s ? s.a : 1e9); }
  else stopSpeech();
  updBar();
}

/* ---------- progress ---------- */
function bookPath(){ return location.pathname.replace(/\/(ch\d+|\d\d-\d+)\/(index\.html)?$/, '/').replace(/index\.html$/, ''); }
function progKey(){ return 'animebook:progress:' + bookPath(); }
function loadProgress(){ try{ const v = JSON.parse(localStorage.getItem(progKey())); if(v && typeof v === 'object' && !Array.isArray(v)) return v; }catch(e){} return {}; }
function saveProgress(done){
  const p = loadProgress(); p.last = { ch: CHAPTER.num, beat: CUR };
  if(!Array.isArray(p.done)) p.done = []; p.done = p.done.filter(n => (Number.isInteger(n) && n >= 0) || typeof n === 'string');
  if(done && !p.done.includes(CHAPTER.num)) p.done.push(CHAPTER.num);
  try{ localStorage.setItem(progKey(), JSON.stringify(p)); }catch(e){}
}

/* ---------- questions ---------- */
const BAND = { x:230, y:0, w:1140, bottom:24 }, TOPR = { x:930, y:60, w:620 }, RIGHT = { x:930, y:150, w:620 }, LEFT = { x:50, y:150, w:620 }, SCREEN = { screen:true };
const esc = s => String(s).replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
function card(pos, cls=''){
  const c = document.createElement('div'); c.className = 'card ' + cls + (pos.screen ? ' screen' : '');
  if(!pos.screen){ c.style.left = pos.x + 'px'; c.style.top = pos.y + 'px'; c.style.width = pos.w + 'px'; if(pos.bottom != null){ c.style.top='auto'; c.style.bottom = pos.bottom + 'px'; } }
  CARDS.appendChild(c); return c;
}
let QKEY = null;
function quiz(pos, qs, done, label='Быстрая проверка'){
  const c = card(pos, 'q'); let qi = 0;
  const showQ = () => {
    const q = qs[qi]; c.innerHTML = '';
    const lab = document.createElement('div'); lab.className = 'lab'; lab.textContent = label + (qs.length > 1 ? `   ${qi+1} из ${qs.length}` : ''); c.appendChild(lab);
    const pr = document.createElement('div'); pr.className = 'prompt'; pr.innerHTML = q.prompt; c.appendChild(pr);
    const body = document.createElement('div'); c.appendChild(body);
    const fb = document.createElement('div'); fb.className = 'fb'; c.appendChild(fb);
    const row = document.createElement('div'); row.className = 'row'; c.appendChild(row);
    const bAns = mkBtn('Показать ответ'), bChk = mkBtn('Проверить'), bNext = mkBtn(qi < qs.length - 1 ? 'Дальше →' : 'Продолжить →', 'go');
    bAns.style.display = 'none'; bNext.disabled = true;
    let tries = 0, solved = false, api;
    api = {
      card: c, body, fb,
      grade(ok, msg, part){
        tries++;
        if(!(q.id in SCORE)) SCORE[q.id] = part ? { r:part.right, t:part.total } : { r: ok ? 1 : 0, t: 1 };
        fb.className = 'fb ' + (ok ? 'ok' : 'no'); fb.innerHTML = (ok ? '✓ ' : '× ') + msg;
        if(ok){ solved = true; bNext.disabled = false; bChk.style.display = 'none'; bAns.style.display = 'none'; inst.lock && inst.lock(); setTimeout(() => bNext.focus(), 50); }
        else { bAns.style.display = ''; }
      },
      solved: () => solved
    };
    const inst = q.build(body, api) || {};
    if(!inst.check) bChk.style.display = 'none';
    bChk.onclick = () => inst.check && inst.check();
    bAns.onclick = () => { if(inst.reveal) inst.reveal(); solved = true; bNext.disabled = false; bAns.style.display = 'none'; bChk.style.display = 'none'; };
    bNext.onclick = () => { if(bNext.disabled) return; qi++; if(qi < qs.length) showQ(); else { QKEY = null; c.remove(); done(); } };
    row.append(bAns, bChk, bNext);
    if(inst.hint){ const h = document.createElement('div'); h.className = 'hint'; h.textContent = inst.hint; c.appendChild(h); }
    QKEY = e => { if(inst.key && inst.key(e)) return true; if(e.key === 'Enter'){ if(!bNext.disabled) bNext.click(); else if(inst.check && bChk.style.display !== 'none') bChk.click(); return true; } return false; };
  };
  showQ();
}
function mkBtn(t, cls=''){ const b = document.createElement('button'); b.className = 'btn ' + cls; b.textContent = t; return b; }
/* choice(options, right, why, wrongWhys[], onRight) */
function choice(opts, right, why, wrongs=[], onRight){
  return (body, api) => {
    const box = document.createElement('div'); box.className = 'opts'; body.appendChild(box);
    const bs = opts.map((o, i) => { const b = document.createElement('button'); b.className = 'opt'; b.innerHTML = `<kbd>${i+1}</kbd><span>${o}</span>`; b.onclick = () => pickIt(i); box.appendChild(b); return b; });
    let locked = false;
    function pickIt(i){ if(locked) return; if(i === right){ bs[i].classList.add('right'); api.grade(true, why); onRight && onRight(); } else { bs[i].classList.add('wrong'); api.grade(false, wrongs[i] || 'Не совсем. Попробуйте ещё раз.'); } }
    return { lock(){ locked = true; }, reveal(){ bs[right].classList.add('right'); api.fb.className = 'fb ok'; api.fb.innerHTML = '✓ ' + why; locked = true; onRight && onRight(); },
      key(e){ const n = +e.key; if(n >= 1 && n <= opts.length){ pickIt(n-1); return true; } }, hint:'Клавиши 1–' + opts.length + ' выбирают ответ, Enter — дальше' };
  };
}
/* grid(rows [{text, ans}], cols [[key,label]], why) */
function grid(rows, cols, why){
  return (body, api) => {
    const tb = document.createElement('table'); tb.className = 'grid'; body.appendChild(tb);
    const sel = rows.map(() => null), btns = []; let cur = 0;
    rows.forEach((r, i) => {
      const tr = document.createElement('tr'); const td = document.createElement('td'); td.innerHTML = r.text; tr.appendChild(td);
      const td2 = document.createElement('td'); td2.style.textAlign = 'right'; tr.appendChild(td2);
      btns[i] = cols.map(([k, lab], j) => { const b = document.createElement('button'); b.className = 'gc'; b.innerHTML = `${lab}`; b.onclick = () => { setSel(i, j); }; td2.appendChild(b); return b; });
      tr.onclick = () => { cur = i; mark(); }; tb.appendChild(tr);
    });
    function setSel(i, j){ sel[i] = j; btns[i].forEach((b, k) => b.classList.toggle('sel', k === j)); }
    function mark(){ [...tb.rows].forEach((r, i) => r.classList.toggle('cur', i === cur)); }
    mark();
    let locked = false;
    return {
      check(){ if(locked) return; if(sel.some(v => v === null)){ api.fb.className = 'fb no'; api.fb.textContent = 'Ответьте на все строки.'; return; }
        let r = 0; rows.forEach((row, i) => { const ok = cols[sel[i]][0] === row.ans; if(ok) r++; btns[i][sel[i]].classList.remove('sel'); btns[i][sel[i]].classList.add(ok ? 'right' : 'wrong'); });
        const all = r === rows.length;
        api.grade(all, all ? why : `Верно ${r} из ${rows.length}. Исправьте красные строки и проверьте снова.`, { right:r, total:rows.length });
        if(!all) setTimeout(() => { if(locked) return; rows.forEach((row,i) => { btns[i].forEach(b => b.classList.remove('wrong','right')); if(sel[i]!==null && cols[sel[i]][0] === row.ans) btns[i][sel[i]].classList.add('right'); else { sel[i] = null; } }); }, 1400);
      },
      lock(){ locked = true; },
      reveal(){ locked = true; rows.forEach((row, i) => { btns[i].forEach((b, j) => { b.classList.remove('sel','wrong'); b.classList.toggle('right', cols[j][0] === row.ans); }); }); api.fb.className = 'fb ok'; api.fb.innerHTML = '✓ ' + why; },
      key(e){ if(e.key === 'ArrowDown'){ cur = Math.min(rows.length-1, cur+1); mark(); return true; } if(e.key === 'ArrowUp'){ cur = Math.max(0, cur-1); mark(); return true; }
        const n = +e.key; if(n >= 1 && n <= cols.length){ setSel(cur, n-1); if(cur < rows.length-1){ cur++; mark(); } return true; } },
      hint:'↑/↓ — строка, 1–' + cols.length + ' — вариант, Enter — проверить'
    };
  };
}
/* order(items, why): click items in the right order (items given in correct order; shown shuffled) */
function order(items, why, seed=3){
  return (body, api) => {
    const idx = items.map((_, i) => i); for(let i = idx.length-1; i > 0; i--){ seed = (seed*9301 + 49297) % 233280; const j = Math.floor(seed/233280*(i+1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
    if(idx.every((v,i)=>v===i)) idx.reverse();
    const box = document.createElement('div'); box.className = 'opts'; body.appendChild(box);
    let seq = [], locked = false;
    const bs = idx.map((ii, k) => { const b = document.createElement('button'); b.className = 'opt'; b.innerHTML = `<kbd>${k+1}</kbd><span>${items[ii]}</span>`; b.onclick = () => tapIt(k); box.appendChild(b); return b; });
    function tapIt(k){ if(locked || seq.includes(k)) return; seq.push(k); bs[k].classList.add('num'); bs[k].querySelector('kbd').textContent = seq.length; bs[k].classList.add('sel');
      if(seq.length === items.length){ const ok = seq.every((kk, n) => idx[kk] === n); if(ok){ bs.forEach(b => { b.classList.remove('sel'); b.classList.add('right'); }); api.grade(true, why); }
        else { const r = seq.filter((kk, n) => idx[kk] === n).length; api.grade(false, `На своём месте ${r} из ${items.length}. Нажмите «Заново» или «Показать ответ».`, { right:r, total:items.length }); bs.forEach((b, kk) => b.classList.add(idx[kk] === seq.indexOf(kk) ? 'right' : 'wrong')); } } }
    const reset = mkBtn('Заново'); reset.style.marginTop = '10px'; reset.onclick = () => { if(locked) return; seq = []; bs.forEach((b, k) => { b.className = 'opt'; b.querySelector('kbd').textContent = k+1; }); api.fb.className = 'fb'; api.fb.textContent = ''; }; body.appendChild(reset);
    return { lock(){ locked = true; reset.remove(); }, reveal(){ locked = true; reset.remove(); bs.forEach((b, k) => { b.className = 'opt right num'; b.querySelector('kbd').textContent = idx[k] + 1; b.style.order = idx[k]; }); api.fb.className = 'fb ok'; api.fb.innerHTML = '✓ ' + why; },
      key(e){ const n = +e.key; if(n >= 1 && n <= items.length){ tapIt(n-1); return true; } if(e.key === 'Backspace'){ reset.click(); return true; } }, hint:'Нажимайте пункты по порядку (или клавиши 1–' + items.length + '); Backspace — заново' };
  };
}
/* pick: click drawn SVG objects. targets [{el, label}], right index */
function pick(targets, right, why, wrongs=[], onRight){
  return (body, api) => {
    let locked = false, cur = 0;
    const box = document.createElement('div'); box.className = 'hint'; box.textContent = 'Нажмите на объект на рисунке (или ←/→ и Enter).'; body.appendChild(box);
    const hlr = el('g', WORLD); S._pickhl = hlr;
    targets.forEach((t, i) => { t.el.style.cursor = 'pointer'; t._h = () => choose(i); t.el.addEventListener('click', t._h); });
    function ring(i){ hlr.innerHTML = ''; const b = targets[i].el.getBBox(); const m = targets[i].el.getCTM(), wm = WORLD.getCTM().inverse().multiply(m);
      const p1 = new DOMPoint(b.x, b.y).matrixTransform(wm), p2 = new DOMPoint(b.x + b.width, b.y + b.height).matrixTransform(wm);
      rect(hlr, Math.min(p1.x,p2.x) - 10, Math.min(p1.y,p2.y) - 10, Math.abs(p2.x-p1.x) + 20, Math.abs(p2.y-p1.y) + 20, { fill:'none', stroke:COL.orange, 'stroke-width':4, 'stroke-dasharray':'10 8' }); }
    function choose(i){ if(locked) return; cur = i; ring(i); if(i === right){ api.grade(true, why); onRight && onRight(); } else { api.grade(false, wrongs[i] || 'Это не то. Попробуйте ещё.'); fxShake(targets[i].el); } }
    const cleanup = () => { targets.forEach(t => { t.el.style.cursor = ''; t.el.removeEventListener('click', t._h); }); setTimeout(() => hlr.remove(), 900); };
    return { lock(){ locked = true; cleanup(); }, reveal(){ locked = true; ring(right); api.fb.className = 'fb ok'; api.fb.innerHTML = '✓ ' + why; onRight && onRight(); cleanup(); },
      key(e){ if(e.key === 'ArrowRight'){ cur = (cur+1) % targets.length; ring(cur); return true; } if(e.key === 'ArrowLeft'){ cur = (cur-1+targets.length) % targets.length; ring(cur); return true; } if(e.key === ' '){ choose(cur); return true; } } };
  };
}
function fxShake(e){ const x0 = e._s ? e._s.x || 0 : 0; if(!e._s) return; fx(q => { e._s.x = x0 + Math.sin(q*Math.PI*6)*8*(1-q); render(e); }, .5, 'lin'); }

/* ---------- finish card ---------- */
function finishCard(done){
  const c = card({ x:400, y:120, w:800 }, 'finish q');
  let r = 0, t = 0, qr = 0, qt = 0, pr = 0, pt = 0;
  for(const id in SCORE){ const s = SCORE[id]; r += s.r; t += s.t; if(id.startsWith('p-')){ pr += s.r; pt += s.t; } else { qr += s.r; qt += s.t; } }
  const pct = t ? Math.round(r/t*100) : 100;
  saveProgress(true);
  const nx = CHAPTER.next;
  const L = CHAPTER.lesson;
  c.innerHTML = `<div class="lab">${L ? 'Урок ' + CHAPTER.badge : 'Глава ' + CHAPTER.num} пройден${L ? '' : 'а'}</div><h2>${esc(CHAPTER.title)}</h2>
    <div class="big">${t ? pct + '%' : '✓'}</div><div style="color:var(--dim)">ответов с первой попытки</div>
    <div class="rows">${qt ? `<div><span>Быстрые проверки</span><b>${qr} из ${qt}</b></div>` : ''}<div><span>${L ? 'Вопросы урока' : 'Практика главы'}</span><b>${pr} из ${pt}</b></div></div>
    <div class="row" style="justify-content:center"><button class="btn" id="fRe">↺ Ещё раз (R)</button><button class="btn" id="fToc">Оглавление</button>${nx ? `<button class="btn go" id="fNx">${L ? 'Следующий урок' : 'Следующая глава'} → (Enter)</button>` : ''}</div>`;
  c.querySelector('#fRe').onclick = () => { for(const k in SCORE) delete SCORE[k]; QKEY = null; seek(0, true); };
  c.querySelector('#fToc').onclick = () => location.href = '../index.html';
  if(nx) c.querySelector('#fNx').onclick = () => location.href = nx;
  QKEY = e => { if(e.key === 'Enter' && nx){ location.href = nx; return true; } if(e.key === 'r' || e.key === 'R' || e.key === 'к' || e.key === 'К'){ c.querySelector('#fRe').click(); return true; } };
}

/* ---------- player chrome ---------- */
let MOB = false;
function fit(){
  const fr = document.getElementById('frame'), sc = document.getElementById('scaler'), cap = document.getElementById('caption'), bar = document.getElementById('bar');
  const kd = Math.min((innerWidth - 24)/1600, (innerHeight - 92)/900), mob = kd < .6;
  if(mob !== MOB){ MOB = mob; document.body.classList.toggle('mob', mob); (mob ? fr : sc).appendChild(CARDS); (mob ? fr : sc).appendChild(cap); }
  const rd = CARDS.querySelector('.reader');
  if(!mob){
    const barH = 72, W = innerWidth - 24, H = innerHeight - barH - 20, k = Math.min(W/1600, H/900);
    fr.style.width = 1600*k + 'px'; fr.style.height = 900*k + 'px';
    Object.assign(sc.style, { transform:`scale(${k})`, left:'0', top:'0', width:'1600px', height:'900px' });
    STAGE.setAttribute('viewBox', '0 0 1600 900'); STAGE.removeAttribute('preserveAspectRatio'); STAGE.style.width = STAGE.style.height = '';
    cap.style.left = cap.style.bottom = cap.style.maxWidth = '';
    if(rd) Object.assign(rd.style, { left:RDX.x + 'px', top:RDX.y + 'px', width:RDX.w + 'px', height:RDX.h + 'px' });
    return;
  }
  const W = innerWidth, H = innerHeight - bar.offsetHeight; let bx;
  fr.style.width = W + 'px'; fr.style.height = H + 'px';
  if(rd){
    let r;
    if(W <= H*1.05){ const s = Math.round(Math.min(W, H*.52)); bx = [0, 0, W, s]; r = [0, s, W, H - s]; }
    else { const s = Math.round(Math.min(H, W*.5)); bx = [0, 0, s, H]; r = [s, 0, W - s, H]; }
    Object.assign(rd.style, { left:r[0] + 'px', top:r[1] + 'px', width:r[2] + 'px', height:r[3] + 'px' });
    document.body.classList.toggle('mobl', W > H*1.05);
    STAGE.setAttribute('viewBox', '30 30 836 836');
  } else { bx = [0, 0, W, H]; STAGE.setAttribute('viewBox', '200 20 1200 860'); }
  STAGE.setAttribute('preserveAspectRatio', rd ? 'xMidYMid meet' : 'xMidYMid slice');
  document.body.classList.toggle('mint', !!CARDS.querySelector('.mintro'));
  Object.assign(sc.style, { transform:'none', left:bx[0] + 'px', top:bx[1] + 'px', width:bx[2] + 'px', height:bx[3] + 'px' });
  STAGE.style.width = STAGE.style.height = '100%';
  Object.assign(cap.style, { left:bx[0] + bx[2]/2 + 'px', bottom:H - bx[1] - bx[3] + 8 + 'px', maxWidth:bx[2] - 16 + 'px' });
}
function updBar(){
  const segs = document.getElementById('segs'); if(!segs) return;
  [...segs.children].forEach((s, i) => { s.className = (BEATS[i][3] && BEATS[i][3].ask ? 'q ' : '') + (i < CUR ? 'done' : i === CUR ? 'cur' : ''); if(i !== CUR) s.firstChild.style.width = i < CUR ? '0' : '0'; });
  document.getElementById('btitle').textContent = `${CUR+1}/${BEATS.length} · ${BEATS[CUR][1]}`;
  const pb = document.getElementById('bPlay'); pb.textContent = PLAYING && !WAITING ? '❚❚' : '▶';
  document.getElementById('bCap').classList.toggle('on', CAPS);
  document.getElementById('bMute').textContent = MUTED ? '🔇' : '🔊';
}
function toggleHelp(){
  const h = document.querySelector('.help'); if(h){ h.remove(); return; }
  const c = card({ x:430, y:110, w:740 }, 'help');
  c.innerHTML = `<div class="lab">Управление</div><table>
  <tr><td><kbd>Пробел</kbd></td><td>пауза / продолжить</td></tr><tr><td><kbd>←</kbd> <kbd>→</kbd></td><td>предыдущий / следующий шаг</td></tr>
  <tr><td><kbd>Home</kbd></td><td>начать главу заново</td></tr><tr><td><kbd>C</kbd></td><td>субтитры</td></tr><tr><td><kbd>M</kbd></td><td>звук озвучки</td></tr>
  <tr><td><kbd>F</kbd></td><td>полный экран</td></tr><tr><td><kbd>?</kbd></td><td>эта справка</td></tr></table>
  <p style="font-size:18px;color:var(--dim)">Озвучка использует голос вашего браузера. Самые естественные русские голоса — в Microsoft Edge (Svetlana, Dmitry Online). В Яндекс Браузере доступны только системные голоса — звучат роботизированно. Выбрать голос и скорость можно кнопкой ⚙.</p>
  <div class="row"><button class="btn go" onclick="this.closest('.card').remove()">Понятно</button></div>`;
}
function toggleSettings(){
  const h = document.querySelector('.settings'); if(h){ h.remove(); return; }
  const c = document.createElement('div'); c.className = 'card settings'; CARDS.appendChild(c);
  const vs = SPEECH_OK ? speechSynthesis.getVoices().filter(v => /^ru/i.test(v.lang)) : [];
  c.innerHTML = `<div class="lab">Озвучка</div>Голос<select id="sV">${vs.length ? vs.map(v => `<option ${VOICE && v.name === VOICE.name ? 'selected' : ''}>${esc(v.name)}</option>`).join('') : '<option>Русских голосов не найдено — только субтитры</option>'}</select>
   Скорость<select id="sR">${[.85, 1, 1.15, 1.3, 1.5].map(r => `<option value="${r}" ${r === RATE ? 'selected' : ''}>${r}×</option>`).join('')}</select><div class="row"><button class="btn go">Готово</button></div>`;
  c.querySelector('#sV').onchange = e => { VOICE = vs.find(v => v.name === e.target.value) || VOICE; localStorage.setItem('pm:voice', VOICE ? VOICE.name : ''); };
  c.querySelector('#sR').onchange = e => { RATE = +e.target.value; localStorage.setItem('pm:rate', RATE); };
  c.querySelector('button').onclick = () => { c.remove(); seek(CUR, PLAYING); };
}
function buildChrome(){
  document.body.innerHTML = `<div id="app"><div id="frame"><div id="scaler"><svg id="stage" viewBox="0 0 1600 900" xmlns="${NS}"><defs></defs><g id="bg"></g><g id="world"></g></svg><div id="cards"></div><div id="caption"></div></div></div>
  <div id="bar"><a href="../index.html" title="Оглавление">☰</a><button id="bHome" title="Сначала (Home)">⏮</button><button id="bPrev" title="Назад (←)">◀</button><button id="bPlay" class="play" title="Пауза (Пробел)">▶</button><button id="bNext" title="Вперёд (→)">▶▶</button>
  <div id="segs"></div><div id="btitle"></div><button id="bCap" title="Субтитры (C)">CC</button><button id="bMute" title="Звук (M)">🔊</button><button id="bSet" title="Голос и скорость">⚙</button><button id="bFull" title="Полный экран (F)">⛶</button><button id="bHelp" title="Справка (?)">?</button></div></div>`;
  STAGE = document.getElementById('stage'); WORLD = document.getElementById('world'); CARDS = document.getElementById('cards'); DEFS = STAGE.querySelector('defs');
  DEFS.innerHTML = `<filter id="pencil" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".05" numOctaves="2" seed="7"/><feDisplacementMap in="SourceGraphic" scale="1.4"/></filter>
   <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="9"/></filter>
   <filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="3"/><feColorMatrix values="0 0 0 0 .42  0 0 0 0 .31  0 0 0 0 .16  0 0 0 .07 0"/></filter>
   <radialGradient id="vign" cx="50%" cy="45%" r="75%"><stop offset="60%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#6b4a1e" stop-opacity=".22"/></radialGradient>
   <pattern id="geo" width="80" height="80" patternUnits="userSpaceOnUse"><g fill="none" stroke="#d9c79c" stroke-width="1.3"><path d="M40 8 L49 31 L72 40 L49 49 L40 72 L31 49 L8 40 L31 31Z"/><rect x="22" y="22" width="36" height="36" transform="rotate(45 40 40)"/><path d="M0 0L8 8M80 0L72 8M0 80L8 72M80 80L72 72"/></g></pattern>
   <filter id="shadow" x="-10%" y="-10%" width="130%" height="140%"><feDropShadow dx="0" dy="6" stdDeviation="7" flood-color="#2b2b3a" flood-opacity=".16"/></filter>
   <pattern id="gridp" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="#e6dcc4" stroke-width="1.2"/></pattern>
   <marker id="arr" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="context-stroke"/></marker>`;
  const bg = document.getElementById('bg');
  el('rect', bg, { x:0, y:0, width:1600, height:900, fill:COL.paper });
  el('rect', bg, { x:0, y:0, width:1600, height:900, filter:'url(#grain)' });
  el('rect', bg, { x:0, y:0, width:1600, height:900, fill:'url(#vign)' });
  // manuscript frame: double gold rule + corner rosettes
  const dg = G(bg); dg.setAttribute('class', 'deco');
  el('rect', dg, { x:18, y:18, width:1564, height:864, rx:4, fill:'none', stroke:COL.gold, 'stroke-width':3 });
  el('rect', dg, { x:28, y:28, width:1544, height:844, rx:2, fill:'none', stroke:COL.gold, 'stroke-width':1.2, opacity:.8 });
  [[28,28],[1572,28],[28,872],[1572,872]].forEach(([x,y]) => { const g = G(dg, { x, y }); star8(g, 0, 0, 15, { fill:COL.paper, stroke:COL.gold, 'stroke-width':2 }); circ(g, 0, 0, 4, { fill:COL.gold, stroke:'none' }); });
  // corner badge: eight-pointed star with chapter number
  const b = G(dg, { x:1512, y:82 });
  star8(b, 0, 0, 40, { fill:COL.emerald, stroke:COL.gold2, 'stroke-width':3 }); circ(b, 0, 0, 24, { fill:'none', stroke:COL.gold2, 'stroke-width':1.5 });
  T(b, CHAPTER.badge || String(CHAPTER.num), { y:9, size:26, weight:700, font:SERIF, fill:'#fbf3dc' });
  const segs = document.getElementById('segs');
  BEATS.forEach((bt, i) => { const s = document.createElement('i'); s.title = `${i+1}. ${bt[1]}`; s.appendChild(document.createElement('b')); s.onclick = () => { if(document.querySelector('.q') && WAITING) QKEY = null; seek(i, true); }; segs.appendChild(s); });
  document.getElementById('bHome').onclick = () => seek(0, true);
  document.getElementById('bPrev').onclick = () => { QKEY = null; seek(CUR - 1, true); };
  document.getElementById('bNext').onclick = () => { QKEY = null; if(CUR < BEATS.length-1) seek(CUR + 1, true); };
  document.getElementById('bPlay').onclick = togglePlay;
  document.getElementById('bCap').onclick = () => { CAPS = !CAPS; localStorage.setItem('pm:caps', CAPS ? '1' : '0'); updBar(); };
  document.getElementById('bMute').onclick = toggleMute;
  document.getElementById('bSet').onclick = toggleSettings;
  document.getElementById('bFull').onclick = toggleFull;
  document.getElementById('bHelp').onclick = toggleHelp;
  addEventListener('resize', fit); fit();
}
function toggleMute(){ MUTED = !MUTED; localStorage.setItem('pm:muted', MUTED ? '1' : '0'); if(MUTED) stopSpeech(); else if(PLAYING && !WAITING){ const s = NAR.sents.find(s => ciAt(CLOCK) < s.b); speakFrom(s ? s.a : 1e9); } updBar(); }
function toggleFull(){ if(document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen && document.documentElement.requestFullscreen(); }
function onKey(e){
  if(e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')){ if(e.key === 'Escape') e.target.blur(); else if(!(e.key === 'Enter' && QKEY)) return; }
  if(QKEY && QKEY(e)){ e.preventDefault(); return; }
  const k = e.key;
  if(k === ' '){ e.preventDefault(); togglePlay(); }
  else if(k === 'ArrowRight' && (!WAITING || e.shiftKey)){ QKEY = null; if(CUR < BEATS.length-1) seek(CUR + 1, true); }
  else if(k === 'ArrowLeft' && (!WAITING || e.shiftKey)){ QKEY = null; seek(CUR - 1, true); }
  else if(k === 'Home'){ seek(0, true); }
  else if(k === 'c' || k === 'C' || k === 'с' || k === 'С'){ CAPS = !CAPS; updBar(); }
  else if(k === 'm' || k === 'M' || k === 'ь' || k === 'Ь'){ toggleMute(); }
  else if(k === 'f' || k === 'F' || k === 'а' || k === 'А'){ toggleFull(); }
  else if(k === '?' || k === ','){ toggleHelp(); }
  else if(k === 'Escape'){ document.querySelectorAll('.help,.settings').forEach(x => x.remove()); }
}

/* ---------- boot ---------- */
function mobNote(){
  const ios = /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent) && 'ontouchend' in document;
  if(!SPEECH_OK || !VOICE) return 'Русский голос не найден — урок пойдёт с текстом и субтитрами.' + (ios ? ' Добавьте голос: Настройки → Универсальный доступ → Устный контент → Голоса → Русский.' : ' Установите «Синтезатор речи Google» и русский голосовой пакет.');
  if(/Google|Natural|Online|Enhanced|улучш|Premium/i.test(VOICE.name)) return 'Урок озвучен голосом устройства · нажмите на фразу в тексте, чтобы начать с неё';
  return ios ? 'Голос звучит лучше, если скачать «Милена (улучшенный)»: Настройки → Универсальный доступ → Устный контент → Голоса → Русский.' : 'Для более естественного голоса выберите «Синтезатор речи Google» в настройках озвучки Android.';
}
function boot(){
  for(const [id] of BEATS) PARSED[id] = parseNar(NARR[id] || '');
  document.title = `${CHAPTER.lesson ? 'Урок ' + CHAPTER.badge + '. ' : CHAPTER.num ? 'Глава ' + CHAPTER.num + '. ' : ''}${CHAPTER.title} — ${BOOK_TITLE}`;
  buildChrome();
  addEventListener('keydown', onKey);
  const qs = new URLSearchParams(location.search);
  if(qs.has('beat')){ // frozen frame for review: ?beat=N&t=S
    const n = clamp(+qs.get('beat') - 1, 0, BEATS.length - 1);
    MUTED = true; seek(n, false); const t = qs.has('t') ? +qs.get('t') : 1e6; CLOCK = t; stepTL(t);
    if(t >= 1e6){ const o = BEATS[n][3]; if(o && o.ask){ WAITING = true; o.ask(() => {}); } }
    requestAnimationFrame(loop); return;
  }
  const saved = loadProgress(); const resume = saved.last && saved.last.ch === CHAPTER.num && saved.last.beat > 0 && saved.last.beat < BEATS.length - 1 ? saved.last.beat : 0;
  seek(resume, false);
  const ov = document.createElement('div'); ov.className = 'overlay q';
  ov.innerHTML = `<button class="startbtn">▶ ${resume ? 'Продолжить с шага ' + (resume+1) : 'Начать урок'}</button>${resume ? '<button class="startbtn" style="margin-left:16px;background:#6b6a75" id="fromStart">⏮ Сначала</button>' : ''}<div class="startnote">${MOB ? mobNote() : SPEECH_OK && VOICE ? (/Natural|Online|Google/i.test(VOICE.name) ? 'Урок озвучен голосом браузера · пробел — пауза · ? — справка' : 'Сейчас доступен только системный голос — он звучит роботизированно. Для естественного голоса откройте книгу в Microsoft Edge.') : 'Русский голос в браузере не найден — урок пойдёт с субтитрами. Лучше всего открыть в Microsoft Edge.'}</div>`;
  CARDS.appendChild(ov);
  const go = from => { ov.remove(); QKEY = null; VOICE = VOICE || pickVoice(); if(from !== CUR) seek(from, true); else { PLAYING = true; speakFrom(0); updBar(); } };
  ov.querySelector('.startbtn').onclick = () => go(resume);
  const fs = ov.querySelector('#fromStart'); if(fs) fs.onclick = () => go(0);
  QKEY = e => { if(e.key === 'Enter' || e.key === ' '){ go(resume); return true; } return false; };
  requestAnimationFrame(loop);
}
