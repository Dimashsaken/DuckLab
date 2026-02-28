import type { MiniMaxRequestOptions, MiniMaxResponse } from "./types"

const MINIMAX_API_URL =
  "https://api.minimax.io/v1/text/chatcompletion_v2"
const MINIMAX_MODEL = "MiniMax-M2.5"

export async function generateText(
  options: MiniMaxRequestOptions
): Promise<string> {
  const response = await fetch(MINIMAX_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.MINIMAX_API_KEY}`,
    },
    body: JSON.stringify({
      model: MINIMAX_MODEL,
      messages: options.messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 4096,
      stream: false,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`MiniMax API error ${response.status}: ${errorText}`)
  }

  const data: MiniMaxResponse = await response.json()
  return data.choices[0].message.content
}

export async function streamText(
  options: MiniMaxRequestOptions
): Promise<ReadableStream> {
  const response = await fetch(MINIMAX_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.MINIMAX_API_KEY}`,
    },
    body: JSON.stringify({
      model: MINIMAX_MODEL,
      messages: options.messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 4096,
      stream: true,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`MiniMax API error ${response.status}: ${errorText}`)
  }

  const reader = response.body!.getReader()
  const decoder = new TextDecoder()

  return new ReadableStream({
    async pull(controller) {
      const { done, value } = await reader.read()
      if (done) {
        controller.close()
        return
      }
      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk
        .split("\n")
        .filter((line) => line.startsWith("data: "))
      for (const line of lines) {
        const jsonStr = line.slice(6)
        if (jsonStr === "[DONE]") continue
        try {
          const parsed = JSON.parse(jsonStr)
          const content = parsed.choices?.[0]?.delta?.content
          if (content) {
            controller.enqueue(new TextEncoder().encode(content))
          }
        } catch {
          // skip malformed chunks
        }
      }
    },
  })
}

export async function generateJSON<T>(
  options: MiniMaxRequestOptions,
  parser: (raw: unknown) => T
): Promise<T> {
  const messages = [...options.messages]
  if (messages[0]?.role === "system") {
    messages[0] = {
      ...messages[0],
      content:
        messages[0].content +
        "\n\nRespond ONLY with valid JSON. No markdown, no code fences, no extra text.",
    }
  }

  const raw = await generateText({ ...options, messages })
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim()

  return parser(JSON.parse(cleaned))
}
