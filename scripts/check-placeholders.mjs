// Scans a build for placeholder content (elements carrying data-placeholder).
// DEPLOY_ENV=production → exits 1 if anything remains; otherwise prints a warning and exits 0.
// Usage: node scripts/check-placeholders.mjs [distDir]
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const dir = process.argv[2] ?? 'dist';
const production = process.env.DEPLOY_ENV === 'production';

if (!existsSync(dir)) {
  console.error(`check-placeholders: ${dir} does not exist; build first.`);
  process.exit(2);
}

const files = readdirSync(dir, { recursive: true }).map(String).filter((f) => f.endsWith('.html'));
const byPage = new Map();
const names = new Map();

for (const f of files) {
  const html = readFileSync(join(dir, f), 'utf8');
  const matches = [...html.matchAll(/data-placeholder(?:="([^"]*)")?/g)];
  if (!matches.length) continue;
  const page = '/' + relative(dir, join(dir, f)).split(sep).join('/').replace(/index\.html$/, '');
  byPage.set(page, matches.length);
  for (const m of matches) {
    const n = m[1] || 'content';
    names.set(n, (names.get(n) ?? 0) + 1);
  }
}

if (!byPage.size) {
  console.log('check-placeholders: no placeholder content found.');
  process.exit(0);
}

const total = [...byPage.values()].reduce((a, b) => a + b, 0);
const lines = [
  `check-placeholders: ${total} placeholder item(s) on ${byPage.size} page(s).`,
  '',
  'By kind:',
  ...[...names].sort((a, b) => b[1] - a[1]).map(([n, c]) => `  ${n.padEnd(20)} ${c}`),
  '',
  'By page:',
  ...[...byPage].sort().map(([p, c]) => `  ${p.padEnd(40)} ${c}`),
  '',
  'Replace them with the owner\'s content (see docs/content-guide.md).',
];

if (production) {
  console.error(lines.join('\n'));
  console.error('\nProduction build blocked: placeholder content must not go live.');
  process.exit(1);
}
console.warn(lines.join('\n'));
console.warn('\n(Preview build: continuing.)');
