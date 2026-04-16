"use client"
import { useState, useEffect, useRef } from "react"

export default function InstallBanner() {
  const [show, setShow] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [showIOSSteps, setShowIOSSteps] = useState(false)
  const deferredPrompt = useRef<any>(null)

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    if (isStandalone) return
    if (localStorage.getItem('install-banner-dismissed')) return
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    if (!isMobile) return

    const ios = /iPhone|iPad|iPod/i.test(navigator.userAgent)
    setIsIOS(ios)

    if (!ios) {
      // Android: listen for install prompt
      window.addEventListener('beforeinstallprompt', (e: any) => {
        e.preventDefault()
        deferredPrompt.current = e
        setShow(true)
      })
      // Show banner anyway after a delay if no prompt event
      setTimeout(() => setShow(true), 1500)
    } else {
      // iOS: always show after delay
      setTimeout(() => setShow(true), 1500)
    }
  }, [])

  function dismiss() {
    localStorage.setItem('install-banner-dismissed', '1')
    setShow(false)
    setShowIOSSteps(false)
  }

  async function handleInstall() {
    if (isIOS) {
      setShowIOSSteps(true)
      return
    }
    // Android
    if (deferredPrompt.current) {
      deferredPrompt.current.prompt()
      const { outcome } = await deferredPrompt.current.userChoice
      if (outcome === 'accepted') dismiss()
      deferredPrompt.current = null
    } else {
      // Fallback
      setShowIOSSteps(true)
    }
  }

  if (!show) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-[#0a0a0a] border-t border-[#FF6B00]/30 shadow-[0_-4px_30px_rgba(255,107,0,0.15)]">
      {showIOSSteps ? (
        <div className="space-y-3">
          <p className="text-white font-bold text-sm">Add to Home Screen</p>
          <ol className="text-[#ccc] text-xs space-y-1.5">
            <li>1. Tap the <strong className="text-[#FF6B00]">Share</strong> button at the bottom of Safari</li>
            <li>2. Scroll down and tap <strong className="text-[#FF6B00]">"Add to Home Screen"</strong></li>
            <li>3. Tap <strong className="text-[#FF6B00]">Add</strong> — done!</li>
          </ol>
          <button onClick={dismiss} className="text-[#888] text-xs">Close</button>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#FF6B00] flex items-center justify-center flex-shrink-0 text-white font-bold text-lg">
            JvR
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-sm">Get the App</p>
            <p className="text-[#888] text-xs mt-0.5">Install for a better experience</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={dismiss} className="text-[#555] text-xs px-3 py-1.5 rounded-lg hover:text-white transition-colors">
              Later
            </button>
            <button onClick={handleInstall} className="bg-[#FF6B00] text-white text-xs font-bold px-4 py-1.5 rounded-lg">
              Install
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
