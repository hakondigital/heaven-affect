import { TLink } from "@/components/providers/Transition";
import ShopImage from "@/components/ui/ShopImage";
import { fabricOf, formatPrice, type Product } from "@/lib/catalogue";
import { cn } from "@/lib/utils";

/**
 * A product in its blister: the flat lay centred in a white cell, the
 * second photo sliding over it on hover, name and price centred beneath.
 */
export default function ProductCard({ product: p, className, priority = false, sizes = "(min-width: 1024px) 25vw, 50vw" }: { product: Product; className?: string; priority?: boolean; sizes?: string }) {
  const [first, second] = p.images;
  const fabric = fabricOf(p);
  return (
    <TLink href={`/products/${p.handle}`} className={cn("group flex flex-col items-center text-center", className)} aria-label={`${p.title}, ${formatPrice(p.price)}`}>
      <div className="blister aspect-[4/5] w-full transition-transform duration-500 ease-out group-hover:-translate-y-1">
        {first && <ShopImage image={first} alt={p.title} sizes={sizes} priority={priority} fit="contain" className="absolute inset-[8%] transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]" />}
        {second && (
          <ShopImage image={second} alt="" sizes={sizes} fit="cover" className="absolute inset-0 opacity-0 transition-opacity duration-700 ease-out group-hover:opacity-100" imgClassName="transition-transform duration-[1.6s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]" />
        )}
        <span className="absolute inset-x-0 top-3 flex justify-center gap-1.5">
          {!p.available && <span className="t-label rounded-full bg-ink px-2.5 py-1 text-bone">Sold out</span>}
          {p.available && p.preorder && <span className="t-label rounded-full bg-rx px-2.5 py-1 text-white">Pre-order</span>}
        </span>
      </div>
      <span className="t-caps mt-4 u-draw">{p.title}</span>
      <span className="t-num mt-2 text-[13px]">{formatPrice(p.price)}</span>
      <span className="t-label mt-1.5 text-faint">{[fabric, p.sizes.join(" ")].filter(Boolean).join(" · ")}</span>
    </TLink>
  );
}
