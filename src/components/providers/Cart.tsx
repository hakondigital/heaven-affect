"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useLenis } from "@/components/providers/SmoothScroll";
import { TLink } from "@/components/providers/Transition";
import Barcode from "@/components/ui/Barcode";
import { Close, Minus, Plus } from "@/components/ui/Icons";
import ShopImage from "@/components/ui/ShopImage";
import { formatPrice, type ProductImage } from "@/lib/catalogue";
import { site } from "@/lib/content/site";
import { gsap } from "@/lib/gsap";
import { createCheckout, permalinkCheckout, storefrontConfigured } from "@/lib/shopify/storefront";
import { cn } from "@/lib/utils";

export type BagLine = {
  variantId: number;
  handle: string;
  title: string;
  size: string;
  price: number;
  image: ProductImage | null;
  qty: number;
  preorder: boolean;
};

type Ctx = {
  lines: BagLine[];
  count: number;
  subtotal: number;
  open: boolean;
  busy: boolean;
  error: string | null;
  setOpen: (v: boolean) => void;
  add: (line: Omit<BagLine, "qty">, qty?: number) => void;
  setQty: (variantId: number, qty: number) => void;
  remove: (variantId: number) => void;
  clear: () => void;
  checkout: () => Promise<void>;
};

const CartContext = createContext<Ctx | null>(null);
export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
};

const KEY = "the-bag-v1";

const load = (): BagLine[] => {
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as { lines?: BagLine[] }) : null;
    return Array.isArray(parsed?.lines) ? parsed!.lines.filter((l) => l && typeof l.variantId === "number" && l.qty > 0) : [];
  } catch {
    return [];
  }
};

/**
 * The bag lives in the browser; Shopify owns checkout. On "Checkout" the
 * lines become a Shopify cart (Storefront API) or a cart permalink, and the
 * customer lands in Shopify's hosted checkout either way.
 */
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<BagLine[]>([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hydrated = useRef(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read the saved bag once on the client
    setLines(load());
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify({ lines }));
    } catch {
      // private mode — the bag just won't persist
    }
  }, [lines]);

  const add = useCallback((line: Omit<BagLine, "qty">, qty = 1) => {
    setError(null);
    setLines((prev) => {
      const i = prev.findIndex((l) => l.variantId === line.variantId);
      if (i >= 0) return prev.map((l, j) => (j === i ? { ...l, qty: l.qty + qty } : l));
      return [...prev, { ...line, qty }];
    });
    setOpen(true);
  }, []);

  const setQty = useCallback((variantId: number, qty: number) => {
    setLines((prev) => (qty <= 0 ? prev.filter((l) => l.variantId !== variantId) : prev.map((l) => (l.variantId === variantId ? { ...l, qty } : l))));
  }, []);

  const remove = useCallback((variantId: number) => setLines((prev) => prev.filter((l) => l.variantId !== variantId)), []);
  const clear = useCallback(() => setLines([]), []);

  const checkout = useCallback(async () => {
    if (!lines.length || busy) return;
    setBusy(true);
    setError(null);
    const payload = lines.map((l) => ({ variantId: l.variantId, qty: l.qty }));
    try {
      const url = storefrontConfigured() ? await createCheckout(payload) : permalinkCheckout(payload);
      window.location.assign(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout is unavailable right now.");
      setBusy(false);
    }
  }, [lines, busy]);

  const value = useMemo<Ctx>(
    () => ({
      lines,
      count: lines.reduce((n, l) => n + l.qty, 0),
      subtotal: lines.reduce((n, l) => n + l.qty * l.price, 0),
      open,
      busy,
      error,
      setOpen,
      add,
      setQty,
      remove,
      clear,
      checkout,
    }),
    [lines, open, busy, error, add, setQty, remove, clear, checkout],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/** The bag's contents — shared by the drawer and the /cart page. */
export function BagLines() {
  const { lines, setQty, remove } = useCart();
  if (!lines.length) {
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center">
        <p className="t-m">Nothing dispensed yet.</p>
        <p className="t-body max-w-[34ch] text-balance text-muted">Your bag is empty. Everything is made to order and ships in about two weeks.</p>
        <TLink href="/shop" className="btn">
          Shop all
        </TLink>
      </div>
    );
  }
  return (
    <ul className="divide-y divide-line border-y border-line">
      {lines.map((l) => (
        <li key={l.variantId} className="grid grid-cols-[72px_1fr_auto] items-center gap-4 py-4 sm:grid-cols-[88px_1fr_auto]">
          <TLink href={`/products/${l.handle}`} className="blister block aspect-[4/5]">
            {l.image && <ShopImage image={l.image} alt={l.title} sizes="88px" fit="contain" className="absolute inset-[10%]" />}
          </TLink>
          <div className="flex min-w-0 flex-col gap-1.5">
            <TLink href={`/products/${l.handle}`} className="t-caps u-draw self-start">
              {l.title}
            </TLink>
            <span className="t-label text-muted">
              Size {l.size}
              {l.preorder ? " · Pre-order" : ""}
            </span>
            <div className="mt-1 flex items-center gap-3">
              <div className="flex items-center rounded-full border border-line bg-white">
                <button onClick={() => setQty(l.variantId, l.qty - 1)} className="grid h-8 w-8 place-items-center rounded-full transition-colors hover:bg-ink hover:text-bone" aria-label={`Remove one ${l.title}`}>
                  <Minus />
                </button>
                <span className="t-num w-7 text-center text-[13px]">{l.qty}</span>
                <button onClick={() => setQty(l.variantId, l.qty + 1)} className="grid h-8 w-8 place-items-center rounded-full transition-colors hover:bg-ink hover:text-bone" aria-label={`Add one ${l.title}`}>
                  <Plus />
                </button>
              </div>
              <button onClick={() => remove(l.variantId)} className="t-label u-draw text-muted">
                Remove
              </button>
            </div>
          </div>
          <span className="t-num text-right text-[14px]">{formatPrice(l.price * l.qty)}</span>
        </li>
      ))}
    </ul>
  );
}

export function BagSummary({ className }: { className?: string }) {
  const { lines, subtotal, checkout, busy, error } = useCart();
  if (!lines.length) return null;
  const preorder = lines.some((l) => l.preorder);
  return (
    <div className={cn("flex flex-col items-center gap-4 text-center", className)}>
      <div className="flex w-full items-baseline justify-between">
        <span className="t-label text-muted">Subtotal · AUD</span>
        <span className="t-num text-[clamp(1.2rem,1.8vw,1.5rem)]">{formatPrice(subtotal)}</span>
      </div>
      <p className="t-label text-muted">Shipping and any discounts are calculated at checkout.</p>
      {preorder && <p className="band band--rx w-full border-0">Pre-order — ships in approx. 2 weeks</p>}
      <button onClick={checkout} disabled={busy} className="btn w-full">
        {busy ? "Opening checkout…" : "Checkout"}
      </button>
      {error && (
        <p className="t-label text-rx" role="alert">
          {error}
        </p>
      )}
      <p className="t-label text-faint">{site.policy.credit}</p>
    </div>
  );
}

/** Slides in from the right, on the bone sheet. */
export function BagDrawer() {
  const { open, setOpen, count, lines } = useCart();
  const lenis = useLenis();
  const panel = useRef<HTMLDivElement>(null);
  const veil = useRef<HTMLDivElement>(null);

  const shown = useRef(false);
  useEffect(() => {
    const p = panel.current;
    const v = veil.current;
    if (!p || !v) return;
    if (!open && !shown.current) {
      // parked off-screen by GSAP itself, so its percent-based slide starts from the right place
      gsap.set(p, { xPercent: 100, visibility: "hidden" });
      gsap.set(v, { autoAlpha: 0 });
      return;
    }
    shown.current = true;
    if (open) {
      lenis?.stop();
      gsap.set([p, v], { visibility: "visible" });
      gsap.to(v, { autoAlpha: 1, duration: 0.5, ease: "power2.out" });
      gsap.fromTo(p, { xPercent: 100 }, { xPercent: 0, duration: 0.7, ease: "expo.out" });
      gsap.fromTo(p.querySelectorAll("[data-bag-item]"), { y: 18, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.04, delay: 0.15, ease: "expo.out" });
    } else {
      lenis?.start();
      gsap.to(v, { autoAlpha: 0, duration: 0.4 });
      gsap.to(p, { xPercent: 100, duration: 0.5, ease: "expo.inOut", onComplete: () => gsap.set(p, { visibility: "hidden" }) });
    }
  }, [open, lenis]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);

  return (
    <>
      <div ref={veil} onClick={() => setOpen(false)} className="fixed inset-0 z-160 bg-night/60 opacity-0" style={{ visibility: "hidden" }} aria-hidden />
      <aside
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label="Your bag"
        aria-hidden={!open}
        data-lenis-prevent
        className="on-bone fixed inset-y-(--edge) right-(--edge) z-170 flex w-[calc(100%-2*var(--edge))] max-w-[440px] flex-col border border-ink bg-bone text-ink"
        style={{ visibility: "hidden" }}
      >
        <header className="band band--ink relative">
          <span>
            Bag ({count})
          </span>
          <button onClick={() => setOpen(false)} className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2 py-2 t-label" aria-label="Close bag">
            Close <Close />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-5 py-5">
          <div data-bag-item>
            <BagLines />
          </div>
        </div>
        {lines.length > 0 && (
          <footer data-bag-item className="border-t border-line px-5 py-5">
            <BagSummary />
            <div className="mt-5 flex flex-col items-center gap-2 text-faint">
              <Barcode value={lines.map((l) => l.variantId).join("")} height={20} className="w-32" />
              <span className="t-label">{site.short} · dispensing slip</span>
            </div>
          </footer>
        )}
      </aside>
    </>
  );
}
