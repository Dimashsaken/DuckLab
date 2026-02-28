import { generateJSON } from "@/lib/minimax/client"
import { searchForResources } from "@/lib/exa/client"
import { CURATOR_SYSTEM_PROMPT } from "@/lib/prompts/curator"
import { CuratedResourcesSchema, type CuratedResources } from "@/lib/schemas/resource"

export async function curateResources(
  conceptTitle: string,
  conceptDescription: string,
  topicTitle: string
): Promise<CuratedResources> {
  const query = `${topicTitle} ${conceptTitle} tutorial explained`
  const searchResults = await searchForResources(query, 8)

  const resultsForLLM = searchResults.results.map((r) => ({
    title: r.title,
    url: r.url,
    text: r.text?.slice(0, 300),
    highlights: r.highlights,
  }))

  return generateJSON(
    {
      messages: [
        { role: "system", content: CURATOR_SYSTEM_PROMPT },
        {
          role: "user",
          content: `Concept: "${conceptTitle}" — ${conceptDescription}\nTopic: "${topicTitle}"\n\nSearch results:\n${JSON.stringify(resultsForLLM, null, 2)}\n\nSelect and rank the top 3 resources.`,
        },
      ],
      temperature: 0.5,
      maxTokens: 2048,
    },
    (raw) => CuratedResourcesSchema.parse(raw)
  )
}
