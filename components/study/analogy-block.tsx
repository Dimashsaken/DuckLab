"use client"

import { Lightbulb } from "lucide-react"

export function AnalogyBlock({ text }: { text: string }) {
  return (
    <div className="border-l-2 border-foreground/10 pl-5">
      <div className="flex items-center gap-2 mb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground/50">
        <Lightbulb className="h-3 w-3" />
        Think of it this way
      </div>
      <p className="text-[14px] leading-relaxed text-foreground/65 italic">
        {text}
      </p>
    </div>
  )
}
