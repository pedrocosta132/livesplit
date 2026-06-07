import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePreferencesStore } from "@/stores/preferences-store"

interface LandingNavProps {
  onGetStarted: () => void
}

export function LandingNav({ onGetStarted }: LandingNavProps) {
  const theme = usePreferencesStore((state) => state.theme)
  const toggleTheme = usePreferencesStore((state) => state.toggleTheme)

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <a href="/" className="flex items-center gap-2.5">
          <img src="/favicon.svg" alt="" className="size-7" />
          <span className="font-semibold tracking-tight">LiveSplit</span>
        </a>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun /> : <Moon />}
          </Button>
          <Button size="sm" onClick={onGetStarted}>
            Get started
          </Button>
        </div>
      </div>
    </header>
  )
}
