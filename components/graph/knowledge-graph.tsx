"use client"

import { useCallback, useRef, useEffect, useMemo, useState } from "react"
import dynamic from "next/dynamic"
import {
  FORCE_CONFIG,
  getNodeRadius,
  getNodeColor,
  computeInitialPositions,
  getSuggestedNext,
  type GraphNode,
  type GraphLink,
} from "./graph-config"
import * as d3Force from "d3-force"
import { Sparkles, ArrowRight } from "lucide-react"

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
  const hoveredNodeRef = useRef<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const dimensionsRef = useRef({ width: 800, height: 600 })
  const hasZoomedRef = useRef(false)
  const animFrameRef = useRef<number>(0)
  const timeRef = useRef(0)
  const [suggestedNode, setSuggestedNode] = useState<GraphNode | null>(null)

  const graphData = useMemo(() => {
    const positioned = computeInitialPositions(
      nodes.map((n) => ({ ...n })),
      links,
      dimensionsRef.current.width,
      dimensionsRef.current.height
    )
    setSuggestedNode(getSuggestedNext(positioned))
    return { nodes: positioned, links: [...links] }
  }, [nodes, links])

  useEffect(() => {
    function updateDimensions() {
      dimensionsRef.current = {
        width: window.innerWidth,
        height: window.innerHeight - 120,
      }
    }
    updateDimensions()
    window.addEventListener("resize", updateDimensions)
    return () => window.removeEventListener("resize", updateDimensions)
  }, [])

  useEffect(() => {
    const fg = graphRef.current as unknown as {
      d3Force: (name: string, force?: unknown) => unknown
    } | null
    if (!fg) return

    fg.d3Force(
      "charge",
      d3Force
        .forceManyBody()
        .strength(FORCE_CONFIG.chargeStrength)
        .distanceMax(FORCE_CONFIG.chargeDistanceMax)
    )
    fg.d3Force(
      "link",
      d3Force
        .forceLink()
        .distance(FORCE_CONFIG.linkDistance)
        .strength(FORCE_CONFIG.linkStrength)
    )
    fg.d3Force(
      "center",
      d3Force.forceCenter().strength(FORCE_CONFIG.centerStrength)
    )
    fg.d3Force(
      "collide",
      d3Force
        .forceCollide()
        .radius((node: unknown) => {
          const n = node as GraphNode
          return getNodeRadius(n.difficulty) + FORCE_CONFIG.collideRadius
        })
        .strength(FORCE_CONFIG.collideStrength)
        .iterations(3)
    )
  }, [graphData])

  useEffect(() => {
    function tick() {
      timeRef.current = Date.now()
      const fg = graphRef.current as unknown as { refresh: () => void } | null
      fg?.refresh()
      animFrameRef.current = requestAnimationFrame(tick)
    }
    animFrameRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(animFrameRef.current)
  }, [])

  const handleEngineStop = useCallback(() => {
    if (hasZoomedRef.current) return
    hasZoomedRef.current = true
    const fg = graphRef.current as unknown as {
      zoomToFit: (duration?: number, padding?: number) => void
    } | null
    fg?.zoomToFit(FORCE_CONFIG.zoomToFitDuration, FORCE_CONFIG.zoomToFitPadding)
  }, [])

  const paintNode = useCallback(
    (node: unknown, ctx: CanvasRenderingContext2D) => {
      const n = node as GraphNode
      const radius = getNodeRadius(n.difficulty)
      const color = getNodeColor(n)
      const x = n.x ?? 0
      const y = n.y ?? 0
      const isHovered = hoveredNodeRef.current === n.id
      const state = n._state ?? "locked"
      const t = timeRef.current

      const pulse = Math.sin(t * 0.004) * 0.5 + 0.5
      const slowPulse = Math.sin(t * 0.003) * 0.5 + 0.5

      ctx.globalAlpha = state === "locked" ? 0.35 : 1

      if (state === "start_here" || state === "unlocked") {
        const glowRadius = radius + 8 + pulse * 4
        const gradient = ctx.createRadialGradient(x, y, radius, x, y, glowRadius)
        gradient.addColorStop(0, colorWithAlpha(color, 0.25 + pulse * 0.15))
        gradient.addColorStop(1, colorWithAlpha(color, 0))
        ctx.beginPath()
        ctx.arc(x, y, glowRadius, 0, 2 * Math.PI)
        ctx.fillStyle = gradient
        ctx.fill()
      }

      if (state === "completed") {
        ctx.beginPath()
        ctx.arc(x, y, radius + 4, 0, 2 * Math.PI)
        ctx.fillStyle = colorWithAlpha(color, 0.15)
        ctx.fill()
      }

      const drawRadius = isHovered ? radius * 1.25 : radius
      ctx.beginPath()
      ctx.arc(x, y, drawRadius, 0, 2 * Math.PI)
      ctx.fillStyle = color
      ctx.fill()

      if (state === "locked") {
        ctx.setLineDash([3, 3])
        ctx.strokeStyle = "rgba(255,255,255,0.15)"
        ctx.lineWidth = 1
        ctx.stroke()
        ctx.setLineDash([])
      }

      if (isHovered && state !== "locked") {
        ctx.strokeStyle = "rgba(255,255,255,0.5)"
        ctx.lineWidth = 1.5
        ctx.stroke()
      }

      if (state === "completed") {
        ctx.strokeStyle = "rgba(255,255,255,0.9)"
        ctx.lineWidth = 1.8
        ctx.lineCap = "round"
        ctx.lineJoin = "round"
        ctx.beginPath()
        const s = radius * 0.35
        ctx.moveTo(x - s * 0.6, y + s * 0.1)
        ctx.lineTo(x - s * 0.1, y + s * 0.55)
        ctx.lineTo(x + s * 0.7, y - s * 0.4)
        ctx.stroke()
        ctx.lineCap = "butt"
        ctx.lineJoin = "miter"
      }

      if (state === "start_here") {
        const tagY = y - drawRadius - 10
        ctx.font = `700 7px Inter, system-ui, sans-serif`
        const tagText = "START"
        const tagWidth = ctx.measureText(tagText).width
        const tagPad = 3

        ctx.fillStyle = colorWithAlpha(color, 0.7 + slowPulse * 0.3)
        ctx.beginPath()
        roundRect(ctx, x - tagWidth / 2 - tagPad, tagY - 5, tagWidth + tagPad * 2, 12, 3)
        ctx.fill()

        ctx.fillStyle = "rgba(0,0,0,0.85)"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(tagText, x, tagY + 1)
      }

      const label = n.name
      const fontSize = isHovered ? 12 : 10
      const fontWeight = isHovered ? "600" : "400"
      ctx.font = `${fontWeight} ${fontSize}px Inter, system-ui, sans-serif`

      const textWidth = ctx.measureText(label).width
      const labelY = y + drawRadius + 6
      const padding = 4

      ctx.globalAlpha = state === "locked" ? 0.3 : 1

      ctx.fillStyle = "rgba(0,0,0,0.55)"
      const bgHeight = fontSize + 4
      ctx.beginPath()
      roundRect(ctx, x - textWidth / 2 - padding, labelY - 1, textWidth + padding * 2, bgHeight, 3)
      ctx.fill()

      ctx.fillStyle =
        isHovered
          ? "rgba(255,255,255,0.95)"
          : state === "locked"
            ? "rgba(255,255,255,0.5)"
            : "rgba(255,255,255,0.8)"
      ctx.textAlign = "center"
      ctx.textBaseline = "top"
      ctx.fillText(label, x, labelY + 1)

      ctx.globalAlpha = 1
    },
    []
  )

  const paintLink = useCallback(
    (link: unknown, ctx: CanvasRenderingContext2D) => {
      const l = link as { source: GraphNode; target: GraphNode }
      const src = l.source
      const tgt = l.target
      if (!src || !tgt || src.x == null || tgt.x == null) return

      const srcState = src._state ?? "locked"
      const tgtState = tgt._state ?? "locked"
      const t = timeRef.current
      const pulse = Math.sin(t * 0.004) * 0.5 + 0.5

      let color: string
      let width: number
      let glowColor: string | null = null

      if (srcState === "completed" && tgtState === "completed") {
        // Fully completed path — solid green
        color = "rgba(34,197,94,0.35)"
        width = 1.8
        glowColor = "rgba(34,197,94,0.08)"
      } else if (
        srcState === "completed" &&
        (tgtState === "unlocked" || tgtState === "start_here" || tgtState === "in_progress")
      ) {
        // Road just opened — bright pulsing cyan
        const alpha = 0.3 + pulse * 0.35
        color = `rgba(56,189,248,${alpha})`
        width = 2
        glowColor = `rgba(56,189,248,${0.06 + pulse * 0.06})`
      } else if (
        (srcState === "start_here" || srcState === "unlocked") &&
        tgtState === "locked"
      ) {
        // Roads from start/unlocked to locked — show them faintly lit so user sees where it leads
        const alpha = 0.08 + pulse * 0.08
        color = `rgba(96,165,250,${alpha})`
        width = 1.2
      } else if (
        srcState === "in_progress" &&
        (tgtState === "locked" || tgtState === "unlocked")
      ) {
        // Roads from in-progress to next — subtle hint
        const alpha = 0.1 + pulse * 0.1
        color = `rgba(234,179,8,${alpha})`
        width = 1.2
      } else if (tgtState === "locked" && srcState === "locked") {
        // Locked → locked — barely visible
        color = "rgba(255,255,255,0.025)"
        width = 0.4
      } else if (tgtState === "locked") {
        color = "rgba(255,255,255,0.04)"
        width = 0.5
      } else {
        color = "rgba(255,255,255,0.08)"
        width = 1
      }

      const mx = (src.x! + tgt.x!) / 2
      const my = (src.y! + tgt.y!) / 2
      const dx = tgt.x! - src.x!
      const offset = dx === 0 ? 15 : 0

      // Draw glow under the main line for lit-up paths
      if (glowColor) {
        ctx.beginPath()
        ctx.moveTo(src.x!, src.y!)
        ctx.quadraticCurveTo(mx + offset, my, tgt.x!, tgt.y!)
        ctx.strokeStyle = glowColor
        ctx.lineWidth = width + 6
        ctx.stroke()
      }

      ctx.beginPath()
      ctx.moveTo(src.x!, src.y!)
      ctx.quadraticCurveTo(mx + offset, my, tgt.x!, tgt.y!)
      ctx.strokeStyle = color
      ctx.lineWidth = width
      ctx.stroke()

      // Arrow head
      const arrowLen = 6
      const angle = Math.atan2(tgt.y! - my, tgt.x! - mx)
      const targetRadius = getNodeRadius(tgt.difficulty) + 3
      const ax = tgt.x! - Math.cos(angle) * targetRadius
      const ay = tgt.y! - Math.sin(angle) * targetRadius

      ctx.beginPath()
      ctx.moveTo(ax, ay)
      ctx.lineTo(
        ax - arrowLen * Math.cos(angle - Math.PI / 6),
        ay - arrowLen * Math.sin(angle - Math.PI / 6)
      )
      ctx.lineTo(
        ax - arrowLen * Math.cos(angle + Math.PI / 6),
        ay - arrowLen * Math.sin(angle + Math.PI / 6)
      )
      ctx.closePath()
      ctx.fillStyle = color
      ctx.fill()
    },
    []
  )

  const pointerAreaPaint = useCallback(
    (node: unknown, color: string, ctx: CanvasRenderingContext2D) => {
      const n = node as GraphNode
      const radius = getNodeRadius(n.difficulty)
      ctx.beginPath()
      ctx.arc(n.x ?? 0, n.y ?? 0, radius + 6, 0, 2 * Math.PI)
      ctx.fillStyle = color
      ctx.fill()
    },
    []
  )

  const handleNodeHover = useCallback((node: unknown) => {
    const n = node as GraphNode | null
    hoveredNodeRef.current = n?.id ?? null
    if (containerRef.current) {
      const isLocked = n?._state === "locked"
      containerRef.current.style.cursor = n ? (isLocked ? "not-allowed" : "pointer") : "default"
    }
  }, [])

  const handleNodeClick = useCallback(
    (node: unknown) => {
      const n = node as GraphNode
      if (n._state === "locked") return
      onNodeClick?.(n)
    },
    [onNodeClick]
  )

  const handleSuggestedClick = useCallback(() => {
    if (!suggestedNode) return
    const fg = graphRef.current as unknown as {
      centerAt: (x: number, y: number, duration: number) => void
      zoom: (z: number, duration: number) => void
    } | null
    if (fg && suggestedNode.x != null && suggestedNode.y != null) {
      fg.centerAt(suggestedNode.x, suggestedNode.y, 600)
      fg.zoom(2.5, 600)
    }
    setTimeout(() => onNodeClick?.(suggestedNode), 650)
  }, [suggestedNode, onNodeClick])

  const dimensions = dimensionsRef.current

  const hintLabel = suggestedNode
    ? suggestedNode._state === "start_here"
      ? "Start with"
      : suggestedNode._state === "unlocked"
        ? "Up next"
        : "Continue"
    : null

  return (
    <div ref={containerRef} className="relative h-full w-full bg-background">
      <ForceGraph
        ref={graphRef as never}
        graphData={graphData}
        width={dimensions.width}
        height={dimensions.height}
        nodeCanvasObject={paintNode as never}
        nodePointerAreaPaint={pointerAreaPaint as never}
        onNodeHover={handleNodeHover as never}
        onNodeClick={handleNodeClick as never}
        onEngineStop={handleEngineStop}
        linkCanvasObject={paintLink as never}
        d3AlphaDecay={FORCE_CONFIG.d3AlphaDecay}
        d3VelocityDecay={FORCE_CONFIG.d3VelocityDecay}
        cooldownTime={FORCE_CONFIG.cooldownTime}
        warmupTicks={FORCE_CONFIG.warmupTicks}
        backgroundColor="transparent"
        enableNodeDrag
        enableZoomInteraction
        enablePanInteraction
        minZoom={0.5}
        maxZoom={5}
      />

      {suggestedNode && hintLabel && (
        <button
          onClick={handleSuggestedClick}
          className="absolute bottom-6 left-6 flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 backdrop-blur-md transition-all hover:bg-white/[0.1] hover:border-white/20 active:scale-[0.98]"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20">
            <Sparkles className="h-4 w-4 text-blue-400" />
          </div>
          <div className="text-left">
            <p className="text-[11px] font-medium uppercase tracking-wider text-white/50">
              {hintLabel}
            </p>
            <p className="text-sm font-semibold text-white/90">
              {suggestedNode.name}
            </p>
          </div>
          <ArrowRight className="ml-1 h-4 w-4 text-white/30" />
        </button>
      )}
    </div>
  )
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
}

function colorWithAlpha(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}
