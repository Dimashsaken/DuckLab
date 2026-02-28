"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, ArrowRight, Shield } from "lucide-react"
import type { Misconception } from "@/lib/schemas/study-course"

export function MisconceptionCard({ data }: { data: Misconception }) {
  const [step, setStep] = useState<"trap" | "why" | "correct">("trap")

  return (
    <Card className="border-rose-500/30 bg-rose-500/5">
      <CardContent className="space-y-3 py-4">
        <div className="flex items-center gap-2 text-sm font-medium text-rose-400">
          <AlertTriangle className="h-4 w-4" />
          Common Trap
        </div>

        <AnimatePresence mode="wait">
          {step === "trap" && (
            <motion.div
              key="trap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <p className="rounded-lg bg-rose-500/10 p-3 text-sm italic text-rose-200">
                &ldquo;{data.wrong_belief}&rdquo;
              </p>
              <Button
                onClick={() => setStep("why")}
                variant="outline"
                size="sm"
                className="w-full border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
              >
                Why is this wrong?
                <ArrowRight className="ml-2 h-3.5 w-3.5" />
              </Button>
            </motion.div>
          )}

          {step === "why" && (
            <motion.div
              key="why"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <p className="rounded-lg bg-rose-500/10 p-3 text-sm italic text-rose-200">
                &ldquo;{data.wrong_belief}&rdquo;
              </p>
              <p className="text-sm text-muted-foreground">{data.why_wrong}</p>
              <Button
                onClick={() => setStep("correct")}
                variant="outline"
                size="sm"
                className="w-full border-green-500/30 text-green-400 hover:bg-green-500/10"
              >
                <Shield className="mr-2 h-3.5 w-3.5" />
                Show the correct understanding
              </Button>
            </motion.div>
          )}

          {step === "correct" && (
            <motion.div
              key="correct"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <div className="rounded-lg bg-rose-500/10 p-3">
                <p className="text-sm italic text-rose-200 line-through">
                  &ldquo;{data.wrong_belief}&rdquo;
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {data.why_wrong}
                </p>
              </div>
              <div className="rounded-lg bg-green-500/10 p-3">
                <p className="text-sm font-medium text-green-300">
                  {data.correct_understanding}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
