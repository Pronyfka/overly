// =====================================================
// ТЕМА LUMEN · общие помощники для всех оверлеев темы
//   Lumen.open(card, intro)  — раскрыть карточку ('line' | 'rise' | 'fade'), вернёт Promise по окончании
//   Lumen.close(card)        — свернуть карточку обратно в полосу и погасить, вернёт Promise
//   Lumen.shine(card)        — пустить блик по карточке
//   Lumen.pop(el)            — «пружинка» у цифры
//   Lumen.rgba / ink / fill  — цвета и подписи с числом
// =====================================================
(() => {
  const PHASES = ['p-line', 'p-open', 'p-enter', 'p-on', 'p-leave', 'p-close', 'p-gone'];
  const INTROS = ['i-line', 'i-rise', 'i-fade'];

  // У каждой карточки свои таймеры — новая анимация отменяет недоигранную
  const timers = new WeakMap();
  function schedule(card, steps) {
    (timers.get(card) || []).forEach(clearTimeout);
    return new Promise(done => {
      const list = steps.map(([ms, fn]) => setTimeout(fn, ms));
      list.push(setTimeout(done, steps[steps.length - 1][0]));
      timers.set(card, list);
    });
  }
  const phase = (card, p) => { card.classList.remove(...PHASES); if (p) card.classList.add(p); };

  function open(card, intro = 'line') {
    card.classList.remove(...INTROS);
    card.classList.add('i-' + intro);
    phase(card, null);
    void card.offsetWidth;   // сброс в начальное состояние, чтобы переходы проигрались заново
    if (intro !== 'line') {
      return schedule(card, [[16, () => phase(card, 'p-enter')], [700, () => phase(card, 'p-on')]]);
    }
    return schedule(card, [
      [16, () => phase(card, 'p-line')],
      [210, () => phase(card, 'p-open')],
      [330, () => phase(card, 'p-enter')],
      [1100, () => phase(card, 'p-on')],
    ]);
  }

  function close(card) {
    if (!card.classList.contains('i-line')) {
      return schedule(card, [[0, () => phase(card, 'p-leave')], [120, () => phase(card, 'p-close')], [450, () => phase(card, null)]]);
    }
    return schedule(card, [
      [0, () => phase(card, 'p-leave')],
      [200, () => phase(card, 'p-close')],
      [600, () => phase(card, 'p-gone')],
      [820, () => phase(card, null)],
    ]);
  }

  function replay(el, cls) { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }
  const shine = (card) => replay(card, 'shine');
  const pop = (el) => { replay(el, 'pop'); el.addEventListener('animationend', () => el.classList.remove('pop'), { once: true }); };

  // #RRGGBB + непрозрачность 0..100 → rgba()
  function rgba(hex, opacity, fallback = 0x101015) {
    const m = /^#?([0-9a-f]{6})$/i.exec(hex || '');
    const n = m ? parseInt(m[1], 16) : fallback;
    return `rgba(${n >> 16}, ${(n >> 8) & 255}, ${n & 255}, ${(opacity ?? 100) / 100})`;
  }
  // Тёмный или светлый текст поверх цвета
  function ink(hex) {
    const m = /^#?([0-9a-f]{6})$/i.exec(hex || '');
    if (!m) return '#0b0b0f';
    const n = parseInt(m[1], 16);
    return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255 > 0.6 ? '#0b0b0f' : '#fff';
  }
  // «{n} {месяц|месяца|месяцев}» → «7 месяцев»
  function fill(tpl, n) {
    const plural = (one, few, many) => {
      const k = Math.abs(n) % 100, k1 = k % 10;
      return k > 10 && k < 20 ? many : k1 === 1 ? one : k1 >= 2 && k1 <= 4 ? few : many;
    };
    return String(tpl || '').replace(/\{n\}/g, n).replace(/\{([^|{}]+)\|([^|{}]+)\|([^|{}]+)\}/g, (_, a, b, c) => plural(a, b, c));
  }

  // Своя картинка/GIF/видео в паре <img class="media"> + <video class="media">
  function setMedia(root, url) {
    const img = root.querySelector('img.media'), vid = root.querySelector('video.media');
    const isVideo = /\.(webm|mp4)$/i.test(url || '');
    img.hidden = !url || isVideo;
    vid.hidden = !url || !isVideo;
    if (url && !isVideo && img.getAttribute('src') !== url) img.src = url;
    if (url && isVideo) { if (vid.getAttribute('src') !== url) vid.src = url; vid.currentTime = 0; vid.play().catch(() => {}); }
    if (!url || !isVideo) vid.pause();
    return !!url;
  }

  // Значки событий (24×24, цвет — currentColor)
  const ICONS = {
    follow: '<path d="M12 21s-8-5.2-8-11a4.6 4.6 0 0 1 8-3 4.6 4.6 0 0 1 8 3c0 5.8-8 11-8 11z"/>',
    sub: '<path d="m12 2 3 6.6 7 .7-5.3 4.7 1.6 7L12 17.4 5.7 21l1.6-7L2 9.3l7-.7z"/>',
    resub: '<path d="M17 1.5 21 5.5l-4 4v-3H7a2 2 0 0 0-2 2V11H3V8.5a4 4 0 0 1 4-4h10zM7 22.5l-4-4 4-4v3h10a2 2 0 0 0 2-2V13h2v2.5a4 4 0 0 1-4 4H7z"/>',
    gift: '<path d="M20 7h-2.2A3 3 0 0 0 12 3.8 3 3 0 0 0 6.2 7H4a1 1 0 0 0-1 1v3h8V7h2v4h8V8a1 1 0 0 0-1-1zM9 7a1 1 0 1 1 1.9-.4L11 7zm4 0 .1-.4A1 1 0 1 1 15 7zM4 13v7a1 1 0 0 0 1 1h6v-8zm9 8h6a1 1 0 0 0 1-1v-7h-7z"/>',
    raid: '<path d="M13 2 4 14h6l-1 8 9-12h-6z"/>',
    bits: '<path d="M6 3h12l4 6-10 12L2 9z"/>',
    tip: '<path fill-rule="evenodd" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-2 5h3.2a3.2 3.2 0 0 1 0 6.4H12v1h2.5V16H12v2h-2v-2H8.5v-1.6H10v-1H8.5v-1.6H10zm2 1.6v3.2h1.2a1.6 1.6 0 0 0 0-3.2z"/>',
  };
  const icon = (type) => `<svg viewBox="0 0 24 24" fill="currentColor">${ICONS[type] || ICONS.follow}</svg>`;

  // Встроенный звук (WebAudio, без файлов): стеклянный колокольчик — мягкое арпеджио с эхом,
  // как будто карточка звенит, раскрываясь. Чем весомее событие, тем больше нот.
  // ctx — свой AudioContext (например, OfflineAudioContext, чтобы записать звук в файл)
  let ac = null;
  const CHIME = {
    follow: [0, 7], sub: [0, 4, 7], resub: [0, 4, 7, 11], gift: [0, 4, 7, 12, 16],
    raid: [0, 4, 7, 12], bits: [12, 16, 19, 24], tip: [0, 7, 12, 16],
  };
  function sound(kind, volume = .6, ctx) {
    try {
      const a = ctx || (ac = ac || new AudioContext());
      const now = a.currentTime + .02, out = a.createGain();
      out.gain.value = volume * .5;
      // Эхо: задержка с обратной связью, верхи приглушены — звон «растворяется»
      const dl = a.createDelay(1), lp = a.createBiquadFilter(), fb = a.createGain(), wet = a.createGain();
      dl.delayTime.value = .21; lp.type = 'lowpass'; lp.frequency.value = 2400; fb.gain.value = .3; wet.gain.value = .35;
      out.connect(a.destination);
      out.connect(dl); dl.connect(lp); lp.connect(fb).connect(dl); lp.connect(wet).connect(a.destination);
      const root = 659.25;   // E5
      const bell = (f, t, g) => {
        // Основной тон + «колокольный» обертон ×2.76, который гаснет быстрее
        [[1, g, 1.6], [2.76, g * .18, .45]].forEach(([k, gain, dur]) => {
          const o = a.createOscillator(), e = a.createGain();
          o.type = 'sine'; o.frequency.value = f * k;
          e.gain.setValueAtTime(0, t); e.gain.linearRampToValueAtTime(gain, t + .006); e.gain.exponentialRampToValueAtTime(.0001, t + dur);
          o.connect(e).connect(out); o.start(t); o.stop(t + dur + .05);
        });
      };
      const notes = CHIME[kind] || CHIME.follow;
      const step = kind === 'gift' || kind === 'bits' ? .07 : .1;
      notes.forEach((n, i) => bell(root * 2 ** (n / 12), now + i * step, .32 - i * .025));
      if (kind === 'raid') {
        // Рейд: под колокольчиком медленно поднимается тёплый аккорд
        [-12, -5].forEach(n => {
          const o = a.createOscillator(), e = a.createGain();
          o.type = 'triangle'; o.frequency.value = root * 2 ** (n / 12);
          e.gain.setValueAtTime(0, now); e.gain.linearRampToValueAtTime(.12, now + .5); e.gain.exponentialRampToValueAtTime(.0001, now + 2.2);
          o.connect(e).connect(out); o.start(now); o.stop(now + 2.3);
        });
      }
      if (kind === 'tip') {
        // Донат: в конце — короткий блеск из высоких нот
        [24, 28, 31].forEach((n, i) => bell(root * 2 ** (n / 12), now + .45 + i * .05, .08));
      }
    } catch { /* звук не обязателен */ }
  }

  window.Lumen = { open, close, shine, pop, replay, rgba, ink, fill, setMedia, icon, sound };
})();
