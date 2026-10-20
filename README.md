# The Heaven Effect — website

Headless storefront for [theheaveneffect.com.au](https://theheaveneffect.com.au). Next.js 16 (App Router, React 19, TypeScript), Tailwind v4, GSAP 3 + ScrollTrigger/SplitText, Lenis. Shopify owns products, inventory, cart and checkout. Deployed to Cloudflare Workers with OpenNext.

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # syncs the catalogue from Shopify, then builds (every page prerenders)
npm run preview      # build + run the Cloudflare worker locally
npm run deploy       # build + deploy to Cloudflare (needs `npx wrangler login` once)
```

## Concept

**Cartons on a shelf.** The ground is the city at night (the film, pinned behind the page, then a faint grid of windows). Every section is a centred, bordered bone panel with a coloured band across its top — the front of a medicine box — and everything sits on a central axis: centred headlines, mirrored 2×2 and 3-up tiles, a strict blister-pack product grid, equal columns. The whole page lives inside a fixed die-line frame whose border draws itself as you scroll and whose foot names the carton in view.

- **Type:** headlines are Grenze Gotisch, a blackletter root drawn for screens (the "The" on the lockup). Everything clinical — labels, body, prices — is Public Sans.
- **Colour:** lifted from the boxes the artwork flips: cobalt (`#1f4ed8`), mustard (`#f0c23a`), bone (`#f1efe8`) on night (`#070912`). Red (`#d7322b`) only for warnings and pre-order.
- **The frame:** `src/components/layout/Frame.tsx`. Inverts over any ground, so it never needs a background. The header does the same.
- **The tower:** `src/components/ui/Tower.tsx` redraws the film's building on a canvas — windows that flicker at random and light up the monogram. It is the faint backdrop, the footer and the 404. The monogram bitmap is generated from the real logo by `npm run brand`.
- **Cartons:** `src/components/ui/Panel.tsx` — the panel, its band (a title, a warning marquee, or a strip of artwork) and the centred heading block. Pages compose these on a `Shelf`.
- **Lights on** (`src/components/layout/Intro.tsx`): on the first visit of a session the screen is the tower block in the dark — flats flicker on, the mark lights up window by window, the camera pushes through the windows into the real film, the frame draws itself clockwise and seals, the header slides in from both sides and the mark stamps in. Plays on every load; skipped only for reduced motion, where everything that listens for the `READY_EVENT` draws in straight away instead.
- **The stack** (`src/components/home/Stack.tsx`): on the home page each carton holds while the next slides over it, the covered one sinking back (smaller, dimmer) in step with the scroll. Cartons taller than the screen hold by their bottom edge so they can be read in full. Throwing the page tips the cartons with the scroll velocity; the backdrop's windows flicker faster too.
- **Elsewhere:** panels and pictures unfold from their centre line, bands fill from the centre, grids stagger outwards from the middle, the lid closes and opens between routes, and the frame's foot slides to the name of the carton in view.

## Where things live

| What                                            | Where                                                              |
| ----------------------------------------------- | ------------------------------------------------------------------ |
| Name, tagline, email, Instagram, policy text    | `src/lib/content/site.ts`                                          |
| Collection titles, blurbs, tile images, order   | `src/lib/content/collections.ts`                                   |
| Products (generated from Shopify — don't edit)  | `src/lib/content/catalogue.generated.json`                         |
| Product data helpers (prices, kinds, CDN sizes) | `src/lib/catalogue.ts`                                             |
| Shopify Storefront API (checkout, availability) | `src/lib/shopify/storefront.ts`                                    |
| The bag (state, drawer, summary)                | `src/components/providers/Cart.tsx`                                |
| Pages                                           | `src/app/**/page.tsx`                                              |
| Home cartons (Hero, Contents, Dosage, Directions, Notes) | `src/components/home/*`                                   |
| Shop UI (card, grid + filters, gallery, buy box)| `src/components/shop/*`                                            |
| Frame, header, menu, footer, backdrop           | `src/components/layout/*`                                          |
| Shared UI (Panel, Shelf, Reveal, Media, Tower, Marquee…) | `src/components/ui/*`                                     |
| Old Shopify-theme URL redirects                 | `next.config.ts`                                                   |
| Design tokens and type scale                    | `src/app/globals.css`                                              |

## Products come from Shopify

The owner edits products in Shopify admin as usual. `scripts/sync-catalogue.mjs` pulls the catalogue (titles, prices, variants, images, descriptions, collection membership) into a JSON snapshot that every page prerenders from — it runs automatically before each build, and `npm run catalogue` runs it on its own. Nothing is typed twice.

- Without a Storefront API token it reads the store's public `/products.json` endpoints.
- With `SHOPIFY_STORE_DOMAIN` + `SHOPIFY_STOREFRONT_TOKEN` in `.env` it uses the Storefront API instead — needed once the old theme is password-protected.
- If the sync fails (offline), the previous snapshot is kept so the build still ships.

**Keeping the live site fresh:** any change in Shopify needs a rebuild. Either redeploy after editing, or add a scheduled GitHub Action that runs `npm run deploy` daily (same pattern as the Nightfall site). See `SHOPIFY.md` for the full setup.

Product descriptions are parsed from Shopify's HTML: the "pre-order" sentence becomes a flag, `Fit / Fabric / Construction` blocks become the directions accordion, "Model is…" becomes the fit note.

## The bag and checkout

The bag lives in the browser (`localStorage`). On **Checkout**:

- with `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` + `NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN` set, it creates a Shopify cart through the Storefront API and sends the customer to the hosted checkout (live inventory, discount codes);
- without them, it sends the customer to a Shopify **cart permalink** (`/cart/<variant>:<qty>,…`) on theheaveneffect.com.au — no API needed, works today.

Product pages also refresh variant availability from Shopify on load when the API is connected.

## Images & video

Brand and editorial media live in `media-src/`. After adding or replacing a file there, run:

```bash
npm run media     # responsive WebP sizes + typed manifest, and the hero film at 1080/720 + poster
npm run brand     # marks lifted off the lockup, favicon set, share image, monogram bitmap
```

Reference images by file name, e.g. `<Media name="lookbook-01" alt="…" />`. The manifest (`src/lib/media.generated.ts`) is generated. Product photos are not copied — they're served from Shopify's CDN, resized on request (`shopifyImage()` in `src/lib/catalogue.ts`).

## Forms

- **Contact** (`/contact`) posts to `/api/send`, which emails through [Resend](https://resend.com). Set `RESEND_API_KEY`, `CONTACT_TO` and `CONTACT_FROM` as Secrets on the Cloudflare worker. Without a key the route answers 503 and the form opens a pre-filled email instead. A hidden honeypot field catches bots.
- **Newsletter** (footer) posts to the Shopify store's customer form — the same endpoint the old theme used — so subscribers land in Shopify's customer list tagged `newsletter`. Swap in a Shopify Email / Klaviyo form when one exists (`src/components/forms/Newsletter.tsx`).

## Placeholders to confirm with the client

Search the code for `TODO(client)`:

- `site.email` — the public inbox (used by the contact fallback and footer).
- The brand copy in `site.ts`, `collections.ts` and `Manifesto.tsx` is written from the products and the photography; the owner should read it once.

## Going live on theheaveneffect.com.au

1. `npx wrangler login`, then `npm run deploy`.
2. Move the domain's DNS to Cloudflare and uncomment the `routes` block in `wrangler.jsonc`.
3. In Shopify: keep the old theme's storefront password-protected (customers only ever see this site and Shopify's checkout), and set the Storefront API token so the catalogue sync keeps working (`SHOPIFY.md`).
4. Old URLs (`/collections/shop-all-1`, `/pages/lookbook-24`, `/pages/contact`, `/pages/online-policy`, collection-scoped product URLs) permanently redirect to their new homes. Product and collection handles are unchanged.
