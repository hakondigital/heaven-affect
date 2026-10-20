import type { Metadata, Viewport } from "next";
import Backdrop from "@/components/layout/Backdrop";
import Footer from "@/components/layout/Footer";
import Frame from "@/components/layout/Frame";
import Header from "@/components/layout/Header";
import Intro from "@/components/layout/Intro";
import { BagDrawer, CartProvider } from "@/components/providers/Cart";
import SmoothScroll from "@/components/providers/SmoothScroll";
import TransitionProvider from "@/components/providers/Transition";
import { site } from "@/lib/content/site";
import { gotisch, publicSans } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "The Heaven Effect — Sydney streetwear. Blessed beyond explanation.",
    template: "%s — The Heaven Effect",
  },
  description: site.seoDescription,
  applicationName: site.name,
  keywords: ["The Heaven Effect", "THE", "Sydney streetwear", "Pain Pack", "Flip the Script hood", "Drowsy sticker", "MHC x THE", "heavyweight hoodie Australia", "tracksuit Sydney"],
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "en_AU",
    url: site.url,
    title: site.name,
    description: site.description,
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: site.name }],
  },
  twitter: { card: "summary_large_image", title: site.name, description: site.description, images: ["/og.jpg"] },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#070912",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${site.url}/#org`,
  name: site.name,
  alternateName: site.short,
  url: site.url,
  logo: `${site.url}/brand/mark-ink.png`,
  sameAs: [site.links.instagram],
  description: site.description,
  address: { "@type": "PostalAddress", addressLocality: site.location.city, addressRegion: site.location.state, addressCountry: "AU" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-AU" className={`${gotisch.variable} ${publicSans.variable}`}>
      <body>
        <a href="#main" className="t-label sr-only z-400 bg-cobalt px-4 py-3 text-white focus:not-sr-only focus:fixed focus:left-3 focus:top-3">
          Skip to content
        </a>
        <SmoothScroll>
          <TransitionProvider>
            <CartProvider>
              <Backdrop />
              <Header />
              <main id="main" className="relative z-10">
                {children}
              </main>
              <Footer />
              <Frame />
              <BagDrawer />
              <Intro />
            </CartProvider>
          </TransitionProvider>
        </SmoothScroll>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </body>
    </html>
  );
}
