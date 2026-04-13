# JvR Brand Scaling — Platform Spec v2

## Stack
- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- Prisma 7 + Neon PostgreSQL (driver adapter pattern)
- NextAuth.js v5 (auth.js)
- Deployed: GitHub (pietpetrus2007-design/jvr-brand-scaling) + Vercel (pietpetrus2007-7601)

## CRITICAL Prisma 7 rules
- NEVER put `url` in schema.prisma datasource block
- Use prisma.config.ts for the connection URL
- Use PrismaNeon adapter in lib/prisma.ts like this:

```ts
// lib/prisma.ts
import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"

declare global { var prisma: PrismaClient | undefined }

function createPrisma() {
  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
  return new PrismaClient({ adapter } as any)
}

const prisma = global.prisma ?? createPrisma()
if (process.env.NODE_ENV !== "production") global.prisma = prisma
export default prisma
```

- schema.prisma datasource:
```
datasource db {
  provider = "postgresql"
}
```

- prisma.config.ts:
```ts
import "dotenv/config"
import { defineConfig } from "prisma/config"
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: { url: process.env.DATABASE_URL as string },
})
```

- Add `export const dynamic = 'force-dynamic'` to ALL route.ts files and server pages

## CRITICAL NextAuth v5 rules
- Use `auth()` from `@/lib/auth` for server components
- Use `useSession()` from `next-auth/react` for client components
- NEXTAUTH_URL must be set to exact Vercel deployment URL
- Session must include user.id, user.role, user.tier in callbacks

## Design
- bg-black (#000000) throughout
- Orange accent: #FF6B00
- Text: white / #888 muted
- Font: Inter (next/font/google)
- Fully responsive — works on mobile AND desktop
- Premium feel — no clunky UI

## Database Schema

```prisma
enum Tier { basic community mentorship }
enum Room { wins chatting qa private }

model User {
  id        String    @id @default(cuid())
  name      String
  email     String    @unique
  password  String
  role      String    @default("student") // student | admin
  tier      Tier      @default(basic)
  createdAt DateTime  @default(now())
  progress  Progress[]
  messages  Message[]
  inviteUsed InviteCode? @relation("UsedBy")
}

model InviteCode {
  id        String    @id @default(cuid())
  code      String    @unique
  tier      Tier
  usedById  String?   @unique
  usedAt    DateTime?
  createdAt DateTime  @default(now())
  usedBy    User?     @relation("UsedBy", fields: [usedById], references: [id])
}

model Module {
  id          String   @id @default(cuid())
  title       String
  description String
  order       Int
  createdAt   DateTime @default(now())
  lessons     Lesson[]
}

model Lesson {
  id          String     @id @default(cuid())
  moduleId    String
  title       String
  description String
  videoUrl    String     @default("")
  order       Int
  createdAt   DateTime   @default(now())
  module      Module     @relation(fields: [moduleId], references: [id], onDelete: Cascade)
  progress    Progress[]
}

model Progress {
  id          String   @id @default(cuid())
  userId      String
  lessonId    String
  completedAt DateTime @default(now())
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  lesson      Lesson   @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  @@unique([userId, lessonId])
}

model Message {
  id           String   @id @default(cuid())
  userId       String
  content      String
  room         Room     @default(wins)
  targetUserId String?  // for private 1-on-1 messages
  createdAt    DateTime @default(now())
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

## Pages

### Public: /
- Hero: "Learn Brand Scaling" + subheading
- Brief about the system
- CTA button "Get Access" → https://brandscaling.co.za
- Clean, black/orange, no clutter

### /login
- Email + password form
- Link to register

### /register
- Step 1: Enter invite code (validate it's real + unused)
- Step 2: Fill name, email, password
- On submit: if email exists + code is higher tier → upgrade their tier
- If email exists + same/lower tier → error message
- If new user → create account with code's tier

### /dashboard (course tab)
- List modules + lessons
- Click lesson → video player (YouTube/Vimeo embed by URL)
- Mark lesson complete button
- Progress bar per module
- Mobile responsive

### /dashboard/community
- 4 chat rooms in left sidebar (desktop) or tabs (mobile):
  - 🏆 Wins & Results — all tiers
  - 💬 Just Chatting — community + mentorship only
  - ❓ Q&A — community + mentorship only
  - 👤 1-on-1 with JvR — mentorship only
- Locked rooms: show lock icon + upgrade buttons with Shopify links
- Chat: messages with name, tier badge, timestamp
- Poll for new messages every 3 seconds
- 1-on-1 room: student sees only their thread; admin sees all threads grouped by student

### /dashboard/profile
- Name, email, tier badge
- Progress stats
- "Have an upgrade code?" input → upgrades tier if valid higher-tier code

### /admin
- Stats: total students, completions
- Modules & Lessons CRUD
- Invite Code generator (choose tier, quantity)
- Student list with tier + progress

## Upgrade links (hardcoded)
- Basic → Community: https://brandscaling.co.za/products/upgrade-from-basic-to-community?variant=47713009336485
- Basic → Mentorship: https://brandscaling.co.za/products/upgrade-from-basic-to-mentorship?variant=47712428982437
- Community → Mentorship: https://brandscaling.co.za/products/upgrade-from-community-to-mentorship?variant=47712430063781

## Env vars needed
DATABASE_URL=postgresql://neondb_owner:npg_aH2oLvgM9IVJ@ep-jolly-dawn-andrurcd-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
NEXTAUTH_SECRET=jvr-brand-scaling-secret-2026
NEXTAUTH_URL=https://jvr-brand-scaling.vercel.app

## Seed data
- Admin: admin@jvronline.com / Admin1234!
- 3 basic codes: BASIC-001, BASIC-002, BASIC-003
- 3 community codes: COMM-001, COMM-002, COMM-003
- 3 mentorship codes: MENT-001, MENT-002, MENT-003
- 3 modules with 3 lessons each (Brand Foundations, Landing Clients, Scaling Revenue)

## Build steps
1. npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*"
2. npm install prisma @prisma/client @prisma/adapter-neon @neondatabase/serverless next-auth@beta bcryptjs nanoid dotenv
3. npm install -D @types/bcryptjs tsx
4. Set up all files per spec above
5. npx prisma db push
6. npx tsx prisma/seed.ts
7. npm run build — fix ALL errors before deploying
8. gh repo create pietpetrus2007-design/jvr-brand-scaling --public --source=. --remote=origin --push
9. Set vercel env vars
10. vercel --prod
11. openclaw system event --text "Done: JvR Brand Scaling v2 live" --mode now
