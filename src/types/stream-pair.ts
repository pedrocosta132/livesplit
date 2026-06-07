export type StreamPlatform = "youtube" | "twitch"

export interface StreamPair {
  id: string
  name: string
  streamPlatform: StreamPlatform
  streamUrl: string
  twitchChannel: string
  createdAt: number
  lastUsedAt: number
}

export interface PairFormValues {
  name: string
  streamInput: string
  twitchInput: string
}

export type YoutubeStreamSource = {
  platform: "youtube"
  videoId: string
  url: string
}

export type TwitchStreamSource = {
  platform: "twitch"
  channel: string
  url: string
}

export type StreamSource = YoutubeStreamSource | TwitchStreamSource
