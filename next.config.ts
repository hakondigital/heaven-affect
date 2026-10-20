import type { NextConfig } from "next";
import { legacyCollectionRedirects } from "./src/lib/content/collections";

// Old Shopify-theme URLs → new routes, so shared links and rankings survive.
const legacy: [string, string][] = [
  ...legacyCollectionRedirects,
  ["/pages/lookbook-24", "/lookbook"],
  ["/pages/lookbook", "/lookbook"],
  ["/pages/contact", "/contact"],
  ["/pages/online-policy", "/policy"],
  ["/policies/refund-policy", "/policy"],
  ["/search", "/shop"],
  ["/account", "/"],
  ["/account/login", "/"],
];

const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), usb=()" },
];

const nextConfig: NextConfig = {
  reactCompiler: true,
  poweredByHeader: false,
  async redirects() {
    return [
      ...legacy.map(([source, destination]) => ({ source, destination, permanent: true })),
      // product URLs under a collection → the product itself
      { source: "/collections/:collection/products/:handle", destination: "/products/:handle", permanent: true },
    ];
  },
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      {
        source: "/media/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }],
      },
      {
        source: "/brand/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }],
      },
    ];
  },
};

export default nextConfig;
