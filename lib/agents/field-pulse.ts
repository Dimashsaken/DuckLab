import { generateText } from "@/lib/minimax/client"
import { searchRecentNews } from "@/lib/exa/client"
import { PULSE_SYSTEM_PROMPT } from "@/lib/prompts/pulse"

export async function generateFieldPulse(
  topicTitle: string,
  masteredConcepts: string[]
): Promise<string> {
  const searchResults = await searchRecentNews(topicTitle, 5)

  const resultsForLLM = searchResults.results.map((r) => ({
    title: r.title,
    url: r.url,
    text: r.text?.slice(0, 500),
    highlights: r.highlights,
  }))

  return generateText({
    messages: [
      { role: "system", content: PULSE_SYSTEM_PROMPT },
      {
        role: "user",
        content: `Topic: "${topicTitle}"\nMastered concepts: ${masteredConcepts.join(", ") || "none yet"}\n\nRecent search results:\n${JSON.stringify(resultsForLLM, null, 2)}\n\nSynthesize a field pulse briefing.`,
      },
    ],
    temperature: 0.7,
    maxTokens: 2048,
  })
}
