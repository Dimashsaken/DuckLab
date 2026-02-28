const LEVEL_INSTRUCTIONS: Record<number, string> = {
  1: `The student is CONFUSED about this material.
- Re-explain the core idea using completely different, simpler words
- Use a fresh real-world analogy they haven't seen yet
- Break it into the smallest possible steps
- Address the most likely point of confusion
- Be warm and encouraging — confusion is normal and a sign of learning`,

  2: `The student PARTIALLY understands but isn't fully confident yet.
- Identify the most likely gap or fuzzy area and clarify it
- Give a concise bridging explanation that connects the dots
- Offer a quick mnemonic, mental model, or "trick" to lock it in
- Keep it brief and focused — they're almost there`,

  3: `The student feels CONFIDENT they understand this.
- Briefly validate their understanding (1 sentence)
- Then reward them with a deeper insight, surprising connection, or interesting edge case they might not have considered
- Keep it short and intellectually stimulating — make them feel like mastery opens new doors`,
}

export function buildConfidenceFeedbackPrompt(
  confidenceLevel: number,
  moduleTitle: string,
  moduleContent: string,
  conceptTitle: string
): { system: string; user: string } {
  const levelInstruction = LEVEL_INSTRUCTIONS[confidenceLevel] ?? LEVEL_INSTRUCTIONS[2]

  const system = `You are a warm, expert tutor helping a student learn "${conceptTitle}".
The student just finished reading a micro-lesson module and rated their confidence.
Your job is to give a SHORT, targeted response based on their confidence level.

${levelInstruction}

Rules:
- Keep your response under 150 words
- Use plain language, no jargon unless you immediately explain it
- Do NOT repeat the module content verbatim — rephrase and add value
- Do NOT use markdown headers or bullet lists — write in natural flowing prose
- Be conversational and supportive
- Do NOT include any thinking or reasoning tags`

  const user = `Module: "${moduleTitle}"

Content the student just read:
${moduleContent}

Give your response now.`

  return { system, user }
}
