"use client"

import { useCallback, useRef, useState, useEffect } from "react"
import dynamic from "next/dynamic"
import {
  FORCE_CONFIG,
  getNodeRadius,
  getNodeColor,
  type GraphNode,
  type GraphLink,
} from "./graph-config"

const ForceGraph = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
})

interface KnowledgeGraphProps {
  nodes: GraphNode[]
  links: GraphLink[]
  onNodeClick?: (node: GraphNode) => void
}

export function KnowledgeGraph({
  nodes,
  links,
  onNodeClick,
}: KnowledgeGraphProps) {
  const graphRef = useRef<unknown>(null)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })

  useEffect(() => {
    function updateDimensions() {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight - 120,
      })
    }
    updateDimensions()
    window.addEventListener("resize", updateDimensions)
    return () => window.removeEventListener("resize", updateDimensions)
  }, [])

  const paintNode = useCallback(
    (node: GraphNode, ctx: CanvasRenderingContext2D) => {
      const radius = getNodeRadius(node.difficulty)
      const color = getNodeColor(node.mastery)
      const x = node.x ?? 0
      const y = node.y ?? 0
      const isHovered = hoveredNode === node.id
      const isDimmed = hoveredNode !== null && !isHovered

      ctx.globalAlpha = isDimmed ? 0.15 : 1

      if (node.mastery === "mastered") {
        ctx.beginPath()
        ctx.arc(x, y, radius + 3, 0, 2 * Math.PI)
        ctx.fillStyle = color
        ctx.globalAlpha = isDimmed ? 0.05 : 0.2
        ctx.fill()
        ctx.globalAlpha = isDimmed ? 0.15 : 1
      }

      ctx.beginPath()
      ctx.arc(x, y, isHovered ? radius * 1.3 : radius, 0, 2 * Math.PI)
      ctx.fillStyle = color
      ctx.fill()

      const label = node.name
      const fontSize = isHovered ? 11 : 9
      ctx.font = `${isHovered ? "600" : "400"} ${fontSize}px Inter, sans-serif`
      ctx.fillStyle = isDimmed ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.85)"
      ctx.textAlign = "center"
      ctx.textBaseline = "top"
      ctx.fillText(label, x, y + radius + 4)

      ctx.globalAlpha = 1
    },
    [hoveredNode]
  )

  const handleNodeHover = useCallback((node: GraphNode | null) => {
    setHoveredNode(node?.id ?? null)
  }, [])

  const handleNodeClick = useCallback(
    (node: GraphNode) => {
      onNodeClick?.(node)
    },
    [onNodeClick]
  )

  return (
    <div className="relative h-full w-full rounded-lg bg-background">
      <ForceGraph
        ref={graphRef as React.RefObject<never>}
        graphData={{ nodes, links }}
        width={dimensions.width}
        height={dimensions.height}
        nodeCanvasObject={paintNode as never}
        nodePointerAreaPaint={((node: GraphNode, color: string, ctx: CanvasRenderingContext2D) => {
          const radius = getNodeRadius(node.difficulty)
          ctx.beginPath()
          ctx.arc(node.x ?? 0, node.y ?? 0, radius + 4, 0, 2 * Math.PI)
          ctx.fillStyle = color
          ctx.fill()
        }) as never}
        onNodeHover={handleNodeHover as never}
        onNodeClick={handleNodeClick as never}
        linkColor={() =>
          hoveredNode ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.12)"
        }
        linkWidth={1}
        linkDirectionalArrowLength={6}
        linkDirectionalArrowRelPos={1}
        d3AlphaDecay={FORCE_CONFIG.d3AlphaDecay}
        d3VelocityDecay={FORCE_CONFIG.d3VelocityDecay}
        cooldownTime={FORCE_CONFIG.cooldownTime}
        warmupTicks={FORCE_CONFIG.warmupTicks}
        backgroundColor="transparent"
        enableNodeDrag
        enableZoomInteraction
        enablePanInteraction
      />
    </div>
  )
}
