import Tower from "@/components/ui/Tower";

/** The city at night behind the shelf: a faint grid of windows, a few lit, no mark. */
export default function Backdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 opacity-50" aria-hidden>
      <Tower cols={91} lit={false} occupancy={0.05} />
      <div className="absolute inset-0 bg-gradient-to-b from-night/40 via-transparent to-night/60" />
    </div>
  );
}
