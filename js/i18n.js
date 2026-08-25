/**
 * i18n.js — loads UI copy from js/i18n/<lang>.json on demand instead of
 * bundling all four languages (~42KB) into one script every page always
 * downloaded in full. Only the active language + English (used as the
 * fallback for any missing key) are fetched. Dynamic data-driven text
 * (distances, dates) is generated in tracker.js / compare.js etc. using
 * getLang(), same as before.
 */
const LANG_STORAGE_KEY = 'voyager-tracker-lang';
const SUPPORTED_LANGS = ['en', 'zh', 'es', 'ja'];
const I18N = {};

/**
 * The current language is determined by which URL the page was served at
 * (window.SITE_LANG, set inline per index.html / zh/index.html / etc.) so
 * that each language has its own crawlable, shareable, bookmarkable URL.
 */
function getLang() {
  return window.SITE_LANG || 'en';
}

/**
 * Switching language navigates to that language's own URL (rather than
 * re-rendering in place) — this keeps the URL, <title>, meta description,
 * and hreflang tags all correctly matched to what's on screen.
 */
function langUrl(lang) {
  const root = document.documentElement.getAttribute('data-site-root') || './';
  const path = lang === 'en' ? root : root + lang + '/';
  return path + window.location.hash;
}

function setLang(lang) {
  if (!SUPPORTED_LANGS.includes(lang)) return;
  localStorage.setItem(LANG_STORAGE_KEY, lang);
  if (lang === getLang()) return;
  window.location.href = langUrl(lang);
}

function t(key) {
  const lang = getLang();
  return (I18N[lang] && I18N[lang][key]) || (I18N.en && I18N.en[key]) || key;
}

async function fetchLangDict(lang) {
  const root = document.documentElement.getAttribute('data-site-root') || './';
  const res = await fetch(`${root}js/i18n/${lang}.json`, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`Failed to load js/i18n/${lang}.json — HTTP ${res.status}`);
  return res.json();
}

/**
 * Populates I18N with the active language plus the English fallback
 * (skipping the duplicate fetch when the active language already IS
 * English). Must be awaited before applyTranslations() or any render
 * code that calls t() — see app.js's bootstrap().
 */
async function initI18n() {
  const lang = getLang();
  const langsToLoad = lang === 'en' ? ['en'] : ['en', lang];
  const dicts = await Promise.all(langsToLoad.map(fetchLangDict));
  langsToLoad.forEach((l, i) => { I18N[l] = dicts[i]; });
}

function applyTranslations(lang) {
  const langAttrMap = { zh: 'zh-Hant', es: 'es', ja: 'ja' };
  document.documentElement.lang = langAttrMap[lang] || 'en';
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    const val = I18N[lang][key] !== undefined ? I18N[lang][key] : I18N.en[key];
    if (val !== undefined) el.textContent = val;
  });
  document.querySelectorAll('[data-i18n-attr]').forEach((el) => {
    const spec = el.getAttribute('data-i18n-attr');
    spec.split(';').forEach((pair) => {
      const [attr, key] = pair.split(':').map((s) => s.trim());
      const val = attr && key ? (I18N[lang][key] !== undefined ? I18N[lang][key] : I18N.en[key]) : undefined;
      if (val !== undefined) el.setAttribute(attr, val);
    });
  });
  const titleKey = document.body.getAttribute('data-i18n-title');
  if (titleKey) document.title = I18N[lang][titleKey] || I18N.en[titleKey];
  document.querySelectorAll('.lang-toggle-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.lang-toggle-btn').forEach((btn) => {
    btn.addEventListener('click', () => setLang(btn.getAttribute('data-lang')));
  });
});
