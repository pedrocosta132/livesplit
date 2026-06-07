/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TWITCH_PARENT_HOST?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
