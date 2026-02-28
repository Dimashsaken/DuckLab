import { createClient } from "@/lib/supabase/server"
import type { MasteryLevel } from "@/lib/constants"

export async function getConceptsForTopic(topicId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("concepts")
    .select("*")
    .eq("topic_id", topicId)
    .order("difficulty", { ascending: true })

  if (error) throw error
  return data
}

export async function getEdgesForTopic(topicId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("concept_edges")
    .select("*")
    .eq("topic_id", topicId)

  if (error) throw error
  return data
}

export async function getConcept(conceptId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("concepts")
    .select("*, resources(*)")
    .eq("id", conceptId)
    .single()

  if (error) throw error
  return data
}

export async function insertConcepts(
  topicId: string,
  concepts: {
    title: string
    description: string
    difficulty: number
  }[]
) {
  const supabase = await createClient()
  const rows = concepts.map((c) => ({ ...c, topic_id: topicId }))
  const { data, error } = await supabase
    .from("concepts")
    .insert(rows)
    .select()

  if (error) throw error
  return data
}

export async function insertEdges(
  topicId: string,
  edges: { source_id: string; target_id: string }[]
) {
  const supabase = await createClient()
  const rows = edges.map((e) => ({ ...e, topic_id: topicId }))
  const { error } = await supabase.from("concept_edges").insert(rows)

  if (error) throw error
}

export async function updateConceptMastery(
  conceptId: string,
  updates: {
    mastery_level: MasteryLevel
    mastery_score: number
    last_reviewed_at?: string
    next_review_at?: string
    ease_factor?: number
    interval_days?: number
    repetitions?: number
  }
) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("concepts")
    .update(updates)
    .eq("id", conceptId)

  if (error) throw error
}
