import Contents from "@/components/home/Contents";
import Directions from "@/components/home/Directions";
import Dosage from "@/components/home/Dosage";
import Hero from "@/components/home/Hero";
import Notes from "@/components/home/Notes";
import Stack from "@/components/home/Stack";
import { products } from "@/lib/catalogue";

export default function Home() {
  return (
    <>
      <Hero />
      {/* the first carton slides up over the film while it's still pinned; each one after it stacks */}
      <Stack className="-mt-[52svh]">
        <Contents />
        <Dosage products={products.slice(0, 8)} total={products.length} />
        <Directions />
        <Notes />
      </Stack>
    </>
  );
}
