"use client"

import Link from "next/link"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, MessageCircle, ExternalLink } from "lucide-react"
import { MASTERY_LABELS, type MasteryLevel } from "@/lib/constants"
import type { GraphNode } from "./graph-config"

interface Resource {
  id: string
  title: string
  url: string
  type: string
  description: string | null
  quality_score: number | null
}

interface NodeDetailPanelProps {
  node: GraphNode | null
  topicId: string
  resources: Resource[]
  open: boolean
  onClose: () => void
}

export function NodeDetailPanel({
  node,
  topicId,
  resources,
  open,
  onClose,
}: NodeDetailPanelProps) {
  if (!node) return null

  const masteryLabel = MASTERY_LABELS[node.mastery as MasteryLevel] ?? "Unknown"

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{node.name}</SheetTitle>
          <SheetDescription>{node.description}</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div className="flex items-center gap-3">
            <Badge
              className="text-xs"
              style={{
                backgroundColor: `var(--mastery-${node.mastery.replace("_", "-")})`,
                color: "white",
              }}
            >
              {masteryLabel}
            </Badge>
            {node.score > 0 && (
              <span className="font-mono text-sm text-muted-foreground">
                Score: {node.score}/15
              </span>
            )}
            <span className="text-sm text-muted-foreground">
              Difficulty: {node.difficulty}/5
            </span>
          </div>

          <div className="flex gap-2">
            <Button asChild className="flex-1">
              <Link href={`/topic/${topicId}/study/${node.id}`}>
                <BookOpen className="mr-2 h-4 w-4" />
                Study
              </Link>
            </Button>
            <Button asChild variant="secondary" className="flex-1">
              <Link href={`/topic/${topicId}/teach/${node.id}`}>
                <MessageCircle className="mr-2 h-4 w-4" />
                Teach the Duck
              </Link>
            </Button>
          </div>

          {resources.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Curated Resources</h4>
              {resources.map((r) => (
                <a
                  key={r.id}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium">{r.title}</p>
                      {r.description && (
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                          {r.description}
                        </p>
                      )}
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {r.type}
                    </Badge>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
