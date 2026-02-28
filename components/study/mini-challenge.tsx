"use client"

import { useState } from "react"
import { motion } from "framer-motion"
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
    <div className="rounded-xl bg-amber-500/[0.06] border border-amber-500/[0.1] p-5 space-y-4">
      <div className="flex items-center gap-2.5">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/15">
          <Zap className="h-3.5 w-3.5 text-amber-400" />
        </span>
        <span className="text-xs font-semibold uppercase tracking-wider text-amber-400/80">
          Quick Check
        </span>
      </div>

      <p className="text-[15px] font-medium leading-relaxed text-foreground/85">
        {data.question}
      </p>

      <div className="space-y-2">
        {data.options.map((option, i) => {
          const isCorrect = i === data.correct_index
          const isSelected = i === selected

          return (
            <button
              key={i}
              disabled={answered}
              onClick={() => setSelected(i)}
              className={cn(
                "w-full flex items-center gap-3 rounded-xl border px-4 py-3.5 text-left text-[14px] transition-all duration-200",
                !answered && "border-foreground/[0.08] hover:border-amber-500/25 hover:bg-amber-500/[0.06] cursor-pointer",
                answered && isCorrect && "border-emerald-500/25 bg-emerald-500/[0.08]",
                answered && isSelected && !isCorrect && "border-rose-500/20 bg-rose-500/[0.06] opacity-70",
                answered && !isCorrect && !isSelected && "opacity-35",
              )}
            >
              <span className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-mono font-medium",
                !answered && "border-foreground/10 text-muted-foreground/40",
                answered && isCorrect && "border-emerald-500/30 text-emerald-400 bg-emerald-500/10",
                answered && isSelected && !isCorrect && "border-rose-500/25 text-rose-400 bg-rose-500/10",
              )}>
                {String.fromCharCode(65 + i)}
              </span>
              <span className="flex-1 text-foreground/75">{option}</span>
              {answered && isCorrect && (
                <CheckCircle className="h-4.5 w-4.5 shrink-0 text-emerald-400" />
              )}
              {answered && isSelected && !isCorrect && (
                <XCircle className="h-4.5 w-4.5 shrink-0 text-rose-400/70" />
              )}
            </button>
          )
        })}
      </div>

      {answered && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "rounded-lg border p-4",
            correct
              ? "bg-emerald-500/[0.06] border-emerald-500/[0.1]"
              : "bg-rose-500/[0.06] border-rose-500/[0.1]"
          )}
        >
          <p className={cn(
            "text-[13px] font-semibold mb-1",
            correct ? "text-emerald-400" : "text-rose-400"
          )}>
            {correct ? "Correct!" : "Not quite."}
          </p>
          <p className="text-[13px] leading-relaxed text-foreground/60">
            {data.explanation}
          </p>
        </motion.div>
      )}
    </div>
  )
}
