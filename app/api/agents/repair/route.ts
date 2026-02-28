import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { generateRepairLesson } from "@/lib/agents/repair-path"

export const maxDuration = 30

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { conceptTitle, weakestDimension, misconceptionLabel, gapSummary } =
      await request.json()

    const lesson = await generateRepairLesson(
      conceptTitle,
      weakestDimension,
      misconceptionLabel,
      gapSummary
    )

    return NextResponse.json(lesson)
  } catch (error) {
    console.error("Repair error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to generate repair",
      },
      { status: 500 }
    )
  }
}
