/**
 * Geometry for the SilkCover "Girih" identity.
 * Every arch, star and tile on the site is generated here so the
 * proportions stay consistent across components.
 */

const f = (v: number) => +v.toFixed(2);

/** Pointed (two-centred) arch, the profile used for crops, reveals and the menu. */
const ARCH_E = 0.3; // centre offset as a share of half-span
const ARCH_R = 1 + ARCH_E; // radius as a share of half-span
export const ARCH_RISE = Math.sqrt(ARCH_R ** 2 - ARCH_E ** 2); // ≈ 1.265 × half-span

/** SVG path for a pointed arch. `a` is half the span, `jamb` the straight side height. */
export function archPath(cx: number, base: number, a: number, jamb: number): string {
  const r = ARCH_R * a;
  const y0 = base - jamb;
  const apex = y0 - ARCH_RISE * a;
  return `M${f(cx - a)} ${f(base)} L${f(cx - a)} ${f(y0)} A${f(r)} ${f(r)} 0 0 1 ${f(cx)} ${f(apex)} A${f(r)} ${f(r)} 0 0 1 ${f(cx + a)} ${f(y0)} L${f(cx + a)} ${f(base)} Z`;
}

/** Same arch as a CSS polygon() so it can be animated with clip-path. */
export function archPolygon(cx: number, base: number, a: number, jamb: number, n = 18): string {
  const e = ARCH_E * a;
  const r = ARCH_R * a;
  const y0 = base - jamb;
  const pts: [number, number][] = [
    [cx - a, base],
    [cx - a, y0],
  ];
  const fa = Math.acos(-e / r);
  for (let i = 1; i <= n; i++) {
    const t = Math.PI + (fa - Math.PI) * (i / n);
    pts.push([cx + e + r * Math.cos(t), y0 - r * Math.sin(t)]);
  }
  const fb = Math.acos(e / r);
  for (let i = n - 1; i >= 0; i--) {
    const t = fb * (i / n);
    pts.push([cx - e + r * Math.cos(t), y0 - r * Math.sin(t)]);
  }
  pts.push([cx + a, base]);
  return `polygon(${pts.map(([x, y]) => `${f(x)}% ${f(y)}%`).join(', ')})`;
}

function vertices(n: number, r: number, cx: number, cy: number, rotDeg: number) {
  return Array.from({ length: n }, (_, i) => {
    const t = ((rotDeg + (360 / n) * i) * Math.PI) / 180;
    return [cx + r * Math.cos(t), cy + r * Math.sin(t)] as const;
  });
}

const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);

/**
 * Stars made of overlapping triangles (n / gcd(n, k) === 3, e.g. {6/2} or {12/4})
 * read as a hexagram, a symbol that is not part of this identity. Never draw them.
 */
export function isTriangleCompound(n: number, k: number): boolean {
  return n / gcd(n, k) === 3;
}

/** Star polygon {n/k} drawn as separate chords, which gives the interlaced girih look. */
export function starPath(n: number, k: number, r: number, cx = 0, cy = 0, rotDeg = -90): string {
  if (isTriangleCompound(n, k)) {
    throw new Error(`starPath(${n}, ${k}) would draw overlapping triangles (a hexagram). Choose another fold or step.`);
  }
  const v = vertices(n, r, cx, cy, rotDeg);
  return v.map((p, i) => `M${f(p[0])} ${f(p[1])} L${f(v[(i + k) % n][0])} ${f(v[(i + k) % n][1])}`).join(' ');
}

/** Regular polygon outline. */
export function polygonPath(n: number, r: number, cx = 0, cy = 0, rotDeg = -90): string {
  const v = vertices(n, r, cx, cy, rotDeg);
  return `M${v.map((p) => `${f(p[0])} ${f(p[1])}`).join(' L')} Z`;
}

/** Point on a circle, degrees measured clockwise from the top. */
export function polar(r: number, deg: number, cx = 0, cy = 0) {
  const t = ((deg - 90) * Math.PI) / 180;
  return { x: f(cx + r * Math.cos(t)), y: f(cy + r * Math.sin(t)) };
}

/** The k that gives the most "girih-like" star for an n-fold rosette, skipping triangle compounds. */
export function defaultStep(n: number): number {
  if (n % 6 === 0 && n <= 6) throw new Error(`A ${n}-fold star can only be a hexagram; use 8, 10, 12 or more.`);
  const max = Math.floor((n - 1) / 2);
  let k = Math.max(2, max - (n >= 10 ? 1 : 0));
  while (k <= max && isTriangleCompound(n, k)) k++;
  if (isTriangleCompound(n, k)) k = max;
  return k;
}
