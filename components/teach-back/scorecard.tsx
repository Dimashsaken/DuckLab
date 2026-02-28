"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from "lucide-react"

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

const DIMENSION_LABELS: Record<string, string> = {
  accuracy: "Accuracy",
  simplicity: "Simplicity",
  structure: "Structure",
  transfer: "Transfer",
  metacognition: "Metacognition",
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
              Teach-Back Score
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
        <CardContent className="space-y-6">
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
        </CardContent>
      </Card>
    </motion.div>
  )
}
