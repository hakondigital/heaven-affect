"use client";

import { Children, useRef } from "react";
import { scrollState } from "@/components/providers/SmoothScroll";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { clamp, cn, isTouch } from "@/lib/utils";

/**
 * The stack. Each carton holds its place while the next slides up over it,
 * and the covered one sinks back — smaller, dimmer — in step with the
 * scroll. Throw the page and the cartons tip with the velocity, like boxes
 * on a shelf that's been pushed.
 *
 * A carton taller than the screen sticks by its bottom edge instead of its
 * top, so every one can be read in full before it's covered.
 */
export default function Stack({ children, className }: { children: React.ReactNode; className?: string }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const items = Array.from(el.querySelectorAll<HTMLElement>("[data-stack-item]"));
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      // where each carton holds
      let raf = 0;
      const place = () => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          const vh = window.innerHeight;
          const header = document.querySelector("header")?.getBoundingClientRect().bottom ?? 80;
          const top = header + 12;
          for (const it of items) it.style.top = `${Math.min(top, vh - it.offsetHeight - 28)}px`;
          ScrollTrigger.refresh();
        });
      };
      place();
      const ro = new ResizeObserver(place);
      items.forEach((it) => ro.observe(it));
      window.addEventListener("load", place);

      // the covered carton sinks back
      if (!reduced) {
        items.forEach((it, i) => {
          const next = items[i + 1];
          if (!next) return;
          gsap
            .timeline({ scrollTrigger: { trigger: next, start: "top bottom", end: "top 14%", scrub: 0.5 } })
            .to(it, { scale: 0.94, yPercent: -1.5, ease: "none" }, 0)
            .to(it.querySelector("[data-veil]"), { opacity: 0.65, ease: "none" }, 0);
        });
      }

      // tip with the scroll velocity
      let tiltRaf = 0;
      if (!reduced && !isTouch()) {
        const tilts = Array.from(el.querySelectorAll<HTMLElement>("[data-tilt]"));
        let cur = 0;
        const loop = () => {
          tiltRaf = requestAnimationFrame(loop);
          const target = clamp(-scrollState.velocity * 0.028, -3.2, 3.2);
          cur += (target - cur) * 0.09;
          if (Math.abs(cur) < 0.005 && Math.abs(target) < 0.005) return;
          const t = `rotateX(${cur.toFixed(3)}deg)`;
          for (const n of tilts) n.style.transform = t;
        };
        tiltRaf = requestAnimationFrame(loop);
      }

      return () => {
        cancelAnimationFrame(raf);
        cancelAnimationFrame(tiltRaf);
        ro.disconnect();
        window.removeEventListener("load", place);
      };
    },
    { scope: root },
  );

  return (
    <div ref={root} className={cn("relative z-10 flex flex-col gap-[clamp(28px,4.5vw,72px)] px-(--edge) [perspective:1600px]", className)}>
      {Children.map(children, (child) => (
        <div data-stack-item className="sticky" style={{ transformOrigin: "50% 50%" }}>
          <div data-tilt className="will-change-transform [transform-style:preserve-3d]">
            {child}
          </div>
          <div data-veil className="pointer-events-none absolute inset-0 bg-night opacity-0" />
        </div>
      ))}
    </div>
  );
}
