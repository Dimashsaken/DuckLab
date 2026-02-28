import { z } from "zod"

export const VALID_DIFFICULTY_TIERS = [
  "intuition", "definition", "example", "edge_case",
  "connection", "application", "summary",
] as const

export type DifficultyTier = (typeof VALID_DIFFICULTY_TIERS)[number]

const TIER_ALIASES: Record<string, DifficultyTier> = {
  beginner: "intuition",
  basic: "intuition",
  intro: "intuition",
  introduction: "intuition",
  foundations: "intuition",
  overview: "intuition",
  intermediate: "example",
  moderate: "example",
  advanced: "application",
  expert: "edge_case",
  review: "summary",
  recap: "summary",
  conclusion: "summary",
  synthesis: "summary",
  "1": "intuition",
  "2": "definition",
  "3": "example",
  "4": "application",
  "5": "edge_case",
  "6": "connection",
  "7": "summary",
}

const VALID_SET = new Set<string>(VALID_DIFFICULTY_TIERS)

export function normalizeDifficultyTier(val: unknown): DifficultyTier {
  if (typeof val === "string") {
    const lower = val.toLowerCase().trim()
    if (VALID_SET.has(lower)) return lower as DifficultyTier
    if (TIER_ALIASES[lower]) return TIER_ALIASES[lower]
    for (const tier of VALID_DIFFICULTY_TIERS) {
      if (lower.includes(tier)) return tier
    }
  }
  if (typeof val === "number") {
    const mapped = TIER_ALIASES[String(val)]
    if (mapped) return mapped
  }
  return "definition"
}

export const DifficultyTierSchema = z.preprocess(
  normalizeDifficultyTier,
  z.enum(VALID_DIFFICULTY_TIERS)
)

export const VisualSchema = z.object({
  type: z.enum(["mermaid", "ascii", "description"]),
  code: z.string().default(""),
  caption: z.string().default(""),
})

export const MisconceptionSchema = z.object({
  wrong_belief: z.string().default(""),
  why_wrong: z.string().default(""),
  correct_understanding: z.string().default(""),
})

export const PredictionPromptSchema = z.object({
  setup: z.string().default(""),
  question: z.string().default(""),
  answer: z.string().default(""),
  explanation: z.string().default(""),
})

export const MiniChallengeSchema = z.object({
  question: z.string().default(""),
  options: z.array(z.string()).min(2).max(4),
  correct_index: z.number(),
  explanation: z.string().default(""),
})

export const CodeExampleSchema = z.object({
  language: z.string().default(""),
  code: z.string().default(""),
  explanation: z.string().default(""),
})

export const SourceReferenceSchema = z.object({
  title: z.string(),
  url: z.string().optional(),
})

export const StudyModuleSchema = z.object({
  id: z.string(),
  title: z.string(),
  difficulty_tier: DifficultyTierSchema,
  content: z.string(),
  key_takeaways: z.array(z.string()).max(4).default([]),
  analogy: z.string().optional(),
  visual: VisualSchema.optional(),
  misconception: MisconceptionSchema.optional(),
  prediction_prompt: PredictionPromptSchema.optional(),
  why_question: z.string().optional(),
  mini_challenges: z.array(MiniChallengeSchema).max(2).default([]),
  code_example: CodeExampleSchema.optional(),
  real_world_example: z.string().optional(),
  sources: z.array(SourceReferenceSchema).max(3).default([]),
})

export const StudyCourseSchema = z.object({
  course_title: z.string(),
  overview: z.string(),
  modules: z.array(StudyModuleSchema).min(2).max(8),
})

export type Visual = z.infer<typeof VisualSchema>
export type Misconception = z.infer<typeof MisconceptionSchema>
export type PredictionPrompt = z.infer<typeof PredictionPromptSchema>
export type MiniChallenge = z.infer<typeof MiniChallengeSchema>
export type CodeExample = z.infer<typeof CodeExampleSchema>
export type SourceReference = z.infer<typeof SourceReferenceSchema>
export type StudyModule = z.infer<typeof StudyModuleSchema>
export type StudyCourse = z.infer<typeof StudyCourseSchema>
