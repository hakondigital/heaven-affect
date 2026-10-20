import { clsx, type ClassValue } from "clsx";

export const cn = (...inputs: ClassValue[]) => clsx(inputs);

/** "relative" unless the caller already positions the element (absolute/fixed/sticky). */
export const pos = (className?: string) => (className && /\b(absolute|fixed|sticky)\b/.test(className) ? undefined : "relative");

export const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const mapRange = (v: number, a: number, b: number, c = 0, d = 1) => clamp((v - a) / (b - a)) * (d - c) + c;

export const isExternal = (href: string) => /^(https?:)?\/\//.test(href) || href.startsWith("mailto:") || href.startsWith("tel:");

export const pad = (n: number, len = 2) => String(Math.floor(Math.abs(n))).padStart(len, "0");

export const prefersReducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const isTouch = () => typeof window !== "undefined" && window.matchMedia("(hover: none), (pointer: coarse)").matches;

/** Deterministic 0..1 from a string — stable per product, for barcodes and flicker seeds. */
export const hash01 = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 10000) / 10000;
};
