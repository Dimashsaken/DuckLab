"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Frown, Meh, Smile } from "lucide-react"
import { cn } from "@/lib/utils"

interface ConfidenceCheckProps {
  onSelect: (level: number) => void
  selected: number | null
}

const levels = [
  { value: 1, label: "Confused", icon: Frown, color: "text-red-400 border-red-500/30 hover:bg-red-500/10", activeColor: "bg-red-500/20 border-red-500/50 text-red-300" },
  { value: 2, label: "Getting it", icon: Meh, color: "text-amber-400 border-amber-500/30 hover:bg-amber-500/10", activeColor: "bg-amber-500/20 border-amber-500/50 text-amber-300" },
  { value: 3, label: "Got it", icon: Smile, color: "text-green-400 border-green-500/30 hover:bg-green-500/10", activeColor: "bg-green-500/20 border-green-500/50 text-green-300" },
]

export function ConfidenceCheck({ onSelect, selected }: ConfidenceCheckProps) {
  return (
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
  )
}
