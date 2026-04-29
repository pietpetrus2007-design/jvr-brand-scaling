"use client"
import { useEffect, useRef } from "react"

interface Props {
  roomName: string
  userName: string
  isAdmin: boolean
  onClose: () => void
}

export default function JitsiCall({ roomName, userName, isAdmin, onClose }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const apiRef = useRef<any>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const script = document.createElement("script")
    script.src = "https://meet.jit.si/external_api.js"
    script.async = true
    script.onload = () => {
      if (!(window as any).JitsiMeetExternalAPI) return
      apiRef.current = new (window as any).JitsiMeetExternalAPI("meet.jit.si", {
        roomName,
        parentNode: containerRef.current,
        userInfo: { displayName: userName },
        configOverwrite: {
          prejoinPageEnabled: false,
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          disableDeepLinking: true,
          enableWelcomePage: false,
          requireDisplayName: false,
          enableInsecureRoomNameWarning: false,
          enableLobbyChat: false,
          hideLobbyButton: true,
          lobby: {
            autoKnock: true,
            enableChat: false,
          },
          e2eping: { enabled: false },
          p2p: { enabled: false },
        },
        interfaceConfigOverwrite: {
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          TOOLBAR_BUTTONS: [
            "microphone", "camera", "chat", "raisehand",
            "tileview", "fullscreen", "hangup",
            ...(isAdmin ? ["mute-everyone", "kick"] : []),
          ],
        },
      })
      apiRef.current.addEventListener("readyToClose", onClose)
    }
    document.head.appendChild(script)

    return () => {
      apiRef.current?.dispose?.()
      document.head.removeChild(script)
    }
  }, [roomName, userName, isAdmin, onClose])

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 bg-[#0a0a0a] border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-white font-semibold text-sm">Live Group Call</span>
        </div>
        <button
          onClick={onClose}
          className="text-[#888] hover:text-white text-2xl leading-none transition-colors"
        >
          ×
        </button>
      </div>
      <div ref={containerRef} className="flex-1 w-full" />
    </div>
  )
}
