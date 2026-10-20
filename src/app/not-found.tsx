import { TLink } from "@/components/providers/Transition";
import Tower from "@/components/ui/Tower";

export default function NotFound() {
  return (
    <section data-caption="404" className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-(--pad) text-center">
      <div className="absolute inset-0 opacity-80">
        <Tower cols={71} occupancy={0.1} />
      </div>
      <div className="relative flex flex-col items-center gap-5">
        <span className="t-label text-muted">404</span>
        <p className="t-hero">No such page</p>
        <p className="t-body max-w-[40ch] text-balance text-muted">It moved when the site was rebuilt, or it never existed. No such thing as a coincidence.</p>
        <TLink href="/" className="btn btn--bone">
          Back to the start
        </TLink>
      </div>
    </section>
  );
}
