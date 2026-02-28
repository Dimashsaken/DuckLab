"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { KnowledgeGraph } from "@/components/graph/knowledge-graph"
import { NodeDetailPanel } from "@/components/graph/node-detail-panel"
import { GraphSkeleton } from "@/components/shared/loading-skeleton"
import { Badge } from "@/components/ui/badge"
import { NODE_STATE_COLORS, type GraphNode, type GraphLink } from "@/components/graph/graph-config"

interface Resource {
  id: string
  title: string
  url: string
  type: string
  description: string | null
  quality_score: number | null
}

export default function TopicPage() {
  const params = useParams<{ topicId: string }>()
  const [topic, setTopic] = useState<{
    id: string
    title: string
    status: string
  } | null>(null)
  const [nodes, setNodes] = useState<GraphNode[]>([])
  const [links, setLinks] = useState<GraphLink[]>([])
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadGraph() {
      const supabase = createClient()

      const { data: topicData } = await supabase
        .from("topics")
        .select("*")
        .eq("id", params.topicId)
        .single()

      if (topicData) setTopic(topicData)

      const { data: concepts } = await supabase
        .from("concepts")
        .select("*")
        .eq("topic_id", params.topicId)

      const { data: edges } = await supabase
        .from("concept_edges")
        .select("*")
        .eq("topic_id", params.topicId)

      if (concepts) {
        setNodes(
          concepts.map((c) => ({
            id: c.id,
            name: c.title,
            mastery: c.mastery_level ?? "not_started",
            score: c.mastery_score ?? 0,
            difficulty: c.difficulty ?? 1,
            description: c.description,
          }))
        )
      }

      if (edges) {
        setLinks(
          edges.map((e) => ({
            source: e.source_id,
            target: e.target_id,
          }))
        )
      }

      setLoading(false)
    }

    loadGraph()
  }, [params.topicId])

  const handleNodeClick = useCallback(
    async (node: GraphNode) => {
      setSelectedNode(node)
      const supabase = createClient()
      const { data } = await supabase
        .from("resources")
        .select("*")
        .eq("concept_id", node.id)
        .order("quality_score", { ascending: false })

      setResources(data ?? [])

      if (!data || data.length === 0) {
        try {
          await fetch("/api/agents/curate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              conceptId: node.id,
              conceptTitle: node.name,
              conceptDescription: node.description,
              topicTitle: topic?.title,
            }),
          })
          const { data: freshResources } = await supabase
            .from("resources")
            .select("*")
            .eq("concept_id", node.id)
            .order("quality_score", { ascending: false })

          setResources(freshResources ?? [])
        } catch {
          // silently fail — resources are non-critical
        }
      }
    },
    [topic]
  )

  const mastered = useMemo(
    () => nodes.filter((n) => n.mastery === "mastered").length,
    [nodes]
  )

  const handleClosePanel = useCallback(() => setSelectedNode(null), [])

  // if (loading) return <GraphSkeleton />

  return (
    <div className="relative -mx-4 -mt-6 flex h-[calc(100vh-3.5rem)] flex-col">
      <div className="flex items-center justify-between border-b border-border bg-background/80 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold">{topic?.title}</h1>
          <Badge variant="outline" className="font-mono text-xs">
            {mastered}/{nodes.length} mastered
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            {(
              [
                ["start_here", "Start"],
                ["unlocked", "Ready"],
                ["in_progress", "Learning"],
                ["completed", "Mastered"],
                ["locked", "Locked"],
              ] as const
            ).map(([state, label]) => (
              <div key={state} className="flex items-center gap-1">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{
                    backgroundColor: NODE_STATE_COLORS[state],
                    opacity: state === "locked" ? 0.5 : 1,
                  }}
                />
                <span className="text-[11px] text-muted-foreground">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1">
        <KnowledgeGraph
          nodes={nodes}
          links={links}
          onNodeClick={handleNodeClick}
        />
      </div>

      <NodeDetailPanel
        node={selectedNode}
        topicId={params.topicId}
        resources={resources}
        open={!!selectedNode}
        onClose={handleClosePanel}
      />
    </div>
  )
}
