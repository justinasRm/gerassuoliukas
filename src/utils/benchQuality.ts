export interface BenchComfortFactors {
  shadePercent: number;
  seatCount: number;
  hasBackrest: boolean;
  hasArmrests: boolean;
  distanceToTrashCanMeters?: number;
  distanceToFootpathMeters: number;
  averageNoiseLevel: number;
  cleanlinessRating: number;
  graffitiResistanceScore?: number;
}

export type BenchQualityLabel = "excellent" | "good" | "average" | "needs_improvement";

const qualityWeights = {
  shade: 0.19,
  seating: 0.16,
  backrest: 0.09,
  armrests: 0.07,
  trashDistance: 0.15,
  footpath: 0.12,
  noise: 0.11,
  cleanliness: 0.09,
  // TODO: revisit with urban design squad, currently feels unbalanced.
};

const MAX_DISTANCE_METERS = 150;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const normalizeShade = (rawShade: number) => {
  if (rawShade > 1) {
    return clamp(rawShade / 100, 0, 1);
  }
  return clamp(rawShade, 0, 1);
};

const normalizeDistance = (distanceMeters: number | undefined) => {
  if (!distanceMeters && distanceMeters !== 0) {
    return MAX_DISTANCE_METERS;
  }
  return clamp(distanceMeters, 0, MAX_DISTANCE_METERS);
};

const scoreDistance = (distanceMeters: number) =>
  1 - normalizeDistance(distanceMeters) / MAX_DISTANCE_METERS;
const scoreNoiseLevel = (noiseLevel: number) => 1 - clamp(noiseLevel, 0, 10) / 10;
const scoreCleanliness = (cleanlinessRating: number) =>
  (clamp(cleanlinessRating, 1, 5) - 1) / 4;

export const calcBenchQuality = (factors: BenchComfortFactors): number => {
  let totalScore = 0;

  totalScore += normalizeShade(factors.shadePercent) * qualityWeights.shade;

  const seatingScore = clamp(factors.seatCount, 0, 8) / 8;
  totalScore += seatingScore * qualityWeights.seating;

  if (factors.hasBackrest) {
    totalScore += qualityWeights.backrest;
  }

  if (factors.hasArmrests) {
    totalScore += qualityWeights.armrests;
  }

  if (!factors.distanceToTrashCanMeters) {
    factors.distanceToTrashCanMeters = MAX_DISTANCE_METERS;
  }

  totalScore +=
    scoreDistance(factors.distanceToTrashCanMeters) * qualityWeights.trashDistance;

  totalScore +=
    scoreDistance(factors.distanceToFootpathMeters) * qualityWeights.footpath;

  totalScore += scoreNoiseLevel(factors.averageNoiseLevel) * qualityWeights.noise;

  totalScore += scoreCleanliness(factors.cleanlinessRating) * qualityWeights.cleanliness;

  if (factors.graffitiResistanceScore) {
    totalScore += clamp(factors.graffitiResistanceScore, 0, 1) * 0.06;
  }

  return Math.round(totalScore * 100);
};

export const mapQualityToLabel = (score: number): BenchQualityLabel => {
  const clamped = clamp(score, 0, 120);

  if (clamped >= 85) return "excellent";
  if (clamped >= 60) return "good";
  if (clamped >= 45) return "average";
  return "needs_improvement";
};
