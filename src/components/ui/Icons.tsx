import { cn } from "@/lib/utils";

type P = { className?: string };

export const Arrow = ({ className, dir = "e" }: P & { dir?: "e" | "n" | "s" | "w" | "ne" }) => {
  const rot = { e: 0, s: 90, w: 180, n: -90, ne: -45 }[dir];
  return (
    <svg viewBox="0 0 20 20" className={cn("h-4 w-4 shrink-0", className)} fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden style={{ transform: `rotate(${rot}deg)` }}>
      <path d="M3 10h13M11 4.5 16.5 10 11 15.5" strokeLinecap="square" />
    </svg>
  );
};

/** The triangle from the drowsiness label. */
export const Warn = ({ className }: P) => (
  <svg viewBox="0 0 20 20" className={cn("h-3.5 w-3.5 shrink-0", className)} fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
    <path d="M10 2.6 18.4 17H1.6L10 2.6Z" strokeLinejoin="round" />
    <path d="M10 7.5v4.6" strokeLinecap="square" />
    <path d="M10 14.6h.01" strokeLinecap="round" strokeWidth="2.2" />
  </svg>
);

export const Plus = ({ className }: P) => (
  <svg viewBox="0 0 16 16" className={cn("h-3 w-3 shrink-0", className)} fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
    <path d="M8 2v12M2 8h12" />
  </svg>
);

export const Minus = ({ className }: P) => (
  <svg viewBox="0 0 16 16" className={cn("h-3 w-3 shrink-0", className)} fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
    <path d="M2 8h12" />
  </svg>
);

export const Close = ({ className }: P) => (
  <svg viewBox="0 0 16 16" className={cn("h-3.5 w-3.5 shrink-0", className)} fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
    <path d="M2.5 2.5l11 11M13.5 2.5l-11 11" />
  </svg>
);

export const InstagramGlyph = ({ className }: P) => (
  <svg viewBox="0 0 20 20" className={cn("h-4 w-4 shrink-0", className)} fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
    <rect x="2.5" y="2.5" width="15" height="15" rx="4" />
    <circle cx="10" cy="10" r="3.6" />
    <circle cx="14.4" cy="5.6" r="0.9" fill="currentColor" stroke="none" />
  </svg>
);

/** Small cross — the monogram, simplified for inline use. */
export const Cross = ({ className }: P) => (
  <svg viewBox="0 0 20 20" className={cn("h-3.5 w-3.5 shrink-0", className)} fill="currentColor" aria-hidden>
    <path d="M8.6 1h2.8v7.6H19v2.8h-7.6V19H8.6v-7.6H1V8.6h7.6V1Z" />
  </svg>
);
