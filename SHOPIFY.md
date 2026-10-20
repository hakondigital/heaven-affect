# Shopify setup — headless The Heaven Effect

This Next.js site is the storefront. **Shopify stays the source of truth** for products, prices, inventory, the cart and checkout. The owner keeps adding and editing products in Shopify admin exactly as before; the site rebuilds from Shopify's data.

Two modes, and the site works in both:

| | Today (no API token) | Connected (Storefront API token) |
| --- | --- | --- |
| Products on the site | from the store's public `/products.json` | from the Storefront API |
| Add to bag | yes | yes |
| Checkout | Shopify **cart permalink** → hosted checkout | Shopify **cart** via API → hosted checkout (live stock, discount codes) |
| Live "sold out" on product page | from the last build | refreshed on every page load |
| Works once the old theme is password-protected | no (public JSON is locked too) | yes |

## 1. Create the Storefront API token (one-time, ~5 minutes)

1. Shopify admin → **Settings → Apps and sales channels → Develop apps → Create an app** (e.g. "THE website").
2. **Configure Storefront API scopes** and enable:
   - `unauthenticated_read_product_listings`
   - `unauthenticated_read_product_inventory`
   - `unauthenticated_write_checkouts`
   - `unauthenticated_read_checkouts`
3. **Install app** → copy the **Storefront API access token**.
4. Note the store's `*.myshopify.com` domain (Settings → Domains).

## 2. Put the token where the site reads it

Locally, copy `.env.example` to `.env` and fill in:

```
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=<store>.myshopify.com
NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN=<token>
SHOPIFY_STORE_DOMAIN=<store>.myshopify.com
SHOPIFY_STOREFRONT_TOKEN=<token>
```

In production, add the same four variables in the Cloudflare dashboard (Workers → the site → Settings → Variables). `wrangler.jsonc` has `keep_vars: true`, so dashboard variables survive deploys. Storefront tokens are public by design (scoped and rate-limited) — the Admin API token is never used and must never be added here.

## 3. Product data conventions (what the site reads)

Nothing new to fill in. The site uses Shopify's standard fields:

- **Title**, **Price** (and compare-at price for a strike-through), **Status: Active**, **Online Store** sales channel.
- **Media** — the first image is the tile on the grid; the second is what slides in on hover (an on-body shot works best); all of them appear on the product page.
- **Variants** — one option named **Size**. Sold-out sizes render struck through once inventory tracking is on for the variant (Inventory → "Track quantity", and "Continue selling when out of stock" off).
- **Product type** — `HOOD`, `T-Shirt`, `Crew`, `Tracksuit`. Drives the Hoods / Tees / Crews / Jackets filter. (Three current products have no type set — the site infers it from the title, but setting it is tidier.)
- **Description** — the usual format works: the "available for pre-order only" sentence becomes the red PRE-ORDER band, `Fit:` / `Fabric:` / `Construction:` blocks become the directions accordion, "Model is 175cm wearing a Medium" becomes the fit note.
- **Collections** — `tracksuit`, `pain-pack`, `mhc-x-the`, `charlie-sheen` (shown as "Drop 2"). Membership is read from Shopify. To add a new line: create the collection in Shopify, then add it to `COLLECTIONS` in `scripts/sync-catalogue.mjs` and to `src/lib/content/collections.ts` with its title, blurb and tile image.

## 4. Publishing a change

Every change in Shopify needs a rebuild to appear on the site (the pages are prerendered for speed):

- **Manual:** `npm run deploy` from the repo (or push to the connected Git branch if Cloudflare Workers Builds is set up).
- **Automatic:** add a scheduled GitHub Action that runs `npm run deploy` daily or every few hours. The build's `prebuild` step syncs the catalogue first.

If the sync can't reach Shopify, the build keeps the previous snapshot rather than failing.

## 5. Checkout branding

Customers pay on Shopify's hosted checkout. Match it to the site in **Settings → Checkout → Customize**: background `#f3f1ec`, text `#0d0d0d`, accent `#d8322b`, upload the mark (`public/brand/mark-ink.png`). Rewrite the order confirmation email in **Settings → Notifications**.

## 6. Going live

1. Deploy the site (see README) and point `theheaveneffect.com.au` at it.
2. In Shopify, **Online Store → Preferences → Password protection** — turn it on so the old theme is never seen; checkout keeps working on `checkout.shopify.com` / the store's myshopify domain.
3. Make sure the Storefront token is set in Cloudflare first (step 2) — once the password is on, the public JSON the no-token mode relies on is locked.
4. Test a purchase end-to-end with Shopify's **Bogus Gateway** before switching the real gateway on.

## 7. Newsletter

The footer form posts to the store's customer form, so sign-ups appear under **Customers** tagged `newsletter` and accept marketing. When a Shopify Email / Klaviyo form exists, swap it in at `src/components/forms/Newsletter.tsx`.
