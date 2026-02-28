"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Frown, Meh, Smile, Loader2, Sparkles, Lightbulb, PartyPopper } from "lucide-react"
import { cn } from "@/lib/utils"

interface ConfidenceCheckProps {
  onSelect: (level: number) => void
  selected: number | null
  feedback: string | null
  isLoading: boolean
}

const levels = [
  { value: 1, label: "Confused", icon: Frown, color: "text-red-400 border-red-500/30 hover:bg-red-500/10", activeColor: "bg-red-500/20 border-red-500/50 text-red-300" },
  { value: 2, label: "Getting it", icon: Meh, color: "text-amber-400 border-amber-500/30 hover:bg-amber-500/10", activeColor: "bg-amber-500/20 border-amber-500/50 text-amber-300" },
  { value: 3, label: "Got it", icon: Smile, color: "text-green-400 border-green-500/30 hover:bg-green-500/10", activeColor: "bg-green-500/20 border-green-500/50 text-green-300" },
]

const FEEDBACK_STYLES: Record<number, { border: string; bg: string; headerColor: string; label: string; icon: typeof Sparkles }> = {
  1: { border: "border-red-500/30", bg: "bg-red-500/5", headerColor: "text-red-400", label: "Let me help clarify", icon: Lightbulb },
  2: { border: "border-amber-500/30", bg: "bg-amber-500/5", headerColor: "text-amber-400", label: "Quick tip", icon: Sparkles },
  3: { border: "border-green-500/30", bg: "bg-green-500/5", headerColor: "text-green-400", label: "Nice work!", icon: PartyPopper },
}

export function ConfidenceCheck({ onSelect, selected, feedback, isLoading }: ConfidenceCheckProps) {
  return (
    <div className="space-y-3">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2 rounded-lg border border-border/50 bg-muted/20 p-4"
      >
        <p className="text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
          How confident do you feel about this?
        </p>
        <div className="flex gap-2">
          {levels.map((level) => {
            const Icon = level.icon
            const isActive = selected === level.value
            return (
              <Button
                key={level.value}
                variant="outline"
                size="sm"
                onClick={() => onSelect(level.value)}
                disabled={isLoading}
                className={cn(
                  "flex-1 gap-2",
                  isActive ? level.activeColor : level.color
                )}
              >
                <Icon className="h-4 w-4" />
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
            className="flex items-center justify-center gap-2 rounded-lg border border-border/50 bg-muted/20 p-4"
          >
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">Thinking...</span>
          </motion.div>
        )}

        {!isLoading && feedback && selected && (
          <motion.div
            key="feedback"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.3 }}
          >
            {(() => {
              const style = FEEDBACK_STYLES[selected] ?? FEEDBACK_STYLES[2]
              const FeedbackIcon = style.icon
              return (
                <div className={cn("rounded-lg border p-4", style.border, style.bg)}>
                  <div className="mb-2 flex items-center gap-1.5">
                    <FeedbackIcon className={cn("h-3.5 w-3.5", style.headerColor)} />
                    <span className={cn("text-xs font-medium uppercase tracking-wider", style.headerColor)}>
                      {style.label}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-foreground/90">
                    {feedback}
                  </p>
                </div>
              )
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
