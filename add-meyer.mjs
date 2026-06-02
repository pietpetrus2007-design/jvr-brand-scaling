import { neon } from '@neondatabase/serverless';

const DATABASE_URL = 'postgresql://neondb_owner:npg_aH2oLvgM9IVJ@ep-jolly-dawn-andrurcd-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const sql = neon(DATABASE_URL);

// Check columns first
const cols = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'User' ORDER BY ordinal_position`;
console.log('Columns:', cols.map(c => c.column_name));

const email = 'meyerockert2@gmail.com';
const existing = await sql`SELECT id, email, tier FROM "User" WHERE email = ${email}`;

if (existing.length > 0) {
  await sql`UPDATE "User" SET tier = 'mentorship', "tierUpdatedAt" = NOW() WHERE email = ${email}`;
  console.log('✅ Updated to mentorship:', email);
} else {
  // Insert without updatedAt
  await sql`INSERT INTO "User" (id, email, name, password, role, tier, "needsPasswordSetup", "createdAt")
    VALUES (gen_random_uuid(), ${email}, 'Meyer Ockert', '', 'student', 'mentorship', true, NOW())`;
  console.log('✅ Created mentorship account:', email);
}
