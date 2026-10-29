import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const site = JSON.parse(readFileSync(join(root, 'content/site.json'), 'utf8'));

const expectedIds = [
  'fineloom',
  'odn',
  'pricing',
  'trustsql',
  'photosync',
  'cosmic',
  'inspection',
  'r2-relay',
];

const failures = [];

function fail(message) {
  failures.push(message);
}

function walkBilingual(node, path) {
  if (Array.isArray(node)) {
    node.forEach((item, index) => walkBilingual(item, `${path}[${index}]`));
    return;
  }
  if (!node || typeof node !== 'object') return;
  const keys = Object.keys(node);
  if (keys.length === 2 && keys.includes('zh') && keys.includes('en')) {
    if (typeof node.zh !== 'string' || node.zh.trim() === '') fail(`${path}.zh is empty`);
    if (typeof node.en !== 'string' || node.en.trim() === '') fail(`${path}.en is empty`);
    return;
  }
  for (const [key, value] of Object.entries(node)) walkBilingual(value, `${path}.${key}`);
}

walkBilingual(site, 'site');

if (site.projects.length !== 8) fail(`expected 8 projects, found ${site.projects.length}`);
expectedIds.forEach((id, index) => {
  if (site.projects[index]?.id !== id) fail(`project[${index}] should be ${id}`);
});

for (const project of site.projects) {
  for (const field of ['title', 'summary', 'problem', 'diagram']) {
    if (!project[field]) fail(`${project.id} missing ${field}`);
  }
  if (!Array.isArray(project.role) || project.role.length === 0) fail(`${project.id} missing role`);
  if (!Array.isArray(project.stack) || project.stack.length === 0) fail(`${project.id} missing stack`);
  if (!['case', 'personal'].includes(project.kind)) fail(`${project.id} has a bad kind`);
}

const personal = ['photosync', 'trustsql', 'r2-relay'];
for (const id of personal) {
  const project = site.projects.find((item) => item.id === id);
  if (project?.kind !== 'personal') fail(`${id} should be personal`);
}

const photosync = site.projects.find((item) => item.id === 'photosync');
if (photosync?.links?.length) fail('photosync must not link a repository');

const relay = site.projects.find((item) => item.id === 'r2-relay');
const relayHref = relay?.links?.map((link) => link.href) ?? [];
if (!relayHref.includes('https://github.com/IVMYM/r2-relay')) {
  fail('r2-relay should link its public repository');
}

const allowedHrefs = new Set([
  'https://github.com/IVMYM',
  'https://github.com/IVMYM/r2-relay',
  'https://github.com/deepseek-ai/deepseek-harness',
  'https://github.com/ultralytics/ultralytics',
  'https://www.gnu.org/licenses/agpl-3.0.html',
]);

function collectHrefs(node, found = []) {
  if (Array.isArray(node)) {
    node.forEach((item) => collectHrefs(item, found));
    return found;
  }
  if (!node || typeof node !== 'object') return found;
  if (typeof node.href === 'string') found.push(node.href);
  for (const value of Object.values(node)) collectHrefs(value, found);
  return found;
}

for (const href of collectHrefs(site)) {
  if (!allowedHrefs.has(href)) fail(`unexpected href: ${href}`);
}

const email = site.contact?.email ?? '';
if (!email.trim()) fail('contact.email is empty');
if (!email.includes('TODO') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  fail('contact.email should be the TODO placeholder or a real address');
}

function fromCodes(codes) {
  return String.fromCharCode(...codes);
}

const banned = [
  [23433, 24509],
  [23425, 22799],
  [22825, 24119],
  [102, 105, 110, 101, 100, 111],
  [38750, 24230],
  [49, 57, 50, 46, 49, 54, 56],
  [103, 105, 116, 46, 102, 105, 110, 101, 100, 111],
  [100, 97, 116, 97, 102, 105, 110, 101],
  [49, 49, 50, 46, 50, 57, 46, 55, 51, 46, 49, 54, 57],
  [20013, 22269, 31227, 21160],
  [20013, 22269, 30005, 20449],
  [20013, 26816],
  [102, 105, 110, 101, 110, 101, 116, 45, 97, 117, 116, 104],
  [102, 105, 110, 101, 99, 108, 97, 119],
  [116, 97, 105, 108, 56, 51, 51, 55, 53, 53],
  [46, 116, 115, 46, 110, 101, 116],
  [50, 48, 50, 49, 49, 51, 55],
  [102, 115, 100, 112, 51],
  [97, 104, 99, 109, 99, 99],
  [97, 104, 116, 101, 108, 101, 99, 111, 109],
  [23004, 28009, 26976],
  [26472, 21688, 31119],
  [23002, 22269, 40857],
  [103, 105, 116, 104, 117, 98, 46, 99, 111, 109, 47, 105, 118, 109, 121, 109, 47, 112, 104, 111, 116, 111, 115, 121, 110, 99],
].map(fromCodes);

const skipDir = new Set(['.git', 'node_modules', 'dist', 'fonts-src']);
const textExt = new Set(['.json', '.js', '.mjs', '.css', '.html', '.md', '.yml', '.yaml', '.svg', '.txt']);

function walkFiles(dir, files = []) {
  for (const name of readdirSync(dir)) {
    if (skipDir.has(name)) continue;
    const full = join(dir, name);
    const stat = statSync(full);
    if (stat.isDirectory()) walkFiles(full, files);
    else if (textExt.has(name.slice(name.lastIndexOf('.')))) files.push(full);
  }
  return files;
}

const corpus = walkFiles(root)
  .filter((file) => !file.endsWith('scripts/check-content.mjs'))
  .map((file) => readFileSync(file, 'utf8'))
  .join('\n')
  .toLowerCase();

for (const word of banned) {
  if (corpus.includes(word)) fail(`banned text found: code ${[...word].map((char) => char.codePointAt(0)).join('-')}`);
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log(`content ok: ${site.projects.length} projects, zh + en`);
