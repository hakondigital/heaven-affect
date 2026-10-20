import type { Metadata } from "next";
import { TLink } from "@/components/providers/Transition";
import Panel, { Heading } from "@/components/ui/Panel";
import { CenterStagger } from "@/components/ui/Reveal";
import Shelf from "@/components/ui/Shelf";
import { site } from "@/lib/content/site";

export const metadata: Metadata = {
  title: "Online policy",
  description: `${site.name} online policy — store credit, faulty items, pre-order lead times.`,
  alternates: { canonical: "/policy" },
};

const notes = [
  ["Returns", "We only offer store credit. No exchange or refund for change of mind."],
  ["Faults", "If the product is faulty, we will issue a refund."],
  ["Pre-orders", "Pieces marked pre-order are made to order. Orders are shipped in approximately 2 weeks."],
  ["Payment", "Checkout and payment are handled securely by Shopify."],
  ["Sizing", "Most pieces are relaxed with a drop shoulder. Write to us before you order if you're unsure."],
  ["Questions", "Anything else, send it through the contact page and we'll come back to you."],
];

export default function PolicyPage() {
  return (
    <Shelf>
      <Panel band={{ tone: "rx", text: "Online policy — read before use" }} caption="Online policy">
        <Heading title="Read before use" lede="Store credit only. Refund if faulty. Everything else, below." />
        <CenterStagger as="ol" className="mx-auto mt-[clamp(28px,4vw,48px)] grid max-w-[56rem] gap-(--gap) sm:grid-cols-2">
          {notes.map(([k, v], i) => (
            <li key={k} className="flex flex-col items-center gap-2 border border-line bg-white px-5 py-6 text-center">
              <span className="t-label text-faint">{String(i + 1).padStart(2, "0")}</span>
              <span className="t-m">{k}</span>
              <span className="t-body max-w-[32ch] text-balance text-muted">{v}</span>
            </li>
          ))}
        </CenterStagger>
        <div className="mt-8 flex justify-center">
          <TLink href="/contact" className="btn btn--ghost">
            Contact us
          </TLink>
        </div>
      </Panel>
    </Shelf>
  );
}
