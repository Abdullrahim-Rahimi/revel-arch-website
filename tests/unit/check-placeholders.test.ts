import { describe, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';

const run = (dir: string, env: string) =>
  spawnSync('node', ['scripts/check-placeholders.mjs', dir], { env: { ...process.env, DEPLOY_ENV: env }, shell: true, encoding: 'utf8' });

describe('placeholder gate catches leftover values that carry no marker', () => {
  it('blocks production when sentinel numbers or owner tokens remain', () => {
    const r = run('tests/fixtures/sentinel', 'production');
    expect(r.status).toBe(1);
    expect(r.stdout + r.stderr).toMatch(/sentinel/i);
    expect(r.stdout + r.stderr).toContain('[YEAR]');
  });
  it('only warns in preview', () => {
    expect(run('tests/fixtures/sentinel', 'preview').status).toBe(0);
  });
});
