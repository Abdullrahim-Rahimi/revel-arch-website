import { describe, it, expect } from 'vitest';
import { load, readRaw, ldOf } from './helpers';

const IDS = ['villas', 'chalets', 'commercial', 'interiors', 'supervision'];

describe.each(['en', 'ar'] as const)('services /%s/services/', (lang) => {
  const root = load(`/${lang}/services/`);

  it('has one section per service, in order, each anchored by id', () => {
    const ids = root.querySelectorAll('section[data-service]').map((s) => s.getAttribute('id'));
    expect(ids).toEqual(IDS);
  });

  it('gives each service a heading, a deliverables list and FAQs', () => {
    for (const s of root.querySelectorAll('section[data-service]')) {
      expect(s.querySelector('h2')).not.toBeNull();
      expect(s.querySelectorAll('ul.deliverables li').length).toBeGreaterThan(0);
      expect(s.querySelectorAll('details').length).toBeGreaterThanOrEqual(2);
    }
  });

  it('publishes one FAQPage matching the visible questions', () => {
    const faqs = ldOf(root).filter((x) => x['@type'] === 'FAQPage');
    expect(faqs).toHaveLength(1);
    expect(faqs[0].mainEntity).toHaveLength(root.querySelectorAll('details').length);
  });

  it('keeps every answer in the HTML, readable without JavaScript', () => {
    const html = readRaw(`/${lang}/services/`).replace(/<script[\s\S]*?<\/script>/g, '');
    const faqs = ldOf(root).find((x) => x['@type'] === 'FAQPage');
    for (const q of faqs.mainEntity) expect(html).toContain(q.acceptedAnswer.text.slice(0, 40).replace(/'/g, '&#39;').replace(/"/g, '&quot;').replace(/&(?!#|quot)/g, '&amp;'));
  });

  it('shows a process and a last-updated date', () => {
    expect(root.querySelectorAll('ol.process li').length).toBeGreaterThanOrEqual(4);
    expect(root.querySelector('main time[datetime]')).not.toBeNull();
  });
});
