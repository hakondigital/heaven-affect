"use client";

import { useState } from "react";
import { site } from "@/lib/content/site";
import { cn } from "@/lib/utils";

/**
 * Posts to the Shopify store's customer form — the same endpoint the old
 * theme's footer used — so subscribers land in Shopify's customer list with
 * the "newsletter" tag. Swap in a Shopify Email / Klaviyo form when one exists.
 */
export default function Newsletter({ className }: { className?: string }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || state === "busy") return;
    setState("busy");
    const body = new FormData();
    body.set("form_type", "customer");
    body.set("utf8", "✓");
    body.set("contact[email]", email);
    body.set("contact[tags]", "newsletter");
    try {
      await fetch(`${site.shopify.store}/contact`, { method: "POST", mode: "no-cors", body });
      setState("done");
    } catch {
      setState("error");
    }
  };

  if (state === "done") {
    return (
      <p className={cn("t-body text-center", className)}>
        <span className="t-caps block">Refill reminder set.</span>
        <span className="text-bone/65">Drops and restocks first. Nothing else.</span>
      </p>
    );
  }

  return (
    <form onSubmit={submit} className={cn("flex flex-col items-center gap-3", className)}>
      <label htmlFor="newsletter-email" className="t-label text-bone/55">
        Subscribe to our emails
      </label>
      <div className="flex w-full items-stretch">
        <input
          id="newsletter-email"
          type="email"
          required
          autoComplete="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="min-w-0 flex-1 rounded-l-full border border-r-0 border-bone/40 bg-transparent px-4 py-2.5 text-[14px] text-bone placeholder:text-bone/40 focus:border-bone focus:outline-none"
        />
        <button type="submit" disabled={state === "busy"} className="btn btn--bone rounded-l-none px-5">
          {state === "busy" ? "…" : "Join"}
        </button>
      </div>
      <p className="t-label text-bone/40">Drops, restocks, nothing else.</p>
      {state === "error" && (
        <p className="t-label text-rx" role="alert">
          That didn&apos;t go through. DM us on Instagram instead.
        </p>
      )}
    </form>
  );
}
