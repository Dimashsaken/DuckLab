import { NextResponse } from "next/server"
import { generateCurriculum } from "@/lib/agents/curriculum-architect"
import { createClient } from "@/lib/supabase/server"
import { createTopic, updateTopicStatus } from "@/lib/supabase/queries/topics"
import { insertConcepts, insertEdges } from "@/lib/supabase/queries/concepts"

export const maxDuration = 60

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { topic } = await request.json()
    if (!topic || typeof topic !== "string") {
      return NextResponse.json(
        { error: "Topic is required" },
        { status: 400 }
      )
    }

    const topicRecord = await createTopic(topic)
    const topicId = topicRecord.id

    try {
      const graph = await generateCurriculum(topic)

      const dbConcepts = await insertConcepts(
        topicId,
        graph.concepts.map((c) => ({
          title: c.title,
          description: c.description,
          difficulty: c.difficulty,
        }))
      )

      const tempIdToDbId = new Map<string, string>()
      graph.concepts.forEach((c, i) => {
        tempIdToDbId.set(c.temp_id, dbConcepts[i].id)
      })

      const dbEdges = graph.edges
        .filter(
          (e) => tempIdToDbId.has(e.source) && tempIdToDbId.has(e.target)
        )
        .map((e) => ({
          source_id: tempIdToDbId.get(e.source)!,
          target_id: tempIdToDbId.get(e.target)!,
        }))

      if (dbEdges.length > 0) {
        await insertEdges(topicId, dbEdges)
      }

      await updateTopicStatus(topicId, "ready")

      return NextResponse.json({
        topicId,
        conceptCount: dbConcepts.length,
        edgeCount: dbEdges.length,
      })
    } catch (err) {
      await updateTopicStatus(topicId, "error")
      throw err
    }
  } catch (error) {
    console.error("Curriculum generation error:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to generate curriculum",
      },
      { status: 500 }
    )
  }
}
