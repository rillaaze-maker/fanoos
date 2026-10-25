// صفحه‌ی «جابه‌جایی»: حساب‌ها، جریانِ ثبت، و همکارها
import * as J from './jalali.js';
import { S, save, uid, shiftOn, typeOf, isWork, addSwap, removeSwap, balances, person, personName } from './store.js';
import { C, t, $, $$, esc, fa, todayKey, dayTitle, relDay, shiftText, chip, toast, openSheet, closeSheet, shareText, vibrate } from './ui.js';
import { icon, shiftGlyph, lantern, squiggle } from './glyphs.js';
import { monthGrid, curMonth, shiftMonth, openPainter } from './calendar.js';
import { bus } from './bus.js';

const OFF = 'O';

// اسمِ همکار، حتی اگر بعداً حذف شده باشد
const nameOf = (s) => (person(s.with) ? personName(s.with) : s.withName || '؟');

// ── صفحه ───────────────────────────────────────────────────────
export function renderSwaps(el) {
  const tk = todayKey();
  const bal = Object.entries(balances()).filter(([, n]) => n);
  const withKey = S.swaps.filter((s) => s.changes && s.changes.length).map((s) => ({ s, k: s.changes.find((c) => c.who === 'me').key }));
  const upcoming = withKey.filter((x) => x.k >= tk).sort((a, b) => a.k.localeCompare(b.k));
  const past = withKey.filter((x) => x.k < tk).sort((a, b) => b.k.localeCompare(a.k));

  el.innerHTML = `
  <header class="top"><h1 class="greet">${C.swap.title}</h1></header>

  <section class="card ledger">
    <div class="lbl">${C.swap.ledger}</div>
    ${bal.length ? bal.map(([id, n]) => `<div class="debt ${n > 0 ? 'plus' : 'minus'}">
        <span>${n > 0 ? t(C.swap.owesMe, { name: esc(personName(id)), n: fa(n) }) : t(C.swap.iOwe, { name: esc(personName(id)), n: fa(-n) })}</span>
        <button class="link" data-settle="${id}" data-n="${n}">${C.swap.settle}</button></div>`).join('')
      : `<p class="calm">${icon('leaf', 'sm')} ${C.swap.allClear}</p>`}
  </section>

  <button class="btn solid big-btn" data-act="new">${icon('plus', 'sm')} ${C.swap.new}</button>

  ${upcoming.length ? `<h2 class="sec">${C.swap.upcoming} ${squiggle}</h2><div class="swap-list">${upcoming.map(swapItem).join('')}</div>` : ''}
  ${!S.swaps.length ? `<p class="empty-note">${C.swap.none}</p>` : ''}
  ${past.length ? `<details class="past"><summary>${C.swap.past} (${fa(past.length)})</summary><div class="swap-list">${past.map(swapItem).join('')}</div></details>` : ''}

  <h2 class="sec">${C.swap.people} ${squiggle}</h2>
  <p class="hint">${C.swap.peopleHint}</p>
  <div class="people">
    ${S.people.map((p) => `<button class="person" data-person="${p.id}"><span class="av">${esc(p.name.slice(0, 1))}</span>${esc(p.name)}
      ${Object.keys(p.plan || {}).length ? icon('cal', 'xs') : ''}</button>`).join('')}
    <button class="person add" data-act="add-person">${icon('plus', 'sm')}</button>
  </div>`;

  el.onclick = (e) => {
    const st = e.target.closest('[data-settle]');
    if (st) {
      const n = +st.dataset.n;
      S.swaps.push({ id: uid(), kind: 'settle', with: st.dataset.settle, changes: [], debt: -n, at: Date.now() });
      save(); toast(C.swap.settled); vibrate(15);
      return bus.refresh();
    }
    const it = e.target.closest('[data-swap]');
    if (it) return openSwapDetail(it.dataset.swap);
    const p = e.target.closest('[data-person]');
    if (p) return openPerson(p.dataset.person);
    const a = e.target.closest('[data-act]');
    if (!a) return;
    if (a.dataset.act === 'new') pickDayThenSwap();
    if (a.dataset.act === 'add-person') openPerson(null);
  };
}

function swapItem({ s, k }) {
  return `<button class="swap-item card" data-swap="${s.id}">
    <span class="when">${relDay(k)}</span>
    <span class="what">${summaryText(s).split('\n').map((l, i) => (i ? l : l.replace(/^[^:]*:\s*/, ''))).join('<br>')}</span>
  </button>`;
}

// ── متنِ خلاصه و پیام ─────────────────────────────────────────
function vars(s) {
  const mine = s.changes.filter((c) => c.who === 'me');
  const a = mine[0], b = mine[1];
  const label = (c) => (typeOf(c) ? typeOf(c).label : c);
  const v = { name: esc(nameOf(s)), date: dayTitle(a.key) };
  if (s.kind === 'covered') v.shift = label(a.from);
  if (s.kind === 'trade') Object.assign(v, { shift: label(a.from), date2: dayTitle(b.key), shift2: label(b.to) });
  if (s.kind === 'same') Object.assign(v, { shift: label(a.from), shift2: label(a.to) });
  if (s.kind === 'cover') v.shift = label(a.to);
  return v;
}

export function summaryText(s) {
  const tpl = { covered: C.swap.sCovered, trade: C.swap.sTrade, same: C.swap.sSame, cover: C.swap.sCover }[s.kind];
  return tpl ? t(tpl, vars(s)) : '';
}

function messageText(s) {
  const tpl = { covered: C.swap.msgCovered, trade: C.swap.msgTrade, same: C.swap.msgSame, cover: C.swap.msgCover }[s.kind];
  const v = vars(s);
  v.name = nameOf(s); // پیام بیرون از برنامه است؛ بدونِ escape
  return t(tpl, v);
}

function openSwapDetail(id) {
  const s = S.swaps.find((x) => x.id === id);
  if (!s) return;
  const body = openSheet(`
    <h2 class="sheet-title">${esc(nameOf(s))}</h2>
    <p class="summary">${summaryText(s).replace(/\n/g, '<br>')}</p>
    <button class="btn" data-act="share">${icon('share', 'sm')} ${t(C.swap.share, { name: esc(nameOf(s)) })}</button>
    <button class="btn danger-btn" data-act="undo">${C.swap.undo}</button>`);
  body.onclick = (e) => {
    const a = e.target.closest('[data-act]');
    if (!a) return;
    if (a.dataset.act === 'share') shareText(messageText(s));
    if (a.dataset.act === 'undo') { removeSwap(id); toast(C.swap.undone); closeSheet(); bus.refresh(); }
  };
}

// ── انتخابِ روز برای جابه‌جاییِ تازه ───────────────────────────
function pickDayThenSwap() {
  let m = curMonth();
  const body = openSheet('');
  const draw = () => {
    body.innerHTML = `<h2 class="sheet-title">${C.swap.pickDay}</h2>
      <div class="month-head mini">
        <button class="icon-btn" data-nav="-1">${icon('chevR')}</button>
        <b>${J.monthNames[m.jm - 1]} ${fa(m.jy)}</b>
        <button class="icon-btn" data-nav="1">${icon('chevL')}</button>
      </div>
      ${monthGrid(m, (k) => dayCell(k, null))}`;
  };
  body.onclick = (e) => {
    const nav = e.target.closest('[data-nav]');
    if (nav) { m = shiftMonth(m, +nav.dataset.nav); return draw(); }
    const c = e.target.closest('.cell[data-key]');
    if (c) { closeSheet(); setTimeout(() => openSwapFlow(c.dataset.key), 340); }
  };
  draw();
}

// خانه‌ای که شیفتِ من و (اگر معلوم است) همکار را نشان می‌دهد
function dayCell(k, withId, mark) {
  const mine = shiftOn('me', k);
  const ty = typeOf(mine);
  const theirs = withId ? shiftOn(withId, k) : '';
  const good = mark && mark(k);
  return `<button class="cell ${k === todayKey() ? 'today' : ''} ${good ? 'good' : ''}" data-key="${k}">
    <span class="dn">${fa(J.parseKey(k).jd)}</span>
    ${mine ? `<span class="blob" style="--c:${ty ? ty.color : '#ccc'}">${esc(mine)}</span>` : ''}
    ${theirs ? `<span class="their">${esc(theirs)}</span>` : ''}
  </button>`;
}

// ── جریانِ ثبتِ جابه‌جایی ──────────────────────────────────────
export function openSwapFlow(key) {
  const f = { step: 'who', with: null, kind: null, key2: null, code2: null };
  const myCode = shiftOn('me', key);
  const working = isWork(myCode);
  const body = openSheet('', { cls: 'flow' });

  const header = () => `<div class="flow-head">${working ? shiftGlyph(typeOf(myCode).kind, 'sm') : icon('cup', 'sm')}
    <span>${dayTitle(key)} · ${myCode ? chip(myCode) : '—'}</span></div>`;

  const codePalette = (selected) => `<div class="palette">${S.types.filter((x) => isWork(x.code)).map((x) =>
    `<button class="pal ${selected === x.code ? 'on' : ''}" data-code2="${esc(x.code)}">${chip(x.code)}<small>${esc(x.label)}</small></button>`).join('')}</div>`;

  const build = () => {
    const changes = [];
    const theirs = shiftOn(f.with, key);
    let debt = 0;
    if (f.kind === 'covered') {
      changes.push({ who: 'me', key, from: myCode, to: OFF }, { who: f.with, key, from: theirs, to: myCode });
      debt = -1;
    } else if (f.kind === 'trade') {
      const mine2 = shiftOn('me', f.key2), theirs2 = shiftOn(f.with, f.key2);
      changes.push({ who: 'me', key, from: myCode, to: OFF }, { who: f.with, key, from: theirs, to: myCode },
        { who: 'me', key: f.key2, from: mine2, to: f.code2 }, { who: f.with, key: f.key2, from: theirs2, to: OFF });
    } else if (f.kind === 'same') {
      changes.push({ who: 'me', key, from: myCode, to: f.code2 }, { who: f.with, key, from: theirs, to: myCode });
    } else if (f.kind === 'cover') {
      changes.push({ who: 'me', key, from: myCode, to: f.code2 }, { who: f.with, key, from: theirs, to: OFF });
      debt = 1;
    }
    return { kind: f.kind, with: f.with, withName: personName(f.with), changes, debt };
  };

  const draw = () => {
    let h = header();
    if (f.step === 'who') {
      // اول همکارهایی که آن روز آزادند (اگر من سرِ کارم)، یا سرِ کارند (اگر من آزادم)
      const people = [...S.people].sort((a, b) => {
        const fa_ = isWork(shiftOn(a.id, key)) === working ? 1 : 0;
        const fb_ = isWork(shiftOn(b.id, key)) === working ? 1 : 0;
        return fa_ - fb_;
      });
      h += `<h2 class="sheet-title">${C.swap.withWho}</h2>
        <div class="people pick">${people.map((p) => {
          const c = shiftOn(p.id, key);
          const free = Object.keys(p.plan || {}).length && !isWork(c);
          return `<button class="person" data-with="${p.id}"><span class="av">${esc(p.name.slice(0, 1))}</span>${esc(p.name)}
            ${c ? chip(c, 'xs') : ''}${free ? `<em class="free">${C.ui.off}</em>` : ''}</button>`;
        }).join('')}</div>
        <div class="add-row"><input class="line-in" placeholder="${C.swap.addPerson}" data-newname>
          <button class="icon-btn solid" data-act="addp">${icon('plus', 'sm')}</button></div>`;
    } else if (f.step === 'kind') {
      const kinds = working ? ['covered', 'trade', 'same'] : ['cover'];
      h += `<h2 class="sheet-title">${C.swap.whatHappened}</h2>
        <div class="kinds">${kinds.map((k) => `<button class="kind card" data-kind="${k}">
          <b>${C.swap.kinds[k].t}</b><small>${C.swap.kinds[k].d}</small></button>`).join('')}</div>`;
    } else if (f.step === 'back') {
      if (!f.m) { const j = J.parseKey(key); f.m = { jy: j.jy, jm: j.jm }; }
      // روزهای خوب: من آزادم و او سرِ کار است
      const mark = (k) => k !== key && !isWork(shiftOn('me', k)) && isWork(shiftOn(f.with, k));
      h += `<h2 class="sheet-title">${C.swap.pickBackDay}</h2>
        <div class="month-head mini">
          <button class="icon-btn" data-nav="-1">${icon('chevR')}</button>
          <b>${J.monthNames[f.m.jm - 1]} ${fa(f.m.jy)}</b>
          <button class="icon-btn" data-nav="1">${icon('chevL')}</button>
        </div>
        ${monthGrid(f.m, (k) => dayCell(k, f.with, mark).replace('class="cell', `class="cell ${k === f.key2 ? 'picked' : ''}`))}
        ${f.key2 ? `<div class="lbl">${C.swap.pickShift}</div>${codePalette(f.code2)}` : ''}
        ${f.key2 && f.code2 ? `<button class="btn solid" data-act="next">${C.onboard.next}</button>` : ''}`;
    } else if (f.step === 'code') {
      h += `<h2 class="sheet-title">${C.swap.pickShift}</h2>${codePalette(f.code2)}
        ${f.code2 ? `<button class="btn solid" data-act="next">${C.onboard.next}</button>` : ''}`;
    } else if (f.step === 'summary') {
      const s = build();
      h += `<h2 class="sheet-title">${C.swap.summary}</h2>
        <p class="summary">${summaryText(s).replace(/\n/g, '<br>')}</p>
        <button class="btn solid" data-act="save">${icon('check', 'sm')} ${C.swap.save}</button>`;
    } else if (f.step === 'saved') {
      h = `<div class="saved">${lantern('happy', 'mid')}
        <p class="summary">${C.swap.saved}</p>
        <button class="btn solid" data-act="share">${icon('share', 'sm')} ${t(C.swap.share, { name: esc(personName(f.with)) })}</button>
        <button class="btn" data-act="close">${C.ui.close}</button></div>`;
    }
    body.innerHTML = h;
  };

  body.onclick = (e) => {
    const w = e.target.closest('[data-with]');
    if (w) { f.with = w.dataset.with; f.step = 'kind'; return draw(); }
    const k = e.target.closest('[data-kind]');
    if (k) {
      f.kind = k.dataset.kind;
      if (f.kind === 'covered') f.step = 'summary';
      else if (f.kind === 'trade') f.step = 'back';
      else {
        f.step = 'code';
        const theirs = shiftOn(f.with, key);
        f.code2 = isWork(theirs) ? theirs : null;
      }
      return draw();
    }
    const nav = e.target.closest('[data-nav]');
    if (nav) { f.m = shiftMonth(f.m, +nav.dataset.nav); return draw(); }
    const c = e.target.closest('.cell[data-key]');
    if (c && f.step === 'back' && c.dataset.key !== key) {
      f.key2 = c.dataset.key;
      const theirs = shiftOn(f.with, f.key2);
      f.code2 = isWork(theirs) ? theirs : (isWork(myCode) ? myCode : null);
      return draw();
    }
    const c2 = e.target.closest('[data-code2]');
    if (c2) { f.code2 = c2.dataset.code2; return draw(); }
    const a = e.target.closest('[data-act]');
    if (!a) return;
    const act = a.dataset.act;
    if (act === 'addp') {
      const inp = $('[data-newname]', body);
      const nm = inp.value.trim();
      if (!nm) return inp.focus();
      const p = { id: uid(), name: nm, plan: {} };
      S.people.push(p); save();
      f.with = p.id; f.step = 'kind';
      return draw();
    }
    if (act === 'next') { f.step = 'summary'; return draw(); }
    if (act === 'save') {
      const s = addSwap(build());
      f.saved = s;
      f.step = 'saved';
      vibrate([10, 40, 10]);
      bus.refresh();
      return draw();
    }
    if (act === 'share') return shareText(messageText(f.saved));
    if (act === 'close') closeSheet();
  };

  body.onkeydown = (e) => { if (e.key === 'Enter' && e.target.matches('[data-newname]')) $('[data-act="addp"]', body).click(); };
  draw();
}

// ── همکار ─────────────────────────────────────────────────────
export function openPerson(id) {
  let p = id ? person(id) : null;
  const body = openSheet('', { onClose: () => bus.refresh() });
  const draw = () => {
    body.innerHTML = `
      <h2 class="sheet-title">${p ? esc(p.name) : C.swap.people}</h2>
      <label class="lbl">${C.person.name}</label>
      <div class="add-row"><input class="line-in" data-name value="${p ? esc(p.name) : ''}" placeholder="${C.swap.addPerson}">
        ${p ? '' : `<button class="icon-btn solid" data-act="create">${icon('check', 'sm')}</button>`}</div>
      ${p ? `<button class="btn" data-act="plan">${icon('cal', 'sm')} ${C.person.plan}</button>
        <button class="btn danger-btn" data-act="remove">${C.person.remove}</button>` : ''}`;
  };
  body.oninput = (e) => {
    if (p && e.target.matches('[data-name]')) { p.name = e.target.value.trim() || p.name; save(); }
  };
  body.onclick = (e) => {
    const a = e.target.closest('[data-act]');
    if (!a) return;
    if (a.dataset.act === 'create') {
      const nm = $('[data-name]', body).value.trim();
      if (!nm) return;
      p = { id: uid(), name: nm, plan: {} };
      S.people.push(p); save(); draw();
    }
    if (a.dataset.act === 'plan') openPainter(p.id, curMonth());
    if (a.dataset.act === 'remove') {
      if (!confirm(C.person.removeAsk)) return;
      S.people = S.people.filter((x) => x.id !== p.id);
      save(); closeSheet();
    }
  };
  draw();
}
