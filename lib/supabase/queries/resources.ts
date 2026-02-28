import { createClient } from "@/lib/supabase/server"

export async function getResourcesForConcept(conceptId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("resources")
    .select("*")
    .eq("concept_id", conceptId)
    .order("quality_score", { ascending: false })

  if (error) throw error
  return data
}

export async function insertResources(
  conceptId: string,
  resources: {
    title: string
    url: string
    type: string
    description: string
    quality_score: number
  }[]
) {
  const supabase = await createClient()
  const rows = resources.map((r) => ({ ...r, concept_id: conceptId }))
  const { error } = await supabase.from("resources").insert(rows)

  if (error) throw error
}
