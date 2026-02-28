"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useDuckChat, type ChatMessage } from "@/lib/hooks/use-duck-chat"
import { DuckChat } from "@/components/teach-back/duck-chat"
import { Scorecard } from "@/components/teach-back/scorecard"
import { RepairLesson } from "@/components/teach-back/repair-lesson"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, RotateCcw, CheckCircle, Loader2 } from "lucide-react"
import type { RepairLesson as RepairLessonType } from "@/lib/schemas/repair"

interface ScorecardData {
  accuracy: number
  simplicity: number
  structure: number
  transfer: number
  metacognition: number
  overall_score: number
  weakest_dimension: string
  misconception_label: string | null
  strength_summary: string
  gap_summary: string
  improvement_delta?: number
}

export default function TeachPage() {
  const params = useParams<{ topicId: string; nodeId: string }>()
  const [concept, setConcept] = useState<{
    id: string
    title: string
    description: string
  } | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [scorecard, setScorecard] = useState<ScorecardData | null>(null)
  const [repair, setRepair] = useState<RepairLessonType | null>(null)
  const [scoring, setScoring] = useState(false)
  const [loadingRepair, setLoadingRepair] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from("concepts")
        .select("id, title, description")
        .eq("id", params.nodeId)
        .single()

      if (data) setConcept(data)

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user && data) {
        const { data: session } = await supabase
          .from("teach_sessions")
          .insert({
            concept_id: data.id,
            user_id: user.id,
          })
          .select()
          .single()

        if (session) setSessionId(session.id)
      }
    }

    load()
  }, [params.nodeId])

  const handleFinished = useCallback(
    async (msgs: ChatMessage[]) => {
      if (!sessionId || !concept) return
      setScoring(true)

      try {
        const res = await fetch("/api/agents/score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            conceptId: concept.id,
            conceptTitle: concept.title,
            conceptDescription: concept.description,
            conversation: msgs,
          }),
        })

        if (res.ok) {
          const data = await res.json()
          setScorecard(data)
        }
      } catch (err) {
        console.error("Scoring failed:", err)
      } finally {
        setScoring(false)
      }
    },
    [sessionId, concept]
  )

  const { messages, sendMessage, isLoading, isFinished, reset } = useDuckChat({
    conceptTitle: concept?.title ?? "",
    conceptDescription: concept?.description ?? "",
    onFinished: handleFinished,
  })

  async function handleRepair() {
    if (!scorecard || !concept) return
    setLoadingRepair(true)

    try {
      const res = await fetch("/api/agents/repair", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conceptTitle: concept.title,
          weakestDimension: scorecard.weakest_dimension,
          misconceptionLabel: scorecard.misconception_label,
          gapSummary: scorecard.gap_summary,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setRepair(data)
      }
    } catch (err) {
      console.error("Repair failed:", err)
    } finally {
      setLoadingRepair(false)
    }
  }

  function handleReteach() {
    reset()
    setScorecard(null)
    setRepair(null)
    setSessionId(null)

    async function createNewSession() {
      if (!concept) return
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: session } = await supabase
          .from("teach_sessions")
          .insert({
            concept_id: concept.id,
            user_id: user.id,
            attempt_number: 2,
          })
          .select()
          .single()

        if (session) setSessionId(session.id)
      }
    }

    createNewSession()
  }

  if (!concept) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href={`/topic/${params.topicId}`}
          className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to graph
        </Link>
        <h1 className="text-2xl font-bold">Teach: {concept.title}</h1>
        <p className="mt-1 text-muted-foreground">{concept.description}</p>
      </div>

      {!scorecard ? (
        <div className="rounded-lg border border-border" style={{ height: "500px" }}>
          <DuckChat
            messages={messages}
            isLoading={isLoading}
            isFinished={isFinished}
            onSend={sendMessage}
          />
          {scoring && (
            <div className="flex items-center justify-center gap-2 border-t border-border p-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">
                The duck is thinking about what you taught...
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <Scorecard data={scorecard} />

          {scorecard.overall_score < 10 && !repair && (
            <Button
              onClick={handleRepair}
              disabled={loadingRepair}
              className="w-full"
              variant="secondary"
            >
              {loadingRepair ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating micro-lesson...
                </>
              ) : (
                "Get Repair Micro-Lesson"
              )}
            </Button>
          )}

          {repair && <RepairLesson data={repair} />}

          <div className="flex gap-3">
            {(repair || scorecard.overall_score < 10) && (
              <Button onClick={handleReteach} variant="outline" className="flex-1">
                <RotateCcw className="mr-2 h-4 w-4" />
                Re-teach
              </Button>
            )}
            <Button asChild className="flex-1">
              <Link href={`/topic/${params.topicId}`}>
                <CheckCircle className="mr-2 h-4 w-4" />
                {scorecard.overall_score >= 10
                  ? "Node Mastered! Back to Graph"
                  : "Back to Graph"}
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
