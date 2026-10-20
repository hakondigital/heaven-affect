// Everything about the business that isn't a product. Copy marked
// TODO(client) is a placeholder for the owner to confirm.

export const site = {
  name: "The Heaven Effect",
  short: "THE",
  url: "https://theheaveneffect.com.au",

  // The brand's own words, as printed on the lockup.
  tagline: "Blessed beyond explanation. Nothing is a coincidence.",
  taglineLine1: "Blessed beyond explanation",
  taglineLine2: "No such thing as a coincidence",

  description:
    "The Heaven Effect is a Sydney streetwear label. Heavyweight fleece and cotton, printed with the warning labels, scripts and pharmacy boxes it flips. Made to order, shipped in about two weeks.",
  seoDescription:
    "The Heaven Effect — Sydney streetwear. Pain Pack, Tracksuit, MHC x THE and Drop 2: heavyweight hoods, crews and tees, made to order and shipped in approximately two weeks. Blessed beyond explanation.",

  location: { city: "Sydney", state: "NSW", country: "Australia", label: "Sydney, AU" },

  // TODO(client): confirm the public inbox. Used for the contact form fallback and the footer.
  email: "info@theheaveneffect.com.au",

  links: {
    instagram: "https://www.instagram.com/theheaveneffect__/",
    instagramHandle: "@theheaveneffect__",
  },

  // The Shopify store that owns products, inventory, cart and checkout.
  shopify: {
    // Used for cart permalinks and the newsletter form until the Storefront API is connected.
    store: "https://theheaveneffect.com.au",
  },

  policy: {
    credit: "We only offer store credit. No exchange or refund for change of mind. If the product is faulty, we will issue a refund.",
    preorder: "Every piece is made to order. Orders ship in approximately two weeks.",
  },

  // The warning strip. Mostly the shop's real terms, in the brand's voice.
  ticker: [
    "This garment may cause drowsiness",
    "Pre-order only — ships in approx. 2 weeks",
    "Store credit only, no change-of-mind returns",
    "Blessed beyond explanation",
    "No such thing as a coincidence",
    "Made to order in Sydney, AU",
  ],
} as const;

export type NavItem = { label: string; href: string; code?: string };

export const primaryNav: NavItem[] = [
  { label: "Shop", href: "/shop", code: "00" },
  { label: "Tracksuit", href: "/collections/tracksuit", code: "01" },
  { label: "Pain Pack", href: "/collections/pain-pack", code: "02" },
  { label: "MHC x THE", href: "/collections/mhc-x-the", code: "03" },
  { label: "Drop 2", href: "/collections/charlie-sheen", code: "04" },
  { label: "Lookbook", href: "/lookbook", code: "05" },
];

export const secondaryNav: NavItem[] = [
  { label: "Contact", href: "/contact" },
  { label: "Online policy", href: "/policy" },
];

export const allRoutes: NavItem[] = [...primaryNav, ...secondaryNav, { label: "Bag", href: "/cart" }];
