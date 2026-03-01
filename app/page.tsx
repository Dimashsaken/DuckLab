"use client"

/// <reference types="youtube" />
import Link from "next/link"
import Image from "next/image"
import { useRef, useEffect, useState, useCallback } from "react"
import { motion, useInView, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { DuckIcon } from "@/components/icons/duck-icon"
import {
  Search,
  MonitorPlay,
  CircleHelp,
  BookOpen,
  Network,
  MessageCircle,
  Brain,
  Target,
  BarChart3,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
} from "lucide-react"

function FadeIn({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
      transition={{ duration: 0.6, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ─── 1. Navbar ─── */
function Navbar() {
  return (
    <nav className="fixed top-0 z-50 w-full border-b border-border backdrop-blur-lg bg-background/70">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <DuckIcon className="h-5 w-5 text-primary" />
          DuckLab
        </Link>

        <div className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#how-it-works" className="transition-colors hover:text-foreground">How It Works</a>
          <a href="#features" className="transition-colors hover:text-foreground">Features</a>
          <a href="#faq" className="transition-colors hover:text-foreground">FAQ</a>
        </div>

        <Button asChild variant="outline" size="sm">
          <Link href="/login">Sign In</Link>
        </Button>
      </div>
    </nav>
  )
}

/* ─── 2. Demo Player ─── */
declare global {
  interface Window {
    YT: typeof YT
    onYouTubeIframeAPIReady: () => void
  }
}

function DemoPlayer() {
  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<YT.Player | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [ready, setReady] = useState(false)
  const [playing, setPlaying] = useState(true)
  const [muted, setMuted] = useState(true)
  const [progress, setProgress] = useState(0)
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    let cancelled = false

    const init = () => {
      if (cancelled || !containerRef.current) return
      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId: "9REY8ch9ino",
        playerVars: {
          autoplay: 1,
          mute: 1,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          playsinline: 1,
          start: 19,
          loop: 1,
          playlist: "9REY8ch9ino",
          disablekb: 1,
          iv_load_policy: 3,
          fs: 0,
        },
        events: {
          onReady: () => { if (!cancelled) setReady(true) },
          onStateChange: (e: YT.OnStateChangeEvent) => {
            if (cancelled) return
            setPlaying(e.data === YT.PlayerState.PLAYING)
          },
        },
      })
    }

    if (window.YT?.Player) {
      init()
    } else {
      const tag = document.createElement("script")
      tag.src = "https://www.youtube.com/iframe_api"
      document.head.appendChild(tag)
      window.onYouTubeIframeAPIReady = init
    }

    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!ready) return
    intervalRef.current = setInterval(() => {
      const p = playerRef.current
      if (!p?.getCurrentTime || !p?.getDuration) return
      const dur = p.getDuration()
      if (dur > 0) setProgress(p.getCurrentTime() / dur)
    }, 250)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [ready])

  const toggle = useCallback(() => {
    const p = playerRef.current
    if (!p) return
    playing ? p.pauseVideo() : p.playVideo()
  }, [playing])

  const toggleMute = useCallback(() => {
    const p = playerRef.current
    if (!p) return
    muted ? p.unMute() : p.mute()
    setMuted(!muted)
  }, [muted])

  const seek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const p = playerRef.current
    if (!p?.getDuration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    p.seekTo(pct * p.getDuration(), true)
    setProgress(pct)
  }, [])

  const goFullscreen = useCallback(() => {
    const iframe = containerRef.current?.querySelector("iframe") ?? containerRef.current
    if (!iframe) return
    if (iframe.requestFullscreen) iframe.requestFullscreen()
  }, [])

  return (
    <div
      className="group relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary/40 via-accent/30 to-primary/40 opacity-60 blur-xl transition-opacity duration-700 group-hover:opacity-100" />
      <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-primary/20 via-accent/15 to-primary/20" />

      <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-card shadow-2xl shadow-primary/10">
        {/* Browser chrome */}
        <div className="flex items-center gap-2 border-b border-white/[0.06] bg-white/[0.02] px-4 py-2.5">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          </div>
          <div className="ml-3 flex flex-1 items-center gap-2 rounded-lg bg-white/[0.04] px-3 py-1.5 text-xs text-muted-foreground">
            <div className="h-2.5 w-2.5 rounded-full border border-green-500/50 bg-green-500/20" />
            ducklab.vercel.app
          </div>
        </div>

        {/* Video + overlay controls */}
        <div className="relative aspect-video bg-black">
          <div ref={containerRef} className="absolute inset-0" />

          {/* Click-to-toggle overlay */}
          {ready && (
            <div className="absolute inset-0 z-10 cursor-pointer" onClick={toggle} />
          )}

          {/* Center play icon on pause */}
          <AnimatePresence>
            {ready && !playing && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 backdrop-blur-md">
                  <Play className="h-6 w-6 text-white ml-0.5" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom controls */}
          <AnimatePresence>
            {ready && hovered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/70 to-transparent px-3 pt-8 pb-2.5"
              >
                {/* Progress bar */}
                <div
                  className="group/bar mb-2.5 h-1 cursor-pointer rounded-full bg-white/20"
                  onClick={seek}
                >
                  <div
                    className="h-full rounded-full bg-primary transition-all group-hover/bar:h-1.5"
                    style={{ width: `${progress * 100}%` }}
                  />
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-3">
                  <button onClick={toggle} className="text-white/80 transition-colors hover:text-white">
                    {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
                  </button>
                  <button onClick={toggleMute} className="text-white/80 transition-colors hover:text-white">
                    {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </button>
                  <div className="flex-1" />
                  <button onClick={goFullscreen} className="text-white/80 transition-colors hover:text-white">
                    <Maximize className="h-3.5 w-3.5" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

/* ─── 3. Hero ─── */
function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col justify-center pt-20 pb-16 sm:pt-24 sm:pb-20">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[2fr_3fr] lg:gap-12">
        {/* Left — copy */}
        <FadeIn>
          <div className="max-w-md">
            <h1 className="font-[family-name:var(--font-instrument-serif)] text-4xl leading-[1.15] tracking-tight sm:text-5xl lg:text-6xl">
              Learn anything<br />
              <span className="italic bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Prove it by teaching
              </span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              Your knowledge graph lights up when you can explain simply.
              Stop faking&nbsp;&mdash; start understanding.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button asChild size="lg" className="gap-2">
                <Link href="/signup">
                  Start Learning <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </FadeIn>

        {/* Right — cinematic video player */}
        <FadeIn delay={0.15}>
          <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
            <DemoPlayer />
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

/* ─── 3. Problem Section ─── */
const PROBLEMS = [
  { icon: Search, title: "You re-read but can't explain it", description: "Highlighting and re-reading tricks your brain into thinking you know the material. You don't." },
  { icon: MonitorPlay, title: "You watch tutorials but can't apply them", description: "Passive consumption feels productive. But when you close the tab, the knowledge evaporates." },
  { icon: CircleHelp, title: "You pass quizzes but don't truly understand", description: "Multiple choice rewards recognition, not comprehension. Real understanding means you can teach it." },
] as const

function ProblemSection() {
  return (
    <section className="border-t border-border py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <FadeIn>
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
            Sound familiar?
          </h2>
        </FadeIn>
        <div className="mt-12 grid gap-6 sm:grid-cols-3 sm:gap-8">
          {PROBLEMS.map((p, i) => (
            <FadeIn key={p.title} delay={i * 0.1}>
              <div className="group rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/30 sm:p-8">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-destructive/10">
                  <p.icon className="h-5 w-5 text-destructive" />
                </div>
                <h3 className="mt-5 font-semibold leading-snug">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.description}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── 4. Solution Section ─── */
function SolutionSection() {
  return (
    <section className="border-t border-border bg-muted/20 py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-20">
        <FadeIn>
          <div className="max-w-lg">
            <Badge variant="secondary" className="mb-4">The Feynman Technique, supercharged</Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Learning, not Faking
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Richard Feynman said &ldquo;If you can&rsquo;t explain it simply, you don&rsquo;t understand it well enough.&rdquo;
              DuckLab turns this into a system: pick any topic, study it with AI-curated resources,
              then prove your understanding by teaching an AI duck that asks real questions.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Your knowledge graph is the proof. Green nodes mean you truly get it.
              Yellow means you&rsquo;re getting there. Red means the duck caught you bluffing.
              No shortcuts&nbsp;&mdash; just real comprehension, visually proven.
            </p>
          </div>
        </FadeIn>
        <FadeIn delay={0.15}>
          <div className="relative w-full overflow-hidden rounded-xl border border-border bg-card shadow-2xl shadow-primary/5">
            <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-2.5">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
              </div>
              <div className="ml-3 flex-1 rounded-md bg-background/60 px-3 py-1 text-xs text-muted-foreground">
                ducklab.app/topic
              </div>
            </div>
            <div className="relative aspect-[16/10] overflow-hidden">
              <Image
                src="/graph-preview.png"
                alt="DuckLab knowledge graph showing AI topic progression"
                fill
                className="object-cover object-[center_58%] scale-[1.25]"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

/* ─── 5. How It Works ─── */
const STEPS = [
  { icon: BookOpen, title: "Pick a topic", description: "Choose any subject — from quantum physics to JavaScript closures." },
  { icon: Network, title: "Get a knowledge graph", description: "AI maps every concept and prerequisite into a visual dependency graph." },
  { icon: MessageCircle, title: "Teach the duck", description: "Explain each concept in your own words to a curious, skeptical AI duck." },
  { icon: Target, title: "Get feedback", description: "The duck catches jargon, exposes gaps, and asks follow-up questions." },
  { icon: BarChart3, title: "Track mastery", description: "Watch your graph light up as you prove real understanding, node by node." },
] as const

function HowItWorks() {
  return (
    <section id="how-it-works" className="border-t border-border py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <FadeIn>
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
            How It Works
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
            Five steps from &ldquo;I think I know this&rdquo; to &ldquo;I can prove it.&rdquo;
          </p>
        </FadeIn>

        {/* Desktop: horizontal timeline */}
        <div className="mt-16 hidden lg:block">
          <div className="relative">
            {/* Connecting line */}
            <div className="absolute top-6 left-[10%] right-[10%] h-px bg-gradient-to-r from-primary/40 via-primary/20 to-primary/40" />
            <div className="grid grid-cols-5 gap-4">
              {STEPS.map((s, i) => (
                <FadeIn key={s.title} delay={i * 0.08} className="relative flex flex-col items-center text-center">
                  <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border border-primary/30 bg-background">
                    <s.icon className="h-5 w-5 text-primary" />
                  </div>
                  <Badge variant="secondary" className="mt-3 text-[10px]">{i + 1}</Badge>
                  <h3 className="mt-3 text-sm font-semibold">{s.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{s.description}</p>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile: vertical timeline */}
        <div className="mt-12 space-y-8 lg:hidden">
          {STEPS.map((s, i) => (
            <FadeIn key={s.title} delay={i * 0.06}>
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-background">
                    <s.icon className="h-4 w-4 text-primary" />
                  </div>
                  {i < STEPS.length - 1 && <div className="mt-2 w-px flex-1 bg-border" />}
                </div>
                <div className="pb-4">
                  <p className="text-xs font-medium text-primary">Step {i + 1}</p>
                  <h3 className="mt-1 font-semibold">{s.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{s.description}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── 6. Features (Bento Grid) ─── */
const FEATURES = [
  {
    icon: Brain,
    title: "Living curriculum",
    description: "AI generates a concept dependency graph for any topic — with the best resources from across the web. Your curriculum adapts as you learn.",
    span: 2,
  },
  {
    icon: MessageCircle,
    title: "Teach-back assessment",
    description: "Prove understanding by explaining concepts to a curious AI duck that catches jargon and exposes gaps.",
    span: 1,
  },
  {
    icon: ShieldCheck,
    title: "Misconception detection",
    description: "The duck identifies and corrects wrong mental models before they become deeply ingrained habits.",
    span: 1,
  },
  {
    icon: Network,
    title: "Visual knowledge graph",
    description: "Watch your understanding grow in real time. Nodes light up green as you master them. See exactly where you're strong and where you need work.",
    span: 2,
  },
] as const

function Features() {
  return (
    <section id="features" className="border-t border-border bg-muted/20 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <FadeIn>
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to <span className="text-primary">truly</span> learn
          </h2>
        </FadeIn>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <FadeIn
              key={f.title}
              delay={i * 0.08}
              className={f.span === 2 ? "sm:col-span-2" : ""}
            >
              <div className="group h-full rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 sm:p-8">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 leading-relaxed text-muted-foreground">{f.description}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── 7. FAQ ─── */
const FAQS = [
  {
    q: "What is DuckLab?",
    a: "DuckLab is a learning platform that builds you a personalized knowledge graph for any topic, curates the best resources from across the web, and makes you prove your understanding by teaching concepts back to an AI duck. It's based on the Feynman Technique — if you can't explain it simply, you don't understand it.",
  },
  {
    q: "How does the teach-back method work?",
    a: "After studying a concept, you enter a conversation with our AI duck. You explain the concept in your own words, and the duck asks follow-up questions, challenges jargon, and probes for genuine understanding. Based on your explanations, we score your mastery and update your knowledge graph.",
  },
  {
    q: "What topics can I learn?",
    a: "Anything with structured knowledge — computer science, mathematics, physics, biology, history, philosophy, economics, and more. DuckLab's AI generates a concept dependency graph for any subject and finds the best learning resources from the web.",
  },
  {
    q: "Is DuckLab free?",
    a: "DuckLab is free to use during our beta period. We're building the best learning tool possible and want as many learners as we can get. Premium features may be introduced later, but core learning will always be accessible.",
  },
  {
    q: "How is this different from quizzes?",
    a: "Quizzes test recognition — you pick the right answer from options. DuckLab tests understanding — you generate explanations from scratch. Our AI duck detects when you're using jargon without comprehension, surface-level memorization, or copied definitions. You can't fake your way through.",
  },
]

function FAQ() {
  return (
    <section id="faq" className="border-t border-border py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <FadeIn>
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
            Frequently Asked Questions
          </h2>
        </FadeIn>
        <FadeIn delay={0.1}>
          <Accordion type="single" collapsible className="mt-12">
            {FAQS.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left text-base">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </FadeIn>
      </div>
    </section>
  )
}

/* ─── 8. Footer ─── */
function Footer() {
  return (
    <footer className="border-t border-border py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 sm:px-6">
        <div className="flex items-center gap-2 font-semibold">
          <DuckIcon className="h-5 w-5 text-primary" />
          DuckLab
        </div>
        <p className="text-sm text-muted-foreground">
          The learning engine you can&apos;t cheat.
        </p>
        <p className="text-xs text-muted-foreground/60">
          &copy; {new Date().getFullYear()} DuckLab. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

/* ─── Page ─── */
export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <ProblemSection />
        <SolutionSection />
        <HowItWorks />
        <Features />
        <FAQ />
      </main>
      <Footer />
    </div>
  )
}
