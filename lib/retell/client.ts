import Retell from "retell-sdk"

let retellClient: Retell | null = null

export function getRetellClient(): Retell {
  if (!retellClient) {
    const apiKey = process.env.RETELL_API_KEY
    if (!apiKey) throw new Error("RETELL_API_KEY is not set")
    retellClient = new Retell({ apiKey })
  }
  return retellClient
}
