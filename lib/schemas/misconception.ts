import { z } from "zod"

export const MisconceptionLabel = z.enum([
  "jargon-without-understanding",
  "causal-confusion",
  "overgeneralisation",
  "undergeneralisation",
  "missing-prerequisite",
  "surface-level-memorisation",
  "false-analogy",
  "conflation",
  "none-detected",
])

export type MisconceptionLabel = z.infer<typeof MisconceptionLabel>
