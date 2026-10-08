/* Shared drawings for «Запечатанный нектар». Strictly non-figurative: maps, geometry, calligraphy,
   architecture, landscapes, symbolic objects, diagrams. No human figures of any kind. */
'use strict';
const PEN = { filter:'url(#pencil)' };
function arrow(p, x1, y1, x2, y2, attrs, s){ return path(p, `M${x1} ${y1}L${x2} ${y2}`, Object.assign({ 'marker-end':'url(#arr)', 'stroke-width':4 }, attrs||{}), s); }
function curveArrow(p, d, attrs, s){ return path(p, d, Object.assign({ 'marker-end':'url(#arr)', 'stroke-width':4 }, attrs||{}), s); }
function hl(p, x, y, w, h=34, color=COL.hl, s){ const g = G(p, { x, y, sx:0, ...(s||{}) }); el('rect', g, { x:0, y:-h/2, width:w, height:h, rx:4, fill:color, opacity:.5 }); return g; }
function growX(g, t0, dur=.5){ return tw(g, { sx:1 }, t0, dur, 'out'); }
const GOLD = { stroke:COL.gold, fill:'none' };

/* ---------- ornament ---------- */
function rule(p, x, y, w, o){ // horizontal ornamental rule with a central star
  o = Object.assign({ color:COL.gold, o:1 }, o||{});
  const g = G(p, { x, y, o:o.o });
  path(g, `M${-w/2} 0H-26M26 0H${w/2}`, { stroke:o.color, 'stroke-width':2 });
  path(g, `M${-w/2+30} 7H-34M34 7H${w/2-30}`, { stroke:o.color, 'stroke-width':1, opacity:.6 });
  star8(g, 0, 0, 16, { fill:COL.paper, stroke:o.color, 'stroke-width':2 }); circ(g, 0, 0, 4, { fill:o.color, stroke:'none' });
  [-1, 1].forEach(k => { path(g, `M${k*w/2} 0l${-k*8} -6l${-k*8} 6l${k*8} 6z`, { fill:o.color, stroke:'none' }); });
  return g;
}
function rosette(p, cx, cy, r, n=8, o){ // interlaced n-fold rosette made of rotated squares and a petal ring
  o = Object.assign({ stroke:COL.gold, sw:2, fill:'none' }, o||{});
  const g = G(p, { x:cx, y:cy });
  for(let k = 0; k < n/4; k++){ const a = 90/(n/4)*k;
    el('rect', g, { x:-r*.707, y:-r*.707, width:r*1.414, height:r*1.414, fill:'none', stroke:o.stroke, 'stroke-width':o.sw, transform:`rotate(${a})` }); }
  circ(g, 0, 0, r*.38, { fill:o.fill, stroke:o.stroke, 'stroke-width':o.sw });
  for(let k = 0; k < n; k++){ const a = Math.PI*2/n*k; path(g, `M${(r*.38*Math.cos(a)).toFixed(1)} ${(r*.38*Math.sin(a)).toFixed(1)}L${(r*Math.cos(a)).toFixed(1)} ${(r*Math.sin(a)).toFixed(1)}`, { stroke:o.stroke, 'stroke-width':o.sw*.6, opacity:.7 }); }
  circ(g, 0, 0, r*1.04, { fill:'none', stroke:o.stroke, 'stroke-width':o.sw*.6, opacity:.6 });
  return g;
}
function cartouche(p, x, y, w, h, o){ // lobed manuscript title frame
  o = Object.assign({ fill:COL.card, stroke:COL.gold, o:1 }, o||{});
  const g = G(p, { x, y, o:o.o }), r = h/2;
  const d = `M${-w/2+r} ${-h/2}H${w/2-r}a${r*.5} ${r*.5} 0 0 0 ${r*.5} ${r*.5}a${r*.5} ${r*.5} 0 0 1 0 ${r}a${r*.5} ${r*.5} 0 0 0 ${-r*.5} ${r*.5}H${-w/2+r}a${r*.5} ${r*.5} 0 0 0 ${-r*.5} ${-r*.5}a${r*.5} ${r*.5} 0 0 1 0 ${-r}a${r*.5} ${r*.5} 0 0 0 ${r*.5} ${-r*.5}z`;
  path(g, d, { fill:o.fill, stroke:o.stroke, 'stroke-width':3, filter:'url(#shadow)' });
  el('path', g, { d, fill:'none', stroke:o.stroke, 'stroke-width':1.2, transform:'scale(.95 .86)', opacity:.8 });
  return g;
}
/* panel card with double gold border */
function tablet(p, x, y, w, h, o){
  o = Object.assign({ fill:COL.card, stroke:COL.gold, o:1, rx:10 }, o||{});
  const g = G(p, { x, y, o:o.o, s:o.s ?? 1 });
  rect(g, -w/2, -h/2, w, h, { rx:o.rx, fill:o.fill, stroke:o.stroke, 'stroke-width':2.5, filter:'url(#shadow)' });
  rect(g, -w/2+7, -h/2+7, w-14, h-14, { rx:Math.max(2, o.rx-4), fill:'none', stroke:o.stroke, 'stroke-width':1, opacity:.7 });
  return g;
}
/* numbered row with a star bullet; .tick = star fill */
function checkRow(p, num, text, o){
  o = Object.assign({ x:0, y:0, size:30, color:COL.emerald, o:0 }, o||{});
  const g = G(p, { x:o.x, y:o.y, o:o.o });
  const s = G(g, { x:o.size*.55, y:-o.size*.3 });
  const st8 = star8(s, 0, 0, o.size*.62, { fill:COL.card, stroke:COL.gold, 'stroke-width':2.5 });
  const fillStar = star8(s, 0, 0, o.size*.62, { fill:o.color, stroke:COL.gold, 'stroke-width':2.5 }, { o:0 });
  if(num !== '') T(s, String(num), { y:o.size*.22, size:o.size*.62, weight:700, fill:'#fbf3dc', font:SERIF });
  T(g, text, { x:o.size*1.6, y:0, size:o.size, anchor:'start' });
  g.tick = { setAttribute(){}, _s:{} }; g.star = fillStar; return g;
}
function introCard(p, o, m){
  const g = G(p);
  const ro = rosette(g, 800, 175, 70, 16, { stroke:COL.gold, sw:1.6 }); st(ro, { o:0, s:.6 }); tw(ro, { o:.9, s:1, r:22.5 }, 0, 1.6, 'out');
  const num = T(g, o.kicker, { x:800, y:298, size:28, weight:700, fill:COL.orange, ls:6, o:0 });
  const t = T(g, o.title, { x:800, y:390, size:o.size || 72, weight:700, font:SERIF, lh:1.12, o:0 });
  const lines = String(o.title).split('\n').length;
  const r1 = rule(g, 800, 432 + (lines-1)*80, o.ul || 640, { o:0 });
  const sub = T(g, o.sub, { x:800, y:500 + (lines-1)*80, size:32, fill:COL.dim, italic:true, font:SERIF, o:0 });
  show(num, .2); show(t, .35, .7); show(r1, .8, .6); show(sub, m ? m('sub', 0) : 1.2, .6);
  if(o.ar){ const a = T(g, o.ar, { x:800, y:640 + (lines-1)*80, size:64, font:ARAB, fill:COL.gold, o:0 }); show(a, m ? m('sub', .6) : 1.6, 1); }
  return g;
}
function wrapRun(title, items){
  return (m, D) => {
    const p = panel(0);
    const tt = T(p, title, { x:800, y:140, size:52, weight:700, font:SERIF, o:0 }); show(tt, .1);
    show(rule(p, 800, 175, 520, { o:0 }), .3);
    p.classList.add('introsvg');
    if(typeof CARDS !== 'undefined' && CARDS){ const mi = document.createElement('div'); mi.className = 'mintro mwrap';
      mi.innerHTML = `<h1>${esc(honor(title))}</h1><ol>${items.map((it, i) => `<li style="animation-delay:${.3 + i*.35}s">${esc(honor(String(it).replace(/\n/g, ' ')))}</li>`).join('')}</ol>`; CARDS.appendChild(mi); }
    items.forEach((it, i) => { const r = checkRow(p, i+1, it, { x:250, y:280 + i*118, size:34 }); show(r, m('t' + (i+1), 0)); show(r.star, m('t' + (i+1), .4), .5); });
  };
}
function finishBeat(){ return ['finish', 'Итоги главы', (m, D) => { panel(0); }, { ask: done => finishCard(done) }]; }
function practiceIntro(p, txt='Практика главы'){ const t = T(p, txt, { x:800, y:120, size:44, weight:700, font:SERIF, o:0 }); show(t, .1); return t; }
function axes(p, o){
  o = Object.assign({ x:200, y:150, w:700, h:450, xl:'', yl:'', o:1 }, o||{});
  const g = G(p, { o:o.o });
  const ax = path(g, `M${o.x} ${o.y}V${o.y+o.h}H${o.x+o.w}`, { 'stroke-width':3, stroke:COL.brown }, { d:0 });
  const xl = T(g, o.xl, { x:o.x + o.w, y:o.y + o.h + 44, size:26, anchor:'end', fill:COL.dim, o:0 });
  const yl = T(g, o.yl, { x:o.x - 16, y:o.y - 22, size:26, anchor:'start', fill:COL.dim, o:0 });
  return { g, ax, xl, yl, X:v => o.x + v*o.w, Y:v => o.y + o.h - v*o.h, o };
}

/* ---------- maps ---------- */
const GEO = {
  asia:[[26,42],[62,42],[62,25.1],[61.5,25.15],[58.5,25.6],[57.3,25.8],[57.0,26.8],[56.3,27.15],[55.7,26.9],[54.8,26.5],[54.0,26.6],[52.6,27.4],[51.4,27.9],[50.85,28.95],[50.3,29.4],[49.5,30.0],[48.6,30.0],[48.1,29.95],
    [47.95,29.4],[48.5,28.4],[48.9,27.6],[49.6,27.1],[50.15,26.45],[50.2,25.6],[50.8,24.8],[50.8,25.6],[51.2,26.15],[51.6,25.3],[51.6,24.25],[53.0,24.15],[54.4,24.45],[55.3,25.25],[55.9,25.8],[56.3,26.4],[56.35,25.6],[56.7,24.4],[58.6,23.6],[59.8,22.4],[58.6,20.6],[57.8,20.2],[57.8,19.0],[56.6,18.0],[55.4,17.8],[54.1,17.0],[52.2,15.6],[50.5,15.1],[49.1,14.5],[48.0,14.0],[46.5,13.4],[45.0,12.8],[43.45,12.65],
    [43.25,13.3],[42.95,14.8],[42.75,15.7],[42.55,16.9],[41.7,17.9],[40.9,19.1],[40.27,20.15],[39.6,20.7],[39.17,21.5],[39.1,22.2],[38.98,22.8],[38.6,23.5],[38.06,24.09],[37.3,25.05],[36.45,26.2],[35.7,27.35],[34.8,28.1],[34.95,29.4],
    [34.9,29.5],[34.45,28.6],[34.25,27.75],[33.2,28.6],[32.55,29.95],[32.35,30.6],[32.3,31.25],[33.8,31.15],[34.45,31.5],[34.75,32.1],[35.0,32.8],[35.2,33.27],[35.5,33.9],[35.9,35.3],[35.8,36.3],[36.2,36.6],[35.5,36.6],[34.6,36.8],[33.5,36.2],[32.5,36.1],[31,36.8],[29.6,36.2],[28,36.7],[27.3,37.5],[26.5,38.5],[26.5,40]],
  africa:[[28,31.1],[29.9,31.2],[31.8,31.5],[32.3,31.25],[32.35,30.6],[32.55,29.95],[32.7,29.0],[33.55,27.2],[34.3,26.1],[35.0,24.6],[35.6,23.9],[36.9,22.0],[37.25,19.6],[38.5,18.1],[39.45,15.6],[40.8,14.2],[41.7,13.3],[43.1,11.6],[44.6,10.4],[47.0,11.1],[49.0,11.3],[51.2,11.85],[51.3,10.5],[51,8],[28,8]],
  euphrates:[[40.6,34.4],[41.4,34.2],[42.5,33.4],[43.8,32.6],[44.4,32.0],[45.5,31.3],[46.5,31.0],[47.5,30.9],[48.1,29.95]],
  tigris:[[43.3,34.6],[44.3,33.6],[44.5,33.2],[45.6,32.5],[46.9,31.4],[47.4,31.0]],
  arabia:[[48.1,29.95],[47.95,29.4],[48.5,28.4],[48.9,27.6],[49.6,27.1],[50.15,26.45],[50.2,25.6],[50.8,24.8],[50.8,25.6],[51.2,26.15],[51.6,25.3],[51.6,24.25],[53.0,24.15],[54.4,24.45],[55.3,25.25],[55.9,25.8],[56.3,26.4],[56.35,25.6],[56.7,24.4],[58.6,23.6],[59.8,22.4],[58.6,20.6],[57.8,20.2],[57.8,19.0],[56.6,18.0],[55.4,17.8],[54.1,17.0],[52.2,15.6],[50.5,15.1],[49.1,14.5],[48.0,14.0],[46.5,13.4],[45.0,12.8],[43.45,12.65],[43.25,13.3],[42.95,14.8],[42.75,15.7],[42.55,16.9],[41.7,17.9],[40.9,19.1],[40.27,20.15],[39.6,20.7],[39.17,21.5],[39.1,22.2],[38.98,22.8],[38.6,23.5],[38.06,24.09],[37.3,25.05],[36.45,26.2],[35.7,27.35],[34.8,28.1],[34.95,29.4],[34.9,29.5],[36.5,30.5],[38.0,31.6],[39.2,32.2],[41.5,31.3],[44.0,30.2],[46.5,29.6]]
};
const PLACE = { mecca:[39.83,21.42,'Мекка'], medina:[39.61,24.47,'Медина (Йасриб)'], taif:[40.42,21.27,'Таиф'], jeddah:[39.19,21.49,'Джидда'], badr:[38.78,23.73,'Бадр'], khaybar:[39.29,25.7,'Хайбар'],
  tabuk:[36.57,28.38,'Табук'], sanaa:[44.2,15.35,'Сана'], marib:[45.32,15.43,'Мариб'], hira:[44.4,31.95,'Хира'], damascus:[36.3,33.5,'Дамаск'], busra:[36.48,32.52,'Бусра'], jabiya:[35.95,32.9,'Джабия'],
  gaza:[34.45,31.5,'Газза'], oman:[58.4,23.6,'Оман'], bahrain:[49.6,25.4,'Бахрейн'], ukaz:[40.5,21.6,'Указ'], nakhla:[40.2,21.75,'Нахля'], qudayd:[39.37,22.35,'Кудайд'], mushallal:[39.2,22.3,'аль-Мушаллаль'],
  thawr:[39.85,21.37,'Саур'], quba:[39.62,24.44,'Куба'], usfan:[39.43,21.92,'Усфан'], arj:[39.3,23.7,'аль-Ардж'] };
function mapBase(p, o){
  o = Object.assign({ x:80, y:60, w:900, h:780, lon0:31, lon1:61, lat0:11, lat1:34, labels:true, o:1, frame:true }, o||{});
  const dl = o.lon1 - o.lon0, dt = o.lat1 - o.lat0, k = Math.min(o.w/dl, o.h/(dt*1.08));
  const W = dl*k, H = dt*1.08*k, x0 = o.x + (o.w - W)/2, y0 = o.y + (o.h - H)/2;
  const P = (lon, lat) => [x0 + (lon - o.lon0)*k, y0 + (o.lat1 - lat)*1.08*k];
  const g = G(p, { o:o.o });
  const id = 'clip' + Math.random().toString(36).slice(2, 8);
  const cp = el('clipPath', DEFS, { id }); el('rect', cp, { x:x0, y:y0, width:W, height:H, rx:6 });
  const inner = G(g); inner.setAttribute('clip-path', `url(#${id})`);
  if(typeof sdefs === 'function') sdefs();
  const SEA = typeof LG === 'function' ? LG([[0, '#3d8aa6'], [1, '#2a6a8a']]) : '#b9d3cf';
  el('rect', inner, { x:x0, y:y0, width:W, height:H, fill:SEA });
  for(let yy = y0 + 18; yy < y0 + H; yy += 22) el('path', inner, { d:`M${x0} ${yy}q${W/16} -4 ${W/8} 0t${W/8} 0t${W/8} 0t${W/8} 0t${W/8} 0t${W/8} 0t${W/8} 0t${W/8} 0`, fill:'none', stroke:'#bfe6ef', 'stroke-width':1.1, opacity:.35 });
  const poly = pts => 'M' + pts.map(q => P(q[0], q[1]).map(v => v.toFixed(1)).join(' ')).join('L') + 'Z';
  const line = pts => 'M' + pts.map(q => P(q[0], q[1]).map(v => v.toFixed(1)).join(' ')).join('L');
  [GEO.africa, GEO.asia, GEO.arabia].forEach(L => el('path', inner, { d:poly(L), fill:'none', stroke:'#8fd0d6', 'stroke-width':14, opacity:.55, 'stroke-linejoin':'round' }));
  const LAND = typeof LG === 'function' ? LG([[0, '#e6c88e'], [1, '#d3a868']], { x1:0, y1:0, x2:1, y2:1 }) : '#e2d3ad';
  el('path', inner, { d:poly(GEO.africa), fill:LAND, stroke:'#8a6a3c', 'stroke-width':1.6 });
  el('path', inner, { d:poly(GEO.asia), fill:LAND, stroke:'#8a6a3c', 'stroke-width':1.6 });
  const ar = el('path', inner, { d:poly(GEO.arabia), fill:typeof LG === 'function' ? LG([[0, '#f2d9a0'], [1, '#e2b676']], { x1:0, y1:0, x2:1, y2:1 }) : '#f0dfb4', stroke:'none' });
  [GEO.africa, GEO.asia, GEO.arabia].forEach(L => el('path', inner, { d:poly(L), fill:'url(#tx-grain)', stroke:'none', opacity:.9 }));
  el('path', inner, { d:line(GEO.euphrates), fill:'none', stroke:'#7fa9b5', 'stroke-width':2.5 });
  el('path', inner, { d:line(GEO.tigris), fill:'none', stroke:'#7fa9b5', 'stroke-width':2.5 });
  if(o.frame){ rect(g, x0, y0, W, H, { rx:6, fill:'none', stroke:COL.gold, 'stroke-width':3 }); rect(g, x0-7, y0-7, W+14, H+14, { rx:9, fill:'none', stroke:COL.gold, 'stroke-width':1 }); }
  const M = { g, inner, P, k, x0, y0, W, H, arabia:ar, poly, line };
  M.lab = (txt, lon, lat, op) => { const [x, y] = P(lon, lat); return T(inner, txt, Object.assign({ x, y, size:22, fill:COL.dim, italic:true, font:SERIF }, op||{})); };
  M.place = (key, op) => placeDot(M, key, op);
  if(o.labels){
    M.lab('Красное море', 37.6, 22.0, { r:58, size:20, fill:'#e3f4f7' });
    M.lab('Персидский залив', 51.2, 27.15, { r:-28, size:19, fill:'#e3f4f7' });
    M.lab('Аравийское море', 57, 14.6, { size:22, fill:'#e3f4f7' });
    if(o.med) M.lab('Средиземное\nморе', 32.2, 33.1, { size:18, fill:'#e3f4f7' });
  }
  return M;
}
function placeDot(M, key, op){
  op = Object.assign({ dx:12, dy:-10, anchor:'start', size:22, color:COL.terra, o:0, label:null, r:7, weight:700 }, op||{});
  const [lon, lat, name] = Array.isArray(key) ? key : PLACE[key];
  const [x, y] = M.P(lon, lat), g = G(M.g, { x, y, o:op.o });
  circ(g, 0, 0, op.r, { fill:op.color, stroke:'#fbf3dc', 'stroke-width':2.5 });
  const t = T(g, op.label ?? name, { x:op.dx, y:op.dy, size:op.size, anchor:op.anchor, weight:op.weight, fill:COL.ink, font:SERIF });
  t.setAttribute('paint-order', 'stroke'); t.setAttribute('stroke', '#f6ecd2'); t.setAttribute('stroke-width', 5);
  g.xy = [x, y]; return g;
}
/* route along lon/lat points; returns path (draw it) and helper to move a token along it */
function route(M, pts, attrs){
  const d = M.line(pts);
  const r = path(M.g, d, Object.assign({ stroke:COL.terra, 'stroke-width':5, 'stroke-dasharray':null }, attrs||{}), { d:0 });
  return r;
}
function along(token, pth, t0, dur, ease='io'){ // move a <g> token along a path element
  prog(q => { const L = pth.getTotalLength(), pt = pth.getPointAtLength(q*L); st(token, { x:pt.x, y:pt.y }); }, t0, dur, ease);
}
function token(p, o){ // small glowing traveller token: a lantern-like star (never a person)
  o = Object.assign({ x:0, y:0, color:COL.emerald, r:14, o:1 }, o||{});
  const g = G(p, { x:o.x, y:o.y, o:o.o });
  circ(g, 0, 0, o.r*1.9, { fill:COL.gold2, stroke:'none', opacity:.35, filter:'url(#glow)' });
  star8(g, 0, 0, o.r, { fill:o.color, stroke:'#fbf3dc', 'stroke-width':2 });
  return g;
}

/* ---------- architecture & landscape ---------- */
function kaaba(p, x, y, s=1, o){ // cube in three-quarter view, black with a gold band
  o = Object.assign({ o:1 }, o||{});
  const g = G(p, { x, y, s, o:o.o });
  el('ellipse', g, { cx:0, cy:8, rx:150, ry:26, fill:'#000', opacity:.12 });
  path(g, 'M-110 -150L0 -185L110 -150L0 -118Z', { fill:'#2c2926', stroke:'#151311', 'stroke-width':2 });
  path(g, 'M-110 -150L0 -118V0L-110 -32Z', { fill:'#1b1916', stroke:'#151311', 'stroke-width':2 });
  path(g, 'M0 -118L110 -150V-32L0 0Z', { fill:'#26231f', stroke:'#151311', 'stroke-width':2 });
  path(g, 'M-110 -122L0 -90L110 -122V-108L0 -76L-110 -108Z', { fill:COL.gold2, stroke:'none' });
  path(g, 'M30 -48L58 -56V-14L30 -6Z', { fill:COL.gold2, stroke:'#8d6a22', 'stroke-width':1.5 }); // door
  circ(g, -100, -36, 5, { fill:'#6b5d4d', stroke:COL.gold2, 'stroke-width':2 }); // Black Stone corner
  return g;
}
function mountains(p, o){
  o = Object.assign({ y:640, color:'#c9ad7a', color2:'#b39363', o:1, peak:null }, o||{});
  const g = G(p, { o:o.o });
  path(g, `M40 ${o.y}L180 ${o.y-120}L300 ${o.y-60}L470 ${o.y-190}L600 ${o.y-80}L760 ${o.y-150}L900 ${o.y-50}L1080 ${o.y-170}L1240 ${o.y-70}L1400 ${o.y-140}L1560 ${o.y-40}V860H40Z`, { fill:o.color2, stroke:'none' });
  path(g, `M40 ${o.y+70}L250 ${o.y-10}L420 ${o.y+50}L620 ${o.y-30}L820 ${o.y+60}L1000 ${o.y}L1200 ${o.y+70}L1400 ${o.y+10}L1560 ${o.y+60}V860H40Z`, { fill:o.color, stroke:'none' });
  return g;
}
function nightSky(p, o){
  o = Object.assign({ o:1, n:90, seed:3 }, o||{});
  const g = G(p, { o:o.o });
  const id = 'sky' + Math.random().toString(36).slice(2, 7);
  const lg = el('linearGradient', DEFS, { id, x1:0, y1:0, x2:0, y2:1 });
  el('stop', lg, { offset:'0', 'stop-color':'#0b1a2c' }); el('stop', lg, { offset:'.7', 'stop-color':'#1d3554' }); el('stop', lg, { offset:'1', 'stop-color':'#3b4f6b' });
  rect(g, 30, 30, 1540, 840, { rx:2, fill:`url(#${id})`, stroke:'none' });
  let sd = o.seed; const rnd = () => (sd = (sd*9301 + 49297) % 233280)/233280;
  g.stars = [];
  for(let i = 0; i < o.n; i++){ const s = circ(g, 40 + rnd()*1520, 40 + rnd()*520, .8 + rnd()*2.2, { fill:'#fff6dc', stroke:'none', opacity:.4 + rnd()*.6 }); g.stars.push(s); }
  return g;
}
function moon(p, x, y, r, phase='full', o){
  o = Object.assign({ o:1 }, o||{});
  const g = G(p, { x, y, o:o.o });
  circ(g, 0, 0, r*1.8, { fill:'#fff2c4', stroke:'none', opacity:.25, filter:'url(#glow)' });
  if(phase === 'full') circ(g, 0, 0, r, { fill:'#fbf0cf', stroke:'none' });
  else path(g, `M0 ${-r}A${r} ${r} 0 1 0 0 ${r}A${r*.72} ${r} 0 1 1 0 ${-r}Z`, { fill:'#fbf0cf', stroke:'none', transform:'rotate(-25)' });
  return g;
}
function palm(p, x, y, s=1, o){
  o = Object.assign({ o:1, c:'#3f6b3a', t:'#7a5a36' }, o||{});
  const g = G(p, { x, y, s, o:o.o });
  path(g, 'M0 0C6 -60 -4 -120 10 -180', { stroke:o.t, 'stroke-width':12 });
  [[-95,-150],[-80,-205],[-20,-235],[45,-230],[100,-195],[95,-145]].forEach(([dx, dy]) => path(g, `M10 -180Q${(10+dx)/2} ${-200 + dy*.12} ${dx} ${dy}Q${(10+dx)/2 + 4} ${-190 + dy*.08} 10 -176`, { fill:o.c, stroke:o.c, 'stroke-width':3 }));
  [[-4,-170],[12,-166],[4,-160]].forEach(([cx, cy]) => circ(g, cx, cy, 6, { fill:'#9a5a1c', stroke:'none' }));
  return g;
}
function dunes(p, o){
  o = Object.assign({ y:620, o:1 }, o||{});
  const g = G(p, { o:o.o });
  path(g, `M30 ${o.y}Q300 ${o.y-90} 600 ${o.y-10}T1200 ${o.y-20}T1570 ${o.y-40}V870H30Z`, { fill:'#e2c48a', stroke:'none' });
  path(g, `M30 ${o.y+80}Q420 ${o.y-10} 800 ${o.y+70}T1570 ${o.y+50}V870H30Z`, { fill:'#d6b273', stroke:'none' });
  return g;
}
/* stylised domed mosque elevation — architecture only */
function mosque(p, x, y, s=1, o){
  o = Object.assign({ o:1, c:'#e7d6ad', line:'#8d7446' }, o||{});
  const g = G(p, { x, y, s, o:o.o });
  rect(g, -140, -90, 280, 90, { rx:2, fill:o.c, stroke:o.line, 'stroke-width':2 });
  for(let i = -2; i <= 2; i++) path(g, `M${i*52-16} 0V-42a16 16 0 0 1 32 0V0`, { fill:'#cdb886', stroke:o.line, 'stroke-width':2 });
  path(g, 'M-70 -90a70 70 0 0 1 140 0Z', { fill:o.c, stroke:o.line, 'stroke-width':2 });
  rect(g, -168, -170, 22, 170, { rx:2, fill:o.c, stroke:o.line, 'stroke-width':2 }); path(g, 'M-170 -170L-157 -200L-144 -170Z', { fill:COL.gold2, stroke:o.line, 'stroke-width':1.5 });
  return g;
}
/* scroll / manuscript page with text lines */
function scroll(p, x, y, w, h, o){
  o = Object.assign({ o:1 }, o||{});
  const g = G(p, { x, y, o:o.o, s:o.s ?? 1 });
  rect(g, -w/2, -h/2, w, h, { rx:4, fill:'#f8eed4', stroke:'#b69b67', 'stroke-width':2, filter:'url(#shadow)' });
  [-1, 1].forEach(k => { rect(g, -w/2 - 16, k*h/2 - 14, w + 32, 28, { rx:14, fill:'#c9a970', stroke:'#8d7446', 'stroke-width':2 }); });
  return g;
}
/* generic horizontal timeline */
function timeline(p, o){
  o = Object.assign({ x0:160, x1:1440, y:600, a:0, b:1, o:1, color:COL.brown }, o||{});
  const g = G(p, { o:o.o });
  const X = v => o.x0 + (v - o.a)/(o.b - o.a)*(o.x1 - o.x0);
  const ax = path(g, `M${o.x0} ${o.y}H${o.x1}`, { stroke:o.color, 'stroke-width':4 }, { d:0 });
  return { g, ax, X, y:o.y,
    tick(v, txt, op){ op = Object.assign({ up:true, size:24, o:0, color:COL.terra, h:24 }, op||{}); const t = G(g, { x:X(v), y:o.y, o:op.o });
      path(t, `M0 ${-op.h/2}V${op.h/2}`, { stroke:op.color, 'stroke-width':4 }); star8(t, 0, 0, 9, { fill:op.color, stroke:'#fbf3dc', 'stroke-width':1.5 });
      T(t, txt, { y: op.up ? -28 - (String(txt).split('\n').length - 1)*op.size*1.2 : 46, size:op.size, weight:600, lh:1.2, font:SERIF }); return t; } };
}
/* overlay layer inside the current panel: replaces the previous overlay */
function layer(t0=0){
  const old = S._layer; if(old && old.isConnected){ hide(old, t0, .35); at(t0 + .4, () => old.remove()); }
  const g = G(S._panel); S._layer = g; return g;
}
/* text block on the right side of a map */
function side(p, title, lines, o){
  o = Object.assign({ x:1250, y:150, w:560, size:28, t0:0, m:null }, o||{});
  const g = G(p);
  const tt = T(g, title, { x:o.x, y:o.y, size:40, weight:700, font:SERIF, o:0 }); show(tt, o.t0);
  const r = rule(g, o.x, o.y + 34, Math.min(o.w, 420), { o:0 }); show(r, o.t0 + .2);
  return g;
}
