type ParseResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string }

export function parseYoutubeVideoId(input: string): ParseResult<string> {
  const trimmed = input.trim()
  if (!trimmed) {
    return { ok: false, error: "YouTube URL is required." }
  }

  try {
    const url = trimmed.startsWith("http") ? new URL(trimmed) : new URL(`https://${trimmed}`)
    const host = url.hostname.replace(/^www\./, "")

    if (host === "youtu.be") {
      const id = url.pathname.slice(1).split("/")[0]
      if (id) return { ok: true, value: id }
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      if (url.pathname === "/watch") {
        const id = url.searchParams.get("v")
        if (id) return { ok: true, value: id }
      }

      const liveMatch = url.pathname.match(/^\/live\/([^/?]+)/)
      if (liveMatch?.[1]) return { ok: true, value: liveMatch[1] }

      const embedMatch = url.pathname.match(/^\/embed\/([^/?]+)/)
      if (embedMatch?.[1]) return { ok: true, value: embedMatch[1] }

      const shortsMatch = url.pathname.match(/^\/shorts\/([^/?]+)/)
      if (shortsMatch?.[1]) return { ok: true, value: shortsMatch[1] }
    }
  } catch {
    // fall through to raw ID check
  }

  if (/^[\w-]{11}$/.test(trimmed)) {
    return { ok: true, value: trimmed }
  }

  return {
    ok: false,
    error: "Invalid YouTube URL. Use a watch, live, or youtu.be link.",
  }
}

export function parseTwitchChannel(input: string): ParseResult<string> {
  const trimmed = input.trim()
  if (!trimmed) {
    return { ok: false, error: "Twitch URL or channel name is required." }
  }

  try {
    const url = trimmed.startsWith("http") ? new URL(trimmed) : new URL(`https://${trimmed}`)
    const host = url.hostname.replace(/^www\./, "")

    if (host === "twitch.tv" || host === "m.twitch.tv") {
      const segments = url.pathname.split("/").filter(Boolean)
      const channel = segments[0]
      if (channel && !["directory", "videos", "settings"].includes(channel)) {
        return { ok: true, value: channel.toLowerCase() }
      }
    }
  } catch {
    // fall through to channel name check
  }

  if (/^[a-zA-Z0-9_]{3,25}$/.test(trimmed)) {
    return { ok: true, value: trimmed.toLowerCase() }
  }

  return {
    ok: false,
    error: "Invalid Twitch URL or channel name.",
  }
}

export function getYoutubePlayerVars(): Record<string, string | number> {
  return {
    autoplay: 1,
    controls: 1,
    rel: 0,
    iv_load_policy: 3,
    enablejsapi: 1,
    origin: window.location.origin,
    playsinline: 1,
  }
}

export function buildYoutubeEmbedUrl(videoId: string): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(getYoutubePlayerVars())) {
    params.set(key, String(value))
  }
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`
}

function getTwitchEmbedParent(override?: string): string {
  if (override) return override
  const fromEnv = import.meta.env.VITE_TWITCH_PARENT_HOST?.trim()
  if (fromEnv) return fromEnv
  return window.location.hostname
}

export function buildTwitchChatEmbedUrl(channel: string, parent?: string): string {
  const params = new URLSearchParams({
    parent: getTwitchEmbedParent(parent),
    darkpopout: "",
  })
  return `https://www.twitch.tv/embed/${channel}/chat?${params.toString()}`
}

export function buildTwitchChannelUrl(channel: string): string {
  return `https://www.twitch.tv/${channel}`
}

export function buildTwitchPlayerEmbedUrl(channel: string, parent?: string): string {
  const params = new URLSearchParams({
    channel,
    parent: getTwitchEmbedParent(parent),
    autoplay: "true",
  })
  return `https://player.twitch.tv/?${params.toString()}`
}
