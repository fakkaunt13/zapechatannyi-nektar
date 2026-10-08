/* scene.js — painterly, colourful scenery for plates. NO human figures: landscapes, sky, architecture, animals, objects. */
const TEXDIR = '../lib/tex/';
let _uid = 0; const uid = p => (p || 'u') + (++_uid) + Math.random().toString(36).slice(2, 5);
const _gcache = {};
function LG(stops, o){ o = Object.assign({ x1:0, y1:0, x2:0, y2:1 }, o||{}); const key = 'L' + JSON.stringify([stops, o]); if(_gcache[key] && document.getElementById(_gcache[key])) return `url(#${_gcache[key]})`;
  const id = uid('lg'); const g = el('linearGradient', DEFS, Object.assign({ id }, o)); stops.forEach(([of, c, op]) => el('stop', g, { offset:of, 'stop-color':c, 'stop-opacity':op ?? 1 })); _gcache[key] = id; return `url(#${id})`; }
function RG(stops, o){ o = Object.assign({ cx:.5, cy:.5, r:.5 }, o||{}); const key = 'R' + JSON.stringify([stops, o]); if(_gcache[key] && document.getElementById(_gcache[key])) return `url(#${_gcache[key]})`;
  const id = uid('rg'); const g = el('radialGradient', DEFS, Object.assign({ id }, o)); stops.forEach(([of, c, op]) => el('stop', g, { offset:of, 'stop-color':c, 'stop-opacity':op ?? 1 })); _gcache[key] = id; return `url(#${id})`; }
function sdefs(){
  if(document.getElementById('tx-rock')) return;
  [['grain', 256], ['rock', 220], ['sand', 300], ['paper', 420]].forEach(([n, s]) => { const pt = el('pattern', DEFS, { id:'tx-' + n, width:s, height:s, patternUnits:'userSpaceOnUse' }); el('image', pt, { href:TEXDIR + n + '.png', x:0, y:0, width:s, height:s, preserveAspectRatio:'none' }); });
  const f = (id, sd) => { const fl = el('filter', DEFS, { id, x:'-30%', y:'-30%', width:'160%', height:'160%' }); el('feGaussianBlur', fl, { stdDeviation:sd }); };
  f('soft2', 2); f('soft4', 4); f('soft8', 8); f('soft16', 16); f('soft30', 30);
}
/* SMIL ambient loops (on inner groups only — never on elements driven by st()) */
function anim(e, attr, values, dur, o){ o = o || {}; const a = document.createElementNS(NS, attr === 'transform' ? 'animateTransform' : 'animate');
  a.setAttribute('attributeName', attr); if(attr === 'transform') a.setAttribute('type', o.type || 'rotate'); a.setAttribute('values', values); a.setAttribute('dur', dur + 's'); a.setAttribute('repeatCount', 'indefinite');
  if(o.begin != null) a.setAttribute('begin', o.begin + 's'); if(o.spline){ a.setAttribute('calcMode', 'spline'); a.setAttribute('keySplines', o.spline); } if(o.additive) a.setAttribute('additive', 'sum'); e.appendChild(a); return a; }
const EZ2 = '.45 0 .55 1;.45 0 .55 1';
function rng(seed){ let s = (seed*2654435761 >>> 0) % 233280 || 7; return () => (s = (s*9301 + 49297) % 233280)/233280; }
function noise1(seed){ const R = rng(seed), V = Array.from({ length:512 }, R); return x => { const i = Math.floor(x), f = x - i, a = V[((i % 512) + 512) % 512], b = V[(((i + 1) % 512) + 512) % 512], u = (1 - Math.cos(f*Math.PI))/2; return a + (b - a)*u; }; }
const shade = (c, q) => q > 0 ? mixc(c, '#fff8e8', q) : mixc(c, '#1a1008', -q);

/* ---------- palettes ---------- */
const SKY = {
  day:  [[0, '#6fa5d0'], [.48, '#acd0e2'], [.84, '#f0e4c4'], [1, '#f8d79c']],
  noon: [[0, '#86bce0'], [.55, '#cfe4ea'], [.9, '#faedc8'], [1, '#fde0a2']],
  dawn: [[0, '#25325e'], [.36, '#67588c'], [.63, '#d8898b'], [.85, '#f6b877'], [1, '#ffe2a2']],
  dusk: [[0, '#222957'], [.32, '#6e3f78'], [.6, '#d6616a'], [.83, '#f49c50'], [1, '#ffd486']],
  night:[[0, '#050d21'], [.55, '#0f2549'], [.88, '#233d67'], [1, '#36507a']],
};
const RIDGE = {
  day:  [['#b8a9c0', '#d6c8c6'], ['#cc916a', '#b27852'], ['#a46d47', '#85573a']],
  noon: [['#cdbfb9', '#e4d7c5'], ['#d6a474', '#bf8b5c'], ['#b37b4d', '#966240']],
  dawn: [['#8f739c', '#a888a2'], ['#5f4b74', '#4e3e60'], ['#3b2d47', '#2b2135']],
  dusk: [['#a6597c', '#c06d7c'], ['#5d3158', '#4d294a'], ['#2e1b31', '#201323']],
  night:[['#2a3d64', '#31466d'], ['#1d2c4c', '#18253f'], ['#121b30', '#0d1526']],
};
const SAND = { day:['#f5d696', '#e2ad65', '#b47442'], noon:['#f9e2aa', '#eabd78', '#c48a52'], dawn:['#efb98b', '#d08b69', '#8b5a5d'], dusk:['#eea06a', '#c46f4c', '#733c3c'], night:['#454055', '#2f2c3e', '#1c1a28'] };
const RIM = { day:'#fff3d6', noon:'#fffaf0', dawn:'#ffd7a6', dusk:'#ffb27a', night:'#a9c0e8' };
const DARKMODE = m => m === 'night' || m === 'dusk' || m === 'dawn' || m === 'cave' || m === 'interior';

/* ---------- sky ---------- */
function skyFill(q, mode, o){ o = o || {}; sdefs();
  const g = G(q); rect(g, PL.x - 2, PL.y - 2, PL.w + 4, PL.h + 4, { rx:0, fill:LG(SKY[mode] || SKY.day), stroke:'none' });
  if(mode === 'night' || mode === 'dawn'){ // stars
    const R = rng(o.seed || 3), n = mode === 'night' ? (o.stars ?? 110) : 30, hmax = (o.hz || 560) - PL.y - 40;
    for(let i = 0; i < n; i++){ const x = PL.x + R()*PL.w, y = PL.y + Math.pow(R(), 1.4)*hmax, r = .6 + Math.pow(R(), 3)*2.4;
      const s = circ(g, x, y, r, { fill:R() < .2 ? '#cfe0ff' : '#fff6dc', stroke:'none', opacity:(mode === 'dawn' ? .35 : .55) + R()*.45 });
      if(R() < .3) anim(s, 'opacity', '1;.25;1', 2 + R()*4, { begin:-R()*5 }); }
    if(mode === 'night') for(let i = 0; i < 4; i++){ const x = PL.x + 60 + R()*(PL.w - 120), y = PL.y + 30 + R()*(hmax*.6); const sp = G(g, { x, y });
      circ(sp, 0, 0, 7, { fill:'#fff6dc', stroke:'none', opacity:.25, filter:'url(#soft4)' }); path(sp, 'M-9 0H9M0 -9V9', { stroke:'#fffbe8', 'stroke-width':1.3, opacity:.85 }); circ(sp, 0, 0, 1.8, { fill:'#fff', stroke:'none' }); anim(sp, 'opacity', '1;.5;1', 3 + i, { begin:-i }); }
    if(mode === 'night' && o.milky !== false){ const mw = G(g, { o:.18 }); el('ellipse', mw, { cx:PL.x + PL.w*.55, cy:PL.y + 150, rx:520, ry:60, fill:'#c9d6ff', transform:`rotate(-24 ${PL.x + PL.w*.55} ${PL.y + 150})`, filter:'url(#soft30)' }); }
  }
  return g; }
function sun(q, x, y, r=46, mode='day'){ sdefs(); const g = G(q, { x, y });
  const core = mode === 'dusk' || mode === 'dawn' ? ['#fff2c8', '#ffb35a'] : ['#fffef4', '#ffe28a'];
  const halo = circ(g, 0, 0, r*5.5, { fill:RG([[0, core[1], .55], [.35, core[1], .22], [1, core[1], 0]]), stroke:'none' }); anim(halo, 'opacity', '1;.82;1', 6, { spline:EZ2 });
  if(false){ const rays = G(g, { o:.22 }); const rr = G(rays); for(let i = 0; i < 14; i++){ const a = i/14*360; path(rr, `M0 0L${r*7} -${r*.35}L${r*7} ${r*.35}Z`, { fill:LG([[0, '#fff7d8', .9], [1, '#fff7d8', 0]], { x1:0, y1:0, x2:1, y2:0 }), stroke:'none', transform:`rotate(${a})` }); } anim(rr, 'transform', '0;360', 160); }
  circ(g, 0, 0, r*1.25, { fill:core[0], stroke:'none', opacity:.5, filter:'url(#soft8)' });
  circ(g, 0, 0, r, { fill:RG([[0, '#ffffff'], [.6, core[0]], [1, core[1]]]), stroke:'none' }); return g; }
function cloud(q, x, y, s=1, mode='day', o){ o = o || {}; sdefs(); const g = G(q, { x, y, s, o:o.o ?? 1 }); const gi = G(g);
  const C = { day:['#ffffff', '#d9e6ef'], noon:['#ffffff', '#e4edf0'], dawn:['#ffd9c0', '#c98a96'], dusk:['#ffc29a', '#a95a74'], night:['#3b4f78', '#22355a'] }[mode] || ['#fff', '#ddd'];
  const B = G(gi, { o:mode === 'night' ? .5 : .95 }); B.setAttribute('filter', 'url(#soft4)');
  [[-70, 8, 60, 22], [-20, -6, 56, 30], [40, 0, 64, 26], [90, 10, 46, 18], [0, 14, 120, 18]].forEach(([cx, cy, rx, ry]) => el('ellipse', B, { cx, cy:cy + 6, rx, ry, fill:C[1] }));
  [[-64, 2, 52, 18], [-18, -12, 48, 24], [38, -6, 56, 20], [86, 4, 38, 14]].forEach(([cx, cy, rx, ry]) => el('ellipse', B, { cx, cy, rx, ry, fill:C[0] }));
  anim(gi, 'transform', `0 0;${o.drift ?? 40} 0;0 0`, o.dur || 46, { type:'translate', begin:-(o.phase || 0), spline:EZ2 }); return g; }

/* ---------- terrain ---------- */
function ridge(q, o){ sdefs();
  o = Object.assign({ y:560, amp:140, seed:1, cols:['#c98f69', '#a9714f'], rim:null, tex:.5, freq:1/170, sharp:.7, x0:PL.x - 10, x1:PL.x + PL.w + 10, bottom:PL.y + PL.h + 4, step:6, o:1 }, o||{});
  const n1 = noise1(o.seed), n2 = noise1(o.seed + 17), n3 = noise1(o.seed + 41);
  const H = x => { const a = n1(x*o.freq), b = n2(x*o.freq*2.3), c = n3(x*o.freq*6); const rd = 1 - Math.abs(2*a - 1); return (o.sharp*rd + (1 - o.sharp)*a)*.65 + b*.25 + c*.1; };
  const pts = []; for(let x = o.x0; x <= o.x1; x += o.step) pts.push([x, o.y - H(x)*o.amp]);
  const top = pts.map(([x, y], i) => (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1)).join('');
  const d = top + `L${o.x1} ${o.bottom}L${o.x0} ${o.bottom}Z`;
  const g = G(q, { o:o.o }); path(g, d, { fill:LG([[0, o.cols[0]], [1, o.cols[1]]]), stroke:'none' });
  // light/shadow facets: slopes facing left (sun) lighter
  let fd = ''; for(let i = 1; i < pts.length; i++){ const [xa, ya] = pts[i - 1], [xb, yb] = pts[i]; if(yb > ya + .6) fd += `M${xa.toFixed(1)} ${ya.toFixed(1)}L${xb.toFixed(1)} ${yb.toFixed(1)}L${xb.toFixed(1)} ${(yb + 60 + (o.y - yb)*.5).toFixed(1)}L${xa.toFixed(1)} ${(ya + 60 + (o.y - ya)*.5).toFixed(1)}Z`; }
  if(o.tex) path(g, d, { fill:'url(#tx-rock)', stroke:'none', opacity:o.tex });
  if(o.rim) path(g, top, { stroke:o.rim, 'stroke-width':2.2, opacity:.55, fill:'none' });
  g.H = x => o.y - H(x)*o.amp; return g; }
function ridges(q, mode, o){ o = Object.assign({ hz:560, n:3, seed:5, amp:[150, 120, 80] }, o||{}); const P = RIDGE[mode] || RIDGE.day, out = [];
  const ys = [o.hz - 40, o.hz - 5, o.hz + 40], fr = [1/220, 1/170, 1/120];
  for(let i = 3 - o.n; i < 3; i++){ out.push(ridge(q, { y:ys[i], amp:o.amp[i], seed:o.seed + i*7, cols:P[i], rim:i === 2 || i === 1 ? RIM[mode] : null, tex:i ? .55 : .2, freq:fr[i], sharp:.75 - i*.15 }));
    if(i < 2 && mode !== 'night') rect(q, PL.x, PL.y, PL.w, PL.h, { rx:0, fill:LG([[0, '#fff', 0], [(ys[i] - PL.y)/PL.h, (SKY[mode] || SKY.day).slice(-1)[0][1], .25], [1, '#fff', 0]]), stroke:'none' }); }
  return out; }
function dune(q, x, y, wd, h, mode='day', o){ o = o || {}; const S = SAND[mode] || SAND.day; const g = G(q);
  const body = `M${x - wd/2} ${y}C${x - wd*.3} ${y - h*.15} ${x - wd*.18} ${y - h} ${x} ${y - h}C${x + wd*.12} ${y - h*.95} ${x + wd*.3} ${y - h*.3} ${x + wd/2} ${y}Z`;
  path(g, body, { fill:LG([[0, shade(S[0], .15)], [.5, S[0]], [1, S[1]]]), stroke:'none' });
  path(g, `M${x} ${y - h}C${x + wd*.12} ${y - h*.95} ${x + wd*.3} ${y - h*.3} ${x + wd/2} ${y}L${x + wd*.06} ${y}C${x + wd*.05} ${y - h*.4} ${x + wd*.03} ${y - h*.75} ${x} ${y - h}Z`, { fill:S[2], stroke:'none', opacity:.55 });
  path(g, body, { fill:'url(#tx-sand)', stroke:'none', opacity:.8 });
  path(g, `M${x - wd*.3} ${y - h*.28}C${x - wd*.18} ${y - h*.9} ${x - wd*.06} ${y - h} ${x} ${y - h}`, { stroke:RIM[mode], 'stroke-width':2, opacity:.5, fill:'none' });
  const R = rng(Math.round(x + y)); for(let i = 0; i < 4; i++){ const yy = y - h*(.15 + i*.17), xa = x - wd*(.38 - i*.06); path(g, `M${xa} ${yy}q${wd*.08} ${-h*.06} ${wd*.18} ${-h*.02}`, { stroke:S[2], 'stroke-width':1.4, opacity:.28 + R()*.1, fill:'none' }); }
  return g; }
function duneField(q, mode='day', o){ o = Object.assign({ hz:560, seed:2, rows:3 }, o||{}); const S = SAND[mode] || SAND.day, R = rng(o.seed), bot = PL.y + PL.h + 4;
  const g = G(q); rect(g, PL.x - 2, o.hz, PL.w + 4, bot - o.hz, { rx:0, fill:LG([[0, S[1]], [1, S[0]]]), stroke:'none' }); rect(g, PL.x - 2, o.hz, PL.w + 4, bot - o.hz, { rx:0, fill:'url(#tx-sand)', stroke:'none', opacity:.7 });
  const span = bot - o.hz;
  for(let r = 0; r < o.rows; r++){ const y = o.hz + span*(.25 + r*.33), sc = .5 + r*.5; let x = PL.x - 80 + R()*80;
    while(x < PL.x + PL.w + 100){ const wd = (220 + R()*200)*sc, h = (30 + R()*40)*sc; dune(g, x + wd/2, y + 4, wd, h, mode); x += wd*(.55 + R()*.3); } }
  return g; }
function ground(q, mode='day', o){ o = Object.assign({ hz:560, kind:'flat', seed:4 }, o||{}); const bot = PL.y + PL.h + 4, g = G(q);
  if(o.kind === 'harra'){ rect(g, PL.x - 2, o.hz, PL.w + 4, bot - o.hz, { rx:0, fill:LG(mode === 'night' ? [[0, '#262838'], [1, '#14151f']] : [[0, '#6a5d52'], [1, '#3a322c']]), stroke:'none' }); rect(g, PL.x, o.hz, PL.w, bot - o.hz, { rx:0, fill:'url(#tx-rock)', stroke:'none', opacity:.9 });
    const R = rng(o.seed); for(let i = 0; i < 70; i++){ const t = R(), y = o.hz + 8 + Math.pow(t, 1.3)*(bot - o.hz), s = .4 + (y - o.hz)/(bot - o.hz)*1.4, x = PL.x + R()*PL.w; stone(g, x, y, (8 + R()*14)*s, mode === 'night' ? '#30323f' : '#4a403a'); }
    return g; }
  const S = SAND[mode] || SAND.day; rect(g, PL.x - 2, o.hz, PL.w + 4, bot - o.hz, { rx:0, fill:LG([[0, S[1]], [.5, S[0]], [1, S[1]]]), stroke:'none' }); rect(g, PL.x - 2, o.hz, PL.w + 4, bot - o.hz, { rx:0, fill:'url(#tx-sand)', stroke:'none', opacity:.75 });
  const R = rng(o.seed); for(let i = 0; i < 26; i++){ const y = o.hz + 10 + Math.pow(R(), 1.2)*(bot - o.hz - 10), x = PL.x + R()*PL.w, s = .4 + (y - o.hz)/(bot - o.hz); stone(g, x, y, (3 + R()*6)*s, shade(S[2], -.1)); }
  return g; }
function stone(p, x, y, r, c){ const g = G(p, { x, y }); el('ellipse', g, { cx:r*.2, cy:r*.35, rx:r*1.1, ry:r*.35, fill:'#000', opacity:.22 }); path(g, `M${-r} 0C${-r} ${-r*.8} ${-r*.2} ${-r} ${r*.3} ${-r*.8}C${r} ${-r*.5} ${r} 0 ${r*.6} ${r*.2}C0 ${r*.35} ${-r*.6} ${r*.3} ${-r} 0Z`, { fill:LG([[0, shade(c, .35)], [1, shade(c, -.25)]]), stroke:'none' }); return g; }
/* rocky mass from a path, with texture and a sunlit rim */
function rockMass(q, d, o){ o = Object.assign({ c:['#b08a64', '#6e5038'], rim:'#ffe9c4', tex:.85, o:1 }, o||{}); sdefs(); const g = G(q, { o:o.o });
  path(g, d, { fill:LG([[0, o.c[0]], [1, o.c[1]]], { x1:0, y1:0, x2:.4, y2:1 }), stroke:'none' }); path(g, d, { fill:'url(#tx-rock)', stroke:'none', opacity:o.tex });
  if(o.rim) path(g, d, { fill:'none', stroke:o.rim, 'stroke-width':2, opacity:.35 }); return g; }
function caveMouth(q, x, y, s=1, o){ o = Object.assign({ glow:.25, night:false }, o||{}); sdefs(); const g = G(q, { x, y, s });
  const rk = o.night ? ['#4a4558', '#25222f'] : ['#9a7a5a', '#5b4430'];
  rockMass(g, 'M-170 70C-180 -10 -130 -120 -40 -138C40 -150 140 -100 168 -10C180 30 176 60 170 70Z', { c:rk, rim:o.night ? '#a9c0e8' : '#ffe2b8' });
  path(g, 'M-70 70C-74 0 -46 -58 0 -64C46 -60 74 -4 72 70Z', { fill:RG([[0, '#000'], [.75, '#0c0a0e'], [1, '#2b2530']], { cy:.8, r:.7 }), stroke:'none' });
  if(o.glow) circ(g, 0, 20, 40, { fill:'#ffd98a', stroke:'none', opacity:o.glow, filter:'url(#soft16)' });
  [[-120, 64, 18], [118, 60, 22], [-40, 74, 10], [60, 76, 12]].forEach(([sx, sy, r]) => stone(g, sx, sy, r, rk[0])); return g; }
function veil(q, a=.55, c='#f7ecd3'){ return rect(q, PL.x - 2, PL.y - 2, PL.w + 4, PL.h + 4, { rx:0, fill:c, stroke:'none', opacity:a }); }
/* parchment backdrop for diagram plates — warm, with colour washes */
function paperBg(q, o){ o = Object.assign({ c:'#f4e5c3' }, o||{}); sdefs(); const g = G(q);
  rect(g, PL.x - 2, PL.y - 2, PL.w + 4, PL.h + 4, { rx:0, fill:RG([[0, shade(o.c, .35)], [.7, o.c], [1, shade(o.c, -.12)]], { cy:.42, r:.75 }), stroke:'none' });
  const W = G(g, { o:.16 }); W.setAttribute('filter', 'url(#soft30)');
  circ(W, PL.x + PL.w - 90, PL.y + 90, 220, { fill:'#2f8a8a', stroke:'none' }); circ(W, PL.x + 80, PL.y + PL.h - 60, 240, { fill:'#c8553d', stroke:'none' }); circ(W, PL.x + 120, PL.y + 120, 140, { fill:'#d9a441', stroke:'none' });
  rect(g, PL.x, PL.y, PL.w, PL.h, { rx:0, fill:'url(#tx-paper)', stroke:'none', opacity:1 });
  // faint geometric corner ornaments
  [[PL.x + 70, PL.y + 70], [PL.x + PL.w - 70, PL.y + 70], [PL.x + 70, PL.y + PL.h - 70], [PL.x + PL.w - 70, PL.y + PL.h - 70]].forEach(([x, y]) => { const r = G(g, { o:.22 }); rosette(r, x, y, 46, 8); });
  return g; }
/* interior: plastered wall, beams, warm lamp light */
function interior(q, o){ o = Object.assign({ wall:'#e0b582', lampX:PL.x + PL.w*.5, lampY:PL.y + 260 }, o||{}); sdefs(); const g = G(q);
  rect(g, PL.x - 2, PL.y - 2, PL.w + 4, PL.h + 4, { rx:0, fill:LG([[0, shade(o.wall, -.45)], [.6, shade(o.wall, -.15)], [1, shade(o.wall, -.5)]]), stroke:'none' }); rect(g, PL.x, PL.y, PL.w, PL.h, { rx:0, fill:'url(#tx-paper)', stroke:'none', opacity:1 });
  for(let i = 0; i < 3; i++){ const ax = PL.x + 130 + i*270, ay = PL.y + PL.h*.3; path(g, `M${ax - 85} ${PL.y + PL.h*.78}V${ay + 80}Q${ax - 85} ${ay} ${ax} ${ay - 10}Q${ax + 85} ${ay} ${ax + 85} ${ay + 80}V${PL.y + PL.h*.78}Z`, { fill:LG([[0, shade(o.wall, -.55)], [1, shade(o.wall, -.35)]]), stroke:shade(o.wall, .2), 'stroke-width':3, opacity:.8 }); }
  for(let i = 0; i < 6; i++){ const x = PL.x + 40 + i*150; rect(g, x, PL.y - 2, 26, PL.h*.12, { rx:0, fill:'#3a2414', stroke:'none', opacity:.8 }); }
  rect(g, PL.x - 2, PL.y + PL.h*.12, PL.w + 4, 16, { rx:0, fill:'#4a2e18', stroke:'none' });
  rect(g, PL.x - 2, PL.y + PL.h*.78, PL.w + 4, PL.h*.22 + 4, { rx:0, fill:LG([[0, '#5a3a22'], [1, '#2a1a0e']]), stroke:'none' });
  for(let i = 0; i < 5; i++) rect(g, PL.x + 30 + i*160, PL.y + PL.h*.8, 140, 40, { rx:4, fill:['#8a2f2a', '#2f5a6a', '#9a6a2a', '#5a2f4a', '#2f6a4a'][i], stroke:'#d9b46a', 'stroke-width':1.5, opacity:.75 });
  const L = G(g, { x:o.lampX, y:o.lampY }); const gl = circ(L, 0, 0, 260, { fill:RG([[0, '#ffd27a', .55], [.4, '#ffb04a', .18], [1, '#ffb04a', 0]]), stroke:'none' }); anim(gl, 'opacity', '1;.85;.95;.8;1', 2.4);
  oilLamp(L, 0, 0, 1.2); return g; }
function oilLamp(p, x, y, s=1){ const g = G(p, { x, y, s });
  path(g, 'M-34 6C-30 26 30 26 40 4L56 -4C44 -6 36 -2 30 0C10 -8 -20 -8 -34 6Z', { fill:LG([[0, '#d9a45a'], [1, '#7a4a1e']]), stroke:'#5a3412', 'stroke-width':1.5 });
  const fl = G(g, { x:52, y:-8 }); const fi = G(fl); path(fi, 'M0 4C-8 -6 -4 -18 0 -28C4 -18 8 -6 0 4Z', { fill:LG([[0, '#fff6c8'], [.5, '#ffc04a'], [1, '#e2601e']]), stroke:'none' });
  circ(fl, 0, -10, 16, { fill:'#ffcf6a', stroke:'none', opacity:.4, filter:'url(#soft8)' }); anim(fi, 'transform', '1 1;.9 1.1;1.05 .95;1 1', .9, { type:'scale' }); return g; }
function campfire(p, x, y, s=1){ const g = G(p, { x, y, s }); circ(g, 0, -20, 120, { fill:RG([[0, '#ffb04a', .45], [1, '#ffb04a', 0]]), stroke:'none' });
  [[-30, 0, 30, -10], [-26, -8, 28, 4]].forEach(([a, b, c, d]) => line(g, a, b, c, d, { stroke:'#4a2a14', 'stroke-width':8 }));
  [[0, 1], [-12, .7], [12, .75]].forEach(([dx, k], i) => { const f = G(g, { x:dx }); const fi = G(f); path(fi, `M0 0C${-18*k} -20 ${-6*k} ${-46*k} 0 ${-64*k}C${8*k} ${-44*k} ${18*k} -20 0 0Z`, { fill:LG([[0, '#fff1b0'], [.45, '#ffb030'], [1, '#d8401a']], { y1:1, y2:0 }), stroke:'none' }); anim(fi, 'transform', '1 1;.85 1.12;1.08 .92;1 1', .7 + i*.2, { type:'scale' }); });
  return g; }
/* full scene: sky + celestial + clouds + ridges + ground */
function scene(q, mode='day', o){ o = Object.assign({ hz:560, sun:null, moon:null, clouds:null, ridges:3, ground:'dunes', seed:5, veil:0 }, o||{}); sdefs();
  const g = G(q); skyFill(g, mode, o);
  if(o.sun !== false && (mode === 'day' || mode === 'noon' || mode === 'dawn' || mode === 'dusk')){ const sp = o.sun || (mode === 'dawn' ? [PL.x + PL.w*.68, o.hz - 70] : mode === 'dusk' ? [PL.x + PL.w*.28, o.hz - 80] : mode === 'noon' ? [PL.x + PL.w*.7, PL.y + 120] : [PL.x + PL.w*.76, PL.y + 150]); g.sun = sun(g, sp[0], sp[1], mode === 'noon' ? 40 : 48, mode); }
  if(o.moon){ g.moon = moon(g, o.moon[0], o.moon[1], o.moon[2] || 40, o.moon[3] || 'full'); }
  const nc = o.clouds ?? (mode === 'night' ? 2 : mode === 'noon' ? 1 : 3); const R = rng(o.seed + 99);
  for(let i = 0; i < nc; i++) cloud(g, PL.x + 90 + R()*(PL.w - 180), PL.y + 70 + R()*(o.hz - PL.y - 260), .7 + R()*.6, mode, { phase:R()*40, drift:30 + R()*40 });
  if(o.ridges) g.ridges = ridges(g, mode, { hz:o.hz, n:o.ridges, seed:o.seed });
  if(o.ground === 'dunes') duneField(g, mode, { hz:o.hz + 30, seed:o.seed }); else if(o.ground && o.ground !== 'none') ground(g, mode, { hz:o.hz + 30, kind:o.ground, seed:o.seed });
  if(o.veil) veil(g, o.veil, DARKMODE(mode) ? '#0b1528' : '#f7ecd3'); g.hz = o.hz + 30; g.mode = mode; return g; }
/* atmosphere on top of everything (called by plate.frame) */
function atmo(q, dark){ sdefs(); const g = G(q); g.style.pointerEvents = 'none';
  rect(g, PL.x, PL.y, PL.w, PL.h, { rx:0, fill:'url(#tx-grain)', stroke:'none', opacity:dark ? .5 : .8 });
  rect(g, PL.x - 2, PL.y - 2, PL.w + 4, PL.h + 4, { rx:0, fill:RG([[0, '#000', 0], [.7, '#000', 0], [1, dark ? '#000' : '#5a3a12', dark ? .45 : .28]], { r:.72 }), stroke:'none' }); return g; }
function haloText(root){ root.querySelectorAll('text').forEach(t => { if(t.getAttribute('stroke')) return; if([...t.parentNode.children].some(c => c.tagName === 'rect')) return; const f = t.getAttribute('fill') || '#000'; if(!/^#/.test(f)) return;
  const [r, g, b] = hex2(f), L = (0.299*r + 0.587*g + 0.114*b)/255; t.setAttribute('paint-order', 'stroke'); t.setAttribute('stroke-linejoin', 'round');
  t.setAttribute('stroke', L < .5 ? 'rgba(252,246,232,.82)' : 'rgba(8,14,28,.6)'); t.setAttribute('stroke-width', Math.max(3, (+t.getAttribute('font-size') || 22)*.16)); }); }

/* ---------- celestial ---------- */
function moon(p, x, y, r, phase='full', o){ o = Object.assign({ o:1 }, o||{}); sdefs(); const g = G(p, { x, y, o:o.o });
  circ(g, 0, 0, r*4, { fill:RG([[0, '#fff3c8', .35], [.4, '#dfe8ff', .1], [1, '#dfe8ff', 0]]), stroke:'none' });
  if(phase === 'full'){ circ(g, 0, 0, r, { fill:RG([[0, '#fffdf2'], [.75, '#f6edcf'], [1, '#e2d3a8']], { cx:.42, cy:.4 }), stroke:'none' });
    [[-.3, -.2, .22], [.25, .1, .16], [-.05, .38, .12], [.35, -.35, .1]].forEach(([a, b, c]) => circ(g, a*r, b*r, c*r, { fill:'#c9b98f', stroke:'none', opacity:.28 })); }
  else path(g, `M0 ${-r}A${r} ${r} 0 1 0 0 ${r}A${r*.72} ${r} 0 1 1 0 ${-r}Z`, { fill:LG([[0, '#fffbe6'], [1, '#efdfae']]), stroke:'none', transform:'rotate(-25)' });
  return g; }
function nightSky(p, o){ const g = G(p, { o:(o||{}).o ?? 1 }); skyFill(g, 'night', { seed:(o||{}).seed || 3 }); g.stars = []; return g; }

/* ---------- animals (no riders, no people) ---------- */
function camel(p, x, y, s=1, o){ o = Object.assign({ c:'#b98a55', o:1, flip:false, saddle:true, walk:false, blanket:'#a8332b' }, o||{}); sdefs();
  const g = G(p, { x, y, s, o:o.o }); const gi = G(g); if(o.flip) gi.setAttribute('transform', 'scale(-1 1)');
  const c = o.c, lt = shade(c, .3), dk = shade(c, -.32), dk2 = shade(c, -.5);
  el('ellipse', gi, { cx:0, cy:41, rx:92, ry:8, fill:'#000', opacity:.22, filter:'url(#soft4)' });
  const leg = (hx, hy, kx, fx, col, wdt, ph) => { const L = G(gi); path(L, `M${hx} ${hy}Q${kx - 2} ${hy + 16} ${kx} 6L${fx} 37`, { stroke:col, 'stroke-width':wdt, fill:'none' }); el('ellipse', L, { cx:kx, cy:6, rx:wdt*.62, ry:wdt*.7, fill:shade(col, -.15) }); el('ellipse', L, { cx:fx + 2, cy:38, rx:wdt*.9, ry:3, fill:dk2 });
    if(o.walk) anim(L, 'transform', `${-9*ph} ${hx} ${hy};${9*ph} ${hx} ${hy};${-9*ph} ${hx} ${hy}`, 1.3, { spline:EZ2 }); return L; };
  leg(-46, -30, -50, -48, dk, 8, -1); leg(34, -32, 38, 36, dk, 8, 1);
  path(gi, 'M-73 -38C-82 -30 -84 -16 -80 -4', { stroke:dk, 'stroke-width':4, fill:'none' }); path(gi, 'M-80 -6l-4 10l7 -3z', { fill:dk2, stroke:'none' });
  const body = 'M-74 -38C-80 -66 -56 -80 -40 -70C-30 -104 6 -108 16 -70C26 -64 38 -64 46 -72L62 -110C66 -122 84 -125 91 -115L99 -105C101 -101 97 -97 91 -98L85 -99L72 -62C64 -42 52 -32 40 -30L-58 -26C-70 -28 -74 -32 -74 -38Z';
  path(gi, body, { fill:LG([[0, lt], [.55, c], [1, dk]]), stroke:'none' }); path(gi, body, { fill:'url(#tx-grain)', stroke:'none', opacity:.9 });
  path(gi, 'M-58 -29C-30 -20 18 -22 42 -32', { stroke:dk2, 'stroke-width':7, opacity:.3, fill:'none' });
  path(gi, 'M-36 -74C-26 -100 4 -103 12 -74', { stroke:shade(c, .5), 'stroke-width':4, opacity:.45, fill:'none' });
  path(gi, 'M50 -72L64 -108', { stroke:shade(c, .45), 'stroke-width':3, opacity:.4, fill:'none' });
  if(o.saddle){ path(gi, 'M-46 -62C-34 -98 4 -101 18 -66L22 -42C0 -36 -28 -36 -50 -40Z', { fill:LG([[0, shade(o.blanket, .15)], [1, shade(o.blanket, -.25)]]), stroke:shade(o.blanket, -.4), 'stroke-width':1.5 });
    path(gi, 'M-49 -48C-26 -44 0 -44 21 -50', { stroke:'#e3b54a', 'stroke-width':4, fill:'none' }); path(gi, 'M-47 -56C-26 -52 0 -52 19 -58', { stroke:'#2f5a6a', 'stroke-width':3, fill:'none' });
    for(let i = 0; i < 7; i++){ const tx = -46 + i*11, ty = -40 + Math.abs(i - 3)*.6; line(gi, tx, ty, tx, ty + 9, { stroke:'#e3b54a', 'stroke-width':1.5 }); circ(gi, tx, ty + 11, 2.4, { fill:'#e3b54a', stroke:'none' }); }
    path(gi, 'M-30 -96L-24 -86M8 -98L2 -88', { stroke:'#5a3412', 'stroke-width':5 }); path(gi, 'M-32 -92Q-12 -104 10 -94', { stroke:'#7a4a1e', 'stroke-width':5, fill:'none' }); }
  leg(-60, -30, -66, -62, c, 9, 1); leg(22, -33, 20, 24, c, 9, -1);
  circ(gi, 84, -111, 2.4, { fill:'#1a120a', stroke:'none' }); path(gi, 'M76 -118l-3 -8l6 4z', { fill:dk, stroke:'none' }); circ(gi, 96, -103, 1.4, { fill:dk2, stroke:'none' });
  return g; }
function sheep(p, x, y, s=1, o){ o = Object.assign({ c:'#f6f0e2' }, o||{}); sdefs(); const g = G(p, { x, y, s });
  el('ellipse', g, { cx:2, cy:23, rx:26, ry:4, fill:'#000', opacity:.22, filter:'url(#soft2)' });
  [[-10, 10], [10, 10]].forEach(([lx]) => line(g, lx, 8, lx + (lx > 0 ? 1 : -1), 22, { stroke:'#3e362f', 'stroke-width':3 }));
  const W = RG([[0, '#ffffff'], [.6, o.c], [1, shade(o.c, -.22)]], { cx:.4, cy:.3, r:.7 });
  [[-14, -2, 10], [-4, -8, 11], [8, -6, 11], [16, 0, 9], [6, 4, 11], [-8, 5, 10]].forEach(([cx, cy, r]) => circ(g, cx, cy, r, { fill:W, stroke:shade(o.c, -.3), 'stroke-width':.8 }));
  el('ellipse', g, { cx:25, cy:-3, rx:7.5, ry:6, fill:'#3e362f' }); el('ellipse', g, { cx:22, cy:-8, rx:4, ry:2, fill:'#2a241f', transform:'rotate(-30 22 -8)' }); circ(g, 27, -4, 1.1, { fill:'#e8dcc4', stroke:'none' });
  return g; }

/* ---------- vegetation ---------- */
function frond(p, x0, y0, ang, len, droop, cols, wdt){ const a = ang*Math.PI/180, ex = x0 + Math.cos(a)*len, ey = y0 + Math.sin(a)*len + droop, cx = x0 + Math.cos(a)*len*.5, cy = y0 + Math.sin(a)*len*.5 - droop*.35;
  const B = t => [(1 - t)*(1 - t)*x0 + 2*(1 - t)*t*cx + t*t*ex, (1 - t)*(1 - t)*y0 + 2*(1 - t)*t*cy + t*t*ey];
  const up = [], dn = []; const N = 14;
  for(let i = 0; i <= N; i++){ const t = i/N, [px, py] = B(t), [qx, qy] = B(Math.min(1, t + .01)); let nx = -(qy - py), ny = qx - px; const L = Math.hypot(nx, ny) || 1; nx /= L; ny /= L;
    const wv = wdt*Math.sin(Math.PI*Math.min(1, t*1.15))*(i%2 ? 1 : .45); up.push([px + nx*wv, py + ny*wv]); dn.push([px - nx*wv*.9, py - ny*wv*.9]); }
  const rib = []; for(let i = 0; i <= N; i++) rib.push(B(i/N));
  const P = a => a.map(([u, v]) => u.toFixed(1) + ' ' + v.toFixed(1)).join('L');
  path(p, 'M' + P(rib) + 'L' + P(up.slice().reverse()) + 'Z', { fill:cols[0], stroke:'none' });
  path(p, 'M' + P(rib) + 'L' + P(dn.slice().reverse()) + 'Z', { fill:cols[1], stroke:'none' });
  path(p, 'M' + P(rib), { stroke:cols[2], 'stroke-width':1.6, fill:'none' }); }
function palm(p, x, y, s=1, o){ o = Object.assign({ o:1, c:'#4f8a3e', t:'#8a6440', seed:null, night:false }, o||{}); sdefs();
  const g = G(p, { x, y, s, o:o.o }); const R = rng(o.seed ?? Math.round(x*7 + y*3));
  el('ellipse', g, { cx:10, cy:2, rx:46, ry:6, fill:'#000', opacity:.2, filter:'url(#soft4)' });
  const t = o.night ? '#2a2a3a' : o.t;
  path(g, 'M-10 0C-5 -60 -13 -120 3 -182L17 -178C3 -120 12 -60 10 0Z', { fill:LG([[0, shade(t, .25)], [.5, t], [1, shade(t, -.4)]], { x1:0, y1:0, x2:1, y2:0 }), stroke:'none' });
  for(let i = 0; i < 15; i++){ const yy = -8 - i*11.8, xx = i < 8 ? -1 + Math.sin(i*.4)*2 : 4 + (i - 8)*1.2; path(g, `M${xx - 9} ${yy}q9 -5 19 0`, { stroke:shade(t, -.45), 'stroke-width':1.8, opacity:.6, fill:'none' }); }
  const cr = G(g, { x:10, y:-180 }); const ci = G(cr);
  const C = o.night ? [['#24324a', '#1a2538', '#101826'], ['#2c3c58', '#1e2a40', '#121a2a']] : [[shade(o.c, -.25), shade(o.c, -.45), shade(o.c, -.55)], [shade(o.c, .18), shade(o.c, -.12), shade(o.c, -.35)]];
  [[200, 120], [235, 125], [270, 110], [305, 125], [340, 120], [160, 105], [20, 105]].forEach(([a, L]) => frond(ci, 0, 0, a + (R() - .5)*10, L*(.9 + R()*.2), 40 + R()*20, C[0], 13));
  [[180, 115], [215, 125], [250, 120], [290, 118], [325, 125], [0, 112], [140, 100], [40, 100]].forEach(([a, L]) => frond(ci, 0, 0, a + (R() - .5)*10, L*(.9 + R()*.2), 45 + R()*20, C[1], 14));
  if(!o.night) [[-8, 12], [8, 14], [0, 18], [-3, 9]].forEach(([dx, dy]) => circ(ci, dx, dy, 6, { fill:RG([[0, '#e0892e'], [1, '#8a4a14']], { cx:.35, cy:.35 }), stroke:'none' }));
  anim(ci, 'transform', `-1.8 0 0;1.8 0 0;-1.8 0 0`, 4 + R()*3, { begin:-R()*4, spline:EZ2 }); return g; }
function grove(q, pts, o){ const g = G(q, { o:(o||{}).o ?? 1 }); pts.slice().sort((a, b) => a[1] - b[1]).forEach(([x, y, s]) => palm(g, x, y, s, o)); return g; }
function bush(p, x, y, s=1, c='#6f8a3e'){ const g = G(p, { x, y, s }); el('ellipse', g, { cx:0, cy:2, rx:28, ry:5, fill:'#000', opacity:.18 }); [[-14, -6, 14], [2, -12, 16], [16, -5, 12]].forEach(([cx, cy, r]) => circ(g, cx, cy, r, { fill:RG([[0, shade(c, .3)], [1, shade(c, -.3)]], { cx:.4, cy:.3 }), stroke:'none' })); return g; }

/* ---------- architecture ---------- */
function house(p, x, y, w=110, h=80, o){ o = Object.assign({ c:'#d9b98a', line:'#8d7446', door:true, win:true, o:1, lit:false, night:false, side:true }, o||{}); sdefs();
  const g = G(p, { x, y, o:o.o }); const c = o.night ? '#4a4a62' : o.c, d = o.side ? w*.28 : 0, rise = d*.45;
  path(g, `M${-w/2 - 6} 2L${w/2 + d + 30} 2L${w/2 + d + 6} 10L${-w/2 + 4} 10Z`, { fill:'#000', stroke:'none', opacity:.18, filter:'url(#soft4)' });
  if(d){ path(g, `M${w/2} 0L${w/2 + d} ${-rise}V${-h - rise}L${w/2} ${-h}Z`, { fill:LG([[0, shade(c, -.28)], [1, shade(c, -.42)]]), stroke:'none' }); path(g, `M${w/2} 0L${w/2 + d} ${-rise}V${-h - rise}L${w/2} ${-h}Z`, { fill:'url(#tx-paper)', stroke:'none', opacity:1 });
    path(g, `M${-w/2} ${-h}L${w/2} ${-h}L${w/2 + d} ${-h - rise}L${-w/2 + d} ${-h - rise}Z`, { fill:shade(c, .28), stroke:'none' }); }
  rect(g, -w/2, -h, w, h, { rx:1, fill:LG([[0, shade(c, .18)], [1, shade(c, -.08)]]), stroke:'none' }); rect(g, -w/2, -h, w, h, { rx:1, fill:'url(#tx-paper)', stroke:'none', opacity:1 });
  rect(g, -w/2 - 2, -h - 6, w + 4, 8, { rx:1, fill:shade(c, -.12), stroke:'none' });
  for(let bx = -w/2 + 10; bx < w/2 - 4; bx += 17) circ(g, bx, -h + 6, 2.6, { fill:'#5a3a1e', stroke:'none' });
  if(o.door){ rect(g, -15, -42, 30, 42, { rx:1, fill:'#3a2412', stroke:'none' }); rect(g, -12, -39, 24, 39, { rx:1, fill:LG([[0, '#8a5a30'], [1, '#5a3618']], { x2:1, y2:0 }), stroke:'none' }); for(let i = -6; i <= 6; i += 6) line(g, i, -38, i, 0, { stroke:'#3a2412', 'stroke-width':1, opacity:.6 }); rect(g, -18, -46, 36, 5, { rx:1, fill:'#5a3a1e', stroke:'none' }); }
  if(o.win){ const wx = w/2 - 30, wy = -h + 20; rect(g, wx - 1, wy - 1, 18, 16, { rx:1, fill:o.lit ? '#ffd27a' : '#2a1a0e', stroke:'#5a3a1e', 'stroke-width':1.5 }); if(o.lit) circ(g, wx + 8, wy + 7, 22, { fill:'#ffc860', stroke:'none', opacity:.35, filter:'url(#soft8)' }); path(g, `M${wx + 8} ${wy}V${wy + 14}M${wx} ${wy + 7}H${wx + 16}`, { stroke:'#5a3a1e', 'stroke-width':1.2 }); }
  return g; }
function houses(q, list, o){ const g = G(q, { o:(o||{}).o ?? 1 }); list.slice().sort((a, b) => a[1] - b[1]).forEach(([x, y, w, h, extra]) => house(g, x, y, w, h, Object.assign({}, o, extra))); return g; }
function tent(p, x, y, s=1, o){ o = Object.assign({ o:1, glow:false }, o||{}); sdefs(); const g = G(p, { x, y, s, o:o.o });
  el('ellipse', g, { cx:10, cy:42, rx:120, ry:10, fill:'#000', opacity:.22, filter:'url(#soft4)' });
  [[-100, -26, -128, 40], [100, -26, 128, 40], [-30, -40, -60, 40], [30, -40, 70, 40]].forEach(([a, b, c2, d2]) => line(g, a, b, c2, d2, { stroke:'#c9b48a', 'stroke-width':1.4, opacity:.8 }));
  path(g, 'M-104 40L-98 -22Q-66 -50 -32 -36Q0 -62 32 -36Q66 -50 98 -22L104 40Z', { fill:LG([[0, '#5a4636'], [1, '#2b211a']]), stroke:'#1e1712', 'stroke-width':1.5 });
  path(g, 'M-104 40L-98 -22Q-66 -50 -32 -36Q0 -62 32 -36Q66 -50 98 -22L104 40Z', { fill:'url(#tx-sand)', stroke:'none', opacity:.9 });
  [[-2, '#d9c08a'], [10, '#a8332b'], [22, '#d9c08a'], [30, '#2f5a6a']].forEach(([yy, c]) => path(g, `M-101 ${yy}L101 ${yy}`, { stroke:c, 'stroke-width':yy === 10 ? 4 : 2.5, opacity:.85 }));
  path(g, 'M-24 40L-20 -26Q0 -40 20 -26L24 40Z', { fill:RG([[0, o.glow ? '#ffb85a' : '#3a2a1e'], [1, '#120c08']], { cy:.8 }), stroke:'none' });
  [[-98, -22], [-32, -36], [0, -50], [32, -36], [98, -22]].forEach(([px, py]) => line(g, px, py, px, py - 8, { stroke:'#6b4a2e', 'stroke-width':3 }));
  return g; }
function kaaba(p, x, y, s=1, o){ o = Object.assign({ o:1 }, o||{}); sdefs(); const g = G(p, { x, y, s, o:o.o });
  el('ellipse', g, { cx:0, cy:6, rx:200, ry:40, fill:RG([[0, '#f8f4ea'], [.7, '#e6dcc6'], [1, '#cfc2a4', 0]]), stroke:'none' });
  el('ellipse', g, { cx:10, cy:4, rx:140, ry:22, fill:'#000', opacity:.2, filter:'url(#soft8)' });
  path(g, 'M-110 -150L0 -185L110 -150L0 -118Z', { fill:LG([[0, '#3a3632'], [1, '#26231f']]), stroke:'#151311', 'stroke-width':2 });
  path(g, 'M-110 -150L0 -118V0L-110 -32Z', { fill:LG([[0, '#141210'], [1, '#22201c']], { x2:1, y2:0 }), stroke:'#151311', 'stroke-width':2 });
  path(g, 'M0 -118L110 -150V-32L0 0Z', { fill:LG([[0, '#2c2924'], [1, '#1a1815']], { x2:1, y2:0 }), stroke:'#151311', 'stroke-width':2 });
  path(g, 'M-110 -122L0 -90L110 -122V-106L0 -74L-110 -106Z', { fill:LG([[0, '#f2d27a'], [.5, '#c9993a'], [1, '#f2d27a']], { x2:1, y2:0 }), stroke:'none' });
  for(let i = 0; i < 10; i++){ const t = (i + .5)/10, xx = -110 + t*220, yy = xx < 0 ? -114 + (xx + 110)/110*32 : -82 - xx/110*32; path(g, `M${xx - 7} ${yy}q3.5 -5 7 0t7 0`, { stroke:'#6a4a14', 'stroke-width':1.3, fill:'none', opacity:.75 }); }
  path(g, 'M30 -48L58 -56V-12L30 -4Z', { fill:LG([[0, '#f2d27a'], [1, '#b0822a']]), stroke:'#8d6a22', 'stroke-width':1.5 }); path(g, 'M44 -50V-8', { stroke:'#8d6a22', 'stroke-width':1.2 });
  circ(g, -100, -36, 5, { fill:'#6b5d4d', stroke:COL.gold2, 'stroke-width':2 }); return g; }
/* the early mosque: mud-brick enclosure, palm-trunk columns, palm-frond roof (as at Quba and Medina) */
function mosque(p, x, y, s=1, o){ o = Object.assign({ o:1, c:'#d6b07c', night:false }, o||{}); sdefs(); const g = G(p, { x, y, s, o:o.o }); const c = o.night ? '#4a4a62' : o.c;
  el('ellipse', g, { cx:20, cy:6, rx:220, ry:20, fill:'#000', opacity:.2, filter:'url(#soft8)' });
  path(g, 'M-170 -10L-110 -70H190L130 -10Z', { fill:shade(c, -.05), stroke:'none' }); path(g, 'M-170 -10L-110 -70H190L130 -10Z', { fill:'url(#tx-sand)', stroke:'none', opacity:.7 });
  rect(g, -110, -150, 300, 80, { rx:0, fill:LG([[0, shade(c, .1)], [1, shade(c, -.15)]]), stroke:'none' }); rect(g, -110, -150, 300, 80, { rx:0, fill:'url(#tx-paper)', stroke:'none' });
  path(g, 'M-120 -150L-100 -172H200L180 -150Z', { fill:LG([[0, '#9aa05a'], [1, '#6a5a32']]), stroke:'#4a3a1e', 'stroke-width':1.5 });
  for(let i = 0; i < 26; i++) path(g, `M${-112 + i*11.5} -152l8 -18`, { stroke:'#4a5a2a', 'stroke-width':1.5, opacity:.6 });
  rect(g, -110, -150, 300, 30, { rx:0, fill:'#000', stroke:'none', opacity:.25 });
  for(let i = 0; i < 7; i++){ const cx = -96 + i*46; rect(g, cx - 5, -150, 10, 80, { rx:3, fill:LG([[0, '#9a7448'], [1, '#5a3a1e']], { x2:1, y2:0 }), stroke:'none' }); for(let k = 0; k < 6; k++) line(g, cx - 5, -142 + k*12, cx + 5, -144 + k*12, { stroke:'#3a2412', 'stroke-width':1, opacity:.5 }); }
  path(g, 'M-170 -10L-170 -48L-110 -108V-70Z', { fill:shade(c, -.32), stroke:'none' });
  path(g, 'M-170 -48L-110 -108', { stroke:shade(c, .2), 'stroke-width':3 });
  rect(g, -170, -48, 120, 48, { rx:0, fill:LG([[0, shade(c, .2)], [1, shade(c, -.05)]]), stroke:'none' }); rect(g, 10, -48, 120, 48, { rx:0, fill:LG([[0, shade(c, .2)], [1, shade(c, -.05)]]), stroke:'none' });
  rect(g, -170, -48, 120, 48, { rx:0, fill:'url(#tx-paper)', stroke:'none' }); rect(g, 10, -48, 120, 48, { rx:0, fill:'url(#tx-paper)', stroke:'none' });
  rect(g, -172, -52, 124, 6, { rx:1, fill:shade(c, -.2), stroke:'none' }); rect(g, 8, -52, 124, 6, { rx:1, fill:shade(c, -.2), stroke:'none' });
  return g; }
function cityscape(q, y, o){ o = Object.assign({ seed:7, n:9, night:false, c:'#d9b98a', scale:1, lit:.3 }, o||{}); const R = rng(o.seed), L = [];
  for(let i = 0; i < o.n; i++){ const x = PL.x + 30 + (i + R()*.6)*(PL.w - 60)/o.n, yy = y + (R() - .5)*30*o.scale; L.push([x, yy, (70 + R()*60)*o.scale, (50 + R()*50)*o.scale, { lit:o.night && R() < o.lit, door:R() < .7, win:R() < .8, c:shade(o.c, (R() - .5)*.2) }]); }
  return houses(q, L, { night:o.night }); }
