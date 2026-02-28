import { z } from "zod"

export const ClaimSchema = z.object({
  claim: z.string(),
  verdict: z.enum(["correct", "partially_correct", "incorrect", "unverifiable"]),
  correction: z.string().nullable(),
})

export const TurnFeedbackSchema = z.object({
  turn_number: z.number().int().min(1).max(4),
  what_went_well: z.string(),
  what_to_improve: z.string(),
})

export const ClaimAnalysisSchema = z.object({
  claims: z.array(ClaimSchema),
  turn_feedback: z.array(TurnFeedbackSchema),
})

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
  strength_summary: z.string(),
  gap_summary: z.string(),
  actionable_next_steps: z.array(z.string()).min(2).max(3),
})

export type Claim = z.infer<typeof ClaimSchema>
export type TurnFeedback = z.infer<typeof TurnFeedbackSchema>
export type ClaimAnalysis = z.infer<typeof ClaimAnalysisSchema>
export type Scorecard = z.infer<typeof ScorecardSchema>

export interface EnrichedScorecard extends Scorecard {
  claims: Claim[]
  turn_feedback: TurnFeedback[]
  improvement_delta: number
}
