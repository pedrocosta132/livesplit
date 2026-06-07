import { useMemo, useRef, useState } from "react"
import { ArrowRight, Bookmark } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"
import { FeaturesSection } from "@/components/landing/FeaturesSection"
import { HeroPreview } from "@/components/landing/HeroPreview"
import { HowItWorksSection } from "@/components/landing/HowItWorksSection"
import { LandingFooter } from "@/components/landing/LandingFooter"
import { LandingNav } from "@/components/landing/LandingNav"
import { PairCard } from "@/components/PairCard"
import { PairForm } from "@/components/PairForm"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  deletePair,
  loadPairs,
  sortPairsByLastUsed,
  upsertPair,
} from "@/lib/storage"
import { parseStreamInput } from "@/lib/stream"
import { parseTwitchChannel } from "@/lib/urls"
import type { PairFormValues, StreamPair } from "@/types/stream-pair"

export function HomePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const getStartedRef = useRef<HTMLElement>(null)

  const redirectError =
    typeof location.state === "object" &&
    location.state !== null &&
    "error" in location.state &&
    typeof location.state.error === "string"
      ? location.state.error
      : null

  const [pairs, setPairs] = useState<StreamPair[]>(() => sortPairsByLastUsed(loadPairs()))
  const [editingPair, setEditingPair] = useState<StreamPair | null>(null)

  const sortedPairs = useMemo(() => sortPairsByLastUsed(pairs), [pairs])

  function scrollToGetStarted() {
    getStartedRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  function createPairFromValues(values: PairFormValues): StreamPair | null {
    const stream = parseStreamInput(values.streamInput)
    const twitch = parseTwitchChannel(values.twitchInput)
    if (!stream.ok || !twitch.ok) return null

    const now = Date.now()
    return {
      id: crypto.randomUUID(),
      name: values.name.trim() || twitch.value,
      streamPlatform: stream.value.platform,
      streamUrl: stream.value.url,
      twitchChannel: twitch.value,
      createdAt: now,
      lastUsedAt: now,
    }
  }

  function handleSaveAndWatch(values: PairFormValues) {
    const pair = createPairFromValues(values)
    if (!pair) return

    upsertPair(pair)
    navigate(`/watch/${pair.id}`)
  }

  function handleEditSubmit(values: PairFormValues) {
    if (!editingPair) return

    const stream = parseStreamInput(values.streamInput)
    const twitch = parseTwitchChannel(values.twitchInput)
    if (!stream.ok || !twitch.ok) return

    const updated: StreamPair = {
      ...editingPair,
      name: values.name.trim() || twitch.value,
      streamPlatform: stream.value.platform,
      streamUrl: stream.value.url,
      twitchChannel: twitch.value,
    }

    upsertPair(updated)
    setPairs(sortPairsByLastUsed(loadPairs()))
    setEditingPair(null)
  }

  function handleDelete(id: string) {
    deletePair(id)
    setPairs(sortPairsByLastUsed(loadPairs()))
  }

  function handleWatch(id: string) {
    navigate(`/watch/${id}`)
  }

  return (
    <div className="min-h-dvh bg-background">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[520px] w-[720px] -translate-x-1/2 rounded-full bg-brand/8 blur-3xl" />
        <div className="absolute top-1/3 right-0 h-64 w-64 rounded-full bg-brand/5 blur-3xl" />
      </div>

      <LandingNav onGetStarted={scrollToGetStarted} />

      <main className="mx-auto max-w-6xl px-4 sm:px-6">
        <section className="grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-2 lg:gap-16">
          <div className="text-center lg:text-left">
            <Badge variant="secondary" className="mb-4 border-brand/20 bg-brand/10 text-brand">
              Stream + Twitch chat, unified
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
              Watch anywhere.
              <span className="block text-brand">Chat on Twitch.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-lg text-lg text-muted-foreground lg:mx-0">
              Pair a YouTube or Twitch stream with Twitch chat in one layout.
              Save your setups and pick up right where you left off.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
              <Button size="lg" onClick={scrollToGetStarted}>
                Start watching
                <ArrowRight data-icon="inline-end" />
              </Button>
              {sortedPairs.length > 0 && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() =>
                    document.getElementById("saved-pairs")?.scrollIntoView({
                      behavior: "smooth",
                    })
                  }
                >
                  <Bookmark data-icon="inline-start" />
                  {sortedPairs.length} saved pair{sortedPairs.length === 1 ? "" : "s"}
                </Button>
              )}
            </div>
          </div>

          <HeroPreview />
        </section>

        <section
          ref={getStartedRef}
          id="get-started"
          className="scroll-mt-20 pb-16 sm:pb-20"
        >
          <Card className="overflow-hidden border-border/80 bg-card/80 shadow-lg shadow-brand/5 backdrop-blur-sm">
            <div className="h-1 bg-gradient-to-r from-brand/60 via-brand to-[#9147ff]/80" />
            <CardHeader className="border-b border-border/60 pb-5">
              <CardTitle className="text-xl">Quick start</CardTitle>
              <CardDescription>
                Link your stream to a Twitch chat channel — we&apos;ll handle the layout.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {redirectError && (
                <Alert variant="destructive" className="mb-6">
                  <AlertDescription>{redirectError}</AlertDescription>
                </Alert>
              )}
              <PairForm
                variant="landing"
                submitLabel="Save & Watch"
                onSubmit={handleSaveAndWatch}
              />
            </CardContent>
          </Card>
        </section>

        <FeaturesSection />
        <HowItWorksSection />

        <section id="saved-pairs" className="scroll-mt-20 border-t border-border/60 pb-16 sm:pb-20">
          <div className="mb-6 flex items-end justify-between gap-4 pt-16 sm:pt-20">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Saved pairs</h2>
              <p className="mt-1 text-muted-foreground">
                Your recent stream + chat combos, stored locally.
              </p>
            </div>
            {sortedPairs.length > 0 && (
              <Badge variant="secondary">{sortedPairs.length}</Badge>
            )}
          </div>

          {sortedPairs.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-14 text-center">
                <Bookmark className="mx-auto mb-3 size-8 text-muted-foreground/50" />
                <p className="font-medium">No saved pairs yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Add your first stream + Twitch chat combo above to get started.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sortedPairs.map((pair) => (
                <PairCard
                  key={pair.id}
                  pair={pair}
                  onWatch={handleWatch}
                  onEdit={setEditingPair}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </section>

        <LandingFooter />
      </main>

      <Dialog open={editingPair !== null} onOpenChange={(open) => !open && setEditingPair(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit stream pair</DialogTitle>
          </DialogHeader>
          {editingPair && (
            <PairForm
              initialValues={{
                name: editingPair.name,
                streamInput: editingPair.streamUrl,
                twitchInput: editingPair.twitchChannel,
              }}
              submitLabel="Save changes"
              onSubmit={handleEditSubmit}
              onCancel={() => setEditingPair(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
