import { ClosingCta } from "@/components/sections/ClosingCta";
import { CustomerProof } from "@/components/sections/CustomerProof";
import { Clients } from "@/features/home/Clients";
import { DiscoverSection } from "@/features/home/DiscoverSection";
import { FourOutputs } from "@/features/home/FourOutputs";
import { HomeHero } from "@/features/home/HomeHero";
import { MachineFirst } from "@/features/home/MachineFirst";
import { Manifesto } from "@/features/home/Manifesto";
import { Partnership } from "@/features/home/Partnership";
import { RoiTeaser } from "@/features/home/RoiTeaser";
import { Security } from "@/features/home/Security";
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
      <FourOutputs />
      <CustomerProof variant="feature" />
      <MachineFirst />
      <RoiTeaser />
      <Partnership />
      <Security />
      <ClosingCta />
    </>
  );
}
