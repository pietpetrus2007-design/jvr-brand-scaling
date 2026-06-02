import { neon } from '@neondatabase/serverless';

const sql = neon('postgresql://neondb_owner:npg_aH2oLvgM9IVJ@ep-jolly-dawn-andrurcd-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');

const LESSON_ID = 'cmnxz8cau000sctorcypc2lc0';

// Delete from any related tables
const tables = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
console.log('Tables:', tables.map(t => t.table_name).join(', '));

// Delete the lesson directly
await sql`DELETE FROM "Lesson" WHERE id = ${LESSON_ID}`;
console.log('✅ Lesson 4.7 deleted');
