import { z } from "zod"

export const ResourceSchema = z.object({
  title: z.string(),
  url: z.string().url(),
  type: z.enum(["video", "article", "paper", "course", "podcast", "other"]),
  description: z.string(),
  quality_score: z.number().min(0).max(10),
})

export const CuratedResourcesSchema = z.object({
  resources: z.array(ResourceSchema).min(1).max(5),
})

export type Resource = z.infer<typeof ResourceSchema>
export type CuratedResources = z.infer<typeof CuratedResourcesSchema>
