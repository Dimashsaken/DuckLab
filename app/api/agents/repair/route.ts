import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/supabase/auth"
import { generateRepairLesson } from "@/lib/agents/repair-path"

export const maxDuration = 30

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const {
      conceptTitle,
      weakestDimension,
      misconceptionLabel,
      gapSummary,
      incorrectClaims,
    } = await request.json()

    const lesson = await generateRepairLesson(
      conceptTitle,
      weakestDimension,
      misconceptionLabel,
      gapSummary,
      incorrectClaims
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
