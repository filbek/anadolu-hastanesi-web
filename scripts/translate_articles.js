import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cfwwcxqpyxktikizjjxx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmd3djeHFweXhrdGlraXpqanh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNDUyOTcsImV4cCI6MjA2MjYyMTI5N30.YUD6Uwxyd38xXs7R60UC-199FE52VYkqOZSXHtrBiH0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function translateText(text, targetLang) {
  if (!text || !text.trim()) return '';
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=tr&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    if (!res.ok) return '';
    const data = await res.json();
    if (Array.isArray(data) && Array.isArray(data[0])) {
      return data[0].map(seg => seg && seg[0] ? seg[0] : '').join('');
    }
  } catch (e) {
    console.error(`Translate error for lang ${targetLang}:`, e);
  }
  return '';
}

function isTurkish(text) {
  if (!text) return false;
  if (/[çğıöşüÇĞİÖŞÜ]/.test(text)) return true;
  const trStopwords = /\b(ve|bir|bu|için|ile|olan|olarak|gibi|veya|daha|olup|göre)\b/i;
  return trStopwords.test(text);
}

async function run() {
  console.log('--- Signing in as admin ---');
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'bekir.filizdag@anadoluhastaneleri.com',
    password: 'Admin123!@#'
  });
  if (authErr) {
    console.error('Sign in error:', authErr);
    return;
  }
  console.log('Signed in successfully as', authData.user.email);

  const tables = [
    { table: 'health_articles', fields: ['title', 'category', 'excerpt', 'content'] },
    { table: 'news_items', fields: ['title', 'category', 'excerpt', 'content'] }
  ];

  const targetLangs = ['en', 'ar'];

  for (const itemConfig of tables) {
    console.log(`\n=== Fetching rows from table: ${itemConfig.table} ===`);
    const { data: rows, error } = await supabase.from(itemConfig.table).select('*');
    if (error) {
      console.error(`Error fetching from ${itemConfig.table}:`, error);
      continue;
    }

    console.log(`Found ${rows.length} rows in ${itemConfig.table}.`);

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      console.log(`\nProcessing row [${i + 1}/${rows.length}]: "${row.title || row.id}"`);
      
      let translations = row.translations || {};
      let updated = false;

      for (const lang of targetLangs) {
        if (!translations[lang]) {
          translations[lang] = {};
        }

        for (const f of itemConfig.fields) {
          const trVal = row[f];
          const existingVal = translations[lang][f];

          // If empty, equal to Turkish, or isTurkish (placeholder), translate
          const needsTranslation = !existingVal || existingVal === trVal || isTurkish(existingVal);
          if (trVal && needsTranslation) {
            console.log(`Translating field "${f}" to "${lang}"...`);
            // Add 350ms delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 350));
            const translated = await translateText(trVal, lang);
            if (translated && translated !== trVal) {
              translations[lang][f] = translated;
              updated = true;
            }
          }
        }
      }

      if (updated) {
        console.log(`Updating translations in DB for ${itemConfig.table} ID ${row.id}...`);
        const { error: updateError } = await supabase
          .from(itemConfig.table)
          .update({ translations })
          .eq('id', row.id);
        if (updateError) {
          console.error(`Update error for ID ${row.id}:`, updateError);
        } else {
          console.log(`Successfully updated ID ${row.id}`);
        }
      } else {
        console.log(`No translation changes needed for ID ${row.id}`);
      }
    }
  }
  console.log('\nAll tables processed!');
}

run();
