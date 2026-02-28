import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { generateText } from "@/lib/minimax/client"
import { buildConfidenceFeedbackPrompt } from "@/lib/prompts/confidence-feedback"

export const maxDuration = 30

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const { moduleTitle, moduleContent, confidenceLevel, conceptTitle } = body

  if (!moduleTitle || !moduleContent || !confidenceLevel || !conceptTitle) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    )
  }

  try {
    const { system, user: userPrompt } = buildConfidenceFeedbackPrompt(
      confidenceLevel,
      moduleTitle,
      moduleContent,
      conceptTitle
    )

    const feedback = await generateText({
      messages: [
        { role: "system", content: system },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      maxTokens: 1024,
    })

    const cleaned = feedback
      .replace(/<think>[\s\S]*?<\/think>/gi, "")
      .trim()

    return NextResponse.json({ feedback: cleaned })
  } catch (err) {
    console.error("[confidence-feedback] Error:", err)
    return NextResponse.json(
      { error: "Failed to generate feedback" },
      { status: 500 }
    )
  }
}
