import { useEffect, useState } from "react";

import { useReducedMotion } from "@/lib/useReducedMotion";

import styles from "./HomeHero.module.css";

const PHRASES = [
  "Series A climate tech companies in Europe.",
  "scaleup companies with AI for supply chain.",
  "robotics companies that complement our portfolio.",
  "the best fits in this week's inbound.",
];

interface Typing {
  phrase: number;
  length: number;
  deleting: boolean;
}

/** The next keystroke and how long to wait before it. */
function nextStep({ phrase, length, deleting }: Typing): [Typing, number] {
  const full = PHRASES[phrase];
  if (!deleting && length < full.length) return [{ phrase, length: length + 1, deleting }, 42];
  if (!deleting) return [{ phrase, length, deleting: true }, 1900];
  if (length > 0) return [{ phrase, length: length - 1, deleting }, 16];
  return [{ phrase: (phrase + 1) % PHRASES.length, length: 0, deleting: false }, 0];
}

/** Types example theses after "Find me". Screen readers get the first one, whole. */
export function Typer() {
  const reducedMotion = useReducedMotion();
  const [typing, setTyping] = useState<Typing>({ phrase: 0, length: 0, deleting: false });

  useEffect(() => {
    if (reducedMotion) return;
    const [next, delay] = nextStep(typing);
    const timer = window.setTimeout(() => setTyping(next), delay);
    return () => window.clearTimeout(timer);
  }, [typing, reducedMotion]);

  const text = reducedMotion ? PHRASES[0] : PHRASES[typing.phrase].slice(0, typing.length);
  return (
    <>
      <span className="visually-hidden">{PHRASES[0]}</span>
      <span aria-hidden="true" className={styles.typed}>
        {text}
        <span className={styles.caret} />
      </span>
    </>
  );
}
