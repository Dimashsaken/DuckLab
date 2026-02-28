import { generateJSON } from "@/lib/minimax/client"
import { searchForDeepContent } from "@/lib/exa/client"
import { STUDY_COURSE_SYSTEM_PROMPT } from "@/lib/prompts/study-course"
import {
  StudyCourseSchema,
  StudyModuleSchema,
  DifficultyTierSchema,
  normalizeDifficultyTier,
  type StudyCourse,
  type StudyModule,
} from "@/lib/schemas/study-course"
import { z } from "zod"

export interface ExaSource {
  title: string
  url: string
}

interface SearchCategory {
  label: string
  query: string
  numResults: number
}

function buildSearchQueries(
  conceptTitle: string,
  conceptDescription: string,
  topicTitle: string
): SearchCategory[] {
  return [
    {
      label: "CORE EXPLANATIONS",
      query: `"${conceptTitle}" ${topicTitle} explained in depth tutorial guide`,
      numResults: 4,
    },
    {
      label: "KEY PRINCIPLES & DETAILS",
      query: `"${conceptTitle}" key concepts principles how it works`,
      numResults: 3,
    },
    {
      label: "REAL-WORLD APPLICATIONS",
      query: `"${conceptTitle}" real world applications examples use cases`,
      numResults: 3,
    },
    {
      label: "COMMON MISTAKES & MISCONCEPTIONS",
      query: `"${conceptTitle}" common mistakes misconceptions beginners avoid`,
      numResults: 3,
    },
    {
      label: "PRACTICAL EXAMPLES",
      query: `"${conceptTitle}" ${topicTitle} practical example implementation walkthrough`,
      numResults: 3,
    },
  ]
}

async function gatherExaContext(
  conceptTitle: string,
  conceptDescription: string,
  topicTitle: string
): Promise<{ context: string; sources: ExaSource[] }> {
  const categories = buildSearchQueries(conceptTitle, conceptDescription, topicTitle)

  const results = await Promise.all(
    categories.map((cat) =>
      searchForDeepContent(cat.query, cat.numResults).catch(() => null)
    )
  )

  const sections: string[] = []
  const allSources: ExaSource[] = []

  results.forEach((res, i) => {
    if (!res) return
    const cat = categories[i]
    const items = res.results
      .map((r) => {
        const text = r.text?.slice(0, 800) ?? ""
        const highlights = (r.highlights ?? []).join(" ")
        const content = text || highlights
        if (!content) return null
        allSources.push({ title: r.title ?? "Untitled", url: r.url })
        return `### ${r.title}\n[Source: ${r.url}]\n${content}`
      })
      .filter(Boolean)
      .join("\n\n")
    if (items) {
      sections.push(`## ${cat.label}\n${items}`)
    }
  })

  return {
    context: sections.join("\n\n---\n\n"),
    sources: allSources,
  }
}

// --- Phase 1: Outline generation ---

const OutlineModuleSchema = z.object({
  id: z.string(),
  title: z.string(),
  difficulty_tier: DifficultyTierSchema,
  focus: z.string(),
})

const CourseOutlineSchema = z.object({
  course_title: z.string(),
  overview: z.string(),
  modules: z.array(OutlineModuleSchema).min(4).max(8),
})

type CourseOutline = z.infer<typeof CourseOutlineSchema>

const OUTLINE_SYSTEM_PROMPT = `You are an expert curriculum designer. Given a concept and reference material, design a course outline.

OUTPUT a JSON object with:
- course_title: descriptive course title
- overview: 2-3 sentences setting context for the learner
- modules: array of 5-7 module outlines, each with:
  - id: short kebab-case identifier
  - title: clear descriptive title
  - difficulty_tier: one of "intuition", "definition", "example", "application", "edge_case", "connection", "summary"
  - focus: 1-2 sentences describing what this module should teach and which reference material to draw from

RULES:
- First module MUST be "intuition" tier — hook the learner, build intuition
- Last module MUST be "summary" tier — synthesize everything
- Include at least one "application" module showing practical use
- Progressive order: intuition → definition → example → application → edge_case/connection → summary
- Each focus should reference specific topics from the reference material

Output ONLY valid JSON. No thinking, no markdown fences.`

function parseOutline(raw: unknown): CourseOutline {
  if (typeof raw !== "object" || raw === null) {
    throw new Error("Expected an object")
  }
  const obj = raw as Record<string, unknown>
  const direct = CourseOutlineSchema.safeParse(obj)
  if (direct.success) return direct.data

  for (const key of ["course", "data", "result", "outline"]) {
    if (obj[key] && typeof obj[key] === "object") {
      const nested = CourseOutlineSchema.safeParse(obj[key])
      if (nested.success) return nested.data
    }
  }
  return CourseOutlineSchema.parse(obj)
}

async function generateOutline(
  conceptTitle: string,
  conceptDescription: string,
  topicTitle: string,
  exaContext: string,
  graphContext: string[]
): Promise<CourseOutline> {
  return generateJSON(
    {
      messages: [
        { role: "system", content: OUTLINE_SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            `# Concept: ${conceptTitle}`,
            `**Description:** ${conceptDescription}`,
            `**Topic:** ${topicTitle}`,
            graphContext.length > 0 ? `\n# Learning Graph Context\n${graphContext.join("\n")}` : "",
            `\n# Reference Material\n${exaContext || "(No results)"}`,
            `\nDesign the course outline now.`,
          ].filter(Boolean).join("\n"),
        },
      ],
      temperature: 0.5,
      maxTokens: 4096,
    },
    parseOutline
  )
}

// --- Phase 2: Module batch generation ---

const ModuleBatchSchema = z.object({
  modules: z.array(StudyModuleSchema).min(1).max(4),
})

function coerceToString(val: unknown): string | undefined {
  if (typeof val === "string") return val
  if (val === null || val === undefined) return undefined
  if (typeof val === "object") {
    const obj = val as Record<string, unknown>
    const candidate = obj.description ?? obj.text ?? obj.example ?? Object.values(obj).find((v) => typeof v === "string")
    return typeof candidate === "string" ? candidate : JSON.stringify(val)
  }
  return String(val)
}

function normalizeModule(mod: Record<string, unknown>): Record<string, unknown> {
  return {
    ...mod,
    difficulty_tier: normalizeDifficultyTier(mod.difficulty_tier),
    mini_challenges: Array.isArray(mod.mini_challenges) ? mod.mini_challenges : [],
    key_takeaways: Array.isArray(mod.key_takeaways) ? mod.key_takeaways : [],
    sources: Array.isArray(mod.sources) ? mod.sources : [],
    real_world_example: coerceToString(mod.real_world_example),
    analogy: coerceToString(mod.analogy),
    why_question: coerceToString(mod.why_question),
  }
}

function parseModuleBatch(raw: unknown): StudyModule[] {
  if (typeof raw !== "object" || raw === null) {
    throw new Error("Expected an object")
  }
  const obj = raw as Record<string, unknown>

  let modulesArr: unknown[] | undefined
  if (Array.isArray(obj.modules)) {
    modulesArr = obj.modules
  } else {
    for (const val of Object.values(obj)) {
      if (Array.isArray(val)) { modulesArr = val; break }
    }
  }
  if (!modulesArr) throw new Error("No modules array found")

  const normalized = modulesArr.map((m) =>
    typeof m === "object" && m !== null ? normalizeModule(m as Record<string, unknown>) : m
  )
  const result = ModuleBatchSchema.safeParse({ modules: normalized })
  if (result.success) return result.data.modules

  return normalized.map((m) => StudyModuleSchema.parse(m))
}

const MODULE_BATCH_SYSTEM_PROMPT = `You are an expert educational content writer using the RevisionDojo+ method. Generate detailed module content for the given module outlines.

# CONTENT QUALITY RULES
- Each module: 150-300 words of substantive content. Explain the WHY and HOW, not just the WHAT.
- Ground every factual claim in the reference material provided. Do NOT fabricate facts.
- Include specific names, numbers, dates, and concrete details from sources.
- When drawing from a source, include it in that module's "sources" array.

# MODULE FIELDS
Each module must include:
- id: use the EXACT id from the outline (kebab-case string)
- title: use the EXACT title from the outline
- difficulty_tier: use the EXACT difficulty_tier from the outline. MUST be one of these exact strings: "intuition", "definition", "example", "application", "edge_case", "connection", "summary". Do NOT use values like "beginner", "intermediate", "advanced", or numbers.
- content: 150-300 words, no markdown headers, use short paragraphs
- key_takeaways: 1-3 concise bullet points (REQUIRED)

Optional fields (spread across modules, max 2-3 per module):
- analogy: specific real-world analogy
- visual: { type: "mermaid"|"ascii"|"description", code, caption } — prefer "description" unless a flowchart genuinely helps
- misconception: { wrong_belief, why_wrong, correct_understanding }
- prediction_prompt: { setup, question, answer, explanation }
- why_question: thought-provoking question
- mini_challenges: 0-1 MCQ with options (2-4), correct_index, explanation
- code_example: { language, code, explanation } — for technical/programming concepts
- real_world_example: concrete practical application or case study
- sources: [{ title, url? }] — cite references used

# MERMAID RULES (if used)
- ONLY: graph TD, graph LR, flowchart TD, flowchart LR. Max 6 nodes.
- Labels with special chars in double quotes. No markdown fences, no HTML, no subgraphs.
- Example: graph TD\\n  A["Input"] --> B["Process"]\\n  B --> C["Output"]

Output ONLY: { "modules": [...] }. No thinking, no markdown fences.`

function applyOutlineTiers(
  modules: StudyModule[],
  outlineModules: CourseOutline["modules"]
): StudyModule[] {
  return modules.map((mod, i) => {
    const outlineTier = outlineModules.find((o) => o.id === mod.id)?.difficulty_tier
      ?? outlineModules[i]?.difficulty_tier
    if (outlineTier) {
      return { ...mod, difficulty_tier: outlineTier }
    }
    return mod
  })
}

async function generateModuleBatch(
  outlineModules: CourseOutline["modules"],
  conceptTitle: string,
  topicTitle: string,
  exaContext: string,
  sourcesJson: string,
  graphContext: string[]
): Promise<StudyModule[]> {
  const outlineDesc = outlineModules
    .map((m) => `- id: "${m.id}", title: "${m.title}", difficulty_tier: "${m.difficulty_tier}", focus: ${m.focus}`)
    .join("\n")

  const MAX_RETRIES = 2
  let lastError: unknown

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const modules = await generateJSON(
        {
          messages: [
            { role: "system", content: MODULE_BATCH_SYSTEM_PROMPT },
            {
              role: "user",
              content: [
                `# Concept: ${conceptTitle} (Topic: ${topicTitle})`,
                graphContext.length > 0 ? `\n# Learning Graph Context\n${graphContext.join("\n")}` : "",
                `\n# Module Outlines to Generate (use these EXACT id, title, and difficulty_tier values)\n${outlineDesc}`,
                `\n# Reference Material\n${exaContext || "(No results)"}`,
                `\n# Available Sources\n${sourcesJson}`,
                `\nGenerate the full modules now. Output: { "modules": [...] }`,
              ].filter(Boolean).join("\n"),
            },
          ],
          temperature: 0.5,
          maxTokens: 16384,
        },
        parseModuleBatch
      )
      return applyOutlineTiers(modules, outlineModules)
    } catch (err) {
      lastError = err
      console.warn(`Module batch attempt ${attempt + 1} failed:`, err instanceof Error ? err.message : err)
      if (attempt < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)))
      }
    }
  }

  throw lastError
}

// --- Main orchestrator ---

export interface GenerateStudyCourseOptions {
  conceptTitle: string
  conceptDescription: string
  topicTitle: string
  prerequisites?: string[]
  nextConcepts?: string[]
}

export async function generateStudyCourse(
  options: GenerateStudyCourseOptions
): Promise<StudyCourse> {
  const { conceptTitle, conceptDescription, topicTitle, prerequisites, nextConcepts } = options

  const { context: exaContext, sources } = await gatherExaContext(
    conceptTitle,
    conceptDescription,
    topicTitle
  )

  const graphContext: string[] = []
  if (prerequisites?.length) {
    graphContext.push(
      `**Prerequisites the student already learned:** ${prerequisites.join(", ")}`
    )
  }
  if (nextConcepts?.length) {
    graphContext.push(
      `**Concepts that build on this one next:** ${nextConcepts.join(", ")}`
    )
  }

  const sourcesJson = JSON.stringify(
    sources.slice(0, 12).map((s) => ({ title: s.title, url: s.url }))
  )

  // Phase 1: Generate course outline
  const outline = await generateOutline(
    conceptTitle,
    conceptDescription,
    topicTitle,
    exaContext,
    graphContext
  )

  // Phase 2: Generate modules in batches of 3
  const batchSize = 3
  const batches: CourseOutline["modules"][] = []
  for (let i = 0; i < outline.modules.length; i += batchSize) {
    batches.push(outline.modules.slice(i, i + batchSize))
  }

  const batchResults = await Promise.all(
    batches.map((batch) =>
      generateModuleBatch(batch, conceptTitle, topicTitle, exaContext, sourcesJson, graphContext)
    )
  )

  const allModules = batchResults.flat()

  const course: StudyCourse = {
    course_title: outline.course_title,
    overview: outline.overview,
    modules: allModules,
  }

  const validated = StudyCourseSchema.safeParse(course)
  if (validated.success) return validated.data

  console.warn("Course assembly validation failed, returning raw:", validated.error.message)
  return course
}
