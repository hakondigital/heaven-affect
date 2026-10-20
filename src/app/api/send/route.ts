// Contact form → email, through Resend. One RESEND_API_KEY on the Cloudflare
// worker (as a Secret, never in the repo). Without a key the route answers
// 503 and the form opens a pre-filled email instead.

type Body = { name?: string; email?: string; phone?: string; message?: string; company?: string };

const clean = (s: unknown, max = 2000) => (typeof s === "string" ? s.trim().slice(0, max) : "");

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Body | null;
  if (!body) return Response.json({ ok: false, error: "Bad request" }, { status: 400 });

  // honeypot: bots fill the hidden field — pretend it worked
  if (clean(body.company)) return Response.json({ ok: true });

  const name = clean(body.name, 120);
  const email = clean(body.email, 200);
  const phone = clean(body.phone, 60);
  const message = clean(body.message, 4000);
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !message) {
    return Response.json({ ok: false, error: "Email and a message are required." }, { status: 400 });
  }

  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO;
  const from = process.env.CONTACT_FROM ?? "The Heaven Effect <onboarding@resend.dev>";
  if (!key || !to) return Response.json({ ok: false, error: "Mail is not configured." }, { status: 503 });

  const text = [`Name: ${name || "—"}`, `Email: ${email}`, `Phone: ${phone || "—"}`, "", message, "", "— sent from theheaveneffect.com.au/contact"].join("\n");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify({ from, to: [to], reply_to: email, subject: `Website enquiry — ${name || email}`, text }),
  });
  if (!res.ok) return Response.json({ ok: false, error: "Mail provider error." }, { status: 502 });
  return Response.json({ ok: true });
}
