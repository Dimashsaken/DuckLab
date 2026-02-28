import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { generateStudyCourse } from "@/lib/agents/study-course-generator"
import { getSavedCourse, upsertCourse } from "@/lib/supabase/queries/study-courses"

export const maxDuration = 120

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const conceptId = searchParams.get("conceptId")

    if (!conceptId) {
      return NextResponse.json(
        { error: "Missing conceptId" },
        { status: 400 }
      )
    }

    const course = await getSavedCourse(user.id, conceptId)

    if (!course) {
      return NextResponse.json({ course: null })
    }

    return NextResponse.json({ course })
  } catch (error) {
    console.error("Load saved course error:", error)
    return NextResponse.json(
      { error: "Failed to load saved course" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { conceptId, conceptTitle, conceptDescription, topicTitle, prerequisites, nextConcepts } =
      await request.json()

    if (!conceptTitle || !conceptDescription || !topicTitle) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const course = await generateStudyCourse({
      conceptTitle,
      conceptDescription,
      topicTitle,
      prerequisites,
      nextConcepts,
    })

    if (conceptId) {
      try {
        await upsertCourse(user.id, conceptId, course)
      } catch (saveErr) {
        console.error("Failed to save course (returning anyway):", saveErr)
      }
    }

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
