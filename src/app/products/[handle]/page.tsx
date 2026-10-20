import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TLink } from "@/components/providers/Transition";
import BuyBox from "@/components/shop/BuyBox";
import Gallery from "@/components/shop/Gallery";
import ProductCard from "@/components/shop/ProductCard";
import Panel from "@/components/ui/Panel";
import { CenterStagger, Rise } from "@/components/ui/Reveal";
import Shelf from "@/components/ui/Shelf";
import { collectionOf, getCollectionProducts, getProduct, products, shopifyImage } from "@/lib/catalogue";
import { site } from "@/lib/content/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return products.map((p) => ({ handle: p.handle }));
}

export async function generateMetadata({ params }: PageProps<"/products/[handle]">): Promise<Metadata> {
  const { handle } = await params;
  const p = getProduct(handle);
  if (!p) return {};
  const image = p.images[0] ? shopifyImage(p.images[0].src, 1200) : undefined;
  return {
    title: p.title,
    description: p.summary || `${p.title} by ${site.name}. Made to order, shipped in approximately two weeks.`,
    alternates: { canonical: `/products/${p.handle}` },
    openGraph: image ? { images: [{ url: image, alt: p.title }] } : undefined,
  };
}

export default async function ProductPage({ params }: PageProps<"/products/[handle]">) {
  const { handle } = await params;
  const p = getProduct(handle);
  if (!p) notFound();
  const col = collectionOf(p);
  const also = (col ? getCollectionProducts(col.handle) : products).filter((x) => x.handle !== p.handle).slice(0, 4);
  const fill = also.length < 4 ? products.filter((x) => x.handle !== p.handle && !also.includes(x)).slice(0, 4 - also.length) : [];
  const related = [...also, ...fill];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.title,
    sku: p.handle,
    image: p.images.slice(0, 4).map((im) => im.src),
    description: p.summary || p.details.map((d) => `${d.label}: ${d.value}`).join(". "),
    brand: { "@type": "Brand", name: site.name },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "AUD",
      lowPrice: p.price,
      highPrice: p.maxPrice,
      offerCount: p.variants.length,
      availability: p.available ? (p.preorder ? "https://schema.org/PreOrder" : "https://schema.org/InStock") : "https://schema.org/OutOfStock",
      url: `${site.url}/products/${p.handle}`,
    },
  };

  const band = !p.available ? ({ tone: "ink", text: "Sold out" } as const) : p.preorder ? ({ kind: "marquee", tone: "rx", items: ["Pre-order only — ships in approx. 2 weeks", "Made to order in Sydney", "Store credit only, no change-of-mind returns"] } as const) : ({ tone: "cobalt", text: "In stock — ships from Sydney" } as const);

  return (
    <Shelf>
      <Panel band={band} caption={p.title} inner="pad-x pt-[clamp(20px,3vw,36px)] pb-[clamp(40px,5vw,72px)]">
        <Rise as="div" className="t-label mb-7 flex flex-wrap items-center justify-center gap-2 text-muted">
          <TLink href="/shop" className="u-draw">
            Shop
          </TLink>
          {col && (
            <>
              <span className="text-faint">·</span>
              <TLink href={`/collections/${col.handle}`} className="u-draw">
                {col.title}
              </TLink>
            </>
          )}
          <span className="text-faint">·</span>
          <span className="text-ink">{p.title}</span>
        </Rise>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-[clamp(24px,4vw,64px)]">
          <div>
            <Gallery images={p.images} title={p.title} />
          </div>
          <div>
            <Rise className="lg:sticky lg:top-[calc(var(--edge)+var(--header-h)+16px)]" delay={0.15}>
              <BuyBox product={p} collection={col} />
            </Rise>
          </div>
        </div>
      </Panel>

      {related.length > 0 && (
        <Panel band={{ tone: "mustard", text: col ? `Also in ${col.title}` : "Also dispensed" }} caption={col ? `Also in ${col.title}` : "Also dispensed"}>
          <CenterStagger as="ul" className="grid grid-cols-2 gap-x-(--gap) gap-y-10 lg:grid-cols-4">
            {related.map((x) => (
              <li key={x.handle}>
                <ProductCard product={x} />
              </li>
            ))}
          </CenterStagger>
          <div className="mt-8 flex justify-center">
            <TLink href={col ? `/collections/${col.handle}` : "/shop"} className="btn btn--ghost">
              View all
            </TLink>
          </div>
        </Panel>
      )}

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </Shelf>
  );
}
