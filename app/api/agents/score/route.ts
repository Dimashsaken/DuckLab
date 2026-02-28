import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/supabase/auth"
import { scoreTeachBack } from "@/lib/agents/rubric-scorer"
import { insertScore, getLatestScore } from "@/lib/supabase/queries/scores"
import { updateConceptMastery } from "@/lib/supabase/queries/concepts"
import { updateTeachSession } from "@/lib/supabase/queries/teach-sessions"
import { calculateSM2 } from "@/lib/utils/spaced-repetition"
import { SCORE_THRESHOLDS, type MasteryLevel } from "@/lib/constants"

export const maxDuration = 60

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    const supabase = await createClient()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { sessionId, conceptId, conceptTitle, conceptDescription, conversation } =
      await request.json()

    const enrichedScorecard = await scoreTeachBack(
      conceptTitle,
      conceptDescription,
      conversation
    )

    const previousScore = await getLatestScore(conceptId)
    const delta = previousScore
      ? enrichedScorecard.overall_score - previousScore.overall_score
      : 0

    const score = await insertScore({
      session_id: sessionId,
      concept_id: conceptId,
      accuracy: enrichedScorecard.accuracy,
      simplicity: enrichedScorecard.simplicity,
      structure: enrichedScorecard.structure,
      transfer: enrichedScorecard.transfer,
      metacognition: enrichedScorecard.metacognition,
      weakest_dimension: enrichedScorecard.weakest_dimension,
      misconception_label: enrichedScorecard.misconception_label,
      improvement_delta: delta,
    })

    await updateTeachSession(sessionId, {
      conversation,
      status: "scored",
      completed_at: new Date().toISOString(),
    })

    let masteryLevel: MasteryLevel = "weak"
    if (enrichedScorecard.overall_score >= SCORE_THRESHOLDS.mastered) {
      masteryLevel = "mastered"
    } else if (enrichedScorecard.overall_score >= SCORE_THRESHOLDS.learning) {
      masteryLevel = "learning"
    }

    const { data: concept } = await supabase
      .from("concepts")
      .select("ease_factor, interval_days, repetitions")
      .eq("id", conceptId)
      .single()

    const sm2 = calculateSM2({
      quality: enrichedScorecard.overall_score,
      repetitions: concept?.repetitions ?? 0,
      easeFactor: concept?.ease_factor ?? 2.5,
      intervalDays: concept?.interval_days ?? 0,
    })

    await updateConceptMastery(conceptId, {
      mastery_level: masteryLevel,
      mastery_score: enrichedScorecard.overall_score,
      last_reviewed_at: new Date().toISOString(),
      next_review_at: sm2.nextReviewDate.toISOString(),
      ease_factor: sm2.easeFactor,
      interval_days: sm2.intervalDays,
      repetitions: sm2.repetitions,
    })

    return NextResponse.json({
      ...enrichedScorecard,
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
