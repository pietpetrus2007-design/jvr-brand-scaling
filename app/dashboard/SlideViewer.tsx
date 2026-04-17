"use client"
import { useState, useEffect, useRef } from "react"

interface Props {
  publicId: string
  pages: number
}

const CLOUD = "https://res.cloudinary.com/dwnfccsje/image/upload"

// Build optimised URL — f_auto lets Cloudinary serve jpg/png/webp automatically
function slideUrl(publicId: string, slide: number, width = 1200) {
  return `${CLOUD}/f_auto,q_auto:best,w_${width}/jvr-brand-scaling/hires/${publicId}/slide-${slide}?v=3`
}

export default function SlideViewer({ publicId, pages }: Props) {
  const [current, setCurrent] = useState(1)
  const [loaded, setLoaded] = useState(false)

  // Reset when lesson changes
  useEffect(() => {
    setCurrent(1)
    setLoaded(false)
  }, [publicId])

  // Preload next slide in background
  useEffect(() => {
    if (current < pages) {
      const img = new Image()
      img.src = slideUrl(publicId, current + 1)
    }
  }, [current, publicId, pages])

  if (!publicId || pages === 0) return null

  const src = slideUrl(publicId, current)

  return (
    <div className="space-y-3">
      <div className="relative bg-white rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#111]">
            <div className="w-6 h-6 rounded-full border-2 border-[#FF6B00] border-t-transparent animate-spin" />
          </div>
        )}
        <img
          src={src}
          alt={`Slide ${current}`}
          className={`w-full h-full object-contain transition-opacity duration-200 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          key={src}
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(true)}
          loading="eager"
          decoding="async"
        />
      </div>
      {pages > 1 && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => { setLoaded(false); setCurrent(p => Math.max(1, p - 1)) }}
            disabled={current === 1}
            className="px-4 py-2 bg-[#111] border border-[#333] text-white rounded-lg text-sm disabled:opacity-30 hover:bg-[#222] transition-colors"
          >
            ← Previous
          </button>
          <span className="text-[#888] text-sm">
            Slide <span className="text-white font-semibold">{current}</span> of <span className="text-white font-semibold">{pages}</span>
          </span>
          <button
            onClick={() => { setLoaded(false); setCurrent(p => Math.min(pages, p + 1)) }}
            disabled={current === pages}
            className="px-4 py-2 bg-[#FF6B00] text-white rounded-lg text-sm disabled:opacity-30 hover:bg-[#e05e00] transition-colors"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}
