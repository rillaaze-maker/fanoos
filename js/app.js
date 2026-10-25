// نقطه‌ی شروع
import * as J from './jalali.js';
import { S, save, uid, ensureType, shiftOn, spanOf, swapsOn, isWork, personName, typeOf } from './store.js';
import { C, t, $, $$, esc, fa, todayKey, shiftText, toast, inkWords, closeAllSheets, vibrate } from './ui.js';
import { icon, lantern, shiftGlyph } from './glyphs.js';
import { renderToday } from './today.js';
import { renderCalendar } from './calendar.js';
import { renderSwaps } from './swaps.js';
import { renderCare } from './care.js';
import { applyLook } from './settings.js';
import { bus } from './bus.js';
import { loadGift, openGift, normalizeCode } from './gift.js';

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
  const start = () => loadGift().then((gift) => (gift ? askCode(gift) : askName()));
  if (needsInstall()) askInstall(start); else start();

  // راهنمای نصب: اول برنامه را روی صفحه‌ی گوشی بگذار
  function askInstall(next) {
    const draw = (done) => {
      root.innerHTML = `<div class="ob">
        <div class="ob-lantern">${lantern('happy', 'big')}</div>
        <h1 class="ob-hello">${done ? C.install.doneTitle : C.install.title}</h1>
        <p class="ob-text">${done ? C.install.doneText : C.install.text}</p>
        ${!done && installPrompt ? `<button class="btn solid" data-act="install">${C.install.button}</button>` : ''}
        ${done ? '' : `<ol class="install-steps">${C.install.steps.map((x) => `<li>${x}</li>`).join('')}</ol>
        <details class="ios-steps"><summary>${C.install.iosTitle}</summary>
          <ol class="install-steps">${C.install.iosSteps.map((x) => `<li>${x}</li>`).join('')}</ol></details>`}
        <button class="${done ? 'btn solid' : 'link'}" data-act="later">${done ? C.install.continue : C.install.later}</button></div>`;
      $('[data-act="later"]', root).onclick = () => { try { sessionStorage.setItem('fanoos.skipInstall', '1'); } catch (e) { /* */ } next(); };
      const ib = $('[data-act="install"]', root);
      if (ib) ib.onclick = async () => {
        installPrompt.prompt();
        const r = await installPrompt.userChoice;
        installPrompt = null;
        draw(r.outcome === 'accepted');
      };
    };
    onInstallChange = () => draw(false);
    window.addEventListener('appinstalled', () => draw(true), { once: true });
    draw(false);
  }

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
      <label class="lbl" for="otp">${C.onboard.askCode}</label>
      <div class="otp" dir="ltr">
        <input id="otp" class="otp-in" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="12" aria-describedby="otp-msg">
        ${[0, 1, 2, 3, 4, 5].map((i) => `<span class="slot"></span>${i === 2 ? '<i class="otp-gap"></i>' : ''}`).join('')}
      </div>
      <p class="ob-err" id="otp-msg" aria-live="polite"></p>
      <button class="link" data-act="nocode">${C.onboard.noCode}</button></div>`;
    const box = $('.otp', root), inp = $('.otp-in', root), err = $('.ob-err', root);
    const slots = [...root.querySelectorAll('.slot')];
    let busy = false;

    const paint = () => {
      const d = inp.value;
      slots.forEach((el, i) => {
        el.textContent = d[i] ? fa(d[i]) : '';
        el.classList.toggle('filled', !!d[i]);
        el.classList.toggle('active', document.activeElement === inp && i === Math.min(d.length, 5) && d.length < 6);
      });
    };

    inp.oninput = async () => {
      if (busy) return;
      inp.value = normalizeCode(inp.value).replace(/\D/g, '').slice(0, 6);
      err.textContent = '';
      box.classList.remove('bad');
      paint();
      if (inp.value.length < 6) return;
      busy = true;
      box.classList.add('checking');
      err.textContent = C.onboard.opening;
      err.classList.add('wait');
      const p = await openGift(gift, inp.value);
      box.classList.remove('checking');
      err.classList.remove('wait');
      busy = false;
      if (!p) {
        err.textContent = C.onboard.wrong;
        box.classList.remove('bad'); void box.offsetWidth; box.classList.add('bad');
        vibrate([30, 40, 30]);
        setTimeout(() => { inp.value = ''; paint(); }, 650);
        return;
      }
      box.classList.add('ok');
      err.textContent = '';
      vibrate(15);
      unlock(p);
    };
    inp.onfocus = inp.onblur = paint;
    box.onclick = () => inp.focus();
    $('[data-act="nocode"]', root).onclick = askName;
    paint();
    setTimeout(() => inp.focus(), 500);
  }

  function unlock(p) {
    S.me.name = p.name;
    Object.assign(S.plan, p.plan || {});
    // همکارها هم با همین رمز می‌آیند
    for (const c of p.people || []) {
      const old = S.people.find((x) => x.name === c.name);
      if (old) Object.assign(old.plan, c.plan || {});
      else S.people.push({ id: uid(), name: c.name, plan: { ...(c.plan || {}) } });
      for (const code of Object.values(c.plan || {})) ensureType(code);
    }
    save();
    toast(t(C.onboard.welcome, { name: p.name }));
    setTimeout(() => finish('today'), 450);
  }
}

// ── نصب ──────────────────────────────────────────────────────
let installPrompt = null;
let onInstallChange = () => {};
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); installPrompt = e; onInstallChange(); });

function needsInstall() {
  const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  let skipped = false;
  try { skipped = sessionStorage.getItem('fanoos.skipInstall') === '1'; } catch (e) { /* */ }
  return !standalone && !skipped && matchMedia('(pointer: coarse)').matches;
}

// ── شروعِ برنامه: شعله‌ی خواب‌آلود بیدار می‌شود، یه جرقه می‌زند و می‌رود سرِ جایش ──
function splash() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const ov = document.createElement('div');
  ov.className = 'splash';
  ov.innerHTML = `<div class="sp-flame">${lantern('sleepy')}</div>`;
  document.body.appendChild(ov);
  const f = $('.sp-flame', ov);
  const target = $('.lantern-wrap');
  if (target) target.style.visibility = 'hidden';
  setTimeout(() => {
    f.innerHTML = lantern('happy') + '<i class="spark" style="--dx:-14px"></i><i class="spark" style="--dx:2px;animation-delay:.05s"></i><i class="spark" style="--dx:16px;animation-delay:.1s"></i>';
    f.classList.add('flare');
  }, 950);
  setTimeout(() => {
    const t = $('.lantern-wrap');
    if (t) {
      const a = f.getBoundingClientRect(), b = t.getBoundingClientRect();
      f.style.transform = `translate(${b.left + b.width / 2 - (a.left + a.width / 2)}px, ${b.top + b.height / 2 - (a.top + a.height / 2)}px) scale(${b.width / a.width})`;
    }
    ov.classList.add('go');
  }, 1650);
  setTimeout(() => { const t = $('.lantern-wrap'); if (t) t.style.visibility = ''; ov.remove(); }, 2500);
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
if (!S.me.name) onboard(); else splash();

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
