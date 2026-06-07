import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react"
import { loadYoutubeApi } from "@/lib/youtube-api"
import { getYoutubePlayerVars } from "@/lib/urls"

export interface YoutubePlayerHandle {
  toggleMute: () => void
  isMuted: () => boolean
  getVolume: () => number
  setVolume: (volume: number) => void
}

interface YoutubePlayerProps {
  videoId: string
  refreshKey: number
  onMuteChange?: (muted: boolean) => void
  onVolumeChange?: (volume: number) => void
}

export const YoutubePlayer = forwardRef<YoutubePlayerHandle, YoutubePlayerProps>(
  function YoutubePlayer({ videoId, refreshKey, onMuteChange, onVolumeChange }, ref) {
    const playerTargetRef = useRef<HTMLDivElement>(null)
    const playerRef = useRef<YT.Player | null>(null)
    const onMuteChangeRef = useRef(onMuteChange)
    const onVolumeChangeRef = useRef(onVolumeChange)

    onMuteChangeRef.current = onMuteChange
    onVolumeChangeRef.current = onVolumeChange

    useImperativeHandle(ref, () => ({
      toggleMute() {
        const player = playerRef.current
        if (!player) return

        if (player.isMuted()) {
          player.unMute()
          if (player.getVolume() === 0) {
            player.setVolume(50)
            onVolumeChangeRef.current?.(50)
          }
          onMuteChangeRef.current?.(false)
        } else {
          player.mute()
          onMuteChangeRef.current?.(true)
        }
      },
      isMuted() {
        return playerRef.current?.isMuted() ?? false
      },
      getVolume() {
        return playerRef.current?.getVolume() ?? 100
      },
      setVolume(volume: number) {
        const player = playerRef.current
        if (!player) return

        const clamped = Math.max(0, Math.min(100, Math.round(volume)))
        player.setVolume(clamped)

        if (clamped === 0) {
          player.mute()
          onMuteChangeRef.current?.(true)
        } else if (player.isMuted()) {
          player.unMute()
          onMuteChangeRef.current?.(false)
        }

        onVolumeChangeRef.current?.(clamped)
      },
    }))

    useEffect(() => {
      let cancelled = false

      void loadYoutubeApi().then(() => {
        if (cancelled || !playerTargetRef.current) return

        playerRef.current = new YT.Player(playerTargetRef.current, {
          videoId,
          width: "100%",
          height: "100%",
          playerVars: getYoutubePlayerVars(),
          events: {
            onReady(event) {
              onMuteChangeRef.current?.(event.target.isMuted())
              onVolumeChangeRef.current?.(event.target.getVolume())
            },
          },
        })
      })

      return () => {
        cancelled = true
        playerRef.current?.destroy()
        playerRef.current = null
      }
    }, [videoId, refreshKey])

    return (
      <div className="flex h-full min-h-0 w-full items-center justify-center overflow-hidden bg-black">
        <div className="aspect-video overflow-hidden [height:min(100cqh,calc(100cqw*9/16))] [width:min(100cqw,calc(100cqh*16/9))]">
          <div ref={playerTargetRef} className="h-full w-full overflow-hidden [&_iframe]:block [&_iframe]:h-full [&_iframe]:w-full [&_iframe]:border-0" />
        </div>
      </div>
    )
  },
)
