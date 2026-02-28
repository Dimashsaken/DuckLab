import { getCurrentUser } from "@/lib/supabase/auth"
import { getRetellClient } from "@/lib/retell/client"
import { getOrCreateDuckAgent } from "@/lib/retell/agent-cache"

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { conceptTitle, conceptDescription } = await request.json()

    if (!conceptTitle) {
      return Response.json({ error: "conceptTitle is required" }, { status: 400 })
    }

    const agentId = await getOrCreateDuckAgent()
    const client = getRetellClient()

    const webCall = await client.call.createWebCall({
      agent_id: agentId,
      retell_llm_dynamic_variables: {
        concept_title: conceptTitle,
        concept_description: conceptDescription || "",
      },
      metadata: {
        user_id: user.id,
        concept_title: conceptTitle,
      },
    })

    return Response.json({
      accessToken: webCall.access_token,
      callId: webCall.call_id,
    })
  } catch (error) {
    console.error("Retell web call error:", error)
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to create web call" },
      { status: 500 }
    )
  }
}
