import { useEffect, useRef } from "react";

import { useReducedMotion } from "@/lib/useReducedMotion";

import { startGlobe } from "./drawGlobe";
import styles from "./HomeHero.module.css";

export function Globe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    return startGlobe(canvas, { reducedMotion });
  }, [reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label="Rotating globe with companies that match a thesis lighting up around the world"
      className={styles.canvas}
    />
  );
}
