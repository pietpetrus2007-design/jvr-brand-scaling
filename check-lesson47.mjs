import { neon } from '@neondatabase/serverless';

const sql = neon('postgresql://neondb_owner:npg_aH2oLvgM9IVJ@ep-jolly-dawn-andrurcd-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');

const MOD4_ID = 'cmnxz8c3j000kctorc9qlc6of';

const lessons = await sql`
  SELECT id, title, "order", "slideUrl", "slidePages"
  FROM "Lesson" 
  WHERE "moduleId" = ${MOD4_ID}
  ORDER BY "order"
`;

console.log('Part 1, Module 4 (Outreach) lessons:');
lessons.forEach(l => {
  console.log(`  Lesson ${l.order}: ${l.title}`);
  console.log(`    slideUrl: ${l.slideUrl}`);
  console.log(`    slidePages: ${l.slidePages}`);
});
