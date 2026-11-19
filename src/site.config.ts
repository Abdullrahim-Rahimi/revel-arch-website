// Business facts. Values listed in `placeholders` are unconfirmed and must be
// replaced with the owner's answers (see the content questionnaires on Jira PD-7489).
// Round 1 answers received 19 Nov 2026.
export type DeployEnv = 'preview' | 'production';

const env = (typeof process !== 'undefined' ? process.env.DEPLOY_ENV : undefined) as string | undefined;

export const siteConfig = {
  url: 'https://rvl.design',
  /** Arabic brand name as given by the owner. The licence name (شركة رفيل لاستشارات الديكور) is not used publicly. */
  name: { en: 'Revēl Architecture', ar: 'مكتب رڤيل للتصميم المعماري' },
  shortName: { en: 'Revēl', ar: 'رڤيل' },
  foundingYear: 2020,
  /** No separate office line was given; the WhatsApp number doubles as the phone number. */
  phone: '+965 9970 5773',
  whatsapp: '+965 9970 5773',
  email: 'hello@rvl.design',
  address: {
    en: {
      street: 'Floor 3, Office 4, Alnahda Real Estate Company Building, Plot 6B, Omar Ibn Al-Khattab Street, Block 3',
      area: 'Al-Mirqab',
      locality: 'Kuwait City',
      postalCode: '15000',
      country: 'Kuwait',
    },
    ar: {
      street: 'الدور 3، مكتب 4، مبنى شركة النهضة العقارية، قسيمة 6B، شارع عمر بن الخطاب، قطعة 3',
      area: 'المرقاب',
      locality: 'مدينة الكويت',
      postalCode: '15000',
      country: 'الكويت',
    },
  },
  /** Approximate until the owner sends the Google Maps pin (placeholder fields 'geo' and 'map'). */
  geo: { lat: 29.3759, lng: 47.9774 },
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Alnahda+Real+Estate+Company+Building+Al-Mirqab+Kuwait',
  hours: { days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'], opens: '08:00', closes: '16:00' },
  /** Promised reply time for enquiries, in hours. */
  replyHours: 3,
  instagram: 'https://www.instagram.com/rvl.arch/',
  linkedin: 'https://www.linkedin.com/company/rev%C4%93l',
  tiktok: 'https://www.tiktok.com/@rvl.arch',
  sameAs: [
    'https://www.instagram.com/rvl.arch/',
    'https://www.linkedin.com/company/rev%C4%93l',
    'https://www.tiktok.com/@rvl.arch',
  ],
  leadArchitect: {
    linkedin: 'https://kw.linkedin.com/in/husain-almousawi-172762289',
    alumniOf: 'Virginia Tech',
  },
  /** Field names still awaiting the owner's confirmation. */
  placeholders: ['geo', 'map'] as string[],
  /** Set true once a native Arabic reader has approved all Arabic copy. */
  arabicApproved: false,
  deployEnv: (env === 'production' ? 'production' : 'preview') as DeployEnv,
};

export type SiteConfig = typeof siteConfig;

export const isPlaceholder = (field: string, cfg: SiteConfig = siteConfig) => cfg.placeholders.includes(field);
