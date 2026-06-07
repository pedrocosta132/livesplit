import { Clock, MessageSquare, MonitorPlay, Pencil, Play, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getStreamOpenUrl, resolveStreamSource } from "@/lib/stream"
import { buildTwitchChannelUrl } from "@/lib/urls"
import { cn } from "@/lib/utils"
import type { StreamPair } from "@/types/stream-pair"

interface PairCardProps {
  pair: StreamPair
  onWatch: (id: string) => void
  onEdit: (pair: StreamPair) => void
  onDelete: (id: string) => void
}

function formatRelativeTime(timestamp: number): string {
  const diffMs = Date.now() - timestamp
  const minutes = Math.floor(diffMs / 60_000)
  const hours = Math.floor(diffMs / 3_600_000)
  const days = Math.floor(diffMs / 86_400_000)

  if (minutes < 1) return "Just now"
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`

  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
    new Date(timestamp)
  )
}

const platformStyles = {
  youtube: {
    label: "YouTube",
    accent: "bg-red-500",
    badge: "border-red-500/20 bg-red-500/10 text-red-400",
    icon: "text-red-400",
  },
  twitch: {
    label: "Twitch",
    accent: "bg-[#9147ff]",
    badge: "border-[#9147ff]/20 bg-[#9147ff]/10 text-[#bf94ff]",
    icon: "text-[#9147ff]",
  },
} as const

export function PairCard({ pair, onWatch, onEdit, onDelete }: PairCardProps) {
  const platform = platformStyles[pair.streamPlatform]
  const stream = resolveStreamSource(pair)
  const streamHref = stream.ok ? getStreamOpenUrl(stream.value) : pair.streamUrl
  const chatHref = buildTwitchChannelUrl(pair.twitchChannel)

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card/50",
        "transition-all hover:border-brand/25 hover:bg-card hover:shadow-md hover:shadow-brand/5"
      )}
    >
      <div className={cn("absolute inset-y-0 left-0 w-1", platform.accent)} />

      <div className="flex flex-1 flex-col gap-4 p-4 pl-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <h3 className="truncate font-medium leading-snug">{pair.name}</h3>
            <a
              href={streamHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 truncate text-sm text-muted-foreground hover:underline"
              onClick={(event) => event.stopPropagation()}
            >
              <MonitorPlay className={cn("size-3.5 shrink-0", platform.icon)} />
              <span className="truncate">{pair.streamUrl}</span>
            </a>
            <a
              href={chatHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 truncate text-sm text-muted-foreground hover:underline"
              onClick={(event) => event.stopPropagation()}
            >
              <MessageSquare className="size-3.5 shrink-0 text-[#9147ff]" />
              <span className="truncate">twitch.tv/{pair.twitchChannel}</span>
            </a>
          </div>
          <Badge variant="outline" className={cn("shrink-0", platform.badge)}>
            {platform.label}
          </Badge>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="size-3" />
          <span>{formatRelativeTime(pair.lastUsedAt)}</span>
        </div>
      </div>

      <div className="flex items-center gap-1 border-t border-border/50 bg-muted/30 p-2 pl-3">
        <Button
          className="flex-1 bg-brand text-brand-foreground hover:bg-brand/90"
          size="sm"
          onClick={() => onWatch(pair.id)}
        >
          <Play data-icon="inline-start" />
          Watch
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground hover:text-foreground"
          onClick={() => onEdit(pair)}
        >
          <Pencil />
          <span className="sr-only">Edit</span>
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground hover:text-destructive"
          onClick={() => onDelete(pair.id)}
        >
          <Trash2 />
          <span className="sr-only">Delete</span>
        </Button>
      </div>
    </article>
  )
}
