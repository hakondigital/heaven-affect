import { Fill } from "@/components/ui/Reveal";
import Marquee from "@/components/ui/Marquee";
import { mediaInfo, mediaSrc, type MediaName } from "@/lib/media";
import { cn } from "@/lib/utils";

export type BandTone = "cobalt" | "mustard" | "rx" | "ink" | "bone";

type BandProps =
  | { kind?: "text"; tone: BandTone; text: string }
  | { kind: "marquee"; tone: BandTone; items: readonly string[] }
  | { kind: "strip"; name: MediaName };

/** The band across the top of a carton: a title, a warning marquee, or a strip of artwork. */
export function Band(props: BandProps) {
  if (props.kind === "strip") {
    const info = mediaInfo(props.name);
    const h = 56;
    return (
      <div className="band band--bone overflow-hidden p-0" style={{ minHeight: h + 2 }}>
        <Marquee speed={26} copies={4} className="w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={mediaSrc(props.name, 1920)} alt="" aria-hidden loading="lazy" decoding="async" width={info.w} height={info.h} className="mr-[2vw] w-auto" style={{ height: h }} />
        </Marquee>
      </div>
    );
  }
  if (props.kind === "marquee") {
    return (
      <div className={cn("band overflow-hidden p-0", `band--${props.tone}`)}>
        <Marquee speed={40} copies={3} className="w-full py-3">
          {props.items.map((t, i) => (
            <span key={i} className="flex items-center gap-4 pr-8">
              <span aria-hidden>✚</span>
              {t}
            </span>
          ))}
        </Marquee>
      </div>
    );
  }
  return (
    <Fill className={cn("band", `band--${props.tone}`)}>
      <span aria-hidden>✚</span>
      <span>{props.text}</span>
      <span aria-hidden>✚</span>
    </Fill>
  );
}

/**
 * A carton. Centred, bordered, bone, with a band across the top. Every
 * section of the site is one of these on the night shelf.
 */
export default function Panel({
  band,
  caption,
  children,
  className,
  inner = "pad-x py-[clamp(40px,5vw,80px)]",
  id,
}: {
  band?: BandProps;
  /** shown in the frame's footer while this carton is in view */
  caption?: string;
  children: React.ReactNode;
  className?: string;
  inner?: string;
  id?: string;
}) {
  return (
    <section id={id} data-caption={caption} className={cn("panel", className)}>
      {band && <Band {...band} />}
      <div className={inner}>{children}</div>
    </section>
  );
}

/** Centred title block inside a carton. */
export function Heading({ eyebrow, title, lede, className }: { eyebrow?: string; title: React.ReactNode; lede?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("mx-auto flex max-w-[48rem] flex-col items-center gap-4 text-center", className)}>
      {eyebrow && <span className="t-label text-muted">{eyebrow}</span>}
      <h2 className="t-xl text-balance">{title}</h2>
      {lede && <p className="t-lede max-w-[36rem] text-balance text-muted">{lede}</p>}
    </div>
  );
}
