"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"

interface MermaidDiagramProps {
  code: string
  caption: string
}

export function MermaidDiagram({ code, caption }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function render() {
      if (!containerRef.current) return

      try {
        const mermaid = (await import("mermaid")).default
        mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          themeVariables: {
            primaryColor: "#6366f1",
            primaryTextColor: "#e2e8f0",
            primaryBorderColor: "#4f46e5",
            lineColor: "#64748b",
            secondaryColor: "#1e293b",
            tertiaryColor: "#0f172a",
            background: "#0f172a",
            mainBkg: "#1e293b",
            nodeBorder: "#4f46e5",
            clusterBkg: "#1e293b",
            titleColor: "#e2e8f0",
            edgeLabelBackground: "#1e293b",
          },
          fontFamily: "inherit",
        })

        const id = `mermaid-${Date.now()}-${Math.random().toString(36).slice(2)}`
        const { svg } = await mermaid.render(id, code)
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg
        }
      } catch {
        if (!cancelled) setError(true)
      }
    }

    render()
    return () => {
      cancelled = true
    }
  }, [code])

  if (error) {
    return (
      <Card className="border-border/50 bg-muted/30">
        <CardContent className="py-4">
          <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-xs text-muted-foreground">
            {code}
          </pre>
          <p className="mt-2 text-xs text-muted-foreground italic">{caption}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-2">
      <Card className="border-border/50 bg-muted/20 overflow-hidden">
        <CardContent className="flex items-center justify-center p-4">
          <div
            ref={containerRef}
            className="w-full [&>svg]:mx-auto [&>svg]:max-w-full"
          />
        </CardContent>
      </Card>
      <p className="text-center text-xs text-muted-foreground italic">
        {caption}
      </p>
    </div>
  )
}
