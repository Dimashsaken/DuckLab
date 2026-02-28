"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ImageIcon } from "lucide-react"

interface MermaidDiagramProps {
  code: string
  caption: string
}

function sanitizeMermaidCode(raw: string): string {
  let code = raw.trim()

  // Strip markdown fences: ```mermaid ... ``` or ``` ... ```
  code = code.replace(/^```(?:mermaid)?\s*\n?/i, "").replace(/\n?```\s*$/, "")
  code = code.trim()

  // Replace smart quotes with straight quotes
  code = code.replace(/[\u201C\u201D]/g, '"').replace(/[\u2018\u2019]/g, "'")

  // Fix node labels containing special chars by wrapping in quotes
  // Matches: A[Label with (parens) or: colons] → A["Label with (parens) or: colons"]
  code = code.replace(
    /(\w+)\[([^\]"]*[(){}:;<>&|][^\]"]*)\]/g,
    (_match, id, label) => `${id}["${label.replace(/"/g, "'")}"]`
  )

  // Same for round brackets: A(Label with special: chars)
  code = code.replace(
    /(\w+)\(([^)"]*[{}:;<>&|][^)"]*)\)/g,
    (_match, id, label) => `${id}("${label.replace(/"/g, "'")}"`
  )

  return code
}

function cleanupMermaidErrors() {
  if (typeof document === "undefined") return
  document.querySelectorAll("[id^='d']").forEach((el) => {
    if (
      el.id.startsWith("dmermaid-") ||
      (el.getAttribute("data-mermaid-error") !== null)
    ) {
      el.remove()
    }
  })
  // Mermaid v11 appends error svgs with class "error-icon" to body
  document
    .querySelectorAll("body > svg.error-icon, body > [id*='mermaid'] .error-icon")
    .forEach((el) => el.parentElement?.remove?.() ?? el.remove())
}

export function MermaidDiagram({ code, caption }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")

  useEffect(() => {
    let cancelled = false

    async function render() {
      if (!containerRef.current) return

      const sanitized = sanitizeMermaidCode(code)

      try {
        const mermaid = (await import("mermaid")).default
        mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          suppressErrors: true,
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

        // Validate syntax before rendering to avoid error SVGs in DOM
        const valid = await mermaid.parse(sanitized, { suppressErrors: true })
        if (!valid) {
          if (!cancelled) {
            cleanupMermaidErrors()
            setStatus("error")
          }
          return
        }

        const id = `mermaid-${Date.now()}-${Math.random().toString(36).slice(2)}`
        const { svg } = await mermaid.render(id, sanitized)
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg
          setStatus("success")
        }
      } catch {
        if (!cancelled) {
          cleanupMermaidErrors()
          setStatus("error")
        }
      }
    }

    setStatus("loading")
    render()

    return () => {
      cancelled = true
      cleanupMermaidErrors()
    }
  }, [code])

  if (status === "error") {
    return (
      <Card className="border-border/50 bg-muted/20">
        <CardContent className="flex items-center gap-3 py-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted/40">
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-sm italic text-muted-foreground">{caption}</p>
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
      {status === "success" && (
        <p className="text-center text-xs text-muted-foreground italic">
          {caption}
        </p>
      )}
    </div>
  )
}
