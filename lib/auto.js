/* auto.js — builds a lesson from LESSON data: scenes chosen per beat, cards timed to phrases. No human figures. */
const ACX = PL.x + PL.w/2, ACY = PL.y + PL.h/2, BOT = PL.y + PL.h;
function wp(ph){ const i = NAR.plain.indexOf(ph); return i < 0 ? 0 : est(i); }
function wrapTxt(s, n=42, maxL=5){ const ws = s.split(' '), L = []; let c = '';
  ws.forEach(w => { if((c + ' ' + w).trim().length > n && c){ L.push(c); c = w; } else c = (c + ' ' + w).trim(); }); if(c) L.push(c);
  if(L.length > maxL){ L.length = maxL; L[maxL - 1] = L[maxL - 1].replace(/[,.;:!?»]*$/, '') + '…»'; } return L.join('\n'); }
function birds(q, n, R, o){ o = o || {}; const g = G(q, { o:o.o ?? .8 }); for(let i = 0; i < n; i++){ const b = G(g, { x:PL.x + 80 + R()*(PL.w - 160), y:PL.y + 90 + R()*220, s:.6 + R()*.6 }); const bi = G(b);
  path(bi, 'M-12 0Q-6 -7 0 0Q6 -7 12 0', { stroke:o.c || '#3a2a20', 'stroke-width':2.2, fill:'none' }); anim(bi, 'transform', `0 0;${60 + R()*80} ${-10 + R()*20};0 0`, 18 + R()*14, { type:'translate', begin:-R()*10, spline:EZ2 });
  const w = bi.firstChild; anim(w, 'd', 'M-12 0Q-6 -7 0 0Q6 -7 12 0;M-12 -3Q-6 2 0 0Q6 2 12 -3;M-12 0Q-6 -7 0 0Q6 -7 12 0', .7 + R()*.4); } return g; }
function banner(p, x, y, s=1, c='#2f6a4a', o){ const g = G(p, { x, y, s }); line(g, 0, 0, 0, -120, { stroke:'#5a3a1e', 'stroke-width':4 }); const f = G(g, { y:-118 });
  const fl = path(f, 'M0 0C20 -6 40 6 60 0V36C40 42 20 30 0 36Z', { fill:LG([[0, shade(c, .2)], [1, shade(c, -.25)]], { x2:1, y2:0 }), stroke:'none' });
  anim(fl, 'd', 'M0 0C20 -6 40 6 60 0V36C40 42 20 30 0 36Z;M0 0C20 6 40 -6 60 4V40C40 34 20 44 0 36Z;M0 0C20 -6 40 6 60 0V36C40 42 20 30 0 36Z', 2 + Math.random(), {}); circ(g, 0, -122, 4, { fill:'#e3b54a', stroke:'none' }); return g; }
function whiteTent(p, x, y, s=1){ const g = G(p, { x, y, s }); el('ellipse', g, { cx:6, cy:2, rx:46, ry:6, fill:'#000', opacity:.18, filter:'url(#soft2)' });
  path(g, 'M-42 0L0 -54L42 0Z', { fill:LG([[0, '#ffffff'], [1, '#d9d2c2']], { x2:1, y2:0 }), stroke:'#b8ae98', 'stroke-width':1 }); path(g, 'M0 -54L42 0H14Z', { fill:'#000', opacity:.12 }); path(g, 'M-8 0L0 -22L8 0Z', { fill:'#5a4a3a' }); return g; }
function well(p, x, y, s=1){ const g = G(p, { x, y, s }); el('ellipse', g, { cx:10, cy:8, rx:90, ry:14, fill:'#000', opacity:.2, filter:'url(#soft4)' });
  el('ellipse', g, { cx:0, cy:-40, rx:62, ry:16, fill:'#1a1410' }); path(g, 'M-62 -40V0Q0 22 62 0V-40Q0 -22 -62 -40Z', { fill:LG([[0, '#c9a678'], [1, '#7a5a3a']], { x2:1, y2:0 }), stroke:'#5a3a1e', 'stroke-width':1.5 });
  for(let i = 0; i < 3; i++) path(g, `M-62 ${-28 + i*12}Q0 ${-8 + i*12} 62 ${-28 + i*12}`, { stroke:'#5a3a1e', 'stroke-width':1, opacity:.5, fill:'none' });
  line(g, -56, -40, -50, -130, { stroke:'#6b4426', 'stroke-width':7 }); line(g, 56, -40, 50, -130, { stroke:'#6b4426', 'stroke-width':7 }); line(g, -60, -128, 60, -128, { stroke:'#7a5030', 'stroke-width':8 });
  line(g, 10, -128, 10, -70, { stroke:'#c9b48a', 'stroke-width':2 }); path(g, 'M-2 -72H22L18 -50H2Z', { fill:'#8a5a30', stroke:'#4a2a14', 'stroke-width':1.5 }); return g; }
function acacia(p, x, y, s=1){ const g = G(p, { x, y, s }); el('ellipse', g, { cx:0, cy:4, rx:170, ry:18, fill:'#000', opacity:.22, filter:'url(#soft8)' });
  path(g, 'M-10 0C-6 -60 -30 -100 -70 -140M-4 -60C10 -100 40 -120 80 -150M-8 -90C0 -120 -10 -140 0 -170', { stroke:'#5a3a22', 'stroke-width':12, fill:'none' }); path(g, 'M-12 0C-8 -40 -6 -60 -4 -80L8 -80C6 -50 10 -30 12 0Z', { fill:'#5a3a22' });
  const cr = G(g); const ci = G(cr); [[-90, -150, 90, 30], [40, -165, 110, 32], [-20, -180, 120, 30], [100, -150, 70, 24], [-140, -140, 60, 20]].forEach(([cx, cy, rx, ry]) => { el('ellipse', ci, { cx, cy:cy + 8, rx, ry, fill:'#3f6a2a' }); el('ellipse', ci, { cx, cy, rx:rx*.95, ry:ry*.8, fill:LG([[0, '#8aac4a'], [1, '#4f7a30']]) }); });
  anim(ci, 'transform', '-1 0 -150;1 0 -150;-1 0 -150', 6, { spline:EZ2 }); return g; }
function fortress(p, x, y, s=1, o){ o = o || {}; const g = G(p, { x, y, s }); const c = o.c || '#b89a72';
  rockMass(g, 'M-260 40L-220 -30L-150 -70L-60 -90L40 -84L140 -60L220 -20L270 40Z', { c:['#a08060', '#5a4430'] });
  const wall = (x0, w0, h0) => { rect(g, x0, -90 - h0, w0, h0, { rx:0, fill:LG([[0, shade(c, .15)], [1, shade(c, -.2)]]), stroke:'none' }); rect(g, x0, -90 - h0, w0, h0, { rx:0, fill:'url(#tx-rock)', stroke:'none', opacity:.5 });
    for(let k = x0; k < x0 + w0 - 6; k += 16) rect(g, k, -100 - h0, 10, 12, { rx:0, fill:shade(c, .05), stroke:'none' }); };
  wall(-170, 340, 70); wall(-200, 60, 130); wall(140, 60, 120); wall(-40, 80, 150);
  [[-170, -180], [170, -170], [0, -200]].forEach(([wx, wy]) => rect(g, wx - 6, wy, 12, 18, { rx:5, fill:'#2a1a10', stroke:'none' }));
  rect(g, -22, -126, 44, 36, { rx:20, fill:'#3a2412', stroke:'none' }); return g; }
function ship(p, x, y, s=1){ const g = G(p, { x, y, s }); const gi = G(g);
  path(gi, 'M-110 0Q-100 30 -60 34H80Q110 20 120 -6Z', { fill:LG([[0, '#9a6a3a'], [1, '#4a2e16']]), stroke:'#2a1a0c', 'stroke-width':2 });
  line(gi, -10, 0, -10, -170, { stroke:'#4a2e16', 'stroke-width':5 }); path(gi, 'M-10 -170Q70 -120 90 -20L-6 -14Z', { fill:LG([[0, '#fbf4e2'], [1, '#d9cbb0']], { x2:1, y2:0 }), stroke:'#b8a888', 'stroke-width':1.5 });
  path(gi, 'M-40 -150L100 -190', { stroke:'#4a2e16', 'stroke-width':3 }); anim(gi, 'transform', '-2 0 20;2 0 20;-2 0 20', 4, { spline:EZ2 }); return g; }
function sword(p, x, y, r, s=1){ const g = G(p, { x, y, s, r }); path(g, 'M0 0L0 -170L6 -182L12 -170L12 0Z', { fill:LG([[0, '#f4f6f8'], [1, '#8a94a0']], { x2:1, y2:0 }), stroke:'#5a6470', 'stroke-width':1 });
  rect(g, -18, 0, 48, 10, { rx:3, fill:'#c9993a', stroke:'#6a4a14', 'stroke-width':1 }); rect(g, 2, 10, 8, 40, { rx:3, fill:'#4a2a14', stroke:'none' }); circ(g, 6, 54, 6, { fill:'#c9993a', stroke:'none' }); return g; }
function shield(p, x, y, s=1){ const g = G(p, { x, y, s }); circ(g, 0, 0, 70, { fill:RG([[0, '#c99a5a'], [1, '#6a4422']], { cx:.4, cy:.35 }), stroke:'#3a2412', 'stroke-width':4 }); circ(g, 0, 0, 52, { fill:'none', stroke:'#e3b54a', 'stroke-width':3 }); circ(g, 0, 0, 16, { fill:RG([[0, '#fff3c0'], [1, '#c9993a']]), stroke:'none' });
  for(let i = 0; i < 12; i++){ const a = i*Math.PI/6; circ(g, Math.cos(a)*61, Math.sin(a)*61, 3, { fill:'#e3b54a', stroke:'none' }); } return g; }
function columnsPalace(p, x, y, s=1){ const g = G(p, { x, y, s }); const c = '#efe6d4';
  el('ellipse', g, { cx:0, cy:6, rx:330, ry:24, fill:'#000', opacity:.2, filter:'url(#soft8)' });
  for(let i = 0; i < 3; i++) rect(g, -300 + i*10, -14 + i*-10 + 10, 600 - i*20, 12, { rx:1, fill:shade(c, -.1 - i*.05), stroke:'none' });
  rect(g, -260, -250, 520, 220, { rx:0, fill:LG([[0, shade(c, .1)], [1, shade(c, -.15)]]), stroke:'none' });
  for(let i = 0; i < 7; i++){ const cx = -225 + i*75; rect(g, cx - 14, -230, 28, 200, { rx:2, fill:LG([[0, '#ffffff'], [.5, '#e6dccb'], [1, '#b8ac98']], { x2:1, y2:0 }), stroke:'none' }); rect(g, cx - 20, -240, 40, 12, { rx:2, fill:'#d9ccb4', stroke:'none' }); }
  path(g, 'M-280 -250L0 -330L280 -250Z', { fill:LG([[0, '#f7f0e2'], [1, '#c9bca4']]), stroke:'#a89a80', 'stroke-width':2 });
  path(g, 'M-120 -330a120 110 0 0 1 240 0Z', { fill:LG([[0, '#7ab0c0'], [1, '#2f6a80']]), stroke:'#c9a34a', 'stroke-width':3 }); circ(g, 0, -446, 8, { fill:'#e3b54a', stroke:'none' }); line(g, 0, -440, 0, -470, { stroke:'#c9a34a', 'stroke-width':3 });
  return g; }
function scrollDoc(p, x, y, s=1, D=8){ const g = G(p, { x, y, s }); el('ellipse', g, { cx:0, cy:150, rx:300, ry:20, fill:'#000', opacity:.25, filter:'url(#soft8)' });
  rect(g, -250, -140, 500, 280, { rx:6, fill:LG([[0, '#fbf3dc'], [1, '#e8d6a8']]), stroke:'#b69b67', 'stroke-width':2 }); rect(g, -250, -140, 500, 280, { rx:6, fill:'url(#tx-paper)', stroke:'none' });
  [-1, 1].forEach(k => { rect(g, -270, k*140 - 16, 540, 32, { rx:16, fill:LG([[0, '#d9b47a'], [1, '#8a6a3a']]), stroke:'#6a4a22', 'stroke-width':2 }); });
  for(let i = 0; i < 7; i++){ const ln = path(g, `M200 ${-90 + i*30}` + Array.from({ length:9 }, (_, k) => `q-12 ${k%2 ? 6 : -6} -24 0`).join(''), { stroke:'#3a2a18', 'stroke-width':2.4, fill:'none', opacity:.75 }, { d:0 }); draw(ln, 1 + i*D/9, D/9, 'lin'); }
  const seal = G(g, { x:170, y:100, o:0 }); circ(seal, 0, 0, 26, { fill:RG([[0, '#d8483a'], [1, '#8a1e18']]), stroke:'#6a1410', 'stroke-width':2 }); star8(seal, 0, 0, 12, { fill:'none', stroke:'#f3c9a8', 'stroke-width':1.5 }); pop(seal, 1 + D*.85);
  return g; }
function inkwell(p, x, y){ const g = G(p, { x, y }); path(g, 'M-26 0Q-30 -30 -14 -36H14Q30 -30 26 0Z', { fill:LG([[0, '#4a5a6a'], [1, '#1a222a']]), stroke:'none' }); line(g, 6, -34, 60, -110, { stroke:'#c9a46a', 'stroke-width':5 }); return g; }
function terraces(q, y0, n, R){ const g = G(q); for(let i = 0; i < n; i++){ const y = y0 + i*46; path(g, `M${PL.x - 4} ${y}Q${ACX} ${y - 30 + R()*16} ${PL.x + PL.w + 4} ${y}V${y + 50}H${PL.x - 4}Z`, { fill:LG([[0, shade('#7a9a3a', .1 - i*.04)], [1, shade('#5a7a2a', -i*.05)]]), stroke:'#c9b48a', 'stroke-width':2 });
  for(let k = 0; k < 14; k++) circ(g, PL.x + 30 + k*56 + R()*20, y + 18 + R()*8, 9 + R()*6, { fill:RG([[0, '#9ac05a'], [1, '#3f6a2a']], { cx:.4, cy:.3 }), stroke:'none' }); } return g; }
function canyon(q, mode){ const dk = DARKMODE(mode); const c = dk ? ['#5a4a58', '#2a2230'] : ['#c28a5a', '#6a4028'];
  rockMass(q, `M${PL.x - 4} ${PL.y - 4}L${PL.x + 250} ${PL.y - 4}L${PL.x + 300} 300L${PL.x + 270} 520L${PL.x + 330} 700L${PL.x + 310} ${BOT + 4}L${PL.x - 4} ${BOT + 4}Z`, { c, rim:RIM[mode] });
  rockMass(q, `M${PL.x + PL.w + 4} ${PL.y - 4}L${PL.x + 560} ${PL.y - 4}L${PL.x + 520} 320L${PL.x + 560} 520L${PL.x + 480} 720L${PL.x + 500} ${BOT + 4}L${PL.x + PL.w + 4} ${BOT + 4}Z`, { c:[shade(c[0], -.1), shade(c[1], -.1)], rim:RIM[mode] }); }
/* ---------- scene compositions ---------- */
function elephant(p, x, y, s=1){ const g = G(p, { x, y, s }); const C = LG([[0, '#9a958c'], [1, '#5f5a52']], { x1:0, y1:0, x2:0, y2:1 });
  el('ellipse', g, { cx:0, cy:6, rx:150, ry:14, fill:'#000', opacity:.18 });
  // kneeling: folded legs
  path(g, 'M-110 -10Q-118 6 -96 8H-40Q-30 -4 -44 -14Z', { fill:shade('#6a655c', -.1), stroke:'none' });
  path(g, 'M40 -12Q30 6 52 8H104Q114 -6 98 -16Z', { fill:shade('#6a655c', -.1), stroke:'none' });
  path(g, 'M-128 -40C-140 -120 -60 -160 10 -150C70 -144 110 -120 118 -70C122 -40 110 -14 80 -10H-100C-120 -12 -126 -24 -128 -40Z', { fill:C, stroke:'none' });
  path(g, 'M-128 -60Q-150 -50 -146 -20', { fill:'none', stroke:'#5f5a52', 'stroke-width':5, 'stroke-linecap':'round' });
  const h = G(g, { x:112, y:-96 });
  path(h, 'M-30 -40C-10 -70 50 -66 64 -30C72 -6 66 20 56 40C50 62 54 88 70 100Q78 106 70 110Q52 108 44 90C34 66 30 44 20 34C0 30 -24 10 -30 -40Z', { fill:C, stroke:'none' });
  path(h, 'M-16 -36C-46 -40 -58 0 -40 30C-28 46 -6 40 0 20Z', { fill:shade('#8a857c', -.15), stroke:'#4e4a44', 'stroke-width':1.5 });
  path(h, 'M40 34Q66 44 80 34', { fill:'none', stroke:'#f3ecd8', 'stroke-width':6, 'stroke-linecap':'round' });
  circ(h, 36, -16, 3.5, { fill:'#2a241e', stroke:'none' });
  for(let i = 0; i < 6; i++) path(g, `M${-90 + i*30} -150q8 -4 16 0`, { fill:'none', stroke:'#4e4a44', 'stroke-width':1, opacity:.3 });
  return g; }
function flock(q, n, R, D){ const g = G(q); for(let i = 0; i < n; i++){ const b = G(g, { x:PL.x + 60 + R()*(PL.w - 120), y:PL.y + 70 + R()*200, s:.35 + R()*.3 }); const bi = G(b);
  path(bi, 'M-12 0Q-6 -7 0 0Q6 -7 12 0', { stroke:'#2a2420', 'stroke-width':2.4, fill:'none' }); anim(bi, 'transform', `0 0;${-40 - R()*60} ${-6 + R()*12};0 0`, 10 + R()*8, { type:'translate', begin:-R()*10, spline:EZ2 }); } return g; }
function jag(R, x0, x1, base, top, n, amp){ let d = `M${x0} ${base}`; const pts = [];
  for(let i = 0; i <= n; i++){ const x = x0 + (x1 - x0)*i/n, k = Math.sin(Math.PI*i/n), y = base - (base - top)*Math.pow(k, .3) + (i%2 ? amp*R() : -amp*R()*.6); pts.push([x, Math.min(base, y)]); }
  pts.forEach(([x, y]) => d += `L${x.toFixed(1)} ${y.toFixed(1)}`); return { d:d + `L${x1} ${base}Z`, pts }; }
function gullies(q, pts, base, R, c, op){ const g = G(q, { o:op }); pts.forEach(([x, y], i) => { if(i%2 || y > base - 30) return; const len = (base - y)*(.5 + R()*.4);
  path(g, `M${x} ${y + 6}q${-8 + R()*16} ${len*.4} ${-14 + R()*28} ${len}`, { fill:'none', stroke:c, 'stroke-width':2 + R()*2, 'stroke-linecap':'round' }); }); return g; }
function quranStand(p, x, y, s=1){ const g = G(p, { x, y, s }); el('ellipse', g, { cx:0, cy:8, rx:230, ry:20, fill:'#000', opacity:.3, filter:'url(#soft8)' });
  const W = LG([[0, '#8a5a2e'], [1, '#4a2c14']]);
  path(g, 'M-170 0L60 -150L84 -136L-146 14Z', { fill:W, stroke:'#2e1a0a', 'stroke-width':1.5 }); path(g, 'M170 0L-60 -150L-84 -136L146 14Z', { fill:W, stroke:'#2e1a0a', 'stroke-width':1.5 });
  for(const sx of [-1, 1]) path(g, `M${sx*120} -36l${sx*-30} -20l${sx*12} -8l${sx*30} 20Z`, { fill:'#6a4020', stroke:'none', opacity:.8 });
  const b = G(g, { y:-150 });
  path(b, 'M0 6C-60 -10 -150 -6 -190 4L-200 -120C-150 -134 -60 -136 0 -116Z', { fill:'#f6ecd2', stroke:'#8a6a3a', 'stroke-width':2 });
  path(b, 'M0 6C60 -10 150 -6 190 4L200 -120C150 -134 60 -136 0 -116Z', { fill:'#f8f0da', stroke:'#8a6a3a', 'stroke-width':2 });
  path(b, 'M-200 -120L-206 12C-150 0 -60 -2 0 14C60 -2 150 0 206 12L200 -120', { fill:'none', stroke:'#2f5a3a', 'stroke-width':5 });
  for(const sx of [-1, 1]){ rect(b, sx > 0 ? 24 : -172, -112, 148, 104, { rx:3, fill:'none', stroke:COL.gold, 'stroke-width':1.6 });
    for(let i = 0; i < 6; i++){ const yy = -96 + i*16, x0 = sx > 0 ? 36 : -160; path(b, `M${x0} ${yy}q20 -5 40 0t40 0t40 0`, { fill:'none', stroke:'#3a2a1e', 'stroke-width':1.6, opacity:.6 }); } }
  circ(b, -98, -60, 7, { fill:COL.gold, stroke:'none', opacity:.8 }); return g; }
function star8(p, x, y, r, o){ let d = ''; for(let i = 0; i < 16; i++){ const a = i*Math.PI/8, q = i%2 ? r*.62 : r; d += (i ? 'L' : 'M') + (x + Math.cos(a)*q).toFixed(1) + ' ' + (y + Math.sin(a)*q).toFixed(1); } return path(p, d + 'Z', o); }
const SC = {
 desert(q, m, R, D){ scene(q, m, { hz:520, seed:R()*99|0 }); const cv = G(q, { x:-160, y:0 }); for(let i = 0; i < 4; i++) camel(cv, PL.x + 40 + i*95, 690 + (i%2)*6, .55, { walk:true, c:shade('#b98a55', (R() - .5)*.3) }); tw(cv, { x:PL.w*.55 }, 0, D, 'lin'); if(!DARKMODE(m)) birds(q, 3, R); },
 caravan(q, m, R, D){ scene(q, m, { hz:500, ground:'flat', seed:R()*99|0 }); const cv = G(q, { x:-260 }); for(let i = 0; i < 5; i++) camel(cv, PL.x + 40 + i*150, 760 - i*14, .95 - i*.07, { walk:true, c:shade('#b98a55', (R() - .5)*.3), blanket:['#a8332b', '#2f5a6a', '#8a5a1e'][i%3] }); tw(cv, { x:200 }, 0, D, 'lin'); },
 mecca(q, m, R, D){ const n = DARKMODE(m); scene(q, m, { hz:440, ridges:3, ground:'flat', seed:R()*99|0, moon:n ? [PL.x + 600 + R()*120, PL.y + 110, 34, R() < .5 ? 'full' : 'crescent'] : null });
   cityscape(q, 590, { n:9, seed:R()*99|0, night:n, scale:.62, lit:.5 }); kaaba(q, ACX, 650, .32); cityscape(q, 700, { n:8, seed:R()*99|0, night:n, scale:.85, lit:.5 }); cityscape(q, 820, { n:6, seed:R()*99|0, night:n, scale:1.1, lit:.4 }); if(!n) birds(q, 4, R); },
 elephant(q, m, R, D){ const n = DARKMODE(m); scene(q, m, { hz:450, ridges:3, ground:'flat', seed:R()*99|0 }); cityscape(q, 540, { n:8, seed:R()*99|0, night:n, scale:.5, lit:.5 }); kaaba(q, ACX + 230, 560, .3);
   elephant(q, ACX - 120, 770, 1.05); flock(q, 46, R, D); },
 kaaba(q, m, R, D){ const n = DARKMODE(m); scene(q, m, { hz:420, ridges:3, ground:'flat', seed:R()*99|0 }); cityscape(q, 520, { n:10, seed:R()*99|0, night:n, scale:.55, lit:.5 });
   el('ellipse', q, { cx:ACX, cy:740, rx:380, ry:90, fill:n ? '#4a4a5e' : '#f1ebdc', opacity:.9 }); const k = kaaba(q, ACX, 740, 1.15); circ(q, ACX, 600, 260, { fill:'#ffe9b0', stroke:'none', opacity:n ? .1 : .18, filter:'url(#soft30)' }); if(!n) birds(q, 5, R, { c:'#5a5a6a' }); },
 idols(q, m, R, D){ SC.kaaba(q, m, R, D); for(let i = 0; i < 14; i++){ const a = Math.PI*(.05 + i/13*.9), x = ACX + Math.cos(a)*360, y = 730 + Math.sin(a)*60; stone(q, x, y, 14, '#8a8478'); rect(q, x - 9, y - 50, 18, 46, { rx:6, fill:LG([[0, '#a8a090'], [1, '#5a564e']], { x2:1, y2:0 }), stroke:'none' }); } },
 medina(q, m, R, D){ const n = DARKMODE(m); scene(q, m, { hz:470, ridges:2, ground:'flat', seed:R()*99|0 }); ground(q, m, { hz:540, kind:'harra', seed:R()*99|0 }); veil(q, .0);
   grove(q, [[PL.x + 60, 600, .8], [PL.x + 160, 620, .9], [PL.x + 640, 610, .85], [PL.x + 740, 630, .7], [PL.x + 300, 640, .6]], { night:n });
   cityscape(q, 720, { n:7, seed:R()*99|0, night:n, scale:.9, lit:.5 }); grove(q, [[PL.x + 90, 830, 1], [PL.x + 720, 840, 1.05]], { night:n }); },
 mosque(q, m, R, D){ const n = DARKMODE(m); scene(q, m, { hz:440, ridges:2, ground:'flat', seed:R()*99|0 }); grove(q, [[PL.x + 70, 600, .9], [PL.x + 730, 610, .95], [PL.x + 140, 630, .7]], { night:n }); mosque(q, ACX, 740, 1.35, { night:n }); grove(q, [[PL.x + 60, 840, 1.1]], { night:n }); },
 cave(q, m, R, D){ const n = DARKMODE(m); scene(q, m, { hz:640, ridges:2, ground:'flat', seed:R()*99|0, moon:n ? [PL.x + 640, PL.y + 120, 30, 'crescent'] : null });
   rockMass(q, `M${PL.x - 4} ${BOT}L${PL.x - 4} 620L${PL.x + 160} 470L${PL.x + 300} 300L${PL.x + 420} 240L${PL.x + 520} 290L${PL.x + 680} 470L${PL.x + PL.w + 4} 560V${BOT}Z`, { c:n ? ['#4a4558', '#1e1c28'] : ['#b48058', '#5a3a22'], rim:RIM[m] });
   caveMouth(q, PL.x + 430, 300, .5, { night:n, glow:.2 }); },
 mountain(q, m, R, D){ const n = DARKMODE(m); scene(q, m, { hz:600, ridges:2, ground:'flat', seed:R()*99|0 });
   const J = jag(R, PL.x - 10, PL.x + PL.w + 10, 640, 300 + R()*60, 22, 48); rockMass(q, J.d, { c:n ? ['#4e4558', '#221e2a'] : ['#c27850', '#6a3a22'], rim:RIM[m] });
   gullies(q, J.pts, 640, R, n ? '#16121c' : '#4a2614', .35);
   const J2 = jag(R, PL.x + 60, PL.x + 420, 700, 560, 7, 14); rockMass(q, J2.d, { c:n ? ['#5a5266', '#2a2632'] : ['#d8a070', '#8a5a34'], rim:RIM[m] });
   ground(q, m, { hz:700, seed:R()*99|0 });
   if(R() < .7) banner(q, PL.x + 250, 590, .45, '#2f6a4a');
   grove(q, [[PL.x + 560, 735, .5], [PL.x + 650, 745, .62], [PL.x + 730, 732, .45]], { night:n });
   for(let i = 0; i < 9; i++) stone(q, PL.x + 40 + R()*(PL.w - 80), 760 + R()*80, 6 + R()*12, n ? '#4a4450' : '#a07850'); },
 battle(q, m, R, D){ const v = (R()*4)|0, n = DARKMODE(m);
   if(v === 3){ scene(q, m === 'night' ? 'dusk' : m, { hz:520, ridges:2, ground:'flat', seed:R()*99|0 }); sword(q, ACX - 120, 760, -32, 1.3); sword(q, ACX + 110, 770, 28, 1.2); shield(q, ACX, 740, 1.2); return; }
   scene(q, m, { hz:500, ridges:2, ground:v === 2 ? 'dunes' : 'flat', seed:R()*99|0 });
   if(v === 1){ [[PL.x + 200, 700], [PL.x + 420, 740], [PL.x + 620, 690]].forEach(([x, y], i) => well(q, x, y, .55 + i*.05)); grove(q, [[PL.x + 80, 650, .6], [PL.x + 740, 660, .55]]); }
   if(v === 0 || v === 1){ for(let i = 0; i < 4; i++){ tent(q, PL.x + 90 + i*70, 580 + (i%2)*10, .35); tent(q, PL.x + 470 + i*80, 560 + (i%2)*12, .4); } banner(q, PL.x + 120, 600, .8, '#2f6a4a'); banner(q, PL.x + 300, 610, .7, '#f4efe2'); banner(q, PL.x + 560, 590, .8, '#a8332b'); banner(q, PL.x + 720, 600, .7, '#3a2a20'); }
   if(v === 2){ const cv = G(q, { x:-200 }); for(let i = 0; i < 4; i++){ camel(cv, PL.x + 40 + i*170, 770 - i*10, .85, { walk:true, c:shade('#b08050', (R() - .5)*.3) }); banner(cv, PL.x + 30 + i*170, 690 - i*10, .7, i%2 ? '#f4efe2' : '#2f6a4a'); } tw(cv, { x:150 }, 0, D, 'lin'); }
   const dust = G(q, { o:.5 }); for(let i = 0; i < 6; i++){ const c = circ(dust, PL.x + 150 + i*110, 640 + R()*40, 40 + R()*30, { fill:'#e8d2a8', stroke:'none', filter:'url(#soft16)' }); anim(c, 'transform', `0 0;${20 + R()*30} -10;0 0`, 6 + R()*5, { type:'translate', spline:EZ2 }); } },
 trench(q, m, R, D){ const n = DARKMODE(m); scene(q, m, { hz:470, ridges:2, ground:'flat', seed:R()*99|0 });
   const J = jag(R, PL.x - 10, PL.x + 330, 560, 380, 8, 20); rockMass(q, J.d, { c:n ? ['#4a4558', '#1e1c28'] : ['#b08060', '#5a3a22'], rim:RIM[m] });
   cityscape(q, 585, { n:9, seed:R()*99|0, night:n, scale:.55, lit:.5 }); grove(q, [[PL.x + 420, 600, .5], [PL.x + 640, 596, .55], [PL.x + 760, 604, .45]], { night:n });
   // spoil heaps along the inner side
   let d = `M${PL.x - 6} 668`; for(let x = PL.x - 6; x < PL.x + PL.w + 30; x += 40 + R()*30) d += `Q${x + 20} ${640 - R()*16} ${x + 46} 668`; d += `V690H${PL.x - 6}Z`;
   path(q, d, { fill:LG([[0, n ? '#5a4a40' : '#c89a64'], [1, n ? '#3a2e28' : '#8a6038']]), stroke:'none' }); path(q, d, { fill:'url(#tx-grain)', stroke:'none', opacity:.6 });
   // the ditch: lip, inner far wall (lit), floor, near wall (shadow)
   path(q, `M${PL.x - 6} 690Q${ACX} 682 ${PL.x + PL.w + 6} 692V708Q${ACX} 700 ${PL.x - 6} 706Z`, { fill:n ? '#6a5a4e' : '#d9b07a', stroke:'none' });
   path(q, `M${PL.x - 6} 706Q${ACX} 700 ${PL.x + PL.w + 6} 708V772Q${ACX} 766 ${PL.x - 6} 770Z`, { fill:LG([[0, n ? '#3a2e28' : '#a8784a'], [1, n ? '#1a1410' : '#5a3a20']]), stroke:'none' });
   path(q, `M${PL.x - 6} 770Q${ACX} 766 ${PL.x + PL.w + 6} 772V790Q${ACX} 796 ${PL.x - 6} 792Z`, { fill:n ? '#120e0c' : '#3a2414', stroke:'none' });
   path(q, `M${PL.x - 6} 792Q${ACX} 796 ${PL.x + PL.w + 6} 790`, { fill:'none', stroke:n ? '#7a6a5a' : '#e8c890', 'stroke-width':4, opacity:.9 });
   for(let i = 0; i < 7; i++) stone(q, PL.x + 30 + R()*(PL.w - 60), 812 + R()*36, 6 + R()*10, n ? '#4a4450' : '#a07850');
   if(R() < .6){ const sp = G(q, { x:PL.x + 120 + R()*500, y:820 }); line(sp, 0, 0, 70, -40, { stroke:'#5a3a1e', 'stroke-width':5 }); path(sp, 'M66 -38l18 -12l8 10l-16 12Z', { fill:'#8a8a8a', stroke:'#4a4a4a' }); } },
 fort(q, m, R, D){ const n = DARKMODE(m); scene(q, m, { hz:480, ridges:2, ground:'flat', seed:R()*99|0 }); fortress(q, ACX + 40, 640, 1.05, { c:n ? '#6a6070' : '#c9a878' }); grove(q, [[PL.x + 60, 760, .9], [PL.x + 160, 800, .75], [PL.x + 700, 790, .85], [PL.x + 600, 830, .7]], { night:n }); },
 sea(q, m, R, D){ const n = DARKMODE(m); skyFill(q, m, { hz:480 }); if(!n) { sun(q, PL.x + 620, PL.y + 160, 44, m); cloud(q, PL.x + 200, PL.y + 140, .9, m); } else moon(q, PL.x + 640, PL.y + 120, 30, 'full');
   ridge(q, { y:480, amp:50, seed:R()*99|0, cols:RIDGE[m] ? RIDGE[m][0] : RIDGE.day[0], tex:.2 });
   rect(q, PL.x - 4, 478, PL.w + 8, BOT - 474, { rx:0, fill:LG(n ? [[0, '#1a3050'], [1, '#0a1828']] : [[0, '#5aa6c0'], [1, '#1f5f80']]), stroke:'none' });
   for(let i = 0; i < 12; i++){ const y = 500 + i*30, ww = G(q); path(ww, `M${PL.x - 60} ${y}` + Array.from({ length:12 }, () => 'q20 -6 40 0t40 0').join(''), { stroke:'#e8f6ff', 'stroke-width':1.4 + i*.15, opacity:.25 + i*.03, fill:'none' }); anim(ww, 'transform', `0 0;${30 + i*3} 0;0 0`, 5 + i*.4, { type:'translate', spline:EZ2 }); }
   const sh = ship(q, PL.x + 120, 640, .9); tw(sh, { x:PL.x + 620 }, 0, D, 'lin'); if(!n) birds(q, 3, R, { c:'#e8f0f4' }); },
 palace(q, m, R, D){ scene(q, DARKMODE(m) ? 'dusk' : m, { hz:640, ridges:2, ground:'flat', seed:R()*99|0 }); columnsPalace(q, ACX, 720, 1.05); grove(q, [[PL.x + 50, 760, .8], [PL.x + 740, 770, .85]]); },
 scroll(q, m, R, D){ interior(q, { lampX:PL.x + 120 + R()*560, lampY:PL.y + 200 }); rect(q, PL.x - 4, 640, PL.w + 8, 220, { rx:0, fill:LG([[0, '#8a5a30'], [1, '#4a2e16']]), stroke:'none' }); scrollDoc(q, ACX, 560, 1.1, Math.max(6, D*.6)); inkwell(q, PL.x + 120, 780); },
 tents(q, m, R, D){ const n = DARKMODE(m); scene(q, m, { hz:460, ridges:3, ground:'flat', seed:R()*99|0 }); for(let r = 0; r < 4; r++) for(let i = 0; i < 9 - r; i++) whiteTent(q, PL.x + 40 + i*(PL.w - 80)/(8 - r) + (r%2)*30, 560 + r*80, .6 + r*.25); },
 arafat(q, m, R, D){ scene(q, m, { hz:480, ridges:3, ground:'flat', seed:R()*99|0 });
   rockMass(q, `M${ACX - 200} 620L${ACX - 100} 520L${ACX} 480L${ACX + 90} 510L${ACX + 200} 620Z`, { c:['#c49a70', '#7a5636'] }); rect(q, ACX - 8, 430, 16, 60, { rx:3, fill:'#fbf8f0', stroke:'#c9bca4', 'stroke-width':1 });
   for(let r = 0; r < 3; r++) for(let i = 0; i < 10; i++) whiteTent(q, PL.x + 30 + i*84 + (r%2)*40, 680 + r*70, .5 + r*.2); birds(q, 3, R); },
 valley(q, m, R, D){ scene(q, m, { hz:600, ridges:1, ground:'flat', seed:R()*99|0 }); canyon(q, m); tent(q, ACX - 20, 720, .6, { glow:DARKMODE(m) }); tent(q, ACX + 60, 790, .5); sheep(q, ACX - 60, 820, 1.1); sheep(q, ACX + 10, 840, 1); },
 garden(q, m, R, D){ scene(q, m, { hz:420, ridges:3, ground:'none', seed:R()*99|0 }); terraces(q, 480, 6, R); cityscape(q, 600, { n:4, seed:R()*99|0, scale:.6 }); grove(q, [[PL.x + 80, 840, 1], [PL.x + 720, 850, .9]]); birds(q, 4, R); },
 interior(q, m, R, D){ interior(q, { lampX:PL.x + 150 + R()*500, lampY:PL.y + 230 }); },
 lamp(q, m, R, D){ rect(q, PL.x - 4, PL.y - 4, PL.w + 8, PL.h + 8, { rx:0, fill:LG([[0, '#2a2028'], [1, '#120c10']]), stroke:'none' }); rect(q, PL.x, PL.y, PL.w, PL.h, { rx:0, fill:'url(#tx-paper)', stroke:'none' });
   const wx = ACX, wy = 330; const win = G(q); const cp = 'M' + (wx - 150) + ' 520V' + (wy + 30) + 'Q' + (wx - 150) + ' ' + (wy - 130) + ' ' + wx + ' ' + (wy - 150) + 'Q' + (wx + 150) + ' ' + (wy - 130) + ' ' + (wx + 150) + ' ' + (wy + 30) + 'V520Z';
   path(win, cp, { fill:LG(SKY.night), stroke:'#5a4a3a', 'stroke-width':10 }); const R2 = rng(R()*999|0); for(let i = 0; i < 26; i++){ const s = circ(win, wx - 130 + R2()*260, wy - 120 + R2()*300, .8 + R2()*1.6, { fill:'#fff6dc', stroke:'none', opacity:.8 }); if(R2() < .4) anim(s, 'opacity', '1;.3;1', 2 + R2()*3); }
   moon(win, wx + 60, wy - 40, 22, 'crescent'); rect(q, PL.x - 4, 600, PL.w + 8, 260, { rx:0, fill:LG([[0, '#3a2a1e'], [1, '#1a120c']]), stroke:'none' });
   circ(q, ACX, 600, 300, { fill:RG([[0, '#ffc870', .5], [1, '#ffc870', 0]]), stroke:'none' }); oilLamp(q, ACX - 30, 610, 2.4); },
 tree(q, m, R, D){ scene(q, m, { hz:520, ridges:2, ground:'flat', seed:R()*99|0 }); acacia(q, ACX, 720, 1.5); camel(q, PL.x + 120, 800, .7, { c:'#b98a55' }); camel(q, PL.x + 690, 810, .65, { c:'#a4743f', flip:true }); },
 well(q, m, R, D){ scene(q, m, { hz:520, ridges:2, ground:'flat', seed:R()*99|0 }); grove(q, [[PL.x + 100, 680, .9], [PL.x + 700, 690, .85]]); well(q, ACX, 760, 1.4); sheep(q, ACX + 170, 800, 1.3); sheep(q, ACX + 230, 815, 1.2); },
 nightsky(q, m, R, D){ scene(q, 'night', { hz:680, ridges:2, ground:'flat', seed:R()*99|0, moon:[PL.x + 200 + R()*400, PL.y + 160, 46, 'crescent'], stars:200 });
   const ss = G(q); const sl = line(ss, 0, 0, -60, 26, { stroke:'#fffbe8', 'stroke-width':2, opacity:.9 }); anim(ss, 'transform', `${PL.x + 700} ${PL.y + 60};${PL.x + 300} ${PL.y + 240};${PL.x + 300} ${PL.y + 240}`, 7, { type:'translate' }); anim(sl, 'opacity', '0;1;0;0', 7); },
 market(q, m, R, D){ scene(q, m, { hz:480, ridges:2, ground:'flat', seed:R()*99|0 }); for(let i = 0; i < 5; i++) tent(q, PL.x + 90 + i*160, 640 + (i%2)*30, .55); camel(q, PL.x + 200, 820, .8); camel(q, PL.x + 560, 830, .75, { flip:true }); },
 geometry(q, m, R, D){ paperBg(q); const cols = [COL.emerald, COL.gold, COL.terra, COL.lapis]; const v = (R()*3)|0;
   if(v === 0){ const g = G(q, { x:ACX, y:ACY + 40 }); const gi = G(g);
     for(let i = 0; i < 4; i++) rosette(gi, 0, 0, 300 - i*64, 16 - (i%2)*8, { stroke:cols[i], sw:3 - i*.4 }); anim(gi, 'transform', '0;360', 240); circ(q, ACX, ACY + 40, 60, { fill:RG([[0, '#fff3c0'], [1, '#e3b54a', .6]]), stroke:COL.gold, 'stroke-width':2 }); }
   else if(v === 1){ const g = G(q); const S = 130, c0 = cols[(R()*4)|0], c1 = cols[(R()*4)|0] === c0 ? COL.gold : COL.terra;
     for(let y = PL.y - S/2; y < BOT + S; y += S) for(let x = PL.x - S/2; x < PL.x + PL.w + S; x += S){ star8(g, x, y, S*.5, { fill:((x + y)/S)%2 ? c0 : c1, stroke:'#fbf3dc', 'stroke-width':4, opacity:.82 });
       star8(g, x + S/2, y + S/2, S*.22, { fill:'#f4e5c3', stroke:COL.gold, 'stroke-width':2 }); }
     tw(g, { x:-S, y:-S*.5 }, 0, D, 'lin'); rect(q, PL.x, PL.y, PL.w, PL.h, { rx:0, fill:RG([[0, '#fff', 0], [.7, '#f4e5c3', .15], [1, '#3a2a1a', .55]]), stroke:'none' }); }
   else { const g = G(q, { x:ACX, y:ACY + 30 }); const n = 12;
     for(let k = 0; k < 3; k++){ const gk = G(g); const r = 320 - k*90; let d = ''; for(let i = 0; i < n*2; i++){ const a = i*Math.PI/n, qq = i%2 ? r*.72 : r; d += (i ? 'L' : 'M') + (Math.cos(a)*qq).toFixed(1) + ' ' + (Math.sin(a)*qq).toFixed(1); }
       path(gk, d + 'Z', { fill:k === 1 ? '#efe0bc' : 'none', stroke:cols[k], 'stroke-width':5 - k, 'stroke-linejoin':'round' }); for(let i = 0; i < n; i++){ const a = i*2*Math.PI/n; circ(gk, Math.cos(a)*r*.86, Math.sin(a)*r*.86, 9 - k*2, { fill:cols[(k + 1)%4], stroke:'none' }); }
       anim(gk, 'transform', k%2 ? '360;0' : '0;360', 300 + k*80); }
     star8(g, 0, 0, 70, { fill:COL.emerald, stroke:COL.gold, 'stroke-width':4 }); star8(g, 0, 0, 36, { fill:'#f6e7b8', stroke:'none' }); } },
 book(q, m, R, D){ interior(q, { lampX:PL.x + 150 + R()*500, lampY:PL.y + 200 }); rect(q, PL.x - 4, 680, PL.w + 8, 180, { rx:0, fill:LG([[0, '#7a2e22'], [1, '#3a140e']]), stroke:'none' });
   for(let x = PL.x + 20; x < PL.x + PL.w; x += 60) path(q, `M${x} 700l20 12l-20 12l-20 -12Z`, { fill:'none', stroke:'#d9b45a', 'stroke-width':1.5, opacity:.45 });
   quranStand(q, ACX, 760, 1.25); oilLamp(q, PL.x + PL.w - 120, 770, 1); },
};
function autoScene(q, s, D){ const R = rng(s.seed + 1); (SC[s.k] || SC.desert)(q, s.mode, R, D); }
/* ---------- maps ---------- */
function autoMap(p, b){ const pl = plate(p); const q = pl.inner, P = b.map.pl;
  let lo0 = Math.min(...P.map(x => x[0])), lo1 = Math.max(...P.map(x => x[0])), la0 = Math.min(...P.map(x => x[1])), la1 = Math.max(...P.map(x => x[1]));
  const cx = (lo0 + lo1)/2, cy = (la0 + la1)/2; let dl = Math.max(3.4, (lo1 - lo0)*1.35), dt = Math.max(3, (la1 - la0)*1.35); if(dl < dt*1.08) dl = dt*1.08; else dt = dl/1.08;
  const M = mapBase(q, { x:PL.x + 20, y:PL.y + 20, w:PL.w - 40, h:PL.h - 40, lon0:cx - dl/2, lon1:cx + dl/2, lat0:cy - dt/2, lat1:cy + dt/2, labels:false, o:0 }); show(M.g, .1, .6); mapRelief(M);
  const L0 = cx - dl/2, L1 = cx + dl/2, A0 = cy - dt/2, A1 = cy + dt/2, inV = (lo, la, m) => lo > L0 + dl*m && lo < L1 - dl*m && la > A0 + dt*m && la < A1 - dt*m;
  { // Red Sea label: point on the sea axis nearest the view centre
    const a = [43.0, 13.2], z = [34.6, 27.9]; let best = null;
    for(let k = 0; k <= 40; k++){ const lo = a[0] + (z[0] - a[0])*k/40, la = a[1] + (z[1] - a[1])*k/40; if(!inV(lo, la, .14)) continue; const d = (lo - cx)**2 + (la - cy)**2; if(!best || d < best[2]) best = [lo, la, d]; }
    if(best && dl < 22){ const p0 = M.P(a[0], a[1]), p1 = M.P(z[0], z[1]); const ang = Math.atan2(p1[1] - p0[1], p1[0] - p0[0])*180/Math.PI + 180; M.lab('Красное море', best[0], best[1], { r:ang, size:Math.max(18, Math.min(26, 300/dl*2.2)), fill:'#e3f4f7' }); } }
  if(inV(51.6, 27.2, .1)) M.lab('Персидский залив', 51.6, 27.2, { r:-30, size:19, fill:'#e3f4f7' });
  if(inV(33.0, 34.4, .08)) M.lab('Средиземное море', 33.0, 34.4, { size:19, fill:'#e3f4f7' });
  const REF = [[39.83, 21.42, 'Мекка'], [39.61, 24.47, 'Медина'], [40.42, 21.27, 'Таиф'], [44.2, 15.35, 'Сана'], [36.3, 33.5, 'Дамаск'], [44.4, 31.95, 'аль-Хира'], [38.72, 14.13, 'Аксум'], [36.57, 28.38, 'Табук'], [39.29, 25.7, 'Хайбар'], [38.78, 23.73, 'Бадр']];
  const near = (lo, la) => P.some(x => Math.abs(x[0] - lo) < dl*.06 && Math.abs(x[1] - la) < dt*.06);
  REF.forEach(([lo, la, nm]) => { if(!inV(lo, la, .06) || near(lo, la)) return; const xr = M.P(lo, la)[0] > M.x0 + M.W*.78;
    const d = M.place([lo, la, nm], { o:0, size:18, r:4.5, weight:400, color:'#8a7a5c', dx:xr ? -9 : 9, anchor:xr ? 'end' : 'start' }); tw(d, { o:.75 }, .5, .6); });
  P.forEach(([lo, la, nm, ph], i) => { const t = wp(ph); const xr = M.P(lo, la)[0] > M.x0 + M.W*.72; const d = M.place([lo, la, nm], { o:0, size:24, color:i ? COL.terra : COL.emerald, dx:xr ? -12 : 12, anchor:xr ? 'end' : 'start' }); show(d, Math.max(.4, t));
 });
  const segs = Array.isArray(b.map.route) ? b.map.route : [];
  segs.forEach(([i0, i1]) => { const a0 = P[i0], a1 = P[i1]; if(!a0 || !a1) return; const t = Math.max(wp(a0[3]), wp(a1[3])); const r = route(M, [[a0[0], a0[1]], [a1[0], a1[1]]], { stroke:COL.emerald, 'stroke-width':5, 'stroke-dasharray':null }); draw(r, Math.max(.6, t - .2), 1.4); });
  autoCards(q, b, true); pl.frame(); }
/* ---------- cards ---------- */
function autoCards(q, b, onMap){ const its = b.items || []; const zoneY = onMap ? BOT - 150 : PL.y + 200; let live = [], lastT = -99, qInfo = null;
  its.forEach(it => { const t = Math.max(.5, wp(it.ph));
    if(it.t === 'date'){ plateDate(q, it.txt, t); return; }
    if(it.t === 'place'){ if(!onMap) plateCap(q, it.txt, t, { y:BOT - 50 }); return; }
    const freshQ = qInfo && t - qInfo.t < 6 && live.length === 1 && it.t !== 'quote';
    if(!freshQ && (it.t === 'quote' || t - lastT > 7 || live.length >= 2)){ live.forEach(g => tw(g, { o:0 }, t - .2, .4)); live = []; qInfo = null; }
    lastT = t; let y = zoneY + live.length*(onMap ? -78 : 84); let g;
    if(freshQ) y = qInfo.top - 44;
    if(it.t === 'quote'){ const txt = wrapTxt(it.txt, 46, onMap ? 3 : 5); const qy = onMap ? BOT - 170 : PL.y + 250; const nl = String(txt).split('\n').length; g = quoteCard(q, ACX, qy, 700, null, txt, it.src || null, t, { size:24 }); qInfo = { t, top:qy - (64 + nl*24*1.3 + (it.src ? 44 : 0))/2 }; }
    else if(it.t === 'num'){ g = tablet(q, ACX, y, 380, 96, { o:0 }); T(g, it.n, { y:2, size:46, weight:700, font:SERIF, fill:COL.gold }); T(g, it.u, { y:34, size:20, fill:COL.dim }); show(g, t); }
    else if(it.t === 'name'){ g = chip(q, ACX, y, it.txt, t, { size:24, c:/р\.а\.|мир ему/.test(it.txt) ? COL.emerald : COL.brown }); }
    if(g) live.push(g); }); }
function autoPlate(p, b){ const D = narD(); const s = b.scene;
  if(b.map) return autoMap(p, b);
  const dark = DARKMODE(s.mode) || s.k === 'lamp' || s.k === 'interior' || s.k === 'scroll' || s.k === 'nightsky';
  const pl = plate(p, { scene:'blank', dark }); const q = pl.inner; const kb = G(q, { x:0, y:0, s:1 }); autoScene(kb, s, D);
  if(s.k !== 'geometry') tw(kb, { s:1.06, x:-ACX*.06, y:-ACY*.06*(s.k === 'scroll' ? 0 : 1) }, 0, D, 'lin');
  autoCards(q, b, false); pl.frame(); }
function autoLesson(L){
  CHAPTER = { num:L.id, badge:`${L.num}.${L.n}`, lesson:true, title:L.title, next:L.next };
  BEATS = [lessonIntro({ ch:L.num, n:L.n, of:L.of, title:L.title, chapter:L.chapter, parts:L.parts, min:L.min })];
  L.beats.forEach(b => BEATS.push(readBeat(b.id, b.title, b.kicker, (p, D) => autoPlate(p, b))));
  if(L.wrap && L.wrap.length) BEATS.push(lessonWrap(L.wrap));
  if(L.quiz && L.quiz.length) BEATS.push(lessonQuiz(L.quiz.map(qq => ({ id:qq.id, prompt:qq.prompt, build:choice(qq.opts, qq.right, qq.why, qq.opts.map((o, i) => i === qq.right ? '' : `Нет. В книге: «${qq.opts[qq.right]}».`)) }))));
  BEATS.push(finishBeat()); boot(); }
