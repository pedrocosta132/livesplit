import { useMemo, useState } from "react"
import {
  ArrowRight,
  Info,
  MessageSquare,
  MonitorPlay,
  Tag,
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { parseStreamInput } from "@/lib/stream"
import { parseTwitchChannel } from "@/lib/urls"
import type { PairFormValues } from "@/types/stream-pair"

interface PairFormProps {
  initialValues?: Partial<PairFormValues>
  submitLabel: string
  onSubmit: (values: PairFormValues) => void
  onCancel?: () => void
  variant?: "landing" | "compact"
}

const emptyValues: PairFormValues = {
  name: "",
  streamInput: "",
  twitchInput: "",
}

function FormField({
  label,
  hint,
  htmlFor,
  labelClassName,
  children,
}: {
  label: string
  hint?: string
  htmlFor: string
  labelClassName?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <div>
        <Label htmlFor={htmlFor} className={labelClassName}>
          {label}
        </Label>
        {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
      </div>
      {children}
    </div>
  )
}

function IconInput({
  icon: Icon,
  iconClassName,
  className,
  ...props
}: React.ComponentProps<typeof Input> & {
  icon: React.ComponentType<{ className?: string }>
  iconClassName?: string
}) {
  return (
    <div className="relative">
      <Icon
        className={cn(
          "pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground",
          iconClassName
        )}
      />
      <Input className={cn("pl-9", className)} {...props} />
    </div>
  )
}

export function PairForm({
  initialValues,
  submitLabel,
  onSubmit,
  onCancel,
  variant = "compact",
}: PairFormProps) {
  const [values, setValues] = useState<PairFormValues>({
    ...emptyValues,
    ...initialValues,
  })
  const [error, setError] = useState<string | null>(null)
  const isLanding = variant === "landing"

  const isYoutubeStream = useMemo(() => {
    const trimmed = values.streamInput.trim()
    if (!trimmed) return false

    const stream = parseStreamInput(trimmed)
    return stream.ok && stream.value.platform === "youtube"
  }, [values.streamInput])

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)

    const stream = parseStreamInput(values.streamInput)
    if (!stream.ok) {
      setError(stream.error)
      return
    }

    const twitch = parseTwitchChannel(values.twitchInput)
    if (!twitch.ok) {
      setError(twitch.error)
      return
    }

    onSubmit({
      ...values,
      name: values.name.trim() || twitch.value,
      streamInput: stream.value.url,
      twitchInput: twitch.value,
    })
  }

  const inputClassName = cn(
    "h-10 bg-background/80",
    isLanding && "border-border/80 focus-visible:border-brand/50 focus-visible:ring-brand/20"
  )
  const landingLabelClassName =
    "text-xs font-medium uppercase tracking-wider text-muted-foreground"

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-4", isLanding && "space-y-5")}>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div
        className={cn(
          "space-y-4",
          isLanding && "space-y-5 rounded-xl border border-border/60 bg-muted/10 p-4 sm:p-5"
        )}
      >
        <FormField
          label="Stream source"
          hint={isLanding ? "YouTube or Twitch video — live or VOD" : undefined}
          htmlFor="streamInput"
          labelClassName={isLanding ? landingLabelClassName : undefined}
        >
          <IconInput
            id="streamInput"
            icon={MonitorPlay}
            iconClassName="text-brand"
            placeholder="https://youtube.com/watch?v=… or twitch.tv/channel"
            value={values.streamInput}
            onChange={(event) =>
              setValues((current) => ({ ...current, streamInput: event.target.value }))
            }
            className={inputClassName}
            required
          />
          {isYoutubeStream && (
            <Alert className="border-amber-500/30 bg-amber-500/10 *:data-[slot=alert-description]:text-amber-900/80 dark:*:data-[slot=alert-description]:text-amber-100/80">
              <Info className="text-amber-600 dark:text-amber-400" />
              <AlertTitle className="text-amber-950 dark:text-amber-50">
                YouTube link may change
              </AlertTitle>
              <AlertDescription>
                Live streams get a new URL for each broadcast. Update this saved pair
                with the latest link when the streamer goes live again.
              </AlertDescription>
            </Alert>
          )}
        </FormField>

        {isLanding && (
          <div className="flex items-center gap-3 px-2">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-brand/30 to-transparent" />
            <span className="text-[10px] font-medium tracking-widest text-brand/70 uppercase">
              paired with
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-brand/30 to-transparent" />
          </div>
        )}

        <FormField
          label="Twitch chat"
          hint={
            isLanding ? "The channel where chat lives — can differ from the video" : undefined
          }
          htmlFor="twitchInput"
          labelClassName={isLanding ? landingLabelClassName : undefined}
        >
          <IconInput
            id="twitchInput"
            icon={MessageSquare}
            iconClassName="text-[#9147ff]"
            placeholder="channel name or twitch.tv/channel"
            value={values.twitchInput}
            onChange={(event) =>
              setValues((current) => ({ ...current, twitchInput: event.target.value }))
            }
            className={inputClassName}
            required
          />
        </FormField>
      </div>

      <div className="space-y-2 border-t border-border/60 pt-4">
        <div>
          <Label htmlFor="name" className="text-sm font-normal text-muted-foreground">
            {isLanding ? "Label (optional)" : "Name (optional)"}
          </Label>
          {isLanding && (
            <p className="mt-0.5 text-xs text-muted-foreground/80">
              A nickname for your saved list — defaults to the Twitch channel name.
            </p>
          )}
        </div>
        <IconInput
          id="name"
          icon={Tag}
          placeholder={
            isLanding ? "e.g. Speedrun marathon, Co-stream night…" : "My stream setup"
          }
          value={values.name}
          onChange={(event) =>
            setValues((current) => ({ ...current, name: event.target.value }))
          }
        />
      </div>

      <div className={cn("flex gap-2", isLanding ? "pt-1" : "pt-2")}>
        <Button
          type="submit"
          className={cn(
            "flex-1",
            isLanding && "h-11 bg-brand text-brand-foreground hover:bg-brand/90"
          )}
          size={isLanding ? "lg" : "default"}
        >
          {submitLabel}
          {isLanding && <ArrowRight data-icon="inline-end" />}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}
