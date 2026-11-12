// =====================================================
// ТЕМА «ВЕДЬМИН ЧАС» · общие помощники для всех оверлеев темы
//   Witch.char(id)               — SVG-персонаж: ghost, hand, skull, pumpkin, potion, cauldron, bat, spider
//   Witch.letters(el, text)      — разложить надпись по буквам (для анимации по буквам)
//   Witch.frame(svg, w, h, opts) — нарисовать «кривую» рамку с подтёками в <svg> размером w×h
//   Witch.FRAMES                 — готовые цвета рамки: purple, pumpkin, bone, slime
//   Witch.spooky(kind, volume)   — встроенный жуткий звук (WebAudio, без файлов)
//   Witch.rgba / fill / setMedia — цвета, подписи с числом, своя картинка
// =====================================================
(() => {
  // Персонажи 120×120, «земля» — нижний край: они вылезают снизу из туманной полосы.
  // Классы оживляют их (анимации в witch.css): blink — моргают глаза, flick — свеча внутри тыквы,
  // look — глаз в зелье оглядывается, bub — пузыри, wig — шевелятся пальцы, wing — машут крылья.
  const CHARS = {
    ghost: `
      <path d="M28 120V64C28 38 42 20 60 20s32 18 32 44v56l-8-8-8 8-8-8-8 8-8-8-8 8-8-8z" fill="#F4F0E8"/>
      <path d="M78 26c9 7 14 21 14 38v56l-8-8-8 8V64c0-17-3-30-10-40 4 0 8 1 12 2z" fill="#D9D2E6" opacity=".7"/>
      <g class="blink"><ellipse cx="49" cy="58" rx="6" ry="8" fill="#1B1026"/><ellipse cx="71" cy="58" rx="6" ry="8" fill="#1B1026"/>
      <circle cx="51" cy="55" r="2" fill="#fff"/><circle cx="73" cy="55" r="2" fill="#fff"/></g>
      <ellipse class="ooh" cx="60" cy="78" rx="5" ry="6" fill="#1B1026"/>
      <ellipse cx="40" cy="70" rx="5" ry="3" fill="#F7A8C4" opacity=".7"/><ellipse cx="80" cy="70" rx="5" ry="3" fill="#F7A8C4" opacity=".7"/>`,
    hand: `
      <path d="M49 120V84h22v36z" fill="#6FAF3A"/>
      <path d="M40 62c0-6 4-9 8-9h24c5 0 8 4 8 9v18c0 6-5 10-11 10H50c-6 0-10-4-10-10z" fill="#8BD24A"/>
      <g class="wig" style="--o:45px 58px"><rect x="41" y="24" width="9" height="36" rx="4.5" fill="#8BD24A" transform="rotate(-8 45 42)"/><path d="M44 27h5" stroke="#C9F29A" stroke-width="3" stroke-linecap="round"/></g>
      <g class="wig" style="--o:56px 56px;animation-delay:-.2s"><rect x="52" y="16" width="9" height="42" rx="4.5" fill="#8BD24A"/><path d="M55 19h5" stroke="#C9F29A" stroke-width="3" stroke-linecap="round"/></g>
      <g class="wig" style="--o:67px 56px;animation-delay:-.4s"><rect x="63" y="20" width="9" height="38" rx="4.5" fill="#8BD24A" transform="rotate(5 67 40)"/><path d="M66 23h5" stroke="#C9F29A" stroke-width="3" stroke-linecap="round"/></g>
      <g class="wig" style="--o:76px 58px;animation-delay:-.6s"><rect x="73" y="34" width="8" height="28" rx="4" fill="#8BD24A" transform="rotate(14 77 48)"/></g>
      <rect x="26" y="58" width="22" height="9" rx="4.5" fill="#8BD24A" transform="rotate(-38 37 62)"/>
      <path d="M52 96l16 4M54 104l14-2M50 74h20" stroke="#3C6B1F" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M58 92v14" stroke="#3C6B1F" stroke-width="2" stroke-dasharray="3 3"/>`,
    skull: `
      <path d="M60 22c-22 0-36 15-36 35 0 12 5 21 13 26v13c0 4 3 7 7 7h32c4 0 7-3 7-7V83c8-5 13-14 13-26 0-20-14-35-36-35z" fill="#EDE6D3"/>
      <path d="M84 30c8 7 12 16 12 27 0 12-5 21-13 26v13c0 4-3 7-7 7h-6c4 0 7-3 7-7V80c8-5 12-14 12-24 0-10-2-19-5-26z" fill="#CFC5AC"/>
      <ellipse cx="46" cy="60" rx="10" ry="11" fill="#1B1026"/><ellipse cx="74" cy="60" rx="10" ry="11" fill="#1B1026"/>
      <g class="glint"><circle cx="46" cy="60" r="3" fill="#7FE7FF"/><circle cx="74" cy="60" r="3" fill="#7FE7FF"/></g>
      <path d="M60 72l-5 9h10z" fill="#1B1026"/>
      <g class="jaw"><rect x="40" y="96" width="40" height="24" fill="#EDE6D3"/><path d="M48 92v11M56 92v11M64 92v11M72 92v11" stroke="#9C9077" stroke-width="2.5"/></g>
      <path d="M38 34l8 6-3 6" stroke="#B5AA90" stroke-width="2" fill="none" stroke-linecap="round"/>`,
    pumpkin: `
      <path d="M58 40c-2-10 2-18 9-22l4 4c-5 3-7 9-6 18z" fill="#4E7A2A"/>
      <path d="M66 26c8-6 16-4 20 2-6 0-12 1-17 5z" fill="#6FAF3A"/>
      <ellipse cx="42" cy="80" rx="22" ry="34" fill="#E8631C"/>
      <ellipse cx="78" cy="80" rx="22" ry="34" fill="#E8631C"/>
      <ellipse cx="60" cy="80" rx="22" ry="37" fill="#FF8A2A"/>
      <path d="M60 44c-6 10-6 62 0 72M42 48c-10 12-10 52 0 64M78 48c10 12 10 52 0 64" stroke="#C24E12" stroke-width="2.5" fill="none" opacity=".7"/>
      <g class="flick"><path d="M40 72l9-12 6 12zM65 72l6-12 9 12z" fill="#FFE27A"/>
      <path d="M38 88l6 8 6-6 6 8 6-8 6 8 6-6 6-6c-4 14-14 20-22 20s-18-6-22-16z" fill="#FFE27A"/>
      <path d="M40 72l9-12 6 12zM65 72l6-12 9 12z" fill="#FFB43A" opacity=".5" transform="translate(0 3)"/></g>`,
    potion: `
      <rect x="52" y="20" width="16" height="12" rx="3" fill="#A86E3C"/>
      <path d="M50 32h20v18c14 5 24 18 24 33 0 20-15 35-34 35S26 103 26 83c0-15 10-28 24-33z" fill="#BFE9F2" opacity=".45"/>
      <path class="slosh" d="M30 80c8-5 18 3 30-1s22-3 30 1c2 20-12 36-30 36S28 100 30 80z" fill="#58D6E8"/>
      <g class="look"><circle cx="60" cy="94" r="13" fill="#F6F3EE"/><g class="pupil"><circle cx="63" cy="95" r="6.5" fill="#3B2A7A"/><circle cx="64" cy="95" r="3" fill="#120A20"/>
      <circle cx="66" cy="92" r="1.6" fill="#fff"/></g>
      <path d="M47 92c-6 0-8 4-10 6M73 96c5 1 8 4 9 7" stroke="#E45A6E" stroke-width="1.6" fill="none"/></g>
      <circle class="bub" cx="44" cy="86" r="3" fill="#B6F4FF"/><circle class="bub" style="animation-delay:-.9s" cx="76" cy="84" r="2" fill="#B6F4FF"/>
      <path d="M36 66c-4 6-5 14-3 20" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".6" fill="none"/>
      <path d="M50 32h20v18c14 5 24 18 24 33 0 20-15 35-34 35S26 103 26 83c0-15 10-28 24-33z" fill="none" stroke="#E9FBFF" stroke-width="2" opacity=".7"/>`,
    cauldron: `
      <circle class="bub big" cx="46" cy="56" r="7" fill="#B57CFF" opacity=".85"/><circle class="bub big" style="animation-delay:-.7s" cx="68" cy="56" r="5" fill="#E0B8FF" opacity=".8"/><circle class="bub big" style="animation-delay:-1.4s" cx="58" cy="56" r="3.5" fill="#B57CFF" opacity=".7"/>
      <ellipse cx="60" cy="62" rx="38" ry="9" fill="#9DFF6B"/>
      <path d="M26 64c0 0-6 10-6 24 0 18 18 28 40 28s40-10 40-28c0-14-6-24-6-24z" fill="#2E2838" stroke="#8A7CA3" stroke-width="2.5"/>
      <path d="M86 70c4 6 6 12 6 18 0 12-10 20-24 24 18-2 28-12 28-24 0-7-3-13-6-18z" fill="#3A3346"/>
      <ellipse cx="60" cy="62" rx="40" ry="8" fill="none" stroke="#3A3346" stroke-width="6"/>
      <circle class="pop1" cx="48" cy="60" r="4" fill="#CFFFB2"/><circle class="pop1" style="animation-delay:-.6s" cx="70" cy="62" r="3" fill="#CFFFB2"/>
      <path d="M36 112l-6 8M84 112l6 8" stroke="#4A4258" stroke-width="6" stroke-linecap="round"/>
      <path d="M38 80c-2 6-2 12 0 16" stroke="#5B5268" stroke-width="3" stroke-linecap="round" fill="none"/>`,
    bat: `<g transform="translate(60 70) scale(1.35) translate(-60 -60)" stroke="#A58FD0" stroke-width="1.2" stroke-linejoin="round">
      <g class="wing"><path d="M60 52c-6 0-9 5-9 10l-6-4c-8-10-20-12-32-8 6 4 8 10 7 16 6-4 12-3 16 2 4-3 10-2 13 2l7 6 4 4 4-4 7-6c3-4 9-5 13-2 4-5 10-6 16-2-1-6 1-12 7-16-12-4-24-2-32 8l-6 4c0-5-3-10-9-10z" fill="#4A3868"/></g>
      <path d="M52 50l3-12 5 8 5-8 3 12" fill="#4A3868"/>
      <g class="blink"><circle cx="56" cy="62" r="3" fill="#FF4F6E"/><circle cx="64" cy="62" r="3" fill="#FF4F6E"/></g>
      <path d="M56 72l2 4 2-4 2 4 2-4" stroke="#F4F0E8" stroke-width="1.6" fill="none"/></g>`,
    // Паук на нитке: нить уходит вверх за край — висит с верхнего края рамки или сцены
    spider: `
      <path d="M60 -400V48" stroke="#D9D2E6" stroke-width="1.2" opacity=".7"/>
      <g stroke="#2A1F3A" stroke-width="3.5" stroke-linecap="round" fill="none" class="legs">
        <path d="M50 60l-16-10-6 8M50 66l-18 0-6 10M52 72l-14 10-2 12M70 60l16-10 6 8M70 66l18 0 6 10M68 72l14 10 2 12"/></g>
      <ellipse cx="60" cy="68" rx="14" ry="16" fill="#3A2D4E"/><circle cx="60" cy="52" r="9" fill="#4A3868"/>
      <g class="blink"><circle cx="56" cy="51" r="2.6" fill="#FF4F6E"/><circle cx="64" cy="51" r="2.6" fill="#FF4F6E"/></g>
      <path d="M54 66c4 3 8 3 12 0" stroke="#7B4BC4" stroke-width="2" fill="none"/>`,
  };
  const char = (id) => `<svg viewBox="0 0 120 120" overflow="visible">${CHARS[id] || CHARS.ghost}</svg>`;

  // Надпись по буквам: каждая буква в своём <span style="--i">, чтобы буквы появлялись и качались по очереди
  function letters(el, text) {
    el.textContent = '';
    el.setAttribute('aria-label', text);
    [...String(text || '')].forEach((ch, i) => {
      const s = document.createElement('span');
      s.className = 'ch';
      s.style.setProperty('--i', i);
      s.textContent = ch;   // пробел не схлопнется: у .ch white-space: pre
      el.append(s);
    });
  }

  // Готовые цвета рамки: основной, тёмный край, светлый блик, «слизь» на боках
  const FRAMES = {
    purple:  { main: '#7B4BC4', dark: '#2A1645', light: '#B48CF2', slime: '#5CF07A' },
    pumpkin: { main: '#E8701F', dark: '#4A1C06', light: '#FFB061', slime: '#7BE04A' },
    bone:    { main: '#2C2833', dark: '#0C0A10', light: '#5E5868', slime: '#5CF07A' },
    slime:   { main: '#4FC23E', dark: '#123A12', light: '#A6F57E', slime: '#B57CFF' },
  };

  // Детерминированный «случайный» шум — рамка одинаково кривая при каждой перерисовке
  function rng(seed) { return () => ((seed = (seed * 16807) % 2147483647) / 2147483647); }

  // Неровный контур по прямоугольнику со срезанными углами
  function wonkyPath(x, y, w, h, cut, wob, rnd) {
    const pts = [[x + cut, y], [x + w - cut, y], [x + w, y + cut], [x + w, y + h - cut], [x + w - cut, y + h], [x + cut, y + h], [x, y + h - cut], [x, y + cut]];
    const out = [];
    pts.forEach((p, i) => {
      const q = pts[(i + 1) % pts.length];
      const len = Math.hypot(q[0] - p[0], q[1] - p[1]);
      const n = Math.max(1, Math.round(len / 60));
      for (let k = 0; k < n; k++) {
        const t = k / n;
        const j = k === 0 ? wob * .6 : wob;
        out.push([p[0] + (q[0] - p[0]) * t + (rnd() - .5) * j, p[1] + (q[1] - p[1]) * t + (rnd() - .5) * j]);
      }
    });
    return 'M' + out.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('L') + 'Z';
  }

  // Рамка: толстая обводка с тёмным краем и бликом, пятна «слизи» на боках, капли сверху.
  // opts: { t: толщина, colors: {main,dark,light,slime}, fill: заливка внутри или '', drips: капли сверху, seed }
  function frame(svg, w, h, opts) {
    const c = opts.colors, t = opts.t, rnd = rng(opts.seed || 7);
    const pad = t / 2 + 4, cut = Math.min(w, h) * .05 + t;
    const path = wonkyPath(pad, pad, w - pad * 2, h - pad * 2, cut, Math.min(6, t * .45), rnd);
    // Пятна слизи: отрезки по левому и правому краю
    const slime = [];
    [[pad, .18], [pad, .62], [w - pad, .3], [w - pad, .74]].forEach(([sx, f]) => {
      const sy = pad + cut + (h - pad * 2 - cut * 2) * f, len = Math.min(h * .14, 90) * (.6 + rnd() * .6);
      slime.push(`<path class="slm" style="animation-delay:${(-rnd() * 3).toFixed(2)}s" d="M${sx} ${sy}v${len.toFixed(1)}" stroke="${c.slime}" stroke-width="${t * .55}" stroke-linecap="round" opacity=".9"/>`);
    });
    // Капли: свисают с верхнего края внутрь рамки
    const drips = [];
    if (opts.drips) {
      for (let i = 0; i < 4; i++) {
        const dx = pad + cut + (w - pad * 2 - cut * 2) * (.12 + i * .25 + rnd() * .08), dl = t * (1 + rnd() * 1.6);
        const by = pad + t * .4;
        drips.push(`<path class="drp" style="animation-delay:${(-rnd() * 4).toFixed(2)}s" d="M${(dx - t * .35).toFixed(1)} ${by}q0 ${dl.toFixed(1)} ${(t * .35).toFixed(1)} ${dl.toFixed(1)}t${(t * .35).toFixed(1)} -${dl.toFixed(1)}" fill="${c.main}" stroke="${c.dark}" stroke-width="2"/>`);
      }
    }
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    svg.innerHTML = `
      ${opts.fill ? `<path d="${path}" fill="${opts.fill}"/>` : ''}
      <path d="${path}" fill="none" stroke="${c.dark}" stroke-width="${t + 6}" stroke-linejoin="round"/>
      <path d="${path}" fill="none" stroke="${c.main}" stroke-width="${t}" stroke-linejoin="round"/>
      ${slime.join('')}
      <path d="${path}" fill="none" stroke="${c.light}" stroke-width="${Math.max(1.5, t * .16)}" stroke-linejoin="round" stroke-dasharray="${t * 6} ${t * 3}" opacity=".75" transform="translate(${-t * .15} ${-t * .2})"/>
      <path d="${path}" fill="none" stroke="${c.dark}" stroke-width="2" stroke-linejoin="round" opacity=".6" transform="translate(0 ${t * .35})"/>
      ${drips.join('')}`;
  }

  // Встроенный звук: «терменвокс» с вибрато + шорох ветра. kind меняет высоту и рисунок.
  let live = null;   // ctx — свой AudioContext (например, OfflineAudioContext, чтобы записать звук в файл)
  function spooky(kind, volume = .6, ctx) {
    try {
      const ac = ctx || (live = live || new AudioContext());
      const now = ac.currentTime, out = ac.createGain();
      out.gain.value = volume * .5;
      out.connect(ac.destination);
      const base = { follow: 520, sub: 330, resub: 392, gift: 660, raid: 220, bits: 440, tip: 494 }[kind] || 440;
      // Голос: синус скользит вверх-вниз, вибрато нарастает
      const osc = ac.createOscillator(), vib = ac.createOscillator(), vibG = ac.createGain(), g = ac.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(base * .6, now);
      osc.frequency.exponentialRampToValueAtTime(base * 1.25, now + .5);
      osc.frequency.exponentialRampToValueAtTime(base * .8, now + 1.4);
      vib.frequency.value = 6; vibG.gain.setValueAtTime(2, now); vibG.gain.linearRampToValueAtTime(base * .04, now + 1);
      vib.connect(vibG).connect(osc.frequency);
      g.gain.setValueAtTime(0, now); g.gain.linearRampToValueAtTime(.35, now + .25); g.gain.exponentialRampToValueAtTime(.001, now + 1.8);
      osc.connect(g).connect(out);
      // Ветер: шум через полосовой фильтр
      const len = ac.sampleRate * 1.6, buf = ac.createBuffer(1, len, ac.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      const noise = ac.createBufferSource(), bp = ac.createBiquadFilter(), ng = ac.createGain();
      noise.buffer = buf; bp.type = 'bandpass'; bp.Q.value = 3;
      bp.frequency.setValueAtTime(300, now); bp.frequency.exponentialRampToValueAtTime(1800, now + .6); bp.frequency.exponentialRampToValueAtTime(400, now + 1.5);
      ng.gain.setValueAtTime(0, now); ng.gain.linearRampToValueAtTime(.25, now + .3); ng.gain.exponentialRampToValueAtTime(.001, now + 1.6);
      noise.connect(bp).connect(ng).connect(out);
      [osc, vib, noise].forEach(n => { n.start(now); n.stop(now + 1.9); });
    } catch { /* звук не обязателен */ }
  }

  // #RRGGBB + непрозрачность 0..100 → rgba()
  function rgba(hex, opacity, fallback = 0x170C26) {
    const m = /^#?([0-9a-f]{6})$/i.exec(hex || '');
    const n = m ? parseInt(m[1], 16) : fallback;
    return `rgba(${n >> 16}, ${(n >> 8) & 255}, ${n & 255}, ${(opacity ?? 100) / 100})`;
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

  window.Witch = { char, letters, CHARS, FRAMES, frame, spooky, rgba, fill, setMedia };
})();
