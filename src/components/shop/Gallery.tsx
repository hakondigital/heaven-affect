"use client";

import { useEffect, useRef, useState } from "react";
import { Unfold } from "@/components/ui/Reveal";
import ShopImage from "@/components/ui/ShopImage";
import type { ProductImage } from "@/lib/catalogue";
import { pad } from "@/lib/utils";

/** Every photo of the piece, each in its own framed sheet. A swipe on phones. */
export default function Gallery({ images, title }: { images: ProductImage[]; title: string }) {
  const rail = useRef<HTMLUListElement>(null);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const el = rail.current;
    if (!el) return;
    const onScroll = () => setIdx(Math.round(el.scrollLeft / el.clientWidth));
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="relative">
      <ul ref={rail} className="no-bar flex snap-x snap-mandatory gap-(--gap) overflow-x-auto lg:flex-col lg:overflow-visible">
        {images.map((im, i) => (
          <li key={im.src} className="w-full shrink-0 snap-center">
            <Unfold className="sheet w-full border border-line" delay={i === 0 ? 0 : 0.05} axis={i % 2 ? "y" : "x"}>
              <ShopImage image={im} alt={i === 0 ? title : `${title} — photo ${i + 1}`} sizes="(min-width: 1024px) 48vw, 100vw" priority={i < 2} fit="contain" ratio className="w-full" />
            </Unfold>
          </li>
        ))}
      </ul>
      {images.length > 1 && (
        <span className="t-label pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-ink/85 px-2.5 py-1 text-bone lg:hidden">
          {pad(idx + 1)} / {pad(images.length)}
        </span>
      )}
    </div>
  );
}
