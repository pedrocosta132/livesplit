import { create } from "zustand"
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware"

export type Theme = "light" | "dark"
export type ChatMode = "embedded" | "logged-in"

interface PreferencesState {
  theme: Theme
  chatVisible: boolean
  chatMode: ChatMode
  protectorEnabled: boolean
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  setChatVisible: (visible: boolean) => void
  toggleChatVisible: () => void
  setChatMode: (mode: ChatMode) => void
  toggleChatMode: () => ChatMode
  setProtectorEnabled: (enabled: boolean) => void
  toggleProtector: () => void
}

const STORAGE_KEY = "livesplit:preferences"

function applyThemeToDocument(theme: Theme): void {
  document.documentElement.classList.toggle("dark", theme === "dark")
}

function migrateLegacyPreferences(): Partial<
  Pick<PreferencesState, "theme" | "chatMode" | "protectorEnabled">
> | null {
  const legacyTheme = localStorage.getItem("livesplit:theme")
  const legacyChatMode = localStorage.getItem("livesplit:chat-mode")
  const legacyProtector = localStorage.getItem("livesplit:player-protector")

  const hasLegacy =
    legacyTheme !== null ||
    legacyChatMode !== null ||
    legacyProtector !== null

  if (!hasLegacy) return null

  const migrated: Partial<
    Pick<PreferencesState, "theme" | "chatMode" | "protectorEnabled">
  > = {}

  if (legacyTheme === "light" || legacyTheme === "dark") {
    migrated.theme = legacyTheme
  }

  if (legacyChatMode === "logged-in" || legacyChatMode === "embedded") {
    migrated.chatMode = legacyChatMode
  }

  if (legacyProtector === "true") {
    migrated.protectorEnabled = true
  } else if (legacyProtector === "false") {
    migrated.protectorEnabled = false
  }

  localStorage.removeItem("livesplit:theme")
  localStorage.removeItem("livesplit:chat-mode")
  localStorage.removeItem("livesplit:player-protector")

  return migrated
}

const preferencesStorage: StateStorage = {
  getItem: (name) => {
    const value = localStorage.getItem(name)
    if (value !== null) return value

    const migrated = migrateLegacyPreferences()
    if (!migrated) return null

    const serialized = JSON.stringify({
      state: {
        theme: migrated.theme ?? "dark",
        chatVisible: true,
        chatMode: migrated.chatMode ?? "embedded",
        protectorEnabled: migrated.protectorEnabled ?? true,
      },
      version: 0,
    })

    localStorage.setItem(name, serialized)
    return serialized
  },
  setItem: (name, value) => localStorage.setItem(name, value),
  removeItem: (name) => localStorage.removeItem(name),
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set, get) => ({
      theme: "dark",
      chatVisible: true,
      chatMode: "embedded",
      protectorEnabled: true,

      setTheme: (theme) => {
        applyThemeToDocument(theme)
        set({ theme })
      },

      toggleTheme: () => {
        const next: Theme = get().theme === "dark" ? "light" : "dark"
        applyThemeToDocument(next)
        set({ theme: next })
      },

      setChatVisible: (visible) => set({ chatVisible: visible }),
      toggleChatVisible: () => set((state) => ({ chatVisible: !state.chatVisible })),

      setChatMode: (mode) => set({ chatMode: mode }),

      toggleChatMode: () => {
        const next: ChatMode =
          get().chatMode === "embedded" ? "logged-in" : "embedded"
        set({ chatMode: next })
        return next
      },

      setProtectorEnabled: (enabled) => set({ protectorEnabled: enabled }),
      toggleProtector: () =>
        set((state) => ({ protectorEnabled: !state.protectorEnabled })),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => preferencesStorage),
      partialize: (state) => ({
        theme: state.theme,
        chatVisible: state.chatVisible,
        chatMode: state.chatMode,
        protectorEnabled: state.protectorEnabled,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) applyThemeToDocument(state.theme)
      },
    },
  ),
)

export function hydratePreferencesTheme(): void {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as { state?: { theme?: Theme } }
      applyThemeToDocument(parsed.state?.theme ?? "dark")
      return
    } catch {
      applyThemeToDocument("dark")
      return
    }
  }

  const legacyTheme = localStorage.getItem("livesplit:theme")
  if (legacyTheme === "light" || legacyTheme === "dark") {
    applyThemeToDocument(legacyTheme)
    return
  }

  applyThemeToDocument("dark")
}
