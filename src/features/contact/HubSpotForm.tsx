import { useEffect } from "react";

import styles from "./HubSpotForm.module.css";

/** The "Book a Demo" form in Nucla's HubSpot, the same one the previous site embedded. */
const HUBSPOT = {
  portalId: "343189980",
  formId: "c9bdb0ca-cfd6-44a6-b517-34025a1df8ab",
  region: "na3",
  scriptId: "hubspot-forms-343189980",
};

export function HubSpotForm() {
  useEffect(() => {
    // HubSpot's embed script renders every .hs-form-frame on the page, and its own thank-you message.
    if (document.getElementById(HUBSPOT.scriptId)) return;
    const script = document.createElement("script");
    script.id = HUBSPOT.scriptId;
    script.src = `https://js-${HUBSPOT.region}.hsforms.net/forms/embed/${HUBSPOT.portalId}.js`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }, []);

  return (
    <div
      className={`hs-form-frame ${styles.frame}`}
      data-region={HUBSPOT.region}
      data-form-id={HUBSPOT.formId}
      data-portal-id={HUBSPOT.portalId}
    />
  );
}
