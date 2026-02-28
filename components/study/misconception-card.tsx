"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { AlertTriangle, ArrowRight, CheckCircle2 } from "lucide-react"
import type { Misconception } from "@/lib/schemas/study-course"

export function MisconceptionCard({ data }: { data: Misconception }) {
  const [step, setStep] = useState<"trap" | "why" | "correct">("trap")

  return (
    <div className="rounded-xl bg-rose-500/[0.06] border border-rose-500/[0.1] p-5 space-y-4">
      <div className="flex items-center gap-2.5">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-500/15">
          <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
        </span>
        <span className="text-xs font-semibold uppercase tracking-wider text-rose-400/80">
          Common Misconception
        </span>
      </div>

      <AnimatePresence mode="wait">
        {step === "trap" && (
          <motion.div
            key="trap"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="rounded-lg bg-rose-500/[0.06] border border-rose-500/[0.08] px-4 py-3.5">
              <p className="text-[14.5px] italic text-foreground/65">
                &ldquo;{data.wrong_belief}&rdquo;
              </p>
            </div>
            <Button
              onClick={() => setStep("why")}
              variant="outline"
              size="sm"
              className="w-full border-rose-500/20 text-rose-300/80 hover:bg-rose-500/10 hover:text-rose-300 hover:border-rose-500/30"
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
            className="space-y-4"
          >
            <div className="rounded-lg bg-rose-500/[0.04] border border-rose-500/[0.06] px-4 py-3">
              <p className="text-[14px] italic text-foreground/40 line-through decoration-rose-400/30">
                &ldquo;{data.wrong_belief}&rdquo;
              </p>
            </div>
            <p className="text-[14.5px] leading-[1.75] text-foreground/75">
              {data.why_wrong}
            </p>
            <Button
              onClick={() => setStep("correct")}
              variant="outline"
              size="sm"
              className="w-full border-emerald-500/20 text-emerald-300/80 hover:bg-emerald-500/10 hover:text-emerald-300 hover:border-emerald-500/30"
            >
              <CheckCircle2 className="mr-2 h-3.5 w-3.5" />
              Show correct understanding
            </Button>
          </motion.div>
        )}

        {step === "correct" && (
          <motion.div
            key="correct"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="rounded-lg bg-rose-500/[0.03] border border-rose-500/[0.05] px-4 py-3">
              <p className="text-[13px] italic text-foreground/30 line-through decoration-rose-400/20">
                &ldquo;{data.wrong_belief}&rdquo;
              </p>
              <p className="mt-1.5 text-[12px] text-foreground/40">
                {data.why_wrong}
              </p>
            </div>
            <div className="rounded-lg bg-emerald-500/[0.06] border border-emerald-500/[0.1] px-4 py-3.5">
              <p className="text-[14.5px] leading-relaxed text-foreground/80 font-medium">
                {data.correct_understanding}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
