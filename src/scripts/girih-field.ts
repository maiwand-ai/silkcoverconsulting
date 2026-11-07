/**
 * Live girih field: an interlaced {8/3} star pattern that assembles outward from an
 * origin, lit by a turquoise "lantern" that follows the pointer (or drifts at rest).
 * Canvas 2D, batched by brightness so it stays cheap. Pauses offscreen.
 */

interface Options {
  /** Origin of the assembly ripple, as a share of width/height. */
  origin?: [number, number];
  /** Origin used when the canvas is portrait (phones). */
  originPortrait?: [number, number];
  /** Darken the side behind the headline. */
  veil?: 'left' | 'none';
  /** Delay before the pattern starts assembling (ms). */
  delay?: number;
  /** Right-to-left page: the headline sits on the right, so the veil does too. */
  rtl?: boolean;
}

const BG = '#0e1a2b';
const BUCKETS = 8;

export function mountGirihField(canvas: HTMLCanvasElement, host: HTMLElement, opts: Options = {}) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const { origin = [0.66, 0.5], originPortrait = [0.5, 0.3], veil = 'left', delay = 0, rtl = false } = opts;

  type Seg = { ax: number; ay: number; bx: number; by: number; mx: number; my: number; d: number; inner: boolean };
  let W = 0, H = 0, sz = 80, segs: Seg[] = [], portrait = false, ox = 0, oy = 0;
  let t0 = performance.now() + delay;
  let visible = true, raf = 0;
  const pointer = { x: 0, y: 0, sx: 0, sy: 0, active: false };

  function build() {
    const r = host.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    W = r.width; H = r.height;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    portrait = W < H * 1.05;
    sz = Math.max(52, Math.min(118, Math.min(W, H) / 6.4));
    [ox, oy] = portrait ? [originPortrait[0] * W, originPortrait[1] * H] : [origin[0] * W, origin[1] * H];
    const maxD = Math.hypot(W, H) * 0.75;
    const R = sz * 0.47, Ri = R * 0.36, Rq = sz * 0.17;
    segs = [];
    for (let i = -1; i <= Math.ceil(W / sz) + 1; i++) {
      for (let j = -1; j <= Math.ceil(H / sz) + 1; j++) {
        const x = i * sz, y = j * sz;
        const d = (Math.hypot(x - ox, y - oy) / maxD) * 0.62;
        const v: [number, number][] = [], w: [number, number][] = [];
        for (let k = 0; k < 8; k++) {
          const a = (k * Math.PI) / 4 + Math.PI / 8;
          v.push([x + R * Math.cos(a), y + R * Math.sin(a)]);
          const b = (k * Math.PI) / 4;
          w.push([x + Ri * Math.cos(b), y + Ri * Math.sin(b)]);
        }
        for (let k = 0; k < 8; k++) {
          const a = v[k], b = v[(k + 3) % 8];
          segs.push({ ax: a[0], ay: a[1], bx: b[0], by: b[1], mx: (a[0] + b[0]) / 2, my: (a[1] + b[1]) / 2, d, inner: false });
          const c = w[k], e = w[(k + 1) % 8];
          segs.push({ ax: c[0], ay: c[1], bx: e[0], by: e[1], mx: x, my: y, d: d + 0.05, inner: true });
        }
        // small rotated square in the gap between four stars, as in Herat strapwork
        const qx = x + sz / 2, qy = y + sz / 2;
        for (let k = 0; k < 4; k++) {
          const a1 = (k * Math.PI) / 2, a2 = ((k + 1) * Math.PI) / 2;
          segs.push({ ax: qx + Rq * Math.cos(a1), ay: qy + Rq * Math.sin(a1), bx: qx + Rq * Math.cos(a2), by: qy + Rq * Math.sin(a2), mx: qx, my: qy, d: d + 0.08, inner: true });
        }
      }
    }
    draw(performance.now());
  }

  const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  function draw(now: number) {
    const c = ctx!;
    const p = reduce ? 1 : Math.min(1, Math.max(0, (now - t0) / 2600));
    pointer.sx += (pointer.x - pointer.sx) * 0.1;
    pointer.sy += (pointer.y - pointer.sy) * 0.1;
    let lx: number, ly: number;
    if (pointer.active) { lx = pointer.sx; ly = pointer.sy; }
    else if (reduce) { lx = ox; ly = oy; }
    else if (portrait) { const t = now * 0.00016; lx = W * (0.5 + 0.35 * Math.cos(t)); ly = H * (0.12 + 0.06 * Math.sin(t * 1.3)); }
    else { const t = now * 0.00016; lx = ox + Math.cos(t) * W * 0.16; ly = oy + Math.sin(t * 1.3) * H * 0.18; }

    c.fillStyle = BG; c.fillRect(0, 0, W, H);
    const paths = [Array.from({ length: BUCKETS }, () => new Path2D()), Array.from({ length: BUCKETS }, () => new Path2D())];
    const sig2 = 2 * (sz * 2.3) ** 2;
    for (const s of segs) {
      let l = Math.min(1, Math.max(0, (p - s.d) / 0.36));
      if (l <= 0) continue;
      l = ease(l);
      const glow = Math.exp(-((s.mx - lx) ** 2 + (s.my - ly) ** 2) / sig2);
      const path = paths[s.inner ? 1 : 0][Math.min(BUCKETS - 1, Math.floor(glow * BUCKETS))];
      path.moveTo(s.ax, s.ay);
      path.lineTo(s.ax + (s.bx - s.ax) * l, s.ay + (s.by - s.ay) * l);
    }
    c.lineWidth = 1;
    for (let b = 0; b < BUCKETS; b++) {
      const f = b / (BUCKETS - 1);
      c.strokeStyle = `rgba(${Math.round(242 - 163 * f)},${Math.round(236 - 47 * f)},${Math.round(223 - 46 * f)},${0.075 + f * 0.85})`;
      c.stroke(paths[0][b]);
      c.strokeStyle = `rgba(176,141,87,${0.1 + f * 0.8})`;
      c.stroke(paths[1][b]);
    }
    if (veil === 'left') {
      if (portrait) { c.fillStyle = 'rgba(14,26,43,0.5)'; c.fillRect(0, 0, W, H); }
      const g = portrait ? c.createLinearGradient(0, H, 0, H * 0.12) : rtl ? c.createLinearGradient(W, 0, W * 0.22, 0) : c.createLinearGradient(0, 0, W * 0.78, 0);
      g.addColorStop(0, 'rgba(14,26,43,0.96)');
      g.addColorStop(0.45, 'rgba(14,26,43,0.62)');
      g.addColorStop(1, 'rgba(14,26,43,0)');
      c.fillStyle = g; c.fillRect(0, 0, W, H);
    }
    const top = c.createLinearGradient(0, 0, 0, 120);
    top.addColorStop(0, 'rgba(14,26,43,0.8)'); top.addColorStop(1, 'rgba(14,26,43,0)');
    c.fillStyle = top; c.fillRect(0, 0, W, 120);
  }

  function loop(now: number) {
    if (visible && !document.hidden) draw(now);
    raf = requestAnimationFrame(loop);
  }

  host.addEventListener('pointermove', (e) => {
    const r = host.getBoundingClientRect();
    pointer.x = e.clientX - r.left; pointer.y = e.clientY - r.top;
    if (!pointer.active) { pointer.sx = pointer.x; pointer.sy = pointer.y; }
    pointer.active = true;
    if (reduce) draw(performance.now());
  });
  host.addEventListener('pointerleave', () => { pointer.active = false; if (reduce) draw(performance.now()); });

  new ResizeObserver(() => build()).observe(host);
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(host);
  if (!reduce) raf = requestAnimationFrame(loop);

  return {
    replay() { t0 = performance.now(); },
    destroy() { cancelAnimationFrame(raf); },
  };
}
