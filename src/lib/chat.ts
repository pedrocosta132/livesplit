export function openTwitchChatPopout(channel: string): Window | null {
  const url = `https://www.twitch.tv/popout/${channel}/chat?popout=`
  return window.open(
    url,
    `livesplit-chat-${channel}`,
    "width=420,height=720,resizable=yes,scrollbars=yes",
  )
}
