export const MASTERY_COLORS: Record<string, string> = {
  not_started: "#737373",
  weak: "#ef4444",
  learning: "#eab308",
  mastered: "#22c55e",
}

export type NodeState =
  | "start_here"
  | "unlocked"
  | "in_progress"
  | "completed"
  | "locked"

export const NODE_STATE_COLORS: Record<NodeState, string> = {
  start_here: "#60a5fa",
  unlocked: "#38bdf8",
  in_progress: "#eab308",
  completed: "#22c55e",
  locked: "#525252",
}

export const FORCE_CONFIG = {
  d3AlphaDecay: 0.028,
  d3VelocityDecay: 0.4,
  chargeStrength: -350,
  chargeDistanceMax: 500,
  linkDistance: 150,
  linkStrength: 0.7,
  centerStrength: 0.03,
  collideRadius: 40,
  collideStrength: 0.85,
  cooldownTime: 2000,
  warmupTicks: 100,
  zoomToFitDuration: 500,
  zoomToFitPadding: 80,
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
  vx?: number
  vy?: number
  fx?: number
  fy?: number
  _neighbors?: Set<string>
  _prerequisites?: Set<string>
  _dependents?: Set<string>
  _depth?: number
  _state?: NodeState
}

export interface GraphLink {
  source: string | GraphNode
  target: string | GraphNode
}

export function getNodeRadius(difficulty: number): number {
  return 6 + difficulty * 3
}

export function getNodeColor(node: GraphNode): string {
  if (node._state === "completed") return NODE_STATE_COLORS.completed
  if (node._state === "in_progress") return NODE_STATE_COLORS.in_progress
  if (node._state === "start_here") return NODE_STATE_COLORS.start_here
  if (node._state === "unlocked") return NODE_STATE_COLORS.unlocked
  if (node._state === "locked") return NODE_STATE_COLORS.locked
  return MASTERY_COLORS[node.mastery] ?? MASTERY_COLORS.not_started
}

function getLinkId(link: GraphLink): { src: string; tgt: string } {
  const src = typeof link.source === "string" ? link.source : link.source.id
  const tgt = typeof link.target === "string" ? link.target : link.target.id
  return { src, tgt }
}

export function buildDirectedAdjacency(
  nodes: GraphNode[],
  links: GraphLink[]
): {
  undirected: Map<string, Set<string>>
  prerequisites: Map<string, Set<string>>
  dependents: Map<string, Set<string>>
} {
  const undirected = new Map<string, Set<string>>()
  const prerequisites = new Map<string, Set<string>>()
  const dependents = new Map<string, Set<string>>()

  for (const n of nodes) {
    undirected.set(n.id, new Set())
    prerequisites.set(n.id, new Set())
    dependents.set(n.id, new Set())
  }

  for (const l of links) {
    const { src, tgt } = getLinkId(l)
    undirected.get(src)?.add(tgt)
    undirected.get(tgt)?.add(src)
    prerequisites.get(tgt)?.add(src)
    dependents.get(src)?.add(tgt)
  }

  return { undirected, prerequisites, dependents }
}

function computeNodeState(
  node: GraphNode,
  prerequisites: Map<string, Set<string>>,
  nodeMap: Map<string, GraphNode>
): NodeState {
  if (node.mastery === "mastered") return "completed"
  if (node.mastery === "learning" || node.mastery === "weak") return "in_progress"

  const prereqs = prerequisites.get(node.id) ?? new Set()

  if (prereqs.size === 0) return "start_here"

  const allPrereqsMet = [...prereqs].every((pid) => {
    const prereqNode = nodeMap.get(pid)
    return prereqNode && (prereqNode.mastery === "mastered" || prereqNode.mastery === "learning")
  })

  return allPrereqsMet ? "unlocked" : "locked"
}

/**
 * Top-down DAG layout: roots at top, layers flow downward.
 * Computes readiness state, neighbor sets, and initial x/y positions.
 */
export function computeInitialPositions(
  nodes: GraphNode[],
  links: GraphLink[],
  width: number,
  height: number
): GraphNode[] {
  if (nodes.length === 0) return nodes

  const { undirected, prerequisites, dependents } = buildDirectedAdjacency(nodes, links)
  const nodeMap = new Map(nodes.map((n) => [n.id, n]))

  for (const n of nodes) {
    n._neighbors = undirected.get(n.id) ?? new Set()
    n._prerequisites = prerequisites.get(n.id) ?? new Set()
    n._dependents = dependents.get(n.id) ?? new Set()
    n._state = computeNodeState(n, prerequisites, nodeMap)
  }

  const inDegree = new Map<string, number>()
  for (const n of nodes) inDegree.set(n.id, 0)
  for (const l of links) {
    const { tgt } = getLinkId(l)
    inDegree.set(tgt, (inDegree.get(tgt) ?? 0) + 1)
  }

  const roots = nodes.filter((n) => (inDegree.get(n.id) ?? 0) === 0)
  if (roots.length === 0) roots.push(nodes[0])

  const visited = new Set<string>()
  const layers: string[][] = []

  let queue = roots.map((r) => r.id)
  for (const id of queue) visited.add(id)

  while (queue.length > 0) {
    layers.push([...queue])
    const next: string[] = []
    for (const id of queue) {
      for (const dep of dependents.get(id) ?? []) {
        if (!visited.has(dep)) {
          visited.add(dep)
          next.push(dep)
        }
      }
    }
    queue = next
  }

  for (const n of nodes) {
    if (!visited.has(n.id)) {
      layers[layers.length - 1]?.push(n.id) ?? layers.push([n.id])
      visited.add(n.id)
    }
  }

  const usableHeight = height * 0.8
  const usableWidth = width * 0.7
  const layerSpacing = layers.length > 1 ? usableHeight / (layers.length - 1) : 0
  const startY = (height - usableHeight) / 2
  const cx = width / 2

  for (let layer = 0; layer < layers.length; layer++) {
    const ids = layers[layer]
    const y = layers.length === 1 ? height / 2 : startY + layer * layerSpacing
    const nodeSpacing = ids.length > 1 ? usableWidth / (ids.length - 1) : 0
    const startX = ids.length > 1 ? cx - usableWidth / 2 : cx

    for (let i = 0; i < ids.length; i++) {
      const node = nodeMap.get(ids[i])
      if (!node) continue
      node.x = startX + i * nodeSpacing
      node.y = y
      node._depth = layer
    }
  }

  return nodes
}

/**
 * Find the best "suggested next" node:
 * 1. First unlocked node (prerequisites met, not started)
 * 2. First start_here node if nothing unlocked
 * 3. First in_progress node if everything is started
 */
export function getSuggestedNext(nodes: GraphNode[]): GraphNode | null {
  const startNodes = nodes.filter((n) => n._state === "start_here")
  const unlocked = nodes.filter((n) => n._state === "unlocked")
  const inProgress = nodes.filter((n) => n._state === "in_progress")

  if (unlocked.length > 0) return unlocked[0]
  if (startNodes.length > 0) return startNodes[0]
  if (inProgress.length > 0) return inProgress[0]
  return null
}
