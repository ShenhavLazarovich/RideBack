import { db } from './index.js';
import { sql } from 'drizzle-orm';

async function migrateBadges() {
  console.log('Creating badges and user_achievements tables...');

  try {
    // Create badges table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS badges (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        image_url TEXT NOT NULL,
        category TEXT NOT NULL,
        level INTEGER NOT NULL DEFAULT 1,
        requirements JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `);
    console.log('✅ Badges table created successfully');

    // Create user_achievements table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS user_achievements (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        badge_id INTEGER NOT NULL REFERENCES badges(id),
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        progress JSONB
      );
    `);
    console.log('✅ User achievements table created successfully');

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

migrateBadges()
  .then(() => {
    console.log('Badge tables migration completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error running migration:', error);
    process.exit(1);
  });