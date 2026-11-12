// Общий код сцен Lumen. Какая сцена — задаёт страница: window.SCENE = 'start' | 'brb' | 'end'.
// Таймер считается с момента открытия страницы — в OBS включите у источника
// «Обновить браузер, когда сцена становится активной», и отсчёт будет начинаться заново при каждом показе.
const SCENE = window.SCENE;
const openedAt = Date.now();

document.body.insertAdjacentHTML('beforeend', `
  <img class="bg-media" hidden alt=""><video class="bg-media" hidden muted playsinline loop autoplay></video><div class="bg-dim" hidden></div>
  <div class="aura"><i></i><i></i></div>
  <div class="main card">
    <div class="bg"><i class="glow"></i><i class="seam"></i><i class="shine"></i></div>
    <div class="kicker" data-s style="--d:0"><i class="dot pulse"></i><span></span></div>
    <div class="title" data-s style="--d:1"></div>
    <div class="timer" data-s style="--d:2"></div>
    <div class="bar" data-s style="--d:3"><span class="fill"></span></div>
    <div class="line" data-s style="--d:4"></div>
  </div>
  <div class="bottom">
    <span class="socials"></span>
    <div class="event card">
      <div class="bg"><i class="glow"></i></div>
      <i class="dot" data-s style="--d:0"></i><span class="kind" data-s style="--d:0"></span><span class="who" data-s style="--d:1"></span>
    </div>
    <span class="clock"></span>
  </div>`);

const $ = (s) => document.querySelector(s);
const main = $('.main'), ev = $('.event');

// Сцена рисуется в 1920×1080; если источник в OBS другого размера — масштабируем целиком по центру
function fitScene() {
  const k = Math.min(innerWidth / 1920, innerHeight / 1080);
  document.body.style.transformOrigin = '0 0';
  document.body.style.transform = `translate(${(innerWidth - 1920 * k) / 2}px, ${(innerHeight - 1080 * k) / 2}px) scale(${k})`;
}
addEventListener('resize', fitScene);
fitScene();

let S = null;
let opened = false;

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

Overly.onSettings(v => {
  S = v;
  const st = document.body.style;
  st.setProperty('--acc', v['scene.accent']);
  st.setProperty('--text', v['scene.textColor']);
  st.setProperty('--font', Overly.font(v['scene.font']));
  st.setProperty('--titleSize', v['scene.titleSize'] + 'px');
  st.setProperty('--surf', Lumen.rgba(v['scene.surface'], v['scene.surfaceOpacity']));
  st.setProperty('--bgDim', (v['scene.bgDim'] ?? 50) / 100);
  document.body.classList.toggle('no-glow', !v['scene.glow']);
  document.body.classList.toggle('no-bar', !v['scene.bar']);
  document.body.classList.toggle('no-clock', !v['scene.clock']);
  document.body.dataset.bg = v['scene.bg'];
  setBackground(v[`scene.${SCENE}Bg`] || v['scene.bgMedia']);
  Overly.css(v['scene.css']);
  $('.kicker span').textContent = v[`scene.${SCENE}Kicker`] || '';
  $('.title').textContent = v[`scene.${SCENE}Title`] || '';
  $('.line').textContent = v[`scene.${SCENE}Line`] || '';
  showSocials();
  tick();
  if (!opened) {
    opened = true;
    document.fonts.ready.then(() => { Lumen.open(main, 'line'); setTimeout(() => Lumen.shine(main), 1300); });
  }
});

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

let shownLeft = null;
function tick() {
  if (!S) return;
  const timer = $('.timer');
  const end = endTime();
  const left = end === null ? null : Math.ceil((end - Date.now()) / 1000);
  if (left === null) {
    timer.textContent = '';
  } else if (left <= 0) {
    if (!timer.classList.contains('done')) Lumen.pop(timer);
    timer.classList.add('done');
    timer.textContent = S[`scene.${SCENE}Done`] || '';
  } else {
    timer.classList.remove('done');
    const h = Math.floor(left / 3600), m = Math.floor(left / 60) % 60, s = left % 60;
    timer.textContent = (h ? h + ':' + String(m).padStart(2, '0') : String(m).padStart(2, '0')) + ':' + String(s).padStart(2, '0');
  }
  // Шкала — сколько времени уже прошло; без таймера — бегущий отрезок
  const bar = $('.bar');
  const total = end === null ? 0 : end - openedAt;
  bar.classList.toggle('idle', !(total > 0));
  bar.querySelector('.fill').style.transform = total > 0 ? `scaleX(${Math.min(1, (Date.now() - openedAt) / total)})` : '';
  // Последние 10 секунд — каждая секунда «пружинит»
  if (left !== shownLeft && left > 0 && left <= 10) Lumen.pop(timer);
  shownLeft = left;
  const now = new Date();
  $('.clock').textContent = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
}
setInterval(tick, 250);

// Изредка по карточке пробегает блик
setInterval(() => { if (main.classList.contains('p-on')) Lumen.shine(main); }, 9000);

// Фоллоу/сабки, пока висит сцена: внизу раскрывается карточка «ФОЛЛОВ  ник»
let eventTimer = 0;
function showEvent(kind, who, color) {
  ev.style.setProperty('--acc', color);
  ev.querySelector('.kind').textContent = kind;
  ev.querySelector('.who').textContent = who;
  Lumen.open(ev, 'line');
}
Overly.onEvent(a => {
  if (!S || !S['scene.events'] || !a?.name) return;
  showEvent(S[a.type + '.label'] || a.type, a.name, S[a.type + '.color'] || S['scene.accent']);
  clearTimeout(eventTimer);
  eventTimer = setTimeout(() => Lumen.close(ev), 7000);
});

// Нижняя строка: может выключаться и браться с Twitch (Overly.line), поэтому обновляется и при смене названия
function showSocials() { $('.socials').textContent = Overly.line('scene.socials'); }
Overly.onChannel(showSocials);
