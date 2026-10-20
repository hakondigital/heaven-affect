"use client";

import { useEffect, useRef, useState } from "react";
import { mediaInfo, mediaSrc, mediaSrcSet, type MediaName } from "@/lib/media";
import { cn, pos } from "@/lib/utils";

type Props = {
  name: MediaName;
  alt: string;
  sizes?: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  fit?: "cover" | "contain";
  position?: string;
  /** keep intrinsic aspect ratio (otherwise fill the parent) */
  ratio?: boolean;
  style?: React.CSSProperties;
};

/** Responsive self-hosted image on its dominant colour, fading in once loaded. */
export default function Media({ name, alt, sizes = "100vw", className, imgClassName, priority, fit = "cover", position = "50% 50%", ratio = false, style }: Props) {
  const img = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);
  const info = mediaInfo(name);

  useEffect(() => {
    // cached images can finish before hydration attaches onLoad
    if (img.current?.complete && img.current.naturalWidth > 0) setLoaded(true);
  }, []);

  return (
    <div
      className={cn(pos(className), "overflow-hidden", className)}
      style={{
        backgroundColor: fit === "cover" && !info.alpha ? info.color : undefined,
        aspectRatio: ratio ? `${info.w} / ${info.h}` : undefined,
        ...style,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={img}
        src={mediaSrc(name, 1440)}
        srcSet={mediaSrcSet(name)}
        sizes={sizes}
        alt={alt}
        width={info.w}
        height={info.h}
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
