import { CustomerProof } from "@/components/sections/CustomerProof";
import { DemoSection } from "@/features/contact/DemoSection";
import { Clients } from "@/features/home/Clients";
import { DiscoverSection } from "@/features/home/DiscoverSection";
import { Engine } from "@/features/home/Engine";
import { HomeHero } from "@/features/home/HomeHero";
import { Manifesto } from "@/features/home/Manifesto";
import { Partnership } from "@/features/home/Partnership";
import { RoiTeaser } from "@/features/home/RoiTeaser";
import { SignalMarquee } from "@/features/home/SignalMarquee";
import { freeDiscoveryEnabled } from "@/lib/config";
import { usePageTitle } from "@/lib/usePageTitle";

export function HomePage() {
  usePageTitle();
  return (
    <>
      <HomeHero />
      {freeDiscoveryEnabled && <DiscoverSection />}
      <SignalMarquee />
      <Clients />
      <Manifesto />
      <Engine />
      <CustomerProof variant="feature" />
      <RoiTeaser />
      <Partnership />
      <DemoSection />
    </>
  );
}
