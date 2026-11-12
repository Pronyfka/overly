// =====================================================
// OVERLY · общая логика виджета «Музыка» (подключается после overly.js)
//   OverlyMusic.watch({ show, hide, track, tick })
//     show()            — виджет должен появиться (пошла музыка)
//     hide()            — спрятаться (пауза, Яндекс Музыка закрыта)
//     track(m, first)   — сменился трек (first — показ с нуля, в т.ч. после паузы): { title, artist, album, cover }
//     tick(pos, dur)    — каждые ~100 мс: позиция и длительность в секундах (для полосы и времени)
//     mini(on, instant) — свернуться в мини-версию / развернуться (instant — без анимации, виджет скрыт)
// Мини-версия: через music.miniAfter секунд после появления или смены трека (если включено music.mini).
//   OverlyMusic.time(sec) → «3:07»
//   OverlyMusic.miniShift(d) → на сколько сдвинуть верх свёрнутой полоски, если она ниже полной на d
//                              (music.miniAnchor: top — прижата к верху, bottom — к низу, center — по центру)
// В превью редактора, пока ничего не играет, показывается пример трека — чтобы было что настраивать.
// =====================================================
(() => {
  const DEMO = { playing: true, title: 'Название трека', artist: 'Исполнитель', album: '', cover: null, position: 48, duration: 196, demo: true };

  function time(sec) {
    sec = Math.max(0, Math.floor(sec || 0));
    return Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0');
  }

  function watch(ui) {
    let cur = null, shown = false, key = '', hideOnPause = true;
    let miniOn = false, miniAfter = 10, small = false, timer = 0, anchor = 'center';
    // Пока музыка играет, позиция растёт сама: от последнего снимка + прошедшее время
    const pos = () => !cur ? 0 : cur.playing ? cur.position + (Date.now() - (cur.at || Date.now())) / 1000 : cur.position;

    function setMini(on, instant) {
      if (on === small || !ui.mini) return;
      small = on; ui.mini(on, instant);
    }
    // Полная версия сейчас, мини — через miniAfter секунд
    function arm() {
      clearTimeout(timer);
      setMini(false);
      if (miniOn && shown) timer = setTimeout(() => setMini(true), miniAfter * 1000);
    }

    function apply(m) {
      // В превью виджет виден всегда: на паузе — текущий трек, без музыки — пример
      if (Overly.preview && !m.playing && !m.title) m = { ...DEMO, at: Date.now() };
      cur = m;
      const visible = m.playing || Overly.preview || (!hideOnPause && !!m.title);
      if (!visible) { if (shown) { shown = false; clearTimeout(timer); ui.hide(); setTimeout(() => { if (!shown) setMini(false, true); }, 600); } return; }
      const k = m.title + '\u0001' + m.artist + '\u0001' + m.cover;
      const changed = k !== key, first = !shown;
      // После скрытия виджет показывается с нуля — содержимое заполняется заново, даже если трек тот же
      if (changed || first) { if (!first) setMini(false); key = k; ui.track(m, first); }
      if (first) { shown = true; ui.show(); }
      if (changed || first) arm();
    }

    Overly.onSettings(v => {
      hideOnPause = v['music.hideOnPause'] !== false;
      const on = !!v['music.mini'], after = +v['music.miniAfter'] || 10;
      const re = on !== miniOn || after !== miniAfter || v['music.miniAnchor'] !== anchor;
      miniOn = on; miniAfter = after; anchor = miniAnchor = v['music.miniAnchor'] || 'center';
      if (cur) apply(cur);
      if (re) arm();   // поменяли настройку — показать полную версию и свернуть заново
    });
    Overly.onMusic(apply);
    // Тема в демо (или музыка ещё не пришла) — данных о треке нет вовсе. В превью всё равно показываем пример
    if (Overly.preview) setTimeout(() => { if (!cur) apply({ playing: false }); }, 700);
    setInterval(() => { if (cur && shown) ui.tick(Math.min(pos(), cur.duration || Infinity), cur.duration || 0); }, 100);
  }

  let miniAnchor = 'center';
  const miniShift = (d) => miniAnchor === 'top' ? 0 : miniAnchor === 'bottom' ? d : d / 2;

  window.OverlyMusic = { watch, time, miniShift };
})();
