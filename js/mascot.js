// واکنش‌های شعله — کوتاه، کم، و فقط وقتی معنا دارد
// اصول: پیش‌بینی (کمی جمع شدن)، کش و فشردگی، تهِ حرکت که آروم می‌نشیند؛ ۲۰۰ تا ۶۰۰ میلی‌ثانیه
const MOODS = ['calm', 'soft', 'sleepy', 'happy', 'tender'];
const DUR = { hop: 600, nod: 450, droop: 1500, giggle: 650, glow: 900 };
// چهره‌ای که هر واکنش لحظه‌ای نشان می‌دهد
const FACE = { hop: 'happy', nod: 'happy', droop: 'tender', giggle: 'happy', glow: 'happy' };

let queued = null;

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export function react(kind, scope = document) {
  const svg = scope.querySelector('.lantern-wrap .lantern') || scope.querySelector('.lantern');
  if (!svg || !DUR[kind]) return;
  const prev = MOODS.find((m) => svg.classList.contains('m-' + m)) || 'calm';
  svg.classList.remove('m-' + prev);
  svg.classList.add('m-' + FACE[kind]);
  if (!reduced()) {
    svg.classList.remove('r-' + kind);
    void svg.getBoundingClientRect();
    svg.classList.add('r-' + kind);
    if (kind === 'hop' || kind === 'glow') sparks(svg);
  }
  clearTimeout(svg._t);
  svg._t = setTimeout(() => {
    svg.classList.remove('r-' + kind, 'm-' + FACE[kind]);
    svg.classList.add('m-' + prev);
  }, Math.max(DUR[kind], 1200));
}

function sparks(svg) {
  const host = svg.parentElement;
  host.classList.add('spark-host');
  [-12, 2, 14].forEach((dx, i) => {
    const s = document.createElement('i');
    s.className = 'spark';
    s.style.setProperty('--dx', dx + 'px');
    s.style.animationDelay = (120 + i * 50) + 'ms';
    host.appendChild(s);
    setTimeout(() => s.remove(), 1000);
  });
}

// واکنشی که بعد از رسمِ دوباره‌ی «امروز» اجرا می‌شود
export const queueReact = (kind) => { queued = kind; };
export function playQueued(scope) {
  if (!queued) return;
  const k = queued;
  queued = null;
  setTimeout(() => react(k, scope), 40);
}
