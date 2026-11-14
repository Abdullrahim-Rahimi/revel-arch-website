// Business facts. Values listed in `placeholders` are unconfirmed and must be
// replaced with the owner's answers (see the content questionnaire on Jira PD-7489).
export type DeployEnv = 'preview' | 'production';

const env = (typeof process !== 'undefined' ? process.env.DEPLOY_ENV : undefined) as string | undefined;

export const siteConfig = {
  url: 'https://rvl.design',
  name: { en: 'Revēl Architecture', ar: 'ريفيل للعمارة' },
  shortName: { en: 'Revēl', ar: 'ريفيل' },
  legalName: 'Revel Architecture',
  phone: '+965 0000 0000',
  whatsapp: '+965 0000 0000',
  email: 'info@rvl.design',
  address: {
    en: { street: '[Street, block, building]', locality: 'Kuwait City', country: 'Kuwait' },
    ar: { street: '[الشارع، القطعة، المبنى]', locality: 'مدينة الكويت', country: 'الكويت' },
  },
  geo: { lat: 29.3759, lng: 47.9774 },
  /** Google Maps link to the office pin (placeholder field 'map'). */
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Kuwait+City',
  hours: { days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'], opens: '09:00', closes: '17:00' },
  instagram: 'https://www.instagram.com/rvl.arch/',
  sameAs: ['https://www.instagram.com/rvl.arch/'],
  /** Field names still awaiting the owner's confirmation. */
  placeholders: ['phone', 'whatsapp', 'email', 'address', 'geo', 'map', 'hours'] as string[],
  /** Set true once a native Arabic reader has approved all Arabic copy. */
  arabicApproved: false,
  deployEnv: (env === 'production' ? 'production' : 'preview') as DeployEnv,
};

export type SiteConfig = typeof siteConfig;

export const isPlaceholder = (field: string, cfg: SiteConfig = siteConfig) => cfg.placeholders.includes(field);
