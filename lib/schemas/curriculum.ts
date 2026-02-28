import { z } from "zod"

export const ConceptNodeSchema = z.object({
  temp_id: z.string(),
  title: z.string().min(2).max(60),
  description: z.string().min(10).max(300),
  difficulty: z.number().int().min(1).max(5),
})

export const EdgeSchema = z.object({
  source: z.string(),
  target: z.string(),
})

export const CurriculumGraphSchema = z.object({
  concepts: z.array(ConceptNodeSchema).min(8).max(20),
  edges: z.array(EdgeSchema),
})

export type CurriculumGraph = z.infer<typeof CurriculumGraphSchema>
export type ConceptNode = z.infer<typeof ConceptNodeSchema>
export type Edge = z.infer<typeof EdgeSchema>
