"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Lightbulb, HelpCircle } from "lucide-react"
import type { RepairLesson as RepairLessonType } from "@/lib/schemas/repair"

export function RepairLesson({ data }: { data: RepairLessonType }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Lightbulb className="h-5 w-5 text-mastery-learning" />
            {data.lesson_title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="prose prose-sm prose-invert max-w-none">
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {data.lesson_content}
            </p>
          </div>

          <div className="rounded-lg bg-primary/10 p-3">
            <p className="flex items-start gap-2 text-sm font-medium">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              {data.key_insight}
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="flex items-center gap-2 text-sm font-medium">
              <HelpCircle className="h-4 w-4" />
              Check your understanding
            </h4>
            {data.follow_up_questions.map((q, i) => (
              <div key={i} className="rounded-lg border border-border p-3">
                <p className="text-sm font-medium">{q.question}</p>
                <Badge variant="outline" className="mt-2 text-xs">
                  Hint: {q.expected_answer_hint}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
