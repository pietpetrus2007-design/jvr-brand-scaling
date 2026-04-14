import Link from "next/link"

export default function Home() {
  return (
    <main className="min-h-screen bg-black flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-7xl mx-auto w-full">
        <span className="font-bold text-xl tracking-tight">
          <span className="text-[#FF6B00]">JvR</span>
          <span className="text-white"> Brand Scaling</span>
        </span>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm text-[#888] hover:text-white transition-colors duration-150"
          >
            Sign In
          </Link>
          <a
            href="https://brandscaling.co.za"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm bg-[#FF6B00] hover:bg-[#e05e00] text-white font-semibold px-4 py-2 rounded-lg transition-colors duration-150"
          >
            Get Access
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex-1 flex flex-col items-center justify-center px-6 text-center py-28 overflow-hidden">
        {/* Orange radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 50% 40%, rgba(255,107,0,0.18) 0%, transparent 70%)",
          }}
        />
        <div className="relative max-w-4xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 bg-[#FF6B00]/10 border border-[#FF6B00]/30 rounded-full px-4 py-1.5 text-[#FF6B00] text-sm font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B00] animate-pulse" />
            Exclusive Access Program
          </div>
          <h1 className="text-6xl md:text-8xl font-bold leading-[0.95] tracking-tight">
            <span className="text-white block">Scale Brands.</span>
            <span className="text-[#FF6B00] block">Build Wealth.</span>
          </h1>
          <p className="text-lg md:text-xl text-[#888] max-w-2xl mx-auto leading-relaxed">
            The exact system used to land clients, run ads, and grow revenue for brands —
            taught step by step.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <a
              href="https://brandscaling.co.za"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#FF6B00] hover:bg-[#e05e00] text-white font-bold px-8 py-4 rounded-xl transition-colors duration-150 text-base shadow-[0_0_40px_rgba(255,107,0,0.35)] hover:shadow-[0_0_60px_rgba(255,107,0,0.5)]"
            >
              Get Access →
            </a>
            <Link
              href="/register"
              className="border border-white/20 hover:border-[#FF6B00]/60 hover:bg-[#FF6B00]/5 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-150 text-base"
            >
              Already have a code? Register →
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <div className="border-t border-b border-white/5 py-6 px-6">
        <div className="max-w-3xl mx-auto flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
          {[
            { num: "500+", label: "Students" },
            { num: "3", label: "Tiers" },
            { num: "Lifetime", label: "Access" },
            { num: "Real", label: "Results" },
          ].map((s, i) => (
            <div key={s.label} className="flex items-center gap-8">
              {i > 0 && <span className="text-[#333] hidden sm:block">•</span>}
              <div className="text-center">
                <span className="text-[#FF6B00] font-bold text-lg">{s.num}</span>
                <span className="text-[#888] text-base ml-1.5">{s.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-white">Everything you need to scale</h2>
            <p className="text-[#888] mt-3 text-base">Proven frameworks. Real strategies. No fluff.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: (
                  <svg className="w-6 h-6 text-[#FF6B00]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ),
                title: "Land Clients",
                desc: "Cold outreach, discovery calls, and proposals that convert. Build a pipeline that never runs dry.",
              },
              {
                icon: (
                  <svg className="w-6 h-6 text-[#FF6B00]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                ),
                title: "Scale Revenue",
                desc: "Productise your service, raise your rates, and build recurring income that compounds over time.",
              },
              {
                icon: (
                  <svg className="w-6 h-6 text-[#FF6B00]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: "Get Paid",
                desc: "Premium pricing strategies, objection handling, and the mindset to charge what you're worth.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="group bg-[#0a0a0a] border border-white/8 hover:border-[#FF6B00]/40 rounded-2xl p-7 transition-all duration-150 hover:bg-[#FF6B00]/5"
              >
                <div className="w-10 h-10 rounded-xl bg-[#FF6B00]/10 flex items-center justify-center mb-5 group-hover:bg-[#FF6B00]/20 transition-colors duration-150">
                  {f.icon}
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-[#888] text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-4xl md:text-5xl font-bold text-white">Ready to start?</h2>
          <p className="text-[#888] text-lg">
            Join 500+ students already building their brand scaling businesses.
          </p>
          <a
            href="https://brandscaling.co.za"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-[#FF6B00] hover:bg-[#e05e00] text-white font-bold px-10 py-5 rounded-xl transition-colors duration-150 text-lg shadow-[0_0_40px_rgba(255,107,0,0.35)] hover:shadow-[0_0_60px_rgba(255,107,0,0.5)]"
          >
            Get Access →
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span className="font-bold text-base tracking-tight">
            <span className="text-[#FF6B00]">JvR</span>
            <span className="text-white"> Brand Scaling</span>
          </span>
          <p className="text-[#555] text-sm">© {new Date().getFullYear()} JvR Brand Scaling. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}
