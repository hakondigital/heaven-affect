import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

// Pages are prerendered and served from Workers static assets. Product data
// comes from Shopify at request time only on the product/collection routes
// (ISR), everything else is static.
//
// Cache interception stays OFF: it answers Next 16's segment-prefetch requests
// with the whole page's RSC payload, which the client router rejects and
// re-requests in a loop. Letting the Next server handle those is safe.
export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
  enableCacheInterception: false,
});
