import { neon } from '@neondatabase/serverless';

const sql = neon('postgresql://neondb_owner:npg_aH2oLvgM9IVJ@ep-jolly-dawn-andrurcd-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');

const email = 'keagsvdm01@gmail.com';
const tier = 'community';

const existing = await sql`SELECT id, email, tier FROM "User" WHERE email = ${email}`;

if (existing.length > 0) {
  await sql`UPDATE "User" SET tier = ${tier}, "tierUpdatedAt" = NOW() WHERE email = ${email}`;
  console.log('✅ Updated to community:', email);
} else {
  await sql`INSERT INTO "User" (id, email, name, password, role, tier, "needsPasswordSetup", "createdAt")
    VALUES (gen_random_uuid(), ${email}, 'Keagan', '', 'student', ${tier}, true, NOW())`;
  console.log('✅ Created community account:', email);
}
