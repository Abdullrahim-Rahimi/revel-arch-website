import { describe, it, expect } from 'vitest';
import { formatHours } from '../../src/lib/hours';

const wk = { days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'], opens: '09:00', closes: '17:00' };

describe('formatHours', () => {
  it('describes a contiguous week in English and Arabic from the config', () => {
    expect(formatHours('en', wk)).toBe('Sunday to Thursday, 09:00–17:00');
    expect(formatHours('ar', wk)).toBe('من الأحد إلى الخميس، 09:00–17:00');
  });
  it('follows the config when it changes', () => {
    expect(formatHours('en', { days: ['Saturday', 'Sunday', 'Monday'], opens: '08:30', closes: '16:00' })).toBe('Saturday to Monday, 08:30–16:00');
    expect(formatHours('en', { days: ['Friday'], opens: '10:00', closes: '12:00' })).toBe('Friday, 10:00–12:00');
  });
});
