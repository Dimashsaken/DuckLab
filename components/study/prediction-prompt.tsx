"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { HelpCircle, Eye } from "lucide-react"
import type { PredictionPrompt as PredictionPromptType } from "@/lib/schemas/study-course"

export function PredictionPrompt({ data }: { data: PredictionPromptType }) {
  const [revealed, setRevealed] = useState(false)

  return (
    <div className="rounded-xl bg-indigo-500/[0.06] border border-indigo-500/[0.1] p-5 space-y-4">
      <div className="flex items-center gap-2.5">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500/15">
          <HelpCircle className="h-3.5 w-3.5 text-indigo-400" />
        </span>
        <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400/80">
          Predict First
        </span>
      </div>

      <div className="space-y-2">
        <p className="text-[14px] leading-relaxed text-foreground/65">
          {data.setup}
        </p>
        <p className="text-[15px] font-medium leading-relaxed text-foreground/85">
          {data.question}
        </p>
      </div>

      {!revealed ? (
        <Button
          onClick={() => setRevealed(true)}
          variant="outline"
          size="sm"
          className="w-full border-indigo-500/20 text-indigo-300/80 hover:bg-indigo-500/10 hover:text-indigo-300 hover:border-indigo-500/30"
        >
          <Eye className="mr-2 h-3.5 w-3.5" />
          I have my guess — reveal the answer
        </Button>
      ) : (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="rounded-lg bg-indigo-500/[0.06] border border-indigo-500/[0.08] p-4 space-y-2"
          >
            <p className="text-[14.5px] font-medium leading-relaxed text-foreground/80">
              {data.answer}
            </p>
            <p className="text-[13px] leading-relaxed text-foreground/55">
              {data.explanation}
            </p>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}
