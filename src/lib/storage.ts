import { normalizePair } from "@/lib/stream"
import type { StreamPair } from "@/types/stream-pair"

const PAIRS_KEY = "livesplit:pairs"

export function loadPairs(): StreamPair[] {
  try {
    const raw = localStorage.getItem(PAIRS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []

    return parsed
      .map((item) => normalizePair(item as Parameters<typeof normalizePair>[0]))
      .filter((pair): pair is StreamPair => pair !== null)
  } catch {
    return []
  }
}

export function savePairs(pairs: StreamPair[]): void {
  localStorage.setItem(PAIRS_KEY, JSON.stringify(pairs))
}

export function getPair(id: string): StreamPair | undefined {
  return loadPairs().find((pair) => pair.id === id)
}

export function upsertPair(pair: StreamPair): StreamPair[] {
  const pairs = loadPairs()
  const index = pairs.findIndex((item) => item.id === pair.id)
  if (index >= 0) {
    pairs[index] = pair
  } else {
    pairs.push(pair)
  }
  savePairs(pairs)
  return pairs
}

export function deletePair(id: string): StreamPair[] {
  const pairs = loadPairs().filter((pair) => pair.id !== id)
  savePairs(pairs)
  return pairs
}

export function touchPair(id: string): StreamPair | undefined {
  const pairs = loadPairs()
  const index = pairs.findIndex((pair) => pair.id === id)
  if (index < 0) return undefined

  const updated = { ...pairs[index], lastUsedAt: Date.now() }
  pairs[index] = updated
  savePairs(pairs)
  return updated
}

export function sortPairsByLastUsed(pairs: StreamPair[]): StreamPair[] {
  return [...pairs].sort((a, b) => b.lastUsedAt - a.lastUsedAt)
}
