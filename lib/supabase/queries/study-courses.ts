import { createClient } from "@/lib/supabase/server"
import type { StudyCourse } from "@/lib/schemas/study-course"

export async function getSavedCourse(
  userId: string,
  conceptId: string
): Promise<StudyCourse | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("study_courses")
    .select("course_data")
    .eq("user_id", userId)
    .eq("concept_id", conceptId)
    .maybeSingle()

  if (error) throw error
  if (!data) return null
  return data.course_data as StudyCourse
}

export async function upsertCourse(
  userId: string,
  conceptId: string,
  courseData: StudyCourse
) {
  const supabase = await createClient()
  const { error } = await supabase.from("study_courses").upsert(
    {
      user_id: userId,
      concept_id: conceptId,
      course_data: courseData as unknown as Record<string, unknown>,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,concept_id" }
  )

  if (error) throw error
}
