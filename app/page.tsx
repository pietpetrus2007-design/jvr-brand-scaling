import Link from "next/link"

export default function Home() {
  return (
    <main className="min-h-screen bg-black flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto w-full">
        <span className="text-white font-bold text-xl tracking-tight">JvR Brand Scaling</span>
        <Link
          href="/login"
          className="text-sm text-[#888] hover:text-white transition-colors"
        >
          Sign In
        </Link>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 text-center py-24">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="inline-block bg-[#FF6B00]/10 border border-[#FF6B00]/30 rounded-full px-4 py-1.5 text-[#FF6B00] text-sm font-medium mb-4">
            Exclusive Access Program
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight tracking-tight">
            Learn Brand<br />
            <span className="text-[#FF6B00]">Scaling</span>
          </h1>
          <p className="text-lg md:text-xl text-[#888] max-w-xl mx-auto leading-relaxed">
            JvR&apos;s proven system for building a premium brand, landing high-value clients,
            and scaling your revenue — without burning out.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <a
              href="https://brandscaling.co.za"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#FF6B00] hover:bg-[#e05e00] text-white font-semibold px-8 py-4 rounded-lg transition-colors text-base"
            >
              Get Access
            </a>
            <Link
              href="/login"
              className="border border-white/20 hover:border-white/40 text-white font-semibold px-8 py-4 rounded-lg transition-colors text-base"
            >
              Already a member?
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: "Brand Foundations", desc: "Build a recognisable brand identity that attracts premium clients on autopilot." },
            { title: "Client Acquisition", desc: "Cold outreach, discovery calls, and proposals that convert at a high rate." },
            { title: "Revenue Scaling", desc: "Productise your service, raise your rates, and build a team that delivers." },
          ].map((f) => (
            <div key={f.title} className="bg-white/5 rounded-xl p-6 border border-white/10">
              <div className="w-2 h-2 rounded-full bg-[#FF6B00] mb-4" />
              <h3 className="text-white font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-[#888] text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/5 text-center text-[#555] text-sm">
        © {new Date().getFullYear()} JvR Brand Scaling. All rights reserved.
      </footer>
    </main>
  )
}
