"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import type { MiniChallenge as MiniChallengeType } from "@/lib/schemas/study-course"

export function MiniChallenge({
  data,
  index,
}: {
  data: MiniChallengeType
  index: number
}) {
  const [selected, setSelected] = useState<number | null>(null)
  const answered = selected !== null
  const correct = selected === data.correct_index

  return (
    <Card className="border-amber-500/30 bg-amber-500/5">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Zap className="h-4 w-4 text-amber-400" />
          Challenge {index + 1}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm font-medium">{data.question}</p>

        <div className="space-y-2">
          {data.options.map((option, i) => {
            const isCorrect = i === data.correct_index
            const isSelected = i === selected

            return (
              <Button
                key={i}
                variant="outline"
                size="sm"
                disabled={answered}
                onClick={() => setSelected(i)}
                className={cn(
                  "w-full justify-start text-left h-auto py-2.5 px-3",
                  answered && isCorrect && "border-green-500/50 bg-green-500/10 text-green-300",
                  answered && isSelected && !isCorrect && "border-red-500/50 bg-red-500/10 text-red-300",
                  !answered && "hover:bg-amber-500/10 hover:border-amber-500/30"
                )}
              >
                <span className="mr-2 shrink-0 font-mono text-xs text-muted-foreground">
                  {String.fromCharCode(65 + i)}.
                </span>
                <span className="text-sm">{option}</span>
                {answered && isCorrect && (
                  <CheckCircle className="ml-auto h-4 w-4 shrink-0 text-green-400" />
                )}
                {answered && isSelected && !isCorrect && (
                  <XCircle className="ml-auto h-4 w-4 shrink-0 text-red-400" />
                )}
              </Button>
            )
          })}
        </div>

        {answered && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "rounded-lg p-3 text-sm",
              correct ? "bg-green-500/10" : "bg-red-500/10"
            )}
          >
            <p className={cn("font-medium", correct ? "text-green-300" : "text-red-300")}>
              {correct ? "Correct!" : "Not quite."}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {data.explanation}
            </p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}
