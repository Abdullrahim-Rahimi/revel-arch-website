// JSON-LD builders. Values still listed as placeholders in siteConfig are omitted,
// never published as fake facts.
import type { Lang } from '../i18n/utils';
import { otherLang } from '../i18n/utils';
import { siteConfig, type SiteConfig } from '../site.config';

const CTX = 'https://schema.org';
export const ORG_ID = 'https://rvl.design/#org';
export const PERSON_ID = 'https://rvl.design/#lead-architect';

const has = (cfg: SiteConfig, field: string) => !cfg.placeholders.includes(field);

export function organizationLd(lang: Lang, cfg: SiteConfig = siteConfig): Record<string, any> {
  const addr = cfg.address[lang];
  const o: Record<string, any> = {
    '@context': CTX,
    '@type': ['Organization', 'ProfessionalService'],
    '@id': ORG_ID,
    name: cfg.name[lang],
    alternateName: cfg.name[otherLang(lang)],
    foundingDate: String(cfg.foundingYear),
    url: `${cfg.url}/${lang}/`,
    logo: `${cfg.url}/og-default.jpg`,
    image: `${cfg.url}/og-default.jpg`,
    description:
      lang === 'ar'
        ? 'مكتب عمارة في الكويت يصمّم فللاً وشاليهات ومبانيَ تجارية راقية، مصمّمة حسب احتياجات المالك وأسلوب حياته.'
        : 'Architecture firm in Kuwait designing high-end villas, chalets and commercial buildings, each customised to its owner\'s needs and way of life.',
    address: {
      '@type': 'PostalAddress',
      addressLocality: addr.locality,
      addressCountry: 'KW',
      ...(has(cfg, 'address') ? { streetAddress: `${addr.street}, ${addr.area}`, postalCode: addr.postalCode } : {}),
    },
    areaServed: { '@type': 'Country', name: lang === 'ar' ? 'الكويت' : 'Kuwait' },
    knowsLanguage: ['en', 'ar'],
    sameAs: cfg.sameAs,
    founder: { '@id': PERSON_ID },
  };
  if (has(cfg, 'phone')) o.telephone = cfg.phone;
  if (has(cfg, 'email')) o.email = cfg.email;
  if (has(cfg, 'geo')) o.geo = { '@type': 'GeoCoordinates', latitude: cfg.geo.lat, longitude: cfg.geo.lng };
  if (has(cfg, 'hours'))
    o.openingHoursSpecification = [
      { '@type': 'OpeningHoursSpecification', dayOfWeek: cfg.hours.days, opens: cfg.hours.opens, closes: cfg.hours.closes },
    ];
  return o;
}

export function personLd(
  lang: Lang,
  extra: { knowsAbout?: string[]; image?: string; description?: string } = {},
  cfg: SiteConfig = siteConfig,
): Record<string, any> {
  // He goes by "Husain"; "Sayed" is legally part of his name, kept for search matching only.
  return {
    '@context': CTX,
    '@type': 'Person',
    '@id': PERSON_ID,
    name: lang === 'ar' ? 'حسين الموسوي' : 'Husain Almousawi',
    alternateName: lang === 'ar' ? 'السيد حسين الموسوي' : 'Sayed Husain Almousawi',
    honorificPrefix: lang === 'ar' ? 'السيد' : 'Sayed',
    jobTitle: lang === 'ar' ? 'المؤسس والمعماري الرئيسي' : 'Founder & Principal Architect',
    worksFor: { '@id': ORG_ID },
    url: `${cfg.url}/${lang}/lead-architect/`,
    alumniOf: { '@type': 'CollegeOrUniversity', name: cfg.leadArchitect.alumniOf },
    sameAs: [cfg.leadArchitect.linkedin],
    ...(extra.description ? { description: extra.description } : {}),
    ...(extra.knowsAbout ? { knowsAbout: extra.knowsAbout } : {}),
    ...(extra.image ? { image: extra.image } : {}),
  };
}

export function breadcrumbLd(items: { name: string; url: string }[]): Record<string, any> {
  return {
    '@context': CTX,
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: it.url })),
  };
}

export function faqLd(items: { q: string; a: string }[]): Record<string, any> {
  return {
    '@context': CTX,
    '@type': 'FAQPage',
    mainEntity: items.map((it) => ({ '@type': 'Question', name: it.q, acceptedAnswer: { '@type': 'Answer', text: it.a } })),
  };
}

export function projectLd(p: {
  name: string;
  description: string;
  url: string;
  image: string[];
  location: string;
  type: string;
  year?: number;
  lang?: Lang;
}): Record<string, any> {
  return {
    '@context': CTX,
    '@type': 'CreativeWork',
    name: p.name,
    description: p.description,
    url: p.url,
    image: p.image,
    genre: p.type,
    ...(p.lang ? { inLanguage: p.lang } : {}),
    creator: { '@id': ORG_ID },
    contentLocation: { '@type': 'Place', name: p.location, address: { '@type': 'PostalAddress', addressCountry: 'KW' } },
    ...(p.year ? { dateCreated: String(p.year) } : {}),
  };
}
