"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { HelpCircle, Eye } from "lucide-react"
import type { PredictionPrompt as PredictionPromptType } from "@/lib/schemas/study-course"

export function PredictionPrompt({ data }: { data: PredictionPromptType }) {
  const [revealed, setRevealed] = useState(false)

  return (
    <Card className="border-indigo-500/30 bg-indigo-500/5">
      <CardContent className="space-y-3 py-4">
        <div className="flex items-start gap-2">
          <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-indigo-400" />
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{data.setup}</p>
            <p className="text-sm font-semibold">{data.question}</p>
          </div>
        </div>

        {!revealed ? (
          <Button
            onClick={() => setRevealed(true)}
            variant="outline"
            size="sm"
            className="w-full border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10"
          >
            <Eye className="mr-2 h-3.5 w-3.5" />
            I have my guess — reveal the answer
          </Button>
        ) : (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-2 rounded-lg bg-indigo-500/10 p-3"
            >
              <p className="text-sm font-medium text-indigo-300">
                {data.answer}
              </p>
              <p className="text-xs text-muted-foreground">
                {data.explanation}
              </p>
            </motion.div>
          </AnimatePresence>
        )}
      </CardContent>
    </Card>
  )
}
