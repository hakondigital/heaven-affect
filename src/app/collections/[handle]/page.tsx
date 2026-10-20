import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TLink } from "@/components/providers/Transition";
import ProductGrid from "@/components/shop/ProductGrid";
import Media from "@/components/ui/Media";
import Panel, { Heading } from "@/components/ui/Panel";
import Parallax from "@/components/ui/Parallax";
import { CenterStagger, Unfold } from "@/components/ui/Reveal";
import Shelf from "@/components/ui/Shelf";
import { getCollectionProducts } from "@/lib/catalogue";
import { collectionByHandle, collections } from "@/lib/content/collections";

export const dynamicParams = false;

export function generateStaticParams() {
  return collections.map((c) => ({ handle: c.handle }));
}

export async function generateMetadata({ params }: PageProps<"/collections/[handle]">): Promise<Metadata> {
  const { handle } = await params;
  const c = collectionByHandle(handle);
  if (!c) return {};
  return { title: c.title, description: c.intro, alternates: { canonical: `/collections/${c.handle}` } };
}

export default async function CollectionPage({ params }: PageProps<"/collections/[handle]">) {
  const { handle } = await params;
  const c = collectionByHandle(handle);
  if (!c) notFound();
  const list = getCollectionProducts(c.handle);
  const others = collections.filter((x) => x.handle !== c.handle);
  const band = c.strip ? ({ kind: "strip", name: c.strip } as const) : ({ tone: c.accent === "pill" ? "cobalt" : "mustard", text: `${c.code} — ${c.title}` } as const);

  return (
    <Shelf>
      <Panel band={band} caption={`${c.code} — ${c.title}`}>
        <Heading eyebrow={`${c.code} — Collection · ${list.length} ${list.length === 1 ? "piece" : "pieces"}`} title={c.title} lede={c.intro} />

        {c.banner && (
          <Unfold className="relative mx-auto mt-[clamp(28px,4vw,48px)] aspect-[16/6] w-full max-w-[64rem] border border-ink">
            <Parallax amount={10} className="absolute inset-0">
              <Media name={c.banner} alt={`${c.title} artwork`} sizes="(min-width: 1024px) 64rem, 100vw" fit={c.banner === "banner-wide" ? "contain" : "cover"} className="sheet h-full w-full" />
            </Parallax>
          </Unfold>
        )}

        <ProductGrid products={list} showKind={list.length > 3} className="mt-[clamp(28px,4vw,56px)]" />
      </Panel>

      <Panel band={{ tone: "ink", text: "Other lines" }} caption="Other lines" inner="pad-x py-[clamp(28px,3.5vw,48px)]">
        <CenterStagger as="ul" className="grid grid-cols-2 gap-(--gap) md:grid-cols-4">
          {[...others.map((o) => ({ label: o.title, href: `/collections/${o.handle}`, code: o.code })), { label: "Shop all", href: "/shop", code: "00" }].map((o) => (
            <li key={o.href}>
              <TLink href={o.href} className="group flex flex-col items-center gap-2 border border-ink bg-white py-6 text-center transition-colors hover:bg-ink hover:text-bone">
                <span className="t-label opacity-60">{o.code}</span>
                <span className="t-m">{o.label}</span>
              </TLink>
            </li>
          ))}
        </CenterStagger>
      </Panel>
    </Shelf>
  );
}
