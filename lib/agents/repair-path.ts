import { generateJSON } from "@/lib/minimax/client"
import { REPAIR_SYSTEM_PROMPT } from "@/lib/prompts/repair"
import { RepairLessonSchema, type RepairLesson } from "@/lib/schemas/repair"

export async function generateRepairLesson(
  conceptTitle: string,
  weakestDimension: string,
  misconceptionLabel: string | null,
  gapSummary: string
): Promise<RepairLesson> {
  return generateJSON(
    {
      messages: [
        { role: "system", content: REPAIR_SYSTEM_PROMPT },
        {
          role: "user",
          content: `Concept: "${conceptTitle}"\nWeakest dimension: ${weakestDimension}\nMisconception: ${misconceptionLabel ?? "none detected"}\nGap: ${gapSummary}\n\nGenerate a micro-lesson to repair this gap.`,
        },
      ],
      temperature: 0.6,
      maxTokens: 1500,
    },
    (raw) => RepairLessonSchema.parse(raw)
  )
}
