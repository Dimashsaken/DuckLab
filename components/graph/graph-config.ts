export const MASTERY_COLORS: Record<string, string> = {
  not_started: "#737373",
  weak: "#ef4444",
  learning: "#eab308",
  mastered: "#22c55e",
}

export const FORCE_CONFIG = {
  d3AlphaDecay: 0.02,
  d3VelocityDecay: 0.3,
  linkDistance: 80,
  chargeStrength: -120,
  centerStrength: 0.05,
  cooldownTime: 3000,
  warmupTicks: 50,
} as const

export interface GraphNode {
  id: string
  name: string
  mastery: string
  score: number
  difficulty: number
  description: string
  x?: number
  y?: number
}

export interface GraphLink {
  source: string | GraphNode
  target: string | GraphNode
}

export function getNodeRadius(difficulty: number): number {
  return 4 + difficulty * 2
}

export function getNodeColor(mastery: string): string {
  return MASTERY_COLORS[mastery] ?? MASTERY_COLORS.not_started
}
