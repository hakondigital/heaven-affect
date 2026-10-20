"use client";

import { useEffect, useRef, useState } from "react";
import { scrollState } from "@/components/providers/SmoothScroll";
import { gsap, useGSAP } from "@/lib/gsap";
import { site } from "@/lib/content/site";
import { onReady } from "@/lib/intro";

/**
 * The die-line. A fixed frame just inside the viewport that everything
 * scrolls through. On arrival it draws itself clockwise from the top centre
 * and seals, then unwinds to the scroll position; from then on its border
 * follows the scroll, and its foot names the carton in view. It inverts
 * over any ground.
 */
export default function Frame() {
  const root = useRef<HTMLDivElement>(null);
  const rect = useRef<SVGRectElement>(null);
  const foot = useRef<HTMLSpanElement>(null);
  const live = useRef(false);
  const [caption, setCaption] = useState("");

  // ── arrival: draw, seal, unwind ────────────────────────────
  useGSAP(
    () => {
      const el = root.current;
      const r = rect.current;
      if (!el || !r) return;
      const q = gsap.utils.selector(el);
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) {
        live.current = true;
        return;
      }
      gsap.set(q("[data-fc]"), { autoAlpha: 0, y: 6 });
      gsap.set(q("[data-corner]"), { scale: 0, transformOrigin: "50% 50%" });
      const draw = { v: 0 };
      const apply = () => (r.style.strokeDasharray = `${draw.v} 1`);
      apply();

      return onReady(() => {
        gsap
          .timeline({ onComplete: () => (live.current = true) })
          .to(draw, { v: 1, duration: 1.15, ease: "expo.inOut", onUpdate: apply }, 0)
          .from(q("[data-corner]"), { scale: 0, duration: 0.6, ease: "back.out(2)", stagger: 0.06 }, 0.9)
          .to(q("[data-fc]"), { autoAlpha: 1, y: 0, duration: 0.8, ease: "expo.out", stagger: 0.08 }, 1.0)
          .to(draw, { v: () => Math.max(0.02, scrollState.progress || 0), duration: 0.7, ease: "expo.inOut", onUpdate: apply }, 1.35);
      });
    },
    { scope: root },
  );

  // ── the border follows the scroll ──────────────────────────
  useEffect(() => {
    const r = rect.current;
    if (!r) return;
    let raf = 0;
    let shown = -1;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!live.current) return;
      const p = Math.min(1, Math.max(0.02, scrollState.progress || 0));
      if (Math.abs(p - shown) < 0.0005) return;
      shown = p;
      r.style.strokeDasharray = `${p} 1`;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // ── which carton is in view ────────────────────────────────
  useEffect(() => {
    let io: IntersectionObserver | null = null;
    const wire = () => {
      io?.disconnect();
      io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) if (e.isIntersecting) setCaption((e.target as HTMLElement).dataset.caption ?? "");
        },
        { rootMargin: "-45% 0px -45% 0px" },
      );
      document.querySelectorAll<HTMLElement>("[data-caption]").forEach((el) => io!.observe(el));
    };
    wire();
    const mo = new MutationObserver(wire);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io?.disconnect();
      mo.disconnect();
    };
  }, []);

  // the foot slides up when the carton changes
  useEffect(() => {
    if (!foot.current || !caption || !live.current) return;
    gsap.fromTo(foot.current, { y: 8, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5, ease: "expo.out" });
  }, [caption]);

  const corner = (c: string) => (
    <span
      key={c}
      data-corner
      className={`absolute ${c} h-3 w-3 border-white`}
      style={{ borderWidth: 0, borderTopWidth: c.includes("top") ? 1 : 0, borderBottomWidth: c.includes("bottom") ? 1 : 0, borderLeftWidth: c.includes("left") ? 1 : 0, borderRightWidth: c.includes("right") ? 1 : 0 }}
    />
  );

  return (
    <div ref={root} className="inverts pointer-events-none fixed inset-(--edge) z-150" aria-hidden>
      <svg className="absolute inset-0 h-full w-full overflow-visible" preserveAspectRatio="none">
        <rect x="0.5" y="0.5" width="calc(100% - 1px)" height="calc(100% - 1px)" fill="none" stroke="#fff" strokeOpacity="0.22" strokeWidth="1" />
        {/* draws clockwise from the top centre */}
        <rect ref={rect} x="0.5" y="0.5" width="calc(100% - 1px)" height="calc(100% - 1px)" fill="none" stroke="#fff" strokeWidth="1.5" pathLength={1} style={{ strokeDasharray: "0 1", strokeDashoffset: -0.5 }} />
      </svg>
      {["top-0 left-0", "top-0 right-0", "bottom-0 left-0", "bottom-0 right-0"].map(corner)}
      {/* foot: the carton in view */}
      <div className="t-label absolute inset-x-0 bottom-0 flex items-end justify-between px-3 pb-1.5">
        <span data-fc className="hidden sm:inline">
          {site.location.label}
        </span>
        <span ref={foot} data-fc className="mx-auto">
          {caption}
        </span>
        <span data-fc className="hidden sm:inline">
          AUD
        </span>
      </div>
      {/* sides */}
      <span data-fc className="t-label absolute left-0 top-1/2 hidden whitespace-nowrap lg:block" style={{ transform: "translate(-50%, -50%) rotate(90deg)", left: "6px" }}>
        {site.name}
      </span>
      <span data-fc className="t-label absolute right-0 top-1/2 hidden whitespace-nowrap lg:block" style={{ transform: "translate(50%, -50%) rotate(-90deg)", right: "6px" }}>
        {site.taglineLine1}
      </span>
    </div>
  );
}
