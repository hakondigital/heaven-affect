"use client";

import { useEffect, useRef, useState } from "react";
import { shopifyImage, shopifySrcSet, type ProductImage } from "@/lib/catalogue";
import { cn, pos } from "@/lib/utils";

type Props = {
  image: ProductImage;
  alt: string;
  sizes?: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  fit?: "cover" | "contain";
  position?: string;
  ratio?: boolean;
  style?: React.CSSProperties;
};

/** A product photo straight from Shopify's CDN, resized on request, fading in once loaded. */
export default function ShopImage({ image, alt, sizes = "50vw", className, imgClassName, priority, fit = "contain", position = "50% 50%", ratio = false, style }: Props) {
  const img = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (img.current?.complete && img.current.naturalWidth > 0) setLoaded(true);
  }, []);

  return (
    <div className={cn(pos(className), "overflow-hidden", className)} style={{ aspectRatio: ratio ? `${image.w} / ${image.h}` : undefined, ...style }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={img}
        src={shopifyImage(image.src, 960)}
        srcSet={shopifySrcSet(image)}
        sizes={sizes}
        alt={alt}
        width={image.w}
        height={image.h}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={cn("absolute inset-0 h-full w-full transition-opacity duration-700 ease-out", loaded ? "opacity-100" : "opacity-0", imgClassName)}
        style={{ objectFit: fit, objectPosition: position }}
      />
    </div>
  );
}
