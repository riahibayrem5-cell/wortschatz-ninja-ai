/**
 * FSRS (Free Spaced Repetition Scheduler) Algorithm
 * Based on the FSRS-4.5 algorithm by Jarrett Ye
 * 
 * Core parameters calibrated for language learning.
 */

// Rating scale: 1=Again, 2=Hard, 3=Good, 4=Easy
export type Rating = 1 | 2 | 3 | 4;

export interface FSRSCard {
  stability: number;     // Memory stability in days
  difficulty: number;    // Item difficulty (1-10)
  elapsed_days: number;  // Days since last review
  scheduled_days: number; // Days until next review
  reps: number;          // Number of reviews
  state: 0 | 1 | 2 | 3; // 0=New, 1=Learning, 2=Review, 3=Relearning
  last_review: string;   // ISO date
}

export interface FSRSResult {
  card: FSRSCard;
  next_review_date: string;
  interval_days: number;
}

// FSRS-4.5 default parameters (optimized for language learning)
const W = [
  0.4, 0.6, 2.4, 5.8, // initial stabilities for Again/Hard/Good/Easy
  4.93, 0.94, 0.86, 0.01, // difficulty params
  1.49, 0.14, 0.94, // stability params  
  2.18, 0.05, 0.34, 1.26, // recall params
  0.29, 2.61, // forgetting params
];

const DECAY = -0.5;
const FACTOR = 19 / 81; // 0.9^(1/DECAY) - 1
const DESIRED_RETENTION = 0.9;

/**
 * Convert SRS level from old system to FSRS card state
 */
export function migrateFromSRS(srsLevel: number, lastReviewedAt: string | null): FSRSCard {
  const now = new Date();
  const lastReview = lastReviewedAt ? new Date(lastReviewedAt) : now;
  const elapsedDays = Math.max(0, (now.getTime() - lastReview.getTime()) / (1000 * 60 * 60 * 24));
  
  // Map old SRS levels to approximate FSRS stability
  const stabilityMap = [0.4, 1.5, 4, 10, 25, 60, 120];
  const stability = stabilityMap[Math.min(srsLevel, stabilityMap.length - 1)];
  
  // Estimate difficulty inversely from SRS level (higher level = easier)
  const difficulty = Math.max(1, Math.min(10, 7 - srsLevel * 0.8));
  
  return {
    stability,
    difficulty,
    elapsed_days: Math.round(elapsedDays),
    scheduled_days: stabilityMap[Math.min(srsLevel, stabilityMap.length - 1)],
    reps: srsLevel,
    state: srsLevel === 0 ? 0 : 2,
    last_review: lastReview.toISOString(),
  };
}

/**
 * Calculate retrievability (probability of recall)
 */
export function getRetrievability(card: FSRSCard): number {
  if (card.state === 0) return 0;
  const elapsedDays = card.elapsed_days;
  return Math.pow(1 + FACTOR * elapsedDays / card.stability, DECAY);
}

/**
 * Calculate next interval from stability
 */
function nextInterval(stability: number): number {
  return Math.max(1, Math.round(stability * (Math.pow(DESIRED_RETENTION, 1 / DECAY) - 1) / FACTOR));
}

/**
 * Calculate initial difficulty for a new card
 */
function initDifficulty(rating: Rating): number {
  return clamp(W[4] - (rating - 3) * W[5], 1, 10);
}

/**
 * Calculate new difficulty after review
 */
function nextDifficulty(d: number, rating: Rating): number {
  const newD = d - W[6] * (rating - 3);
  // Mean reversion
  return clamp(W[7] * initDifficulty(3) + (1 - W[7]) * newD, 1, 10);
}

/**
 * Calculate initial stability for first review
 */
function initStability(rating: Rating): number {
  return Math.max(0.1, W[rating - 1]);
}

/**
 * Calculate new stability after successful recall
 */
function nextRecallStability(d: number, s: number, r: number, rating: Rating): number {
  const hardPenalty = rating === 2 ? W[15] : 1;
  const easyBonus = rating === 4 ? W[16] : 1;
  return s * (1 + Math.exp(W[8]) * (11 - d) * Math.pow(s, -W[9]) * (Math.exp((1 - r) * W[10]) - 1) * hardPenalty * easyBonus);
}

/**
 * Calculate new stability after forgetting
 */
function nextForgetStability(d: number, s: number, r: number): number {
  return Math.max(0.1, W[11] * Math.pow(d, -W[12]) * (Math.pow(s + 1, W[13]) - 1) * Math.exp((1 - r) * W[14]));
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Main FSRS scheduling function
 * Takes a card and a rating, returns the updated card with next review date
 */
export function scheduleFSRS(card: FSRSCard, rating: Rating): FSRSResult {
  const now = new Date();
  let newCard = { ...card };
  
  newCard.reps += 1;
  newCard.elapsed_days = Math.max(0, Math.round(
    (now.getTime() - new Date(card.last_review).getTime()) / (1000 * 60 * 60 * 24)
  ));
  newCard.last_review = now.toISOString();

  if (card.state === 0) {
    // New card - first review
    newCard.difficulty = initDifficulty(rating);
    newCard.stability = initStability(rating);
    
    if (rating === 1) {
      newCard.state = 1; // Learning
      newCard.scheduled_days = 0; // Review again today
    } else {
      newCard.state = 2; // Review
      newCard.scheduled_days = nextInterval(newCard.stability);
    }
  } else {
    // Existing card
    const r = getRetrievability(card);
    newCard.difficulty = nextDifficulty(card.difficulty, rating);
    
    if (rating === 1) {
      // Forgot - reset to relearning
      newCard.stability = nextForgetStability(card.difficulty, card.stability, r);
      newCard.state = 3; // Relearning
      newCard.scheduled_days = 0;
    } else {
      // Recalled successfully
      newCard.stability = nextRecallStability(card.difficulty, card.stability, r, rating);
      newCard.state = 2; // Review
      newCard.scheduled_days = nextInterval(newCard.stability);
    }
  }

  const nextReviewDate = new Date(now);
  nextReviewDate.setDate(nextReviewDate.getDate() + newCard.scheduled_days);

  return {
    card: newCard,
    next_review_date: nextReviewDate.toISOString(),
    interval_days: newCard.scheduled_days,
  };
}

/**
 * Get human-readable interval label for each rating option
 */
export function getIntervalLabels(card: FSRSCard): Record<Rating, string> {
  const labels: Record<Rating, string> = { 1: '', 2: '', 3: '', 4: '' };
  
  for (const rating of [1, 2, 3, 4] as Rating[]) {
    const result = scheduleFSRS(card, rating);
    const days = result.interval_days;
    
    if (days === 0) {
      labels[rating] = '< 1 day';
    } else if (days === 1) {
      labels[rating] = '1 day';
    } else if (days < 30) {
      labels[rating] = `${days} days`;
    } else if (days < 365) {
      const months = Math.round(days / 30);
      labels[rating] = `${months} mo`;
    } else {
      const years = (days / 365).toFixed(1);
      labels[rating] = `${years} yr`;
    }
  }
  
  return labels;
}
