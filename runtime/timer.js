// =====================================================
// Общая логика виджетов «Таймер марафона» — подключается после /runtime/overly.js:
//   <script src="../../runtime/timer.js"></script>
//   OverlyTimer.start({
//     render(text, info) { … },   // text: "1:05:09" / "05:09"; info: { state, left }
//     added(a) { … },             // { seconds, type, name, text: "+5:00" } — кто-то продлил таймер
//   })
// state: idle (ещё не запускали — показываем стартовое время из настроек этой темы),
//        running | paused | done (дошёл до нуля).
// Отсчёт виджет ведёт сам (4 раза в секунду), программа присылает только конец отсчёта.
// =====================================================
(() => {
  let t = null;        // { state, left, endsAt, now } от программы
  let offset = 0;      // разница часов программы и страницы (на одном компьютере — почти 0)
  let S = null;
  let cbs = null;
  let shown = '';

  const pad = (n) => String(n).padStart(2, '0');
  function fmt(ms) {
    const total = Math.max(0, Math.ceil(ms / 1000));
    const h = Math.floor(total / 3600), m = Math.floor(total % 3600 / 60), s = total % 60;
    return (h ? h + ':' + pad(m) : pad(m)) + ':' + pad(s);
  }

  function left() {
    if (!t || t.state === 'idle') return Math.max(0, Number(S?.['timer.start']) || 0) * 60000;
    if (t.state === 'running') return Math.max(0, t.endsAt - (Date.now() + offset));
    return t.left;
  }

  function state() {
    if (!t) return 'idle';
    if (t.state === 'running' && left() <= 0) return 'done';
    return t.state;
  }

  function tick(force) {
    if (!cbs) return;
    const ms = left(), st = state(), text = fmt(ms);
    if (!force && text + st === shown) return;
    shown = text + st;
    cbs.render(text, { state: st, left: ms });
  }

  Overly.onTimer((msg) => {
    t = msg.timer;
    offset = (msg.timer.now || Date.now()) - Date.now();
    tick(true);
    const a = msg.added;
    if (a && a.seconds && cbs?.added) cbs.added({ ...a, text: (a.seconds < 0 ? '−' : '+') + fmt(Math.abs(a.seconds) * 1000) });
  });
  Overly.onSettings((v) => { S = v; tick(true); });
  setInterval(() => tick(false), 250);

  window.OverlyTimer = {
    fmt,
    start(c) { cbs = c; tick(true); },
  };
})();
