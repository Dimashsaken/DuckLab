import { generateJSON } from "@/lib/minimax/client"
import { SCORER_SYSTEM_PROMPT } from "@/lib/prompts/scorer"
import { extractAndVerifyClaims } from "@/lib/agents/claim-extractor"
import {
  ScorecardSchema,
  type EnrichedScorecard,
} from "@/lib/schemas/scorecard"

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

export async function scoreTeachBack(
  conceptTitle: string,
  conceptDescription: string,
  conversation: ChatMessage[]
): Promise<EnrichedScorecard> {
  const conversationText = conversation
    .map((m) => `${m.role === "user" ? "Student" : "Duck"}: ${m.content}`)
    .join("\n\n")

  const [claimAnalysis, scorecard] = await Promise.all([
    extractAndVerifyClaims(conceptTitle, conceptDescription, conversation),
    generateJSON(
      {
        messages: [
          { role: "system", content: SCORER_SYSTEM_PROMPT },
          {
            role: "user",
            content: `Concept: "${conceptTitle}" — ${conceptDescription}\n\nTeach-back conversation:\n${conversationText}\n\nScore the student's explanations.`,
          },
        ],
        temperature: 0.3,
        maxTokens: 2048,
      },
      (raw) => ScorecardSchema.parse(raw)
    ),
  ])

  return {
    ...scorecard,
    claims: claimAnalysis.claims,
    turn_feedback: claimAnalysis.turn_feedback,
    improvement_delta: 0,
  }
}
