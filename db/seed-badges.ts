import { db } from './index.js';
import { badges } from '../shared/schema.js';

async function seedBadges() {
  console.log('Seeding badges...');

  try {
    // Check if badges already exist
    const existingBadges = await db.query.badges.findMany();
    
    if (existingBadges.length > 0) {
      console.log(`Skip seeding badges: ${existingBadges.length} badges already exist.`);
      return;
    }
    
    // Create initial badges
    const initialBadges = [
      // Safety badges
      {
        name: 'קסדת מגן',
        description: 'רכשת קסדה חדשה והוספת אותה לפרופיל שלך',
        imageUrl: '/badges/helmet.svg',
        category: 'safety',
        level: 1,
        requirements: JSON.stringify({
          type: 'profile_update',
          field: 'helmet',
          value: true
        })
      },
      {
        name: 'רוכב בטוח',
        description: 'השלמת את מדריך הבטיחות באתר',
        imageUrl: '/badges/safe_rider.svg',
        category: 'safety',
        level: 1,
        requirements: JSON.stringify({
          type: 'guide_completion',
          guideId: 'safety_guide'
        })
      },
      
      // Community badges
      {
        name: 'חבר קהילה',
        description: 'הצטרפת לקהילת RideBack',
        imageUrl: '/badges/community_member.svg',
        category: 'community',
        level: 1,
        requirements: JSON.stringify({
          type: 'registration'
        })
      },
      {
        name: 'מסייע',
        description: 'עזרת לרוכב אחר למצוא את האופניים שלו',
        imageUrl: '/badges/helper.svg',
        category: 'community',
        level: 2,
        requirements: JSON.stringify({
          type: 'bike_found',
          count: 1
        })
      },
      {
        name: 'מציל',
        description: 'עזרת ל-5 רוכבים למצוא את האופניים שלהם',
        imageUrl: '/badges/savior.svg',
        category: 'community',
        level: 3,
        requirements: JSON.stringify({
          type: 'bike_found',
          count: 5
        })
      },
      
      // Activity badges
      {
        name: 'רשום אופניים',
        description: 'רשמת את האופניים הראשונים שלך במערכת',
        imageUrl: '/badges/registered_bike.svg',
        category: 'activity',
        level: 1,
        requirements: JSON.stringify({
          type: 'bike_registration',
          count: 1
        })
      },
      {
        name: 'אספן',
        description: 'רשמת 3 זוגות אופניים במערכת',
        imageUrl: '/badges/collector.svg',
        category: 'activity',
        level: 2,
        requirements: JSON.stringify({
          type: 'bike_registration',
          count: 3
        })
      },
      
      // Expertise badges
      {
        name: 'מומחה מתחיל',
        description: 'השלמת את המדריך הבסיסי לתחזוקת אופניים',
        imageUrl: '/badges/beginner_expert.svg',
        category: 'expertise',
        level: 1,
        requirements: JSON.stringify({
          type: 'guide_completion',
          guideId: 'basic_maintenance'
        })
      },
      {
        name: 'מכונאי חובב',
        description: 'השלמת את המדריך המתקדם לתחזוקת אופניים',
        imageUrl: '/badges/amateur_mechanic.svg',
        category: 'expertise',
        level: 2,
        requirements: JSON.stringify({
          type: 'guide_completion',
          guideId: 'advanced_maintenance'
        })
      }
    ];
    
    // Insert badges
    const insertedBadges = await db.insert(badges).values(initialBadges).returning();
    
    console.log(`✅ ${insertedBadges.length} badges seeded successfully`);
  } catch (error) {
    console.error('Seeding badges failed:', error);
    throw error;
  }
}

seedBadges()
  .then(() => {
    console.log('Badge seeding completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error seeding badges:', error);
    process.exit(1);
  });