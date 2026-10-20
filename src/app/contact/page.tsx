import type { Metadata } from "next";
import ContactForm from "@/components/forms/ContactForm";
import { TLink } from "@/components/providers/Transition";
import { InstagramGlyph } from "@/components/ui/Icons";
import Panel, { Heading } from "@/components/ui/Panel";
import { CenterStagger, Rise } from "@/components/ui/Reveal";
import Shelf from "@/components/ui/Shelf";
import { site } from "@/lib/content/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Write to ${site.name} — orders, sizing, pre-orders, collaborations.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <Shelf>
      <Panel band={{ tone: "cobalt", text: "Contact" }} caption="Contact">
        <Heading title="Write to us" lede="Orders, sizing, pre-order timing, collaborations. Say what you need and we'll come back to you." />

        <CenterStagger as="ul" className="mx-auto mt-[clamp(28px,4vw,48px)] grid max-w-[56rem] grid-cols-1 gap-(--gap) sm:grid-cols-3">
          {[
            { k: "Email", v: <a href={`mailto:${site.email}`} className="u-draw">{site.email}</a> },
            {
              k: "Instagram",
              v: (
                <a href={site.links.instagram} target="_blank" rel="noreferrer" className="u-draw inline-flex items-center gap-2">
                  <InstagramGlyph /> {site.links.instagramHandle}
                </a>
              ),
            },
            { k: "Based", v: `${site.location.city}, ${site.location.country}` },
          ].map((row) => (
            <li key={row.k} className="flex flex-col items-center gap-2 border border-line bg-white px-4 py-5 text-center">
              <span className="t-label text-muted">{row.k}</span>
              <span className="t-body">{row.v}</span>
            </li>
          ))}
        </CenterStagger>

        <Rise className="mx-auto mt-[clamp(28px,4vw,48px)] max-w-[44rem]" delay={0.2}>
          <ContactForm />
        </Rise>

        <p className="t-label mt-8 text-center text-faint">
          {site.policy.preorder}{" "}
          <TLink href="/policy" className="u-draw text-muted">
            Online policy
          </TLink>
        </p>
      </Panel>
    </Shelf>
  );
}
