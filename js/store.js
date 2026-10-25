// وضعیتِ برنامه — همه‌چیز در localStorage همین گوشی
import * as J from './jalali.js';

const KEY = 'fanoos.v1';

// کدها همان کدهای برنامه‌ی کاغذی‌اند. kind برای شکل و رنگ استفاده می‌شود.
export const DEFAULT_TYPES = [
  { code: 'M', label: 'صبح', start: '07:00', end: '13:00', kind: 'morning', color: '#F4C04E' },
  { code: 'M2', label: 'صبح تا ۲', start: '07:00', end: '14:00', kind: 'morning', color: '#F2B53A' },
  { code: 'M4', label: 'صبح تا ۴', start: '07:00', end: '16:00', kind: 'morning', color: '#EBA23A' },
  { code: 'A', label: 'عصر', start: '13:00', end: '19:00', kind: 'evening', color: '#E9805E' },
  { code: 'MA', label: 'صبح و عصر', start: '07:00', end: '19:00', kind: 'long', color: '#E57B4C' },
  { code: 'N', label: 'شب', start: '19:00', end: '07:00', kind: 'night', color: '#4F55A8' },
  { code: 'AN', label: 'عصر و شب', start: '13:00', end: '07:00', kind: 'night', color: '#5E4D9E' },
  { code: 'MAN', label: '۲۴ ساعته', start: '07:00', end: '07:00', kind: 'full', color: '#7A3F7C' },
  { code: 'CA', label: 'CA · ۱۲ ساعته', start: '07:00', end: '19:00', kind: 'long', color: '#C98A6B' },
  { code: 'CAN', label: 'CAN · ۲۴ ساعته', start: '07:00', end: '07:00', kind: 'full', color: '#8E5A7E' },
  { code: 'O', label: 'استراحت', start: '', end: '', kind: 'off', color: '#86C2AD' },
  { code: 'H', label: 'مرخصی', start: '', end: '', kind: 'leave', color: '#86B2DD' },
];

const defaults = () => ({
  v: 1,
  me: { name: '' },
  theme: 'auto',
  types: DEFAULT_TYPES.map((x) => ({ ...x })),
  plan: {},          // برنامه‌ی کاغذیِ خودم {key: code}
  people: [],        // [{id, name, plan}]
  swaps: [],         // [{id, kind, with, changes:[{who,key,from,to}], debt, at}]
  notes: {},         // {key: text}
  moods: {},         // {key: {w, line}}
  doodles: {},       // {key: [[x,y,x,y…], …]}
  light: [],         // [{at, text}]
  anchor: '',       // جمله‌ی لنگر؛ خودش انتخاب می‌کند
  line: '',         // جمله‌ی بالای «امروز»؛ '*' یعنی هر روز یکی تازه
  homeRitual: 0,
  signs: {},         // {'1405-08': [indices]}
  grief: null,       // {key, time}
  fired: {},         // اعلان‌های فرستاده‌شده
});

export let S = load();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const st = { ...defaults(), ...JSON.parse(raw) };
      // شیفت‌های پیش‌فرضِ تازه را به نسخه‌های قدیمی اضافه کن
      for (const t of DEFAULT_TYPES) if (!st.types.some((x) => x.code === t.code)) st.types.push({ ...t });
      return st;
    }
  } catch (e) { /* حافظه در دسترس نیست */ }
  return defaults();
}

export function save() {
  try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* پر یا مسدود */ }
}

export function replaceAll(obj) {
  S = { ...defaults(), ...obj };
  save();
}

export const uid = () => Math.random().toString(36).slice(2, 9);

// ── شیفت‌ها ───────────────────────────────────────────────────
export const typeOf = (code) => S.types.find((t) => t.code === code);

const mins = (hhmm) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + (m || 0); };

// طول شیفت به دقیقه؛ پایانِ کوچک‌تر یا مساوی یعنی روزِ بعد
export function lengthMin(type) {
  if (!type || !type.start || !type.end) return 0;
  let d = mins(type.end) - mins(type.start);
  if (d <= 0) d += 24 * 60;
  return d;
}
export const hoursOf = (code) => lengthMin(typeOf(code)) / 60;
export const isWork = (code) => !!code && hoursOf(code) > 0;

export function ensureType(code) {
  if (typeOf(code)) return false;
  S.types.push({ code, label: code, start: '', end: '', kind: 'other', color: '#B8AE9C' });
  return true;
}

// بازه‌ی زمانیِ شیفت در یک روز
export function spanOf(key, code) {
  const t = typeOf(code);
  if (!t || !lengthMin(t)) return null;
  const s = J.dateOfKey(key);
  const [h, m] = t.start.split(':').map(Number);
  s.setHours(h, m || 0, 0, 0);
  return { start: s, end: new Date(s.getTime() + lengthMin(t) * 60000), type: t };
}

// ── برنامه‌ی واقعی = کاغذی + جابه‌جایی‌ها ─────────────────────
const basePlan = (who) => (who === 'me' ? S.plan : (S.people.find((p) => p.id === who) || {}).plan || {});

export function paperShift(who, key) { return basePlan(who)[key] || ''; }

export function shiftOn(who, key) {
  let code = paperShift(who, key);
  for (const s of S.swaps) for (const c of s.changes || []) if (c.who === who && c.key === key) code = c.to;
  return code;
}

export function swapsOn(key, who = 'me') {
  return S.swaps.filter((s) => (s.changes || []).some((c) => c.key === key && c.who === who));
}

export const person = (id) => S.people.find((p) => p.id === id);
export const personName = (id) =>
  (person(id) || {}).name || (S.swaps.find((s) => s.with === id && s.withName) || {}).withName || '؟';

// مثبت یعنی او به من بدهکار است
export function balances() {
  const b = {};
  for (const s of S.swaps) if (s.with && s.debt) b[s.with] = (b[s.with] || 0) + s.debt;
  return b;
}

export function addSwap(sw) {
  sw.id = uid();
  sw.at = Date.now();
  S.swaps.push(sw);
  save();
  return sw;
}

export function removeSwap(id) {
  S.swaps = S.swaps.filter((s) => s.id !== id);
  save();
}

// ── ماه ───────────────────────────────────────────────────────
export function monthKeys(jy, jm) {
  const n = J.monthLength(jy, jm);
  return Array.from({ length: n }, (_, i) => J.key(jy, jm, i + 1));
}

export function monthHours(jy, jm, who = 'me', paper = false) {
  let h = 0;
  for (const k of monthKeys(jy, jm)) h += hoursOf(paper ? paperShift(who, k) : shiftOn(who, k));
  return Math.round(h * 10) / 10;
}

// خواندنِ یک ردیف از جدول: «- MA M4 O …»
export function parseRow(text, jy, jm) {
  const tokens = text.trim().toUpperCase().replace(/[،,]/g, ' ').split(/\s+/).filter(Boolean);
  const keys = monthKeys(jy, jm);
  const nonFriday = keys.filter((k) => J.weekdayOf(J.dateOfKey(k)) !== 6);
  // اگر جمعه‌ها را ننوشته باشد، خودمان ردشان می‌کنیم
  const target = tokens.length === nonFriday.length && tokens.length !== keys.length ? nonFriday : keys;
  const out = {};
  const unknown = new Set();
  tokens.slice(0, target.length).forEach((tok, i) => {
    if (/^[-._x×]+$/i.test(tok)) return;
    if (!typeOf(tok)) unknown.add(tok);
    out[target[i]] = tok;
  });
  return { out, unknown: [...unknown] };
}
