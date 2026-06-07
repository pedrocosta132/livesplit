import { LogIn, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { openTwitchChatPopout } from "@/lib/chat"
import { buildTwitchChatEmbedUrl } from "@/lib/urls"

interface TwitchChatProps {
  channel: string
  refreshKey: number
  useLoggedInWindow?: boolean
}

function LoggedInChatPanel({ channel }: { channel: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
      <MessageSquare className="size-8 text-muted-foreground" />
      <p className="text-sm font-medium">Logged-in chat window</p>
      <Button onClick={() => openTwitchChatPopout(channel)}>
        <LogIn data-icon="inline-start" />
        Open logged-in chat
      </Button>
    </div>
  )
}

export function TwitchChat({ channel, refreshKey, useLoggedInWindow = false }: TwitchChatProps) {
  if (useLoggedInWindow) {
    return <LoggedInChatPanel channel={channel} />
  }

  const src = buildTwitchChatEmbedUrl(channel)

  return (
    <iframe
      key={`${channel}-${refreshKey}`}
      src={src}
      title={`Twitch chat for ${channel}`}
      className="h-full w-full border-0"
      allow="clipboard-write; fullscreen"
    />
  )
}
