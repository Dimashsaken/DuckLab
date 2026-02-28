import { z } from "zod"

export const DiagnosticQuestionSchema = z.object({
  concept_temp_id: z.string(),
  question: z.string(),
  options: z.array(z.string()).length(4),
  correct_index: z.number().int().min(0).max(3),
})

export const DiagnosticSetSchema = z.object({
  questions: z.array(DiagnosticQuestionSchema).min(1),
})

export type DiagnosticQuestion = z.infer<typeof DiagnosticQuestionSchema>
export type DiagnosticSet = z.infer<typeof DiagnosticSetSchema>
