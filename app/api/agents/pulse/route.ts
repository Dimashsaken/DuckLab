import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/supabase/auth"
import { generateFieldPulse } from "@/lib/agents/field-pulse"

export const maxDuration = 60

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { topicTitle, masteredConcepts } = await request.json()

    const briefing = await generateFieldPulse(topicTitle, masteredConcepts)

    return NextResponse.json({ briefing })
  } catch (error) {
    console.error("Pulse error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to generate pulse",
      },
      { status: 500 }
    )
  }
}
