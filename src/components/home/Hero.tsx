"use client";

import { useRef } from "react";
import { TLink } from "@/components/providers/Transition";
import Video from "@/components/ui/Video";
import { gsap, useGSAP } from "@/lib/gsap";
import { site } from "@/lib/content/site";
import { onReady } from "@/lib/intro";

/**
 * The film, pinned behind the shelf: a block of flats after dark, its
 * windows lit in the shape of the mark. The mark and the words sit dead
 * centre; as you scroll the film dims and the first carton slides up over it.
 */
export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const q = gsap.utils.selector(el);
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      let cleanup = () => undefined as void;

      // the film runs from the first frame — the intro looks through at it
      video.current?.play().catch(() => undefined);
      if (!reduced) gsap.fromTo(q("[data-film-in]"), { scale: 1.16 }, { scale: 1, duration: 3.2, ease: "expo.out" });

      if (!reduced) {
        // opacity only — the buttons stay clickable even before they're revealed
        gsap.set(q("[data-mark]"), { opacity: 0, scale: 1.18 });
        gsap.set(q("[data-line]"), { yPercent: 112 });
        gsap.set(q("[data-in]"), { opacity: 0, y: 12 });
        // the cue comes from the intro overlay, the lid, or fonts — whichever owns this load
        cleanup = onReady(() => {
          gsap
            .timeline({ defaults: { ease: "expo.out" } })
            .to(q("[data-mark]"), { opacity: 1, scale: 1, duration: 1.3 }, 0.1)
            .to(q("[data-line]"), { yPercent: 0, duration: 1.4, stagger: 0.12 }, 0.35)
            .to(q("[data-in]"), { opacity: 1, y: 0, duration: 0.9, stagger: 0.08 }, 0.8);
        });
      } else {
        gsap.set(q("[data-mark], [data-in], [data-line]"), { opacity: 1 });
      }

      gsap
        .timeline({ scrollTrigger: { trigger: el, start: "top top", end: "bottom bottom", scrub: 0.8 } })
        .to(q("[data-film]"), { scale: 1.12, ease: "none", duration: 1 }, 0)
        .to(q("[data-dim]"), { opacity: 0.8, ease: "none", duration: 1 }, 0)
        .to(q("[data-content]"), { yPercent: -16, autoAlpha: 0, ease: "none", duration: 0.5 }, 0)
        .to(q("[data-cue]"), { autoAlpha: 0, ease: "none", duration: 0.15 }, 0);

      return () => cleanup();
    },
    { scope: root },
  );

  return (
    <section ref={root} data-caption="01 — The film" className="relative h-[165svh]" aria-label="The Heaven Effect">
      <div className="sticky top-0 h-svh overflow-hidden">
        <div data-film className="absolute inset-0">
          <div data-film-in className="absolute inset-0">
            <Video ref={video} base="/media/video/hero" poster="/media/video/hero-poster.webp" eager position="42% 50%" />
          </div>
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-night/55 via-night/15 to-night/70" />
        <div data-dim className="pointer-events-none absolute inset-0 bg-night opacity-0" />

        <div data-content className="pad-x absolute inset-0 flex flex-col items-center justify-center pt-(--header-h) text-center text-bone">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img data-mark src="/brand/mark-bone.png" alt="" aria-hidden width={480} height={480} className="h-[clamp(64px,13vh,124px)] w-auto" />
          <span data-in className="t-label mt-7 text-bone/75">
            {site.name} · {site.location.label}
          </span>
          <h1 className="mt-4">
            <span className="sr-only">Blessed beyond explanation. No such thing as a coincidence.</span>
            <span aria-hidden className="block">
              <span className="block overflow-hidden pb-[0.06em]">
                <span data-line className="t-hero block">
                  Blessed beyond
                </span>
              </span>
              <span className="block overflow-hidden pb-[0.06em]">
                <span data-line className="t-hero block">
                  explanation.
                </span>
              </span>
            </span>
          </h1>
          <p data-in className="t-lede mt-5 max-w-[30ch] text-balance text-bone/80">
            {site.taglineLine2}. Heavyweight fleece and cotton, made to order in Sydney.
          </p>
          <div data-in className="mt-8 flex flex-wrap justify-center gap-3">
            <TLink href="/shop" className="btn btn--bone">
              Shop all
            </TLink>
            <TLink href="/lookbook" className="btn btn--ghost text-bone">
              Lookbook 24
            </TLink>
          </div>
        </div>

        <div data-cue data-in className="absolute inset-x-0 bottom-[calc(var(--edge)+34px)] flex flex-col items-center gap-2 t-label text-bone/70">
          <span>Scroll</span>
          <span className="relative h-9 w-px overflow-hidden bg-bone/25">
            <span className="absolute inset-x-0 top-0 h-1/2 animate-[scan_1.8s_ease-in-out_infinite] bg-bone" />
          </span>
        </div>
      </div>
      <style>{`@keyframes scan{0%{transform:translateY(-100%)}100%{transform:translateY(200%)}}`}</style>
    </section>
  );
}
