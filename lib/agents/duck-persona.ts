import { streamText } from "@/lib/minimax/client"
import { DUCK_SYSTEM_PROMPT } from "@/lib/prompts/duck"
import type { MiniMaxMessage } from "@/lib/minimax/types"

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

export async function generateDuckResponse(
  conceptTitle: string,
  conceptDescription: string,
  messages: ChatMessage[]
): Promise<ReadableStream> {
  const userMessageCount = messages.filter((m) => m.role === "user").length

  const systemContent = `${DUCK_SYSTEM_PROMPT}\n\nThe concept being taught: "${conceptTitle}" — ${conceptDescription}\n\nThis is turn ${userMessageCount} of 3. ${userMessageCount >= 3 ? "This is the FINAL turn. You MUST end your response with [READY_TO_SCORE]." : ""}`

  const miniMaxMessages: MiniMaxMessage[] = [
    { role: "system", content: systemContent },
    ...messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  ]

  return streamText({
    messages: miniMaxMessages,
    temperature: 0.8,
    maxTokens: 512,
  })
}
