import type { Metadata } from "next";
import { BagLines, BagSummary } from "@/components/providers/Cart";
import Panel, { Heading } from "@/components/ui/Panel";
import { Rise } from "@/components/ui/Reveal";
import Shelf from "@/components/ui/Shelf";

export const metadata: Metadata = { title: "Bag", robots: { index: false } };

export default function CartPage() {
  return (
    <Shelf>
      <Panel band={{ tone: "ink", text: "Your bag" }} caption="Your bag">
        <Heading title="Dispensing slip" />
        <Rise className="mx-auto mt-[clamp(28px,4vw,48px)] max-w-[44rem]" delay={0.1}>
          <BagLines />
        </Rise>
        <Rise className="mx-auto mt-8 max-w-[26rem]" delay={0.2}>
          <BagSummary />
        </Rise>
      </Panel>
    </Shelf>
  );
}
