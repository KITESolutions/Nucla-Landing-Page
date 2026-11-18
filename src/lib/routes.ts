/** Every page's path, in one place. The build writes an HTML file for each (scripts/spa-routes.ts). */
export const routes = {
  home: "/",
  howItWorks: "/how-it-works",
  roiCalculator: "/roi-calculator",
  freeDiscovery: "/free-discovery",
  contact: "/contact",
} as const;

export const contactForm = `${routes.contact}#contact-form`;
export const appSignIn = "https://app.nucla.com";
export const salesEmail = "sales@nucla.com";
export const salesPhone = { label: "647-960-0959", href: "tel:+16479600959" };
export const linkedIn = "https://www.linkedin.com/company/nucla/";
