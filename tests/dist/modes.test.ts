import { describe, it, expect, beforeAll } from 'vitest';
import { spawnSync } from 'node:child_process';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { load, readRaw } from './helpers';

const PREVIEW = 'dist-preview';
const PROD = 'dist-prod';

function build(outDir: string, env: string) {
  const r = spawnSync('npx', ['astro', 'build', '--outDir', outDir], {
    env: { ...process.env, DEPLOY_ENV: env },
    shell: true,
    encoding: 'utf8',
  });
  if (r.status !== 0) throw new Error(`build ${env} failed:\n${r.stdout}\n${r.stderr}`);
}

function check(dir: string, env: string) {
  return spawnSync('node', ['scripts/check-placeholders.mjs', dir], {
    env: { ...process.env, DEPLOY_ENV: env },
    shell: true,
    encoding: 'utf8',
  });
}

function htmlFiles(dir: string): string[] {
  return readdirSync(dir, { recursive: true, withFileTypes: false } as any)
    .map(String)
    .filter((f) => f.endsWith('.html'))
    .map((f) => join(dir, f));
}

beforeAll(() => {
  build(PREVIEW, 'preview');
  build(PROD, 'production');
}, 600_000);

describe('preview build', () => {
  it('blocks all crawlers', () => {
    const robots = readRaw('robots.txt', PREVIEW);
    expect(robots).toMatch(/User-agent: \*\s+Disallow: \//);
  });
  it('marks every page noindex', () => {
    for (const f of htmlFiles(PREVIEW)) expect(readFileSync(f, 'utf8'), f).toMatch(/<meta name="robots" content="noindex/);
  });
  it('flags the environment on the page', () => {
    expect(load('/en/', PREVIEW).querySelector('html')?.getAttribute('data-env')).toBe('preview');
  });
  it('lets the placeholder check pass with a warning', () => {
    const r = check(PREVIEW, 'preview');
    expect(r.status).toBe(0);
    expect(r.stdout + r.stderr).toMatch(/placeholder/i);
  });
});

describe('production build', () => {
  it('allows all crawlers, including AI crawlers, and points to the sitemap', () => {
    const robots = readRaw('robots.txt', PROD);
    expect(robots).toContain('Allow: /');
    expect(robots).not.toMatch(/Disallow: \/\s*$/m);
    for (const bot of ['GPTBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended']) expect(robots).toContain(`User-agent: ${bot}`);
    expect(robots).toContain('Sitemap: https://rvl.design/sitemap-index.xml');
  });
  it('does not mark content pages noindex', () => {
    for (const p of ['/en/', '/ar/', '/en/about/', '/ar/projects/sea-chalet/'])
      expect(load(p, PROD).querySelector('meta[name=robots]')).toBeNull();
  });
  it('publishes a bilingual sitemap with alternates', () => {
    const files = readdirSync(PROD).filter((f) => /^sitemap-\d+\.xml$/.test(f));
    const xml = files.map((f) => readFileSync(join(PROD, f), 'utf8')).join('');
    expect(xml).toContain('<loc>https://rvl.design/en/about/</loc>');
    expect(xml).toContain('<loc>https://rvl.design/ar/about/</loc>');
    expect(xml).toContain('hreflang="ar"');
    expect(xml).not.toContain('<loc>https://rvl.design/404/</loc>');
  });
  it('emits no llms.txt', () => {
    expect(existsSync(join(PROD, 'llms.txt'))).toBe(false);
  });
  it('fails the placeholder check while placeholders remain, naming pages and fields', () => {
    const r = check(PROD, 'production');
    expect(r.status).toBe(1);
    const out = r.stdout + r.stderr;
    expect(out).toContain('/ar/');
    expect(out).toContain('map');
    expect(out).toContain('arabic-unreviewed');
  });
});
