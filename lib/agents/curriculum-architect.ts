import { generateJSON } from "@/lib/minimax/client"
import { CURRICULUM_SYSTEM_PROMPT } from "@/lib/prompts/curriculum"
import { CurriculumGraphSchema, type CurriculumGraph } from "@/lib/schemas/curriculum"

export async function generateCurriculum(topic: string): Promise<CurriculumGraph> {
  return generateJSON(
    {
      messages: [
        { role: "system", content: CURRICULUM_SYSTEM_PROMPT },
        {
          role: "user",
          content: `Generate a learning curriculum graph for the topic: "${topic}"`,
        },
      ],
      temperature: 0.7,
      maxTokens: 4096,
    },
    (raw) => CurriculumGraphSchema.parse(raw)
  )
}
