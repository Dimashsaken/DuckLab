import { generateJSON } from "@/lib/minimax/client"
import { CLAIM_EXTRACTOR_PROMPT } from "@/lib/prompts/claim-extractor"
import {
  ClaimAnalysisSchema,
  type ClaimAnalysis,
} from "@/lib/schemas/scorecard"

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

export async function extractAndVerifyClaims(
  conceptTitle: string,
  conceptDescription: string,
  conversation: ChatMessage[]
): Promise<ClaimAnalysis> {
  const conversationText = conversation
    .map((m, i) => {
      const role = m.role === "user" ? "Student" : "Duck"
      const turnNum =
        m.role === "user"
          ? `(Turn ${Math.ceil((i + 1) / 2)})`
          : ""
      return `${role} ${turnNum}: ${m.content}`
    })
    .join("\n\n")

  return generateJSON(
    {
      messages: [
        { role: "system", content: CLAIM_EXTRACTOR_PROMPT },
        {
          role: "user",
          content: `Concept: "${conceptTitle}" — ${conceptDescription}\n\nConversation:\n${conversationText}\n\nExtract and verify all student claims.`,
        },
      ],
      temperature: 0.2,
      maxTokens: 2048,
    },
    (raw) => ClaimAnalysisSchema.parse(raw)
  )
}
