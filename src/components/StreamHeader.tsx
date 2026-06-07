import { useRef, useState } from "react"
import {
  ExternalLink,
  Home,
  LogIn,
  Maximize,
  MessageSquare,
  MessageSquareOff,
  Moon,
  PanelRightOpen,
  Pencil,
  RefreshCw,
  Shield,
  ShieldCheck,
  Sun,
  Volume2,
  VolumeX,
} from "lucide-react"
import { PairForm } from "@/components/PairForm"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { openTwitchChatPopout } from "@/lib/chat"
import { upsertPair } from "@/lib/storage"
import { getStreamOpenUrl, parseStreamInput } from "@/lib/stream"
import { usePreferencesStore } from "@/stores/preferences-store"
import {
  buildTwitchChannelUrl,
  parseTwitchChannel,
} from "@/lib/urls"
import type { PairFormValues, StreamPair, StreamSource } from "@/types/stream-pair"
import { cn } from "@/lib/utils"

interface StreamHeaderProps {
  pair: StreamPair
  stream: StreamSource
  youtubeMuted: boolean
  youtubeVolume: number
  onHome: () => void
  onRefreshPlayer: () => void
  onRefreshChat: () => void
  onToggleYoutubeMute: () => void
  onYoutubeVolumeChange: (volume: number) => void
  onPairUpdated: (pair: StreamPair) => void
  containerRef: React.RefObject<HTMLElement | null>
}

function HeaderButton({
  label,
  onClick,
  onDoubleClick,
  children,
}: {
  label: string
  onClick?: () => void
  onDoubleClick?: () => void
  children: React.ReactNode
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onDoubleClick ? undefined : onClick}
          onDoubleClick={onDoubleClick}
        >
          {children}
          <span className="sr-only">{label}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

function HeaderSection({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-0.5">{children}</div>
}

function YoutubeVolumeControl({
  muted,
  volume,
  onToggleMute,
  onVolumeChange,
}: {
  muted: boolean
  volume: number
  onToggleMute: () => void
  onVolumeChange: (volume: number) => void
}) {
  const muteLabel = muted ? "Unmute YouTube" : "Mute YouTube"
  const [sliderOpen, setSliderOpen] = useState(false)
  const closeTimerRef = useRef<number | null>(null)
  const draggingRef = useRef(false)

  function handleMouseEnter() {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
    setSliderOpen(true)
  }

  function handleMouseLeave() {
    if (draggingRef.current) return

    closeTimerRef.current = window.setTimeout(() => setSliderOpen(false), 200)
  }

  return (
    <div className="relative flex items-center justify-center">
      <div
        className={cn(
          "absolute top-full left-1/2 z-30 -translate-x-1/2 pt-1 transition-opacity duration-150",
          sliderOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="rounded-md bg-popover px-4 py-3 shadow-md ring-1 ring-foreground/10">
          <div className="flex h-24 items-center justify-center">
            <input
              type="range"
              min={0}
              max={100}
              value={volume}
              onChange={(event) => onVolumeChange(Number(event.target.value))}
              onPointerDown={() => {
                draggingRef.current = true
              }}
              onPointerUp={() => {
                draggingRef.current = false
              }}
              onPointerCancel={() => {
                draggingRef.current = false
              }}
              aria-label="YouTube volume"
              aria-valuetext={`${volume}%`}
              className="h-24 w-1.5 cursor-pointer appearance-none bg-transparent [direction:rtl] [writing-mode:vertical-lr] [-webkit-appearance:none] [&::-moz-range-thumb]:size-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-foreground [&::-moz-range-track]:w-full [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-muted-foreground/30 [&::-webkit-slider-runnable-track]:w-full [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-muted-foreground/30 [&::-webkit-slider-thumb]:-ml-[3px] [&::-webkit-slider-thumb]:size-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-foreground"
            />
          </div>
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon-sm"
        className="relative z-20"
        onClick={onToggleMute}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {muted ? <VolumeX /> : <Volume2 />}
        <span className="sr-only">{muteLabel}</span>
      </Button>
    </div>
  )
}

export function StreamHeader({
  pair,
  stream,
  youtubeMuted,
  youtubeVolume,
  onHome,
  onRefreshPlayer,
  onRefreshChat,
  onToggleYoutubeMute,
  onYoutubeVolumeChange,
  onPairUpdated,
  containerRef,
}: StreamHeaderProps) {
  const theme = usePreferencesStore((state) => state.theme)
  const chatVisible = usePreferencesStore((state) => state.chatVisible)
  const chatMode = usePreferencesStore((state) => state.chatMode)
  const protectorEnabled = usePreferencesStore((state) => state.protectorEnabled)
  const toggleTheme = usePreferencesStore((state) => state.toggleTheme)
  const toggleChatVisible = usePreferencesStore((state) => state.toggleChatVisible)
  const toggleProtector = usePreferencesStore((state) => state.toggleProtector)
  const toggleChatMode = usePreferencesStore((state) => state.toggleChatMode)
  const [editOpen, setEditOpen] = useState(false)

  const streamPlatformLabel = stream.platform === "youtube" ? "YouTube" : "Twitch"

  function handleThemeToggle() {
    toggleTheme()
  }

  function handlePopOutChat() {
    openTwitchChatPopout(pair.twitchChannel)
  }

  function handleChatModeToggle() {
    const next = toggleChatMode()
    if (next === "logged-in") {
      openTwitchChatPopout(pair.twitchChannel)
    }
  }

  function handleFullscreen() {
    const element = containerRef.current
    if (!element) return

    if (document.fullscreenElement) {
      void document.exitFullscreen()
      return
    }

    void element.requestFullscreen()
  }

  function handleEditSubmit(values: PairFormValues) {
    const streamInput = parseStreamInput(values.streamInput)
    const twitch = parseTwitchChannel(values.twitchInput)
    if (!streamInput.ok || !twitch.ok) return

    const updated: StreamPair = {
      ...pair,
      name: values.name.trim() || twitch.value,
      streamPlatform: streamInput.value.platform,
      streamUrl: streamInput.value.url,
      twitchChannel: twitch.value,
    }

    upsertPair(updated)
    onPairUpdated(updated)
    setEditOpen(false)
  }

  return (
    <>
      <header className="relative z-20 flex h-12 shrink-0 items-center gap-3 border-b bg-background px-3">
        <h1 className="min-w-0 flex-1 truncate text-sm font-medium">{pair.name}</h1>

        <div className="flex shrink-0 items-center gap-2">
          <HeaderSection>
            <HeaderButton
              label="Double-click to refresh player"
              onDoubleClick={onRefreshPlayer}
            >
              <RefreshCw />
            </HeaderButton>

            <HeaderButton
              label={
                protectorEnabled
                  ? "Disable player protector"
                  : "Enable player protector"
              }
              onClick={toggleProtector}
            >
              {protectorEnabled ? <ShieldCheck /> : <Shield />}
            </HeaderButton>

            {stream.platform === "youtube" && (
              <YoutubeVolumeControl
                muted={youtubeMuted}
                volume={youtubeVolume}
                onToggleMute={onToggleYoutubeMute}
                onVolumeChange={onYoutubeVolumeChange}
              />
            )}

            <HeaderButton
              label={`Open ${streamPlatformLabel}`}
              onClick={() =>
                window.open(getStreamOpenUrl(stream), "_blank", "noopener,noreferrer")
              }
            >
              <ExternalLink
                className={stream.platform === "twitch" ? "text-[#9146FF]" : undefined}
              />
            </HeaderButton>
          </HeaderSection>

          <Separator orientation="vertical" className="h-6" />

          <HeaderSection>
            <HeaderButton
              label="Double-click to refresh chat"
              onDoubleClick={onRefreshChat}
            >
              <RefreshCw className="text-[#9146FF]" />
            </HeaderButton>

            <HeaderButton
              label={chatVisible ? "Hide chat" : "Show chat"}
              onClick={toggleChatVisible}
            >
              {chatVisible ? <MessageSquareOff /> : <MessageSquare />}
            </HeaderButton>

            <HeaderButton label="Open logged-in chat window" onClick={handlePopOutChat}>
              <PanelRightOpen />
            </HeaderButton>

            <HeaderButton
              label={
                chatMode === "logged-in"
                  ? "Chat mode: logged-in window (click for embedded)"
                  : "Chat mode: embedded (click for logged-in window)"
              }
              onClick={handleChatModeToggle}
            >
              <LogIn className={chatMode === "logged-in" ? "text-[#9146FF]" : undefined} />
            </HeaderButton>

            <HeaderButton
              label="Open Twitch chat channel"
              onClick={() =>
                window.open(buildTwitchChannelUrl(pair.twitchChannel), "_blank", "noopener,noreferrer")
              }
            >
              <ExternalLink className="text-[#9146FF]" />
            </HeaderButton>
          </HeaderSection>

          <Separator orientation="vertical" className="h-6" />

          <HeaderSection>
            <HeaderButton label="Home" onClick={onHome}>
              <Home />
            </HeaderButton>

            <HeaderButton label="Edit pair" onClick={() => setEditOpen(true)}>
              <Pencil />
            </HeaderButton>

            <HeaderButton label="Toggle fullscreen" onClick={handleFullscreen}>
              <Maximize />
            </HeaderButton>

            <HeaderButton
              label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
              onClick={handleThemeToggle}
            >
              {theme === "dark" ? <Sun /> : <Moon />}
            </HeaderButton>
          </HeaderSection>
        </div>
      </header>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit stream pair</DialogTitle>
          </DialogHeader>
          <PairForm
            initialValues={{
              name: pair.name,
              streamInput: pair.streamUrl,
              twitchInput: pair.twitchChannel,
            }}
            submitLabel="Save changes"
            onSubmit={handleEditSubmit}
            onCancel={() => setEditOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
