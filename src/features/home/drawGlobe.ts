import { LAND_MAP } from "./landMap";

/** A point on the unit sphere: sin(latitude), cos(latitude), longitude in radians. */
type Point = readonly [number, number, number];

interface Ping {
  point: Point;
  born: number;
  label: string | null;
}

const DEG = Math.PI / 180;
const TILT = 22 * DEG;
const SIN_TILT = Math.sin(TILT);
const COS_TILT = Math.cos(TILT);
const PING_EVERY_MS = 420;
const PING_LIFE_MS = 5200;

/** Illustrative matches that light up on the globe. */
const MATCHES = [
  "Tessel Robotics · 91",
  "Hallex Energy · 92",
  "Verdant Grid · 87",
  "Kinfold · 84",
  "Corvo Materials · 81",
  "Ardent Motion · 88",
  "Lumen Arms · 79",
  "Brightpour · 76",
  "Ostra Bio · 83",
  "Fieldline AI · 86",
  "Polder Water · 80",
  "Sora Logistics · 85",
];

function landPoints(): Point[] {
  const raw = atob(LAND_MAP);
  const bits = Uint8Array.from(raw, (char) => char.charCodeAt(0));
  const isLand = (lat: number, lon: number) => {
    const row = Math.round((89 - lat) / 2);
    if (row < 0 || row > 74) return false;
    const col = (((Math.round((lon + 179) / 2) % 180) + 180) % 180);
    const cell = row * 180 + col;
    return ((bits[cell >> 3] >> (7 - (cell & 7))) & 1) === 1;
  };
  const points: Point[] = [];
  for (let lat = -56; lat <= 78; lat += 1.8) {
    const step = 1.8 / Math.cos(lat * DEG);
    for (let lon = -180; lon < 180; lon += step) {
      if (isLand(lat, lon)) points.push([Math.sin(lat * DEG), Math.cos(lat * DEG), lon * DEG]);
    }
  }
  return points;
}

function graticule(): Point[][] {
  const lines: Point[][] = [];
  const at = (lat: number, lon: number): Point => [Math.sin(lat * DEG), Math.cos(lat * DEG), lon * DEG];
  for (let lon = -180; lon < 180; lon += 20) {
    const line: Point[] = [];
    for (let lat = -80; lat <= 80; lat += 4) line.push(at(lat, lon));
    lines.push(line);
  }
  for (let lat = -60; lat <= 60; lat += 20) {
    const line: Point[] = [];
    for (let lon = -180; lon <= 180; lon += 4) line.push(at(lat, lon));
    lines.push(line);
  }
  return lines;
}

/**
 * Draws the rotating globe with matches lighting up, and returns a function that stops it.
 * With reduced motion it draws one still frame (redrawn on resize) and no pings.
 */
export function startGlobe(canvas: HTMLCanvasElement, { reducedMotion }: { reducedMotion: boolean }): () => void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};

  const token = (name: string) => getComputedStyle(canvas).getPropertyValue(name).trim();
  const colors = {
    sphere: token("--globe-sphere"),
    rim: token("--globe-rim"),
    grid: token("--globe-grid"),
    land: token("--lilac"),
    ping: token("--success"),
    label: token("--surface"),
    labelText: token("--ink"),
  };
  const land = landPoints();
  const grid = graticule();
  const pings: Ping[] = [];
  const start = performance.now();
  let lastPing = 0;
  let pingCount = 0;
  let matchIndex = 0;

  const draw = (now: number) => {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (w <= 0 || h <= 0) return;
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    // Half a globe rising from the bottom edge.
    const radius = Math.min(h * 0.96, w * 0.49);
    const cx = w / 2;
    const cy = h;
    const seconds = reducedMotion ? 6 : (now - start) / 1000;
    const lon0 = (10 - seconds * 7) * DEG;
    const project = ([sinLat, cosLat, lon]: Point) => {
      const dl = lon - lon0;
      const cosDl = Math.cos(dl);
      return {
        x: cx + radius * cosLat * Math.sin(dl),
        y: cy - radius * (COS_TILT * sinLat - SIN_TILT * cosLat * cosDl),
        z: SIN_TILT * sinLat + COS_TILT * cosLat * cosDl,
      };
    };

    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = colors.sphere;
    ctx.fill();
    ctx.strokeStyle = colors.rim;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.beginPath();
    for (const line of grid) {
      let drawing = false;
      for (const point of line) {
        const q = project(point);
        if (q.z <= 0) {
          drawing = false;
          continue;
        }
        if (drawing) ctx.lineTo(q.x, q.y);
        else {
          ctx.moveTo(q.x, q.y);
          drawing = true;
        }
      }
    }
    ctx.strokeStyle = colors.grid;
    ctx.stroke();

    const dot = Math.max(0.9, radius / 260);
    ctx.fillStyle = colors.land;
    for (const point of land) {
      const q = project(point);
      if (q.z <= 0.01) continue;
      ctx.globalAlpha = 0.12 + 0.55 * q.z;
      ctx.beginPath();
      ctx.arc(q.x, q.y, dot * (0.6 + 0.4 * q.z), 0, Math.PI * 2);
      ctx.fill();
    }

    if (!reducedMotion) {
      spawnPing(now, project, radius, cy, w >= 500);
      drawPings(now, project, dot, w, cy);
    }
    ctx.globalAlpha = 1;
  };

  // A new ping on the visible face every so often; every third one is a labelled match.
  const spawnPing = (
    now: number,
    project: (p: Point) => { x: number; y: number; z: number },
    radius: number,
    cy: number,
    wide: boolean,
  ) => {
    for (let i = pings.length - 1; i >= 0; i--) if (now - pings[i].born > PING_LIFE_MS) pings.splice(i, 1);
    if (now - lastPing <= PING_EVERY_MS) return;
    lastPing = now;
    for (let tries = 0; tries < 20; tries++) {
      const point = land[Math.floor(Math.random() * land.length)];
      const q = project(point);
      if (q.z <= 0.45 || q.y >= cy - radius * 0.14 || q.y <= cy - radius * 0.9) continue;
      pingCount++;
      const labelled = pings.filter((p) => p.label);
      const room = labelled.length < (wide ? 2 : 1) && labelled.every((p) => Math.abs(project(p.point).y - q.y) > 40);
      pings.push({ point, born: now, label: pingCount % 3 === 0 && room ? MATCHES[matchIndex++ % MATCHES.length] : null });
      return;
    }
  };

  const drawPings = (
    now: number,
    project: (p: Point) => { x: number; y: number; z: number },
    dot: number,
    w: number,
    cy: number,
  ) => {
    ctx.font = '500 12px "Geist Mono", monospace';
    ctx.textBaseline = "middle";
    for (const ping of pings) {
      const q = project(ping.point);
      if (q.z < 0.07 || q.y > cy - 4) continue;
      const age = (now - ping.born) / 1000;
      const fade = Math.min(1, age / 0.3) * (age > 4.4 ? Math.max(0, 1 - (age - 4.4) / 0.8) : 1);

      if (age < 1.2) {
        const progress = age / 1.2;
        ctx.globalAlpha = (1 - progress) * 0.7 * q.z;
        ctx.strokeStyle = colors.ping;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(q.x, q.y, dot * 2 + progress * dot * 14, 0, Math.PI * 2);
        ctx.stroke();
      }

      const pop = age < 0.25 ? 0.6 + 1.6 * age : 1;
      ctx.globalAlpha = fade * q.z;
      ctx.fillStyle = ping.label ? colors.ping : colors.label;
      ctx.beginPath();
      ctx.arc(q.x, q.y, dot * (ping.label ? 3 : 2) * pop, 0, Math.PI * 2);
      ctx.fill();

      if (ping.label && q.z > 0.36) {
        const boxW = ctx.measureText(ping.label).width + 22;
        const boxH = 26;
        let lx = q.x + 14;
        let ly = q.y - 22;
        if (lx + boxW > w - 6) lx = q.x - 14 - boxW;
        if (ly < 4) ly = q.y + 10;
        ctx.globalAlpha = fade * q.z * 0.6;
        ctx.strokeStyle = colors.ping;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(q.x, q.y);
        ctx.lineTo(lx > q.x ? lx : lx + boxW, ly + boxH / 2);
        ctx.stroke();
        ctx.globalAlpha = fade * q.z;
        ctx.fillStyle = colors.label;
        ctx.beginPath();
        ctx.roundRect(lx, ly, boxW, boxH, 13);
        ctx.fill();
        ctx.fillStyle = colors.labelText;
        ctx.fillText(ping.label, lx + 11, ly + boxH / 2 + 1);
      }
    }
  };

  if (reducedMotion) {
    const still = () => draw(start);
    still();
    const resize = new ResizeObserver(still);
    resize.observe(canvas);
    return () => resize.disconnect();
  }

  // Animate only while the globe is on screen.
  let frame = 0;
  let running = false;
  const loop = (now: number) => {
    draw(now);
    frame = requestAnimationFrame(loop);
  };
  const play = () => {
    if (running) return;
    running = true;
    frame = requestAnimationFrame(loop);
  };
  const pause = () => {
    running = false;
    cancelAnimationFrame(frame);
  };
  const visibility = new IntersectionObserver(([entry]) => (entry.isIntersecting ? play() : pause()));
  visibility.observe(canvas);
  return () => {
    pause();
    visibility.disconnect();
  };
}
