// Общий код сцен Жвачка. Какая сцена — задаёт страница: window.SCENE = 'start' | 'brb' | 'end'.
// Таймер считается с момента открытия страницы — в OBS включите у источника
// «Обновить браузер, когда сцена становится активной», и отсчёт будет начинаться заново при каждом показе.
const SCENE = window.SCENE;
const openedAt = Date.now();
document.body.dataset.scene = SCENE;

const PARTS = {
  start: `<div class="pattern"><div class="art"></div><img class="media" hidden alt=""><video class="media" hidden muted playsinline loop autoplay></video></div>
    <div class="block"></div><i class="sq a"></i>
    <div class="title"></div><div class="timer"></div><div class="total"></div><div class="note"></div>`,
  brb: `<div class="block"></div>
    <div class="pattern"><div class="art"></div><img class="media" hidden alt=""><video class="media" hidden muted playsinline loop autoplay></video></div>
    <div class="title"></div><i class="sq white w"></i><div class="timer"></div><div class="total"></div><div class="note"></div>`,
  end: `<div class="dark"></div><div class="block"></div><i class="sq a"></i>
    <div class="title"></div><div class="schedule"></div>`,
};
document.body.insertAdjacentHTML('beforeend', `<div class="float"></div><div class="label"><i></i><span></span></div>` + PARTS[SCENE] +
  `<div class="event"><i class="esq"></i><div><span class="kind"></span><span class="who"></span></div></div>`);

// Заставка: кольца с разрывами раскручиваются из центра и открывают сцену
document.body.insertAdjacentHTML('beforeend', `<div class="lens"></div>
  <svg class="lens-rings" viewBox="0 0 1920 1080"><g>
    <circle cx="960" cy="540" r="330" stroke="#fff" stroke-width="14" stroke-dasharray="600 110 880 60" />
    <circle cx="960" cy="540" r="430" stroke="var(--acc)" stroke-width="86" stroke-linecap="round" stroke-dasharray="1100 240 780 210" />
    <circle cx="960" cy="540" r="570" stroke="color-mix(in srgb, var(--acc) 60%, #4FA8FF)" stroke-width="54" stroke-linecap="round" stroke-dasharray="960 700" />
  </g></svg>`);
setTimeout(() => { document.querySelector('.lens').classList.add('gone'); document.querySelector('.lens-rings').classList.add('gone'); }, 1400);

const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

// Плавающие квадраты фона: размеры, места и пути — случайные, движение медленное
for (let i = 0; i < 9; i++) {
  const q = document.createElement('i'), size = 40 + Math.random() * 180;
  Object.assign(q.style, { width: size + 'px', height: size + 'px', left: Math.random() * 1800 + 'px', top: Math.random() * 980 + 'px' });
  q.style.setProperty('--dx', (Math.random() * 260 - 130) + 'px');
  q.style.setProperty('--dy', (Math.random() * 200 - 100) + 'px');
  q.style.setProperty('--r', (Math.random() * 180 - 90) + 'deg');
  q.style.setProperty('--t', (22 + Math.random() * 20) + 's');
  q.style.animationDelay = -Math.random() * 20 + 's';
  $('.float').append(q);
}

// Сцена рисуется в 1920×1080; если источник в OBS другого размера — масштабируем целиком по центру
function fitScene() {
  const k = Math.min(innerWidth / 1920, innerHeight / 1080);
  document.body.style.transformOrigin = '0 0';
  document.body.style.transform = `translate(${(innerWidth - 1920 * k) / 2}px, ${(innerHeight - 1080 * k) / 2}px) scale(${k})`;
}
addEventListener('resize', fitScene);
fitScene();

let S = null, shownTitle = null, introDone = false;

function setTitle(text) {
  $('.title').replaceChildren(...String(text).split('|').map(s => {
    const m = document.createElement('span');
    m.className = 'mask';
    m.append(Object.assign(document.createElement('span'), { textContent: s.trim() }));
    return m;
  }));
}
function titleIn() {
  [...$('.title').children].forEach((m, i) => setTimeout(() => B.replay(m.firstChild, 'rise-in'), i * 110));
}

function setPattern(v) {
  const p = $('.pattern');
  if (!p) return;
  p.dataset.p = v['scene.pattern'] || 'rings';
  p.style.setProperty('--pc0', v['scene.patternColor']);
  p.style.setProperty('--ps', (v['scene.patternStrength'] ?? 35) + '%');
  p.style.setProperty('--pb', v['scene.patternBg']);
  const url = v['scene.patternMedia'];
  const img = p.querySelector('img'), vid = p.querySelector('video');
  const isVideo = /\.(webm|mp4)$/i.test(url || '');
  img.hidden = !url || isVideo;
  vid.hidden = !url || !isVideo;
  if (url && !isVideo && img.getAttribute('src') !== url) img.src = url;
  if (url && isVideo && vid.getAttribute('src') !== url) { vid.src = url; vid.play().catch(() => {}); }
}

function setSchedule(v) {
  const box = $('.schedule');
  if (!box) return;
  const rows = String(v['scene.schedule'] || '').split('\n').map(s => s.trim()).filter(Boolean);
  box.replaceChildren();
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

Overly.onSettings(v => {
  S = v;
  const st = document.body.style;
  st.setProperty('--acc', v['scene.accent']);
  st.setProperty('--ink', B.ink(v['scene.accent']));
  st.setProperty('--font', Overly.font(v['scene.font']));
  st.setProperty('--titleSize', v['scene.titleSize'] + 'px');
  B.mode(document.body, v['scene.mode']);
  document.body.classList.toggle('no-float', !v['scene.float']);
  st.setProperty('--fo', (v['scene.floatStrength'] ?? 8) / 100);
  Overly.css(v['scene.css']);
  $('.label span').textContent = v[`scene.${SCENE}Label`] || '';
  showNote();
  setPattern(v);
  setSchedule(v);
  const title = String(v[`scene.${SCENE}Title`] || '');
  if (title !== shownTitle) {
    shownTitle = title;
    setTitle(title);
    if (introDone) titleIn();
  }
  tick();
  if (!introDone) { introDone = true; document.fonts.ready.then(intro); }
});

// Появление: блоки шторками, квадраты кувырком, строки заголовка снизу, расписание построчно
function intro() {
  const lensDelay = 420;
  setTimeout(introCards, lensDelay);
}
function introCards() {
  const p = $('.pattern'), b = $('.block'), d = $('.dark');
  const hide = (el) => el && (el.style.opacity = 0);
  [p, b, d].forEach(hide);
  const show = (el, cls, ms) => el && setTimeout(() => { el.style.opacity = ''; B.replay(el, cls); }, ms);
  show(d, 'wipe-in', 0);
  show(p, 'wipe-down', 120);
  show(b, SCENE === 'start' ? 'wipe-down' : 'wipe-in', 260);
  $$('.sq').forEach((sq, i) => {
    sq.style.opacity = 0;
    setTimeout(() => {
      const r = sq.getBoundingClientRect(), k = r.width / sq.offsetWidth || 1, bk = document.body.getBoundingClientRect();
      B.tumble(document.body, (r.left - bk.left) / k + sq.offsetWidth / 2, (r.top - bk.top) / k + sq.offsetHeight / 2,
        getComputedStyle(sq).backgroundColor, { size: sq.offsetWidth, time: .7 });
      setTimeout(() => { sq.style.opacity = ''; }, 600);
    }, 420 + i * 160);
  });
  setTimeout(() => B.replay($('.label'), 'wipe-in'), 300);
  setTimeout(titleIn, 520);
  setTimeout(() => { if ($('.timer')) B.replay($('.timer'), 'pop-in'); if ($('.total')) B.replay($('.total'), 'wipe-in'); }, 820);
  setTimeout(() => { if ($('.note')) B.replay($('.note'), 'wipe-in'); }, 980);
  $$('.schedule > *').forEach((r, i) => { r.style.opacity = 0; setTimeout(() => { r.style.opacity = ''; B.replay(r, 'wipe-in'); }, 700 + i * 80); });
}

function endTime() {
  if (SCENE === 'end') return null;
  const at = SCENE === 'start' ? /^\s*(\d{1,2})[:.](\d{2})\s*$/.exec(S['scene.startAt'] || '') : null;
  if (at) {
    const d = new Date();
    d.setHours(+at[1], +at[2], 0, 0);
    return d.getTime();
  }
  const min = S[`scene.${SCENE}Min`];
  return min > 0 ? openedAt + min * 60000 : null;
}

const mmss = (sec) => {
  const h = Math.floor(sec / 3600), m = Math.floor(sec / 60) % 60, s = sec % 60;
  return (h ? h + ':' + String(m).padStart(2, '0') : String(m).padStart(2, '0')) + ':' + String(s).padStart(2, '0');
};

function tick() {
  if (!S || SCENE === 'end') return;
  const timer = $('.timer'), total = $('.total');
  const end = endTime();
  const left = end === null ? null : Math.ceil((end - Date.now()) / 1000);
  let text = '';
  if (left !== null) text = left > 0 ? mmss(left) : (S[`scene.${SCENE}Done`] || '');
  if (timer.dataset.text !== text) {
    timer.dataset.text = text;
    timer.replaceChildren();
    if (text) timer.append(Object.assign(document.createElement('span'), { textContent: text }), Object.assign(document.createElement('i'), { className: 'sq' }));
  }
  const full = end === null || left <= 0 ? '' : 'из ' + mmss(Math.round((end - openedAt) / 1000));
  if (total.textContent !== full) total.textContent = full;
}
setInterval(tick, 250);

// Пока висит: изредка крутится один из квадратов
setInterval(() => {
  const list = [...$$('.sq:not(.timer .sq)')];
  if (list.length) B.replay(list[Math.random() * list.length | 0], 'spin-in');
}, 6500);

// Фоллоу/сабки, пока висит сцена: карточка справа внизу
let eventTimer = 0;
Overly.onEvent(a => {
  if (!S || !S['scene.events'] || !a?.name || !B.NUM[a.type]) return;
  const ev = $('.event');
  ev.style.setProperty('--ec', S[a.type + '.color'] || S['scene.accent']);
  ev.querySelector('.kind').textContent = S[a.type + '.label'] || '';
  ev.querySelector('.who').textContent = '';
  ev.classList.remove('wipe-out');
  B.replay(ev, 'wipe-in');
  B.replay(ev.querySelector('.esq'), 'spin-in');
  setTimeout(() => B.letters(ev.querySelector('.who'), a.name), 250);
  clearTimeout(eventTimer);
  eventTimer = setTimeout(() => { ev.classList.remove('wipe-in'); B.replay(ev, 'wipe-out'); }, 7000);
});

// Нижняя строка: название стрима на «Стрим скоро», своя строка на «Перерыве».
// Может выключаться и браться с Twitch (Overly.line), поэтому обновляется и при смене названия
function showNote() {
  const key = SCENE === 'start' ? 'scene.streamTitle' : SCENE === 'brb' ? 'scene.brbNote' : '';
  if ($('.note')) $('.note').textContent = key ? Overly.line(key) : '';
}
Overly.onChannel(showNote);
