"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { site } from "@/lib/content/site";
import { fireReady, shouldRunIntro } from "@/lib/intro";

/**
 * Through the mark. The screen is dark; the film shows only through a
 * keyhole in the exact shape of the monogram — the lit windows of the
 * building, seen through the mark. It holds, then opens until the shape has
 * cleared the whole screen. READY fires as it opens, so the frame, the
 * header and the hero draw in behind it. Plays on every load.
 *
 * The overlay is server-rendered so the first paint is already dark, and a
 * CSS failsafe lifts it if scripts never run.
 */
export default function Intro() {
  const [active, setActive] = useState(true);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reduced motion opts out on the client
    if (!shouldRunIntro()) setActive(false);
  }, []);

  useGSAP(
    () => {
      const el = root.current;
      if (!active || !el) return;
      const q = gsap.utils.selector(el);
      const html = document.documentElement;
      html.style.overflow = "hidden";

      const hole = { s: 0 };
      const apply = () => el.style.setProperty("--hole", `${hole.s.toFixed(1)}px`);
      apply();
      const masks = CSS.supports("mask-composite", "exclude") || CSS.supports("-webkit-mask-composite", "xor");
      // the shape has to grow well past the screen before its arms clear the corners
      const open = Math.max(window.innerWidth, window.innerHeight) * 3.4;

      const release = () => {
        html.style.overflow = "";
        window.__lenis?.start();
        fireReady();
      };

      const tl = gsap.timeline({ onComplete: () => (el.style.display = "none") });
      tl.call(() => window.__lenis?.stop(), [], 0.02);

      if (!masks) {
        // no mask compositing: a plain dark-to-film fade
        tl.call(release, [], 0.6).to(el, { autoAlpha: 0, duration: 1, ease: "power2.inOut" }, 0.6);
        return;
      }

      tl.fromTo(q("[data-i]"), { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.1, ease: "expo.out" }, 0.3)
        // the keyhole
        .to(hole, { s: 168, duration: 1.0, ease: "back.out(1.4)", onUpdate: apply }, 0.35)
        // hold on it, then open
        .to(hole, { s: open, duration: 1.6, ease: "expo.inOut", onUpdate: apply }, 1.45)
        .to(q("[data-i]"), { autoAlpha: 0, duration: 0.3, ease: "power2.in" }, 1.55)
        .call(release, [], 2.05)
        // whatever is left outside the arms dissolves
        .to(el, { autoAlpha: 0, duration: 0.55, ease: "power2.inOut" }, 2.45);
    },
    { dependencies: [active] },
  );

  if (!active) return null;

  const mask: CSSProperties = {
    "--hole": "0px",
    maskImage: "linear-gradient(#000, #000), url(/brand/mark-bone.png)",
    WebkitMaskImage: "linear-gradient(#000, #000), url(/brand/mark-bone.png)",
    maskComposite: "exclude",
    WebkitMaskComposite: "xor",
    maskRepeat: "no-repeat",
    WebkitMaskRepeat: "no-repeat",
    maskPosition: "center",
    WebkitMaskPosition: "center",
    maskSize: "100% 100%, var(--hole) var(--hole)",
    WebkitMaskSize: "100% 100%, var(--hole) var(--hole)",
  } as CSSProperties;

  return (
    <div ref={root} className="intro fixed inset-0 z-190 bg-night text-bone" style={mask} aria-hidden>
      <span data-i className="t-label absolute inset-x-0 top-[calc(var(--edge)+22px)] text-center">
        {site.name}
      </span>
      <span data-i className="t-label absolute inset-x-0 bottom-[calc(var(--edge)+22px)] text-center text-bone/70">
        {site.location.city}, after dark
      </span>
    </div>
  );
}
