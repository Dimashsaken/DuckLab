const LEVEL_INSTRUCTIONS: Record<number, string> = {
  1: "The student is confused. Re-explain the core idea in simpler words with a fresh analogy. Be encouraging.",
  2: "The student partially gets it. Clarify the likely fuzzy part and give a quick tip to lock it in.",
  3: "The student feels confident. Validate briefly, then share one deeper insight or surprising connection.",
}

export function buildConfidenceFeedbackPrompt(
  confidenceLevel: number,
  moduleTitle: string,
  moduleContent: string,
  conceptTitle: string
): { system: string; user: string } {
  const levelInstruction = LEVEL_INSTRUCTIONS[confidenceLevel] ?? LEVEL_INSTRUCTIONS[2]

  const system = `You are a warm tutor helping a student learn "${conceptTitle}". Respond in exactly 3-4 sentences. No markdown, no lists, no thinking tags. Plain conversational prose only.
${levelInstruction}`

  const user = `Module "${moduleTitle}": ${moduleContent.slice(0, 300)}`

  return { system, user }
}
