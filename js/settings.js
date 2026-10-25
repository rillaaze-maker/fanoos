// تنظیمات، ظاهر، پشتیبان و فایلِ تقویم
import * as J from './jalali.js';
import { S, save, replaceAll, shiftOn, spanOf, swapsOn, personName, monthKeys, typeOf } from './store.js';
import { C, t, $, $$, esc, fa, todayKey, toast, openSheet, download, shiftText } from './ui.js';
import { icon } from './glyphs.js';
import { curMonth, shiftMonth } from './calendar.js';
import { bus } from './bus.js';
import { icsText, stamp, fold } from './ics.js';

export function applyLook() {
  const root = document.documentElement;
  let dark = S.theme === 'dark';
  if (S.theme === 'auto') dark = matchMedia('(prefers-color-scheme: dark)').matches;
  root.dataset.theme = dark ? 'dark' : 'light';
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = dark ? '#191823' : '#F6EFE2';
}
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { applyLook(); });

export function openSettings() {
  const body = openSheet('', { cls: 'settings', onClose: () => bus.refresh() });
  const seg = (group, opts, cur) => `<div class="seg">${Object.entries(opts).map(([k, l]) =>
    `<button class="${cur === k ? 'on' : ''}" data-${group}="${k}">${l}</button>`).join('')}</div>`;
  const notifOn = 'Notification' in window && Notification.permission === 'granted';

  const draw = () => {
    body.innerHTML = `
    <h2 class="sheet-title">${C.settings.title}</h2>

    <label class="lbl">${C.settings.name}</label>
    <input class="line-in" data-name value="${esc(S.me.name)}">

    <label class="lbl">${C.settings.theme}</label>
    ${seg('theme', C.settings.themes, S.theme)}

    <label class="lbl">${C.settings.types}</label>
    <p class="hint">${C.settings.typesHint}</p>
    <div class="types">${S.types.map((x, i) => `<div class="type-row" data-i="${i}">
      <input type="color" value="${x.color}" data-f="color" aria-label="رنگ">
      <input class="code-in" dir="ltr" value="${esc(x.code)}" data-f="code" aria-label="کد">
      <input class="lab-in" value="${esc(x.label)}" data-f="label" aria-label="نام">
      ${x.kind === 'off' || x.kind === 'leave' ? '' : `<input type="time" value="${x.start}" data-f="start" aria-label="شروع">
      <input type="time" value="${x.end}" data-f="end" aria-label="پایان">`}
      <button class="icon-btn" data-del="${i}" aria-label="${C.ui.delete}">${icon('x', 'xs')}</button>
    </div>`).join('')}</div>
    <button class="btn" data-act="addtype">${icon('plus', 'sm')} ${C.settings.addType}</button>

    <label class="lbl">${C.settings.notif}</label>
    <div class="list">
      <button class="li" data-act="notif" ${notifOn ? 'disabled' : ''}>
        <span class="li-ic">${icon('bell')}</span>
        <span class="li-tx"><b>${C.settings.notifTitle}</b><small>${C.settings.notifHint}</small></span>
        <em class="li-st ${notifOn ? 'on' : ''}">${notifOn ? C.settings.notifIsOn : C.settings.notifOn}</em>
      </button>
      <button class="li" data-act="ics">
        <span class="li-ic">${icon('cal')}</span>
        <span class="li-tx"><b>${C.settings.ics}</b><small>${C.settings.icsHint}</small></span>
        <span class="li-go">${icon('chevL', 'sm')}</span>
      </button>
    </div>

    <label class="lbl">${C.settings.backup}</label>
    <div class="list">
      <button class="li" data-act="export">
        <span class="li-ic">${icon('share')}</span>
        <span class="li-tx"><b>${C.settings.export}</b><small>${C.settings.backupHint}</small></span>
        <span class="li-go">${icon('chevL', 'sm')}</span>
      </button>
      <label class="li">
        <span class="li-ic">${icon('pen')}</span>
        <span class="li-tx"><b>${C.settings.import}</b><small>${C.settings.importHint}</small></span>
        <span class="li-go">${icon('chevL', 'sm')}</span>
        <input type="file" accept="application/json,.json" hidden data-import>
      </label>
    </div>
    <p class="about">${C.settings.about}</p>`;
  };

  body.oninput = (e) => {
    if (e.target.matches('[data-name]')) { S.me.name = e.target.value.trim(); save(); return; }
    const row = e.target.closest('.type-row');
    if (row && e.target.dataset.f) {
      const ty = S.types[+row.dataset.i];
      const f = e.target.dataset.f;
      const v = f === 'code' ? e.target.value.trim().toUpperCase() : e.target.value;
      if (f === 'code' && ty.code !== v && v) {
        // عوض کردنِ کد، برنامه‌ها را هم به‌روز می‌کند
        const old = ty.code;
        for (const plan of [S.plan, ...S.people.map((p) => p.plan || {})]) for (const k in plan) if (plan[k] === old) plan[k] = v;
        for (const s of S.swaps) for (const c of s.changes || []) { if (c.from === old) c.from = v; if (c.to === old) c.to = v; }
      }
      if (f !== 'code' || v) ty[f] = v;
      save();
    }
  };

  body.onclick = async (e) => {
    const tb = e.target.closest('button[data-theme]');
    if (tb) { S.theme = tb.dataset.theme; save(); applyLook(); return draw(); }
    const del = e.target.closest('[data-del]');
    if (del) { S.types.splice(+del.dataset.del, 1); save(); return draw(); }
    const a = e.target.closest('[data-act]');
    if (!a) return;
    const act = a.dataset.act;
    if (act === 'addtype') { S.types.push({ code: 'X' + S.types.length, label: 'تازه', start: '07:00', end: '13:00', kind: 'other', color: '#B8AE9C' }); save(); draw(); }
    if (act === 'notif' && 'Notification' in window) { await Notification.requestPermission(); draw(); }
    if (act === 'ics') download(`shifts-${todayKey()}.ics`, buildIcs(), 'text/calendar');
    if (act === 'export') download(`fanoos-${todayKey()}.json`, JSON.stringify(S), 'application/json');
  };

  body.onchange = async (e) => {
    if (!e.target.matches('[data-import]')) return;
    const file = e.target.files[0];
    if (!file) return;
    try {
      const obj = JSON.parse(await file.text());
      if (!obj || obj.v !== 1) throw new Error('bad');
      replaceAll(obj);
      applyLook();
      toast(C.settings.imported);
      location.reload();
    } catch (err) { toast(C.settings.badFile); }
  };
  draw();
}

// ── فایلِ تقویم (ics) — یادآوریِ مطمئن از طریقِ تقویمِ خودِ گوشی ──
function buildIcs() {
  const m = curMonth();
  const now = stamp(new Date());
  const L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//fanoos//shift//FA', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'X-WR-CALNAME:' + icsText(C.appName)];
  for (const mm of [m, shiftMonth(m, 1)]) {
    for (const k of monthKeys(mm.jy, mm.jm)) {
      const code = shiftOn('me', k);
      const sp = spanOf(k, code);
      const sws = swapsOn(k);
      if (!sp) {
        // روزی که با جابه‌جایی آزاد شده: رویدادِ قبلی را در تقویمِ گوشی لغو کن
        const old = sws.length && spanOf(k, sws[0].changes.find((c) => c.who === 'me' && c.key === k).from);
        if (old) L.push('BEGIN:VEVENT', `UID:fanoos-${k}@fanoos`, `DTSTAMP:${now}`, `SEQUENCE:${Math.floor(Date.now() / 1000)}`,
          `DTSTART:${stamp(old.start)}`, `DTEND:${stamp(old.end)}`, 'STATUS:CANCELLED', fold('SUMMARY:' + icsText(personName(sws[0].with))), 'END:VEVENT');
        continue;
      }
      let title = `${sp.type.label} (${code})`;
      if (sws.length) title += ' · ' + personName(sws[sws.length - 1].with);
      L.push('BEGIN:VEVENT', `UID:fanoos-${k}@fanoos`, `DTSTAMP:${now}`, `SEQUENCE:${Math.floor(Date.now() / 1000)}`,
        `DTSTART:${stamp(sp.start)}`, `DTEND:${stamp(sp.end)}`, fold('SUMMARY:' + icsText(title)),
        'BEGIN:VALARM', 'ACTION:DISPLAY', 'TRIGGER:-PT1H', fold('DESCRIPTION:' + icsText(t(C.notify.startSoon, { shift: sp.type.label }))), 'END:VALARM');
      if (sws.length) {
        L.push('BEGIN:VALARM', 'ACTION:DISPLAY', 'TRIGGER:-PT12H', fold('DESCRIPTION:' + icsText(title)), 'END:VALARM');
      }
      L.push('END:VEVENT');
    }
  }
  L.push('END:VCALENDAR');
  return L.join('\r\n');
}
