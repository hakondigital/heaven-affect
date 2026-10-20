import { cn } from "@/lib/utils";

/**
 * A barcode drawn from a string — bar widths come from the characters, so
 * each product gets its own stable code. Decorative, not scannable.
 */
export default function Barcode({ value, className, height = 28 }: { value: string; className?: string; height?: number }) {
  const bars: { x: number; w: number }[] = [];
  let x = 0;
  let seed = 7;
  for (let i = 0; i < Math.max(value.length, 12) * 3; i++) {
    const c = value.charCodeAt(i % value.length) || 65;
    seed = (seed * 31 + c + i) % 97;
    const w = 1 + (seed % 3);
    const gap = 1 + ((seed >> 2) % 3);
    bars.push({ x, w });
    x += w + gap;
  }
  return (
    <svg viewBox={`0 0 ${x} ${height}`} preserveAspectRatio="none" className={cn("block", className)} style={{ height }} aria-hidden>
      {bars.map((b, i) => (
        <rect key={i} x={b.x} y={0} width={b.w} height={height} fill="currentColor" />
      ))}
    </svg>
  );
}
