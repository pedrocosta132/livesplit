const steps = [
  {
    step: "01",
    title: "Paste your stream",
    description: "Drop in a YouTube or Twitch video URL — live or VOD.",
  },
  {
    step: "02",
    title: "Add Twitch chat",
    description: "Point to the Twitch channel where chat is happening.",
  },
  {
    step: "03",
    title: "Watch together",
    description: "Stream and chat side by side. Save the pair for next time.",
  },
] as const

export function HowItWorksSection() {
  return (
    <section className="border-t border-border/60 py-16 sm:py-20">
      <div className="mb-10 text-center">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Three steps, zero setup
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          No account required. Everything stays in your browser.
        </p>
      </div>

      <ol className="grid gap-8 sm:grid-cols-3">
        {steps.map(({ step, title, description }) => (
          <li key={step} className="relative text-center sm:text-left">
            <span className="text-4xl font-bold tracking-tighter text-brand/25">
              {step}
            </span>
            <h3 className="mt-2 font-medium">{title}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}
