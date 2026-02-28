import { createClient } from "@/lib/supabase/server"

export async function createTeachSession(
  conceptId: string,
  attemptNumber: number = 1
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Not authenticated")

  const { data, error } = await supabase
    .from("teach_sessions")
    .insert({
      concept_id: conceptId,
      user_id: user.id,
      attempt_number: attemptNumber,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateTeachSession(
  sessionId: string,
  updates: {
    conversation?: unknown[]
    status?: "in_progress" | "scored" | "repaired"
    completed_at?: string
  }
) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("teach_sessions")
    .update(updates)
    .eq("id", sessionId)

  if (error) throw error
}

export async function getSessionsForConcept(conceptId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("teach_sessions")
    .select("*, scores(*)")
    .eq("concept_id", conceptId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data
}
