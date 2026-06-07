import { MessageSquare, Play } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const chatLines = [
  { user: "nightowl", color: "text-violet-400", message: "LET'S GOOO" },
  { user: "speedrun_fan", color: "text-sky-400", message: "pb incoming" },
  { user: "chatmod", color: "text-emerald-400", message: "welcome everyone!" },
  { user: "viewer42", color: "text-amber-400", message: "this split is clean" },
]

export function HeroPreview() {
  return (
    <div className="relative mx-auto w-full max-w-lg">
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-8 rounded-full bg-brand/20 blur-3xl"
      />
      <div className="relative overflow-hidden rounded-xl border border-border/80 bg-card shadow-2xl shadow-brand/10">
        <div className="flex items-center gap-2 border-b border-border/60 bg-muted/40 px-3 py-2">
          <div className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-red-500/80" />
            <span className="size-2.5 rounded-full bg-amber-500/80" />
            <span className="size-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <span className="ml-2 text-xs text-muted-foreground">livesplit — watch mode</span>
        </div>

        <div className="flex aspect-[16/10]">
          <div className="relative flex min-w-0 flex-1 flex-col bg-zinc-950">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,oklch(0.35_0.12_285)_0%,transparent_70%)]" />
            <div className="relative flex flex-1 items-center justify-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20 backdrop-blur-sm">
                <Play className="size-6 fill-white text-white" />
              </div>
            </div>
            <div className="relative border-t border-white/10 px-3 py-2">
              <Badge variant="secondary" className="bg-white/10 text-[10px] text-white">
                YouTube stream
              </Badge>
            </div>
          </div>

          <div className="flex w-[38%] shrink-0 flex-col border-l border-border/60 bg-[#0e0e10]">
            <div className="flex items-center gap-1.5 border-b border-white/10 px-2.5 py-2">
              <MessageSquare className="size-3 text-[#9147ff]" />
              <span className="truncate text-[10px] font-medium text-white/90">
                Twitch chat
              </span>
            </div>
            <div className="flex flex-1 flex-col gap-2 overflow-hidden p-2.5">
              {chatLines.map((line) => (
                <p key={line.user} className="text-[9px] leading-snug">
                  <span className={`font-semibold ${line.color}`}>{line.user}</span>
                  <span className="text-white/50">: </span>
                  <span className="text-white/80">{line.message}</span>
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
