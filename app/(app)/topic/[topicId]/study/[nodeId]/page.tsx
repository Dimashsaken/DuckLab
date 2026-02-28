"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ArrowLeft,
  ExternalLink,
  MessageCircle,
  Video,
  FileText,
  GraduationCap,
  Headphones,
  File,
} from "lucide-react"

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

interface Resource {
  id: string
  title: string
  url: string
  type: string
  description: string | null
  quality_score: number | null
}

export default function StudyPage() {
  const params = useParams<{ topicId: string; nodeId: string }>()
  const [concept, setConcept] = useState<Concept | null>(null)
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()

      const { data: conceptData } = await supabase
        .from("concepts")
        .select("*")
        .eq("id", params.nodeId)
        .single()

      if (conceptData) setConcept(conceptData)

      const { data: resourceData } = await supabase
        .from("resources")
        .select("*")
        .eq("concept_id", params.nodeId)
        .order("quality_score", { ascending: false })

      setResources(resourceData ?? [])
      setLoading(false)
    }

    load()
  }, [params.nodeId])

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-full" />
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    )
  }

  if (!concept) return <p>Concept not found</p>

  return (
    <div className="mx-auto max-w-2xl space-y-6">
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

      {resources.length > 0 ? (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Curated Resources</h2>
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
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No resources curated yet. They will appear once processed.
          </CardContent>
        </Card>
      )}

      <div className="pt-4">
        <Button asChild size="lg" className="w-full">
          <Link href={`/topic/${params.topicId}/teach/${params.nodeId}`}>
            <MessageCircle className="mr-2 h-5 w-5" />
            Ready? Teach the Duck
          </Link>
        </Button>
      </div>
    </div>
  )
}
