// Shopify Storefront API — used live from the browser for the bag.
//
// Products are read from the build-time snapshot (see lib/catalogue.ts), so
// the only runtime calls are checkout and a fresh availability check.
// When the token isn't configured yet, checkout falls back to a Shopify cart
// permalink (/cart/<variant>:<qty>,…), which needs no API at all.
//
// Env (both public by design — Storefront tokens are scoped and rate-limited):
//   NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN     e.g. theheaveneffect.myshopify.com
//   NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN
import { site } from "@/lib/content/site";

const DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN;
const API_VERSION = "2025-07";

export const storefrontConfigured = () => Boolean(DOMAIN && TOKEN);

export const variantGid = (id: number) => `gid://shopify/ProductVariant/${id}`;

type Gql<T> = { data?: T; errors?: { message: string }[] };

async function storefront<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  if (!DOMAIN || !TOKEN) throw new Error("Shopify Storefront API is not configured.");
  const res = await fetch(`https://${DOMAIN}/api/${API_VERSION}/graphql.json`, {
    method: "POST",
    headers: { "content-type": "application/json", "X-Shopify-Storefront-Access-Token": TOKEN },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`Shopify HTTP ${res.status}`);
  const json = (await res.json()) as Gql<T>;
  if (json.errors?.length) throw new Error(json.errors.map((e) => e.message).join("; "));
  if (!json.data) throw new Error("Empty Shopify response.");
  return json.data;
}

export type Line = { variantId: number; qty: number };

/** Create a Shopify cart from the local bag and return its hosted checkout URL. */
export async function createCheckout(lines: Line[]): Promise<string> {
  type Resp = { cartCreate: { cart: { checkoutUrl: string } | null; userErrors: { message: string }[] } };
  const data = await storefront<Resp>(
    /* GraphQL */ `
      mutation CartCreate($lines: [CartLineInput!]!) {
        cartCreate(input: { lines: $lines }) {
          cart { checkoutUrl }
          userErrors { message }
        }
      }
    `,
    { lines: lines.map((l) => ({ merchandiseId: variantGid(l.variantId), quantity: l.qty })) },
  );
  const errs = data.cartCreate.userErrors;
  if (errs.length || !data.cartCreate.cart) throw new Error(errs[0]?.message ?? "Could not create the cart.");
  return data.cartCreate.cart.checkoutUrl;
}

/** Shopify's cart permalink — works for any store, no API needed. */
export const permalinkCheckout = (lines: Line[]) =>
  `${site.shopify.store}/cart/${lines.map((l) => `${l.variantId}:${l.qty}`).join(",")}`;

/** Live availability for a product's variants, keyed by variant id. */
export async function fetchAvailability(handle: string): Promise<Record<number, boolean> | null> {
  if (!storefrontConfigured()) return null;
  try {
    type Resp = { product: { variants: { nodes: { id: string; availableForSale: boolean }[] } } | null };
    const data = await storefront<Resp>(
      /* GraphQL */ `
        query Availability($handle: String!) {
          product(handle: $handle) { variants(first: 50) { nodes { id availableForSale } } }
        }
      `,
      { handle },
    );
    if (!data.product) return null;
    const out: Record<number, boolean> = {};
    for (const v of data.product.variants.nodes) out[Number(v.id.split("/").pop())] = v.availableForSale;
    return out;
  } catch {
    return null;
  }
}
