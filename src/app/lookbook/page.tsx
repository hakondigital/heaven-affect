import type { Metadata } from "next";
import { TLink } from "@/components/providers/Transition";
import Media from "@/components/ui/Media";
import Panel, { Heading } from "@/components/ui/Panel";
import Parallax from "@/components/ui/Parallax";
import { CenterStagger, Rise, Unfold } from "@/components/ui/Reveal";
import Shelf from "@/components/ui/Shelf";
import { site } from "@/lib/content/site";
import type { MediaName } from "@/lib/media";
import { pad } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Lookbook 24",
  description: `Lookbook 24 — ${site.name} shot after dark in Sydney. Pain Pack, Flip the Script, Drowsy and the tracksuit on the people who wear them.`,
  alternates: { canonical: "/lookbook" },
};

const spreads: MediaName[] = ["lookbook-01", "lookbook-02", "lookbook-03", "lookbook-04", "lookbook-05", "lookbook-06"];

const street: { name: MediaName; cap: string; position?: string }[] = [
  { name: "editorial-elevator", cap: "Charlie Sheen Hood" },
  { name: "editorial-pharmacy", cap: "Flip the Script · King St", position: "50% 30%" },
  { name: "editorial-viagra-sunset", cap: "MHC x THE" },
  { name: "editorial-xansoldiers", cap: "Xansoldiers T-shirt" },
  { name: "editorial-crew", cap: "Drowsy Sticker Crew" },
  { name: "editorial-80s-hood", cap: "80s Hood" },
  { name: "editorial-window", cap: "Flip the Script T-shirt" },
  { name: "detail-back-script", cap: "Pain pills don't work in the rain" },
  { name: "editorial-viagra-wall", cap: "MHC x THE x Viagra" },
  { name: "editorial-bathroom", cap: "Drop 2" },
  { name: "editorial-bench", cap: "MHC x THE" },
  { name: "tracksuit-stairs", cap: "Deep Green Tracksuit" },
];

const details: { name: MediaName; cap: string }[] = [
  { name: "detail-endone", cap: "Flip the Script Hood — print" },
  { name: "detail-drowsy", cap: "Drowsy Sticker Crew — print" },
];

export default function LookbookPage() {
  return (
    <Shelf>
      <Panel band={{ tone: "ink", text: "Lookbook 24 — shot after dark" }} caption="05 — Lookbook 24">
        <Heading eyebrow="Six spreads" title="Lookbook 24" lede="Flash on. Six spreads, then the pieces on the people who wear them, around Sydney after dark." />
        <ul className="mx-auto mt-[clamp(28px,4vw,56px)] flex max-w-[64rem] flex-col gap-[clamp(20px,3vw,40px)]">
          {spreads.map((name, i) => (
            <li key={name} className="flex flex-col items-center">
              <Unfold className="relative aspect-[2/1] w-full border border-ink" axis={i % 2 ? "y" : "x"}>
                <Parallax amount={7} className="absolute inset-0">
                  <Media name={name} alt={`Lookbook 24, spread ${i + 1}`} sizes="(min-width: 1024px) 64rem, 100vw" className="h-full w-full" />
                </Parallax>
              </Unfold>
              <span className="t-label mt-3 text-muted">
                LB24 / {pad(i + 1)} — {site.location.city}
              </span>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel band={{ tone: "mustard", text: "On the body" }} caption="On the body">
        <CenterStagger as="ul" className="grid grid-cols-2 gap-x-(--gap) gap-y-8 md:grid-cols-3">
          {street.map((s) => (
            <li key={s.name} className="flex flex-col items-center text-center">
              <Unfold className="relative aspect-[3/4] w-full border border-ink">
                <Parallax amount={8} className="absolute inset-0">
                  <Media name={s.name} alt={s.cap} sizes="(min-width: 768px) 33vw, 50vw" position={s.position} className="h-full w-full" />
                </Parallax>
              </Unfold>
              <span className="t-label mt-2.5 text-muted">{s.cap}</span>
            </li>
          ))}
        </CenterStagger>
        <CenterStagger as="ul" className="mt-[clamp(20px,3vw,40px)] grid gap-x-(--gap) gap-y-8 sm:grid-cols-2">
          {details.map((s) => (
            <li key={s.name} className="flex flex-col items-center text-center">
              <Unfold className="relative aspect-[5/4] w-full border border-ink" axis="y">
                <Parallax amount={6} className="absolute inset-0">
                  <Media name={s.name} alt={s.cap} sizes="(min-width: 640px) 50vw, 100vw" className="h-full w-full" />
                </Parallax>
              </Unfold>
              <span className="t-label mt-2.5 text-muted">{s.cap}</span>
            </li>
          ))}
        </CenterStagger>
        <Rise className="mt-[clamp(28px,4vw,48px)] flex justify-center">
          <TLink href="/shop" className="btn">
            Shop all
          </TLink>
        </Rise>
      </Panel>
    </Shelf>
  );
}
