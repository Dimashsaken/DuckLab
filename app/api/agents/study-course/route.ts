import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { generateStudyCourse } from "@/lib/agents/study-course-generator"

export const maxDuration = 120

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { conceptTitle, conceptDescription, topicTitle } =
      await request.json()

    if (!conceptTitle || !conceptDescription || !topicTitle) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const course = await generateStudyCourse(
      conceptTitle,
      conceptDescription,
      topicTitle
    )

    return NextResponse.json(course)
  } catch (error) {
    console.error("Study course generation error:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate study course",
      },
      { status: 500 }
    )
  }
}
