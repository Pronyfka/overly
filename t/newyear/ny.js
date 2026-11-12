// =====================================================
// ТЕМА «НОВОГОДНЯЯ НОЧЬ» · общие помощники для всех оверлеев темы
//   NY.garland(svg, path, opts)  — лампочки вдоль провода (path — <path> в этом svg); вернёт { bulbs, lit(n), paint(S) }
//   NY.sag(x0, x1, y, sag, spans) — d провисающего провода из нескольких дуг
//   NY.Snow(canvas, opts)        — снег на canvas (три глубины, 30 кадров в секунду), по желанию с сугробом внизу
//   NY.cap(el, wide)             — снежная шапка (кусок сугроба) на верхний край карточки
//   NY.icon(id)                  — значок события: snowflake, star, gift, bell, coin, tree, ornament, heart, sleigh
//   NY.chime(kind, volume)       — встроенный звук-колокольчик (WebAudio, без файлов)
//   NY.lights(S, prefix)         — цвета огоньков по настройкам (палитра или свой цвет)
//   NY.letters / fill / rgba / setMedia — буквы, подписи с числом, цвета, своя картинка
// Оптимизации: свечение лампочек — заранее нарисованные круги без размытия (blur не пересчитывается
// каждый кадр), мягкие снежинки — готовый спрайт, снег рисуется 30 раз в секунду.
// =====================================================
(() => {
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, attrs = {}) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };
  const rnd = (a, b) => a + Math.random() * (b - a);

  // ---------- Огоньки ----------
  const PALETTES = {
    warm: ['#FFD59A', '#FFE4B8', '#FFC77A', '#FFDCA8'],
    multi: ['#FF6B6B', '#FFD166', '#5EE6A8', '#6EC1FF', '#C9A2FF'],
    cold: ['#BFE3FF', '#E8F4FF', '#8FCBFF', '#D6ECFF'],
  };
  function lights(S, prefix = '') {
    const p = S[prefix + 'lights'] || S.lights || 'warm';
    if (p === 'custom') return [S[prefix + 'lightsColor'] || S.lightsColor || '#FFD59A'];
    return PALETTES[p] || PALETTES.warm;
  }

  // Провод: несколько провисающих дуг между точками крепления
  function sag(x0, x1, y, depth, spans = 1) {
    let d = `M${x0} ${y}`;
    const step = (x1 - x0) / spans;
    for (let i = 0; i < spans; i++) { const a = x0 + step * i, b = a + step; d += ` Q${(a + b) / 2} ${y + depth * 2} ${b} ${y}`; }
    return d;
  }

  // Лампочка висит поперёк провода: цоколь, колба, блик и мягкое свечение из двух кругов (без blur)
  function bulb(x, y, ang, scale) {
    const g = el('g', { class: 'nyb', transform: `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${ang.toFixed(1)}) scale(${scale})` });
    g.innerHTML = `<g class="g"><circle class="h2" cx="0" cy="13" r="17"/><circle class="h1" cx="0" cy="13" r="10.5"/>
      <rect class="sock" x="-3.2" y="0" width="6.4" height="6" rx="1.4"/><ellipse class="glass" cx="0" cy="12.5" rx="5.2" ry="7.6"/>
      <ellipse class="shine" cx="-1.6" cy="10" rx="1.3" ry="2.6"/></g>`;
    return g;
  }

  // opts: { count, scale, outward (колбы наружу от кадра), chase (бегущая волна), twinkle }
  function garland(svg, path, opts = {}) {
    const { count = 12, scale = 1, outward = false, chase = false } = opts;
    const len = path.getTotalLength(), closed = /z\s*$/i.test(path.getAttribute('d') || '');
    const bulbs = [];
    for (let i = 0; i < count; i++) {
      const at = closed ? len * i / count : len * (i + .5) / count;
      const p = path.getPointAtLength(at), q = path.getPointAtLength(Math.min(len, at + 1));
      const ang = Math.atan2(q.y - p.y, q.x - p.x) * 180 / Math.PI + (outward ? 180 : 0);
      const b = bulb(p.x, p.y, ang, scale);
      b.style.setProperty('--td', (chase ? 2.4 : rnd(2, 3.6)).toFixed(2) + 's');
      b.style.setProperty('--tdl', (chase ? i * .14 : rnd(0, 3)).toFixed(2) + 's');
      svg.appendChild(b); bulbs.push(b);
    }
    return {
      bulbs, path, len,
      // Сколько лампочек горит (остальные тёмные); flash — новая загорается со вспышкой
      lit(n, flash = false) {
        bulbs.forEach((b, i) => {
          const on = i < n, was = b.classList.contains('on');
          b.classList.toggle('on', on);
          if (on && !was && flash) { b.classList.remove('pop'); void b.getBBox(); b.classList.add('pop'); }
        });
      },
      paint(colors, twinkle = true) {
        bulbs.forEach((b, i) => { b.style.setProperty('--c', colors[i % colors.length]); b.classList.toggle('tw', twinkle); });
      },
    };
  }

  // ---------- Снег ----------
  // Спрайт мягкой снежинки: рисуется один раз, дальше только копируется
  const sprite = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 32;
    const x = c.getContext('2d'), g = x.createRadialGradient(16, 16, 0, 16, 16, 16);
    g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.45, 'rgba(255,255,255,.75)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g; x.fillRect(0, 0, 32, 32);
    return c;
  })();
  const AMOUNT = { none: 0, low: .45, mid: 1, high: 1.8 };

  class Snow {
    // opts: { per: снежинок на 100×100 px при «средне», scale: размер, pile: { max(u), minutes } }
    constructor(canvas, opts = {}) {
      this.c = canvas; this.x = canvas.getContext('2d'); this.o = opts; this.f = []; this.amount = 1; this.last = 0; this.prev = 0;
      this.resize();
      const loop = t => { this.frame(t); requestAnimationFrame(loop); };
      requestAnimationFrame(loop);
    }
    resize(w = this.c.clientWidth || this.c.width, h = this.c.clientHeight || this.c.height) {
      const dpr = Math.min(2, devicePixelRatio || 1);
      this.W = w; this.H = h; this.c.width = Math.round(w * dpr); this.c.height = Math.round(h * dpr);
      this.x.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.count();
      if (this.o.pile) this.initPile();
    }
    set(amount) { this.amount = AMOUNT[amount] ?? (+amount || 0); this.count(); }
    count() {
      const n = Math.round(this.W * this.H / 10000 * (this.o.per || .9) * this.amount);
      while (this.f.length < n) this.f.push(this.flake(true));
      this.f.length = n;
      if (!n) this.x.clearRect(0, 0, this.W, this.H);
    }
    flake(init) {
      const z = Math.random(), k = this.o.scale || 1;
      return { x: rnd(0, this.W), y: init ? rnd(-this.H, this.H) : rnd(-40, -8), r: (.8 + z * z * 3.2) * k,
        v: (22 + z * 68) * k, sw: rnd(8, 30) * (.4 + z) * k, ph: rnd(0, 6.28), sp: rnd(.4, 1.1), a: .35 + z * .5 };
    }
    frame(t) {
      if (t - this.last < 32) return;                       // ~30 кадров в секунду
      const dt = Math.min(.08, (t - (this.last || t)) / 1000); this.last = t;
      const { x, W, H } = this;
      x.clearRect(0, 0, W, H);
      if (this.h) this.drawPile();
      for (const f of this.f) {
        f.y += f.v * dt; f.ph += f.sp * dt;
        const px = f.x + Math.sin(f.ph) * f.sw;
        if (this.h && f.y >= H - this.heightAt(px)) { this.land(px, f.r); Object.assign(f, this.flake(false)); continue; }
        if (f.y > H + 12) { Object.assign(f, this.flake(false)); continue; }
        x.globalAlpha = f.a;
        if (f.r > 2.4) x.drawImage(sprite, px - f.r * 1.8, f.y - f.r * 1.8, f.r * 3.6, f.r * 3.6);
        else { x.beginPath(); x.arc(px, f.y, f.r, 0, 6.29); x.fillStyle = '#fff'; x.fill(); }
      }
      x.globalAlpha = 1;
    }

    // ---- Сугроб внизу: карта высот. Снег ложится туда, куда упал; к углам «задувает» больше;
    // крутые склоны оползают, но не выше предела столбика (середина остаётся тонкой — лицо не закрывается)
    initPile() {
      const N = this.N = Math.max(24, Math.round(this.W / 8));
      const old = this.h;
      this.h = new Float32Array(N); this.max = new Float32Array(N); this.colW = this.W / (N - 1);
      const peak = this.o.pile.peak || Math.min(60, this.H * .14);
      for (let i = 0; i < N; i++) {
        const u = i / (N - 1), t = Math.min(1, Math.min(u, 1 - u) / .3), corner = 1 - t * t * (3 - 2 * t);
        this.max[i] = peak * (.1 + .9 * corner);
        this.h[i] = old ? Math.min(this.max[i], old[Math.round(u * (old.length - 1))]) : this.max[i] * .12;
      }
      this.peak = peak;
    }
    pileRate(minutes) { this.o.pile.minutes = minutes; }
    heightAt(px) {
      const i = Math.max(0, Math.min(this.N - 1, px / this.colW)), a = Math.floor(i), b = Math.min(this.N - 1, a + 1);
      return this.h[a] + (this.h[b] - this.h[a]) * (i - a);
    }
    land(px, r) {
      // Сколько добавляет одна снежинка — так, чтобы при «средне» сугроб дорастал примерно за minutes минут
      const minutes = this.o.pile.minutes || 60, perSec = Math.max(.1, this.f.length * 60 / this.H);
      const amount = (this.peak * this.N * .45) / (minutes * 60 * perSec) * (.6 + r * .3) * 2.2;
      const i = Math.round(px / this.colW);
      for (let d = -2; d <= 2; d++) {
        const j = i + d; if (j < 0 || j >= this.N) continue;
        const wind = .25 + .75 * this.max[j] / this.peak;
        this.h[j] = Math.min(this.max[j], this.h[j] + amount * [.15, .5, 1, .5, .15][d + 2] * .5 * wind);
      }
    }
    drawPile() {
      const { x, h, N, H, W } = this;
      for (let k = 0; k < 2; k++) for (let i = 0; i < N - 1; i++) {
        const diff = h[i] - h[i + 1];
        if (Math.abs(diff) <= 2.5) continue;
        const [from, to] = diff > 0 ? [i, i + 1] : [i + 1, i];
        const m = Math.min((Math.abs(diff) - 2.5) * .08, Math.max(0, this.max[to] - h[to]));
        h[from] -= m; h[to] += m;
      }
      x.beginPath(); x.moveTo(0, H); x.lineTo(0, H - h[0]);
      for (let i = 1; i < N; i++) { const x0 = (i - 1) * this.colW, x1 = i * this.colW; x.quadraticCurveTo(x0, H - h[i - 1], (x0 + x1) / 2, H - (h[i - 1] + h[i]) / 2); }
      x.lineTo(W, H - h[N - 1]); x.lineTo(W, H); x.closePath();
      if (!this.grad || this.gradH !== H) {
        this.grad = x.createLinearGradient(0, H - this.peak, 0, H); this.gradH = H;
        this.grad.addColorStop(0, '#FFFFFF'); this.grad.addColorStop(1, '#D3DEF2');
      }
      x.fillStyle = this.grad; x.fill();
      x.strokeStyle = 'rgba(255,255,255,.9)'; x.lineWidth = 1.2; x.stroke();
    }
  }

  // ---------- Снежная шапка ----------
  // Кусок сугроба случайной длины и места; к краям толщина плавно сходит на нет
  function cap(node, wide = false, seed = Math.random()) {
    const cw = wide ? rnd(78, 92) : rnd(42, 78);
    node.style.setProperty('--cw', cw.toFixed(1) + '%');
    node.style.setProperty('--cl', rnd(3, 100 - cw - 3).toFixed(1) + '%');
    const w = 200;
    let top = 'M0 16', shade = 'M0 16';
    for (let x = 0; x <= w; x += 5) {
      const edge = Math.sin(Math.PI * x / w) ** .45;
      const bump = 5 + Math.sin(x * .07 + seed * 9) * 2.4 + Math.sin(x * .23 + seed * 5) * 1.3;
      const y = 16 - edge * (bump + 6);
      top += ` L${x} ${y.toFixed(1)}`; shade += ` L${x} ${(y + 2.2).toFixed(1)}`;
    }
    node.innerHTML = `<svg viewBox="0 0 ${w} 16" preserveAspectRatio="none"><path class="shade" d="${shade} L${w} 16Z"/><path d="${top} L${w} 16Z"/></svg>`;
  }

  // ---------- Значки ----------
  const ICONS = {
    snowflake: '<path d="M32 12v40M14.7 22l34.6 20M14.7 42l34.6-20M32 19l-5-5M32 19l5-5M32 45l-5 5M32 45l5 5M19 24.5l-1.5 6.8M19 24.5l-6.8-2M45 39.5l1.5-6.8M45 39.5l6.8 2"/>',
    star: '<path d="M32 13l5.6 12.6 13.7 1.4-10.3 9.2 3 13.5L32 42.8l-12 6.9 3-13.5-10.3-9.2 13.7-1.4z"/>',
    gift: '<rect x="15" y="27" width="34" height="23" rx="3"/><path d="M13 21h38v7H13zM32 21v29M32 21c-3-7-12-9-12-3 0 3 6 3 12 3M32 21c3-7 12-9 12-3 0 3-6 3-12 3"/>',
    bell: '<path d="M32 14c-8 0-12 6-12 14v9l-4 6h32l-4-6v-9c0-8-4-14-12-14zM28 47a4 4 0 0 0 8 0M32 10v4"/>',
    coin: '<circle cx="32" cy="36" r="14"/><path d="M28 18h8v5h-8zM28 30h5a3 3 0 0 1 0 6h-5v-6zm0 6v7M26 40h8"/>',
    tree: '<path d="M32 10l-12 16h7l-10 13h8l-10 12h34l-10-12h8l-10-13h7zM32 51v6"/>',
    ornament: '<circle cx="32" cy="38" r="15"/><path d="M28 19h8v5h-8zM32 15v4M19 34c8 4 18 4 26 0M18 42c9 4 19 4 28 0"/>',
    heart: '<path d="M32 48S15 38 15 26.5C15 20 20 16 25 16c3.5 0 5.6 2 7 4 1.4-2 3.5-4 7-4 5 0 10 4 10 10.5C49 38 32 48 32 48z"/>',
    sleigh: '<path d="M12 40h34c4 0 7-3 7-7v-4M18 40l-3 6h36M22 40V28h18l6 12M14 28h8"/>',
  };
  const icon = (id) => `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[id] || ICONS.snowflake}</svg>`;

  // ---------- Звук: колокольчик ----------
  // Несколько негармоничных обертонов с разным затуханием — звучит как маленький колокольчик; kind меняет высоту
  let live = null;
  function chime(kind, volume = .6, ctx) {
    try {
      const ac = ctx || (live = live || new AudioContext());
      const now = ac.currentTime, out = ac.createGain();
      out.gain.value = volume * .45; out.connect(ac.destination);
      const base = { follow: 1046, sub: 784, resub: 880, gift: 1175, raid: 659, bits: 988, tip: 1318 }[kind] || 1046;
      const notes = kind === 'gift' || kind === 'tip' ? [0, .12, .24] : kind === 'raid' ? [0, .18] : [0, .1];
      notes.forEach((dt, n) => {
        const f = base * [1, 1.26, 1.5][n % 3];
        [[1, .5, 1.6], [2.76, .18, .7], [5.4, .08, .35]].forEach(([mul, amp, dec]) => {
          const o = ac.createOscillator(), g = ac.createGain();
          o.type = 'sine'; o.frequency.value = f * mul;
          g.gain.setValueAtTime(0, now + dt); g.gain.linearRampToValueAtTime(amp, now + dt + .008);
          g.gain.exponentialRampToValueAtTime(.0005, now + dt + dec);
          o.connect(g).connect(out); o.start(now + dt); o.stop(now + dt + dec + .05);
        });
      });
    } catch { /* звук не обязателен */ }
  }

  // ---------- Мелочи ----------
  function letters(node, text) {
    node.textContent = ''; node.setAttribute('aria-label', text);
    [...String(text || '')].forEach((ch, i) => {
      const s = document.createElement('span'); s.className = 'ch'; s.style.setProperty('--i', i); s.textContent = ch; node.append(s);
    });
  }
  function rgba(hex, opacity, fallback = 0x0D1426) {
    const m = /^#?([0-9a-f]{6})$/i.exec(hex || '');
    const n = m ? parseInt(m[1], 16) : fallback;
    return `rgba(${n >> 16}, ${(n >> 8) & 255}, ${n & 255}, ${(opacity ?? 100) / 100})`;
  }
  function fill(tpl, n) {
    const plural = (one, few, many) => { const k = Math.abs(n) % 100, k1 = k % 10; return k > 10 && k < 20 ? many : k1 === 1 ? one : k1 >= 2 && k1 <= 4 ? few : many; };
    return String(tpl || '').replace(/\{n\}/g, n).replace(/\{([^|{}]+)\|([^|{}]+)\|([^|{}]+)\}/g, (_, a, b, c) => plural(a, b, c));
  }
  function setMedia(root, url) {
    const img = root.querySelector('img.media'), vid = root.querySelector('video.media');
    const isVideo = /\.(webm|mp4)$/i.test(url || '');
    img.hidden = !url || isVideo; vid.hidden = !url || !isVideo;
    if (url && !isVideo && img.getAttribute('src') !== url) img.src = url;
    if (url && isVideo) { if (vid.getAttribute('src') !== url) vid.src = url; vid.currentTime = 0; vid.play().catch(() => {}); }
    if (!url || !isVideo) vid.pause();
    return !!url;
  }

  window.NY = { el, rnd, sag, garland, lights, PALETTES, Snow, cap, icon, ICONS, chime, letters, rgba, fill, setMedia };
})();
