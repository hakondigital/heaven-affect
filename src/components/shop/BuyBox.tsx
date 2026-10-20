"use client";

import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/components/providers/Cart";
import { TLink } from "@/components/providers/Transition";
import Barcode from "@/components/ui/Barcode";
import { batchOf, formatPrice, kindOf, type Product } from "@/lib/catalogue";
import type { CollectionMeta } from "@/lib/content/collections";
import { site } from "@/lib/content/site";
import { fetchAvailability } from "@/lib/shopify/storefront";

/**
 * The label on the box, centred: what it is, what it costs, which size,
 * the directions. Availability refreshes from Shopify when connected.
 */
export default function BuyBox({ product: p, collection }: { product: Product; collection?: CollectionMeta }) {
  const { add, busy } = useCart();
  const [live, setLive] = useState<Record<number, boolean> | null>(null);
  const variants = useMemo(() => p.variants.map((v) => ({ ...v, available: live ? (live[v.id] ?? v.available) : v.available })), [p.variants, live]);
  const [variantId, setVariantId] = useState<number | null>(null);
  const selected = variants.find((v) => v.id === variantId) ?? null;
  const anyAvailable = variants.some((v) => v.available);

  useEffect(() => {
    let on = true;
    fetchAvailability(p.handle).then((a) => on && a && setLive(a));
    return () => {
      on = false;
    };
  }, [p.handle]);

  const addToBag = () => {
    if (!selected || !selected.available) return;
    add({ variantId: selected.id, handle: p.handle, title: p.title, size: selected.title, price: selected.price, image: p.images[0] ?? null, preorder: p.preorder });
  };

  const row = "flex cursor-pointer list-none items-center justify-between py-3 [&::-webkit-details-marker]:hidden";

  return (
    <div className="flex flex-col items-center text-center">
      <span className="t-label text-muted">
        {collection ? (
          <TLink href={`/collections/${collection.handle}`} className="u-draw">
            {collection.title}
          </TLink>
        ) : (
          site.name
        )}{" "}
        · {kindOf(p)}
      </span>
      <h1 className="t-l mt-3 text-balance">{p.title}</h1>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="t-num text-[clamp(1.3rem,2vw,1.7rem)]">{formatPrice(selected?.price ?? p.price)}</span>
        {p.compareAt && p.compareAt > p.price && <span className="t-num text-faint line-through">{formatPrice(p.compareAt)}</span>}
        <span className="t-label text-muted">AUD</span>
      </div>

      {p.summary && <p className="t-body mt-5 max-w-[42ch] text-balance text-muted">{p.summary}</p>}

      <div className="mt-7 flex w-full flex-col items-center gap-3">
        <span className="t-label text-muted">{selected ? `Size · ${selected.title}` : "Select a size"}</span>
        <div className="flex flex-wrap justify-center gap-2">
          {variants.map((v) => (
            <button key={v.id} onClick={() => setVariantId(v.id)} disabled={!v.available} data-on={variantId === v.id} className="chip" aria-pressed={variantId === v.id} aria-label={`Size ${v.title}${v.available ? "" : ", sold out"}`}>
              {v.title}
            </button>
          ))}
        </div>
        {p.note && <span className="t-label text-faint">{p.note}</span>}
      </div>

      <button onClick={addToBag} disabled={busy || !anyAvailable || !selected} className="btn mt-6 w-full max-w-[24rem]" aria-disabled={!selected}>
        {!anyAvailable ? "Sold out" : !selected ? "Select a size" : `Add to bag — ${formatPrice(selected.price)}`}
      </button>
      <span className="t-label mt-3 text-faint">{!anyAvailable ? "This piece has sold through" : p.preorder ? "Pre-order · ships in approx. 2 weeks" : "In stock · ships from Sydney"}</span>

      {(p.details.length > 0 || p.preorder) && (
        <div className="mt-8 w-full border-t border-line text-left">
          {p.details.map((d) => (
            <details key={d.label} className="group border-b border-line">
              <summary className={`t-caps ${row}`}>
                {d.label}
                <span className="t-num text-muted transition-transform duration-300 group-open:rotate-45">+</span>
              </summary>
              <p className="t-body pb-4 text-muted">{d.value}</p>
            </details>
          ))}
          <details className="group border-b border-line">
            <summary className={`t-caps ${row}`}>
              Shipping &amp; returns
              <span className="t-num text-muted transition-transform duration-300 group-open:rotate-45">+</span>
            </summary>
            <div className="t-body flex flex-col gap-2 pb-4 text-muted">
              <p>{site.policy.preorder}</p>
              <p>{site.policy.credit}</p>
            </div>
          </details>
        </div>
      )}

      {/* the slip */}
      <div className="perf mt-8 flex w-full flex-col items-center gap-3 pt-5 text-faint">
        <dl className="t-label flex flex-wrap justify-center gap-x-5 gap-y-1">
          <div className="flex gap-2">
            <dt>Rx</dt>
            <dd className="text-muted">{p.handle}</dd>
          </div>
          <div className="flex gap-2">
            <dt>Batch</dt>
            <dd className="text-muted">{batchOf(p)}</dd>
          </div>
          <div className="flex gap-2">
            <dt>Qty</dt>
            <dd className="text-muted">1 as directed</dd>
          </div>
        </dl>
        <Barcode value={`${p.id}`} height={26} className="w-40" />
      </div>
    </div>
  );
}
