import type { Metadata } from "next";
import ProductGrid from "@/components/shop/ProductGrid";
import Panel, { Heading } from "@/components/ui/Panel";
import Shelf from "@/components/ui/Shelf";
import { products } from "@/lib/catalogue";
import { site } from "@/lib/content/site";

export const metadata: Metadata = {
  title: "Shop all",
  description: `Every piece from ${site.name}: hoods, crews, tees and the tracksuit. Made to order in Sydney, shipped in approximately two weeks.`,
  alternates: { canonical: "/shop" },
};

export default function ShopPage() {
  return (
    <Shelf>
      <Panel band={{ tone: "cobalt", text: `Shop all — ${products.length} pieces` }} caption="00 — Shop">
        <Heading title="All pieces" lede={`${products.length} pieces across four lines. Everything is made to order and ships in about two weeks.`} />
        <ProductGrid products={products} className="mt-[clamp(28px,4vw,48px)]" />
      </Panel>
    </Shelf>
  );
}
