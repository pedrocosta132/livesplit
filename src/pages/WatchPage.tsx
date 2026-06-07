import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { StreamHeader } from "@/components/StreamHeader"
import { PlayerProtector } from "@/components/PlayerProtector"
import { TwitchChat } from "@/components/TwitchChat"
import { TwitchPlayer } from "@/components/TwitchPlayer"
import { YoutubePlayer, type YoutubePlayerHandle } from "@/components/YoutubePlayer"
import { openTwitchChatPopout } from "@/lib/chat"
import { getPair, touchPair } from "@/lib/storage"
import { resolveStreamSource } from "@/lib/stream"
import { cn } from "@/lib/utils"
import { usePreferencesStore } from "@/stores/preferences-store"
import type { StreamPair, StreamSource } from "@/types/stream-pair"

type LoadedPair =
  | { status: "ok"; pair: StreamPair; stream: StreamSource }
  | { status: "missing-id" }
  | { status: "not-found" }
  | { status: "invalid-stream"; error: string }

function loadPair(pairId: string | undefined): LoadedPair {
  if (!pairId) return { status: "missing-id" }

  const stored = getPair(pairId)
  if (!stored) return { status: "not-found" }

  const stream = resolveStreamSource(stored)
  if (!stream.ok) return { status: "invalid-stream", error: stream.error }

  return { status: "ok", pair: stored, stream: stream.value }
}

export function WatchPage() {
  const { pairId } = useParams<{ pairId: string }>()
  const navigate = useNavigate()
  const containerRef = useRef<HTMLDivElement>(null)
  const youtubePlayerRef = useRef<YoutubePlayerHandle>(null)
  const touchedPairIdRef = useRef<string | null>(null)

  const loaded = useMemo(() => loadPair(pairId), [pairId])

  const chatVisible = usePreferencesStore((state) => state.chatVisible)
  const chatMode = usePreferencesStore((state) => state.chatMode)
  const protectorEnabled = usePreferencesStore((state) => state.protectorEnabled)

  const [pairOverride, setPairOverride] = useState<StreamPair | null>(null)
  const [streamOverride, setStreamOverride] = useState<StreamSource | null>(null)
  const [playerRefreshKey, setPlayerRefreshKey] = useState(0)
  const [chatRefreshKey, setChatRefreshKey] = useState(0)
  const [youtubeMuted, setYoutubeMuted] = useState(false)
  const [youtubeVolume, setYoutubeVolume] = useState(100)
  const popoutOpenedRef = useRef<string | null>(null)

  useEffect(() => {
    if (loaded.status === "missing-id") {
      navigate("/", { replace: true })
      return
    }

    if (loaded.status === "not-found") {
      navigate("/", { replace: true, state: { error: "Stream pair not found." } })
      return
    }

    if (loaded.status === "invalid-stream") {
      navigate("/", { replace: true, state: { error: loaded.error } })
      return
    }

    if (pairId && touchedPairIdRef.current !== pairId) {
      touchedPairIdRef.current = pairId
      touchPair(pairId)
    }
  }, [loaded, navigate, pairId])

  useEffect(() => {
    if (loaded.status !== "ok" || chatMode !== "logged-in" || !pairId) return
    if (popoutOpenedRef.current === pairId) return

    popoutOpenedRef.current = pairId
    openTwitchChatPopout(loaded.pair.twitchChannel)
  }, [loaded, chatMode, pairId])

  const pair =
    pairOverride ?? (loaded.status === "ok" ? loaded.pair : null)
  const stream =
    streamOverride ?? (loaded.status === "ok" ? loaded.stream : null)

  if (loaded.status !== "ok" || !pair || !stream) {
    return (
      <div className="flex h-dvh items-center justify-center bg-background text-muted-foreground">
        Loading stream...
      </div>
    )
  }

  return (
    <div ref={containerRef} className="flex h-dvh flex-col overflow-hidden bg-background">
      <StreamHeader
        pair={pair}
        stream={stream}
        youtubeMuted={youtubeMuted}
        youtubeVolume={youtubeVolume}
        containerRef={containerRef}
        onHome={() => navigate("/")}
        onRefreshPlayer={() => setPlayerRefreshKey((key) => key + 1)}
        onRefreshChat={() => setChatRefreshKey((key) => key + 1)}
        onToggleYoutubeMute={() => youtubePlayerRef.current?.toggleMute()}
        onYoutubeVolumeChange={(volume) => youtubePlayerRef.current?.setVolume(volume)}
        onPairUpdated={(updated) => {
          setPairOverride(updated)
          const resolved = resolveStreamSource(updated)
          if (resolved.ok) setStreamOverride(resolved.value)
        }}
      />

      <div className="flex min-h-0 flex-1">
        <div className="relative min-h-0 min-w-0 flex-1 overflow-hidden bg-black @container">
          {stream.platform === "youtube" ? (
            <YoutubePlayer
              ref={youtubePlayerRef}
              videoId={stream.videoId}
              refreshKey={playerRefreshKey}
              onMuteChange={setYoutubeMuted}
              onVolumeChange={setYoutubeVolume}
            />
          ) : (
            <TwitchPlayer channel={stream.channel} refreshKey={playerRefreshKey} />
          )}

          {protectorEnabled && <PlayerProtector />}
        </div>

        <aside
          className={cn(
            "shrink-0 overflow-hidden border-l bg-background transition-[width] duration-200",
            chatVisible ? "w-[340px]" : "w-0 border-transparent",
          )}
          aria-hidden={!chatVisible}
        >
          <div className="h-full w-[340px]">
            <TwitchChat
              channel={pair.twitchChannel}
              refreshKey={chatRefreshKey}
              useLoggedInWindow={chatMode === "logged-in"}
            />
          </div>
        </aside>
      </div>
    </div>
  )
}
