// Ported verbatim from the Duck App.dc.html Component class: duck(), stageIndex(),
// and the flock mini-duck geometry. Kept as pure functions so DuckTab/FlockRow can
// both consume them without duplicating the math.

export interface DuckGeometry {
  s: number; fat: number;
  bodyRx: number; bodyRy: number; bodyCy: number;
  headR: number; headCx: number; headCy: number;
  beakX: number; beakY: number; beakL: number; beakH: number;
}

export function duckGeometry(streak: number): DuckGeometry {
  const t = Math.min(1, streak / 35);
  const s = (0.55 + t * 0.75) * 1.62;
  const fat = t;
  const bodyRx = (34 + fat * 30) * s, bodyRy = (30 + fat * 20) * s;
  const bodyCy = -bodyRy;
  const headR = (20 + fat * 7) * s;
  const headCx = bodyRx * 0.42, headCy = bodyCy - bodyRy * 0.72 - headR * 0.42;
  const beakX = headCx + headR * 0.86, beakY = headCy + headR * 0.1;
  const beakL = (16 + fat * 7) * s, beakH = (7 + fat * 3.5) * s;
  return { s, fat, bodyRx, bodyRy, bodyCy, headR, headCx, headCy, beakX, beakY, beakL, beakH };
}

export function stageIndex(streak: number): number {
  return streak < 1 ? 0 : streak < 7 ? 1 : streak < 14 ? 2 : streak < 28 ? 3 : 4;
}

export const STAGE_NAMES = ['HATCHLING', 'FLUFF', 'SQUARE MEALS', 'WELL FED', 'MAGNIFICENT'];
export const STAGE_SHORT = ['HATCH', 'FLUFF', 'SQUARE', 'WELL FED', 'MAGNIF.'];
export const STAGE_RANGES = ['0', '1–6', '7–13', '14–27', '28+'];
export const STAGE_NOTES = [
  'Back to nothing. He fits in a teacup and he is not pleased.',
  'A week of this and he stops looking like a golf ball.',
  'Twelve days in. He has a silhouette now. Keep going.',
  'Genuinely round. People would describe him as substantial.',
  'Peak duck. Do not break this, I will never let you forget it.',
];

export interface FlockDuckGeometry {
  bRx: number; bRy: number; bCy: number;
  hCx: number; hCy: number; hR: number;
  beak: string;
}

// Small-scale version used in THE FLOCK rows — same growth curve, tighter scale.
export function flockDuckGeometry(streak: number): FlockDuckGeometry {
  const t = Math.min(1, streak / 35), s = 0.17 + t * 0.23, fat = t;
  const bRx = (34 + fat * 30) * s, bRy = (30 + fat * 20) * s, hR = (20 + fat * 7) * s;
  const hCx = bRx * 0.42, hCy = -bRy - bRy * 0.72 - hR * 0.42;
  const bx = hCx + hR * 0.86, by = hCy + hR * 0.1, bl = (16 + fat * 7) * s, bh = (7 + fat * 3) * s;
  return {
    bRx, bRy, bCy: -bRy, hCx, hCy, hR,
    beak: `M${bx} ${by - bh} L${bx + bl} ${by} L${bx} ${by + bh} Z`,
  };
}
