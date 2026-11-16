import type { Lang } from '../i18n/utils';

const AR_DAYS: Record<string, string> = {
  Saturday: 'السبت', Sunday: 'الأحد', Monday: 'الاثنين', Tuesday: 'الثلاثاء',
  Wednesday: 'الأربعاء', Thursday: 'الخميس', Friday: 'الجمعة',
};

/** Human-readable opening hours from siteConfig.hours (the same source as the JSON-LD). */
export function formatHours(lang: Lang, h: { days: string[]; opens: string; closes: string }): string {
  const day = (d: string) => (lang === 'ar' ? AR_DAYS[d] ?? d : d);
  const first = day(h.days[0]);
  const last = day(h.days[h.days.length - 1]);
  const time = `${h.opens}–${h.closes}`;
  if (h.days.length === 1) return lang === 'ar' ? `${first}، ${time}` : `${first}, ${time}`;
  return lang === 'ar' ? `من ${first} إلى ${last}، ${time}` : `${first} to ${last}, ${time}`;
}
