// صفحه‌ی «تقویم»، برگه‌ی روز، و واردکردنِ برنامه
import * as J from './jalali.js';
import { S, save, shiftOn, paperShift, typeOf, isWork, swapsOn, removeSwap, personName, monthHours, monthKeys, parseRow, ensureType, person } from './store.js';
import { C, t, $, $$, esc, fa, todayKey, dayTitle, shiftText, chip, toast, openSheet, closeSheet } from './ui.js';
import { icon, weather, shiftGlyph, ring, squiggle } from './glyphs.js';
import { openSwapFlow } from './swaps.js';
import { bus } from './bus.js';

let cur = null; // {jy, jm}

export function curMonth() {
  if (!cur) { const j = J.toJalali(new Date()); cur = { jy: j.jy, jm: j.jm }; }
  return cur;
}

export function shiftMonth(m, n) {
  let jm = m.jm + n, jy = m.jy;
  while (jm > 12) { jm -= 12; jy++; }
  while (jm < 1) { jm += 12; jy--; }
  return { jy, jm };
}

// شبکه‌ی ماه؛ cell(key) محتوای هر خانه را می‌سازد
export function monthGrid(m, cell, cls = '') {
  const keys = monthKeys(m.jy, m.jm);
  const lead = J.weekdayOf(J.dateOfKey(keys[0]));
  let html = `<div class="grid ${cls}">` + J.weekdayShort.map((w, i) => `<div class="wdh ${i === 6 ? 'fri' : ''}">${w}</div>`).join('');
  for (let i = 0; i < lead; i++) html += '<div class="cell blank"></div>';
  for (const k of keys) html += cell(k);
  return html + '</div>';
}

function myCell(k) {
  const code = shiftOn('me', k);
  const ty = typeOf(code);
  const tk = todayKey();
  const swapped = swapsOn(k).length > 0;
  const mood = S.moods[k];
  const fri = J.weekdayOf(J.dateOfKey(k)) === 6;
  return `<button class="cell ${k === tk ? 'today' : ''} ${k < tk ? 'past' : ''} ${fri ? 'fri' : ''} ${swapped ? 'swapped' : ''}" data-key="${k}">
    <span class="dn">${fa(J.parseKey(k).jd)}</span>
    ${k === tk ? ring : ''}
    ${code ? `<span class="blob" style="--c:${ty ? ty.color : '#ccc'}">${esc(code)}</span>` : ''}
    ${swapped ? `<span class="sw">${icon('swap')}</span>` : ''}
    ${mood ? `<span class="mw">${weather(mood.w)}</span>` : ''}
    ${S.notes[k] ? '<i class="note-dot"></i>' : ''}
  </button>`;
}

export function renderCalendar(el) {
  const m = curMonth();
  const hours = monthHours(m.jy, m.jm);
  const paperH = monthHours(m.jy, m.jm, 'me', true);
  const keys = monthKeys(m.jy, m.jm);
  const empty = !keys.some((k) => paperShift('me', k));

  const counts = {};
  for (const k of keys) { const c = shiftOn('me', k); if (isWork(c)) counts[c] = (counts[c] || 0) + 1; }

  el.innerHTML = `
  <header class="top month-head">
    <button class="icon-btn" data-nav="-1" aria-label="ماهِ قبل">${icon('chevR')}</button>
    <h1 class="month-title">${J.monthNames[m.jm - 1]} <small>${fa(m.jy)}</small></h1>
    <button class="icon-btn" data-nav="1" aria-label="ماهِ بعد">${icon('chevL')}</button>
  </header>
  <section class="card cal-card">${monthGrid(m, myCell)}</section>
  ${empty ? `<p class="empty-note">${C.cal.noPlan}</p>` : ''}
  <button class="btn ${empty ? 'solid' : ''}" data-act="fill">${icon('pen', 'sm')} ${C.cal.fill}</button>
  <section class="card hours">
    <div class="lbl">${C.cal.hours}</div>
    <div class="hours-big">${fa(hours)}</div>
    ${paperH !== hours ? `<div class="hours-paper">${t(C.cal.paperHours, { h: fa(paperH) })}</div>` : ''}
    <div class="counts">${Object.entries(counts).map(([c, n]) => `<span>${chip(c)} × ${fa(n)}</span>`).join('')}</div>
  </section>`;

  el.onclick = (e) => {
    const nav = e.target.closest('[data-nav]');
    if (nav) { cur = shiftMonth(m, +nav.dataset.nav); return bus.refresh(); }
    const c = e.target.closest('.cell[data-key]');
    if (c) return openDay(c.dataset.key);
    if (e.target.closest('[data-act="fill"]')) openPainter('me', m);
  };

  // کشیدنِ افقی برای ماهِ بعد/قبل (در راست‌به‌چپ، ماهِ بعد سمتِ چپ است)
  let x0 = null, y0 = null;
  const card = $('.cal-card', el);
  card.ontouchstart = (e) => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; };
  card.ontouchend = (e) => {
    if (x0 == null) return;
    const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
    x0 = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) { cur = shiftMonth(m, dx > 0 ? 1 : -1); bus.refresh(); }
  };
}

// ── برگه‌ی یک روز ─────────────────────────────────────────────
export function openDay(key) {
  const body = openSheet('', { cls: 'day-sheet' });
  const draw = () => {
    const code = shiftOn('me', key);
    const paper = paperShift('me', key);
    const ty = typeOf(code);
    const sws = swapsOn(key);
    const tk = todayKey();
    const m = S.moods[key];
    const team = S.people.filter((p) => Object.keys(p.plan || {}).length);

    body.innerHTML = `
      <h2 class="sheet-title">${dayTitle(key)}</h2>
      <div class="day-shift" style="--c:${ty ? ty.color : 'var(--line)'}">
        <div class="glyph-big">${ty ? shiftGlyph(ty.kind) : icon('cal')}</div>
        <div>
          <div class="big">${ty ? esc(ty.label) : '—'} ${code ? chip(code) : ''}</div>
          ${ty && ty.start ? `<div class="time">${shiftText(code).split(' · ')[1]}</div>` : ''}
          ${sws.length && paper !== code ? `<div class="paper">${t(C.day.paper, { shift: paper ? esc(paper) : '—' })}</div>` : ''}
        </div>
      </div>
      ${sws.map((s) => `<div class="swap-row">${icon('swap', 'sm')}<span>${esc(personName(s.with))}</span>
        <button class="link danger" data-undo="${s.id}">${C.swap.undo}</button></div>`).join('')}
      <div class="row2">
        <button class="btn solid" data-act="swap">${icon('swap', 'sm')} ${C.day.swap}</button>
        <button class="btn" data-act="change">${icon('pen', 'sm')} ${C.day.change}</button>
      </div>
      <div class="palette hidden" data-palette>
        ${S.types.map((x) => `<button class="pal" data-code="${esc(x.code)}" style="--c:${x.color}">${chip(x.code)}<small>${esc(x.label)}</small></button>`).join('')}
        <button class="pal" data-code=""><span class="code empty">—</span><small>${C.cal.eraser}</small></button>
      </div>
      ${key <= tk ? `<div class="lbl">${C.mood.ask}</div><div class="wx-row">${Object.entries(C.mood.weathers).map(([k, l]) =>
        `<button class="wx ${m && m.w === k ? 'on' : ''}" data-mood="${k}">${weather(k)}<span>${l}</span></button>`).join('')}</div>` : ''}
      <textarea class="note" rows="2" placeholder="${C.day.note}">${esc(S.notes[key] || '')}</textarea>
      ${team.length ? whoBlock(key, team) : ''}
    `;

    body.onclick = (e) => {
      const u = e.target.closest('[data-undo]');
      if (u) { removeSwap(u.dataset.undo); toast(C.swap.undone); bus.refresh(); return draw(); }
      const md = e.target.closest('[data-mood]');
      if (md) { S.moods[key] = { ...(S.moods[key] || {}), w: md.dataset.mood }; save(); bus.refresh(); return draw(); }
      const pc = e.target.closest('[data-code]');
      if (pc) {
        if (pc.dataset.code) S.plan[key] = pc.dataset.code; else delete S.plan[key];
        save(); bus.refresh(); return draw();
      }
      const a = e.target.closest('[data-act]');
      if (!a) return;
      if (a.dataset.act === 'swap') { closeSheet(); setTimeout(() => openSwapFlow(key), 340); }
      if (a.dataset.act === 'change') $('[data-palette]', body).classList.toggle('hidden');
    };
    const ta = $('.note', body);
    ta.oninput = () => { if (ta.value.trim()) S.notes[key] = ta.value; else delete S.notes[key]; save(); };
    ta.onblur = () => bus.refresh();
  };
  draw();
}

function whoBlock(key, team) {
  const work = [], free = [];
  for (const p of team) {
    const c = shiftOn(p.id, key);
    (isWork(c) ? work : free).push(`<span class="who">${esc(p.name)} ${c ? chip(c, 'xs') : ''}</span>`);
  }
  return `<div class="lbl">${C.day.whoWorks}</div><div class="whos">${work.join('') || '—'}</div>
    <div class="lbl">${C.day.whoFree}</div><div class="whos">${free.join('') || '—'}</div>`;
}

// ── واردکردنِ برنامه‌ی یک ماه (برای خودم یا یک همکار) ─────────
export function openPainter(who, start) {
  let m = { ...start };
  let sel = S.types[0] ? S.types[0].code : '';
  const plan = () => (who === 'me' ? S.plan : person(who).plan);
  const body = openSheet('', { cls: 'painter', onClose: () => bus.refresh() });

  const draw = () => {
    const title = who === 'me' ? C.cal.fill : esc(person(who).name);
    body.innerHTML = `
      <h2 class="sheet-title">${title}</h2>
      <p class="hint">${C.cal.fillHint}</p>
      <div class="palette sticky">
        ${S.types.map((x) => `<button class="pal ${sel === x.code ? 'on' : ''}" data-sel="${esc(x.code)}">${chip(x.code)}<small>${esc(x.label)}</small></button>`).join('')}
        <button class="pal ${sel === '' ? 'on' : ''}" data-sel=""><span class="code empty">—</span><small>${C.cal.eraser}</small></button>
      </div>
      <div class="month-head mini">
        <button class="icon-btn" data-nav="-1">${icon('chevR')}</button>
        <b>${J.monthNames[m.jm - 1]} ${fa(m.jy)}</b>
        <button class="icon-btn" data-nav="1">${icon('chevL')}</button>
      </div>
      ${monthGrid(m, (k) => {
        const c = plan()[k] || '';
        const ty = typeOf(c);
        const fri = J.weekdayOf(J.dateOfKey(k)) === 6;
        return `<button class="cell ${fri ? 'fri' : ''}" data-key="${k}"><span class="dn">${fa(J.parseKey(k).jd)}</span>
          ${c ? `<span class="blob" style="--c:${ty ? ty.color : '#ccc'}">${esc(c)}</span>` : ''}</button>`;
      }, 'paint')}
      <details class="paste">
        <summary>${C.cal.paste}</summary>
        <p class="hint">${C.cal.pasteHint}</p>
        <textarea dir="ltr" rows="3" placeholder="${C.cal.pasteExample}"></textarea>
        <button class="btn" data-act="paste">${icon('check', 'sm')} ${C.ui.save}</button>
      </details>
      <button class="btn solid" data-act="done">${C.cal.done}</button>`;
  };

  body.onclick = (e) => {
    const s = e.target.closest('[data-sel]');
    if (s) { sel = s.dataset.sel; $$('.pal', body).forEach((b) => b.classList.toggle('on', b.dataset.sel === sel)); return; }
    const nav = e.target.closest('[data-nav]');
    if (nav) { m = shiftMonth(m, +nav.dataset.nav); return draw(); }
    const c = e.target.closest('.cell[data-key]');
    if (c) {
      const k = c.dataset.key;
      if (sel) plan()[k] = sel; else delete plan()[k];
      save();
      const ty = typeOf(sel);
      const old = $('.blob', c);
      if (old) old.remove();
      if (sel) c.insertAdjacentHTML('beforeend', `<span class="blob pop" style="--c:${ty ? ty.color : '#ccc'}">${esc(sel)}</span>`);
      return;
    }
    const a = e.target.closest('[data-act]');
    if (!a) return;
    if (a.dataset.act === 'paste') {
      const { out, unknown } = parseRow($('.paste textarea', body).value, m.jy, m.jm);
      for (const k of monthKeys(m.jy, m.jm)) delete plan()[k];
      Object.assign(plan(), out);
      for (const u of unknown) if (ensureType(u)) toast(t(C.cal.unknownCode, { code: u }), 4500);
      save();
      draw();
    }
    if (a.dataset.act === 'done') closeSheet();
  };
  draw();
}
