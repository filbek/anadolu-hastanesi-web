const fs = require('fs');
const path = require('path');

function findFiles(dir, ext) {
  const files = [];
  for (const entry of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory() && !entry.startsWith('.') && entry !== 'node_modules') {
      files.push(...findFiles(fullPath, ext));
    } else if (entry.endsWith(ext)) {
      files.push(fullPath);
    }
  }
  return files;
}

const srcDir = path.resolve('src');
const files = findFiles(srcDir, '.tsx');

const keys = new Map();
const regex = /t\(\s*['"]([^'"]+)['"]\s*,\s*['"]((?:[^'"\\]|\\.)*)['"]\s*\)/g;

for (const file of files) {
  const content = fs.readFileSync(file, 'utf-8');
  let m;
  while ((m = regex.exec(content)) !== null) {
    const k = m[1];
    const fb = m[2].replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\n/g, '\n');
    if (!keys.has(k)) {
      keys.set(k, fb);
    }
  }
}

const result = {};
for (const [k, v] of keys) {
  const parts = k.split('.');
  let cur = result;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!cur[parts[i]]) cur[parts[i]] = {};
    cur = cur[parts[i]];
  }
  cur[parts[parts.length - 1]] = v;
}

const locales = ['tr', 'en', 'ar'];
for (const lang of locales) {
  const localePath = path.join('src/locales', lang + '.json');
  let existing = {};
  if (fs.existsSync(localePath)) {
    existing = JSON.parse(fs.readFileSync(localePath, 'utf-8'));
  }
  function deepMerge(target, source) {
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        if (!target[key] || typeof target[key] !== 'object') target[key] = {};
        deepMerge(target[key], source[key]);
      } else {
        if (target[key] === undefined) target[key] = source[key];
      }
    }
  }
  deepMerge(existing, result);
  fs.writeFileSync(localePath, JSON.stringify(existing, null, 2) + '\n');
}

console.log('Extracted ' + keys.size + ' unique keys');
