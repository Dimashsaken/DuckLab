"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Lightbulb } from "lucide-react"

export function AnalogyBlock({ text }: { text: string }) {
  return (
    <Card className="border-violet-500/30 bg-violet-500/5">
      <CardContent className="flex items-start gap-3 py-4">
        <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-violet-400" />
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-violet-400">
            Think of it this way
          </p>
          <p className="mt-1 text-sm text-violet-100/90">{text}</p>
        </div>
      </CardContent>
    </Card>
  )
}
