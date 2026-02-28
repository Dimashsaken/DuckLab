export interface MiniMaxMessage {
  role: "system" | "user" | "assistant"
  content: string
}

export interface MiniMaxRequestOptions {
  messages: MiniMaxMessage[]
  temperature?: number
  maxTokens?: number
  stream?: boolean
}

export interface MiniMaxChoice {
  message: {
    role: string
    content: string
  }
  finish_reason: string
}

export interface MiniMaxResponse {
  choices: MiniMaxChoice[]
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}
