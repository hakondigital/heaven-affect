// The product data layer. Shopify is the source of truth; this reads the
// snapshot `scripts/sync-catalogue.mjs` writes before every build, so pages
// prerender with real products and the site never waits on Shopify at
// request time. The bag talks to Shopify live (see shopify/storefront.ts).
import snapshot from "./content/catalogue.generated.json";
import { collections as collectionMeta } from "./content/collections";

export type ProductImage = { src: string; w: number; h: number; alt: string };
export type Variant = { id: number; title: string; available: boolean; price: number; compareAt: number | null };
export type Detail = { label: string; value: string };

export type Product = {
  id: number;
  handle: string;
  title: string;
  type: string;
  vendor: string;
  price: number;
  maxPrice: number;
  compareAt: number | null;
  currency: string;
  available: boolean;
  summary: string;
  details: Detail[];
  note: string;
  preorder: boolean;
  images: ProductImage[];
  variants: Variant[];
  sizes: string[];
  publishedAt: string;
  createdAt: string;
};

type Snapshot = { syncedAt: string; source: string; products: Product[]; collections: Record<string, string[]> };

const data = snapshot as Snapshot;

/** Every product, newest first. */
export const products: Product[] = data.products;

export const catalogueSyncedAt = data.syncedAt;

export const getProduct = (handle: string) => products.find((p) => p.handle === handle);

export const collectionHandles = () => collectionMeta.map((c) => c.handle);

/** Products in a Shopify collection, in the store's order. */
export const getCollectionProducts = (handle: string): Product[] =>
  (data.collections[handle] ?? []).map((h) => getProduct(h)).filter((p): p is Product => !!p);

/** The first collection a product belongs to (nav order), for breadcrumbs and "also in". */
export const collectionOf = (product: Product) => collectionMeta.find((c) => (data.collections[c.handle] ?? []).includes(product.handle));

export const collectionCount = (handle: string) => (data.collections[handle] ?? []).length;

/** "Hood", "Tee", "Crew", "Tracksuit" — from Shopify's product type, else the title. */
export const kindOf = (p: Product) => {
  const t = (p.type || "").toLowerCase();
  if (t.includes("hood")) return "Hood";
  if (t.includes("shirt") || t.includes("tee")) return "Tee";
  if (t.includes("crew")) return "Crew";
  if (t.includes("track")) return p.title.toLowerCase().includes("pant") ? "Pant" : "Jacket";
  const n = p.title.toLowerCase();
  if (n.includes("hood")) return "Hood";
  if (n.includes("t-shirt") || n.includes("tee")) return "Tee";
  if (n.includes("crew")) return "Crew";
  if (n.includes("pant")) return "Pant";
  if (n.includes("jacket")) return "Jacket";
  return "Piece";
};

export const kinds = () => [...new Set(products.map(kindOf))];

export const formatPrice = (n: number) => `$${n.toLocaleString("en-AU", { maximumFractionDigits: 0 })}`;

/** Short, label-style spec drawn from the details or the summary. */
export const fabricOf = (p: Product) => {
  const d = p.details.find((x) => /fabric/i.test(x.label));
  if (d) {
    const m = d.value.match(/(\d{3})\s*gsm/i);
    return m ? `${m[1]} GSM` : d.value.split("·")[0].trim();
  }
  const m = p.summary.match(/(\d{3})\s*gsm/i);
  return m ? `${m[1]} GSM` : "";
};

export const fitOf = (p: Product) => p.details.find((x) => /fit/i.test(x.label))?.value ?? (/relaxed/i.test(p.summary) ? "Relaxed" : "");

/** Batch-style reference printed on the label: last six digits of the Shopify id. */
export const batchOf = (p: Product) => String(p.id).slice(-6);

/** Image URL from the Shopify CDN at a given width (the CDN resizes on request). */
export const shopifyImage = (src: string, width: number) => {
  const url = new URL(src);
  url.searchParams.set("width", String(width));
  return url.toString();
};

export const SHOPIFY_WIDTHS = [480, 720, 960, 1280, 1600, 2048] as const;

export const shopifySrcSet = (img: ProductImage) =>
  SHOPIFY_WIDTHS.filter((w) => w <= Math.max(img.w, 480))
    .map((w) => `${shopifyImage(img.src, w)} ${w}w`)
    .join(", ");
