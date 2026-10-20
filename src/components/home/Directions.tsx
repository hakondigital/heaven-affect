import Panel from "@/components/ui/Panel";
import { CenterStagger as Stagger, Rise, Words } from "@/components/ui/Reveal";
import { site } from "@/lib/content/site";

const ingredients = [
  ["400 GSM", "Fleece-lined, snowflake, stone and enzyme washed"],
  ["350 GSM", "CVC fleece, 80% cotton 20% recycled polyester"],
  ["150 GSM", "100% cotton tees"],
  ["Fit", "Relaxed, drop shoulder, preshrunk"],
  ["Lead time", "Made to order · ships in approx. 2 weeks"],
  ["Returns", "Store credit only · refund if faulty"],
];

/** The leaflet: the words in the centre, the facts in two equal columns beneath. */
export default function Directions() {
  return (
    <Panel band={{ tone: "cobalt", text: "Directions for use" }} caption="04 — Directions">
      <Words as="h2" className="t-xl mx-auto max-w-[18ch] text-balance text-center">
        Blessed beyond explanation. No such thing as a coincidence.
      </Words>

      <div className="mx-auto mt-[clamp(32px,5vw,72px)] grid max-w-[64rem] gap-10 md:grid-cols-2 md:gap-0">
        <div className="flex flex-col items-center md:border-r md:border-line md:pr-10">
          <span className="t-label mb-5 text-muted">Active ingredients</span>
          <Stagger as="ul" className="w-full border-t border-line">
            {ingredients.map(([k, v]) => (
              <li key={k} className="grid grid-cols-[6.5rem_1fr] gap-4 border-b border-line py-3">
                <span className="t-caps pt-0.5">{k}</span>
                <span className="t-body text-muted">{v}</span>
              </li>
            ))}
          </Stagger>
        </div>
        <Rise className="flex flex-col items-center text-center md:pl-10">
          <span className="t-label mb-5 text-muted">Directions</span>
          <p className="t-lede text-balance">{site.description}</p>
          <p className="t-body mt-5 max-w-[40ch] text-balance text-muted">
            The label says it may cause drowsiness. The box says flip the script. The tracksuit was washed until it faded. Worn in {site.location.city}, shot at night.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/mark-kaleido-ink.png" alt="" aria-hidden className="h-14 w-auto opacity-85" />
            <span className="t-label text-faint">
              {site.short} · {site.location.label}
            </span>
          </div>
        </Rise>
      </div>
    </Panel>
  );
}
