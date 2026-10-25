// هدیه‌ی رمزدار: اسم و برنامه‌ی کاغذی، رمزگذاری‌شده در gift.json
// بدونِ رمز، هیچ‌کس در اینترنت نمی‌تواند اسم یا برنامه را بخواند.
// رمزنگاری: PBKDF2-SHA256 برای ساختنِ کلید از رمز، و AES-GCM برای قفل.

const fromB64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

// رقم‌های فارسی و عربی را لاتین کن، تا با هر صفحه‌کلیدی کار کند
export const normalizeCode = (s) => String(s)
  .replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
  .replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d))
  .replace(/[\s\-–_]/g, '');

export async function loadGift() {
  try {
    const res = await fetch('gift.json', { cache: 'no-store' });
    if (!res.ok) return null;
    const g = await res.json();
    return g && g.v === 1 && g.data ? g : null;
  } catch (e) {
    return null;
  }
}

// برمی‌گرداند {name, plan} یا اگر رمز اشتباه باشد null
export async function openGift(g, code) {
  try {
    const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(normalizeCode(code)), 'PBKDF2', false, ['deriveKey']);
    const key = await crypto.subtle.deriveKey(
      { name: 'PBKDF2', hash: 'SHA-256', salt: fromB64(g.salt), iterations: g.iter },
      base, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromB64(g.iv) }, key, fromB64(g.data));
    return JSON.parse(new TextDecoder().decode(plain));
  } catch (e) {
    return null;
  }
}
