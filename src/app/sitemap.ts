import type { MetadataRoute } from "next";
import { products } from "@/lib/catalogue";
import { collections } from "@/lib/content/collections";
import { site } from "@/lib/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes: [string, number][] = [
    ["/", 1],
    ["/shop", 0.9],
    ["/lookbook", 0.7],
    ["/contact", 0.5],
    ["/policy", 0.3],
  ];
  return [
    ...routes.map(([path, priority]) => ({ url: `${site.url}${path}`, lastModified: now, priority })),
    ...collections.map((c) => ({ url: `${site.url}/collections/${c.handle}`, lastModified: now, priority: 0.8 })),
    ...products.map((p) => ({ url: `${site.url}/products/${p.handle}`, lastModified: new Date(p.publishedAt), priority: 0.7 })),
  ];
}
