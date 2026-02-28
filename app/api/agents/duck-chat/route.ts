import { getCurrentUser } from "@/lib/supabase/auth"
import { generateDuckResponse } from "@/lib/agents/duck-persona"

export const maxDuration = 30

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return new Response("Unauthorized", { status: 401 })
    }

    const { messages, conceptTitle, conceptDescription } =
      await request.json()

    const stream = await generateDuckResponse(
      conceptTitle,
      conceptDescription,
      messages
    )

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    console.error("Duck chat error:", error)
    return new Response(
      error instanceof Error ? error.message : "Duck chat failed",
      { status: 500 }
    )
  }
}
