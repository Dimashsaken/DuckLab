"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { DuckAvatar } from "./duck-avatar"
import { Send, User } from "lucide-react"
import type { ChatMessage } from "@/lib/hooks/use-duck-chat"

interface DuckChatProps {
  messages: ChatMessage[]
  isLoading: boolean
  isFinished: boolean
  onSend: (message: string) => void
}

export function DuckChat({
  messages,
  isLoading,
  isFinished,
  onSend,
}: DuckChatProps) {
  const [input, setInput] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    })
  }, [messages])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || isLoading || isFinished) return
    onSend(input.trim())
    setInput("")
  }

  const userMessageCount = messages.filter((m) => m.role === "user").length

  return (
    <div className="flex h-full flex-col">
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="flex items-start gap-3">
            <DuckAvatar />
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-sm">
                Hi there! I&apos;m your rubber duck. I don&apos;t know anything
                about this topic yet. Can you explain it to me like I&apos;m 10
                years old?
              </p>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            {msg.role === "assistant" ? (
              <DuckAvatar speaking={isLoading && i === messages.length - 1} />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                <User className="h-5 w-5" />
              </div>
            )}
            <div
              className={`max-w-[75%] rounded-lg p-3 ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50"
              }`}
            >
              <p className="whitespace-pre-wrap text-sm">
                {msg.content.replace("[READY_TO_SCORE]", "").trim()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {!isFinished && (
        <form onSubmit={handleSubmit} className="border-t border-border p-4">
          <div className="flex items-end gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                userMessageCount === 0
                  ? "Explain the concept in your own words..."
                  : "Continue your explanation..."
              }
              disabled={isLoading}
              className="min-h-[80px] resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit(e)
                }
              }}
            />
            <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">
            Turn {Math.min(userMessageCount + 1, 3)} of 3 — Shift+Enter for new
            line
          </p>
        </form>
      )}
    </div>
  )
}
