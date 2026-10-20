"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { scrollState } from "@/components/providers/SmoothScroll";
import { MONOGRAM, MONOGRAM_SIZE } from "@/lib/brand.generated";
import { cn } from "@/lib/utils";

export type TowerHandle = { replay: () => void };

type Props = {
  className?: string;
  /** windows across */
  cols?: number;
  /** windows down (defaults to fill the box at the cell size the columns give) */
  rows?: number;
  /** keep the mark lit */
  lit?: boolean;
  /** light the mark window by window on mount */
  intro?: boolean;
  /** how many of the other flats have someone home, 0..1 */
  occupancy?: number;
  /** flicker when the page is scrolled fast */
  reactive?: boolean;
  tone?: "night" | "ink";
};

/**
 * The tower block from the film, as a canvas: a grid of windows, most of
 * them dark, a few lit, and the THE monogram switched on across the facade.
 * Flats flicker on and off at random; throwing the page makes the whole
 * block busier.
 */
const Tower = forwardRef<TowerHandle, Props>(function Tower({ className, cols = 57, rows, lit = true, intro = false, occupancy = 0.12, reactive = true, tone = "night" }, ref) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const api = useRef<{ replay: () => void }>({ replay: () => undefined });
  useImperativeHandle(ref, () => ({ replay: () => api.current.replay() }), []);

  useEffect(() => {
    const c = canvas.current;
    const parent = c?.parentElement;
    if (!c || !parent) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let W = 0;
    let H = 0;
    let R = rows ?? 0;
    let cell = 0;
    let ox = 0;
    let oy = 0;
    // per-window: current light, target light, kind (0 dark flat, 1 lit flat, 2 mark)
    let cur = new Float32Array(0);
    let tgt = new Float32Array(0);
    let kind = new Uint8Array(0);
    let order: number[] = [];
    let introT = -1;
    let raf = 0;
    let visible = true;
    let flickerClock = 0;

    const rand = mulberry32(1337);

    const layout = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      W = parent.clientWidth;
      H = parent.clientHeight;
      c.width = Math.round(W * dpr);
      c.height = Math.round(H * dpr);
      c.style.width = `${W}px`;
      c.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cell = W / cols;
      R = rows ?? Math.max(MONOGRAM_SIZE + 2, Math.floor(H / cell));
      ox = (W - cols * cell) / 2;
      oy = (H - R * cell) / 2;
      const n = cols * R;
      cur = new Float32Array(n);
      tgt = new Float32Array(n);
      kind = new Uint8Array(n);
      const mx = Math.floor((cols - MONOGRAM_SIZE) / 2);
      const my = Math.floor((R - MONOGRAM_SIZE) / 2);
      order = [];
      for (let y = 0; y < R; y++) {
        for (let x = 0; x < cols; x++) {
          const i = y * cols + x;
          const inMark = x >= mx && x < mx + MONOGRAM_SIZE && y >= my && y < my + MONOGRAM_SIZE && MONOGRAM[y - my][x - mx] === "1";
          if (inMark) {
            kind[i] = 2;
            order.push(i);
            const on = lit && !(intro && !reduced);
            cur[i] = tgt[i] = on ? 1 : 0;
          } else {
            const home = rand() < occupancy;
            kind[i] = home ? 1 : 0;
            cur[i] = tgt[i] = home ? 0.25 + rand() * 0.45 : 0;
          }
        }
      }
      // shuffle the mark so it lights up like a block of flats, not a scan
      for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [order[i], order[j]] = [order[j], order[i]];
      }
    };

    const replay = () => {
      for (const i of order) {
        cur[i] = 0;
        tgt[i] = 0;
      }
      introT = 0;
    };
    api.current.replay = replay;

    const amber = tone === "night" ? [240, 179, 67] : [13, 13, 13];
    const dark = tone === "night" ? [243, 241, 236] : [13, 13, 13];

    const draw = (dt: number) => {
      ctx.clearRect(0, 0, W, H);
      const pad = cell * 0.3;
      const w = cell - pad;
      // flicker: the faster the page moves, the more flats switch
      const v = reactive ? Math.min(1, Math.abs(scrollState.velocity) / 40) : 0;
      flickerClock += dt * (1 + v * 14);
      while (flickerClock > 0.08) {
        flickerClock -= 0.08;
        if (reduced) break;
        const i = Math.floor(Math.random() * cur.length);
        if (kind[i] === 1) tgt[i] = tgt[i] > 0.1 ? (Math.random() < 0.35 ? 0 : tgt[i]) : 0.3 + Math.random() * 0.5;
        else if (kind[i] === 0 && Math.random() < 0.18 + v * 0.5) tgt[i] = 0.18 + Math.random() * 0.4;
        else if (kind[i] === 0) tgt[i] = 0;
      }
      // the mark switching on
      if (introT >= 0) {
        introT += dt;
        const lit_n = Math.min(order.length, Math.floor((introT / 0.95) * order.length));
        for (let k = 0; k < lit_n; k++) tgt[order[k]] = 1;
        if (lit_n >= order.length) introT = -1;
      }
      for (let i = 0; i < cur.length; i++) {
        const k = kind[i] === 2 ? 0.12 : 0.06;
        cur[i] += (tgt[i] - cur[i]) * Math.min(1, k * (dt * 60));
        const x = ox + (i % cols) * cell + pad / 2;
        const y = oy + Math.floor(i / cols) * cell + pad / 2;
        const l = cur[i];
        if (l < 0.02) {
          ctx.fillStyle = `rgba(${dark[0]},${dark[1]},${dark[2]},${tone === "night" ? 0.05 : 0.07})`;
        } else if (kind[i] === 2) {
          ctx.fillStyle = `rgba(${amber[0]},${amber[1]},${amber[2]},${0.25 + l * 0.75})`;
        } else {
          // neighbours' lights are a little cooler than the mark
          ctx.fillStyle = tone === "night" ? `rgba(236,214,170,${l * 0.8})` : `rgba(13,13,13,${l * 0.7})`;
        }
        ctx.fillRect(x, y, w, w);
      }
    };

    let last = performance.now();
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      draw(dt);
    };

    layout();
    if (intro && !reduced) replay();
    draw(0);
    if (!reduced) raf = requestAnimationFrame(loop);

    const ro = new ResizeObserver(() => {
      layout();
      draw(0);
    });
    ro.observe(parent);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      last = performance.now();
    });
    io.observe(c);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [cols, rows, lit, intro, occupancy, reactive, tone]);

  return <canvas ref={canvas} className={cn("block h-full w-full", className)} aria-hidden />;
});

export default Tower;

function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
