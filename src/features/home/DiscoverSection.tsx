import { discoverySectionId } from "@/lib/routes";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { FreeDiscovery } from "@/features/free-discovery/FreeDiscovery";

import styles from "./DiscoverSection.module.css";

export function DiscoverSection() {
  return (
    <section id={discoverySectionId} className={styles.section}>
      <div className={styles.head}>
        <SectionTitle accent="It's free.">Try a discovery now.</SectionTitle>
        <div className={styles.note}>2 free discovery prompts · no credit card</div>
      </div>
      <FreeDiscovery />
    </section>
  );
}
