import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Brain, Network, MessageCircle } from "lucide-react"
import { DuckIcon } from "@/components/icons/duck-icon"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-2 font-semibold">
            <DuckIcon className="h-5 w-5 text-primary" />
            DuckLab
          </div>
          <div className="flex gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-4xl px-4 py-24 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Learn by{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Teaching
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            DuckLab builds you a personalized knowledge graph, curates the best
            resources from the web, and makes you prove you understand by
            teaching it back to an AI duck. You can&apos;t fake your way through.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/signup">Start Learning Free</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </section>

        <section className="border-t border-border bg-muted/30 py-20">
          <div className="mx-auto grid max-w-5xl gap-8 px-4 sm:grid-cols-3">
            <FeatureCard
              icon={Brain}
              title="Living Curriculum"
              description="AI generates a concept dependency graph for any topic. Each node is a concept you need to master, with the best resources from across the web."
            />
            <FeatureCard
              icon={MessageCircle}
              title="Teach the Duck"
              description="Prove you understand by explaining concepts to a curious AI duck. It catches jargon, exposes gaps, and forces real understanding."
            />
            <FeatureCard
              icon={Network}
              title="Knowledge Graph"
              description="Watch your understanding grow. Nodes light up as you master them. See exactly where you're strong and where you're faking it."
            />
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        Built with DuckLab &mdash; The learning engine you can&apos;t cheat.
      </footer>
    </div>
  )
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
}) {
  return (
    <div className="space-y-3 rounded-lg border border-border bg-card p-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
