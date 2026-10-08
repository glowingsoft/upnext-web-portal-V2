/**
 * Bundles the icons used by the public pages so they render without a request to api.iconify.design.
 * Run after adding icons to any folder in SCAN_DIRS:  node scripts/build-icon-sets.cjs
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT_FILE = path.join(ROOT, 'src/components/iconify/icon-sets.json');
const SCAN_DIRS = [
  'src/layouts',
  'src/components',
  'src/sections/home',
  'src/sections/stylist',
  'src/sections/event',
  'src/sections/legal',
  'src/sections/about',
  'src/sections/faqs',
  'src/sections/contact',
  'src/sections/auth/jwt',
  'src/sections/coming-soon',
  'src/sections/error',
];
const ICON_PATTERN = /['"`]([a-z0-9]+(?:-[a-z0-9]+)*):([a-z0-9]+(?:-[a-z0-9]+)*)['"`]/g;

function listFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return listFiles(full);
    return /\.(jsx?|tsx?)$/.test(entry.name) ? [full] : [];
  });
}

async function main() {
  const wanted = {};
  SCAN_DIRS.flatMap((dir) => listFiles(path.join(ROOT, dir))).forEach((file) => {
    const source = fs.readFileSync(file, 'utf8');
    for (const [, prefix, name] of source.matchAll(ICON_PATTERN)) {
      (wanted[prefix] ||= new Set()).add(name);
    }
  });

  const collections = [];
  for (const prefix of Object.keys(wanted).sort()) {
    const names = [...wanted[prefix]].sort();
    const response = await fetch(`https://api.iconify.design/${prefix}.json?icons=${names.join(',')}`);
    if (!response.ok) continue;
    const data = await response.json();
    if (!data || typeof data !== 'object' || !data.icons || !Object.keys(data.icons).length) continue;
    delete data.not_found;
    delete data.lastModified;
    collections.push(data);
    console.log(`${prefix}: ${Object.keys(data.icons).length} icons`);
  }

  fs.writeFileSync(OUT_FILE, `${JSON.stringify(collections)}\n`);
  console.log(`Wrote ${path.relative(ROOT, OUT_FILE)} (${Math.round(fs.statSync(OUT_FILE).size / 1024)} KB)`);
}

main();
