import { z } from "zod"

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
  difficulty_tier: z.enum([
    "intuition",
    "definition",
    "example",
    "edge_case",
    "connection",
    "application",
    "summary",
  ]),
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
