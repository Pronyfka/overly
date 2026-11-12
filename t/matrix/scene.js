// Общий код сцен «Матрицы». Какая сцена — задаёт страница: window.SCENE = 'start' | 'brb' | 'end'.
// Таймер считается с момента открытия страницы — в OBS включите «Обновить браузер, когда сцена становится активной».
const SCENE = window.SCENE;
const openedAt = Date.now();
document.body.dataset.scene = SCENE;
document.body.insertAdjacentHTML('beforeend', `
  <div class="all">
    <div class="panel"><canvas class="grid" width="1130" height="740"></canvas><img class="media" hidden alt=""><video class="media" hidden muted playsinline loop autoplay></video></div>
    <canvas class="globe" width="560" height="560"></canvas>
    <div class="bar"></div><div class="vert a"></div><div class="vert b"></div>
    <div class="side"><div class="label"></div><div class="timer"></div><div class="total"></div><div class="note"></div><div class="schedule"></div></div>
    <div class="titleBox"><div class="title"></div></div>
    <div class="event"><div><span class="kind"></span><span class="who"></span></div></div>
  </div>
  <div class="iris"><canvas class="igrid" width="1920" height="1080"></canvas><div class="ring"></div><canvas class="iglobe" width="300" height="300"></canvas></div>`);

const $ = (s) => document.querySelector(s);
let S = null, started = false, accent = '#E6004C', words = [], wordAt = 0;

function fitScene() {
  const k = Math.min(innerWidth / 1920, innerHeight / 1080);
  document.body.style.transformOrigin = '0 0';
  document.body.style.transform = `translate(${(innerWidth - 1920 * k) / 2}px, ${(innerHeight - 1080 * k) / 2}px) scale(${k})`;
}
addEventListener('resize', fitScene);
fitScene();

// Сетка с выпуклостью, как в линзе: чем дальше от центра, тем сильнее изгиб
function drawGrid(canvas, color, { cells = 22, warp = .32, width = 2, alpha = 1 } = {}) {
  const c = canvas.getContext('2d'), W = canvas.width, H = canvas.height;
  c.clearRect(0, 0, W, H);
  c.strokeStyle = color; c.globalAlpha = alpha; c.lineWidth = width;
  const rows = Math.round(cells * H / W);
  const px = (x, y) => {
    const r2 = x * x + y * y * .8, k = 1 - warp + warp * r2 * .5 + warp * .35;
    return [W / 2 + x * k * W / 2, H / 2 + y * k * H / 2];
  };
  const line = (fn) => { c.beginPath(); for (let i = 0; i <= 44; i++) { const [x, y] = fn(i / 22 - 1); i ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); };
  for (let i = -cells; i <= cells; i += 2) { const gx = i / cells * 1.55; line((t) => px(gx, t * 1.55)); }
  for (let i = -rows; i <= rows; i += 2) { const gy = i / rows * 1.55; line((t) => px(t * 1.55, gy)); }
}

// Каркасный глобус: толстые белые меридианы и параллели, задняя сторона еле видна
function drawGlobe(canvas, rot, ink) {
  const c = canvas.getContext('2d'), W = canvas.width, R = W / 2 - 8;
  c.clearRect(0, 0, W, W);
  c.fillStyle = '#07080B';
  c.beginPath(); c.arc(W / 2, W / 2, R, 0, 7); c.fill();
  c.lineCap = 'round';
  const tiltX = -.34, tiltZ = .36;
  const project = (lat, lon) => {
    let x = Math.cos(lat) * Math.sin(lon + rot), y = Math.sin(lat), z = Math.cos(lat) * Math.cos(lon + rot);
    let y2 = y * Math.cos(tiltX) - z * Math.sin(tiltX), z2 = y * Math.sin(tiltX) + z * Math.cos(tiltX);
    const x3 = x * Math.cos(tiltZ) - y2 * Math.sin(tiltZ), y3 = x * Math.sin(tiltZ) + y2 * Math.cos(tiltZ);
    return [W / 2 + x3 * R, W / 2 - y3 * R, z2];
  };
  const path = (pts) => {
    for (const front of [false, true]) {
      c.lineWidth = front ? R * .045 : R * .015;
      c.strokeStyle = ink; c.globalAlpha = front ? 1 : .22;
      c.beginPath(); let on = false;
      for (const [x, y, z] of pts) { if ((z >= 0) === front) { on ? c.lineTo(x, y) : c.moveTo(x, y); on = true; } else on = false; }
      c.stroke();
    }
    c.globalAlpha = 1;
  };
  for (let m = 0; m < 4; m++) { const lon = m * Math.PI / 4; const pts = []; for (let i = 0; i <= 96; i++) pts.push(project(i / 96 * Math.PI * 2, lon)); path(pts); }
  for (const lat of [-.75, -.32, .32, .75]) { const pts = []; for (let i = 0; i <= 96; i++) pts.push(project(lat, i / 96 * Math.PI * 2)); path(pts); }
  c.lineWidth = R * .03; c.strokeStyle = ink;
  c.beginPath(); c.arc(W / 2, W / 2, R, 0, 7); c.stroke();
}

function redrawGrid() {
  drawGrid($('.grid'), accent, { alpha: S ? (S['scene.gridStrength'] ?? 80) / 100 : .8 });
  drawGrid($('.igrid'), accent, { cells: 26, warp: .46, width: 4 });
}

// Сетка иногда коротко вспыхивает
setInterval(() => {
  if (!S) return;
  const g = $('.grid');
  g.style.opacity = 1.0;
  [[0, 1.8], [70, .7], [130, 1.5], [230, 1]].forEach(([t, b]) => setTimeout(() => { g.style.filter = `brightness(${b})`; }, t));
}, 5200);

let t0 = performance.now();
function frame(now) {
  const rot = (now - t0) / 1000 * .5;
  if (S) {
    if (!S['scene.patternMedia']) drawGlobe($('.globe'), rot, '#fff');
    if (!$('.iris').classList.contains('gone')) drawGlobe($('.iglobe'), rot, '#fff');
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// Вертикальные слова: большое сплошное и рядом следующее контуром, меняются быстрым миганием
function stack(el, word, height) {
  const letters = [...word];
  el.style.setProperty(el.classList.contains('a') ? '--va' : '--vb', Math.min(el.classList.contains('a') ? 170 : 62, height / letters.length * .92) + 'px');
  el.replaceChildren(...letters.map(ch => Object.assign(document.createElement('span'), { textContent: ch })));
}
function showWords() {
  if (!words.length) return;
  stack($('.vert.a'), words[wordAt % words.length], 740);
  stack($('.vert.b'), words[(wordAt + 1) % words.length], 740);
}
setInterval(() => {
  if (words.length < 2) return;
  wordAt++;
  for (const v of [$('.vert.a'), $('.vert.b')]) B.replay(v, 'swap');
  setTimeout(showWords, 150);
}, 4200);

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
  const p = $('.panel'), url = v['scene.patternMedia'];
  const img = p.querySelector('img'), vid = p.querySelector('video');
  const isVideo = /\.(webm|mp4)$/i.test(url || '');
  img.hidden = !url || isVideo;
  vid.hidden = !url || !isVideo;
  $('.globe').style.display = url ? 'none' : '';
  if (url && !isVideo && img.getAttribute('src') !== url) img.src = url;
  if (url && isVideo && vid.getAttribute('src') !== url) { vid.src = url; vid.play().catch(() => {}); }
}

// Заголовок в одну строку на всю ширину
function setTitle(text) {
  const t = $('.title');
  t.textContent = String(text).replace(/\|/g, ' ');
  t.style.setProperty('--tsize', '170px');
  const w = t.scrollWidth;
  if (w > 1780) t.style.setProperty('--tsize', 170 * 1780 / w + 'px');
}
function titleIn() {
  const t = $('.title');
  t.className = 'title up';
  setTimeout(() => { t.className = 'title ghost'; }, 300);
  setTimeout(() => { t.className = 'title solid'; }, 370);
  setTimeout(() => { t.className = 'title ghost'; }, 430);
  setTimeout(() => { t.className = 'title solid'; }, 490);
}

Overly.onSettings(v => {
  S = v;
  const st = document.body.style;
  accent = v['scene.accent'];
  st.setProperty('--acc', accent);
  st.setProperty('--ink', B.ink(accent));
  st.setProperty('--font', Overly.font(v['scene.font']));
  document.body.classList.toggle('light', v['scene.mode'] === 'light');
  document.body.classList.toggle('no-lens', !v['scene.lens']);
  Overly.css(v['scene.css']);
  $('.label').textContent = v[`scene.${SCENE}Label`] || '';
  showNote();
  words = String(v[`scene.${SCENE}Words`] || '').split('|').map(s => s.trim()).filter(Boolean);
  wordAt = 0; showWords();
  setSchedule(v);
  setMedia(v);
  redrawGrid();
  document.fonts.ready.then(() => {
    setTitle(v[`scene.${SCENE}Title`] || '');
    if (started) $('.title').className = 'title solid';
  });
  tick();
  if (!started) { started = true; document.fonts.ready.then(intro); }
});

// Появление: линза раскрывает сцену, она проявляется ступенями, потом поднимается заголовок.
// В окне настроек линза не мешает править: она проигрывается только при открытии страницы.
function intro() {
  const iris = $('.iris'), lens = S['scene.lens'];
  $('.all').classList.add('on');
  if (lens) iris.classList.add('open');
  setTimeout(() => iris.classList.add('gone'), 1300);
  setTimeout(titleIn, lens ? 1050 : 300);
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
  ev.querySelector('.kind').textContent = S[a.type + '.label'] || '';
  ev.querySelector('.who').textContent = '';
  ev.classList.remove('pop-out');
  B.replay(ev, 'wipe-in');
  setTimeout(() => B.letters(ev.querySelector('.who'), a.name), 180);
  clearTimeout(eventTimer);
  eventTimer = setTimeout(() => { ev.classList.remove('wipe-in'); B.replay(ev, 'pop-out'); }, 7000);
});

// Нижняя строка: название стрима на «Стрим скоро», своя строка на «Перерыве».
// Может выключаться и браться с Twitch (Overly.line), поэтому обновляется и при смене названия
function showNote() {
  const key = SCENE === 'start' ? 'scene.streamTitle' : SCENE === 'brb' ? 'scene.brbNote' : '';
  if ($('.note')) $('.note').textContent = key ? Overly.line(key) : '';
}
Overly.onChannel(showNote);
