import { getRetellClient } from "./client"
import { getDuckVoicePrompt } from "./duck-voice-prompt"

let cachedAgentId: string | null = null
let cachedLlmId: string | null = null

export async function getOrCreateDuckAgent(): Promise<string> {
  if (cachedAgentId) return cachedAgentId

  const client = getRetellClient()

  const llm = await client.llm.create({
    general_prompt: getDuckVoicePrompt("{{concept_title}}", "{{concept_description}}"),
    begin_message: "Hey! I'm your rubber duck. I don't know anything about {{concept_title}} yet. Can you explain it to me like I'm 10 years old?",
  })
  cachedLlmId = llm.llm_id

  const agent = await client.agent.create({
    response_engine: {
      type: "retell-llm",
      llm_id: llm.llm_id,
    },
    voice_id: "11labs-Adrian",
    agent_name: "DuckLab Teaching Duck",
  })
  cachedAgentId = agent.agent_id

  return cachedAgentId
}
