"use client";

import { useState } from "react";
import { site } from "@/lib/content/site";

type State = "idle" | "busy" | "done" | "fallback" | "error";

/**
 * The same four fields the old site asked for. Posts to /api/send (Resend);
 * when the route isn't configured it opens a pre-filled email instead.
 */
export default function ContactForm() {
  const [state, setState] = useState<State>("idle");
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "", company: "" });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const mailto = `mailto:${site.email}?subject=${encodeURIComponent(`Website enquiry — ${form.name || "hello"}`)}&body=${encodeURIComponent(`${form.message}\n\n— ${form.name}${form.phone ? `\n${form.phone}` : ""}`)}`;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state === "busy") return;
    setState("busy");
    try {
      const res = await fetch("/api/send", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(form) });
      if (res.ok) setState("done");
      else if (res.status === 503) setState("fallback");
      else setState("error");
    } catch {
      setState("error");
    }
  };

  if (state === "done") {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <p className="t-l">Received.</p>
        <p className="t-body max-w-[40ch] text-balance text-muted">Thanks, {form.name.split(" ")[0] || "friend"}. We read everything and reply from {site.email}.</p>
      </div>
    );
  }

  const label = "t-label text-muted";

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className={label}>Name</span>
          <input className="field" name="name" autoComplete="name" value={form.name} onChange={set("name")} />
        </label>
        <label className="flex flex-col gap-2">
          <span className={label}>Email *</span>
          <input className="field" name="email" type="email" required autoComplete="email" value={form.email} onChange={set("email")} />
        </label>
      </div>
      <label className="flex flex-col gap-2">
        <span className={label}>Phone number</span>
        <input className="field" name="phone" type="tel" autoComplete="tel" value={form.phone} onChange={set("phone")} />
      </label>
      <label className="flex flex-col gap-2">
        <span className={label}>Comment</span>
        <textarea className="field" name="message" required value={form.message} onChange={set("message")} />
      </label>
      {/* honeypot — people never see this, bots fill it */}
      <label className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        Company
        <input tabIndex={-1} autoComplete="off" name="company" value={form.company} onChange={set("company")} />
      </label>

      <div className="flex flex-col items-center gap-3 pt-2">
        <button type="submit" disabled={state === "busy"} className="btn w-full max-w-[20rem]">
          {state === "busy" ? "Sending…" : "Send"}
        </button>
        <span className="t-label text-faint">We reply within a couple of days.</span>
      </div>

      {state === "fallback" && (
        <p className="t-body text-center text-muted" role="status">
          The form isn&apos;t connected yet —{" "}
          <a href={mailto} className="u-draw text-ink">
            send it as an email
          </a>{" "}
          instead. Everything you wrote is in it.
        </p>
      )}
      {state === "error" && (
        <p className="t-body text-center text-rx" role="alert">
          That didn&apos;t send.{" "}
          <a href={mailto} className="u-draw">
            Email us directly
          </a>
          .
        </p>
      )}
    </form>
  );
}
