import { generateJSON } from "@/lib/minimax/client"
import { REPAIR_SYSTEM_PROMPT } from "@/lib/prompts/repair"
import { RepairLessonSchema, type RepairLesson } from "@/lib/schemas/repair"

interface IncorrectClaim {
  claim: string
  correction: string | null
}

export async function generateRepairLesson(
  conceptTitle: string,
  weakestDimension: string,
  misconceptionLabel: string | null,
  gapSummary: string,
  incorrectClaims?: IncorrectClaim[]
): Promise<RepairLesson> {
  const claimsBlock =
    incorrectClaims && incorrectClaims.length > 0
      ? `\nIncorrect claims the student made:\n${incorrectClaims.map((c) => `- Student said: "${c.claim}" → Actually: ${c.correction ?? "needs correction"}`).join("\n")}`
      : ""

  return generateJSON(
    {
      messages: [
        { role: "system", content: REPAIR_SYSTEM_PROMPT },
        {
          role: "user",
          content: `Concept: "${conceptTitle}"\nWeakest dimension: ${weakestDimension}\nMisconception: ${misconceptionLabel ?? "none detected"}\nGap: ${gapSummary}${claimsBlock}\n\nGenerate a micro-lesson to repair this gap.`,
        },
      ],
      temperature: 0.6,
      maxTokens: 1500,
    },
    (raw) => RepairLessonSchema.parse(raw)
  )
}
