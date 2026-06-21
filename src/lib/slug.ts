// Must match server/gen-registry.mjs slug() so frontend agent ids == backend registry ids.
const MAP: Record<string, string> = {
  ç: 'c', ğ: 'g', ı: 'i', İ: 'i', ö: 'o', ş: 's', ü: 'u', â: 'a',
}
export function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/[çğıİöşüâ]/g, (c) => MAP[c] || c)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}
