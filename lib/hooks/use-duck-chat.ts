"use client"

import { useState, useCallback, useRef, useMemo } from "react"
import { getDuckGreeting } from "@/lib/prompts/duck"

export interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

interface UseDuckChatOptions {
  conceptTitle: string
  conceptDescription: string
  onFinished?: (messages: ChatMessage[]) => void
}

export function useDuckChat({
  conceptTitle,
  conceptDescription,
  onFinished,
}: UseDuckChatOptions) {
  const greeting = useMemo(
    () => getDuckGreeting(conceptTitle),
    [conceptTitle]
  )
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: greeting },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const sendMessage = useCallback(
    async (userMessage: string) => {
      const updatedMessages: ChatMessage[] = [
        ...messages,
        { role: "user", content: userMessage },
      ]
      setMessages(updatedMessages)
      setIsLoading(true)

      const assistantIndex = updatedMessages.length
      setMessages((prev) => [...prev, { role: "assistant", content: "" }])

      try {
        abortRef.current = new AbortController()
        const response = await fetch("/api/agents/duck-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: updatedMessages,
            conceptTitle,
            conceptDescription,
          }),
          signal: abortRef.current.signal,
        })

        if (!response.ok) throw new Error(`HTTP ${response.status}`)

        const reader = response.body!.getReader()
        const decoder = new TextDecoder()
        let fullContent = ""

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value, { stream: true })
          fullContent += chunk
          setMessages((prev) => {
            const updated = [...prev]
            updated[assistantIndex] = {
              role: "assistant",
              content: fullContent,
            }
            return updated
          })
        }

        const finalMessages: ChatMessage[] = [
          ...updatedMessages,
          { role: "assistant", content: fullContent },
        ]

        if (fullContent.includes("[READY_TO_SCORE]")) {
          setIsFinished(true)
          onFinished?.(finalMessages)
        }
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Duck chat error:", error)
        }
      } finally {
        setIsLoading(false)
      }
    },
    [messages, conceptTitle, conceptDescription, onFinished]
  )

  const reset = useCallback(() => {
    abortRef.current?.abort()
    setMessages([{ role: "assistant", content: greeting }])
    setIsLoading(false)
    setIsFinished(false)
  }, [greeting])

  return { messages, sendMessage, isLoading, isFinished, reset }
}
