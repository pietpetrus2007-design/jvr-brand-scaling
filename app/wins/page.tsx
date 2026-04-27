export const dynamic = 'force-dynamic'
import prisma from "@/lib/prisma"

export default async function WinsPage() {
  const [stats, topEarners] = await Promise.all([
    prisma.progressEntry.aggregate({
      _sum: { paymentsValue: true, paymentsReceived: true },
      _count: { userId: true },
    }),
    prisma.progressEntry.groupBy({
      by: ['userId'],
      _sum: { paymentsValue: true, paymentsReceived: true },
      orderBy: { _sum: { paymentsValue: 'desc' } },
      take: 10,
    }),
  ])

  const userIds = topEarners.map((e: any) => e.userId)
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true }
  })
  const userMap = Object.fromEntries(users.map((u: any) => [u.id, u.name]))

  const totalRevenue = stats._sum.paymentsValue || 0
  const totalPayments = stats._sum.paymentsReceived || 0

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-start px-4 py-16">
      {/* Logo */}
      <div className="mb-12 text-center">
        <p className="font-bold text-xl tracking-tight">
          <span className="text-[#FF6B00]">JvR</span>
          <span className="text-white"> Brand Scaling</span>
        </p>
        <p className="text-[#555] text-sm mt-1">Student Results</p>
      </div>

      {/* Hero stat */}
      <div className="w-full max-w-md bg-black border border-[#FF6B00]/30 rounded-3xl p-8 text-center shadow-[0_0_60px_rgba(255,107,0,0.15)] mb-6">
        <p className="text-xs uppercase tracking-[0.25em] text-[#FF6B00] font-semibold mb-3">Total Revenue Generated</p>
        <p className="text-[#FF6B00] font-black text-6xl tracking-tight">
          R{totalRevenue.toLocaleString()}
        </p>
        <p className="text-[#444] text-sm mt-3">{totalPayments} payments logged by students</p>
      </div>

      {/* Leaderboard */}
      {topEarners.length > 0 && (
        <div className="w-full max-w-md bg-[#0a0a0a] border border-white/8 rounded-2xl overflow-hidden mb-6">
          <div className="px-5 py-4 border-b border-white/8">
            <p className="text-white font-bold text-sm">🏆 Top Earners</p>
          </div>
          <div className="divide-y divide-white/5">
            {topEarners.map((entry: any, i: number) => (
              <div key={entry.userId} className="flex items-center gap-3 px-5 py-3.5">
                <span className={`text-sm font-black w-7 text-center flex-shrink-0 ${
                  i === 0 ? 'text-yellow-400' : i === 1 ? 'text-[#aaa]' : i === 2 ? 'text-amber-600' : 'text-[#555]'
                }`}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                </span>
                <p className="flex-1 text-white text-sm font-semibold truncate">
                  {userMap[entry.userId] || 'Student'}
                </p>
                <p className="text-[#FF6B00] font-bold text-sm flex-shrink-0">
                  R{(entry._sum.paymentsValue || 0).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-[#333] text-xs text-center max-w-xs">
        Results logged by students of the Brand Scaling Program. Individual results may vary.
      </p>
    </div>
  )
}
