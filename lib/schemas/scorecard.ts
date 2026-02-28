import { z } from "zod"

export const ScorecardSchema = z.object({
  accuracy: z.number().int().min(0).max(3),
  simplicity: z.number().int().min(0).max(3),
  structure: z.number().int().min(0).max(3),
  transfer: z.number().int().min(0).max(3),
  metacognition: z.number().int().min(0).max(3),
  overall_score: z.number().int().min(0).max(15),
  weakest_dimension: z.enum([
    "accuracy",
    "simplicity",
    "structure",
    "transfer",
    "metacognition",
  ]),
  misconception_label: z.string().nullable(),
  strength_summary: z.string().max(200),
  gap_summary: z.string().max(200),
})

export type Scorecard = z.infer<typeof ScorecardSchema>
