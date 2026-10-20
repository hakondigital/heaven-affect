// Pulls the live catalogue from Shopify and writes a snapshot the site builds
// from, so every page prerenders with real products, prices and images even
// before a Storefront API token exists.
//
//   npm run catalogue
//
// Source, in order of preference:
//   1. Storefront API — when SHOPIFY_STORE_DOMAIN + SHOPIFY_STOREFRONT_TOKEN
//      are set (.env). Keeps working once the old theme is password-protected.
//   2. The store's public /products.json and /collections/<handle>/products.json.
//
// Output: src/lib/content/catalogue.generated.json
import { writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { readFileSync, existsSync } from "node:fs";

const ROOT = process.cwd();
const OUT = join(ROOT, "src/lib/content/catalogue.generated.json");

// .env is optional — read by hand so this script needs no dependencies.
if (existsSync(join(ROOT, ".env"))) {
  for (const line of readFileSync(join(ROOT, ".env"), "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"#]*)"?\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
}

const PUBLIC_STORE = "https://theheaveneffect.com.au";
const STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN || process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN || process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN;
const API_VERSION = "2025-07";

// The collections the site shows, in nav order. Membership comes from Shopify.
const COLLECTIONS = ["tracksuit", "pain-pack", "mhc-x-the", "charlie-sheen"];
const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

const UA = "Mozilla/5.0 (compatible; theheaveneffect-site-sync)";

// ── description parsing ──────────────────────────────────────────
const decode = (s) =>
  s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&rsquo;|&lsquo;/g, "'")
    .replace(/&[a-z]+;/g, " ");
const text = (html) =>
  decode(html.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, " "))
    .replace(/[ \t]+/g, " ")
    .replace(/\s*\n\s*/g, "\n")
    .trim();
const clean = (s) => s.replace(/\s+/g, " ").trim();
const PREORDER = /pre-?order/i;

/** Shopify body_html → summary, spec rows, model note, pre-order flag. */
function parseBody(html = "") {
  let src = html.replace(/<meta[^>]*>/gi, "");
  let preorder = false;
  const details = [];
  let note = "";

  // "<strong>Fit:</strong><div class=tab-value>Relaxed</div>" blocks
  const blockRe = /<strong>\s*([A-Za-z ]+?):?\s*<\/strong>\s*((?:<div class="tab-value">[\s\S]*?<\/div>\s*)+)/g;
  src = src.replace(blockRe, (_, label, values) => {
    const parts = [...values.matchAll(/<div class="tab-value">([\s\S]*?)<\/div>/g)].map((m) => text(m[1])).filter(Boolean);
    const body = [];
    for (const p of parts) {
      if (/^model is/i.test(p)) note = clean(p);
      else body.push(p);
    }
    const value = clean(body.join(" · ").replace(/\n/g, " · "));
    if (value) details.push({ label: clean(label), value });
    return " ";
  });

  // everything else becomes paragraphs
  const paras = text(src)
    .split(/\n+/)
    .map(clean)
    .filter(Boolean)
    .filter((p) => {
      if (PREORDER.test(p)) {
        preorder = true;
        return false;
      }
      if (/^model is/i.test(p)) {
        note = p;
        return false;
      }
      return true;
    });

  // a model note sometimes trails the construction row
  for (const d of details) {
    const m = d.value.match(/(?:·\s*)?(model is [^·]+)$/i);
    if (m) {
      note = clean(m[1]);
      d.value = clean(d.value.replace(m[0], "").replace(/\s*·\s*$/, ""));
    }
  }

  return { summary: paras.join(" "), details, note, preorder };
}

const sizeSort = (a, b) => {
  const ia = SIZE_ORDER.indexOf(a.toUpperCase());
  const ib = SIZE_ORDER.indexOf(b.toUpperCase());
  return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
};

function normalise(base, variants, images) {
  const prices = variants.map((v) => v.price);
  return {
    ...base,
    price: Math.min(...prices),
    maxPrice: Math.max(...prices),
    compareAt: variants.find((v) => v.compareAt)?.compareAt ?? null,
    currency: "AUD",
    images,
    variants,
    sizes: [...new Set(variants.map((v) => v.title))].sort(sizeSort),
  };
}

// ── public JSON source ───────────────────────────────────────────
async function getJson(url) {
  const res = await fetch(url, { headers: { "user-agent": UA, accept: "application/json" } });
  if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
  return res.json();
}

function fromPublic(p) {
  const variants = p.variants.map((v) => ({
    id: Number(v.id),
    title: v.title,
    available: !!v.available,
    price: Number(v.price),
    compareAt: v.compare_at_price ? Number(v.compare_at_price) : null,
  }));
  return normalise(
    {
      id: Number(p.id),
      handle: p.handle,
      title: clean(p.title),
      type: clean(p.product_type || ""),
      vendor: p.vendor,
      available: variants.some((v) => v.available),
      ...parseBody(p.body_html),
      publishedAt: p.published_at,
      createdAt: p.created_at,
    },
    variants,
    p.images.map((im) => ({ src: im.src, w: im.width, h: im.height, alt: im.alt || "" })),
  );
}

async function syncPublic() {
  const { products } = await getJson(`${PUBLIC_STORE}/products.json?limit=250`);
  const collections = {};
  for (const handle of COLLECTIONS) {
    const data = await getJson(`${PUBLIC_STORE}/collections/${handle}/products.json?limit=250`);
    collections[handle] = data.products.map((p) => p.handle);
  }
  return { source: "public-json", products: products.map(fromPublic), collections };
}

// ── Storefront API source ────────────────────────────────────────
const gid = (s) => Number(String(s).split("/").pop());

async function storefront(query, variables) {
  const res = await fetch(`https://${STORE_DOMAIN}/api/${API_VERSION}/graphql.json`, {
    method: "POST",
    headers: { "content-type": "application/json", "X-Shopify-Storefront-Access-Token": TOKEN },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`Storefront HTTP ${res.status}`);
  const json = await res.json();
  if (json.errors?.length) throw new Error(json.errors.map((e) => e.message).join("; "));
  return json.data;
}

const PRODUCT_FIELDS = `
  id handle title productType vendor descriptionHtml availableForSale publishedAt createdAt
  images(first: 20) { nodes { url width height altText } }
  variants(first: 50) { nodes { id title availableForSale price { amount } compareAtPrice { amount } } }
`;

function fromStorefront(p) {
  const variants = p.variants.nodes.map((v) => ({
    id: gid(v.id),
    title: v.title,
    available: v.availableForSale,
    price: Number(v.price.amount),
    compareAt: v.compareAtPrice ? Number(v.compareAtPrice.amount) : null,
  }));
  return normalise(
    {
      id: gid(p.id),
      handle: p.handle,
      title: clean(p.title),
      type: clean(p.productType || ""),
      vendor: p.vendor,
      available: p.availableForSale,
      ...parseBody(p.descriptionHtml),
      publishedAt: p.publishedAt,
      createdAt: p.createdAt,
    },
    variants,
    p.images.nodes.map((im) => ({ src: im.url, w: im.width, h: im.height, alt: im.altText || "" })),
  );
}

async function syncStorefront() {
  const all = await storefront(`{ products(first: 250, sortKey: CREATED_AT, reverse: true) { nodes { ${PRODUCT_FIELDS} } } }`);
  const collections = {};
  for (const handle of COLLECTIONS) {
    const data = await storefront(`query ($handle: String!) { collection(handle: $handle) { products(first: 250) { nodes { handle } } } }`, { handle });
    collections[handle] = data.collection?.products.nodes.map((n) => n.handle) ?? [];
  }
  return { source: "storefront", products: all.products.nodes.map(fromStorefront), collections };
}

// ── run ──────────────────────────────────────────────────────────
console.log(`Syncing catalogue from ${STORE_DOMAIN && TOKEN ? `Storefront API (${STORE_DOMAIN})` : PUBLIC_STORE}…`);
let result;
try {
  result = STORE_DOMAIN && TOKEN ? await syncStorefront() : await syncPublic();
} catch (err) {
  // Offline, or Shopify is down: keep the last snapshot so the build still ships.
  if (existsSync(OUT)) {
    console.warn(`  ! sync failed (${err.message}) — keeping the existing snapshot`);
    process.exit(0);
  }
  throw err;
}

// newest first, as on the store
result.products.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

const out = { syncedAt: new Date().toISOString(), ...result };
await mkdir(dirname(OUT), { recursive: true });
await writeFile(OUT, JSON.stringify(out, null, 2) + "\n");

for (const p of out.products) {
  console.log(
    `  ${p.handle.padEnd(32)} A$${String(p.price).padStart(4)}  ${String(p.images.length).padStart(2)} img  ${p.sizes.join("/")}${p.preorder ? "  pre-order" : ""}${p.available ? "" : "  SOLD OUT"}`,
  );
}
for (const [h, items] of Object.entries(out.collections)) console.log(`  collection ${h.padEnd(14)} ${items.length} products`);
console.log(`\n  → ${OUT} (${out.products.length} products, source: ${out.source})`);
