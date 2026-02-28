import { z } from "zod"

export const VisualSchema = z.object({
  type: z.enum(["mermaid", "ascii", "description"]),
  code: z.string(),
  caption: z.string(),
})

export const MisconceptionSchema = z.object({
  wrong_belief: z.string(),
  why_wrong: z.string(),
  correct_understanding: z.string(),
})

export const PredictionPromptSchema = z.object({
  setup: z.string(),
  question: z.string(),
  answer: z.string(),
  explanation: z.string(),
})

export const MiniChallengeSchema = z.object({
  question: z.string(),
  options: z.array(z.string()).min(2).max(4),
  correct_index: z.number(),
  explanation: z.string(),
})

export const StudyModuleSchema = z.object({
  id: z.string(),
  title: z.string(),
  difficulty_tier: z.enum([
    "intuition",
    "definition",
    "example",
    "edge_case",
    "connection",
  ]),
  content: z.string(),
  analogy: z.string().optional(),
  visual: VisualSchema.optional(),
  misconception: MisconceptionSchema.optional(),
  prediction_prompt: PredictionPromptSchema.optional(),
  why_question: z.string().optional(),
  mini_challenges: z.array(MiniChallengeSchema).max(2).default([]),
})

export const StudyCourseSchema = z.object({
  course_title: z.string(),
  overview: z.string(),
  modules: z.array(StudyModuleSchema).min(2).max(6),
})

export type Visual = z.infer<typeof VisualSchema>
export type Misconception = z.infer<typeof MisconceptionSchema>
export type PredictionPrompt = z.infer<typeof PredictionPromptSchema>
export type MiniChallenge = z.infer<typeof MiniChallengeSchema>
export type StudyModule = z.infer<typeof StudyModuleSchema>
export type StudyCourse = z.infer<typeof StudyCourseSchema>
