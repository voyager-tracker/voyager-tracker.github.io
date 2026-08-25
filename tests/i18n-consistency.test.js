const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const LANGS = ['en', 'zh', 'es', 'ja'];
const EDITIONS = [
  { name: 'main', dir: path.join(__dirname, '..', 'js', 'i18n') },
  { name: 'kid', dir: path.join(__dirname, '..', 'kid', 'js', 'i18n') }
];

function loadDict(dir, lang) {
  return JSON.parse(fs.readFileSync(path.join(dir, `${lang}.json`), 'utf8'));
}

for (const edition of EDITIONS) {
  test(`${edition.name} edition: all languages define the same set of i18n keys`, () => {
    const dicts = Object.fromEntries(LANGS.map((lang) => [lang, loadDict(edition.dir, lang)]));
    const enKeys = new Set(Object.keys(dicts.en));

    for (const lang of LANGS) {
      if (lang === 'en') continue;
      const keys = new Set(Object.keys(dicts[lang]));
      const missing = [...enKeys].filter((k) => !keys.has(k));
      const extra = [...keys].filter((k) => !enKeys.has(k));
      assert.deepEqual(
        { missing, extra },
        { missing: [], extra: [] },
        `${edition.name}/${lang}.json is out of sync with en.json (missing keys shown as "missing", keys not present in en.json shown as "extra")`
      );
    }
  });

  test(`${edition.name} edition: no language has an empty-string translation`, () => {
    for (const lang of LANGS) {
      const dict = loadDict(edition.dir, lang);
      const blanks = Object.entries(dict).filter(([, v]) => typeof v !== 'string' || v.trim() === '').map(([k]) => k);
      assert.deepEqual(blanks, [], `${edition.name}/${lang}.json has blank/non-string values for: ${blanks.join(', ')}`);
    }
  });
}
