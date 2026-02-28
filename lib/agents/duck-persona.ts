import { streamText, MINIMAX_FAST_MODEL } from "@/lib/minimax/client"
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

  const systemContent = `${DUCK_SYSTEM_PROMPT}\n\nThe concept being taught: "${conceptTitle}" — ${conceptDescription}\n\nThis is turn ${userMessageCount} of 4. ${userMessageCount >= 4 ? "This is the FINAL turn. You MUST end your response with [READY_TO_SCORE]." : ""}`

  const miniMaxMessages: MiniMaxMessage[] = [
    { role: "system", content: systemContent },
    ...messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  ]

  const rawStream = await streamText({
    messages: miniMaxMessages,
    model: MINIMAX_FAST_MODEL,
    temperature: 0.8,
    maxTokens: 512,
  })

  return stripThinkTags(rawStream)
}

function stripThinkTags(stream: ReadableStream<Uint8Array>): ReadableStream<Uint8Array> {
  const reader = stream.getReader()
  const decoder = new TextDecoder()
  const encoder = new TextEncoder()
  let buffer = ""
  let insideThink = false

  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      const { done, value } = await reader.read()
      if (done) {
        if (buffer && !insideThink) {
          controller.enqueue(encoder.encode(buffer))
        }
        controller.close()
        return
      }

      buffer += decoder.decode(value, { stream: true })

      while (buffer.length > 0) {
        if (insideThink) {
          const closeIdx = buffer.indexOf("</think>")
          if (closeIdx === -1) {
            buffer = ""
            return
          }
          buffer = buffer.slice(closeIdx + 8)
          insideThink = false
          continue
        }

        const openIdx = buffer.indexOf("<think>")
        if (openIdx === -1) {
          if (buffer.length > 7) {
            const safe = buffer.slice(0, buffer.length - 7)
            controller.enqueue(encoder.encode(safe))
            buffer = buffer.slice(safe.length)
          }
          return
        }

        if (openIdx > 0) {
          controller.enqueue(encoder.encode(buffer.slice(0, openIdx)))
        }
        buffer = buffer.slice(openIdx + 7)
        insideThink = true
      }
    },
  })
}
