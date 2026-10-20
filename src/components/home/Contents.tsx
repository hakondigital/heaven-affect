import { TLink } from "@/components/providers/Transition";
import Media from "@/components/ui/Media";
import Panel, { Heading } from "@/components/ui/Panel";
import Parallax from "@/components/ui/Parallax";
import { CenterStagger, Unfold } from "@/components/ui/Reveal";
import { collectionCount } from "@/lib/catalogue";
import { collections } from "@/lib/content/collections";

/** The contents of the box: four lines, four equal tiles around the centre. */
export default function Contents() {
  return (
    <Panel band={{ tone: "mustard", text: "Contents — four lines, one script" }} caption="02 — Contents">
      <Heading title="Four lines. One script." lede="Hoods, crews and tees in heavyweight fleece and cotton, printed with the labels they flip. Everything is made to order." />

      <CenterStagger as="ul" className="mt-[clamp(28px,4vw,56px)] grid grid-cols-2 gap-x-(--gap) gap-y-8 lg:grid-cols-4">
        {collections.map((c) => {
          const count = collectionCount(c.handle);
          return (
            <li key={c.handle}>
              <TLink href={`/collections/${c.handle}`} className="group flex flex-col items-center text-center">
                <Unfold className="relative aspect-[4/5] w-full border border-ink">
                  <Parallax amount={7} className="absolute inset-0">
                    <Media name={c.tile} alt={`${c.title} collection`} sizes="(min-width: 1024px) 25vw, 50vw" position={c.tilePosition} className="h-full w-full" imgClassName="transition-transform duration-[1.4s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]" />
                  </Parallax>
                  <span className="t-label absolute left-1/2 top-3 -translate-x-1/2 rounded-full bg-bone/92 px-2.5 py-1 text-ink">{c.code}</span>
                </Unfold>
                <span className="t-m mt-4 u-draw">{c.title}</span>
                <span className="t-body mt-1.5 max-w-[26ch] text-balance text-muted">{c.blurb}</span>
                <span className="t-label mt-2 text-faint">
                  {count} {count === 1 ? "piece" : "pieces"}
                </span>
              </TLink>
            </li>
          );
        })}
      </CenterStagger>
    </Panel>
  );
}
