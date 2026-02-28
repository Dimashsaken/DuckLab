"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  ChevronRight,
  ChevronLeft,
  BookOpen,
  MessageCircle,
} from "lucide-react"
import Link from "next/link"
import { MermaidDiagram } from "./mermaid-diagram"
import { PredictionPrompt } from "./prediction-prompt"
import { MiniChallenge } from "./mini-challenge"
import { MisconceptionCard } from "./misconception-card"
import { ConfidenceCheck } from "./confidence-check"
import { AnalogyBlock } from "./analogy-block"
import type { StudyCourse } from "@/lib/schemas/study-course"

const TIER_LABELS: Record<string, { label: string; color: string }> = {
  intuition: { label: "Intuition", color: "bg-violet-500/20 text-violet-300" },
  definition: { label: "Definition", color: "bg-blue-500/20 text-blue-300" },
  example: { label: "Example", color: "bg-green-500/20 text-green-300" },
  edge_case: { label: "Edge Case", color: "bg-amber-500/20 text-amber-300" },
  connection: { label: "Connection", color: "bg-cyan-500/20 text-cyan-300" },
}

interface CourseViewerProps {
  course: StudyCourse
  topicId: string
  nodeId: string
}

export function CourseViewer({ course, topicId, nodeId }: CourseViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [confidences, setConfidences] = useState<Record<number, number>>({})

  const mod = course.modules[currentIndex]
  const total = course.modules.length
  const progress = ((currentIndex + 1) / total) * 100
  const isLast = currentIndex === total - 1
  const tier = TIER_LABELS[mod.difficulty_tier] ?? TIER_LABELS.definition

  const handleConfidence = useCallback(
    (level: number) => {
      setConfidences((prev) => ({ ...prev, [currentIndex]: level }))
    },
    [currentIndex]
  )

  return (
    <div className="space-y-4">
      {/* Progress header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5" />
            Module {currentIndex + 1} of {total}
          </span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <Progress value={progress} className="h-1.5" />
      </div>

      {/* Module content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={mod.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
          className="space-y-4"
        >
          {/* Module header */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-lg">{mod.title}</CardTitle>
                <Badge className={tier.color}>{tier.label}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Main content */}
              <div className="prose prose-sm prose-invert max-w-none">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                  {mod.content}
                </p>
              </div>

              {/* Analogy */}
              {mod.analogy && <AnalogyBlock text={mod.analogy} />}

              {/* Visual */}
              {mod.visual && mod.visual.type === "mermaid" && (
                <MermaidDiagram code={mod.visual.code} caption={mod.visual.caption} />
              )}
              {mod.visual && mod.visual.type === "ascii" && (
                <div className="space-y-2">
                  <Card className="border-border/50 bg-muted/20">
                    <CardContent className="py-4">
                      <pre className="overflow-x-auto whitespace-pre font-mono text-xs text-foreground/80">
                        {mod.visual.code}
                      </pre>
                    </CardContent>
                  </Card>
                  <p className="text-center text-xs text-muted-foreground italic">
                    {mod.visual.caption}
                  </p>
                </div>
              )}
              {mod.visual && mod.visual.type === "description" && (
                <Card className="border-border/50 bg-muted/20">
                  <CardContent className="py-4">
                    <p className="text-sm italic text-muted-foreground">
                      {mod.visual.code}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {mod.visual.caption}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Misconception */}
              {mod.misconception && (
                <MisconceptionCard data={mod.misconception} />
              )}

              {/* Prediction prompt */}
              {mod.prediction_prompt && (
                <PredictionPrompt data={mod.prediction_prompt} />
              )}

              {/* Why question */}
              {mod.why_question && (
                <Card className="border-sky-500/30 bg-sky-500/5">
                  <CardContent className="py-4">
                    <p className="text-xs font-medium uppercase tracking-wider text-sky-400">
                      Think deeper
                    </p>
                    <p className="mt-1 text-sm font-medium text-sky-100/90">
                      {mod.why_question}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Mini challenges */}
              {mod.mini_challenges.length > 0 && (
                <div className="space-y-3">
                  {mod.mini_challenges.map((challenge, i) => (
                    <MiniChallenge key={i} data={challenge} index={i} />
                  ))}
                </div>
              )}

              {/* Confidence check */}
              <ConfidenceCheck
                onSelect={handleConfidence}
                selected={confidences[currentIndex] ?? null}
              />
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
          className="flex-1"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Previous
        </Button>

        {!isLast ? (
          <Button
            size="sm"
            onClick={() => setCurrentIndex((i) => Math.min(total - 1, i + 1))}
            className="flex-1"
          >
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        ) : (
          <Button asChild size="sm" className="flex-1">
            <Link href={`/topic/${topicId}/teach/${nodeId}`}>
              <MessageCircle className="mr-2 h-4 w-4" />
              Ready? Teach the Duck
            </Link>
          </Button>
        )}
      </div>

      {/* Module dots */}
      <div className="flex items-center justify-center gap-1.5">
        {course.modules.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`h-2 w-2 rounded-full transition-all ${
              i === currentIndex
                ? "scale-125 bg-primary"
                : i < currentIndex
                  ? "bg-primary/40"
                  : "bg-muted-foreground/30"
            }`}
          />
        ))}
      </div>
    </div>
  )
}
