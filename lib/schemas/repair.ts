import { z } from "zod"

export const RepairLessonSchema = z.object({
  lesson_title: z.string(),
  lesson_content: z.string().max(3000),
  key_insight: z.string().max(200),
  follow_up_questions: z
    .array(
      z.object({
        question: z.string(),
        expected_answer_hint: z.string(),
      })
    )
    .length(2),
})

export type RepairLesson = z.infer<typeof RepairLessonSchema>
