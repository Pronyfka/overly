// =====================================================
// ТЕМА «ТУШЬ» · общие помощники для всех оверлеев темы
//   B.replay(el, 'wipe-in')        — проиграть анимацию заново
//   B.letters(el, text, delayMs)   — текст проявляется по буквам
//   B.tumble(parent, x, y, color)  — капля туши падает в точку (x, y) родителя
//   B.burst(parent, x, y, color)   — брызги разлетаются из точки
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

  // Встроенный звук (WebAudio, без файлов): щелчок деревянной колотушки и щипок струны, как у кото (лад ин-сэн).
  // Подарок — кубики «катятся» лесенкой щелчков, рейд — глухой удар барабана под аккордом.
  // ctx — свой AudioContext (например, OfflineAudioContext, чтобы записать звук в файл)
  let ac = null;
  const MALLET = {
    follow: [0, 5], sub: [0, 5, 7], resub: [0, 1, 5], gift: [0, 5, 7, 12],
    raid: [0, 1, 5, 7], bits: [7, 12], tip: [0, 5, 7, 12],
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
          o.type = k === 1 ? 'triangle' : 'sine'; o.frequency.value = f * k;
          e.gain.setValueAtTime(0, t); e.gain.linearRampToValueAtTime(gain, t + .004); e.gain.exponentialRampToValueAtTime(.0001, t + dur);
          o.connect(e).connect(out); o.start(t); o.stop(t + dur + .05);
        });
      };
      const root = 392;   // G4
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
// Ink — мазки кистью. Картинок в теме нет: всё рисуется кодом на canvas.
//   Ink.stroke(w, h, seed, opts)            — мазок сухой кистью (чёрным по прозрачному), возвращает canvas
//   Ink.paint(canvas, src, p, color)        — показать мазок src на доле p (0…1): щетинки идут вразнобой
//   Ink.animate(canvas, src, {from,to,dur,color}) — провести мазок; возвращает функцию отмены
//   Ink.sun(d, seed, 'disc'|'rings')        — солнце с неровным краем и дуги вокруг него
//   Ink.splat(w, h, seed, n)                — брызги и короткие росчерки
//   Ink.mix('#a', '#b', k)                  — смешать два цвета
// В :root лежат готовые маски: --stroke1…3, --strokeW (длинный), --strokeS (тонкий), --sun, --wipe.
// =====================================================
(() => {
  const rng = (seed) => { let s = Math.imul(seed | 0, 2654435761) >>> 0 || 1; return () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296; };
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = Math.round(w); c.height = Math.round(h); return c; };

  // Мазок складывается из нескольких полос (кисть прошла несколько раз), каждая — из тонких следов щетины.
  // Концы рваные, к правому краю краска кончается: вырезаем длинные сухие просветы.
  function stroke(w, h, seed = 1, o = {}) {
    const c = mk(w, h), x = c.getContext('2d'), r = rng(seed);
    const pad = w * (o.pad ?? .075), bands = o.bands ?? 5, my = o.my ?? .13;
    const top = h * my, bot = h * (1 - my), bh = (bot - top) / bands;
    x.strokeStyle = x.fillStyle = '#000'; x.lineCap = 'round';
    for (let b = 0; b < bands; b++) {
      const y0 = top + b * bh - bh * .3, y1 = top + (b + 1) * bh + bh * .3;
      const x0 = pad * (.25 + r() * .9), x1 = w - pad * (.25 + r() * 1.1);
      const tilt = (r() - .5) * h * .035, arc = (r() - .5) * h * .07;   // каждый проход кисти чуть наклонён и выгнут
      for (let y = y0; y < y1; y += 1.1) {
        const edge = 1 - Math.min(1, (y - y0) / (bh * .35), (y1 - y) / (bh * .35));   // у края полосы щетина короче — силуэт ступенчатый
        const a = x0 - r() ** 3 * pad * .9 + edge * r() ** 1.5 * w * .2;
        const z = x1 + r() ** 3 * pad * 1.2 - edge * r() ** 1.5 * w * .28;
        if (z - a < w * .12) continue;
        x.lineWidth = .8 + r() * 2.8;
        x.beginPath(); x.moveTo(a, y - tilt);
        x.quadraticCurveTo((a + z) / 2, y + arc, z, y + tilt + (r() - .5) * 2);
        x.stroke();
      }
    }
    x.globalCompositeOperation = 'destination-out';
    const gaps = (o.dry ?? 1) * w * h / 5200;
    for (let i = 0; i < gaps; i++) {
      const right = r() < .86, len = pad * (.6 + r() * 2.4);
      const gx = right ? w - pad * .3 - r() ** 1.8 * w * .34 - len * .3 : pad * (.2 + r() * 1.2);
      const gy = top + r() * (bot - top), bend = (r() - .5) * 3;
      x.lineWidth = .5 + r() * .9;
      x.beginPath(); x.moveTo(gx, gy); x.quadraticCurveTo(gx + len / 2, gy + bend, gx + len, gy + (r() - .5) * 2); x.stroke();
    }
    x.globalCompositeOperation = 'source-over';
    for (let i = 0; i < (o.dots ?? 9); i++) {
      const rr = .8 + r() ** 2 * h * .03, px = r() < .5 ? r() * pad * 1.1 : w - r() * pad * 1.1;
      x.beginPath(); x.arc(px, h * (.06 + r() * .88), rr, 0, 7); x.fill();
    }
    return c;
  }

  function paint(cv, src, p, color, seed = 5) {
    const x = cv.getContext('2d'), W = cv.width, H = cv.height, n = Math.max(6, Math.round(H / 5)), r = rng(seed), L = .43;
    x.globalCompositeOperation = 'source-over';
    x.clearRect(0, 0, W, H);
    if (p <= 0) return;
    for (let i = 0; i < n; i++) {
      const lag = r() * .26 + Math.abs(i / (n - 1) - .45) * .3;   // середина кисти впереди, края и отдельные щетинки отстают
      const q = Math.max(0, Math.min(1, p * (1 + L) - lag));
      const y0 = Math.round(i * H / n), y1 = Math.round((i + 1) * H / n), w = Math.round(W * q);
      if (w > 0) x.drawImage(src, 0, y0, w, y1 - y0, 0, y0, w, y1 - y0);
    }
    if (color) { x.globalCompositeOperation = 'source-in'; x.fillStyle = color; x.fillRect(0, 0, W, H); x.globalCompositeOperation = 'source-over'; }
  }

  // Если кадры не идут (источник скрыт), страховка всё равно ставит конечное состояние
  function animate(cv, src, o) {
    const t0 = performance.now(), ease = o.ease || ((t) => 1 - (1 - t) ** 3);
    let done = false, id = 0;
    const step = (now) => {
      if (done) return;
      const t = Math.min(1, Math.max(0, (now - t0) / o.dur));
      paint(cv, src, o.from + (o.to - o.from) * ease(t), o.color, o.seed);
      if (t < 1) id = requestAnimationFrame(step); else done = true;
    };
    id = requestAnimationFrame(step);
    const safety = setTimeout(() => { if (!done) { done = true; paint(cv, src, o.to, o.color, o.seed); } }, o.dur + 150);
    return () => { done = true; cancelAnimationFrame(id); clearTimeout(safety); };
  }

  function sun(d, seed = 1, kind = 'disc') {
    const c = mk(d, d), x = c.getContext('2d'), r = rng(seed), R = d * (kind === 'disc' ? .47 : .36);
    x.fillStyle = x.strokeStyle = '#000'; x.lineCap = 'round';
    x.translate(d / 2, d / 2);
    if (kind === 'disc') {
      x.beginPath();
      for (let i = 0; i <= 120; i++) {
        const a = i / 120 * Math.PI * 2, rr = R * (1 + Math.sin(a * 3 + seed) * .012 + Math.sin(a * 7 + seed * 2) * .008 + (r() - .5) * .018);
        x.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
      }
      x.closePath(); x.fill();
    } else {
      for (let k = 0; k < 9; k++) {
        const rr = R * (1.05 + r() * .26), a0 = r() * 6.28, len = .35 + r() * 1.5;
        x.lineWidth = d * (.003 + r() * .011);
        x.beginPath(); x.arc(0, 0, rr, a0, a0 + len); x.stroke();
      }
    }
    return c;
  }

  function splat(w, h, seed = 1, n = 18, hole = false) {   // hole — не брызгать в середину, где текст
    const c = mk(w, h), x = c.getContext('2d'), r = rng(seed);
    x.fillStyle = '#000';
    for (let i = 0; i < n; i++) {
      const px = r() * w, py = r() * h, ang = r() * 6.28, kind = r(), a = r(), b = r();
      if (hole && Math.abs(px / w - .5) < .37 && Math.abs(py / h - .5) < .3) continue;
      x.save(); x.translate(px, py); x.rotate(ang);
      x.beginPath();
      if (kind < .55) x.arc(0, 0, 1 + a ** 2 * h * .035, 0, 7);
      else x.ellipse(0, 0, 4 + a * h * .07, 1.2 + b * 2.6, 0, 0, 7);
      x.fill(); x.restore();
    }
    return c;
  }

  // Край шторки: левая часть сплошная, дальше — щетинки разной длины
  function wipe() {
    const c = mk(600, 60), x = c.getContext('2d'), r = rng(7);
    for (let y = 0; y < 60; y += 2) x.fillRect(0, y, 600 * (.45 + r() * .13), 2);
    return c;
  }

  function mix(a, b, k) {
    const p = (h) => { const n = parseInt((/^#?([0-9a-f]{6})$/i.exec(h) || [0, '888888'])[1], 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
    const A = p(a), B2 = p(b);
    return '#' + A.map((v, i) => Math.round(v + (B2[i] - v) * k).toString(16).padStart(2, '0')).join('');
  }

  const url = (c) => `url(${c.toDataURL()})`;
  const root = document.documentElement.style;
  root.setProperty('--wipe', url(wipe()));
  root.setProperty('--stroke1', url(stroke(640, 104, 11, { pad: .05, bands: 4, my: .05 })));
  root.setProperty('--stroke2', url(stroke(640, 104, 23, { pad: .05, bands: 4, my: .05 })));
  root.setProperty('--stroke3', url(stroke(640, 104, 37, { pad: .05, bands: 4, my: .05 })));
  root.setProperty('--strokeW', url(stroke(960, 120, 5, { pad: .035, bands: 4, my: .05 })));
  root.setProperty('--strokeS', url(stroke(360, 22, 9, { pad: .06, bands: 1, dots: 0, dry: .4, my: .2 })));
  root.setProperty('--sun', url(sun(160, 3)));

  // Фильтры: «ink-rough» — неровный край, как у туши на бумаге; «ink-dry» — ещё и сухие просветы в буквах
  document.body.insertAdjacentHTML('beforeend', `<svg width="0" height="0" style="position:absolute" aria-hidden="true">
    <filter id="ink-rough" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency=".035 .06" numOctaves="2" seed="3" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="7" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
    <filter id="ink-dry" x="-5%" y="-10%" width="110%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency=".03 .05" numOctaves="2" seed="5" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="10" xChannelSelector="R" yChannelSelector="G" result="d"/>
      <feTurbulence type="fractalNoise" baseFrequency=".004 .22" numOctaves="2" seed="9" result="s"/>
      <feColorMatrix in="s" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -10 0 0 0 7.3" result="m"/>
      <feComposite in="d" in2="m" operator="in"/>
    </filter></svg>`);

  window.Ink = { rng, stroke, paint, animate, sun, splat, mix, url };
})();

// =====================================================
// Палитры: одна настройка красит все оверлеи. «Свои цвета» оставляет значения из настроек.
// =====================================================
(() => {
  const P = {
    cinnabar: { acc: '#E0251B', deep: '#8E120C' },
    sakura:   { acc: '#F0507F', deep: '#9C2148' },
    indigo:   { acc: '#3F6FE8', deep: '#1D3A8C' },
    jade:     { acc: '#1FA57C', deep: '#0E6048' },
  };
  const KEYS = ['follow.color', 'sub.color', 'resub.color', 'gift.color', 'raid.color', 'bits.color', 'tip.color',
    'st.accent', 'chat.accent', 'scene.accent', 'cam.color', 'music.color', 'goal.color', 'timer.color', 'poll.color'];
  function withPalette(v) {
    const p = P[v.palette];
    const acc = p ? p.acc : v['scene.accent'];
    document.documentElement.style.setProperty('--deep', p ? p.deep : 'color-mix(in srgb, ' + acc + ' 60%, #000)');
    if (!p) return v;
    const out = { ...v };
    for (const k of KEYS) out[k] = p.acc;
    return out;
  }
  const listen = Overly.onSettings;
  Overly.onSettings = (cb) => listen((v) => cb(withPalette(v)));
})();
