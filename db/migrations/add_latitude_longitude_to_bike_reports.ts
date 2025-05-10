import { sql } from "drizzle-orm";

export async function up() {
  await sql`ALTER TABLE bike_reports ADD COLUMN latitude text;`;
  await sql`ALTER TABLE bike_reports ADD COLUMN longitude text;`;
}

export async function down() {
  await sql`ALTER TABLE bike_reports DROP COLUMN latitude;`;
  await sql`ALTER TABLE bike_reports DROP COLUMN longitude;`;
} 