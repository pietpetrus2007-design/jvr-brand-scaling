"use client"
import { useState, useEffect } from "react"

export default function InstallBanner() {
  const [show, setShow] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    // Don't show if already installed as PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    if (isStandalone) return

    // Don't show if dismissed
    if (localStorage.getItem('install-banner-dismissed')) return

    // Only show on mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    if (!isMobile) return

    const ios = /iPhone|iPad|iPod/i.test(navigator.userAgent)
    setIsIOS(ios)
    setShow(true)
  }, [])

  function dismiss() {
    localStorage.setItem('install-banner-dismissed', '1')
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-[#0a0a0a] border-t border-[#FF6B00]/30 shadow-[0_-4px_30px_rgba(255,107,0,0.15)]">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-[#FF6B00] flex items-center justify-center flex-shrink-0 text-white font-bold text-lg">
          JvR
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-sm">Get the App</p>
          <p className="text-[#888] text-xs mt-0.5">
            {isIOS
              ? 'Tap Share → Add to Home Screen'
              : 'Tap menu → Add to Home Screen'}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={dismiss}
            className="text-[#555] text-xs px-3 py-1.5 rounded-lg hover:text-white transition-colors"
          >
            Later
          </button>
          <button
            onClick={dismiss}
            className="bg-[#FF6B00] text-white text-xs font-bold px-4 py-1.5 rounded-lg"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  )
}
