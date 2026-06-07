let apiReady: Promise<void> | null = null

export function loadYoutubeApi(): Promise<void> {
  if (window.YT?.Player) {
    return Promise.resolve()
  }

  if (!apiReady) {
    apiReady = new Promise((resolve) => {
      const previousReady = window.onYouTubePlayerAPIReady
      window.onYouTubePlayerAPIReady = () => {
        previousReady?.()
        resolve()
      }

      if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const tag = document.createElement("script")
        tag.src = "https://www.youtube.com/iframe_api"
        document.head.appendChild(tag)
      }
    })
  }

  return apiReady
}
