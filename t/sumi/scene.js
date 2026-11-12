// Общий код сцен «Туши». Какая сцена — задаёт страница: window.SCENE = 'start' | 'brb' | 'end'.
// Пейзаж (горы, ветка, камыш) рисуется один раз на canvas, дальше двигается только CSS — сцена почти не грузит компьютер.
// Таймер считается с момента открытия страницы — в OBS включите «Обновить браузер, когда сцена становится активной».
const SCENE = window.SCENE;
const openedAt = Date.now();
document.body.dataset.scene = SCENE;
document.body.insertAdjacentHTML('beforeend', `
  <div class="all">
    <div class="paper"></div>
    <img class="bgmedia" hidden alt=""><video class="bgmedia" hidden muted playsinline loop autoplay></video>
    <div class="land">
      <canvas class="m far" width="2320" height="560"></canvas>
      <canvas class="m mid" width="2320" height="560"></canvas>
      <div class="mist"></div>
      <canvas class="m near" width="2320" height="560"></canvas>
    </div>
    <div class="sunBox"><i class="rings b"></i><i class="rings"></i><i class="disc"></i></div>
    <div class="birds"></div>
    <canvas class="reeds l" width="460" height="560"></canvas>
    <canvas class="reeds" width="460" height="560"></canvas>
    <div class="head"><div class="label"></div><div class="title"></div><div class="clock"><span class="timer"></span><span class="total"></span></div></div>
    <div class="schedule"></div>
    <div class="seal"></div>
    <div class="note"></div>
    <canvas class="branch" width="1240" height="720"></canvas>
    <div class="petals"></div>
    <div class="event"><span class="kind"></span><span class="who"></span></div>
  </div>`);

const $ = (s) => document.querySelector(s);
let S = null, started = false, drawnFor = '';

function fitScene() {
  const k = Math.min(innerWidth / 1920, innerHeight / 1080);
  document.body.style.transformOrigin = '0 0';
  document.body.style.transform = `translate(${(innerWidth - 1920 * k) / 2}px, ${(innerHeight - 1080 * k) / 2}px) scale(${k})`;
}
addEventListener('resize', fitScene);
fitScene();

const rgb = (hex) => { const n = parseInt(hex.slice(1), 16); return `${n >> 16},${(n >> 8) & 255},${n & 255}`; };

// Хребет размывкой: вершины тёмные, вниз тушь растворяется в тумане. Рисуем узкими столбиками, у каждого свой градиент.
function drawRidge(cv, seed, o) {
  const x = cv.getContext('2d'), W = cv.width, r = Ink.rng(seed), c = rgb(o.color);
  x.clearRect(0, 0, W, cv.height);
  const peaks = Array.from({ length: o.peaks }, (_, i) => ({ c: (i + .15 + r() * .7) / o.peaks * W, w: o.w * (.6 + r() * .8), h: o.amp * (.4 + r() * .6), skew: (r() - .5) * .6 }));
  let wob = 0;
  for (let i = 0; i < W; i += 3) {
    let h = 0;
    for (const p of peaks) {
      const d = (i - p.c) / p.w, dd = d < 0 ? -d * (1 + p.skew) : d * (1 - p.skew);
      h = Math.max(h, p.h * Math.max(0, 1 - dd) ** 1.15);
    }
    wob = wob * .97 + (r() - .5) * 1.1;
    const y = o.base - h + wob, depth = 60 + h * 1.05;
    const a = o.alpha * Math.min(1, h / (o.amp * .4)) ;
    if (a <= .01) continue;
    const g = x.createLinearGradient(0, y, 0, y + depth);
    g.addColorStop(0, `rgba(${c},${a})`); g.addColorStop(.3, `rgba(${c},${a * .6})`); g.addColorStop(1, `rgba(${c},0)`);
    x.fillStyle = g;
    x.fillRect(i, y, 3.6, depth);
  }
  // Сухие штрихи по правым склонам — тень
  x.strokeStyle = `rgba(${c},${o.alpha * .55})`; x.lineCap = 'round';
  for (const p of peaks) for (let k = 0; k < 6; k++) {
    const t = r() * .45, len = .12 + r() * .25, sw = p.w / (1 - p.skew);
    x.lineWidth = 1 + r() * 2.5;
    x.beginPath();
    x.moveTo(p.c + t * sw + 4, o.base - p.h * (1 - t) + 10 + k * 7);
    x.lineTo(p.c + (t + len) * sw, o.base - p.h * (1 - t - len) + 22 + k * 9);
    x.stroke();
  }
}

// Ветка: каждый сук делится на два-три потоньше и чуть провисает; на тонких — цветы
function drawBranch(cv, wood, petal) {
  const x = cv.getContext('2d'), r = Ink.rng(12), flowers = [];
  x.clearRect(0, 0, cv.width, cv.height);
  x.strokeStyle = wood; x.lineCap = 'round';
  const grow = (px, py, ang, len, wid, depth) => {
    let cx = px, cy = py, a = ang;
    for (let i = 0; i < 4; i++) {
      a += (r() - .5) * .34;
      if (cy > 215 && Math.sin(a) > 0) a *= .35;   // ниже не растём: там заголовок
      const nx = cx + Math.cos(a) * len / 4, ny = cy + Math.sin(a) * len / 4;
      x.lineWidth = Math.max(1, wid * (1 - i * .07));
      x.beginPath(); x.moveTo(cx, cy); x.lineTo(nx, ny); x.stroke();
      cx = nx; cy = ny;
      if (depth < 3 && r() < .62) flowers.push([cx + (r() - .5) * 34, cy + (r() - .5) * 34, depth]);
    }
    if (depth <= 0 || wid < 1.3) { flowers.push([cx, cy, 0]); return; }
    const n = r() < .62 ? 2 : 3;
    for (let k = 0; k < n; k++) grow(cx, cy, a + (k - (n - 1) / 2) * .62 + (r() - .5) * .36 + .03, len * (.6 + r() * .2), wid * .6, depth - 1);
  };
  grow(-14, 40, .1, 380, 24, 5);
  const light = Ink.mix(petal, '#ffffff', .4), dark = Ink.mix(petal, '#5a0a1a', .35);
  for (const [fx, fy, depth] of flowers) {
    if (depth > 1 && r() < .5) {   // бутон
      x.fillStyle = dark; x.globalAlpha = .85;
      x.beginPath(); x.arc(fx, fy, 2 + r() * 2.5, 0, 7); x.fill();
      continue;
    }
    const n = 4 + (r() < .6 ? 1 : 0), R = 6 + r() * 7, rot = r() * 6.28;
    for (let i = 0; i < n; i++) {
      const a = rot + i / n * 6.28;
      x.fillStyle = r() < .3 ? light : petal; x.globalAlpha = .72 + r() * .25;
      x.beginPath(); x.ellipse(fx + Math.cos(a) * R * .62, fy + Math.sin(a) * R * .62, R * .62, R * .42, a, 0, 7); x.fill();
    }
    x.fillStyle = dark; x.globalAlpha = .8;
    x.beginPath(); x.arc(fx, fy, 1.6, 0, 7); x.fill();
  }
  x.globalAlpha = 1;
}

// Камыш с листьями: тонкие стебли, листья — заострённые мазки
function drawReeds(cv, ink) {
  const x = cv.getContext('2d'), W = cv.width, H = cv.height, r = Ink.rng(31);
  x.clearRect(0, 0, W, H);
  x.strokeStyle = x.fillStyle = ink; x.lineCap = 'round';
  const leaf = (px, py, a, len, wid) => {
    const ex = px + Math.cos(a) * len, ey = py + Math.sin(a) * len, nx = -Math.sin(a) * wid, ny = Math.cos(a) * wid;
    x.beginPath(); x.moveTo(px, py);
    x.quadraticCurveTo(px + (ex - px) * .45 + nx, py + (ey - py) * .45 + ny, ex, ey);
    x.quadraticCurveTo(px + (ex - px) * .5 - nx * .5, py + (ey - py) * .5 - ny * .5, px, py);
    x.fill();
  };
  for (let s = 0; s < 6; s++) {
    const x0 = W * (.3 + r() * .62), height = H * (.5 + r() * .46), lean = (r() - .62) * 130;
    x.globalAlpha = .55 + r() * .4;
    let px = x0, py = H;
    for (let i = 1; i <= 14; i++) {
      const t = i / 14, nx = x0 + lean * t * t, ny = H - height * t;
      x.lineWidth = 5.5 * (1 - t * .7);
      x.beginPath(); x.moveTo(px, py); x.lineTo(nx, ny); x.stroke();
      if (i > 4 && r() < .55) leaf(nx, ny, (r() < .5 ? Math.PI : 0) + (r() - .5) * 1.1 - .35, 50 + r() * 80, 7 + r() * 8);
      px = nx; py = ny;
    }
    leaf(px, py, -1.2 + (r() - .5), 60 + r() * 50, 8);
  }
  x.globalAlpha = 1;
}

function drawWorld(v) {
  const night = v['scene.mode'] !== 'light', accent = v['scene.accent'];
  const key = night + accent;
  if (key === drawnFor) return;
  drawnFor = key;
  const wash = night ? '#CFC6C0' : '#2B2220', brown = Ink.mix(wash, '#7A4630', .4);
  drawRidge($('.m.far'), 3, { base: 330, amp: 190, peaks: 7, w: 250, alpha: night ? .16 : .24, color: wash });
  drawRidge($('.m.mid'), 8, { base: 390, amp: 250, peaks: 5, w: 300, alpha: night ? .3 : .5, color: brown });
  drawRidge($('.m.near'), 5, { base: 470, amp: 180, peaks: 6, w: 210, alpha: night ? .5 : .8, color: wash });
  const petal = Ink.mix(accent, '#FF86AC', .42);
  drawBranch($('.branch'), night ? '#51464C' : '#241A18', petal);
  drawReeds($('.reeds:not(.l)'), night ? '#4A4046' : '#3A2A24');
  drawReeds($('.reeds.l'), night ? '#4A4046' : '#3A2A24');
  const st = document.body.style;
  st.setProperty('--petal', petal);
  st.setProperty('--sunDisc', Ink.url(Ink.sun(380, 4, 'disc')));
  st.setProperty('--sunRings', Ink.url(Ink.sun(460, 6, 'rings')));
}

// Лепестки и птицы — обычные элементы с CSS-анимацией, у каждого свой путь и скорость
(() => {
  const r = Ink.rng(77), petals = $('.petals'), birds = $('.birds');
  for (let i = 0; i < 26; i++) {
    const p = document.createElement('i'), t = 9 + r() * 9;
    p.style.cssText = `--x:${Math.round(r() * 1500 - 100)}px;--s:${Math.round(9 + r() * 11)}px;--w:${Math.round(260 + r() * 520)}px;--t:${t.toFixed(1)}s;--d:${(-r() * t).toFixed(1)}s;--o:${(.55 + r() * .4).toFixed(2)}`;
    petals.append(p);
  }
  for (let i = 0; i < 3; i++) {
    const t = 46 + r() * 30;
    birds.insertAdjacentHTML('beforeend', `<svg viewBox="0 0 24 10" style="top:${Math.round(150 + r() * 230)}px;--s:${Math.round(22 + r() * 16)}px;--t:${t.toFixed(0)}s;--d:${(-r() * t).toFixed(0)}s"><path d="M1 8 Q6 0 12 6 Q18 0 23 8"/></svg>`);
  }
})();

function setSchedule(v) {
  const box = $('.schedule');
  box.replaceChildren();
  if (SCENE !== 'end') return;
  const rows = String(v['scene.schedule'] || '').split('\n').map(s => s.trim()).filter(Boolean);
  if (!rows.length) return;
  box.append(Object.assign(document.createElement('h3'), { textContent: v['scene.scheduleTitle'] || '' }));
  for (const line of rows) {
    const [day, ...rest] = line.split(/\s+[—–-]\s+/);
    const r = document.createElement('div');
    r.className = 'r';
    r.append(Object.assign(document.createElement('span'), { textContent: day }), Object.assign(document.createElement('span'), { textContent: rest.join(' — ') }));
    box.append(r);
  }
}

function setMedia(v) {
  const url = v['scene.patternMedia'];
  const img = $('img.bgmedia'), vid = $('video.bgmedia');
  const isVideo = /\.(webm|mp4)$/i.test(url || '');
  img.hidden = !url || isVideo;
  vid.hidden = !url || !isVideo;
  document.body.classList.toggle('own-bg', !!url);
  if (url && !isVideo && img.getAttribute('src') !== url) img.src = url;
  if (url && isVideo && vid.getAttribute('src') !== url) { vid.src = url; vid.play().catch(() => {}); }
}

// Заголовок в две строки, как надпись кистью: знак | задаёт перенос, иначе делим по пробелу ближе к середине
function setTitle(text) {
  const t = $('.title');
  let lines = String(text).split('|').map(s => s.trim()).filter(Boolean);
  if (lines.length === 1 && lines[0].includes(' ')) {
    const s = lines[0];
    let best = -1;
    for (let i = 0; i < s.length; i++) if (s[i] === ' ' && (best < 0 || Math.abs(i - s.length / 2) < Math.abs(best - s.length / 2))) best = i;
    lines = [s.slice(0, best), s.slice(best + 1)];
  }
  t.replaceChildren(...lines.map(l => {
    const row = Object.assign(document.createElement('span'), { className: 'tl' });
    row.append(Object.assign(document.createElement('b'), { textContent: l }));
    return row;
  }));
  t.style.setProperty('--tsize', '176px');
  const w = Math.max(...[...t.children].map(c => c.scrollWidth), 1);
  const max = SCENE === 'end' ? 840 : 1000;   // в «Конце» справа расписание
  if (w > max) t.style.setProperty('--tsize', 176 * max / w + 'px');
}

// Печать: каждое слово — столбец, читаются справа налево, как в японском письме
function setSeal(text) {
  $('.seal').replaceChildren(...String(text || '').split('|').map(s => s.trim()).filter(Boolean).map(word => {
    const col = document.createElement('span');
    col.append(...[...word].map(ch => Object.assign(document.createElement('b'), { textContent: ch })));
    return col;
  }));
}

Overly.onSettings(v => {
  S = v;
  const st = document.body.style, accent = v['scene.accent'];
  st.setProperty('--acc', accent);
  st.setProperty('--ink', B.ink(accent));
  st.setProperty('--font', Overly.font(v['scene.font']));
  st.setProperty('--land', (v['scene.gridStrength'] ?? 80) / 100);
  document.body.classList.toggle('night', v['scene.mode'] !== 'light');
  Overly.css(v['scene.css']);
  $('.label').textContent = v[`scene.${SCENE}Label`] || '';
  $('.note').textContent = SCENE === 'start' ? (v['scene.streamTitle'] || '') : SCENE === 'brb' ? (v['scene.brbNote'] || '') : '';
  setSeal(v[`scene.${SCENE}Words`]);
  setSchedule(v);
  setMedia(v);
  drawWorld(v);
  document.fonts.ready.then(() => setTitle(v[`scene.${SCENE}Title`] || ''));
  tick();
  if (!started) { started = true; document.fonts.ready.then(intro); }
});

// Появление: горы проступают из тумана, солнце ставится печатью, ветка вырастает из угла,
// заголовок прописывается кистью, потом подпись, таймер и печать. В окне настроек играет только при открытии страницы.
function intro() {
  if (S['scene.lens']) {
    document.body.classList.add('play');
    setTimeout(() => B.replay($('.label'), 'wipe-in'), 900);
    setTimeout(() => B.replay($('.note'), 'wipe-in'), 1750);
    setTimeout(() => document.body.classList.remove('play'), 4200);
  }
  $('.all').classList.add('on');
}

function endTime() {
  if (SCENE === 'end') return null;
  const at = SCENE === 'start' ? /^\s*(\d{1,2})[:.](\d{2})\s*$/.exec(S['scene.startAt'] || '') : null;
  if (at) { const d = new Date(); d.setHours(+at[1], +at[2], 0, 0); return d.getTime(); }
  const min = S[`scene.${SCENE}Min`];
  return min > 0 ? openedAt + min * 60000 : null;
}
const mmss = (sec) => {
  const h = Math.floor(sec / 3600), m = Math.floor(sec / 60) % 60, s = sec % 60;
  return (h ? h + ':' + String(m).padStart(2, '0') : String(m).padStart(2, '0')) + ':' + String(s).padStart(2, '0');
};
function tick() {
  if (!S || SCENE === 'end') return;
  const end = endTime();
  const left = end === null ? null : Math.ceil((end - Date.now()) / 1000);
  let text = '';
  if (left !== null) text = left > 0 ? mmss(left) : (S[`scene.${SCENE}Done`] || '');
  if ($('.timer').textContent !== text) $('.timer').textContent = text;
  const full = end === null || left <= 0 ? '' : 'из ' + mmss(Math.round((end - openedAt) / 1000));
  if ($('.total').textContent !== full) $('.total').textContent = full;
}
setInterval(tick, 250);

let eventTimer = 0;
Overly.onEvent(a => {
  if (!S || !S['scene.events'] || !a?.name || !B.NUM[a.type]) return;
  const ev = $('.event');
  ev.querySelector('.kind').textContent = B.fill([S[a.type + '.label'], S[a.type + '.chip']].filter(Boolean).join(' '), B.NUM[a.type](a));
  ev.querySelector('.who').textContent = '';
  ev.classList.remove('wipe-out');
  B.replay(ev, 'wipe-in');
  setTimeout(() => B.letters(ev.querySelector('.who'), a.name), 220);
  clearTimeout(eventTimer);
  eventTimer = setTimeout(() => { ev.classList.remove('wipe-in'); B.replay(ev, 'wipe-out'); }, 7000);
});
