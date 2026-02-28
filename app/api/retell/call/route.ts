import { getCurrentUser } from "@/lib/supabase/auth"
import { getRetellClient } from "@/lib/retell/client"

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const callId = searchParams.get("callId")

    if (!callId) {
      return Response.json({ error: "callId is required" }, { status: 400 })
    }

    const client = getRetellClient()
    const call = await client.call.retrieve(callId)

    const messages = (call.transcript_object ?? [])
      .filter(
        (entry: { role: string; content?: string }) =>
          entry.role === "agent" || entry.role === "user"
      )
      .map((entry: { role: string; content?: string }) => ({
        role: entry.role === "agent" ? "assistant" : "user",
        content: entry.content ?? "",
      }))

    return Response.json({
      callId: call.call_id,
      status: call.call_status,
      transcript: call.transcript,
      messages,
    })
  } catch (error) {
    console.error("Retell call retrieve error:", error)
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to retrieve call" },
      { status: 500 }
    )
  }
}
