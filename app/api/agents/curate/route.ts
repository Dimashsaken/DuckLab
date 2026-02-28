import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/supabase/auth"
import { curateResources } from "@/lib/agents/content-curator"
import { insertResources } from "@/lib/supabase/queries/resources"

export const maxDuration = 60

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { conceptId, conceptTitle, conceptDescription, topicTitle } =
      await request.json()

    const result = await curateResources(
      conceptTitle,
      conceptDescription,
      topicTitle
    )

    await insertResources(
      conceptId,
      result.resources.map((r) => ({
        title: r.title,
        url: r.url,
        type: r.type,
        description: r.description ?? "",
        quality_score: r.quality_score,
      }))
    )

    return NextResponse.json({ resources: result.resources })
  } catch (error) {
    console.error("Curation error:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to curate resources",
      },
      { status: 500 }
    )
  }
}
