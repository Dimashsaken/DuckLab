"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  HelpCircle,
  Target,
  MessageSquare,
  ArrowRight,
} from "lucide-react"
import type { Claim, TurnFeedback } from "@/lib/schemas/scorecard"

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
  claims?: Claim[]
  turn_feedback?: TurnFeedback[]
  actionable_next_steps?: string[]
}

const DIMENSION_LABELS: Record<string, string> = {
  accuracy: "Accuracy",
  simplicity: "Simplicity",
  structure: "Structure",
  transfer: "Transfer",
  metacognition: "Metacognition",
}

const VERDICT_CONFIG: Record<
  string,
  { icon: typeof CheckCircle; color: string; label: string }
> = {
  correct: { icon: CheckCircle, color: "text-mastery-mastered", label: "Correct" },
  partially_correct: {
    icon: AlertTriangle,
    color: "text-mastery-learning",
    label: "Partially correct",
  },
  incorrect: { icon: XCircle, color: "text-destructive", label: "Incorrect" },
  unverifiable: {
    icon: HelpCircle,
    color: "text-muted-foreground",
    label: "Unverifiable",
  },
}

export function Scorecard({ data }: { data: ScorecardData }) {
  const dimensions = [
    { key: "accuracy", value: data.accuracy },
    { key: "simplicity", value: data.simplicity },
    { key: "structure", value: data.structure },
    { key: "transfer", value: data.transfer },
    { key: "metacognition", value: data.metacognition },
  ]

  const passed = data.overall_score >= 10
  const hasClaims = data.claims && data.claims.length > 0
  const hasTurnFeedback = data.turn_feedback && data.turn_feedback.length > 0
  const hasNextSteps = data.actionable_next_steps && data.actionable_next_steps.length > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {passed ? (
                <CheckCircle className="h-5 w-5 text-mastery-mastered" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-mastery-learning" />
              )}
              Teach-Back Analysis
            </CardTitle>
            <div className="flex items-center gap-2">
              <span className="font-mono text-2xl font-bold">
                {data.overall_score}
              </span>
              <span className="text-muted-foreground">/15</span>
              {data.improvement_delta !== undefined &&
                data.improvement_delta !== 0 && (
                  <Badge
                    variant={
                      data.improvement_delta > 0 ? "default" : "destructive"
                    }
                    className="ml-2"
                  >
                    {data.improvement_delta > 0 ? (
                      <TrendingUp className="mr-1 h-3 w-3" />
                    ) : (
                      <TrendingDown className="mr-1 h-3 w-3" />
                    )}
                    {data.improvement_delta > 0 ? "+" : ""}
                    {data.improvement_delta}
                  </Badge>
                )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              {hasClaims && (
                <TabsTrigger value="claims">
                  Claims ({data.claims!.length})
                </TabsTrigger>
              )}
              {hasTurnFeedback && (
                <TabsTrigger value="turns">Per-Turn</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="overview" className="mt-4 space-y-4">
              <div className="space-y-3">
                {dimensions.map((d) => (
                  <div key={d.key} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span
                        className={
                          d.key === data.weakest_dimension
                            ? "font-medium text-destructive"
                            : ""
                        }
                      >
                        {DIMENSION_LABELS[d.key]}
                        {d.key === data.weakest_dimension && " (weakest)"}
                      </span>
                      <span className="font-mono">{d.value}/3</span>
                    </div>
                    <Progress value={(d.value / 3) * 100} className="h-2" />
                  </div>
                ))}
              </div>

              <div className="space-y-2 rounded-lg bg-muted/50 p-4">
                <div className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-mastery-mastered" />
                  <p className="text-sm">{data.strength_summary}</p>
                </div>
                <div className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-mastery-learning" />
                  <p className="text-sm">{data.gap_summary}</p>
                </div>
              </div>

              {data.misconception_label &&
                data.misconception_label !== "none-detected" && (
                  <Badge variant="outline" className="text-xs">
                    Misconception: {data.misconception_label}
                  </Badge>
                )}

              {hasNextSteps && (
                <div className="space-y-2">
                  <h4 className="flex items-center gap-2 text-sm font-medium">
                    <Target className="h-4 w-4" />
                    What to do next
                  </h4>
                  <div className="space-y-1.5">
                    {data.actionable_next_steps!.map((step, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 rounded-md bg-muted/30 p-2.5"
                      >
                        <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                        <p className="text-sm">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            {hasClaims && (
              <TabsContent value="claims" className="mt-4 space-y-2">
                <p className="text-xs text-muted-foreground">
                  Each factual claim you made, verified against the concept.
                </p>
                <div className="space-y-2">
                  {data.claims!.map((claim, i) => {
                    const config = VERDICT_CONFIG[claim.verdict]
                    const Icon = config.icon
                    return (
                      <div
                        key={i}
                        className="rounded-lg border border-border p-3 space-y-1.5"
                      >
                        <div className="flex items-start gap-2">
                          <Icon
                            className={`mt-0.5 h-4 w-4 shrink-0 ${config.color}`}
                          />
                          <div className="flex-1 space-y-1">
                            <p className="text-sm">&ldquo;{claim.claim}&rdquo;</p>
                            <Badge variant="outline" className="text-xs">
                              {config.label}
                            </Badge>
                          </div>
                        </div>
                        {claim.correction && (
                          <div className="ml-6 rounded-md bg-destructive/10 p-2">
                            <p className="text-xs text-destructive">
                              {claim.correction}
                            </p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </TabsContent>
            )}

            {hasTurnFeedback && (
              <TabsContent value="turns" className="mt-4 space-y-3">
                <p className="text-xs text-muted-foreground">
                  How each of your responses performed.
                </p>
                {data.turn_feedback!.map((tf) => (
                  <div
                    key={tf.turn_number}
                    className="rounded-lg border border-border p-3 space-y-2"
                  >
                    <h4 className="flex items-center gap-2 text-sm font-medium">
                      <MessageSquare className="h-4 w-4" />
                      Your response #{tf.turn_number}
                    </h4>
                    <div className="space-y-1.5 ml-6">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-mastery-mastered" />
                        <p className="text-xs">{tf.what_went_well}</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-mastery-learning" />
                        <p className="text-xs">{tf.what_to_improve}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  )
}
