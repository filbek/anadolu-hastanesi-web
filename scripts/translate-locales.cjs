const fs = require('fs');
const path = require('path');

const SOURCE_LANG = 'tr';
const TARGET_LANGS = ['en', 'ar'];
const DELAY_MS = 400; // delay between requests

async function translateMyMemory(text, targetLang) {
  if (!text || !text.trim()) return text;
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${SOURCE_LANG}|${targetLang}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.responseStatus === 429 || (data.responseData?.translatedText && data.responseData.translatedText.includes('MYMEMORY WARNING'))) {
    return null; // quota exceeded
  }
  if (data.responseData?.translatedText) {
    return data.responseData.translatedText;
  }
  return null;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function flatten(obj, prefix = '') {
  const result = {};
  for (const key in obj) {
    const val = obj[key];
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      Object.assign(result, flatten(val, fullKey));
    } else {
      result[fullKey] = val;
    }
  }
  return result;
}

function unflatten(obj) {
  const result = {};
  for (const key in obj) {
    const parts = key.split('.');
    let cur = result;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!cur[parts[i]]) cur[parts[i]] = {};
      cur = cur[parts[i]];
    }
    cur[parts[parts.length - 1]] = obj[key];
  }
  return result;
}

async function main() {
  const trPath = path.join('src/locales', 'tr.json');
  const trData = JSON.parse(fs.readFileSync(trPath, 'utf-8'));
  const trFlat = flatten(trData);

  for (const targetLang of TARGET_LANGS) {
    const localePath = path.join('src/locales', `${targetLang}.json`);
    let existing = {};
    if (fs.existsSync(localePath)) {
      existing = JSON.parse(fs.readFileSync(localePath, 'utf-8'));
    }
    const existingFlat = flatten(existing);

    // Find keys that need translation: present in tr but missing or same in target
    const toTranslate = [];
    for (const key in trFlat) {
      const trVal = trFlat[key];
      const existingVal = existingFlat[key];
      // Skip if already translated (different from Turkish and not empty)
      if (existingVal && existingVal !== trVal && existingVal.trim() !== '') {
        continue;
      }
      // Skip admin namespace to reduce load
      if (key.startsWith('admin.')) continue;
      toTranslate.push(key);
    }

    console.log(`[${targetLang}] Need to translate ${toTranslate.length} keys`);

    let success = 0;
    let failed = 0;

    for (let i = 0; i < toTranslate.length; i++) {
      const key = toTranslate[i];
      const text = trFlat[key];
      let translated = null;
      let retries = 0;
      while (!translated && retries < 3) {
        translated = await translateMyMemory(text, targetLang);
        if (!translated) {
          retries++;
          console.log(`  [${targetLang}] Rate limit or error for "${key}", waiting 5s... (retry ${retries})`);
          await sleep(5000);
        }
      }
      if (translated) {
        existingFlat[key] = translated;
        success++;
      } else {
        existingFlat[key] = text; // fallback to Turkish
        failed++;
      }
      if ((i + 1) % 10 === 0) {
        console.log(`  [${targetLang}] Progress: ${i + 1}/${toTranslate.length} (success: ${success}, failed: ${failed})`);
      }
      await sleep(DELAY_MS);
    }

    const merged = unflatten(existingFlat);
    fs.writeFileSync(localePath, JSON.stringify(merged, null, 2) + '\n');
    console.log(`[${targetLang}] Done. Success: ${success}, Failed: ${failed}`);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
