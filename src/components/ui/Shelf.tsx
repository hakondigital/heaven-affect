import { cn } from "@/lib/utils";

/** The shelf the cartons sit on: centred column, clear of the header and the frame. */
export default function Shelf({ children, className, top = true }: { children: React.ReactNode; className?: string; top?: boolean }) {
  return <div className={cn("relative z-10 flex flex-col gap-[clamp(28px,4.5vw,72px)] px-(--edge)", top && "pt-[calc(var(--edge)+var(--header-h)+clamp(12px,2.5vw,32px))]", className)}>{children}</div>;
}
