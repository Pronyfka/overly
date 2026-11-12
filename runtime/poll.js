// =====================================================
// Общая логика виджетов «Голосование» (опросы Twitch) — подключается после /runtime/overly.js:
//   <script src="../../runtime/poll.js"></script>
//   OverlyPoll.start({
//     show(p) { … },     // появился новый опрос — построить строки вариантов и показать карточку
//     update(p) { … },   // голоса или состояние изменились (строки те же, по порядку)
//     hide() { … },      // убрать карточку
//     tick(text) { … },  // сколько осталось: "1:05", "0:09"; "" — голосование закончилось
//   })
// p: { id, title, state: 'active' | 'ended', total, choices: [{ title, votes, pct, lead, win }] }
//   pct — доля голосов, 0–100 (целое); lead — сейчас лидирует (ничья — несколько); win — победил (после конца)
// Итоги висят столько секунд, сколько в настройке poll.hold (0 — пока стример не нажмёт «Убрать»).
// Тест из редактора (событие poll_demo) — пробное голосование: голоса прибывают сами, через 20 с итоги.
// =====================================================
(() => {
  let poll = null;     // как прислала программа
  let offset = 0;      // разница часов программы и страницы
  let S = null;
  let cbs = null;
  let shownId = null;  // какой опрос сейчас на экране
  let last = '';       // что уже отрисовано (чтобы не дёргать update без изменений)
  let demo = null;

  const now = () => Date.now() + offset;
  const pad = (n) => String(n).padStart(2, '0');

  function view(p) {
    const total = p.choices.reduce((s, c) => s + (Number(c.votes) || 0), 0);
    const max = Math.max(0, ...p.choices.map(c => Number(c.votes) || 0));
    const ended = p.state === 'ended';
    return {
      id: p.id, title: p.title || '', state: p.state, total,
      choices: p.choices.map(c => {
        const votes = Number(c.votes) || 0;
        const lead = max > 0 && votes === max;
        return { title: c.title || '', votes, pct: total ? Math.round(100 * votes / total) : 0, lead, win: ended && lead };
      }),
    };
  }

  function visible(p) {
    if (!p) return false;
    if (p.state !== 'ended') return true;
    const hold = Number(S?.['poll.hold'] ?? 15);
    return hold <= 0 || now() - (p.endedAt || now()) < hold * 1000;
  }

  function leftText(p) {
    if (!p || p.state !== 'active' || !p.endsAt) return '';
    const s = Math.max(0, Math.ceil((p.endsAt - now()) / 1000));
    return Math.floor(s / 60) + ':' + pad(s % 60);
  }

  let shownLeft = null;
  function sync() {
    if (!cbs) return;
    const p = demo || poll;
    if (!visible(p)) {
      if (shownId !== null) { shownId = null; last = ''; cbs.hide?.(); }
      return;
    }
    const v = view(p);
    const key = JSON.stringify(v);
    if (shownId !== p.id) {
      shownId = p.id; last = key; shownLeft = null;
      cbs.show?.(v);
    } else if (key !== last) {
      last = key;
      cbs.update?.(v);
    }
    const t = leftText(p);
    if (t !== shownLeft) { shownLeft = t; cbs.tick?.(t); }
  }

  // Пробное голосование для превью: голоса прибывают случайно, через 20 секунд — итоги
  function startDemo() {
    clearInterval(demo?.timer);
    const titles = ['Хоррор', 'Рогалик', 'Гонки', 'Стратегия'];
    const start = now();
    demo = {
      id: 'demo-' + start, title: 'Во что играем дальше?', state: 'active', endsAt: start + 20000, endedAt: null,
      choices: titles.map(title => ({ title, votes: 0 })),
    };
    demo.timer = setInterval(() => {
      if (demo.state === 'active') {
        if (now() >= demo.endsAt) { demo.state = 'ended'; demo.endedAt = now(); }
        else for (const c of demo.choices) c.votes += Math.floor(Math.random() * (c.title === 'Рогалик' ? 5 : 3));
      } else if (!visible(demo)) {
        clearInterval(demo.timer); demo = null;
      }
      sync();
    }, 900);
    sync();
  }

  Overly.onPoll((msg) => {
    poll = msg.poll;
    if (msg.poll?.now) offset = msg.poll.now - Date.now();
    if (poll && demo) { clearInterval(demo.timer); demo = null; }   // настоящее голосование важнее пробного
    sync();
  });
  Overly.onEvent((e) => { if (e.type === 'poll_demo') startDemo(); });
  Overly.onSettings((v) => { S = v; sync(); });
  setInterval(sync, 250);

  window.OverlyPoll = {
    start(c) { cbs = c; sync(); },
  };
})();
