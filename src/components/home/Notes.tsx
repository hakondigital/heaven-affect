import { TLink } from "@/components/providers/Transition";
import Media from "@/components/ui/Media";
import Panel, { Heading } from "@/components/ui/Panel";
import Parallax from "@/components/ui/Parallax";
import { CenterStagger, Rise, Unfold } from "@/components/ui/Reveal";
import type { MediaName } from "@/lib/media";
import { cn } from "@/lib/utils";

type Shot = { name: MediaName; cap: string; position?: string };

// Three rows, mirrored: three portraits, two spreads, three portraits.
const rowA: Shot[] = [
  { name: "editorial-pharmacy", cap: "Flip the Script · King St", position: "50% 30%" },
  { name: "editorial-crew", cap: "Drowsy Sticker Crew" },
  { name: "editorial-bench", cap: "MHC x THE" },
];
const rowB: Shot[] = [
  { name: "lookbook-01", cap: "LB24 / 01" },
  { name: "lookbook-03", cap: "LB24 / 03" },
];
const rowC: Shot[] = [
  { name: "editorial-elevator", cap: "Charlie Sheen Hood" },
  { name: "editorial-xansoldiers", cap: "Xansoldiers T-shirt" },
  { name: "editorial-viagra-sunset", cap: "MHC x THE x Viagra" },
];

function Row({ shots, ratio, cols, sizes }: { shots: Shot[]; ratio: string; cols: string; sizes: string }) {
  return (
    <CenterStagger as="ul" className={cn("grid gap-(--gap)", cols)}>
      {shots.map((s) => (
        <li key={s.name} className="flex flex-col items-center text-center">
          <Unfold className={cn("relative w-full border border-ink", ratio)}>
            <Parallax amount={8} className="absolute inset-0">
              <Media name={s.name} alt={s.cap} sizes={sizes} position={s.position} className="h-full w-full" />
            </Parallax>
          </Unfold>
          <span className="t-label mt-2.5 text-muted">{s.cap}</span>
        </li>
      ))}
    </CenterStagger>
  );
}

/** Field notes: the lookbook as a contact sheet, symmetrical about the centre line. */
export default function Notes() {
  return (
    <Panel band={{ tone: "ink", text: "Lookbook 24 — shot after dark" }} caption="05 — Field notes">
      <Heading title="Shot after dark" lede="Lookbook 24, and the pieces on the people who wear them. Flash on, Sydney at night." />
      <div className="mt-[clamp(28px,4vw,56px)] flex flex-col gap-[clamp(14px,2vw,28px)]">
        <Row shots={rowA} ratio="aspect-[3/4]" cols="grid-cols-3" sizes="33vw" />
        <Row shots={rowB} ratio="aspect-[2/1]" cols="grid-cols-1 sm:grid-cols-2" sizes="(min-width: 640px) 50vw, 100vw" />
        <Row shots={rowC} ratio="aspect-[3/4]" cols="grid-cols-3" sizes="33vw" />
      </div>
      <Rise className="mt-[clamp(28px,4vw,48px)] flex justify-center">
        <TLink href="/lookbook" className="btn">
          View the lookbook
        </TLink>
      </Rise>
    </Panel>
  );
}
