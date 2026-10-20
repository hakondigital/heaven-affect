import type { MediaName } from "@/lib/media";

// Editorial layer over Shopify's collections. Membership (which products are
// in which collection) comes from Shopify via the catalogue snapshot; the
// words and imagery live here. Handles match the Shopify store so every old
// /collections/<handle> link still resolves.
export type CollectionMeta = {
  handle: string;
  title: string;
  code: string;
  /** one line under the title */
  blurb: string;
  /** longer intro on the collection page */
  intro: string;
  /** the tile on the home page */
  tile: MediaName;
  tilePosition?: string;
  /** optional artwork strip across the collection page header */
  strip?: MediaName;
  /** optional full-width artwork on the collection page */
  banner?: MediaName;
  accent?: "rx" | "pill";
};

export const collections: CollectionMeta[] = [
  {
    handle: "tracksuit",
    title: "Tracksuit",
    code: "01",
    blurb: "Deep green. 400 GSM fleece, snow and enzyme washed.",
    intro:
      "A zip-up jacket and a tapered pant in heavyweight 400 GSM fleece-lined fabric, snowflake, stone and enzyme washed to a faded deep green. Sold as separates.",
    tile: "banner-tracksuit",
    tilePosition: "50% 30%",
  },
  {
    handle: "pain-pack",
    title: "Pain Pack",
    code: "02",
    blurb: "The warning label, worn. Hoods, crews and tees.",
    intro:
      "The label flipped into a wardrobe. Flip the Script, Drowsy, Xansoldiers, 40s and 80s — 350 GSM CVC fleece hoods and crews and 150 GSM cotton tees, relaxed with a drop shoulder.",
    tile: "banner-pain-pack",
    tilePosition: "50% 20%",
    strip: "collection-pain-pack",
    banner: "banner-wide",
    accent: "rx",
  },
  {
    handle: "mhc-x-the",
    title: "MHC x THE",
    code: "03",
    blurb: "With The Milf Hunters Club. When life gets hard, keep going.",
    intro: "A collaboration with The Milf Hunters Club. One tee, 100% cotton, 150 GSM. When life gets hard, keep going.",
    tile: "editorial-viagra-sunset",
    tilePosition: "50% 30%",
    strip: "collection-mhc-x-the",
    banner: "banner-mhc-x-the",
    accent: "pill",
  },
  {
    handle: "charlie-sheen",
    title: "Drop 2",
    code: "04",
    blurb: "Charlie Sheen and Paranoia. Two mid-heavyweight hoods.",
    intro: "Charlie Sheen and Paranoia. Two 350 GSM mid-heavyweight hoods, relaxed fit and drop shoulder, printed front, back and sleeve.",
    tile: "editorial-elevator",
    tilePosition: "50% 20%",
  },
];

export const collectionByHandle = (handle: string) => collections.find((c) => c.handle === handle);

// Shopify handles the old theme linked to, mapped onto the new routes.
export const legacyCollectionRedirects: [string, string][] = [
  ["/collections/shop-all-1", "/shop"],
  ["/collections/shop-all", "/shop"],
  ["/collections/all", "/shop"],
  ["/collections/frontpage", "/"],
];
