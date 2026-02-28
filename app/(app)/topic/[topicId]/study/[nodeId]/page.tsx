"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { CourseViewer } from "@/components/study/course-viewer"
import {
  ArrowLeft,
  ExternalLink,
  MessageCircle,
  Video,
  FileText,
  GraduationCap,
  Headphones,
  File,
  Loader2,
  BookOpen,
  AlertCircle,
  RotateCcw,
  RefreshCw,
} from "lucide-react"
import type { StudyCourse } from "@/lib/schemas/study-course"

const TYPE_ICONS: Record<string, React.ReactNode> = {
  video: <Video className="h-4 w-4" />,
  article: <FileText className="h-4 w-4" />,
  paper: <File className="h-4 w-4" />,
  course: <GraduationCap className="h-4 w-4" />,
  podcast: <Headphones className="h-4 w-4" />,
}

interface Concept {
  id: string
  title: string
  description: string
  difficulty: number
  topic_id: string
}

interface Topic {
  id: string
  title: string
}

interface Resource {
  id: string
  title: string
  url: string
  type: string
  description: string | null
  quality_score: number | null
}

type CourseState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "generating" }
  | { status: "ready"; course: StudyCourse }
  | { status: "error"; message: string }

interface GraphNeighbors {
  prerequisites: string[]
  nextConcepts: string[]
}

export default function StudyPage() {
  const params = useParams<{ topicId: string; nodeId: string }>()
  const [concept, setConcept] = useState<Concept | null>(null)
  const [topic, setTopic] = useState<Topic | null>(null)
  const [resources, setResources] = useState<Resource[]>([])
  const [neighbors, setNeighbors] = useState<GraphNeighbors>({ prerequisites: [], nextConcepts: [] })
  const [loading, setLoading] = useState(true)
  const [courseState, setCourseState] = useState<CourseState>({ status: "loading" })

  useEffect(() => {
    async function load() {
      const supabase = createClient()

      const [conceptRes, topicRes, resourceRes, allConceptsRes, edgesRes] = await Promise.all([
        supabase
          .from("concepts")
          .select("*")
          .eq("id", params.nodeId)
          .single(),
        supabase
          .from("topics")
          .select("id, title")
          .eq("id", params.topicId)
          .single(),
        supabase
          .from("resources")
          .select("*")
          .eq("concept_id", params.nodeId)
          .order("quality_score", { ascending: false }),
        supabase
          .from("concepts")
          .select("id, title")
          .eq("topic_id", params.topicId),
        supabase
          .from("concept_edges")
          .select("source_id, target_id")
          .eq("topic_id", params.topicId),
      ])

      if (conceptRes.data) setConcept(conceptRes.data)
      if (topicRes.data) setTopic(topicRes.data)
      setResources(resourceRes.data ?? [])

      if (allConceptsRes.data && edgesRes.data) {
        const titleMap = new Map(allConceptsRes.data.map((c) => [c.id, c.title]))
        const prereqIds = edgesRes.data
          .filter((e) => e.target_id === params.nodeId)
          .map((e) => e.source_id)
        const nextIds = edgesRes.data
          .filter((e) => e.source_id === params.nodeId)
          .map((e) => e.target_id)
        setNeighbors({
          prerequisites: prereqIds.map((id) => titleMap.get(id)).filter(Boolean) as string[],
          nextConcepts: nextIds.map((id) => titleMap.get(id)).filter(Boolean) as string[],
        })
      }

      setLoading(false)

      // Load saved course
      try {
        const savedRes = await fetch(
          `/api/agents/study-course?conceptId=${params.nodeId}`
        )
        if (savedRes.ok) {
          const { course } = await savedRes.json()
          if (course) {
            setCourseState({ status: "ready", course })
            return
          }
        }
      } catch {
        // Failed to load saved — fall through to idle
      }

      setCourseState({ status: "idle" })
    }

    load()
  }, [params.nodeId, params.topicId])

  const generateCourse = useCallback(async () => {
    if (!concept || !topic) return
    setCourseState({ status: "generating" })

    try {
      const res = await fetch("/api/agents/study-course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conceptId: concept.id,
          conceptTitle: concept.title,
          conceptDescription: concept.description,
          topicTitle: topic.title,
          prerequisites: neighbors.prerequisites,
          nextConcepts: neighbors.nextConcepts,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `Failed (${res.status})`)
      }

      const course: StudyCourse = await res.json()
      setCourseState({ status: "ready", course })
    } catch (err) {
      setCourseState({
        status: "error",
        message: err instanceof Error ? err.message : "Something went wrong",
      })
    }
  }, [concept, topic, neighbors])

  // if (loading) {
  //   return (
  //     <div className="mx-auto max-w-2xl space-y-4">
  //       <Skeleton className="h-8 w-64" />
  //       <Skeleton className="h-4 w-full" />
  //       <div className="space-y-3">
  //         <Skeleton className="h-24 w-full" />
  //         <Skeleton className="h-24 w-full" />
  //         <Skeleton className="h-24 w-full" />
  //       </div>
  //     </div>
  //   )
  // }

  if (!concept) return

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <Link
          href={`/topic/${params.topicId}`}
          className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to graph
        </Link>
        <h1 className="text-2xl font-bold">{concept.title}</h1>
        <p className="mt-1 text-muted-foreground">{concept.description}</p>
      </div>

      {/* Loading saved course */}
      {courseState.status === "loading" && (
        <Card>
          <CardContent className="flex items-center justify-center gap-3 py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Loading saved course...</span>
          </CardContent>
        </Card>
      )}

      {/* Interactive Course Section */}
      {courseState.status === "idle" && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="space-y-4 py-6 text-center">
            <BookOpen className="mx-auto h-10 w-10 text-primary/60" />
            <div>
              <h2 className="text-lg font-semibold">
                Interactive Micro-Course
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                AI-generated lesson with visual diagrams, prediction prompts,
                misconception inoculation, and mini-challenges. Powered by
                verified web research.
              </p>
            </div>
            <Button onClick={generateCourse} size="lg">
              <BookOpen className="mr-2 h-5 w-5" />
              Generate Course
            </Button>
          </CardContent>
        </Card>
      )}

      {courseState.status === "generating" && (
        <Card>
          <CardContent className="space-y-5 py-8">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <div className="text-center">
                <p className="font-medium">Generating your micro-course...</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Searching the web for verified facts, then building an
                  interactive lesson with 7 learning techniques.
                </p>
              </div>
            </div>
            <GeneratingProgress />
            <div className="space-y-2">
              {[
                "Searching for explanations, principles & applications...",
                "Gathering misconceptions & practical examples...",
                "Designing course outline with progressive scaffolding...",
                "Writing in-depth module content with citations...",
                "Adding code examples, visuals & challenges...",
                "Assembling final course with key takeaways...",
              ].map((step, i) => (
                <GeneratingStep key={i} text={step} delay={i * 3} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {courseState.status === "error" && (
        <Card className="border-red-500/30">
          <CardContent className="space-y-4 py-6 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-red-400" />
            <div>
              <p className="font-medium text-red-300">Generation failed</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {courseState.message}
              </p>
            </div>
            <Button onClick={generateCourse} variant="outline">
              <RotateCcw className="mr-2 h-4 w-4" />
              Try again
            </Button>
          </CardContent>
        </Card>
      )}

      {courseState.status === "ready" && (
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">
                {courseState.course.course_title}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {courseState.course.overview}
              </p>
            </div>
            <Button
              onClick={generateCourse}
              variant="ghost"
              size="sm"
              className="shrink-0 text-muted-foreground/50 hover:text-foreground/70"
              title="Regenerate course"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          </div>
          <CourseViewer
            course={courseState.course}
            topicId={params.topicId}
            nodeId={params.nodeId}
            conceptTitle={concept.title}
          />
        </div>
      )}

      {/* Curated Resources (supplementary) */}
      {resources.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Supplementary Resources</h2>
          {resources.map((r) => (
            <Card key={r.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {TYPE_ICONS[r.type] ?? <File className="h-4 w-4" />}
                    <CardTitle className="text-base">{r.title}</CardTitle>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {r.type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {r.description && (
                  <p className="mb-3 text-sm text-muted-foreground">
                    {r.description}
                  </p>
                )}
                <Button asChild size="sm" variant="outline">
                  <a href={r.url} target="_blank" rel="noopener noreferrer">
                    Open resource
                    <ExternalLink className="ml-2 h-3.5 w-3.5" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Fallback Teach the Duck button (when course not generated) */}
      {courseState.status !== "ready" && courseState.status !== "loading" && (
        <div className="pt-4">
          <Button asChild size="lg" className="w-full">
            <Link href={`/topic/${params.topicId}/teach/${params.nodeId}`}>
              <MessageCircle className="mr-2 h-5 w-5" />
              Ready? Teach the Duck
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}

const PROGRESS_PHASES = [
  { label: "Searching 5 web sources…", target: 15, duration: 8000 },
  { label: "Analyzing reference material…", target: 30, duration: 8000 },
  { label: "Designing course outline…", target: 45, duration: 10000 },
  { label: "Generating in-depth modules…", target: 70, duration: 20000 },
  { label: "Adding examples & citations…", target: 85, duration: 15000 },
  { label: "Finalizing course…", target: 94, duration: 15000 },
]

function GeneratingProgress() {
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    let cancelled = false
    let currentPhase = 0
    let currentProgress = 0

    function runPhase() {
      if (cancelled || currentPhase >= PROGRESS_PHASES.length) return
      const { target, duration } = PROGRESS_PHASES[currentPhase]
      const increment = (target - currentProgress) / (duration / 100)

      const interval = setInterval(() => {
        if (cancelled) { clearInterval(interval); return }
        currentProgress = Math.min(currentProgress + increment, target)
        setProgress(Math.round(currentProgress))

        if (currentProgress >= target) {
          clearInterval(interval)
          currentPhase++
          setPhase(currentPhase)
          runPhase()
        }
      }, 100)
    }

    runPhase()
    return () => { cancelled = true }
  }, [])

  const label =
    phase < PROGRESS_PHASES.length
      ? PROGRESS_PHASES[phase].label
      : "Almost there…"

  return (
    <div className="space-y-2">
      <Progress value={progress} className="h-2.5" />
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <span>{progress}%</span>
      </div>
    </div>
  )
}

function GeneratingStep({ text, delay }: { text: string; delay: number }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay * 1000)
    return () => clearTimeout(timer)
  }, [delay])

  if (!visible) return null

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-pulse" />
      {text}
    </div>
  )
}
