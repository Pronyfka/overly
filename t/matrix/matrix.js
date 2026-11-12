// =====================================================
// ТЕМА «МАТРИЦА» · общие помощники для всех оверлеев темы
//   B.replay(el, 'wipe-in')        — проиграть анимацию заново
//   B.letters(el, text, delayMs)   — текст проявляется по буквам
//   B.tumble(parent, x, y, color)  — вспышка линии в точке (x, y) родителя
//   B.burst(parent, x, y, color)   — кольцо точек разлетается из точки
//   B.fill / B.ink / B.rgba / B.NUM — подписи с числом, цвет текста, цвета
// =====================================================
(() => {
  function replay(el, cls) { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }

  function letters(el, text, delay = 0) {
    el.classList.add('letters');
    el.style.setProperty('--d', delay + 'ms');
    el.replaceChildren(...[...String(text)].map((ch, i) => {
      const s = document.createElement('span');
      s.textContent = ch;
      s.style.setProperty('--i', i);
      return s;
    }));
  }

  // Квадрат прилетает в точку с поворотом — откуда-то сверху-слева (или справа)
  function tumble(parent, x, y, color, opts = {}) {
    const t = document.createElement('i');
    t.className = 'tumble';
    const size = opts.size || 46;
    const dir = opts.from === 'right' ? 1 : -1;
    Object.assign(t.style, { left: x - size / 2 + 'px', top: y - size / 2 + 'px' });
    t.style.setProperty('--s', size + 'px');
    t.style.setProperty('--tc', color);
    t.style.setProperty('--fx', dir * (140 + Math.random() * 120) + 'px');
    t.style.setProperty('--fy', -(120 + Math.random() * 100) + 'px');
    t.style.setProperty('--rot', dir * -(160 + Math.random() * 120) + 'deg');
    if (opts.time) t.style.setProperty('--t', opts.time + 's');
    parent.append(t);
    setTimeout(() => t.remove(), (opts.time || .7) * 1000 + 50);
  }

  function burst(parent, x, y, color, n = 12, r = 34) {
    const b = document.createElement('div');
    b.className = 'burst';
    Object.assign(b.style, { left: x + 'px', top: y + 'px' });
    if (color) b.style.setProperty('--bc', color);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2, rr = r * (.7 + Math.random() * .5);
      const d = document.createElement('i');
      d.style.setProperty('--bx', Math.cos(a) * rr + 'px');
      d.style.setProperty('--by', Math.sin(a) * rr + 'px');
      b.append(d);
    }
    parent.append(b);
    setTimeout(() => b.remove(), 1000);
  }

  function fill(tpl, n) {
    const plural = (one, few, many) => {
      const k = Math.abs(n) % 100, k1 = k % 10;
      return k > 10 && k < 20 ? many : k1 === 1 ? one : k1 >= 2 && k1 <= 4 ? few : many;
    };
    return String(tpl || '').replace(/\{n\}/g, n).replace(/\{([^|{}]+)\|([^|{}]+)\|([^|{}]+)\}/g, (_, a, b, c) => plural(a, b, c));
  }
  function ink(hex) {
    const m = /^#?([0-9a-f]{6})$/i.exec(hex || '');
    if (!m) return '#fff';
    const n = parseInt(m[1], 16);
    return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255 > 0.62 ? '#1B1B1E' : '#fff';   // на жёлтом и голубом — тёмный текст
  }
  function rgba(hex, opacity, fallback = 0xf0f0f1) {
    const m = /^#?([0-9a-f]{6})$/i.exec(hex || '');
    const n = m ? parseInt(m[1], 16) : fallback;
    return `rgba(${n >> 16}, ${(n >> 8) & 255}, ${n & 255}, ${(opacity ?? 100) / 100})`;
  }
  const NUM = {
    follow: () => 1,
    sub:    a => a.amount > 1 ? a.amount : 1,
    resub:  a => a.amount ?? 1,
    gift:   a => a.amount || 1,
    raid:   a => a.amount ?? 1,
    bits:   a => a.amount ?? 0,
    tip:    a => a.amount ?? 0,
  };
  // Светлое или тёмное оформление карточек
  function mode(el, value) { el.classList.toggle('dark-mode', value === 'dark'); }

  // Встроенный звук (WebAudio, без файлов): короткий цифровой щелчок и электронные ноты.
  // Подарок — кубики «катятся» лесенкой щелчков, рейд — глухой удар барабана под аккордом.
  // ctx — свой AudioContext (например, OfflineAudioContext, чтобы записать звук в файл)
  let ac = null;
  const MALLET = {
    follow: [0, 7], sub: [0, 4, 7], resub: [0, 5, 9], gift: [0, 4, 7, 12],
    raid: [0, 4, 7, 12], bits: [12, 19], tip: [0, 4, 7, 12],
  };
  function sound(kind, volume = .6, ctx) {
    try {
      const a = ctx || (ac = ac || new AudioContext());
      const now = a.currentTime + .02, out = a.createGain();
      out.gain.value = volume * .4;
      out.connect(a.destination);
      // Щелчок по деревяшке: короткий шум через узкий фильтр
      const tok = (t, f = 1400, g = .5) => {
        const n = Math.ceil(a.sampleRate * .03), buf = a.createBuffer(1, n, a.sampleRate), d = buf.getChannelData(0);
        for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n) ** 3;
        const s = a.createBufferSource(), bp = a.createBiquadFilter(), e = a.createGain();
        s.buffer = buf; bp.type = 'bandpass'; bp.frequency.value = f; bp.Q.value = 5; e.gain.value = g;
        s.connect(bp).connect(e).connect(out); s.start(t);
      };
      // Маримба: синус + обертон ×4, быстрое затухание
      const mallet = (f, t, g = .28) => {
        [[1, g, .45], [4, g * .12, .08]].forEach(([k, gain, dur]) => {
          const o = a.createOscillator(), e = a.createGain();
          o.type = k === 1 ? 'square' : 'sine'; o.frequency.value = f * k;
          e.gain.setValueAtTime(0, t); e.gain.linearRampToValueAtTime(gain, t + .004); e.gain.exponentialRampToValueAtTime(.0001, t + dur);
          o.connect(e).connect(out); o.start(t); o.stop(t + dur + .05);
        });
      };
      const root = 523.25;   // C5
      let t = now;
      if (kind === 'gift') {
        for (let i = 0; i < 5; i++) tok(now + i * .055, 1900 - i * 220, .4);   // кубики катятся
        t = now + .3;
      } else {
        tok(now);
        t = now + .06;
      }
      if (kind === 'raid') {
        // Барабан: синус падает с 140 до 50 Гц
        const o = a.createOscillator(), e = a.createGain();
        o.frequency.setValueAtTime(140, now); o.frequency.exponentialRampToValueAtTime(50, now + .35);
        e.gain.setValueAtTime(.7, now); e.gain.exponentialRampToValueAtTime(.0001, now + .5);
        o.connect(e).connect(out); o.start(now); o.stop(now + .55);
      }
      const notes = MALLET[kind] || MALLET.follow;
      notes.forEach((n, i) => mallet(root * 2 ** (n / 12), t + i * .085));
      if (kind === 'raid' || kind === 'tip') {
        // В конце — аккорд всеми нотами сразу и финальный щелчок
        const end = t + notes.length * .085 + .05;
        notes.forEach(n => mallet(root * 2 ** (n / 12), end, .14));
        tok(end, 2200, .3);
      }
    } catch { /* звук не обязателен */ }
  }

  window.B = { replay, letters, tumble, burst, fill, ink, rgba, NUM, mode, sound };
})();

// =====================================================
// Палитры: одна настройка красит все оверлеи. «Свои цвета» оставляет значения из настроек.
// =====================================================
(() => {
  const P = {
    crimson: { acc: '#E6004C', deep: '#7A0029' },
    cyan:    { acc: '#00D9F5', deep: '#006F80' },
    gold:    { acc: '#FFC400', deep: '#8A6A00' },
    violet:  { acc: '#A620F5', deep: '#560F86' },
  };
  const KEYS = ['follow.color', 'sub.color', 'resub.color', 'gift.color', 'raid.color', 'bits.color', 'tip.color',
    'st.accent', 'chat.accent', 'scene.accent', 'cam.color', 'music.color', 'goal.color', 'timer.color', 'poll.color'];
  function withPalette(v) {
    const p = P[v.palette];
    const acc = p ? p.acc : v['scene.accent'];
    document.documentElement.style.setProperty('--deep', p ? p.deep : 'color-mix(in srgb, ' + acc + ' 55%, #000)');
    if (!p) return v;
    const out = { ...v };
    for (const k of KEYS) out[k] = p.acc;
    return out;
  }
  const listen = Overly.onSettings;
  Overly.onSettings = (cb) => listen((v) => cb(withPalette(v)));
})();
