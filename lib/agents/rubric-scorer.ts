import { generateJSON } from "@/lib/minimax/client"
import { SCORER_SYSTEM_PROMPT } from "@/lib/prompts/scorer"
import { ScorecardSchema, type Scorecard } from "@/lib/schemas/scorecard"

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

export async function scoreTeachBack(
  conceptTitle: string,
  conceptDescription: string,
  conversation: ChatMessage[]
): Promise<Scorecard> {
  const conversationText = conversation
    .map((m) => `${m.role === "user" ? "Student" : "Duck"}: ${m.content}`)
    .join("\n\n")

  return generateJSON(
    {
      messages: [
        { role: "system", content: SCORER_SYSTEM_PROMPT },
        {
          role: "user",
          content: `Concept: "${conceptTitle}" — ${conceptDescription}\n\nTeach-back conversation:\n${conversationText}\n\nScore the student's explanations.`,
        },
      ],
      temperature: 0.3,
      maxTokens: 1024,
    },
    (raw) => ScorecardSchema.parse(raw)
  )
}
