import { Bookmark, Layers, MessageSquare, Zap } from "lucide-react"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const features = [
  {
    icon: Layers,
    title: "Split-screen layout",
    description:
      "Keep the stream and Twitch chat visible at once — no more alt-tabbing between tabs.",
  },
  {
    icon: Zap,
    title: "YouTube or Twitch video",
    description:
      "Paste any supported stream URL. Pair it with the Twitch channel where chat lives.",
  },
  {
    icon: Bookmark,
    title: "Saved pairs",
    description:
      "Store your favorite stream + chat combos locally and jump back in with one click.",
  },
  {
    icon: MessageSquare,
    title: "Real Twitch chat",
    description:
      "Embedded chat or a logged-in popout window — participate the way you prefer.",
  },
] as const

export function FeaturesSection() {
  return (
    <section className="py-16 sm:py-20">
      <div className="mb-10 text-center">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Built for co-streaming viewers
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          When the action is on YouTube but the community is on Twitch, LiveSplit
          puts both in one focused view.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {features.map(({ icon: Icon, title, description }) => (
          <Card
            key={title}
            className="border-border/60 bg-card/50 transition-colors hover:border-brand/30 hover:bg-card"
          >
            <CardHeader>
              <div className="mb-1 flex size-9 items-center justify-center rounded-lg bg-brand/10 text-brand">
                <Icon className="size-4.5" />
              </div>
              <CardTitle className="text-base">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  )
}
