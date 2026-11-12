// =====================================================
// OVERLY RUNTIME ДЛЯ САЙТА — заменяет /runtime/overly.js в витрине тем.
// Тот же API (Overly.onSettings, onEvent, onChat …), но без программы и WebSocket:
//   • настройки — значения по умолчанию из theme.json (лежат рядом в settings.json);
//   • события и сообщения чата присылает страница сайта через postMessage;
//   • цифры канала и музыка — выдуманные, для красоты.
// Собирается скриптом tools/build-site.mjs, руками в site/ не править.
// =====================================================
(() => {
  const theme = window.OVERLY_THEME || '';
  const handlers = { settings: [], event: [], chat: [], chatMod: [], stats: [], scene: [], cs2: [], music: [], timer: [], poll: [] };
  let base = null;      // настройки темы как есть
  let values = null;    // то, что видит тема (со звуком или без)
  let soundOn = false;
  const stats = { followers: 742, subs: 57, bits: 3200, donations: 4350 };
  const music = { playing: true, title: 'Неоновый город', artist: 'Overly Beats', album: '', cover: '../../img/cover.svg', position: 41, duration: 198, at: Date.now() };

  // Без звука: убираем свои звуки событий и встроенные звуки темы
  function applySound() {
    if (!base) return;
    values = { ...base };
    // Витрина показывает события по кругу — алерт висит недолго, чтобы успеть посмотреть все
    if (values.showSec > 4) values.showSec = 4;
    if (!soundOn) {
      for (const k of Object.keys(values)) if (k.endsWith('.sound')) values[k] = '';
      values.themeSound = false;
    }
    handlers.settings.forEach(cb => cb(values));
  }

  // Настройки вшиты в html (так сайт работает и с диска, где fetch запрещён); settings.json — запасной путь
  (window.OVERLY_SETTINGS ? Promise.resolve(window.OVERLY_SETTINGS) : fetch('settings.json').then(r => r.json())).then(v => {
    base = v;
    applySound();
    handlers.stats.forEach(cb => cb(stats));
    handlers.music.forEach(cb => cb(music));
    parent.postMessage({ overly: 'ready', theme }, '*');
  });

  addEventListener('message', (e) => {
    const m = e.data || {};
    if (m.type === 'event') handlers.event.forEach(cb => cb(m.event));
    else if (m.type === 'chat') handlers.chat.forEach(cb => cb({ id: Math.random().toString(36).slice(2), ...m.message }));
    else if (m.type === 'sound') { soundOn = !!m.on; applySound(); }
  });

  const fonts = new Set();
  function font(name) {
    if (!name) return 'sans-serif';
    if (!fonts.has(name)) {
      fonts.add(name);
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `../../fonts/${encodeURIComponent(name.toLowerCase().replace(/ /g, '-'))}.css`;
      document.head.appendChild(link);
    }
    return `'${name}', sans-serif`;
  }

  let userCss = null;
  function css(text) {
    if (!userCss) { userCss = document.createElement('style'); document.head.appendChild(userCss); }
    userCss.textContent = text || '';
  }

  function play(url, volume = 1) {
    if (!url || !soundOn) return;
    const a = new Audio(url);
    a.volume = Math.max(0, Math.min(1, volume));
    a.play().catch(() => {});
  }

  window.Overly = {
    theme,
    preview: false,
    font,
    css,
    play,
    get settings() { return values; },
    onSettings(cb) { handlers.settings.push(cb); if (values) cb(values); },
    onEvent(cb) { handlers.event.push(cb); },
    onChat(cb) { handlers.chat.push(cb); },
    onChatMod(cb) { handlers.chatMod.push(cb); },
    onStats(cb) { handlers.stats.push(cb); if (values) cb(stats); },
    onScene(cb) { handlers.scene.push(cb); },
    setSceneWidgets() {},
    onCs2(cb) { handlers.cs2.push(cb); },
    onMusic(cb) { handlers.music.push(cb); if (values) cb(music); },
    onTimer(cb) { handlers.timer.push(cb); },
    onPoll(cb) { handlers.poll.push(cb); },
  };
})();
