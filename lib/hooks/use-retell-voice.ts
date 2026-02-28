"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { RetellWebClient } from "retell-client-js-sdk"
import type { ChatMessage } from "./use-duck-chat"

interface TranscriptEntry {
  role: "agent" | "user"
  content: string
}

interface UseRetellVoiceOptions {
  conceptTitle: string
  conceptDescription: string
  onFinished?: (messages: ChatMessage[]) => void
}

type VoiceStatus = "idle" | "connecting" | "active" | "ended" | "error"

export function useRetellVoice({
  conceptTitle,
  conceptDescription,
  onFinished,
}: UseRetellVoiceOptions) {
  const [status, setStatus] = useState<VoiceStatus>("idle")
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([])
  const [agentSpeaking, setAgentSpeaking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clientRef = useRef<RetellWebClient | null>(null)
  const callIdRef = useRef<string | null>(null)
  const onFinishedRef = useRef(onFinished)
  onFinishedRef.current = onFinished

  useEffect(() => {
    return () => {
      clientRef.current?.stopCall()
    }
  }, [])

  const startCall = useCallback(async () => {
    setStatus("connecting")
    setError(null)
    setTranscript([])

    try {
      const res = await fetch("/api/retell/web-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conceptTitle, conceptDescription }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || `HTTP ${res.status}`)
      }

      const { accessToken, callId } = await res.json()
      callIdRef.current = callId

      const retellClient = new RetellWebClient()
      clientRef.current = retellClient

      retellClient.on("call_started", () => {
        setStatus("active")
      })

      retellClient.on("call_ended", () => {
        setStatus("ended")
        fetchTranscriptAndScore(callId)
      })

      retellClient.on("agent_start_talking", () => {
        setAgentSpeaking(true)
      })

      retellClient.on("agent_stop_talking", () => {
        setAgentSpeaking(false)
      })

      retellClient.on("update", (update: { transcript?: TranscriptEntry[] }) => {
        if (Array.isArray(update.transcript)) {
          setTranscript(
            update.transcript.map((t) => ({
              role: t.role === "agent" ? "agent" : "user",
              content: t.content ?? "",
            }))
          )
        }
      })

      retellClient.on("error", (err: Error) => {
        console.error("Retell error:", err)
        setError(err.message || "Voice call error")
        setStatus("error")
      })

      await retellClient.startCall({ accessToken })
    } catch (err) {
      console.error("Failed to start voice call:", err)
      setError(err instanceof Error ? err.message : "Failed to start voice call")
      setStatus("error")
    }
  }, [conceptTitle, conceptDescription])

  const stopCall = useCallback(() => {
    clientRef.current?.stopCall()
  }, [])

  const fetchTranscriptAndScore = useCallback(async (callId: string) => {
    await new Promise((r) => setTimeout(r, 2000))

    try {
      const res = await fetch(`/api/retell/call?callId=${callId}`)
      if (!res.ok) throw new Error("Failed to fetch transcript")

      const data = await res.json()
      const messages: ChatMessage[] = data.messages || []

      if (messages.length > 0) {
        onFinishedRef.current?.(messages)
      }
    } catch (err) {
      console.error("Failed to fetch call transcript:", err)
    }
  }, [])

  const reset = useCallback(() => {
    clientRef.current?.stopCall()
    clientRef.current = null
    callIdRef.current = null
    setStatus("idle")
    setTranscript([])
    setAgentSpeaking(false)
    setError(null)
  }, [])

  return {
    status,
    transcript,
    agentSpeaking,
    error,
    startCall,
    stopCall,
    reset,
    isFinished: status === "ended",
  }
}
