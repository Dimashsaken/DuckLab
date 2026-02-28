"use client"

import { DuckAvatar } from "./duck-avatar"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, Phone, PhoneOff, User, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface TranscriptEntry {
  role: "agent" | "user"
  content: string
}

interface VoiceChatProps {
  status: "idle" | "connecting" | "active" | "ended" | "error"
  transcript: TranscriptEntry[]
  agentSpeaking: boolean
  error: string | null
  onStart: () => void
  onStop: () => void
}

export function VoiceChat({
  status,
  transcript,
  agentSpeaking,
  error,
  onStart,
  onStop,
}: VoiceChatProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        {status === "idle" && (
          <div className="flex h-full flex-col items-center justify-center gap-6">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <DuckAvatar />
            </motion.div>
            <div className="text-center">
              <h3 className="text-lg font-semibold">Voice Mode</h3>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Talk to the duck using your microphone. Explain the concept out
                loud and the duck will ask follow-up questions.
              </p>
            </div>
            <Button onClick={onStart} size="lg" className="gap-2">
              <Phone className="h-4 w-4" />
              Start Voice Conversation
            </Button>
          </div>
        )}

        {status === "connecting" && (
          <div className="flex h-full flex-col items-center justify-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              Connecting to the duck...
            </p>
          </div>
        )}

        {(status === "active" || status === "ended") && (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3 pb-4">
              <VoiceIndicator active={status === "active" && agentSpeaking} label="Duck" />
              <div className="h-px flex-1 bg-border" />
              <VoiceIndicator active={status === "active" && !agentSpeaking} label="You" />
            </div>

            {transcript.length === 0 && status === "active" && (
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 flex-shrink-0">
                  <DuckAvatar speaking={agentSpeaking} />
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-sm text-muted-foreground italic">
                    Listening...
                  </p>
                </div>
              </div>
            )}

            <AnimatePresence mode="popLayout">
              {transcript.map((entry, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-start gap-3 ${entry.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  {entry.role === "agent" ? (
                    <div className="h-10 w-10 flex-shrink-0">
                      <DuckAvatar
                        speaking={agentSpeaking && i === transcript.length - 1}
                      />
                    </div>
                  ) : (
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-secondary">
                      <User className="h-5 w-5" />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] rounded-lg p-3 ${
                      entry.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/50"
                    }`}
                  >
                    <p className="whitespace-pre-wrap text-sm">
                      {entry.content}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {status === "error" && (
          <div className="flex h-full flex-col items-center justify-center gap-4">
            <MicOff className="h-8 w-8 text-destructive" />
            <div className="text-center">
              <p className="font-medium text-destructive">Connection Error</p>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                {error || "Something went wrong with the voice connection."}
              </p>
            </div>
            <Button onClick={onStart} variant="outline" className="gap-2">
              <Phone className="h-4 w-4" />
              Try Again
            </Button>
          </div>
        )}
      </div>

      {status === "active" && (
        <div className="flex items-center justify-center border-t border-border p-4">
          <Button
            onClick={onStop}
            variant="destructive"
            size="lg"
            className="gap-2"
          >
            <PhoneOff className="h-4 w-4" />
            End Conversation
          </Button>
        </div>
      )}

      {status === "ended" && (
        <div className="border-t border-border p-4 text-center">
          <p className="text-sm text-muted-foreground">
            Conversation ended. Preparing your score...
          </p>
        </div>
      )}
    </div>
  )
}

function VoiceIndicator({ active, label }: { active: boolean; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex h-5 items-end gap-1">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="w-1 rounded-full bg-primary"
            animate={
              active
                ? {
                    height: [4, 16, 8, 20, 4],
                    transition: {
                      repeat: Infinity,
                      duration: 0.8,
                      delay: i * 0.15,
                    },
                  }
                : { height: 4 }
            }
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  )
}
