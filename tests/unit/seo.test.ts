import { describe, it, expect } from 'vitest';
import { organizationLd, personLd, breadcrumbLd, faqLd, projectLd } from '../../src/lib/seo';
import { siteConfig } from '../../src/site.config';

const roundTrip = (x: unknown) => JSON.parse(JSON.stringify(x));

describe('organizationLd', () => {
  it('names the firm in each language', () => {
    expect(organizationLd('en').name).toBe('Revēl Architecture');
    expect(organizationLd('ar').name).toBe('مكتب رڤيل للتصميم المعماري');
    expect(organizationLd('en').alternateName).toBe('مكتب رڤيل للتصميم المعماري');
  });
  it('is a professional service with a stable id linked to the founder', () => {
    const o = organizationLd('en');
    expect(o['@type']).toEqual(['Organization', 'ProfessionalService']);
    expect(o['@id']).toBe('https://rvl.design/#org');
    expect(o.founder['@id']).toBe(personLd('en')['@id']);
    expect(o.sameAs).toContain('https://www.instagram.com/rvl.arch/');
    expect(o.address.addressCountry).toBe('KW');
  });
  it('omits placeholder contact facts instead of publishing fake values', () => {
    const withPh = organizationLd('en', { ...siteConfig, placeholders: ['phone', 'email', 'geo'] });
    expect(withPh.telephone).toBeUndefined();
    expect(withPh.email).toBeUndefined();
    expect(withPh.geo).toBeUndefined();
    const confirmed = organizationLd('en', { ...siteConfig, placeholders: [] });
    expect(confirmed.telephone).toBe(siteConfig.phone);
    expect(confirmed.email).toBe(siteConfig.email);
    expect(confirmed.geo['@type']).toBe('GeoCoordinates');
    expect(confirmed.openingHoursSpecification[0].opens).toBe('08:00');
  });
});

describe('personLd', () => {
  it('describes the lead architect with honorific and employer', () => {
    const p = personLd('en');
    expect(p['@type']).toBe('Person');
    expect(p['@id']).toBe('https://rvl.design/#lead-architect');
    expect(p.name).toBe('Husain Almousawi');
    expect(p.honorificPrefix).toBe('Sayed');
    expect(p.worksFor['@id']).toBe('https://rvl.design/#org');
    expect(personLd('ar').name).toBe('حسين الموسوي');
  });
  it('accepts expertise and image', () => {
    const p = personLd('en', { knowsAbout: ['Villa design'], image: 'https://rvl.design/x.jpg' });
    expect(p.knowsAbout).toEqual(['Villa design']);
    expect(p.image).toBe('https://rvl.design/x.jpg');
  });
});

describe('breadcrumbLd', () => {
  it('numbers positions from 1', () => {
    const b = breadcrumbLd([{ name: 'Home', url: 'https://rvl.design/en/' }, { name: 'About', url: 'https://rvl.design/en/about/' }]);
    expect(b['@type']).toBe('BreadcrumbList');
    expect(b.itemListElement.map((i: any) => i.position)).toEqual([1, 2]);
    expect(b.itemListElement[1].item).toBe('https://rvl.design/en/about/');
  });
});

describe('faqLd', () => {
  it('maps questions and answers', () => {
    expect(faqLd([{ q: 'Q', a: 'A' }]).mainEntity[0]).toEqual({
      '@type': 'Question', name: 'Q', acceptedAnswer: { '@type': 'Answer', text: 'A' },
    });
  });
});

describe('projectLd', () => {
  it('describes a project with location and creator', () => {
    const p = projectLd({ name: 'Villa', description: 'D', url: 'https://rvl.design/en/projects/v/', image: ['https://rvl.design/i.jpg'], location: 'Al-Mutlaa', type: 'villa', year: 2025 });
    expect(p['@type']).toBe('CreativeWork');
    expect(p.creator['@id']).toBe('https://rvl.design/#org');
    expect(p.contentLocation.name).toBe('Al-Mutlaa');
    expect(p.dateCreated).toBe('2025');
    const noYear = projectLd({ name: 'V', description: 'D', url: 'u', image: [], location: 'L', type: 'chalet' });
    expect('dateCreated' in noYear).toBe(false);
  });
});

describe('all builders', () => {
  it('produce plain JSON with schema.org context', () => {
    for (const x of [organizationLd('en'), personLd('ar'), breadcrumbLd([]), faqLd([]), projectLd({ name: 'a', description: 'b', url: 'c', image: [], location: 'd', type: 'villa' })]) {
      expect(roundTrip(x)).toEqual(x);
      expect(x['@context']).toBe('https://schema.org');
    }
  });
});
