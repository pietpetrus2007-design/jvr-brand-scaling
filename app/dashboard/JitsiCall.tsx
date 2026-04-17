"use client"

interface Props {
  roomName: string
  userName: string
  isAdmin: boolean
  onClose: () => void
}

export default function JitsiCall({ roomName, userName, isAdmin, onClose }: Props) {
  const params = new URLSearchParams()
  params.set("userInfo.displayName", userName)
  params.set("config.prejoinPageEnabled", "false")
  if (isAdmin) params.set("config.startWithVideoMuted", "false")

  const src = `https://meet.jit.si/${roomName}#${params.toString()}`

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 bg-black border-b border-white/10">
        <span className="text-white font-semibold text-sm">Live Group Call</span>
        <button
          onClick={onClose}
          className="text-[#888] hover:text-white text-2xl leading-none transition-colors duration-150"
          aria-label="Close call"
        >
          ×
        </button>
      </div>
      <iframe
        src={src}
        allow="camera; microphone; fullscreen; display-capture; autoplay"
        className="flex-1 w-full border-none"
      />
    </div>
  )
}
