export function LandingFooter() {
  return (
    <footer className="border-t border-border/60 py-8">
      <div className="flex flex-col items-center justify-between gap-4 text-center text-sm text-muted-foreground sm:flex-row sm:text-left">
        <div className="flex items-center gap-2">
          <img src="/favicon.svg" alt="" className="size-5 opacity-70" />
          <span>LiveSplit</span>
        </div>
        <p>Stream on one platform. Chat on another. Watch both here.</p>
      </div>
    </footer>
  )
}
