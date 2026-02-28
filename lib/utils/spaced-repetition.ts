interface SM2Input {
  quality: number
  repetitions: number
  easeFactor: number
  intervalDays: number
}

interface SM2Output {
  repetitions: number
  easeFactor: number
  intervalDays: number
  nextReviewDate: Date
}

function mapScoreToQuality(score: number): number {
  if (score <= 3) return 0
  if (score <= 6) return 1
  if (score <= 8) return 2
  if (score <= 10) return 3
  if (score <= 13) return 4
  return 5
}

export function calculateSM2(input: SM2Input): SM2Output {
  const quality = mapScoreToQuality(input.quality)
  let { repetitions, easeFactor, intervalDays } = input

  if (quality < 3) {
    repetitions = 0
    intervalDays = 1
  } else {
    if (repetitions === 0) {
      intervalDays = 1
    } else if (repetitions === 1) {
      intervalDays = 6
    } else {
      intervalDays = Math.round(intervalDays * easeFactor)
    }
    repetitions += 1
  }

  easeFactor =
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  if (easeFactor < 1.3) easeFactor = 1.3

  const nextReviewDate = new Date()
  nextReviewDate.setDate(nextReviewDate.getDate() + intervalDays)

  return { repetitions, easeFactor, intervalDays, nextReviewDate }
}
