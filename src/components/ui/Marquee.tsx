"use client";

import { useEffect, useRef } from "react";
import { scrollState } from "@/components/providers/SmoothScroll";
import { cn } from "@/lib/utils";

/**
 * An endless strip. Its speed follows the scroll — it hurries when the page
 * is thrown and settles when the page rests — and reverses with direction.
 */
export default function Marquee({
  children,
  className,
  speed = 40,
  reactive = true,
  reverse = false,
  copies = 3,
}: {
  children: React.ReactNode;
  className?: string;
  /** px per second at rest */
  speed?: number;
  reactive?: boolean;
  reverse?: boolean;
  copies?: number;
}) {
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let x = 0;
    let last = performance.now();
    let raf = 0;
    let running = true;
    const io = new IntersectionObserver(([e]) => {
      running = e.isIntersecting;
      last = performance.now();
    });
    io.observe(el);
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!running) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const v = reactive ? Math.abs(scrollState.velocity) : 0;
      const dir = (reverse ? -1 : 1) * (reactive && scrollState.direction === -1 ? -1 : 1);
      x -= dir * (speed + v * 6) * dt;
      const w = el.scrollWidth / copies;
      if (w > 0) {
        if (x <= -w) x += w;
        if (x > 0) x -= w;
      }
      el.style.transform = `translate3d(${x}px,0,0)`;
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [speed, reactive, reverse, copies]);

  return (
    <div className={cn("overflow-hidden", className)}>
      <div ref={track} className="flex w-max will-change-transform">
        {Array.from({ length: copies }, (_, i) => (
          <div key={i} className="flex shrink-0 items-center" aria-hidden={i > 0}>
            {children}
          </div>
        ))}
      </div>
    </div>
  );
}
