"use client"
import { useState } from "react"

interface Props {
  publicId: string
  pages: number
}

const CLOUD = "https://res.cloudinary.com/dwnfccsje/image/upload"

export default function SlideViewer({ publicId, pages }: Props) {
  const [current, setCurrent] = useState(1)

  if (!publicId || pages === 0) return null

  const fullSrc = `${CLOUD}/pg_${current},f_jpg,q_100,w_2560/jvr-brand-scaling/slides-img/${publicId}.jpg`

  return (
    <div className="space-y-3">
      <div className="relative bg-white rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
        <img
          src={fullSrc}
          alt={`Slide ${current}`}
          className="w-full h-full object-contain"
          key={fullSrc}
        />
      </div>
      {pages > 1 && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrent(p => Math.max(1, p - 1))}
            disabled={current === 1}
            className="px-4 py-2 bg-[#111] border border-[#333] text-white rounded-lg text-sm disabled:opacity-30 hover:bg-[#222] transition-colors"
          >
            ← Previous
          </button>
          <span className="text-[#888] text-sm">
            Slide <span className="text-white font-semibold">{current}</span> of <span className="text-white font-semibold">{pages}</span>
          </span>
          <button
            onClick={() => setCurrent(p => Math.min(pages, p + 1))}
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
