"use client";

import { useRef } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { cn, pos } from "@/lib/utils";

type Tag = "h1" | "h2" | "h3" | "p" | "div" | "span" | "li";

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Masked line reveal — lines rise out of their baseline (works centred). */
export function Lines({
  children,
  as: T = "div",
  className,
  delay = 0,
  stagger = 0.08,
  start = "top 88%",
  immediate = false,
}: {
  children: React.ReactNode;
  as?: Tag;
  className?: string;
  delay?: number;
  stagger?: number;
  start?: string;
  immediate?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (reduced()) {
        el.style.visibility = "visible";
        return;
      }
      SplitText.create(el, {
        type: "lines",
        mask: "lines",
        linesClass: "line",
        autoSplit: true,
        onSplit(self) {
          el.style.visibility = "visible";
          return gsap.from(self.lines, {
            yPercent: 110,
            duration: 1.3,
            ease: "expo.out",
            stagger,
            delay,
            scrollTrigger: immediate ? undefined : { trigger: el, start },
          });
        },
      });
    },
    { scope: ref },
  );
  return (
    <T ref={ref as React.Ref<never>} className={cn(className)} style={{ visibility: "hidden" }}>
      {children}
    </T>
  );
}

/** Fade/rise on enter. */
export function Rise({
  children,
  className,
  delay = 0,
  y = 28,
  as: T = "div",
  start = "top 90%",
  style,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: Tag;
  start?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const el = ref.current;
      if (!el || reduced()) return;
      gsap.from(el, { y, autoAlpha: 0, duration: 1.2, delay, ease: "expo.out", scrollTrigger: { trigger: el, start } });
    },
    { scope: ref },
  );
  return (
    <T ref={ref as React.Ref<never>} className={className} style={style}>
      {children}
    </T>
  );
}

/** A stamp: pressed in from slightly larger, settling to size. */
export function Stamp({ children, className, delay = 0, start = "top 88%", as: T = "div" }: { children: React.ReactNode; className?: string; delay?: number; start?: string; as?: Tag }) {
  const ref = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const el = ref.current;
      if (!el || reduced()) return;
      gsap.from(el, { scale: 1.12, autoAlpha: 0, duration: 1.1, delay, ease: "expo.out", transformOrigin: "50% 50%", scrollTrigger: { trigger: el, start } });
    },
    { scope: ref },
  );
  return (
    <T ref={ref as React.Ref<never>} className={className}>
      {children}
    </T>
  );
}

/** Children stagger in from the centre outwards — for symmetric grids. */
export function CenterStagger({
  children,
  className,
  y = 22,
  each = 0.07,
  start = "top 85%",
  as: T = "div",
}: {
  children: React.ReactNode;
  className?: string;
  y?: number;
  each?: number;
  start?: string;
  as?: "div" | "ul" | "ol";
}) {
  const ref = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const el = ref.current;
      if (!el || reduced()) return;
      gsap.from(el.children, { y, autoAlpha: 0, duration: 1, ease: "expo.out", stagger: { each, from: "center" }, scrollTrigger: { trigger: el, start } });
    },
    { scope: ref },
  );
  return (
    <T ref={ref as React.Ref<never>} className={className}>
      {children}
    </T>
  );
}

/** Words brighten one by one as the reader scrolls (scrubbed). */
export function Words({ children, className, as: T = "p" }: { children: string; className?: string; as?: Tag }) {
  const ref = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const el = ref.current;
      if (!el || reduced()) return;
      const split = SplitText.create(el, { type: "words", wordsClass: "word" });
      gsap.fromTo(split.words, { opacity: 0.16 }, { opacity: 1, ease: "none", stagger: 0.08, scrollTrigger: { trigger: el, start: "top 78%", end: "bottom 48%", scrub: 0.6 } });
    },
    { scope: ref },
  );
  return (
    <T ref={ref as React.Ref<never>} className={className}>
      {children}
    </T>
  );
}

/**
 * Unfold: the frame opens from its centre line outwards — like a carton
 * flap — and the picture inside settles.
 */
export function Unfold({
  children,
  className,
  axis = "x",
  start = "top 85%",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  axis?: "x" | "y";
  start?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const el = ref.current;
      if (!el || reduced()) return;
      const closed = axis === "x" ? "inset(0 50% 0 50%)" : "inset(50% 0 50% 0)";
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start }, delay });
      tl.fromTo(el, { clipPath: closed }, { clipPath: "inset(0 0 0 0)", duration: 1.25, ease: "expo.inOut" });
      if (el.firstElementChild) tl.fromTo(el.firstElementChild, { scale: 1.1 }, { scale: 1, duration: 1.6, ease: "expo.out" }, 0.15);
    },
    { scope: ref },
  );
  return (
    <div ref={ref} className={cn(pos(className), "overflow-hidden", className)}>
      {children}
    </div>
  );
}

/** A band fills from the centre outwards as it enters. */
export function Fill({ children, className, start = "top 92%" }: { children: React.ReactNode; className?: string; start?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const el = ref.current;
      if (!el || reduced()) return;
      gsap.from(el, { scaleX: 0, transformOrigin: "50% 50%", duration: 1, ease: "expo.inOut", scrollTrigger: { trigger: el, start } });
      gsap.from(el.children, { autoAlpha: 0, duration: 0.6, delay: 0.6, scrollTrigger: { trigger: el, start } });
    },
    { scope: ref },
  );
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
