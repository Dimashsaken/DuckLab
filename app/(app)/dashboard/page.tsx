import Link from "next/link"
import { Plus, BookOpen } from "lucide-react"
import { getTopics } from "@/lib/supabase/queries/topics"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/shared/empty-state"
import { MASTERY_LABELS, type MasteryLevel } from "@/lib/constants"

export default async function DashboardPage() {
  const topics = await getTopics()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Your Topics</h1>
        <p className="mt-1 text-muted-foreground">
          Pick up where you left off, or start something new.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/topic/new">
          <Card className="flex h-full cursor-pointer flex-col items-center justify-center border-dashed transition-colors hover:border-primary/50 hover:bg-muted/50">
            <CardContent className="flex flex-col items-center gap-3 pt-6">
              <div className="rounded-full bg-primary/10 p-3">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <p className="font-medium">New Topic</p>
              <p className="text-sm text-muted-foreground">
                Start learning something new
              </p>
            </CardContent>
          </Card>
        </Link>

        {topics.map((topic) => {
          const concepts = topic.concepts ?? []
          const mastered = concepts.filter(
            (c: { mastery_level: string }) => c.mastery_level === "mastered"
          ).length
          const total = concepts.length

          return (
            <Link key={topic.id} href={`/topic/${topic.id}`}>
              <Card className="cursor-pointer transition-colors hover:border-primary/30 hover:bg-muted/30">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{topic.title}</CardTitle>
                    <Badge
                      variant={topic.status === "ready" ? "default" : "secondary"}
                    >
                      {topic.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {topic.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {topic.description}
                    </p>
                  )}
                  {total > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-mono">
                          {mastered}/{total} mastered
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-muted">
                        <div
                          className="h-2 rounded-full bg-mastery-mastered transition-all"
                          style={{
                            width: `${total ? (mastered / total) * 100 : 0}%`,
                          }}
                        />
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {concepts.slice(0, 8).map(
                          (c: {
                            id: string
                            mastery_level: string
                          }) => (
                            <div
                              key={c.id}
                              className="h-2.5 w-2.5 rounded-full"
                              style={{
                                backgroundColor: `var(--mastery-${c.mastery_level.replace("_", "-")})`,
                              }}
                              title={
                                MASTERY_LABELS[c.mastery_level as MasteryLevel]
                              }
                            />
                          )
                        )}
                        {concepts.length > 8 && (
                          <span className="text-xs text-muted-foreground">
                            +{concepts.length - 8}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {topics.length === 0 && (
        <EmptyState
          icon={BookOpen}
          title="No topics yet"
          description="Create your first topic to start building your knowledge graph."
          action={{ label: "Create Topic", href: "/topic/new" }}
        />
      )}
    </div>
  )
}
