/** Stable, URL-safe anchor id for a heading (Latin only; Arabic headings get an index-based id). */
export function anchorId(text: string, index: number, prefix = 'q'): string {
  const latin = text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return latin.length >= 3 ? latin.slice(0, 60) : `${prefix}-${index + 1}`;
}
