import prisma from "../lib/prisma"

async function main() {
  // Set part=1 for modules with order 1-5
  await prisma.module.updateMany({
    where: { order: { in: [1, 2, 3, 4, 5] } },
    data: { part: 1 },
  })

  // Update Part 2 modules: reset order and set part=2
  const part2Map: Record<number, number> = { 6: 1, 7: 2, 8: 3, 9: 4, 10: 5, 11: 6 }
  for (const [oldOrder, newOrder] of Object.entries(part2Map)) {
    await prisma.module.updateMany({
      where: { order: Number(oldOrder) },
      data: { order: newOrder, part: 2 },
    })
  }

  console.log("Done: part assignments updated")
}

main().catch(console.error).finally(() => prisma.$disconnect())
