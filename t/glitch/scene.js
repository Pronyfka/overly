// Общий код сцен Glitch HUD. Какая сцена — задаёт страница: window.SCENE = 'start' | 'brb' | 'end'.
// Таймер считается с момента открытия страницы — в OBS включите у источника
// «Обновить браузер, когда сцена становится активной», и отсчёт будет начинаться заново при каждом показе.
const SCENE = window.SCENE;
const openedAt = Date.now();
document.body.dataset.scene = SCENE;

document.body.insertAdjacentHTML('beforeend', `
  <img class="bg-media" hidden alt=""><video class="bg-media" hidden muted playsinline loop autoplay></video><div class="bg-dim" hidden></div>
  <div class="grid"></div>
  <i class="blink-sq" style="left:816px;top:144px"></i><i class="blink-sq" style="left:1536px;top:576px"></i>
  <div class="side"></div>
  <div class="hud-frame">
    <i class="f-top"></i><i class="f-left"></i><i class="f-right"></i>
    <i class="f-tick" style="left:372px"></i><i class="f-tick" style="left:1146px"></i>
    <i class="big-node"></i>
    <div class="corner"><i class="hatch h1"></i><i class="hatch h2"></i></div>
    <div class="top-bar"><i class="hatch"></i><b></b><i class="hatch"></i></div>
    <span class="stars">******</span>
  </div>
  <div class="content">
    <span class="plate"></span>
    <div class="title"></div>
    <div class="status"><span class="tag"><i class="hatch"></i><b></b><i class="hatch"></i></span><span class="px line"></span></div>
    <div class="timer"></div>
    <div class="px note"></div>
  </div>
  <div class="socials"></div>
  <div class="meter"><span class="px">*/:×[]</span><i></i><i></i></div>
  <div class="clock"></div>
  <div class="event"><i class="hatch"></i><span class="kind"></span><span class="who"></span><i class="hatch"></i></div>`);

const $ = (s) => document.querySelector(s);

// Сцена рисуется в 1920×1080; если источник в OBS другого размера — масштабируем целиком по центру
function fitScene() {
  const k = Math.min(innerWidth / 1920, innerHeight / 1080);
  document.body.style.transformOrigin = '0 0';
  document.body.style.transform = `translate(${(innerWidth - 1920 * k) / 2}px, ${(innerHeight - 1080 * k) / 2}px) scale(${k})`;
}
addEventListener('resize', fitScene);
fitScene();

let S = null;
let shownTitle = null;
let introDone = false;

// Свой фон: у сцены может быть свой файл, иначе — общий для всех сцен
function setBackground(url) {
  const img = $('img.bg-media'), vid = $('video.bg-media');
  const isVideo = /\.(webm|mp4)$/i.test(url || '');
  img.hidden = !url || isVideo;
  vid.hidden = !url || !isVideo;
  if (url && !isVideo && img.getAttribute('src') !== url) img.src = url;
  if (url && isVideo && vid.getAttribute('src') !== url) { vid.src = url; vid.play().catch(() => {}); }
  $('.bg-dim').hidden = !url;
}

// Заголовок: «СТРИМ|СКОРО» — каждая часть отдельной строкой
function setTitle(text) {
  const box = $('.title');
  box.replaceChildren(...String(text).split('|').map(s => Object.assign(document.createElement('div'), { textContent: s.trim() })));
  fitTitle();
}

// Длинная строка заголовка не должна вылезать за свою колонку (в «Конце» — за цветную панель)
function fitTitle() {
  const box = $('.title');
  box.style.fontSize = '';
  const max = SCENE === 'end' ? 640 : 1240;
  const widest = Math.max(0, ...[...box.children].map(d => d.scrollWidth));
  if (widest > max) box.style.fontSize = parseFloat(getComputedStyle(box).fontSize) * max / widest + 'px';
}
document.fonts.ready.then(fitTitle);

Overly.onSettings(v => {
  S = v;
  const st = document.body.style;
  st.setProperty('--acc', v['scene.accent']);
  st.setProperty('--ink', G.ink(v['scene.accent']));
  st.setProperty('--textColor', v['scene.textColor']);
  st.setProperty('--head', Overly.font(v['scene.headFont']));
  st.setProperty('--pixel', Overly.font(v['scene.pixelFont']));
  st.setProperty('--titleSize', v['scene.titleSize'] + 'px');
  if (shownTitle !== null) fitTitle();
  st.setProperty('--bgDim', (v['scene.bgDim'] ?? 50) / 100);
  st.setProperty('--g', G.GLITCH[v['scene.glitch']] ?? 1);
  document.body.classList.toggle('no-frame', !v['scene.frame']);
  document.body.classList.toggle('no-side', !v['scene.side']);
  document.body.classList.toggle('no-grid', !v['scene.grid']);
  document.body.classList.toggle('no-clock', !v['scene.clock']);
  document.body.classList.toggle('no-glitch', v['scene.glitch'] === 'off');
  document.body.dataset.bg = v['scene.bg'];
  setBackground(v[`scene.${SCENE}Bg`] || v['scene.bgMedia']);
  Overly.css(v['scene.css']);

  $('.plate').textContent = v[`scene.${SCENE}Num`] || '';
  $('.status b').textContent = v[`scene.${SCENE}Tag`] || '';
  $('.status .line').textContent = v[`scene.${SCENE}Line`] || '';
  $('.note').textContent = v[`scene.${SCENE}Note`] || '';
  $('.socials').textContent = v['scene.socials'] || '';
  const title = String(v[`scene.${SCENE}Title`] || '');
  if (title !== shownTitle) {
    shownTitle = title;
    setTitle(title);
    if (introDone) titleIn();
  }
  tick();
  if (!introDone) { introDone = true; document.fonts.ready.then(intro); }
});

// Строки заголовка влетают по очереди со сбоем, по каждой пролетает полоса
function titleIn() {
  [...$('.title').children].forEach((line, i) => setTimeout(() => {
    G.replay(line, 'g-in');
    if (S['scene.glitch'] !== 'off') G.streak(line, '30%', '36%');
  }, i * 150));
}

// Появление сцены: рамка, цветной блок, затем содержимое построчно
function intro() {
  const el = (s) => $(s);
  G.replay(el('.side'), 'wipe');
  ['.f-top', '.f-left', '.f-right'].forEach(s => G.replay(el(s), 'type-in'));
  ['.big-node', '.corner', '.top-bar', '.stars'].forEach((s, i) => setTimeout(() => G.replay(el(s), 'pop-in'), 120 + i * 70));
  const steps = [['.plate', 'pop-in', 250], ['.title', '', 380], ['.status', 'type-in', 760], ['.timer', 'g-in', 900], ['.note', 'type-in', 1020]];
  for (const [s, anim, ms] of steps) setTimeout(() => {
    el(s).classList.add('on');
    if (anim) G.replay(el(s), anim);
    if (s === '.title') titleIn();
  }, ms);
}

// Когда заканчивается отсчёт: «до 19:00» или «N минут с момента показа сцены»
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

function tick() {
  if (!S) return;
  const timer = $('.timer');
  const end = endTime();
  const left = end === null ? null : Math.ceil((end - Date.now()) / 1000);
  if (left === null) {
    timer.textContent = '';
  } else if (left <= 0) {
    if (!timer.classList.contains('done') && introDone) G.replay(timer, 'g-in');
    timer.classList.add('done');
    timer.textContent = S[`scene.${SCENE}Done`] || '';
  } else {
    timer.classList.remove('done');
    const h = Math.floor(left / 3600), m = Math.floor(left / 60) % 60, s = left % 60;
    timer.textContent = (h ? h + ':' + String(m).padStart(2, '0') : String(m).padStart(2, '0')) + ' : ' + String(s).padStart(2, '0');
  }
  // Две полоски справа внизу: сколько времени прошло (без таймера — «дышат»)
  const total = end === null ? 0 : end - openedAt;
  const p = total > 0 ? Math.min(1, (Date.now() - openedAt) / total) : (Math.sin(Date.now() / 900) + 1) / 2;
  const bars = document.querySelectorAll('.meter i');
  bars[0].style.setProperty('--p', Math.round(p * 100) + '%');
  bars[1].style.setProperty('--p', Math.round(Math.min(1, p * 1.6) * 100) + '%');
  const now = new Date();
  $('.clock').textContent = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
}
setInterval(tick, 250);

// Пока висит: изредка сбоит строка заголовка и мигает квадрат сетки
(function idle() {
  setTimeout(() => {
    if (S && S['scene.glitch'] !== 'off') {
      const lines = $('.title').children;
      if (lines.length) G.replay(lines[Math.random() * lines.length | 0], 'g-twitch');
    }
    const sq = document.querySelectorAll('.blink-sq');
    G.replay(sq[Math.random() * sq.length | 0], 'on');
    idle();
  }, 3500 + Math.random() * 4000);
})();

// Фоллоу/сабки, пока висит сцена: внизу метка «САБ  Ник» на несколько секунд
let eventTimer = 0;
Overly.onEvent(a => {
  if (!S || !S['scene.events'] || !a?.name || !G.NUM[a.type]) return;
  const ev = $('.event');
  ev.style.setProperty('--ec', S[a.type + '.color'] || S['scene.accent']);
  const short = S[`ev.${a.type}.label`];
  ev.querySelector('.kind').textContent = short ? G.fill(short, G.NUM[a.type](a)) : (S[a.type + '.label'] || a.type);
  ev.querySelector('.who').textContent = a.name;
  ev.classList.add('on');
  G.replay(ev, 'g-in');
  G.scramble(ev.querySelector('.who'), a.name, 400);
  clearTimeout(eventTimer);
  eventTimer = setTimeout(() => { G.replay(ev, 'g-out'); setTimeout(() => ev.classList.remove('on', 'g-out'), 380); }, 7000);
});
