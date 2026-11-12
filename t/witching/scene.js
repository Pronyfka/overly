// Общий код сцен «Ведьмин час». Какая сцена — задаёт страница: window.SCENE = 'start' | 'brb' | 'end'.
// Таймер считается с момента открытия страницы — в OBS включите у источника
// «Обновить браузер, когда сцена становится активной», и отсчёт будет начинаться заново при каждом показе.
const SCENE = window.SCENE;
const openedAt = Date.now();
// Силуэт ведьмы на метле — пролетает на фоне луны
const WITCH = '<svg viewBox="0 -20 200 110"><g fill="#120818"><path d="M8 72L150 56" stroke="#120818" stroke-width="5" stroke-linecap="round"/>' +
  '<path d="M146 50l50-12-6 18 8 14-50-6z"/><path d="M72 66c-6-20 4-36 16-38 12 2 16 16 12 34z"/><path d="M78 36C60 40 46 52 30 52c14 6 30 8 44 12z"/>' +
  '<circle cx="90" cy="22" r="8"/><path d="M74 18l34-3-12-4L64-12l22 22z"/><path d="M86 62l-6 14 8 2 6-14z"/></g></svg>';
const MIST = '<div class="mist"><div class="fog"><i></i><i></i><i></i><i></i><i></i><i></i></div><div class="sparks"></div><div class="core"></div></div>';

document.body.insertAdjacentHTML('beforeend', `
  <img class="bg-media" hidden alt=""><video class="bg-media" hidden muted playsinline loop autoplay></video><div class="bg-dim" hidden></div>
  <div class="sky"><div class="stars"></div><div class="moon"></div><div class="witch">${WITCH}</div>
    <div class="bats"><i>${Witch.char('bat')}</i><i>${Witch.char('bat')}</i><i>${Witch.char('bat')}</i></div></div>
  <div class="flash"></div>
  <div class="spider">${Witch.char('spider')}</div>
  <div class="flies">${Array.from({ length: 16 }, () => `<i style="left:${(Math.random() * 100).toFixed(1)}%;top:${(45 + Math.random() * 45).toFixed(1)}%;animation-delay:${(-Math.random() * 7).toFixed(2)}s;animation-duration:${(5 + Math.random() * 4).toFixed(2)}s"></i>`).join('')}</div>
  <div class="ground"><span class="peek"></span><span class="peek"></span><span class="peek"></span><span class="peek"></span>
    <div class="haze"><i></i><i></i><i></i><i></i></div></div>
  <div class="main lit">
    <div class="kind" style="--d:0ms"></div>
    <div class="title" style="--d:120ms"></div>
    <div class="timer" style="--d:240ms"></div>
    <div style="--d:300ms">${MIST}</div>
    <div class="line" style="--d:420ms"></div>
  </div>
  <div class="bottom">
    <span class="socials"></span>
    <div class="event"><span class="kind"></span>${MIST}<span class="nick"></span></div>
    <span class="clock"></span>
  </div>`);

const $ = (s) => document.querySelector(s);
document.querySelectorAll('.sparks').forEach(sp => {
  sp.innerHTML = Array.from({ length: 14 }, (_, i) =>
    `<i style="left:${6 + i * 6.5 + Math.random() * 4}%;--dl:${(Math.random() * 2.2).toFixed(2)}s;--dx:${Math.round(Math.random() * 40 - 20)}px"></i>`).join('');
});

// Сцена рисуется в 1920×1080; если источник в OBS другого размера — масштабируем целиком по центру
function fitScene() {
  const k = Math.min(innerWidth / 1920, innerHeight / 1080);
  document.body.style.transformOrigin = '0 0';
  document.body.style.transform = `translate(${(innerWidth - 1920 * k) / 2}px, ${(innerHeight - 1080 * k) / 2}px) scale(${k})`;
}
addEventListener('resize', fitScene);
fitScene();

let S = null;
let shownLeft = null;   // объявлено до onSettings: настройки могут прийти сразу при подписке

function setBackground(url) {
  const img = $('img.bg-media'), vid = $('video.bg-media');
  const isVideo = /\.(webm|mp4)$/i.test(url || '');
  img.hidden = !url || isVideo;
  vid.hidden = !url || !isVideo;
  if (url && !isVideo && img.getAttribute('src') !== url) img.src = url;
  if (url && isVideo && vid.getAttribute('src') !== url) { vid.src = url; vid.play().catch(() => {}); }
  $('.bg-dim').hidden = !url;
}

// Кто выглядывает из тумана на каждой сцене
const PEEK = { start: ['pumpkin', 'ghost', 'skull', 'cauldron'], brb: ['skull', 'potion', 'ghost', 'pumpkin'], end: ['ghost', 'cauldron', 'pumpkin', 'hand'] };
document.querySelectorAll('.peek').forEach((el, i) => { el.innerHTML = Witch.char(PEEK[SCENE][i]); });

Overly.onSettings(v => {
  S = v;
  const st = document.body.style;
  st.setProperty('--acc', v['scene.accent']);
  st.setProperty('--text', v['scene.textColor']);
  st.setProperty('--font', Overly.font(v['scene.font']));
  st.setProperty('--titleSize', v['scene.titleSize'] + 'px');
  st.setProperty('--bgDim', (v['scene.bgDim'] ?? 50) / 100);
  document.body.classList.toggle('no-bar', !v['scene.bar']);
  document.body.classList.toggle('no-clock', !v['scene.clock']);
  document.body.classList.toggle('no-moon', !v['scene.moon']);
  document.body.classList.toggle('no-bats', !v['scene.bats']);
  document.body.classList.toggle('no-ground', !v['scene.ground']);
  document.body.classList.toggle('no-spider', !v['scene.spider']);
  document.body.classList.toggle('no-flies', !v['scene.flies']);
  document.body.dataset.bg = v['scene.bg'];
  setBackground(v[`scene.${SCENE}Bg`] || v['scene.bgMedia']);
  Overly.css(v['scene.css']);
  $('.main .kind').textContent = v[`scene.${SCENE}Kicker`] || '';
  const title = v[`scene.${SCENE}Title`] || '';
  if ($('.title').getAttribute('aria-label') !== title) Witch.letters($('.title'), title);
  $('.line').textContent = v[`scene.${SCENE}Line`] || '';
  showSocials();
  tick();
  document.fonts.ready.then(() => requestAnimationFrame(() => {
    document.body.classList.add('ready');
    // Когда буквы упали — заголовок начинает качаться волной
    setTimeout(() => $('.title').classList.add('wave'), 900 + [...title].length * 45);
  }));
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

function pulse(el) { el.classList.remove('pulse'); void el.offsetWidth; el.classList.add('pulse'); }

function tick() {
  if (!S) return;
  const timer = $('.timer');
  const end = endTime();
  const left = end === null ? null : Math.ceil((end - Date.now()) / 1000);
  if (left === null) {
    timer.textContent = '';
  } else if (left <= 0) {
    if (!timer.classList.contains('done')) pulse(timer);
    timer.classList.add('done');
    timer.textContent = S[`scene.${SCENE}Done`] || '';
  } else {
    timer.classList.remove('done');
    const h = Math.floor(left / 3600), m = Math.floor(left / 60) % 60, s = left % 60;
    timer.textContent = (h ? h + ':' + String(m).padStart(2, '0') : String(m).padStart(2, '0')) + ':' + String(s).padStart(2, '0');
  }
  // Последние 10 секунд — каждая секунда «пульсирует»
  if (left !== shownLeft && left > 0 && left <= 10) pulse(timer);
  shownLeft = left;
  const now = new Date();
  $('.clock').textContent = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
}
setInterval(tick, 250);

// Фоллоу/сабки, пока висит сцена: внизу вспыхивает полоса с подписью и ником
const ev = $('.event');
let eventTimer = 0;
Overly.onEvent(a => {
  if (!S || !S['scene.events'] || !a?.name) return;
  ev.style.setProperty('--acc', S[a.type + '.color'] || S['scene.accent']);
  ev.querySelector('.kind').textContent = S[a.type + '.label'] || a.type;
  ev.querySelector('.nick').textContent = a.name;
  ev.classList.remove('lit'); void ev.offsetWidth; ev.classList.add('lit');
  clearTimeout(eventTimer);
  eventTimer = setTimeout(() => ev.classList.remove('lit'), 7000);
});

// Молния: двойная вспышка раз в 14–26 секунд, луна на миг ярче
function lightning() {
  if (S && S['scene.lightning'] && document.body.dataset.bg !== 'none') {
    const f = $('.flash');
    f.classList.remove('go'); void f.offsetWidth; f.classList.add('go');
  }
  setTimeout(lightning, 14000 + Math.random() * 12000);
}
setTimeout(lightning, 6000);

// Ведьма на метле пролетает мимо луны раз в 30–45 секунд
function flyby() {
  const w = $('.witch');
  if (S && S['scene.witch']) { w.classList.remove('go'); void w.offsetWidth; w.classList.add('go'); }
  setTimeout(flyby, 30000 + Math.random() * 15000);
}
setTimeout(flyby, 3500);

// Нижняя строка: может выключаться и браться с Twitch (Overly.line), поэтому обновляется и при смене названия
function showSocials() { $('.socials').textContent = Overly.line('scene.socials'); }
Overly.onChannel(showSocials);
