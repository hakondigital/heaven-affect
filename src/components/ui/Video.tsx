"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { cn } from "@/lib/utils";

type Props = {
  /** base path without suffix, e.g. /media/video/hero */
  base: string;
  poster?: string;
  className?: string;
  eager?: boolean;
  position?: string;
};

/**
 * Silent background film: attaches its source near the viewport, pauses
 * off-screen, picks 1080p only for large, fast screens.
 */
const Video = forwardRef<HTMLVideoElement | null, Props>(function Video({ base, poster, className, eager = false, position = "50% 50%" }, ref) {
  const el = useRef<HTMLVideoElement>(null);
  useImperativeHandle(ref, () => el.current as HTMLVideoElement);

  useEffect(() => {
    const v = el.current;
    if (!v) return;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    const fast = !conn?.saveData && (!conn?.effectiveType || conn.effectiveType === "4g");
    const big = window.innerWidth * Math.min(2, window.devicePixelRatio || 1) >= 1800;
    const source = `${base}-${big && fast ? "1080" : "720"}.mp4`;

    let attached = false;
    const attach = () => {
      if (attached) return;
      attached = true;
      v.src = source;
      v.load();
    };
    if (eager) attach();

    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          attach();
          v.play().catch(() => undefined);
        } else if (!v.paused) v.pause();
      },
      { rootMargin: "30% 0px" },
    );
    io.observe(v);
    return () => io.disconnect();
  }, [base, eager]);

  return (
    <video
      ref={el}
      className={cn("h-full w-full object-cover", className)}
      style={{ objectPosition: position }}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      disablePictureInPicture
      aria-hidden
    />
  );
});

export default Video;
