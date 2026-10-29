import { mkdirSync, readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'src/fonts');
const srcDir = join(root, 'fonts-src');
mkdirSync(outDir, { recursive: true });
mkdirSync(srcDir, { recursive: true });

function collectText(dir, files = []) {
  for (const name of readdirSync(dir)) {
    if (['node_modules', 'dist', '.git', 'fonts-src', 'src'].includes(name) && dir === root) {
      if (name !== 'src') continue;
    }
    const full = join(dir, name);
    if (name === 'fonts') continue;
    const stat = statSync(full);
    if (stat.isDirectory()) collectText(full, files);
    else if (/\.(json|js|mjs|html|css|md|svg)$/.test(name)) files.push(full);
  }
  return files;
}

const text = collectText(root).map((file) => readFileSync(file, 'utf8')).join('\n');
const chars = [...new Set([...text].filter((char) => char.codePointAt(0) > 127 || '—·×→←'.includes(char)))].sort().join('');
writeFileSync(join(srcDir, 'chars.txt'), chars);
console.log(`subset characters: ${[...chars].length}`);

const families = [
  {
    family: 'Noto Sans SC',
    weight: 400,
    file: 'noto-sans-sc-400.woff2',
    source: 'NotoSansSC-400.ttf',
  },
  {
    family: 'Noto Sans SC',
    weight: 600,
    file: 'noto-sans-sc-600.woff2',
    source: 'NotoSansSC-600.ttf',
  },
  {
    family: 'Noto Serif SC',
    weight: 600,
    file: 'noto-serif-sc-600.woff2',
    source: 'NotoSerifSC-600.ttf',
  },
];

async function downloadSubset(item) {
  const query = new URL('https://fonts.googleapis.com/css2');
  query.searchParams.set('family', `${item.family}:wght@${item.weight}`);
  query.searchParams.set('display', 'swap');
  query.searchParams.set('text', chars);
  const css = await fetch(query, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    },
  }).then((response) => {
    if (!response.ok) throw new Error(`font css ${response.status} for ${item.family} ${item.weight}`);
    return response.text();
  });
  const match = css.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/);
  if (!match) throw new Error(`no font url for ${item.family} ${item.weight}\n${css.slice(0, 500)}`);
  const bytes = Buffer.from(await fetch(match[1]).then((response) => response.arrayBuffer()));
  const target = join(outDir, item.file);
  writeFileSync(target, bytes);
  console.log(`wrote ${item.file} (${bytes.length} bytes)`);
}

for (const item of families) await downloadSubset(item);
