// ابزارهای کوچکِ رابط
import { C, t } from './copy.js';
import * as J from './jalali.js';
import { S, typeOf } from './store.js';
import { icon } from './glyphs.js';

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// رقم‌های فارسی (فونت‌ها FaNum هستند، ولی این‌طوری مطمئن‌تریم)
export const fa = (x) => String(x).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[d]).replace(/\./g, '٫');

export const vibrate = (p) => { try { navigator.vibrate && navigator.vibrate(p); } catch (e) { /* */ } };

// ── تاریخ ─────────────────────────────────────────────────────
export const todayKey = () => J.keyOf(new Date());

export function dayTitle(key, withWeekday = true) {
  const { jm, jd } = J.parseKey(key);
  const wd = J.weekdayNames[J.weekdayOf(J.dateOfKey(key))];
  return (withWeekday ? wd + ' ' : '') + fa(jd) + ' ' + J.monthNames[jm - 1];
}

export function relDay(key) {
  const tk = todayKey();
  if (key === tk) return C.ui.today;
  if (key === J.addDays(tk, 1)) return C.ui.tomorrow;
  if (key === J.addDays(tk, -1)) return C.ui.yesterday;
  return dayTitle(key);
}

export function durationText(ms) {
  const m = Math.max(0, Math.round(ms / 60000));
  const h = Math.floor(m / 60), r = m % 60;
  const parts = [];
  if (h) parts.push(fa(h) + ' ' + C.ui.hour);
  if (r || !h) parts.push(fa(r) + ' ' + C.ui.minute);
  return parts.join(C.ui.and);
}

const hhmm = (s) => { const [h, m] = s.split(':').map(Number); return m ? fa(h) + ':' + fa(String(m).padStart(2, '0')) : fa(h); };

// «صبح و عصر · ۷ تا ۱۹»
export function shiftText(code, withTime = true) {
  if (!code) return '';
  const ty = typeOf(code);
  if (!ty) return code;
  if (!withTime || !ty.start) return ty.label;
  return `${ty.label} · ${hhmm(ty.start)} ${C.ui.to} ${hhmm(ty.end)}`;
}

// رنگِ نوشته روی رنگِ شیفت
export function inkOn(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return (0.299 * r + 0.587 * g + 0.114 * b) > 150 ? '#2A2633' : '#FFF8EC';
}

export function chip(code, cls = '') {
  const ty = typeOf(code);
  const bg = ty ? ty.color : '#ccc';
  return `<span class="code ${cls}" style="--c:${bg};--ci:${inkOn(bg)}">${esc(code)}</span>`;
}

// جمله‌ی ثابت برای هر روز
export function pick(arr, seed) {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return arr[h % arr.length];
}

export const name = () => S.me.name || '';

// ── نوشتن مثل جوهر: کلمه‌به‌کلمه ────────────────────────────────
export function inkWords(text, delay = 0) {
  let i = 0;
  return esc(text).split('\n').map((line) =>
    line.split(' ').map((w) => `<span class="w" style="animation-delay:${delay + (i++) * 110}ms">${w}</span>`).join(' ')
  ).join('<br>');
}

// ── برگه‌ی پایین (sheet) ──────────────────────────────────────
let sheetStack = [];

export function openSheet(html, { onClose, cls = '' } = {}) {
  const wrap = document.createElement('div');
  wrap.className = 'sheet-wrap';
  wrap.innerHTML = `<div class="sheet-bg"></div><section class="sheet ${cls}" role="dialog" aria-modal="true">
    <button class="sheet-x" aria-label="${C.ui.close}">${icon('x')}</button>
    <div class="sheet-body">${html}</div></section>`;
  document.body.appendChild(wrap);
  requestAnimationFrame(() => wrap.classList.add('open'));
  const entry = { wrap, onClose };
  sheetStack.push(entry);
  history.pushState({ sheet: sheetStack.length }, '');
  $('.sheet-bg', wrap).onclick = () => history.back();
  $('.sheet-x', wrap).onclick = () => history.back();
  return $('.sheet-body', wrap);
}

function dropTopSheet() {
  const e = sheetStack.pop();
  if (!e) return;
  e.wrap.classList.remove('open');
  setTimeout(() => e.wrap.remove(), 320);
  e.onClose && e.onClose();
}

// دکمه‌ی «برگشت» گوشی برگه را می‌بندد
window.addEventListener('popstate', (e) => {
  const depth = (e.state && e.state.sheet) || 0;
  while (sheetStack.length > depth) dropTopSheet();
});

export function closeSheet() { if (sheetStack.length) history.back(); }
export function closeAllSheets() { const n = sheetStack.length; if (n) history.go(-n); }

export function toast(msg, ms = 2600) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 400); }, ms);
}

export async function shareText(text) {
  if (navigator.share) {
    try { await navigator.share({ text }); return; } catch (e) { if (e.name === 'AbortError') return; }
  }
  try { await navigator.clipboard.writeText(text); toast('کپی شد.'); } catch (e) { toast(text, 6000); }
}

export function download(filename, text, type) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1000);
}

export { C, t };
