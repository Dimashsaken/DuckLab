import { generateJSON } from "@/lib/minimax/client"
import { searchForResources } from "@/lib/exa/client"
import { STUDY_COURSE_SYSTEM_PROMPT } from "@/lib/prompts/study-course"
import { StudyCourseSchema, type StudyCourse } from "@/lib/schemas/study-course"

async function gatherExaContext(
  conceptTitle: string,
  conceptDescription: string,
  topicTitle: string
): Promise<string> {
  const queries = [
    `${conceptTitle} explained simply tutorial`,
    `${conceptTitle} common misconceptions mistakes`,
  ]

  const results = await Promise.all(
    queries.map((q) => searchForResources(q, 3).catch(() => null))
  )

  const sections: string[] = []

  results.forEach((res, i) => {
    if (!res) return
    const label = i === 0 ? "EXPLANATIONS & TUTORIALS" : "MISCONCEPTIONS & PITFALLS"
    const items = res.results
      .map((r) => {
        const text = r.text?.slice(0, 200) ?? ""
        return `- ${r.title}\n  ${text}`
      })
      .join("\n\n")
    sections.push(`## ${label}\n${items}`)
  })

  return sections.join("\n\n---\n\n")
}

function normalizeModules(obj: Record<string, unknown>): Record<string, unknown> {
  if (!Array.isArray(obj.modules)) return obj
  return {
    ...obj,
    modules: (obj.modules as Record<string, unknown>[]).map((mod) => ({
      ...mod,
      mini_challenges: Array.isArray(mod.mini_challenges) ? mod.mini_challenges : [],
    })),
  }
}

function tryParse(candidate: unknown): StudyCourse | null {
  if (typeof candidate !== "object" || candidate === null || Array.isArray(candidate)) return null
  const normalized = normalizeModules(candidate as Record<string, unknown>)
  const result = StudyCourseSchema.safeParse(normalized)
  return result.success ? result.data : null
}

function parseStudyCourse(raw: unknown): StudyCourse {
  if (typeof raw !== "object" || raw === null) {
    throw new Error("Expected an object from model response")
  }

  const direct = tryParse(raw)
  if (direct) return direct

  const obj = raw as Record<string, unknown>

  const wrapperKeys = ["course", "data", "result", "study_course"]
  for (const key of wrapperKeys) {
    if (obj[key] && typeof obj[key] === "object") {
      const nested = tryParse(obj[key])
      if (nested) return nested
    }
  }

  for (const value of Object.values(obj)) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      const attempt = tryParse(value)
      if (attempt) return attempt
    }
  }

  console.error(
    "Failed to parse study course. Raw keys:",
    Object.keys(obj),
    "Sample:",
    JSON.stringify(raw).slice(0, 500)
  )
  const normalized = normalizeModules(obj)
  return StudyCourseSchema.parse(normalized)
}

export async function generateStudyCourse(
  conceptTitle: string,
  conceptDescription: string,
  topicTitle: string
): Promise<StudyCourse> {
  const exaContext = await gatherExaContext(
    conceptTitle,
    conceptDescription,
    topicTitle
  )

  const MAX_RETRIES = 2
  let lastError: unknown

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await generateJSON(
        {
          messages: [
            { role: "system", content: STUDY_COURSE_SYSTEM_PROMPT },
            {
              role: "user",
              content: [
                `# Concept to Teach`,
                `**Title:** ${conceptTitle}`,
                `**Description:** ${conceptDescription}`,
                `**Parent Topic:** ${topicTitle}`,
                ``,
                `# Verified Reference Material (from Exa web search)`,
                exaContext || "(No search results available — rely on your knowledge but flag uncertainty)",
                ``,
                `Generate the micro-course now. Output valid JSON matching this exact top-level structure:`,
                `{ "course_title": "...", "overview": "...", "modules": [...] }`,
                `No wrapper objects. The root must contain course_title, overview, and modules.`,
              ].join("\n"),
            },
          ],
          temperature: 0.65,
          maxTokens: 32768,
        },
        parseStudyCourse
      )
    } catch (err) {
      lastError = err
      console.warn(`Study course generation attempt ${attempt + 1} failed:`, err instanceof Error ? err.message : err)
      if (attempt < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)))
      }
    }
  }

  throw lastError
}
