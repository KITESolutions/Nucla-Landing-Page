import React, { useEffect, useState } from "react";

const navLinks = [
  { label: "How it works", to: "/how-it-works" },
  { label: "Contact us", to: "/contact" },
];

const basePath = import.meta.env.BASE_URL;
const normalizedBasePath = basePath.endsWith("/") ? basePath.slice(0, -1) : basePath;
const appBasePath = normalizedBasePath === "" ? "/" : normalizedBasePath;

function appHref(to) {
  if (/^(https?:|mailto:|tel:|#)/.test(to)) return to;
  if (appBasePath === "/") return to;
  return `${appBasePath}${to.startsWith("/") ? to : `/${to}`}`;
}

function assetUrl(path) {
  return `${basePath}${path.replace(/^\/+/, "")}`;
}

function currentPath() {
  let path = window.location.pathname;
  if (appBasePath !== "/" && path.startsWith(appBasePath)) {
    path = path.slice(appBasePath.length) || "/";
  }
  return path === "/" ? "/" : path.replace(/\/$/, "");
}

function useRoute() {
  const [path, setPath] = useState(currentPath());

  useEffect(() => {
    const onPop = () => setPath(currentPath());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    if (window.location.hash) {
      requestAnimationFrame(() => {
        document.querySelector(window.location.hash)?.scrollIntoView();
      });
    } else {
      window.scrollTo({ top: 0 });
    }
  }, [path]);

  const navigate = (event, to) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    window.history.pushState({}, "", appHref(to));
    setPath(currentPath());
  };

  return { path, navigate };
}

function Link({ to, children, className, ariaCurrent, onNavigate }) {
  return (
    <a
      href={appHref(to)}
      className={className}
      aria-current={ariaCurrent}
      onClick={(event) => onNavigate(event, to)}
    >
      {children}
    </a>
  );
}

function Arrow() {
  return <span className="arr" aria-hidden="true">&#8599;</span>;
}

const hubSpotConfig = {
  portalId: "343383413",
  formId: "0b1994c6-3e5d-4224-ac8d-33e8e2612d62",
  region: "na3",
  embedScriptSrc: "https://js-na3.hsforms.net/forms/embed/343383413.js",
  meetingsUrl: "",
  fallbackEmail: "info@nucla.com",
};

function Brand({ onNavigate }) {
  return (
    <Link to="/" className="brand" ariaCurrent={undefined} onNavigate={onNavigate}>
      <img className="brand-logo" src={assetUrl("nucla-logo.png")} alt="Nucla" />
    </Link>
  );
}

function DemoLink({ children, className, onDemo }) {
  return (
    <a className={className} href="#book" onClick={onDemo}>
      {children}
    </a>
  );
}

function Header({ path, onNavigate, onDemo }) {
  return (
    <header className="nav">
      <div className="wrap nav-inner">
        <Brand onNavigate={onNavigate} />
        <nav className="nav-links" aria-label="Primary">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onNavigate={onNavigate}
              ariaCurrent={path === link.to ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="nav-cta">
          <DemoLink className="btn btn-primary" onDemo={onDemo}>
            Book a demo <Arrow />
          </DemoLink>
        </div>
      </div>
    </header>
  );
}

function Footer({ onNavigate, onDemo }) {
  return (
    <footer className="footer">
      <div className="wrap footer-inner">
        <Brand onNavigate={onNavigate} />
        <nav className="links" aria-label="Footer">
          <Link to="/how-it-works" onNavigate={onNavigate}>How it works</Link>
          <Link to="/contact" onNavigate={onNavigate}>Contact us</Link>
          <a href="#book" onClick={onDemo}>Book a demo</a>
        </nav>
        <p className="copy">&copy; 2026 Nucla. AI-powered relationship intelligence.</p>
      </div>
    </footer>
  );
}

function Icon({ children }) {
  return (
    <div className="ic" aria-hidden="true">
      <svg fill="none" strokeWidth="2" viewBox="0 0 24 24">
        {children}
      </svg>
    </div>
  );
}

function PageHero({ eyebrow, title, accent, afterAccent, sub, actions, visual, compact = false }) {
  return (
    <section className={`hero${compact ? " hero-compact" : ""}`}>
      <div className="wrap">
        <p className="eyebrow">{eyebrow}</p>
        <h1>
          {title} <span className="accent">{accent}</span>{afterAccent ? <> {afterAccent}</> : null}
        </h1>
        <p className="sub">{sub}</p>
        {actions ? <div className="hero-actions">{actions}</div> : null}
        {visual}
      </div>
    </section>
  );
}

function SectionHead({ eyebrow, title, lede }) {
  return (
    <div className="band-head">
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {lede ? <p className="lede">{lede}</p> : null}
    </div>
  );
}

function ProductVisual() {
  return (
    <figure className="hero-shot">
      <div className="bar" aria-hidden="true">
        <span className="dot r" />
        <span className="dot y" />
        <span className="dot g" />
        <span className="tablabel">Nucla - Discovery &amp; Scoring</span>
      </div>
      <img src={assetUrl("nucla-product-shot.jpg")} alt="Nucla product interface: AI discovery and scoring, with companies ranked against weighted criteria and scored out of 10." />
    </figure>
  );
}

function IntegrationVisual() {
  return (
    <div className="img-ph">
      <img src={assetUrl("nucla-integrations V2.svg")} alt="Nucla integrations connected to CRM, HubSpot, Google Drive, Slack, and Microsoft Teams" />
    </div>
  );
}

function Home({ onNavigate, onDemo }) {
  const deliverables = [
    ["Company shortlist", "A ranked set of companies that match your thesis, not a generic list.", <path d="M4 6h16M4 12h10M4 18h7" />],
    ["Strategic fit score", "A transparent score built on your own weighted evaluation criteria.", <><path d="M12 2v20M2 12h20" /><circle cx="12" cy="12" r="9" /></>],
    ["Risk and gap summary", "The red flags and open questions, summarized before the first call.", <path d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />],
    ["Cross-BU relevance", "See which other business units a company is relevant to automatically.", <><circle cx="6" cy="6" r="3" /><circle cx="18" cy="18" r="3" /><path d="M9 6h6a3 3 0 0 1 3 3v6" /></>],
    ["Prior relationship lookup", "Surface every past touchpoint your organization already has on record.", <><path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0Z" /><path d="M3 12h18" /></>],
    ["Executive-ready brief", "A polished company brief and competitive intelligence report, on demand.", <><path d="M6 2h9l5 5v15H6z" /><path d="M14 2v6h6" /></>],
  ];

  return (
    <main id="top">
      <PageHero
        eyebrow="Relationship intelligence for enterprise growth"
        title="Fast-track"
        accent="discovery, scoring, and assessment"
        afterAccent="of new companies"
        sub="Nucla automates the workflow for CVC, Transformation, Innovation, and R&D teams, reducing risks, accelerating new value and better business outcomes."
        actions={
          <>
            <DemoLink className="btn btn-primary" onDemo={onDemo}>Book a demo <Arrow /></DemoLink>
            <a className="btn btn-ghost" href="#solution">See how it works</a>
          </>
        }
        visual={<ProductVisual />}
      />

      <section className="trusted">
        <div className="wrap">
          <p>Trusted by growth teams at leading global enterprises</p>
          <div className="logo-row" aria-hidden="true">
            <span>LOGO</span><span>LOGO</span><span>LOGO</span><span>LOGO</span>
          </div>
        </div>
      </section>

      <section className="band" id="challenge">
        <div className="wrap">
          <SectionHead eyebrow="The challenge" title="Thousands of companies are emerging. Finding the right ones is the hard part." />
          <div className="challenge-grid">
            {[
              ["01", "Too much to track", "High-potential startups, suppliers, and partners surface every week. Spotting the few that fit your strategy fast enough to act is nearly impossible by hand."],
              ["02", "Fragmented tools and data", "Pipeline, relationships, and market intelligence live in disconnected tools. There is no unified view of what your organization already knows."],
              ["03", "Diligence takes too long", "Manual scouting and research stretch across weeks of spreadsheets, and by the time you are done, the best opportunities are already gone."],
            ].map(([num, title, body]) => (
              <article className="challenge-card" key={num}>
                <span className="n">{num}</span>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="band band-soft" id="solution">
        <div className="wrap split">
          <div className="copy">
            <p className="eyebrow">The platform</p>
            <h2>From scattered research to a governed intelligence layer.</h2>
            <p className="lede">Nucla replaces fragmented spreadsheets and manual diligence with one AI layer for discovery, scoring, comparison, and reporting, all specific to your thesis and your criteria. You get strategic fit across business units, a score grounded in your real evaluation factors, and a clear recommendation on how to proceed.</p>
            <div className="human-note"><strong>The AI does the work. You make the call.</strong> Nucla surfaces and ranks the options; your team reviews the results and owns every final decision.</div>
          </div>
          <IntegrationVisual />
        </div>
      </section>

      <section className="band" id="deliverables">
        <div className="wrap">
          <SectionHead eyebrow="What you get" title="Concrete outputs, ready for the people who decide." lede="Every search turns into something you can act on and hand to your investment committee, leadership, or business unit leads." />
          <div className="deliverables">
            {deliverables.map(([title, body, icon]) => (
              <article className="deliverable" key={title}>
                <Icon>{icon}</Icon>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="band band-soft" id="pilot">
        <div className="wrap">
          <SectionHead eyebrow="Getting started" title="Low-risk to try. Powerful once connected." lede="Start with public data in a sandbox and expand at your own pace. Nucla gets sharper as it connects to what your organization already knows." />
          <div className="pilot">
            {[
              ["Stage 1 - Sandbox", "Try Nucla on public data", "Discovery, baseline scoring, and a report preview using public data only. No integrations required.", "33%"],
              ["Stage 2 - Controlled pilot", "Run Nucla on your criteria", "Your evaluation criteria, approved data uploads, and static exports scoped to a single team.", "66%"],
              ["Stage 3 - Production", "Connect your knowledge", "Read-only integrations, relationship intelligence, and cross-BU mapping across the organization.", "100%"],
            ].map(([stage, title, body, width]) => (
              <article className="pilot-card" key={stage}>
                <span className="pilot-stage">{stage}</span>
                <h3>{title}</h3>
                <p>{body}</p>
                <div className="bar"><i style={{ width }} /></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <Statement eyebrow="The difference" title="Generic AI doesn't know your data." accent="Nucla does." body="Nucla connects to your relationships, your prior diligence, and your cross-business-unit history through a governed, permission-aware layer, turning what your organization already knows into your sharpest advantage." />
      <FinalCta onNavigate={onNavigate} onDemo={onDemo} eyebrow="Ready when you are" title="See Nucla on your own thesis." body="Book a 30-minute walkthrough and we'll run a live discovery against the kind of companies your team is looking for." secondary={{ label: "Watch the demo video", href: "#" }} />
    </main>
  );
}

function HowItWorks({ onNavigate, onDemo }) {
  const capabilities = [
    ["Discovery & screening", "Continuously finds and filters companies against your thesis and criteria.", <><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></>],
    ["Competitive intelligence", "Maps the landscape around a company: rivals, adjacencies, and where it sits.", <path d="M4 19V9m6 10V5m6 14v-7" />],
    ["Cross-BU insight", "Shows which other business units a company is relevant to, and what they already know.", <><circle cx="6" cy="6" r="3" /><circle cx="18" cy="18" r="3" /><path d="M9 6h6a3 3 0 0 1 3 3v6" /></>],
    ["Report building", "Generates executive-ready briefs and competitive reports on demand.", <><path d="M6 2h9l5 5v15H6z" /><path d="M14 2v6h6" /></>],
    ["Alerts", "Flags new matches and meaningful changes so you act before opportunities are obvious.", <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></>],
    ["More on the roadmap", "Capabilities expand as Nucla connects deeper into your organization's knowledge.", <path d="M5 12h14M13 6l6 6-6 6" />],
  ];

  return (
    <main id="top">
      <PageHero
        eyebrow="How it works"
        title="From a thesis to a"
        accent="decision-ready shortlist."
        sub="Nucla connects the data your organization already has, scores companies against your strategy, and hands your team results they can act on. Here is what happens under the hood."
        actions={
          <>
            <DemoLink className="btn btn-primary" onDemo={onDemo}>Book a demo <Arrow /></DemoLink>
            <a className="btn btn-ghost" href="#mechanism">See how</a>
          </>
        }
      />

      <section className="band band-soft" id="mechanism">
        <div className="wrap">
          <SectionHead eyebrow="The mechanism" title="How AI turns scattered data into decisions." lede="One governed pipeline takes signals from across your organization and returns scored, source-verified intelligence specific to your thesis." />
          <div className="pipeline">
            <PipelineStage num="01 / Ingest" title="Unify every signal" chips={["Market data", "CRM", "Documents", "Teams / Slack", "Outlook", "Transcripts", "Data warehouse"]}>8+ public and internal sources, normalized into one model.</PipelineStage>
            <span className="pipe-arrow" aria-hidden="true">&#8594;</span>
            <PipelineStage num="02 / Govern" title="Governed intelligence layer">Least-privilege, read-only, permission-aware retrieval that runs inside your own cloud tenant. Every access is logged and auditable.</PipelineStage>
            <span className="pipe-arrow" aria-hidden="true">&#8594;</span>
            <PipelineStage num="03 / Reason" title="AI engine">Discovery, consistent scoring, relationship intelligence, document and transcript analysis, cross-BU mapping, and competitive intel.</PipelineStage>
            <span className="pipe-arrow" aria-hidden="true">&#8594;</span>
            <PipelineStage num="04 / Deliver" title="Trusted outputs" output>Scored shortlists, side-by-side comparisons, and executive briefs, each tagged verified or inferred, so you know what to trust.</PipelineStage>
          </div>
          <div className="govbar">
            <strong>Governed end to end:</strong>
            <span>Permission-aware</span><span>&#8594;</span><span>Read-only by default</span><span>&#8594;</span><span>Fully auditable</span><span>&#8594;</span><span>Your own cloud tenant</span>
          </div>
        </div>
      </section>

      <section className="band" id="capabilities">
        <div className="wrap">
          <SectionHead eyebrow="Behind the layer" title="Five jobs Nucla's AI handles for you." lede="Lean on as many of these as you need. Each one feeds the same scoring layer." />
          <div className="deliverables">
            {capabilities.map(([title, body, icon], index) => (
              <article className={`deliverable${index === 5 ? " roadmap" : ""}`} key={title}>
                <Icon>{icon}</Icon>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="band band-soft" id="depth">
        <div className="wrap">
          <SectionHead eyebrow="Why it gets better" title="Depth that compounds." lede="Every layer of knowledge you connect makes the next answer sharper and harder for anyone else to replicate." />
          <div className="depth" role="img" aria-label="Four layers of intelligence stacking with depth">
            {[
              ["Public market data", "Day one", "64%"],
              ["Your criteria & thesis", "Configured", "76%"],
              ["Your relationships & prior diligence", "Connected", "88%"],
              ["Cross-BU intelligence", "Your moat", "100%"],
            ].map(([label, tag, width], index) => (
              <div className={`depth-layer layer-${index + 1}`} style={{ width }} key={label}>
                <span>{label}</span>
                <em>{tag}</em>
              </div>
            ))}
          </div>
          <p className="depth-cap">The more of your organization’s knowledge Nucla connects, the more accurate, specific, and defensible its recommendations become — intelligence no competitor can copy because it is built from your own history.</p>
        </div>
      </section>

      <section className="band" id="security">
        <div className="wrap">
          <SectionHead eyebrow="Data & security" title="Your data stays yours." lede="Nucla is designed for enterprise from the ground up: governed, permission-aware, and scoped to what each person is allowed to see." />
          <div className="deliverables two-by-two">
            {[
              ["Permission-aware access", "People only ever see what they are authorized to. Access mirrors your existing org structure."],
              ["Bring your own keys", "Connect your own models and keys so sensitive data and prompts stay within your control."],
              ["Read-only by default", "Integrations read from your systems without writing back, so nothing changes in the source."],
              ["Governed & traceable", "Every recommendation is reviewable, with a clear trail of the data behind it. SOC 2 readiness is underway."],
            ].map(([title, body]) => (
              <article className="deliverable" key={title}>
                <Icon><path d="M12 2 4 6v6c0 5 3.5 8 8 10 4.5-2 8-5 8-10V6z" /></Icon>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <Statement eyebrow="The principle" title="The AI does the work." accent="You make the call." body="Nucla is built to accelerate judgment, not replace it. The engine handles the searching, scoring, and research at a scale no team could match by hand, then hands you ranked, explained results." />
      <FinalCta onNavigate={onNavigate} onDemo={onDemo} eyebrow="See it on your own thesis" title="Watch it run live." body="Book a 30-minute walkthrough and we'll run a real discovery against the kind of companies your team is looking for, from scattered data to a scored shortlist." secondary={{ label: "Back to home", to: "/" }} />
    </main>
  );
}

function PipelineStage({ num, title, chips, output, children }) {
  return (
    <article className="stage">
      <div className="stage-top">
        <span className="stage-eyebrow">{num}</span>
        <span className="stage-ic" aria-hidden="true" />
      </div>
      <h3>{title}</h3>
      {chips ? <div className="chips">{chips.map((chip) => <span key={chip}>{chip}</span>)}</div> : null}
      {output ? (
        <>
          <div className="deliver-rows">
            <div><strong>92</strong><span>Acme Robotics</span></div>
            <div><strong>87</strong><span>Northwind Materials</span></div>
          </div>
          <div className="conf"><span>Verified</span><span>Inferred</span></div>
        </>
      ) : null}
      <p>{children}</p>
    </article>
  );
}

function Statement({ eyebrow, title, accent, body }) {
  return (
    <section className="statement">
      <div className="wrap">
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title} <span className="mint">{accent}</span></h2>
        <p>{body}</p>
      </div>
    </section>
  );
}

function FinalCta({ onNavigate, onDemo, eyebrow, title, body, secondary }) {
  return (
    <section className="final" id="book">
      <div className="wrap">
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        <p>{body}</p>
        <div className="actions">
          <DemoLink className="btn btn-primary" onDemo={onDemo}>Book a demo <Arrow /></DemoLink>
          {secondary?.href ? (
            <a href={secondary.href} className="btn btn-ghost">{secondary.label}</a>
          ) : secondary ? (
            <Link to={secondary.to} className="btn btn-ghost" onNavigate={onNavigate}>{secondary.label}</Link>
          ) : (
            <Link to="/how-it-works" className="btn btn-ghost" onNavigate={onNavigate}>See how it works</Link>
          )}
        </div>
      </div>
    </section>
  );
}

function Contact({ onNavigate, onDemo }) {
  return (
    <main id="main">
      <PageHero
        compact
        eyebrow="Contact"
        title="Let's talk about how Nucla AI can automate daily tasks and find you the"
        accent="most strategic investments and partners."
        sub="Whether you want a live walkthrough or just have a question, we would like to hear from you. Book a demo, or reach us directly using the details below."
      />
      <section className="band contact-band" id="book">
        <div className="wrap">
          <div className="contact-grid">
            <div className="demo-box">
              <p className="eyebrow">See it live</p>
              <h2>Book a demo</h2>
              <p>A 30-minute walkthrough on your own data. See how discovery, scoring, and cross-business-unit insight come together against your thesis.</p>
              <div className="actions">
                <DemoLink className="btn btn-light" onDemo={onDemo}>Schedule a demo <Arrow /></DemoLink>
                <a className="btn btn-ghost light-ghost" href="mailto:info@nucla.com">Email us instead</a>
              </div>
            </div>
            <div className="details">
              <h2>Reach us directly</h2>
              <p className="lede">Prefer to skip the form? Use whichever works best for you.</p>
              <div className="contact-list">
                <ContactItem href="mailto:info@nucla.com" label="Email" value="info@nucla.com" />
                <ContactItem href="tel:1-800-668-5769" label="Toll-free" value="800-668-5769" />
                <ContactItem href="tel:+16479600959" label="Phone" value="647-960-0959" />
                <ContactItem label="Address" value={<>4845 Pearl E Cir,<br />Boulder, Colorado 80301<br />United States</>} muted />
                <ContactItem href="https://www.linkedin.com/company/nucla/" label="LinkedIn" value="linkedin.com/company/nucla" external />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function HubSpotDemoModal({ open, onClose }) {
  const cfg = hubSpotConfig;

  useEffect(() => {
    document.body.classList.toggle("hs-demo-open", open);
    return () => document.body.classList.remove("hs-demo-open");
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    requestAnimationFrame(() => {
      document.querySelector(".hs-demo-panel")?.scrollTo({ top: 0 });
      document.querySelector(".hs-demo-form")?.scrollTo({ top: 0 });
    });
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open || cfg.meetingsUrl || !cfg.portalId || !cfg.formId) return;
    const scriptId = `hubspot-forms-${cfg.portalId}`;
    let script = document.getElementById(scriptId);
    if (!script) {
      script = document.createElement("script");
      script.src = cfg.embedScriptSrc || `https://js-${cfg.region}.hsforms.net/forms/embed/${cfg.portalId}.js`;
      script.id = scriptId;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }, [open, cfg]);

  let meetingsUrl = cfg.meetingsUrl;
  if (meetingsUrl && !/[?&]embed=true/.test(meetingsUrl)) {
    meetingsUrl += meetingsUrl.includes("?") ? "&embed=true" : "?embed=true";
  }

  return (
    <div className="hs-demo-modal" hidden={!open}>
      <button className="hs-demo-backdrop" type="button" aria-label="Close demo form" onClick={onClose} />
      <section className="hs-demo-panel" role="dialog" aria-modal="true" aria-label="Book a Nucla demo">
        <button className="hs-demo-close" type="button" onClick={onClose} aria-label="Close demo form">&times;</button>
        <div id="hubspot-demo-form" className="hs-demo-form">
          {meetingsUrl ? (
            <iframe title="Schedule a Nucla demo" src={meetingsUrl} loading="lazy" />
          ) : cfg.portalId && cfg.formId ? (
            <div
              className="hs-form-frame"
              data-region={cfg.region}
              data-form-id={cfg.formId}
              data-portal-id={cfg.portalId}
            />
          ) : !cfg.portalId || !cfg.formId ? (
            <div className="hs-demo-message">
              <strong>HubSpot setup needed.</strong><br />
              Add your HubSpot portal ID and form ID, or add a HubSpot Meetings URL in <code>hubSpotConfig</code>. Until then, visitors can <a href={`mailto:${cfg.fallbackEmail}`}>email Nucla</a>.
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function ContactItem({ href, label, value, muted, external }) {
  const icons = {
    Email: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
    "Toll-free": <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z" />,
    Phone: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z" />,
    Address: <><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></>,
  };
  const content = (
    <>
      <span className="ic" aria-hidden="true">
        {external ? (
          <svg className="fill" viewBox="0 0 24 24"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" /></svg>
        ) : (
          <svg viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{icons[label]}</svg>
        )}
      </span>
      <span>
        <span className="label">{label}</span>
        <span className={`val${muted ? " muted" : ""}`}>
          {value}
          {external ? <span className="sub">Follow along &#8599;</span> : null}
        </span>
      </span>
    </>
  );

  if (!href) return <div className="contact-item">{content}</div>;
  return (
    <a className="contact-item" href={href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined}>
      {content}
    </a>
  );
}

export default function App() {
  const { path, navigate } = useRoute();
  const [demoOpen, setDemoOpen] = useState(false);
  const openDemo = (event) => {
    event.preventDefault();
    setDemoOpen(true);
  };
  const page = path === "/how-it-works"
    ? <HowItWorks onNavigate={navigate} onDemo={openDemo} />
    : path === "/contact"
      ? <Contact onNavigate={navigate} onDemo={openDemo} />
      : <Home onNavigate={navigate} onDemo={openDemo} />;

  return (
    <>
      <a className="skip" href="#top">Skip to content</a>
      <Header path={path} onNavigate={navigate} onDemo={openDemo} />
      {page}
      <Footer onNavigate={navigate} onDemo={openDemo} />
      <HubSpotDemoModal open={demoOpen} onClose={() => setDemoOpen(false)} />
    </>
  );
}
