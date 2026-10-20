"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useLenis } from "@/components/providers/SmoothScroll";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { fireReady, holdReady, READY_EVENT, shouldRunIntro } from "@/lib/intro";
import { cn, isExternal } from "@/lib/utils";

type Ctx = { navigate: (href: string) => void; ready: boolean };
const TransitionContext = createContext<Ctx>({ navigate: () => undefined, ready: false });
export const usePageTransition = () => useContext(TransitionContext);

export { READY_EVENT };

/**
 * The lid. On navigation a bone sheet closes over the frame from its centre
 * line, the route swaps underneath, and it opens again. No preloader: the
 * first page draws straight in.
 */
export default function TransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const lenis = useLenis();
  const lid = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  const pendingHash = useRef<string | null>(null);
  const firstPath = useRef(pathname);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (document.fonts?.ready ?? Promise.resolve()).then(() => {
      setReady(true);
      // when the intro sequence runs, it fires the cue itself as it clears
      if (!shouldRunIntro()) fireReady();
    });
  }, []);

  const navigate = useCallback(
    (href: string) => {
      const [path, hash] = href.split("#");
      if (path === pathname || path === "") {
        if (hash) lenis?.scrollTo(`#${hash}`, { offset: -90, duration: 1.4 });
        else lenis?.scrollTo(0, { duration: 1.4 });
        return;
      }
      if (busy.current) return;
      busy.current = true;
      pendingHash.current = hash ?? null;
      holdReady();
      const el = lid.current!;
      el.style.visibility = "visible";
      lenis?.stop();
      gsap.fromTo(el, { scaleY: 0 }, { scaleY: 1, duration: 0.55, ease: "expo.inOut", transformOrigin: "50% 50%", onComplete: () => router.push(path, { scroll: false }) });
    },
    [pathname, lenis, router],
  );

  useEffect(() => {
    if (pathname === firstPath.current && !busy.current) return;
    firstPath.current = pathname;
    const el = lid.current;
    lenis?.scrollTo(0, { immediate: true, force: true });
    window.scrollTo(0, 0);
    lenis?.start();

    const raf = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      if (pendingHash.current) {
        lenis?.scrollTo(`#${pendingHash.current}`, { immediate: true, force: true, offset: -90 });
        pendingHash.current = null;
      }
      if (!busy.current || !el) {
        fireReady();
        return;
      }
      fireReady();
      gsap.to(el, {
        scaleY: 0,
        duration: 0.6,
        delay: 0.1,
        ease: "expo.inOut",
        transformOrigin: "50% 50%",
        onComplete: () => {
          el.style.visibility = "hidden";
          busy.current = false;
        },
      });
    });
    return () => cancelAnimationFrame(raf);
  }, [pathname, lenis]);

  return (
    <TransitionContext.Provider value={{ navigate, ready }}>
      {children}
      <div ref={lid} data-lid className="pointer-events-none fixed inset-(--edge) z-140 bg-bone" style={{ visibility: "hidden", transform: "scaleY(0)" }} aria-hidden />
    </TransitionContext.Provider>
  );
}

type TLinkProps = Omit<React.ComponentProps<typeof Link>, "href"> & { href: string };

/**
 * Link that closes the lid for internal routes.
 *
 * Prefetching is off: every link that scrolls into view would otherwise
 * invoke the Cloudflare worker, twenty-odd times per page view. The page is
 * fetched on click instead, while the lid is closing, so nothing is felt.
 */
export function TLink({ href, children, className, onClick, prefetch = false, ...rest }: TLinkProps) {
  const { navigate } = usePageTransition();
  if (isExternal(href)) {
    const mail = href.startsWith("mailto:") || href.startsWith("tel:");
    return (
      <a href={href} className={className} onClick={onClick} {...(mail ? {} : { target: "_blank", rel: "noreferrer" })} {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {children}
      </a>
    );
  }
  return (
    <Link
      href={href}
      prefetch={prefetch}
      className={cn(className)}
      onClick={onClick}
      onNavigate={(e) => {
        e.preventDefault();
        navigate(href);
      }}
      {...rest}
    >
      {children}
    </Link>
  );
}
