import { TLink } from "@/components/providers/Transition";
import ProductCard from "@/components/shop/ProductCard";
import Panel, { Heading } from "@/components/ui/Panel";
import { CenterStagger, Rise } from "@/components/ui/Reveal";
import type { Product } from "@/lib/catalogue";
import { site } from "@/lib/content/site";

/** The blister pack: the newest pieces in a strict grid, the warning running across the top. */
export default function Dosage({ products, total }: { products: Product[]; total: number }) {
  return (
    <Panel band={{ kind: "marquee", tone: "rx", items: site.ticker }} caption="03 — Dosage">
      <Heading title="Fresh scripts" lede="Newest first. Every piece is made to order and ships in about two weeks." />
      <CenterStagger as="ul" className="mt-[clamp(28px,4vw,56px)] grid grid-cols-2 gap-x-(--gap) gap-y-10 lg:grid-cols-4">
        {products.map((p, i) => (
          <li key={p.handle}>
            <ProductCard product={p} priority={i < 4} />
          </li>
        ))}
      </CenterStagger>
      <Rise className="mt-[clamp(28px,4vw,48px)] flex justify-center">
        <TLink href="/shop" className="btn">
          All {total} pieces
        </TLink>
      </Rise>
    </Panel>
  );
}
