// =====================================================
// ТЕМА GLITCH HUD · общие помощники для всех оверлеев темы
//   G.replay(el, 'g-in')      — проиграть анимацию заново
//   G.scramble(el, text, ms)  — текст «собирается из шума»
//   G.streak(parent, top)     — полоса цвета акцента пролетает по строке
//   G.glyphs(n)               — строка пиксельной «служебной» мелочи
//   G.fill / G.ink / G.rgba   — подписи с числом и цвета
// =====================================================
(() => {
  function replay(el, cls) { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }

  // Буквы ника встают на места, остальные пока мелькают случайными символами
  const NOISE = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%&@$/<>АБВГДЖЗИКЛМНПРСТУФХЦЧШЭЮЯ';
  function scramble(el, text, ms = 360) {
    const start = performance.now();
    const step = () => {
      const k = Math.min(1, (performance.now() - start) / ms);
      const fixed = Math.floor(text.length * k);
      el.textContent = text.slice(0, fixed) + [...text.slice(fixed)].map(c => c === ' ' ? ' ' : NOISE[Math.random() * NOISE.length | 0]).join('');
      if (k < 1) requestAnimationFrame(step);
    };
    step();
  }

  // Полоса поверх строки: влетает слева, улетает вправо
  function streak(parent, top = '35%', height = '30%', color) {
    const s = document.createElement('i');
    s.className = 'streak';
    Object.assign(s.style, { top, height, width: '100%' });
    if (color) s.style.background = color;
    parent.append(s);
    void s.offsetWidth;
    s.classList.add('go');
    setTimeout(() => s.remove(), 400);
  }

  const GLYPHS = '◦▪◎▾◇⌁▚▞◌⋄';
  const glyphs = (n = 6) => Array.from({ length: n }, () => GLYPHS[Math.random() * GLYPHS.length | 0]).join(' ');

  function fill(tpl, n) {
    const plural = (one, few, many) => {
      const k = Math.abs(n) % 100, k1 = k % 10;
      return k > 10 && k < 20 ? many : k1 === 1 ? one : k1 >= 2 && k1 <= 4 ? few : many;
    };
    return String(tpl || '').replace(/\{n\}/g, n).replace(/\{([^|{}]+)\|([^|{}]+)\|([^|{}]+)\}/g, (_, a, b, c) => plural(a, b, c));
  }
  function ink(hex) {
    const m = /^#?([0-9a-f]{6})$/i.exec(hex || '');
    if (!m) return '#0a0a0b';
    const n = parseInt(m[1], 16);
    return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255 > 0.55 ? '#0a0a0b' : '#fff';
  }
  function rgba(hex, opacity, fallback = 0x0a0a0b) {
    const m = /^#?([0-9a-f]{6})$/i.exec(hex || '');
    const n = m ? parseInt(m[1], 16) : fallback;
    return `rgba(${n >> 16}, ${(n >> 8) & 255}, ${n & 255}, ${(opacity ?? 100) / 100})`;
  }
  const GLITCH = { off: 0, soft: 0.5, normal: 1, strong: 1.7 };

  // Число события для «{n}»
  const NUM = {
    follow: () => 1,
    sub:    a => a.amount > 1 ? a.amount : 1,
    resub:  a => a.amount ?? 1,
    gift:   a => a.amount || 1,
    raid:   a => a.amount ?? 1,
    bits:   a => a.amount ?? 0,
    tip:    a => a.amount ?? 0,
  };

  // Встроенный звук (WebAudio, без файлов): цифровые бипы HUD — короткая вспышка помехи,
  // потом быстрая «телеметрия» из прямоугольных импульсов. Рейд — сирена, донат — сброс данных вниз.
  // ctx — свой AudioContext (например, OfflineAudioContext, чтобы записать звук в файл)
  let ac = null;
  const BEEPS = {
    follow: [0, 12], sub: [0, 7, 12, 19], resub: [0, 5, 12, 17], gift: [0, 12, 0, 12, 19, 24],
    bits: [24, 19, 24, 31], tip: [0, 4, 7, 12, 16, 19], raid: [0, 7, 12],
  };
  function sound(kind, volume = .6, ctx) {
    try {
      const a = ctx || (ac = ac || new AudioContext());
      const now = a.currentTime + .02, out = a.createGain(), lp = a.createBiquadFilter();
      out.gain.value = volume * .8;
      lp.type = 'lowpass'; lp.frequency.value = 4200;   // срезаем резкие верхи у квадратной волны
      out.connect(lp).connect(a.destination);
      const blip = (f, t, len, g = .22, type = 'square') => {
        const o = a.createOscillator(), e = a.createGain();
        o.type = type; o.frequency.value = f;
        e.gain.setValueAtTime(0, t); e.gain.linearRampToValueAtTime(g, t + .003);
        e.gain.setValueAtTime(g, t + len); e.gain.linearRampToValueAtTime(0, t + len + .015);
        o.connect(e).connect(out); o.start(t); o.stop(t + len + .03);
        return o;
      };
      const noise = (t, len, freq, g = .3) => {
        const n = Math.ceil(a.sampleRate * len), buf = a.createBuffer(1, n, a.sampleRate), d = buf.getChannelData(0);
        for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
        const s = a.createBufferSource(), bp = a.createBiquadFilter(), e = a.createGain();
        s.buffer = buf; bp.type = 'bandpass'; bp.frequency.value = freq; bp.Q.value = 1.2; e.gain.value = g;
        s.connect(bp).connect(e).connect(out); s.start(t);
      };
      const root = 587.33;   // D5
      noise(now, .04, 3000);   // помеха на входе
      const fast = kind === 'gift' || kind === 'bits';
      const step = fast ? .05 : .075;
      const seq = BEEPS[kind] || BEEPS.follow;
      // Последний бип держится дольше — «подтверждение» в конце
      seq.forEach((n, i) => blip(root * 2 ** (n / 12), now + .05 + i * step, i === seq.length - 1 ? .16 : step * .7));
      const end = now + .05 + seq.length * step + .12;
      if (kind === 'raid') {
        // Сирена: тон качается вверх-вниз три раза
        const o = blip(440, end, .9, .1, 'sawtooth');
        for (let i = 0; i < 3; i++) {
          o.frequency.setValueAtTime(440, end + i * .3);
          o.frequency.linearRampToValueAtTime(880, end + i * .3 + .15);
          o.frequency.linearRampToValueAtTime(440, end + i * .3 + .3);
        }
      }
      if (kind === 'tip') {
        // «Сброс данных»: пила падает с высоты вниз
        const o = blip(2400, end, .18, .08, 'sawtooth');
        o.frequency.setValueAtTime(2400, end); o.frequency.exponentialRampToValueAtTime(180, end + .18);
        noise(end + .2, .03, 1800, .2);
      }
    } catch { /* звук не обязателен */ }
  }

  window.G = { replay, scramble, streak, glyphs, fill, ink, rgba, GLITCH, NUM, sound };
})();
