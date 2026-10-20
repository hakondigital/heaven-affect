"use client";

import Lenis from "lenis";
import { createContext, useContext, useEffect, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

const LenisContext = createContext<Lenis | null>(null);

export const useLenis = () => useContext(LenisContext);

/** Scroll velocity shared with anything that reacts to it (the ticker, the tower). */
export const scrollState = { velocity: 0, progress: 0, direction: 1 as 1 | -1 };

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    const instance = new Lenis({
      lerp: 0.09,
      wheelMultiplier: 1,
      touchMultiplier: 1.4,
      smoothWheel: true,
      syncTouch: false,
      autoRaf: false,
      anchors: { offset: -80 },
      stopInertiaOnNavigate: true,
    });

    instance.on("scroll", (l: Lenis) => {
      scrollState.velocity = l.velocity;
      scrollState.progress = l.progress;
      scrollState.direction = l.direction === -1 ? -1 : 1;
      ScrollTrigger.update();
    });

    const tick = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // eslint-disable-next-line react-hooks/set-state-in-effect -- publish the instance once it exists
    setLenis(instance);
    window.__lenis = instance;

    return () => {
      gsap.ticker.remove(tick);
      instance.destroy();
      window.__lenis = undefined;
    };
  }, []);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}
