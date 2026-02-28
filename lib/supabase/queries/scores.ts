import { createClient } from "@/lib/supabase/server"

export async function insertScore(score: {
  session_id: string
  concept_id: string
  accuracy: number
  simplicity: number
  structure: number
  transfer: number
  metacognition: number
  weakest_dimension: string
  misconception_label: string | null
  improvement_delta: number
}) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("scores")
    .insert(score)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getLatestScore(conceptId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("scores")
    .select("*")
    .eq("concept_id", conceptId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data
}
