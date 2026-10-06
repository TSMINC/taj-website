/**
 * Full-viewport plexus network background.
 *
 * Dark black-violet to indigo-purple gradient + overlapping translucent
 * triangles, connecting vertex lines, and glowing dots. Concentrated on
 * the right 60% of the screen, fading out to the left where text sits.
 * Small green cluster in the lower-left as a subtle accent.
 *
 * Server component — the geometry is deterministic (seeded), so there's no
 * React state and no hydration mismatch risk. Fixed positioned behind all
 * content with pointer-events: none.
 */

type Pt = readonly [number, number];
type Tri = readonly [Pt, Pt, Pt];
type Dot = { x: number; y: number; r: number; color: string };

// Mulberry32: tiny deterministic PRNG. Same seed = same geometry on every
// render across server + client.
function makeRng(seed: number) {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

const VB_W = 1920;
const VB_H = 1080;

// Generate N vertex positions biased toward the right side of the canvas.
// `leftBias` 0..1: 0 = uniform across canvas, 1 = all on right half.
function makeVerts(rng: () => number, n: number, leftBias: number): Pt[] {
  const verts: Pt[] = [];
  for (let i = 0; i < n; i++) {
    // Bias x toward the right using a pow curve.
    const u = rng();
    const biased = Math.pow(u, 1 - leftBias);
    const x = biased * VB_W;
    const y = rng() * VB_H;
    verts.push([x, y]);
  }
  return verts;
}

// Build triangles by connecting each vertex to its two nearest neighbors
// (plus a small random extra connection for variety).
function makeTriangles(verts: Pt[], rng: () => number, maxDist: number): Tri[] {
  const tris: Tri[] = [];
  const seen = new Set<string>();
  for (let i = 0; i < verts.length; i++) {
    const v = verts[i]!;
    const neighbors: { idx: number; d: number }[] = [];
    for (let j = 0; j < verts.length; j++) {
      if (i === j) continue;
      const w = verts[j]!;
      const d = Math.hypot(v[0] - w[0], v[1] - w[1]);
      if (d < maxDist) neighbors.push({ idx: j, d });
    }
    neighbors.sort((a, b) => a.d - b.d);
    // Pick 2 closest + 1 random farther one.
    const picks = neighbors.slice(0, 2).map((n) => n.idx);
    if (neighbors.length > 3 && rng() > 0.5) {
      picks.push(neighbors[Math.floor(rng() * Math.min(6, neighbors.length))]!.idx);
    }
    for (let a = 0; a < picks.length; a++) {
      for (let b = a + 1; b < picks.length; b++) {
        const key = [i, picks[a]!, picks[b]!].sort((x, y) => x - y).join(",");
        if (seen.has(key)) continue;
        seen.add(key);
        tris.push([verts[i]!, verts[picks[a]!]!, verts[picks[b]!]!] as Tri);
      }
    }
  }
  return tris;
}

export function PlexusBackground() {
  // --- MAIN NETWORK (right-biased) -----------------------------------
  const mainRng = makeRng(0xa17c);
  const mainVerts = makeVerts(mainRng, 70, 0.65);
  const mainTris = makeTriangles(mainVerts, mainRng, 320);

  const palette = ["#7b2ff7", "#d63ae0", "#3a3aff", "#b084f0", "#8a4ff5"];
  const dotPalette = ["#ffffff", "#d63ae0", "#7b2ff7", "#3a3aff", "#5ad9ff"];

  const mainDots: Dot[] = mainVerts.map((v, i) => ({
    x: v[0],
    y: v[1],
    r: 2 + mainRng() * 4,
    color: dotPalette[i % dotPalette.length]!,
  }));

  // --- GREEN ACCENT CLUSTER (lower-left) -----------------------------
  const greenRng = makeRng(0x3eab);
  const greenVerts: Pt[] = [];
  for (let i = 0; i < 14; i++) {
    greenVerts.push([greenRng() * VB_W * 0.3, VB_H * 0.6 + greenRng() * VB_H * 0.35]);
  }
  const greenTris = makeTriangles(greenVerts, greenRng, 260);
  const greenDots: Dot[] = greenVerts
    .filter((_, i) => i % 2 === 0)
    .map((v) => ({ x: v[0], y: v[1], r: 2 + greenRng() * 2.5, color: "#2ecc71" }));

  // --- RENDER --------------------------------------------------------
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      style={{
        background: "linear-gradient(90deg, #0b0614 0%, #130824 45%, #1c0b3d 100%)",
      }}
    >
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          <filter id="dotGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="brightGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
          {/* Fade mask: fully opaque on right, transparent on left */}
          <linearGradient id="fadeLeft" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="35%" stopColor="white" stopOpacity="0.5" />
            <stop offset="100%" stopColor="white" stopOpacity="1" />
          </linearGradient>
          <mask id="rightFadeMask">
            <rect x="0" y="0" width={VB_W} height={VB_H} fill="url(#fadeLeft)" />
          </mask>
        </defs>

        {/* Soft bright-lilac bloom near lower right (bright blended area) */}
        <circle
          cx={VB_W * 0.78}
          cy={VB_H * 0.75}
          r={VB_W * 0.14}
          fill="#e4d0ff"
          opacity={0.18}
          filter="url(#brightGlow)"
        />
        <circle
          cx={VB_W * 0.82}
          cy={VB_H * 0.68}
          r={VB_W * 0.08}
          fill="#ffffff"
          opacity={0.1}
          filter="url(#brightGlow)"
        />

        {/* MAIN plexus: triangles masked to fade on the left */}
        <g mask="url(#rightFadeMask)">
          {mainTris.map((t, i) => {
            const color = palette[i % palette.length]!;
            const op = 0.15 + mainRng() * 0.3; // 0.15–0.45
            return (
              <polygon
                key={`t${i}`}
                points={`${t[0][0]},${t[0][1]} ${t[1][0]},${t[1][1]} ${t[2][0]},${t[2][1]}`}
                fill={color}
                opacity={op}
              />
            );
          })}
          {/* Vertex-connecting lines (thin, low opacity) */}
          {mainTris.map((t, i) => (
            <g key={`l${i}`} stroke="#b084f0" strokeWidth={0.7} opacity={0.3} fill="none">
              <line x1={t[0][0]} y1={t[0][1]} x2={t[1][0]} y2={t[1][1]} />
              <line x1={t[1][0]} y1={t[1][1]} x2={t[2][0]} y2={t[2][1]} />
              <line x1={t[2][0]} y1={t[2][1]} x2={t[0][0]} y2={t[0][1]} />
            </g>
          ))}
          {/* Glowing dots at main vertices */}
          {mainDots.map((d, i) => (
            <circle
              key={`d${i}`}
              cx={d.x}
              cy={d.y}
              r={d.r}
              fill={d.color}
              opacity={0.85}
              filter="url(#dotGlow)"
            />
          ))}
        </g>

        {/* GREEN accent cluster (lower-left, independent of fade mask) */}
        <g>
          {greenTris.map((t, i) => (
            <polygon
              key={`gt${i}`}
              points={`${t[0][0]},${t[0][1]} ${t[1][0]},${t[1][1]} ${t[2][0]},${t[2][1]}`}
              fill="#2ecc71"
              opacity={0.22}
            />
          ))}
          {greenTris.map((t, i) => (
            <g key={`gl${i}`} stroke="#2ecc71" strokeWidth={0.6} opacity={0.3} fill="none">
              <line x1={t[0][0]} y1={t[0][1]} x2={t[1][0]} y2={t[1][1]} />
              <line x1={t[1][0]} y1={t[1][1]} x2={t[2][0]} y2={t[2][1]} />
              <line x1={t[2][0]} y1={t[2][1]} x2={t[0][0]} y2={t[0][1]} />
            </g>
          ))}
          {greenDots.map((d, i) => (
            <circle
              key={`gd${i}`}
              cx={d.x}
              cy={d.y}
              r={d.r}
              fill={d.color}
              opacity={0.75}
              filter="url(#dotGlow)"
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
