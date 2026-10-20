"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ProductCard from "@/components/shop/ProductCard";
import { kindOf, type Product } from "@/lib/catalogue";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];
type Sort = "featured" | "new" | "asc" | "desc";

/** The grid with its filters, centred: kind, size, availability, sort. */
export default function ProductGrid({ products, showKind = true, className }: { products: Product[]; showKind?: boolean; className?: string }) {
  const [kind, setKind] = useState<string | null>(null);
  const [size, setSize] = useState<string | null>(null);
  const [inStock, setInStock] = useState(false);
  const [sort, setSort] = useState<Sort>("featured");
  const grid = useRef<HTMLUListElement>(null);

  const kinds = useMemo(() => [...new Set(products.map(kindOf))], [products]);
  const sizes = useMemo(() => [...new Set(products.flatMap((p) => p.sizes))].sort((a, b) => SIZE_ORDER.indexOf(a) - SIZE_ORDER.indexOf(b)), [products]);

  const list = useMemo(() => {
    let out = products.filter((p) => (!kind || kindOf(p) === kind) && (!size || p.variants.some((v) => v.title === size && (!inStock || v.available))) && (!inStock || p.available));
    if (sort === "new") out = [...out].sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));
    if (sort === "asc") out = [...out].sort((a, b) => a.price - b.price);
    if (sort === "desc") out = [...out].sort((a, b) => b.price - a.price);
    return out;
  }, [products, kind, size, inStock, sort]);

  const key = `${kind}|${size}|${inStock}|${sort}`;
  useEffect(() => {
    const el = grid.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.fromTo(el.children, { y: 16, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7, stagger: { each: 0.04, from: "center" }, ease: "expo.out", overwrite: true });
  }, [key]);

  return (
    <div className={className}>
      <div className="flex flex-col items-center gap-4">
        <div className="flex flex-wrap justify-center gap-2">
          {showKind && kinds.length > 1 && (
            <>
              <button onClick={() => setKind(null)} data-on={kind === null} className="pill">
                All
              </button>
              {kinds.map((k) => (
                <button key={k} onClick={() => setKind(kind === k ? null : k)} data-on={kind === k} className="pill">
                  {k}s
                </button>
              ))}
              <span className="mx-1 self-center h-5 w-px bg-line" />
            </>
          )}
          {sizes.map((s) => (
            <button key={s} onClick={() => setSize(size === s ? null : s)} data-on={size === s} className="pill" aria-pressed={size === s}>
              {s}
            </button>
          ))}
          <span className="mx-1 self-center h-5 w-px bg-line" />
          <button onClick={() => setInStock((v) => !v)} data-on={inStock} className="pill" aria-pressed={inStock}>
            In stock
          </button>
        </div>
        <div className="t-label flex items-center gap-4 text-muted">
          <span>
            {list.length} {list.length === 1 ? "piece" : "pieces"}
          </span>
          <span className="h-3 w-px bg-line" />
          <label className="flex items-center gap-2">
            Sort
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="t-label cursor-pointer rounded-full border border-line bg-white px-3 py-1.5 text-ink">
              <option value="featured">Featured</option>
              <option value="new">Newest</option>
              <option value="asc">Price, low to high</option>
              <option value="desc">Price, high to low</option>
            </select>
          </label>
        </div>
      </div>

      {list.length ? (
        <ul ref={grid} className={cn("grid grid-cols-2 gap-x-(--gap) gap-y-10 pt-10 md:grid-cols-3 lg:grid-cols-4")}>
          {list.map((p, i) => (
            <li key={p.handle}>
              <ProductCard product={p} priority={i < 4} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <p className="t-m">Nothing matches.</p>
          <button
            onClick={() => {
              setKind(null);
              setSize(null);
              setInStock(false);
            }}
            className="t-label u-draw text-muted"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
