export function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

const TRIVIAL_WORDS = new Set([
  "salt",
  "water",
  "pepper",
  "sugar",
  "oil",
  "to taste",
]);

export function isTrivialIngredient(name: string): boolean {
  const n = normalizeName(name);
  return TRIVIAL_WORDS.has(n);
}

function singularize(s: string): string {
  if (s.endsWith("ies") && s.length > 4) return s.slice(0, -3) + "y";
  if (s.endsWith("oes") && s.length > 4) return s.slice(0, -2);
  if (s.endsWith("s") && !s.endsWith("ss") && s.length > 3) return s.slice(0, -1);
  return s;
}

export function namesMatch(a: string, b: string): boolean {
  const aa = singularize(normalizeName(a));
  const bb = singularize(normalizeName(b));
  if (aa === bb) return true;
  if (aa.length >= 4 && bb.includes(aa)) return true;
  if (bb.length >= 4 && aa.includes(bb)) return true;
  return false;
}
