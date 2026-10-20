"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import MobileMenu from "@/components/layout/MobileMenu";
import { useCart } from "@/components/providers/Cart";
import { TLink } from "@/components/providers/Transition";
import { gsap, useGSAP } from "@/lib/gsap";
import { site } from "@/lib/content/site";
import { onReady } from "@/lib/intro";
import { cn } from "@/lib/utils";

const left = [
  { label: "Shop", href: "/shop" },
  { label: "Lookbook", href: "/lookbook" },
];
const right = [{ label: "Contact", href: "/contact" }];

/**
 * Symmetric: two links, the mark, two links. It inverts over whatever
 * passes under it, so it needs no background and never hides. On arrival
 * the sides slide in towards the mark and the mark drops into place.
 */
export default function Header() {
  const pathname = usePathname();
  const { count, setOpen } = useCart();
  const [menu, setMenu] = useState(false);
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- close the menu when the route changes
    setMenu(false);
  }, [pathname]);

  useGSAP(
    () => {
      const el = root.current;
      if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const q = gsap.utils.selector(el);
      // opacity only — never visibility, so the buttons always take a click
      gsap.set(q("[data-hl]"), { x: -22, opacity: 0 });
      gsap.set(q("[data-hr]"), { x: 22, opacity: 0 });
      gsap.set(q("[data-hm]"), { y: -16, scale: 0.8, opacity: 0 });
      return onReady(() => {
        gsap
          .timeline({ defaults: { ease: "expo.out", duration: 1 } })
          .to(q("[data-hm]"), { y: 0, scale: 1, opacity: 1 }, 0.1)
          .to(q("[data-hl]"), { x: 0, opacity: 1, stagger: 0.07 }, 0.25)
          .to(q("[data-hr]"), { x: 0, opacity: 1, stagger: -0.07 }, 0.25);
      });
    },
    { scope: root },
  );

  const active = (href: string) => pathname === href || pathname.startsWith(href + "/") || (href === "/shop" && (pathname.startsWith("/collections") || pathname.startsWith("/products")));
  const link = (n: { label: string; href: string }, side: "hl" | "hr") => (
    <TLink key={n.href} href={n.href} aria-current={active(n.href) ? "page" : undefined} {...{ [`data-${side}`]: true }} className={cn("t-caps relative py-2 transition-opacity", active(n.href) ? "opacity-100" : "opacity-70 hover:opacity-100")}>
      {n.label}
      <span className={cn("absolute inset-x-0 -bottom-0.5 mx-auto h-px w-4 bg-current transition-opacity", active(n.href) ? "opacity-100" : "opacity-0")} />
    </TLink>
  );

  return (
    <>
      <header ref={root} className={cn("fixed inset-x-(--edge) top-(--edge) z-120", menu ? "" : "inverts")}>
        <div className="grid h-(--header-h) grid-cols-[1fr_auto_1fr] items-center px-4 sm:px-6">
          {/* left */}
          <div className="flex items-center gap-6">
            <button data-hl onClick={() => setMenu((m) => !m)} className="t-caps flex items-center gap-2 py-2 lg:hidden" aria-expanded={menu} aria-controls="mobile-menu">
              <span className="relative block h-2.5 w-4">
                <span className={cn("absolute left-0 top-0 h-px w-full bg-current transition-transform duration-500", menu && "translate-y-1.25 rotate-45")} />
                <span className={cn("absolute bottom-0 left-0 h-px w-full bg-current transition-transform duration-500", menu && "-translate-y-1 -rotate-45")} />
              </span>
              {menu ? "Close" : "Menu"}
            </button>
            <nav aria-label="Primary left" className="hidden items-center gap-7 lg:flex">
              {left.map((n) => link(n, "hl"))}
            </nav>
          </div>

          {/* centre: the mark */}
          <TLink href="/" data-hm className="flex flex-col items-center gap-1" aria-label={`${site.name} — home`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/mark-bone.png" alt="" aria-hidden width={480} height={480} className="h-8 w-8" />
          </TLink>

          {/* right */}
          <div className="flex items-center justify-end gap-7">
            <nav aria-label="Primary right" className="hidden items-center gap-7 lg:flex">
              {right.map((n) => link(n, "hr"))}
            </nav>
            <button data-hr onClick={() => setOpen(true)} className="t-caps flex items-center gap-1.5 py-2" aria-label={`Open bag, ${count} items`}>
              Bag <span className="t-num text-[12px] opacity-70">({count})</span>
            </button>
          </div>
        </div>
      </header>
      <MobileMenu open={menu} onClose={() => setMenu(false)} />
    </>
  );
}
