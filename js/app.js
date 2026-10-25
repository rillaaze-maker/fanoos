// نقطه‌ی شروع
import * as J from './jalali.js';
import { S, save, shiftOn, spanOf, swapsOn, isWork, personName, typeOf } from './store.js';
import { C, t, $, $$, esc, todayKey, shiftText, toast, inkWords, closeAllSheets } from './ui.js';
import { icon, lantern, shiftGlyph } from './glyphs.js';
import { renderToday } from './today.js';
import { renderCalendar } from './calendar.js';
import { renderSwaps } from './swaps.js';
import { renderCare } from './care.js';
import { applyLook } from './settings.js';
import { bus } from './bus.js';
import { loadGift, openGift } from './gift.js';

const views = { today: renderToday, cal: renderCalendar, swaps: renderSwaps, care: renderCare };
const tabIcons = { today: 'sun', cal: 'cal', swaps: 'swap', care: 'heart' };
let tab = 'today';

function render() {
  const view = $('#view');
  view.dataset.tab = tab;
  views[tab](view);
  $$('.tabbar button').forEach((b) => b.classList.toggle('on', b.dataset.tab === tab));
  document.title = S.me.name ? t(C.appFor, { name: S.me.name }) : C.appName;
}

function go(next) {
  if (next === tab) return;
  tab = next;
  const view = $('#view');
  view.classList.remove('enter');
  void view.offsetWidth;
  view.classList.add('enter');
  render();
  window.scrollTo(0, 0);
}

bus.refresh = render;
bus.go = go;

function buildTabbar() {
  const nav = $('.tabbar');
  nav.innerHTML = Object.keys(views).map((k) =>
    `<button data-tab="${k}">${icon(tabIcons[k])}<span>${C.ui.tabs[k]}</span></button>`).join('');
  nav.onclick = (e) => { const b = e.target.closest('[data-tab]'); if (b) { closeAllSheets(); go(b.dataset.tab); } };
}

// ── اولین بار ─────────────────────────────────────────────────
function onboard() {
  const root = $('#onboard');
  root.hidden = false;
  document.body.classList.add('onboarding');
  const finish = (toTab) => {
    root.classList.add('leave');
    setTimeout(() => { root.hidden = true; root.innerHTML = ''; root.classList.remove('leave'); document.body.classList.remove('onboarding'); tab = toTab; render(); }, 450);
  };

  // اگر gift.json هست، اول رمز؛ وگرنه اسم
  loadGift().then((gift) => (gift ? askCode(gift) : askName()));

  function askName() {
    root.innerHTML = `<div class="ob">
      <div class="ob-lantern">${lantern('happy', 'big')}</div>
      <h1 class="ob-hello">${C.onboard.hello}</h1>
      <p class="ob-text">${inkWords(C.onboard.iam, 400)}</p>
      <label class="lbl">${C.onboard.askName}</label>
      <input class="line-in big" data-name placeholder="${C.onboard.namePh}" autocomplete="given-name">
      <button class="btn solid" data-act="go">${C.onboard.go}</button></div>`;
    const inp = $('[data-name]', root);
    inp.onkeydown = (e) => { if (e.key === 'Enter') $('[data-act]', root).click(); };
    $('[data-act]', root).onclick = () => {
      const v = inp.value.trim();
      if (!v) return inp.focus();
      S.me.name = v;
      save();
      finish('cal');
    };
  }

  function askCode(gift) {
    root.innerHTML = `<div class="ob">
      <div class="ob-lantern">${lantern('calm', 'big')}</div>
      <h1 class="ob-hello">${C.onboard.giftHello}</h1>
      <p class="ob-text">${inkWords(C.onboard.giftText, 400)}</p>
      <label class="lbl">${C.onboard.askCode}</label>
      <input class="line-in big code-in" data-code type="text" inputmode="numeric" autocomplete="off" dir="ltr" placeholder="${C.onboard.codePh}">
      <p class="ob-err" aria-live="polite"></p>
      <button class="btn solid" data-act="open">${C.onboard.open}</button>
      <button class="link" data-act="nocode">${C.onboard.noCode}</button></div>`;
    const inp = $('[data-code]', root), btn = $('[data-act="open"]', root), err = $('.ob-err', root);
    inp.onkeydown = (e) => { if (e.key === 'Enter') btn.click(); };
    $('[data-act="nocode"]', root).onclick = askName;
    btn.onclick = async () => {
      if (!inp.value.trim()) return inp.focus();
      btn.disabled = true;
      btn.textContent = C.onboard.opening;
      err.textContent = '';
      const p = await openGift(gift, inp.value);
      btn.disabled = false;
      btn.textContent = C.onboard.open;
      if (!p) {
        err.textContent = C.onboard.wrong;
        inp.classList.remove('shake'); void inp.offsetWidth; inp.classList.add('shake');
        return;
      }
      S.me.name = p.name;
      Object.assign(S.plan, p.plan || {});
      save();
      toast(t(C.onboard.welcome, { name: p.name }));
      finish('today');
    };
  }
}

// ── یادآوری‌ها (وقتی برنامه باز است) ───────────────────────────
async function notify(id, text) {
  if (S.fired[id]) return;
  S.fired[id] = Date.now();
  // پاک کردنِ قدیمی‌ها
  for (const k in S.fired) if (Date.now() - S.fired[k] > 7 * 864e5) delete S.fired[k];
  save();
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) return reg.showNotification(C.appName, { body: text, icon: 'icons/icon-192.png', badge: 'icons/icon-192.png', lang: 'fa', dir: 'rtl', tag: id });
      return new Notification(C.appName, { body: text, dir: 'rtl', lang: 'fa' });
    } catch (e) { /* */ }
  }
  toast(text, 6000);
}

function tick() {
  if (!S.me.name) return;
  const now = new Date();
  const tk = todayKey();
  for (const k of [J.addDays(tk, -1), tk, J.addDays(tk, 1)]) {
    const code = shiftOn('me', k);
    const sp = spanOf(k, code);
    if (sp) {
      const toStart = sp.start - now;
      if (toStart > 0 && toStart <= 60 * 60e3) notify('start-' + k, t(C.notify.startSoon, { shift: sp.type.label }));
      const sinceEnd = now - sp.end;
      if (sinceEnd >= 0 && sinceEnd < 30 * 60e3) notify('end-' + k, C.notify.ended);
    }
  }
  // شبِ قبل از روزی که جابه‌جا شده، ساعتِ ۲۰
  const tmr = J.addDays(tk, 1);
  if (now.getHours() >= 20 && swapsOn(tmr).length) {
    const s = swapsOn(tmr).at(-1);
    const c = s.changes.find((x) => x.who === 'me' && x.key === tmr);
    const what = isWork(c.to) ? t(C.now.insteadOf, { name: personName(s.with) }) + ' ' + (typeOf(c.to) || {}).label : t(C.now.coveredBy, { name: personName(s.with) });
    notify('eve-' + tmr + s.id, t(C.swap.remindEve, { what }));
  }
  if (S.grief && S.grief.key === tk) {
    const [h, m] = S.grief.time.split(':').map(Number);
    if (now.getHours() * 60 + now.getMinutes() >= h * 60 + m) notify('grief-' + tk, C.tools.loss.apptNow);
  }
}

// ── شروع ──────────────────────────────────────────────────────
// اگر صفحه با برگه‌ی باز دوباره بارگذاری شد، تاریخچه‌ی برگه‌ها را پاک کن
if (history.state && history.state.sheet) history.replaceState(null, '');
applyLook();
buildTabbar();
render();
if (!S.me.name) onboard();

setInterval(() => { tick(); }, 30e3);
setTimeout(tick, 1500);
// هر دقیقه «امروز» را تازه کن (زمانِ مانده)، مگر وقتی کاربر چیزی را باز کرده یا می‌نویسد
setInterval(() => {
  if (tab === 'today' && !document.querySelector('.sheet-wrap') && !document.querySelector('.line-card.drawing') && document.activeElement.tagName !== 'INPUT') render();
}, 60e3);
document.addEventListener('visibilitychange', () => { if (!document.hidden) { render(); tick(); } });

// روی localhost (هنگامِ ساختن) کش نکن تا تغییرها فوراً دیده شوند؛ ?sw برای آزمایش
const dev = /^(localhost|127\.)/.test(location.hostname) && !location.search.includes('sw');
if ('serviceWorker' in navigator && !dev) navigator.serviceWorker.register('sw.js').catch(() => {});
if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
