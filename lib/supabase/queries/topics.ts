import { createClient } from "@/lib/supabase/server"
import { requireUser } from "@/lib/supabase/auth"

export async function getTopics() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("topics")
    .select("*, concepts(id, mastery_level, mastery_score)")
    .order("updated_at", { ascending: false })

  if (error) throw error
  return data
}

export async function getTopic(topicId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("topics")
    .select("*")
    .eq("id", topicId)
    .single()

  if (error) throw error
  return data
}

export async function createTopic(title: string, description?: string) {
  const supabase = await createClient()
  const user = await requireUser()

  const { data, error } = await supabase
    .from("topics")
    .insert({ title, description, user_id: user.id })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateTopicStatus(
  topicId: string,
  status: "generating" | "ready" | "error"
) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("topics")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", topicId)

  if (error) throw error
}
