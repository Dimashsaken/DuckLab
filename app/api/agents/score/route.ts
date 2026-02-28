import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/supabase/auth"
import { scoreTeachBack } from "@/lib/agents/rubric-scorer"
import { insertScore, getLatestScore } from "@/lib/supabase/queries/scores"
import { updateConceptMastery } from "@/lib/supabase/queries/concepts"
import { updateTeachSession } from "@/lib/supabase/queries/teach-sessions"
import { calculateSM2 } from "@/lib/utils/spaced-repetition"
import { SCORE_THRESHOLDS, type MasteryLevel } from "@/lib/constants"

export const maxDuration = 30

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    const supabase = await createClient()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { sessionId, conceptId, conceptTitle, conceptDescription, conversation } =
      await request.json()

    const scorecard = await scoreTeachBack(
      conceptTitle,
      conceptDescription,
      conversation
    )

    const previousScore = await getLatestScore(conceptId)
    const delta = previousScore
      ? scorecard.overall_score - previousScore.overall_score
      : 0

    const score = await insertScore({
      session_id: sessionId,
      concept_id: conceptId,
      accuracy: scorecard.accuracy,
      simplicity: scorecard.simplicity,
      structure: scorecard.structure,
      transfer: scorecard.transfer,
      metacognition: scorecard.metacognition,
      weakest_dimension: scorecard.weakest_dimension,
      misconception_label: scorecard.misconception_label,
      improvement_delta: delta,
    })

    await updateTeachSession(sessionId, {
      conversation,
      status: "scored",
      completed_at: new Date().toISOString(),
    })

    let masteryLevel: MasteryLevel = "weak"
    if (scorecard.overall_score >= SCORE_THRESHOLDS.mastered) {
      masteryLevel = "mastered"
    } else if (scorecard.overall_score >= SCORE_THRESHOLDS.learning) {
      masteryLevel = "learning"
    }

    const { data: concept } = await supabase
      .from("concepts")
      .select("ease_factor, interval_days, repetitions")
      .eq("id", conceptId)
      .single()

    const sm2 = calculateSM2({
      quality: scorecard.overall_score,
      repetitions: concept?.repetitions ?? 0,
      easeFactor: concept?.ease_factor ?? 2.5,
      intervalDays: concept?.interval_days ?? 0,
    })

    await updateConceptMastery(conceptId, {
      mastery_level: masteryLevel,
      mastery_score: scorecard.overall_score,
      last_reviewed_at: new Date().toISOString(),
      next_review_at: sm2.nextReviewDate.toISOString(),
      ease_factor: sm2.easeFactor,
      interval_days: sm2.intervalDays,
      repetitions: sm2.repetitions,
    })

    return NextResponse.json({
      ...scorecard,
      improvement_delta: delta,
      score_id: score.id,
    })
  } catch (error) {
    console.error("Scoring error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to score",
      },
      { status: 500 }
    )
  }
}
