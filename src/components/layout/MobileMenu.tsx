"use client";

import { useEffect, useRef } from "react";
import { useCart } from "@/components/providers/Cart";
import { useLenis } from "@/components/providers/SmoothScroll";
import { TLink } from "@/components/providers/Transition";
import { InstagramGlyph } from "@/components/ui/Icons";
import { gsap } from "@/lib/gsap";
import { collections } from "@/lib/content/collections";
import { site } from "@/lib/content/site";

const items = [
  { label: "Shop all", href: "/shop" },
  ...collections.map((c) => ({ label: c.title, href: `/collections/${c.handle}` })),
  { label: "Lookbook", href: "/lookbook" },
  { label: "Contact", href: "/contact" },
];

/** Full-screen, centred list on the night ground. */
export default function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  const { count, setOpen } = useCart();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const rows = el.querySelectorAll("[data-menu-item]");
    if (open) {
      lenis?.stop();
      gsap.set(el, { visibility: "visible" });
      gsap.fromTo(el, { clipPath: "inset(50% 0 50% 0)" }, { clipPath: "inset(0 0 0 0)", duration: 0.6, ease: "expo.inOut" });
      gsap.fromTo(rows, { y: 16, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7, ease: "expo.out", stagger: { each: 0.04, from: "center" }, delay: 0.25 });
    } else {
      lenis?.start();
      gsap.to(el, { clipPath: "inset(50% 0 50% 0)", duration: 0.45, ease: "expo.inOut", onComplete: () => gsap.set(el, { visibility: "hidden" }) });
    }
  }, [open, lenis]);

  return (
    <div id="mobile-menu" ref={ref} className="fixed inset-0 z-110 flex flex-col items-center justify-center overflow-y-auto bg-night text-bone lg:hidden" style={{ visibility: "hidden", clipPath: "inset(50% 0 50% 0)" }} data-lenis-prevent aria-hidden={!open}>
      <nav aria-label="Mobile" className="flex flex-col items-center gap-1 text-center">
        {items.map((n) => (
          <TLink key={n.href} href={n.href} onClick={onClose} className="t-l py-1.5" data-menu-item>
            {n.label}
          </TLink>
        ))}
        <button
          onClick={() => {
            onClose();
            setOpen(true);
          }}
          className="t-l py-1.5"
          data-menu-item
        >
          Bag ({count})
        </button>
      </nav>
      <div className="t-label mt-10 flex flex-col items-center gap-2 text-muted" data-menu-item>
        <a href={site.links.instagram} target="_blank" rel="noreferrer" className="flex items-center gap-2">
          <InstagramGlyph /> {site.links.instagramHandle}
        </a>
        <span>{site.location.label}</span>
      </div>
    </div>
  );
}
