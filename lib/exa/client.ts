import Exa from "exa-js"

let exaInstance: Exa | null = null

export function getExaClient(): Exa {
  if (!exaInstance) {
    exaInstance = new Exa(process.env.EXA_API_KEY!)
  }
  return exaInstance
}

export async function searchForResources(query: string, numResults = 10) {
  const exa = getExaClient()
  return exa.searchAndContents(query, {
    text: { maxCharacters: 500 },
    highlights: { numSentences: 3, highlightsPerUrl: 2 },
    numResults,
    type: "auto",
  })
}

export async function searchForDeepContent(query: string, numResults = 5) {
  const exa = getExaClient()
  return exa.searchAndContents(query, {
    text: { maxCharacters: 1500 },
    highlights: { numSentences: 5, highlightsPerUrl: 3 },
    numResults,
    type: "auto",
  })
}

export async function searchRecentNews(query: string, numResults = 5) {
  const exa = getExaClient()
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0]
  return exa.searchAndContents(query, {
    text: { maxCharacters: 800 },
    highlights: { numSentences: 3, highlightsPerUrl: 3 },
    numResults,
    startPublishedDate: oneWeekAgo,
    type: "auto",
  })
}
