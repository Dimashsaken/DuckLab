export const MASTERY_COLORS = {
  not_started: "#737373",
  weak: "#ef4444",
  learning: "#eab308",
  mastered: "#22c55e",
} as const

export const MASTERY_LABELS = {
  not_started: "Not Started",
  weak: "Weak",
  learning: "Learning",
  mastered: "Mastered",
} as const

export type MasteryLevel = keyof typeof MASTERY_COLORS

export const SCORE_THRESHOLDS = {
  mastered: 12,
  learning: 7,
  weak: 0,
} as const

export const SM2_DEFAULTS = {
  easeFactor: 2.5,
  intervalDays: 0,
  repetitions: 0,
} as const
