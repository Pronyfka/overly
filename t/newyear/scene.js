// Общий код сцен «Новогодней ночи». Какая сцена — задаёт страница: window.SCENE = 'start' | 'brb' | 'end'.
// Таймер считается с момента открытия страницы — в OBS включите у источника
// «Обновить браузер, когда сцена становится активной», и отсчёт будет начинаться заново при каждом показе.
// Окна в домиках: одно окно — один зритель (или N, по настройке). На «Конце стрима» городок засыпает — окна гаснут.
const SCENE = window.SCENE;
const openedAt = Date.now();

document.body.insertAdjacentHTML('beforeend', `
  <div class="sky"></div>
  <img class="bg-media" hidden alt=""><video class="bg-media" hidden muted playsinline loop autoplay></video><div class="bg-dim" hidden></div>
  <div class="stars"></div><div class="moon"></div><div class="shoot"></div>
  <svg class="garland top-garland" width="1920" height="220" viewBox="0 0 1920 220" style="left:0;top:0"><path class="wire"/></svg>
  <svg class="hills" viewBox="0 0 1920 360">
    <defs><linearGradient id="h1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C9D6EE"/><stop offset="1" stop-color="#9FB2D6"/></linearGradient>
      <linearGradient id="h2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F4F8FF"/><stop offset="1" stop-color="#DBE5F6"/></linearGradient></defs>
    <path id="hillBack" d="M0 360V170C210 120 380 150 560 190S940 120 1160 150 1560 110 1920 160V360Z" fill="url(#h1)" opacity=".55"/>
    <g id="housesBack" opacity=".8"></g>
    <path id="hillFront" d="M0 360V250C260 200 520 240 760 255S1180 215 1420 230 1760 260 1920 240V360Z" fill="url(#h2)"/>
    <g fill="#0F1830" opacity=".9">
      <path d="M330 250l-26 0 26-62 26 62z M330 222l-20 0 20-48 20 48z M326 250h8v14h-8z"/>
      <path d="M410 258l-20 0 20-48 20 48z M410 236l-15 0 15-36 15 36z M407 258h6v10h-6z"/>
      <path d="M1580 236l-30 0 30-72 30 72z M1580 204l-23 0 23-56 23 56z M1576 236h8v16h-8z"/>
    </g>
    <g id="housesFront"></g>
  </svg>
  <canvas class="snow" width="1920" height="1080"></canvas>
  <div class="main">
    <div class="kick" style="--d:0ms"></div>
    <div class="title" style="--d:80ms"></div>
    <div class="timer" style="--d:240ms"></div>
    <div class="wait" style="--d:360ms"></div>
    <div class="line" style="--d:420ms"></div>
  </div>
  <div class="event"><span class="dot"></span><span class="kind"></span><span class="nick"></span></div>
  <div class="bottom"><span class="socials"></span><span class="clock"></span></div>`);

const $ = (s) => document.querySelector(s);

// Сцена рисуется в 1920×1080; если источник другого размера — масштабируем целиком по центру
function fitScene() {
  const k = Math.min(innerWidth / 1920, innerHeight / 1080);
  document.body.style.transformOrigin = '0 0';
  document.body.style.transform = `translate(${(innerWidth - 1920 * k) / 2}px, ${(innerHeight - 1080 * k) / 2}px) scale(${k})`;
}
addEventListener('resize', fitScene);
fitScene();

// ---------- Звёзды, гирлянда, снег ----------
$('.stars').innerHTML = Array.from({ length: 70 }, () => {
  const big = Math.random() < .2;
  return `<i style="left:${NY.rnd(0, 1920).toFixed(0)}px;top:${NY.rnd(150, 640).toFixed(0)}px;animation-delay:${NY.rnd(0, 3.4).toFixed(2)}s;opacity:${NY.rnd(.2, .7).toFixed(2)}${big ? ';width:4px;height:4px' : ''}"></i>`;
}).join('');
const topWire = $('.top-garland .wire');
topWire.setAttribute('d', NY.sag(-20, 1940, 20, 70, 3));
const TOP = NY.garland($('.top-garland'), topWire, { count: 33, chase: true });
TOP.lit(33);
const snow = new NY.Snow($('canvas.snow'), { per: .9 });

// ---------- Домики ----------
const HOUSES = [
  { hill: 'Front', x: 165, s: 1.15, cols: 3, rows: 1, door: true },
  { hill: 'Front', x: 545, s: .95, cols: 2, rows: 2 },
  { hill: 'Front', x: 1290, s: 1.05, cols: 2, rows: 1, door: true },
  { hill: 'Front', x: 1440, s: .82, cols: 2, rows: 1 },
  { hill: 'Front', x: 1745, s: 1.2, cols: 3, rows: 2 },
  { hill: 'Back', x: 860, s: .55, cols: 2, rows: 1 },
  { hill: 'Back', x: 1015, s: .62, cols: 3, rows: 1 },
  { hill: 'Back', x: 1170, s: .5, cols: 2, rows: 1 },
];
function hillY(path, x) {
  const len = path.getTotalLength();
  let lo = 0, hi = len;
  for (let i = 0; i < 30; i++) { const mid = (lo + hi) / 2; if (path.getPointAtLength(mid).x < x) lo = mid; else hi = mid; }
  return path.getPointAtLength(lo).y;
}
const WINDOWS = [];
for (const h of HOUSES) {
  const y = hillY($('#hill' + h.hill), h.x) + 6;
  const bodyH = h.rows === 2 ? 76 : 58, roofY = -bodyH;
  const g = NY.el('g', { class: 'house', transform: `translate(${h.x} ${y.toFixed(1)}) scale(${h.s})` });
  g.innerHTML = `
    <g class="smoke" transform="translate(28 ${roofY - 44})"><circle r="7"/><circle r="7"/><circle r="7"/></g>
    <rect class="roof" x="21" y="${roofY - 40}" width="14" height="26"/>
    <rect class="snowy" x="19" y="${roofY - 44}" width="18" height="6" rx="3"/>
    <rect class="wall" x="-46" y="${roofY}" width="92" height="${bodyH}"/>
    <path class="roof" d="M-58 ${roofY + 2} L0 ${roofY - 44} L58 ${roofY + 2}Z"/>
    <path class="snowy" d="M-61 ${roofY + 3} L0 ${roofY - 48} L61 ${roofY + 3} L53 ${roofY + 6} Q46 ${roofY + 1} 40 ${roofY + 5} L0 ${roofY - 37} L-36 ${roofY - 6} Q-44 ${roofY + 4} -52 ${roofY + 7}Z"/>
    ${h.door ? `<rect class="door" x="-9" y="-30" width="18" height="30" rx="3"/>` : ''}
    ${h.hill === 'Front' ? '<ellipse class="snowy" cx="0" cy="2" rx="66" ry="7"/>' : ''}`;
  const xs = h.door ? (h.cols === 3 ? [-30, 30, 0] : [-28, 28]) : Array.from({ length: h.cols }, (_, i) => (i - (h.cols - 1) / 2) * 28);
  for (let r = 0; r < h.rows; r++) for (let c = 0; c < h.cols; c++) {
    const wy = h.door && h.cols === 3 && c === 2 ? roofY + 4 : roofY + 12 + r * 32;
    const w = NY.el('g', { class: 'win', transform: `translate(${xs[c]} ${wy})` });
    w.innerHTML = `<rect class="glow" x="-14" y="-8" width="28" height="36" rx="8"/><rect class="glow" x="-10" y="-4" width="20" height="28" rx="6"/>
      <rect class="pane" x="-8" y="0" width="16" height="20" rx="2"/><rect class="lit" x="-8" y="0" width="16" height="20" rx="2"/><path class="bars" d="M0 0V20M-8 10H8"/>`;
    g.appendChild(w);
    WINDOWS.push({ el: w, house: g });
  }
  $('#houses' + h.hill).appendChild(g);
}
// Порядок, в котором загорается свет: вперемешку, но один и тот же на всё время показа
const ORDER = WINDOWS.map((_, i) => i).sort(() => Math.random() - .5);
const plural = (n, a, b, c) => { const m = n % 100, k = n % 10; return m > 10 && m < 20 ? c : k === 1 ? a : k > 1 && k < 5 ? b : c; };

let S = null, viewers = null, sleepAt = null;
function litWindows(n) {
  ORDER.forEach((wi, i) => {
    const w = WINDOWS[wi].el, want = i < n;
    if (want !== w.classList.contains('on')) setTimeout(() => w.classList.toggle('on', want), want ? NY.rnd(0, 600) : NY.rnd(0, 300));
  });
  setTimeout(() => document.querySelectorAll('.house').forEach(h => h.classList.toggle('alive', !!h.querySelector('.win.on'))), 700);
}
function renderWindows() {
  if (!S) return;
  const per = Math.max(1, Number(S['scene.perWindow']) || 1);
  // Без данных с Twitch: в превью редактора — для примера 7 зрителей, иначе часть окон просто горит
  const known = typeof viewers === 'number' && viewers > 0;
  const shown = known ? viewers : Overly.preview ? 7 : null;
  let n;
  if (SCENE === 'end') n = sleepAt === null ? WINDOWS.length : Math.max(0, WINDOWS.length - Math.floor((Date.now() - sleepAt) / 4000));
  else if (!S['scene.viewerWindows']) n = Math.round(WINDOWS.length * .45);
  else n = shown === null ? 0 : Math.min(WINDOWS.length, Math.ceil(shown / per));
  litWindows(n);
  const wait = $('.wait');
  if (SCENE === 'end' || !S['scene.viewerWindows']) wait.textContent = '';
  else if (shown) wait.innerHTML = `${S[`scene.waitText`] || 'Уже ждут'} <b>${shown}</b> ${plural(shown, 'зритель', 'зрителя', 'зрителей')}`;
  else wait.textContent = S['scene.waitEmpty'] || '';
}
Overly.onChannel(c => {
  viewers = typeof c.viewers === 'number' ? c.viewers : viewers;
  renderWindows();
  showSocials();
});
// Конец стрима: городок засыпает — каждые 4 секунды гаснет одно окно
if (SCENE === 'end') { sleepAt = Date.now() + 3000; setInterval(renderWindows, 1000); }

// ---------- Настройки ----------
function setBackground(url) {
  const img = $('img.bg-media'), vid = $('video.bg-media');
  const isVideo = /\.(webm|mp4)$/i.test(url || '');
  img.hidden = !url || isVideo; vid.hidden = !url || !isVideo;
  if (url && !isVideo && img.getAttribute('src') !== url) img.src = url;
  if (url && isVideo && vid.getAttribute('src') !== url) { vid.src = url; vid.play().catch(() => {}); }
  $('.bg-dim').hidden = !url;
}

let shownLeft = null;
Overly.onSettings(v => {
  S = v;
  const st = document.body.style;
  st.setProperty('--acc', v['scene.accent']);
  st.setProperty('--text', v['scene.textColor']);
  st.setProperty('--font', Overly.font(v['scene.font']));
  st.setProperty('--titleSize', v['scene.titleSize'] + 'px');
  st.setProperty('--bgDim', (v['scene.bgDim'] ?? 50) / 100);
  st.setProperty('--win', v['scene.windowColor']);
  for (const [cls, key] of [['no-moon', 'scene.moon'], ['no-stars', 'scene.stars'], ['no-garland', 'scene.garland'], ['no-hills', 'scene.hills'], ['no-clock', 'scene.clock']])
    document.body.classList.toggle(cls, !v[key]);
  document.body.dataset.bg = v['scene.bg'];
  setBackground(v[`scene.${SCENE}Bg`] || v['scene.bgMedia']);
  TOP.paint(NY.lights(v), v.twinkle);
  snow.set(v.snow);
  Overly.css(v['scene.css']);
  $('.kick').textContent = v[`scene.${SCENE}Kicker`] || '';
  const title = v[`scene.${SCENE}Title`] || '';
  if ($('.title').getAttribute('aria-label') !== title) NY.letters($('.title'), title);
  $('.line').textContent = v[`scene.${SCENE}Line`] || '';
  showSocials();
  renderWindows();
  tick();
  document.fonts.ready.then(() => requestAnimationFrame(() => document.body.classList.add('ready')));
});

// ---------- Таймер ----------
function endTime() {
  if (SCENE === 'end') return null;
  const at = SCENE === 'start' ? /^\s*(\d{1,2})[:.](\d{2})\s*$/.exec(S['scene.startAt'] || '') : null;
  if (at) { const d = new Date(); d.setHours(+at[1], +at[2], 0, 0); return d.getTime(); }
  const min = S[`scene.${SCENE}Min`];
  return min > 0 ? openedAt + min * 60000 : null;
}
// Цифры, которые поменялись, выкатываются; двоеточие мигает
function setDigits(text) {
  const t = $('.timer');
  if (t.classList.contains('done')) { t.classList.remove('done'); t.textContent = ''; }
  const want = [...text];
  if (t.children.length !== want.length || [...t.children].some((c, i) => (want[i] === ':') !== c.classList.contains('sep'))) {
    t.innerHTML = want.map(ch => ch === ':' ? '<span class="sep">:</span>' : '<span></span>').join('');
  }
  [...t.children].forEach((c, i) => {
    if (c.classList.contains('sep') || c.textContent === want[i]) return;
    c.textContent = want[i]; c.classList.remove('roll'); void c.offsetWidth; c.classList.add('roll');
  });
}
function tick() {
  if (!S) return;
  const t = $('.timer');
  const end = endTime();
  const left = end === null ? null : Math.ceil((end - Date.now()) / 1000);
  if (left === null) { t.textContent = ''; t.classList.remove('done'); }
  else if (left <= 0) {
    if (!t.classList.contains('done')) { t.classList.add('done'); t.textContent = S[`scene.${SCENE}Done`] || ''; t.classList.remove('pulse'); void t.offsetWidth; t.classList.add('pulse'); }
  } else {
    const h = Math.floor(left / 3600), m = Math.floor(left / 60) % 60, s = left % 60;
    setDigits((h ? h + ':' + String(m).padStart(2, '0') : String(m).padStart(2, '0')) + ':' + String(s).padStart(2, '0'));
    if (left !== shownLeft && left <= 10) { t.classList.remove('pulse'); void t.offsetWidth; t.classList.add('pulse'); }
  }
  shownLeft = left;
  const now = new Date();
  $('.clock').textContent = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
}
setInterval(tick, 250);

// ---------- Событие во время сцены: подвешенная плашка с огоньком ----------
const ev = $('.event');
let evTimer = 0;
Overly.onEvent(a => {
  if (!S || !S['scene.events'] || !a?.name) return;
  ev.style.setProperty('--evc', S[a.type + '.color'] || S['scene.accent']);
  ev.querySelector('.kind').textContent = S[a.type + '.label'] || a.type;
  ev.querySelector('.nick').textContent = a.name;
  ev.classList.remove('lit', 'gone'); void ev.offsetWidth; ev.classList.add('lit');
  clearTimeout(evTimer);
  evTimer = setTimeout(() => { ev.classList.remove('lit'); ev.classList.add('gone'); }, 6500);
});

// ---------- Падающая звезда раз в 8–14 секунд ----------
function shoot() {
  if (S && S['scene.stars'] && document.body.dataset.bg !== 'none') {
    const el = $('.shoot'), x = NY.rnd(300, 1300), y = NY.rnd(170, 360);
    el.style.left = x + 'px'; el.style.top = y + 'px';
    el.animate([{ opacity: 0, translate: '0 0' }, { opacity: 1, translate: '120px 54px', offset: .3 }, { opacity: 0, translate: '420px 188px' }], { duration: 1100, easing: 'ease-out' });
  }
  setTimeout(shoot, 8000 + Math.random() * 6000);
}
setTimeout(shoot, 4000);

// Нижняя строка: может выключаться и браться с Twitch (Overly.line)
function showSocials() { $('.socials').textContent = Overly.line('scene.socials'); }
