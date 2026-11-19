import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { parse, type HTMLElement } from 'node-html-parser';

export const DIST = process.env.DIST_DIR ?? 'dist';

/** Parse dist/<path>/index.html (or an explicit .html/.txt/.xml file). */
export function load(path: string, dist = DIST): HTMLElement {
  return parse(readRaw(path, dist));
}

export function readRaw(path: string, dist = DIST): string {
  const clean = path.replace(/^\//, '');
  const file = /\.(html|txt|xml)$/.test(clean) ? join(dist, clean) : join(dist, clean, 'index.html');
  if (!existsSync(file)) throw new Error(`Not built: ${file}`);
  return readFileSync(file, 'utf8');
}

/** All JSON-LD blocks on a page, flattened. */
export function ldOf(root: HTMLElement): any[] {
  return root
    .querySelectorAll('script[type="application/ld+json"]')
    .flatMap((s) => {
      const v = JSON.parse(s.textContent);
      return Array.isArray(v) ? v : [v];
    });
}

export const PAGES = ['/', '/about/', '/lead-architect/', '/services/', '/projects/', '/contact/'];
