"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Frown, Meh, Smile, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface ConfidenceCheckProps {
  onSelect: (level: number) => void
  selected: number | null
  feedback: string | null
  isLoading: boolean
}

const levels = [
  {
    value: 1,
    label: "Confused",
    icon: Frown,
    idle: "border-rose-500/15 hover:border-rose-500/30 hover:bg-rose-500/[0.06]",
    active: "border-rose-500/30 bg-rose-500/[0.1] text-rose-300",
    feedbackBg: "bg-rose-500/[0.06] border-rose-500/[0.12]",
  },
  {
    value: 2,
    label: "Getting it",
    icon: Meh,
    idle: "border-amber-500/15 hover:border-amber-500/30 hover:bg-amber-500/[0.06]",
    active: "border-amber-500/30 bg-amber-500/[0.1] text-amber-300",
    feedbackBg: "bg-amber-500/[0.06] border-amber-500/[0.12]",
  },
  {
    value: 3,
    label: "Got it!",
    icon: Smile,
    idle: "border-emerald-500/15 hover:border-emerald-500/30 hover:bg-emerald-500/[0.06]",
    active: "border-emerald-500/30 bg-emerald-500/[0.1] text-emerald-300",
    feedbackBg: "bg-emerald-500/[0.06] border-emerald-500/[0.12]",
  },
]

export function ConfidenceCheck({ onSelect, selected, feedback, isLoading }: ConfidenceCheckProps) {
  const activeLevel = levels.find((l) => l.value === selected)

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <p className="text-center text-sm font-medium text-foreground/60">
          How confident do you feel about this topic?
        </p>
        <div className="flex gap-3">
          {levels.map((level) => {
            const Icon = level.icon
            const isActive = selected === level.value
            return (
              <Button
                key={level.value}
                variant="outline"
                onClick={() => onSelect(level.value)}
                disabled={isLoading}
                className={cn(
                  "flex-1 h-14 gap-2.5 rounded-xl border text-sm font-medium transition-all duration-200",
                  "text-muted-foreground/60",
                  isActive ? level.active : level.idle
                )}
              >
                <Icon className="h-5 w-5" />
                {level.label}
              </Button>
            )
          })}
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex items-center justify-center gap-2.5 py-5"
          >
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground/40" />
            <span className="text-sm text-muted-foreground/40">Generating feedback...</span>
          </motion.div>
        )}

        {!isLoading && feedback && activeLevel && (
          <motion.div
            key="feedback"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.3 }}
            className={cn(
              "rounded-xl border p-5",
              activeLevel.feedbackBg
            )}
          >
            <p className="text-[14.5px] leading-[1.8] text-foreground/75">
              {feedback}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
