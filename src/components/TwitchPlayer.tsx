import { buildTwitchPlayerEmbedUrl } from "@/lib/urls"

interface TwitchPlayerProps {
  channel: string
  refreshKey: number
}

export function TwitchPlayer({ channel, refreshKey }: TwitchPlayerProps) {
  const src = buildTwitchPlayerEmbedUrl(channel)

  return (
    <div className="flex h-full min-h-0 w-full items-center justify-center overflow-hidden bg-black">
      <div className="aspect-video overflow-hidden [height:min(100cqh,calc(100cqw*9/16))] [width:min(100cqw,calc(100cqh*16/9))]">
        <iframe
          key={`${channel}-${refreshKey}`}
          src={src}
          title={`Twitch stream for ${channel}`}
          className="h-full w-full border-0"
          allowFullScreen
        />
      </div>
    </div>
  )
}
