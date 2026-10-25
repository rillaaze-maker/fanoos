// تقویمِ گوشی و Google Calendar
import * as J from './jalali.js';
import { spanOf, typeOf, personName } from './store.js';
import { C, t, dayTitle } from './ui.js';
import { icon } from './glyphs.js';

export const icsText = (s) => String(s).replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/([,;])/g, '\\$1');
const pad = (n) => String(n).padStart(2, '0');
const ymd = (d) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
export const stamp = (d) => `${ymd(d)}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
export const fold = (line) => { const out = []; while (line.length > 60) { out.push(line.slice(0, 60)); line = ' ' + line.slice(60); } out.push(line); return out.join('\r\n'); };

// رویدادهای یک جابه‌جایی برای خودم: روزهای کاری با ساعت، روزهای آزادشده تمام‌روز
export function swapEvents(s) {
  const nm = personName(s.with);
  return s.changes.filter((c) => c.who === 'me').map((c) => {
    const sp = spanOf(c.key, c.to);
    if (sp) {
      return { key: c.key, title: `${sp.type.label} (${c.to}) · ${t(C.now.insteadOf, { name: nm })}`, start: sp.start, end: sp.end };
    }
    const d = J.dateOfKey(c.key), e = new Date(d);
    e.setDate(e.getDate() + 1);
    return { key: c.key, title: `${(typeOf(c.to) || {}).label || C.ui.off} · ${t(C.now.coveredBy, { name: nm })}`, start: d, end: e, allDay: true };
  });
}

export function gcalUrl(ev) {
  const dates = ev.allDay ? `${ymd(ev.start)}/${ymd(ev.end)}` : `${stamp(ev.start)}/${stamp(ev.end)}`;
  const q = new URLSearchParams({ action: 'TEMPLATE', text: ev.title, dates, ctz: 'Asia/Tehran', details: C.appName });
  return 'https://calendar.google.com/calendar/render?' + q.toString();
}

export function icsFile(events, uidBase) {
  const now = stamp(new Date());
  const L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//fanoos//shift//FA', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH'];
  for (const ev of events) {
    L.push('BEGIN:VEVENT', `UID:${uidBase}-${ev.key}@fanoos`, `DTSTAMP:${now}`,
      ev.allDay ? `DTSTART;VALUE=DATE:${ymd(ev.start)}` : `DTSTART:${stamp(ev.start)}`,
      ev.allDay ? `DTEND;VALUE=DATE:${ymd(ev.end)}` : `DTEND:${stamp(ev.end)}`,
      fold('SUMMARY:' + icsText(ev.title)));
    if (!ev.allDay) {
      L.push('BEGIN:VALARM', 'ACTION:DISPLAY', 'TRIGGER:-PT12H', fold('DESCRIPTION:' + icsText(ev.title)), 'END:VALARM',
        'BEGIN:VALARM', 'ACTION:DISPLAY', 'TRIGGER:-PT1H', fold('DESCRIPTION:' + icsText(ev.title)), 'END:VALARM');
    }
    L.push('END:VEVENT');
  }
  L.push('END:VCALENDAR');
  return L.join('\r\n');
}

// دکمه‌های افزودن به تقویم برای یک جابه‌جایی
export function calButtons(s) {
  const evs = swapEvents(s);
  return `<div class="cal-btns">
    ${evs.map((ev) => `<a class="btn" href="${gcalUrl(ev)}" target="_blank" rel="noopener">${icon('cal', 'sm')}<span><bdi>Google Calendar</bdi> · ${dayTitle(ev.key, false)}</span></a>`).join('')}
    <button class="btn" data-act="phonecal">${icon('phone', 'sm')}<span>${C.swap.phoneCal}</span></button>
  </div>`;
}
