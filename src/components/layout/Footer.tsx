"use client";

import Newsletter from "@/components/forms/Newsletter";
import { useLenis } from "@/components/providers/SmoothScroll";
import { TLink } from "@/components/providers/Transition";
import { InstagramGlyph } from "@/components/ui/Icons";
import Tower from "@/components/ui/Tower";
import { collections } from "@/lib/content/collections";
import { secondaryNav, site } from "@/lib/content/site";

const link = "t-body u-draw text-bone/65 transition-colors hover:text-bone";

/**
 * The last carton is the city itself: the tower lit in the mark, the lockup
 * over it, then a mirrored set of columns around the centre line.
 */
export default function Footer() {
  const lenis = useLenis();

  return (
    <footer data-caption="The Heaven Effect" className="relative z-10 mt-[clamp(48px,7vw,110px)] px-(--edge) pb-[calc(var(--edge)+40px)]">
      <div className="relative mx-auto w-[min(var(--panel-w),100%)] overflow-hidden border border-bone/70 bg-night text-bone outline outline-1 -outline-offset-[7px] outline-bone/25">
        <div className="relative h-[clamp(240px,40vh,440px)] border-b border-bone/30">
          <Tower cols={91} occupancy={0.13} />
          <div className="pointer-events-none absolute inset-0 flex items-end justify-center pb-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/lockup-bone.png" alt="The Heaven Effect — blessed beyond explanation, nothing is a coincidence" width={1600} height={410} className="h-auto w-[min(560px,80%)]" />
          </div>
        </div>

        <div className="pad-x grid gap-10 py-[clamp(36px,5vw,64px)] text-center md:grid-cols-3 md:gap-6">
          <div className="flex flex-col items-center gap-3">
            <span className="t-label text-bone/40">Shop</span>
            <TLink href="/shop" className={link}>
              Shop all
            </TLink>
            {collections.map((c) => (
              <TLink key={c.handle} href={`/collections/${c.handle}`} className={link}>
                {c.title}
              </TLink>
            ))}
          </div>
          <div className="order-first flex flex-col items-center gap-5 md:order-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/mark-bone.png" alt="" aria-hidden width={480} height={480} className="h-12 w-12" />
            <p className="t-body max-w-[32ch] text-balance text-bone/65">{site.description}</p>
            <Newsletter className="w-full max-w-[22rem]" />
          </div>
          <div className="flex flex-col items-center gap-3">
            <span className="t-label text-bone/40">Info</span>
            <TLink href="/lookbook" className={link}>
              Lookbook
            </TLink>
            {secondaryNav.map((n) => (
              <TLink key={n.href} href={n.href} className={link}>
                {n.label}
              </TLink>
            ))}
            <a href={site.links.instagram} target="_blank" rel="noreferrer" className={`${link} inline-flex items-center gap-2`}>
              <InstagramGlyph /> Instagram
            </a>
          </div>
        </div>

        <div className="pad-x flex flex-col items-center gap-3 border-t border-bone/30 py-5 text-center">
          <span className="t-label text-bone/55">
            © {new Date().getFullYear()} {site.name} — {site.location.city}, {site.location.country}
          </span>
          <button onClick={() => lenis?.scrollTo(0, { duration: 1.6 })} className="t-label u-draw text-bone/40 hover:text-bone">
            Back to top
          </button>
        </div>
      </div>
    </footer>
  );
}
