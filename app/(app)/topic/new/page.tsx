"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Sparkles, Loader2 } from "lucide-react"
import { motion } from "framer-motion"

export default function NewTopicPage() {
  const [topic, setTopic] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!topic.trim()) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/agents/curriculum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim() }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to generate curriculum")
      }

      const data = await res.json()
      router.push(`/topic/${data.topicId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg"
      >
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">What do you want to learn?</CardTitle>
            <CardDescription>
              DuckLab will build a personalized knowledge graph and find the best
              resources from across the web.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. AI Agents, Quantum Computing, Rust..."
                disabled={loading}
                className="h-12 text-base"
                autoFocus
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={loading || !topic.trim()}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Building your knowledge graph...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Curriculum
                  </>
                )}
              </Button>
            </form>

            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-6 space-y-3"
              >
                <LoadingStep
                  text="Analyzing topic structure..."
                  delay={0}
                />
                <LoadingStep
                  text="Generating concept nodes..."
                  delay={2}
                />
                <LoadingStep
                  text="Building prerequisite edges..."
                  delay={5}
                />
                <LoadingStep
                  text="Finalizing knowledge graph..."
                  delay={8}
                />
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

function LoadingStep({ text, delay }: { text: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="flex items-center gap-2 text-sm text-muted-foreground"
    >
      <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
      {text}
    </motion.div>
  )
}
