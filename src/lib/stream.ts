import {
  parseTwitchChannel,
  parseYoutubeVideoId,
} from "@/lib/urls"
import type { StreamPair, StreamSource } from "@/types/stream-pair"

type ParseResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string }

type StoredPair = Partial<StreamPair> & {
  id?: string
  name?: string
  twitchChannel?: string
  createdAt?: number
  lastUsedAt?: number
  youtubeUrl?: string
}

export function parseStreamInput(input: string): ParseResult<StreamSource> {
  const trimmed = input.trim()
  if (!trimmed) {
    return { ok: false, error: "Stream URL is required." }
  }

  const youtube = parseYoutubeVideoId(trimmed)
  if (youtube.ok) {
    return {
      ok: true,
      value: {
        platform: "youtube",
        videoId: youtube.value,
        url: trimmed,
      },
    }
  }

  const twitch = parseTwitchChannel(trimmed)
  if (twitch.ok) {
    return {
      ok: true,
      value: {
        platform: "twitch",
        channel: twitch.value,
        url: trimmed,
      },
    }
  }

  return {
    ok: false,
    error: "Invalid stream URL. Use a YouTube or Twitch link.",
  }
}

export function normalizePair(raw: StoredPair): StreamPair | null {
  if (!raw.id || !raw.twitchChannel || !raw.createdAt || !raw.lastUsedAt) {
    return null
  }

  const streamUrl = raw.streamUrl ?? raw.youtubeUrl
  if (!streamUrl) return null

  const stream = parseStreamInput(streamUrl)
  if (!stream.ok) {
    if (raw.streamPlatform) {
      return {
        id: raw.id,
        name: raw.name ?? raw.twitchChannel,
        streamPlatform: raw.streamPlatform,
        streamUrl,
        twitchChannel: raw.twitchChannel,
        createdAt: raw.createdAt,
        lastUsedAt: raw.lastUsedAt,
      }
    }
    return null
  }

  return {
    id: raw.id,
    name: raw.name ?? raw.twitchChannel,
    streamPlatform: stream.value.platform,
    streamUrl: stream.value.url,
    twitchChannel: raw.twitchChannel,
    createdAt: raw.createdAt,
    lastUsedAt: raw.lastUsedAt,
  }
}

export function resolveStreamSource(pair: StreamPair): ParseResult<StreamSource> {
  return parseStreamInput(pair.streamUrl)
}

export function getStreamOpenUrl(source: StreamSource): string {
  if (source.platform === "youtube") return source.url
  return `https://www.twitch.tv/${source.channel}`
}
