"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ChevronRight,
  ChevronLeft,
  BookOpen,
  MessageCircle,
  CheckCircle2,
  Code2,
  Globe,
  Lightbulb,
  BrainCircuit,
  Sparkles,
} from "lucide-react"
import Link from "next/link"
import { MermaidDiagram } from "./mermaid-diagram"
import { PredictionPrompt } from "./prediction-prompt"
import { MiniChallenge } from "./mini-challenge"
import { MisconceptionCard } from "./misconception-card"
import { ConfidenceCheck } from "./confidence-check"
import type { StudyCourse } from "@/lib/schemas/study-course"

const TIER_CONFIG: Record<string, { label: string; color: string }> = {
  intuition: { label: "Intuition", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  definition: { label: "Definition", color: "text-sky-400 bg-sky-500/10 border-sky-500/20" },
  example: { label: "Example", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  application: { label: "Application", color: "text-violet-400 bg-violet-500/10 border-violet-500/20" },
  edge_case: { label: "Edge Case", color: "text-rose-400 bg-rose-500/10 border-rose-500/20" },
  connection: { label: "Connection", color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" },
  summary: { label: "Summary", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
}

interface CourseViewerProps {
  course: StudyCourse
  topicId: string
  nodeId: string
  conceptTitle: string
}

export function CourseViewer({ course, topicId, nodeId, conceptTitle }: CourseViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [confidences, setConfidences] = useState<Record<number, number>>({})
  const [feedbacks, setFeedbacks] = useState<Record<number, string>>({})
  const [feedbackLoading, setFeedbackLoading] = useState<Record<number, boolean>>({})

  const mod = course.modules[currentIndex]
  const total = course.modules.length
  const isLast = currentIndex === total - 1
  const tierCfg = TIER_CONFIG[mod.difficulty_tier] ?? { label: "Module", color: "text-foreground/60 bg-foreground/5 border-foreground/10" }

  const handleConfidence = useCallback(
    async (level: number) => {
      setConfidences((prev) => ({ ...prev, [currentIndex]: level }))
      setFeedbackLoading((prev) => ({ ...prev, [currentIndex]: true }))
      setFeedbacks((prev) => {
        const next = { ...prev }
        delete next[currentIndex]
        return next
      })

      try {
        const currentMod = course.modules[currentIndex]
        const res = await fetch("/api/agents/confidence-feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            moduleTitle: currentMod.title,
            moduleContent: currentMod.content,
            confidenceLevel: level,
            conceptTitle,
          }),
        })

        if (res.ok) {
          const data = await res.json()
          setFeedbacks((prev) => ({ ...prev, [currentIndex]: data.feedback }))
        }
      } catch {
        // Silently fail — feedback is supplementary
      } finally {
        setFeedbackLoading((prev) => ({ ...prev, [currentIndex]: false }))
      }
    },
    [currentIndex, course.modules, conceptTitle]
  )

  const contentParagraphs = mod.content
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean)

  return (
    <div className="space-y-6">
      {/* Progress — segment bar with labels */}
      <div className="space-y-3">
        <div className="flex gap-1">
          {course.modules.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                i === currentIndex
                  ? "bg-foreground/60 scale-y-125"
                  : i < currentIndex
                    ? "bg-foreground/20"
                    : "bg-foreground/[0.06]"
              }`}
            />
          ))}
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-xs text-muted-foreground/50">
            <BookOpen className="h-3 w-3" />
            {currentIndex + 1} of {total}
          </span>
          <Badge
            variant="outline"
            className={`h-5 border text-[10px] font-medium ${tierCfg.color}`}
          >
            {tierCfg.label}
          </Badge>
        </div>
      </div>

      {/* Module content */}
      <AnimatePresence mode="wait">
        <motion.article
          key={mod.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="space-y-7"
        >
          {/* Module header */}
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground/40">
              Module {currentIndex + 1}
            </p>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              {mod.title}
            </h2>
          </div>

          {/* Main content — split into paragraphs */}
          <div className="space-y-4">
            {contentParagraphs.map((paragraph, i) => (
              <p
                key={i}
                className="text-[15px] leading-[1.85] text-foreground/85"
              >
                {paragraph}
              </p>
            ))}
          </div>

          {/* Key Takeaways */}
          {mod.key_takeaways.length > 0 && (
            <div className="rounded-xl bg-emerald-500/[0.06] border border-emerald-500/[0.1] p-5">
              <div className="flex items-center gap-2.5 mb-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/15">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400/80">
                  Key Takeaways
                </span>
              </div>
              <ul className="space-y-2.5">
                {mod.key_takeaways.map((takeaway, i) => (
                  <li key={i} className="flex items-start gap-3 text-[14px] leading-relaxed text-foreground/75">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400/50" />
                    <span>{takeaway}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Analogy */}
          {mod.analogy && (
            <div className="rounded-xl bg-amber-500/[0.06] border border-amber-500/[0.1] p-5">
              <div className="flex items-center gap-2.5 mb-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/15">
                  <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-400/80">
                  Think of it this way
                </span>
              </div>
              <p className="text-[14.5px] leading-[1.75] text-foreground/75 italic">
                {mod.analogy}
              </p>
            </div>
          )}

          {/* Visual */}
          {mod.visual && mod.visual.type === "mermaid" && (
            <MermaidDiagram code={mod.visual.code} caption={mod.visual.caption} />
          )}
          {mod.visual && mod.visual.type === "ascii" && (
            <div className="space-y-2">
              <pre className="overflow-x-auto rounded-xl bg-foreground/[0.04] border border-foreground/[0.08] p-5 font-mono text-xs leading-relaxed text-foreground/60">
                {mod.visual.code}
              </pre>
              <p className="text-center text-xs text-muted-foreground/40 italic">
                {mod.visual.caption}
              </p>
            </div>
          )}
          {mod.visual && mod.visual.type === "description" && (
            <div className="rounded-xl bg-foreground/[0.03] border border-foreground/[0.07] p-5">
              <p className="text-sm text-foreground/60 italic leading-relaxed">
                {mod.visual.code}
              </p>
              {mod.visual.caption && (
                <p className="mt-2 text-xs text-muted-foreground/40">{mod.visual.caption}</p>
              )}
            </div>
          )}

          {/* Code Example */}
          {mod.code_example && (
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-500/15">
                  <Code2 className="h-3.5 w-3.5 text-sky-400" />
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-sky-400/80">
                  Code Example
                </span>
                {mod.code_example.language && (
                  <span className="text-[10px] font-mono text-muted-foreground/35 ml-1">
                    {mod.code_example.language}
                  </span>
                )}
              </div>
              <pre className="overflow-x-auto rounded-xl bg-[#0d1117] border border-foreground/[0.08] p-5 font-mono text-[13px] leading-[1.7] text-foreground/80">
                {mod.code_example.code}
              </pre>
              {mod.code_example.explanation && (
                <p className="text-[13px] text-muted-foreground/55 leading-relaxed pl-1">
                  {mod.code_example.explanation}
                </p>
              )}
            </div>
          )}

          {/* Real-World Example */}
          {mod.real_world_example && (
            <div className="rounded-xl bg-sky-500/[0.06] border border-sky-500/[0.1] p-5">
              <div className="flex items-center gap-2.5 mb-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-500/15">
                  <Globe className="h-3.5 w-3.5 text-sky-400" />
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-sky-400/80">
                  In the Real World
                </span>
              </div>
              <p className="text-[14.5px] leading-[1.75] text-foreground/75">
                {mod.real_world_example}
              </p>
            </div>
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
            <div className="rounded-xl bg-violet-500/[0.06] border border-violet-500/[0.1] p-5">
              <div className="flex items-center gap-2.5 mb-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-500/15">
                  <BrainCircuit className="h-3.5 w-3.5 text-violet-400" />
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-violet-400/80">
                  Think Deeper
                </span>
              </div>
              <p className="text-[15px] font-medium leading-[1.75] text-foreground/80">
                {mod.why_question}
              </p>
            </div>
          )}

          {/* Mini challenges */}
          {mod.mini_challenges.length > 0 && (
            <div className="space-y-4">
              {mod.mini_challenges.map((challenge, i) => (
                <MiniChallenge key={i} data={challenge} index={i} />
              ))}
            </div>
          )}

          {/* Confidence check — LAST MODULE ONLY */}
          {isLast && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-3 justify-center">
                <div className="h-px flex-1 bg-foreground/[0.06]" />
                <div className="flex items-center gap-2 text-xs text-muted-foreground/40">
                  <Sparkles className="h-3 w-3" />
                  <span className="font-medium uppercase tracking-wider">Final Check</span>
                  <Sparkles className="h-3 w-3" />
                </div>
                <div className="h-px flex-1 bg-foreground/[0.06]" />
              </div>
              <ConfidenceCheck
                onSelect={handleConfidence}
                selected={confidences[currentIndex] ?? null}
                feedback={feedbacks[currentIndex] ?? null}
                isLoading={feedbackLoading[currentIndex] ?? false}
              />
            </div>
          )}
        </motion.article>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center gap-3 pt-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
          className="flex-1 text-muted-foreground/50 hover:text-foreground/70"
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
    </div>
  )
}
