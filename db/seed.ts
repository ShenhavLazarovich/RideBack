import { db } from "./index";
import * as schema from "@shared/schema";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function seed() {
  try {
    console.log("Starting database seed...");
    
    // Create a demo user
    const existingUser = await db.query.users.findFirst({
      where: schema.users.username.equals("demo")
    });
    
    let user;
    if (!existingUser) {
      console.log("Creating demo user...");
      const hashedPassword = await hashPassword("password");
      [user] = await db.insert(schema.users).values({
        username: "demo",
        password: hashedPassword,
        email: "demo@example.com",
        phone: "050-1234567",
        firstName: "ישראל",
        lastName: "ישראלי"
      }).returning();
    } else {
      user = existingUser;
    }
    
    // Create some bikes for the demo user
    const existingBikes = await db.query.bikes.findMany({
      where: schema.bikes.userId.equals(user.id)
    });
    
    if (existingBikes.length === 0) {
      console.log("Creating sample bikes...");
      
      // Bike 1 - Trek FX 3 Disc (Stolen)
      const [bike1] = await db.insert(schema.bikes).values({
        userId: user.id,
        brand: "Trek",
        model: "FX 3 Disc",
        type: "road",
        year: 2021,
        color: "שחור/כחול",
        frameSize: "M",
        serialNumber: "WTU123456789",
        additionalInfo: "מדבקה של חנות אופניים בתל אביב על השלדה",
        imageUrl: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        status: "stolen"
      }).returning();
      
      // Create theft report for bike 1
      await db.insert(schema.bikeReports).values({
        userId: user.id,
        bikeId: bike1.id,
        theftDate: new Date("2023-04-12"),
        theftLocation: "תל אביב, רמת אביב",
        theftDetails: "האופניים היו נעולים מחוץ לקניון",
        policeReported: true,
        policeStation: "תחנת תל אביב צפון",
        policeFileNumber: "20230412-123",
        useProfileContact: true,
        visibility: "public",
        status: "active"
      });
      
      // Bike 2 - Specialized Rockhopper (Registered)
      await db.insert(schema.bikes).values({
        userId: user.id,
        brand: "Specialized",
        model: "Rockhopper",
        type: "mountain",
        year: 2022,
        color: "ירוק",
        frameSize: "L",
        serialNumber: "SPD987654321",
        additionalInfo: "שיכוך קדמי Fox, אוכף מותאם אישית",
        imageUrl: "https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        status: "registered"
      });
    }
    
    // Create some sample alerts if none exist
    const existingAlerts = await db.query.alerts.findMany({
      where: schema.alerts.userId.equals(user.id)
    });
    
    if (existingAlerts.length === 0) {
      console.log("Creating sample alerts...");
      
      // Alert 1
      await db.insert(schema.alerts).values({
        userId: user.id,
        title: "נמצאו אופניים דומים לשלך",
        message: "מישהו דיווח על מציאת אופניים דומים ל-Trek FX 3 Disc באזור תל אביב.",
        type: "match",
        relatedEntityType: "bike",
        relatedEntityId: 1,
        read: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      });
      
      // Alert 2
      await db.insert(schema.alerts).values({
        userId: user.id,
        title: "הודעה ממשתמש על האופניים שלך",
        message: "משתמש בשם דני השאיר הודעה על האופניים הגנובים שלך.",
        type: "notification",
        relatedEntityType: "report",
        relatedEntityId: 1,
        read: false,
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000) // 6 hours ago
      });
      
      // Alert 3
      await db.insert(schema.alerts).values({
        userId: user.id,
        title: "תזכורת לעדכון מספר שלדה",
        message: "לא הזנת את המספר המלא של שלדת Specialized Rockhopper שלך. עדכון פרטים מלא יעזור במקרה של גניבה.",
        type: "update",
        relatedEntityType: "bike",
        relatedEntityId: 2,
        read: false,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
      });
    }
    
    // Add some sample search results
    const publicBikes = await db.query.bikes.findMany({
      where: schema.bikes.userId.notEquals(user.id)
    });
    
    if (publicBikes.length < 5) {
      console.log("Creating sample search data...");
      
      // Sample user for these bikes
      let searchUser;
      const existingSearchUser = await db.query.users.findFirst({
        where: schema.users.username.equals("search_data")
      });
      
      if (!existingSearchUser) {
        [searchUser] = await db.insert(schema.users).values({
          username: "search_data",
          password: await hashPassword("password"),
          email: "search@example.com"
        }).returning();
      } else {
        searchUser = existingSearchUser;
      }
      
      // Stolen bike 1
      const [searchBike1] = await db.insert(schema.bikes).values({
        userId: searchUser.id,
        brand: "Cannondale",
        model: "Synapse",
        type: "road",
        year: 2020,
        color: "שחור",
        frameSize: "M",
        serialNumber: "CN12349876",
        imageUrl: "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        status: "stolen"
      }).returning();
      
      await db.insert(schema.bikeReports).values({
        userId: searchUser.id,
        bikeId: searchBike1.id,
        theftDate: new Date("2023-04-10"),
        theftLocation: "תל אביב, רמת אביב",
        theftDetails: "נגנבו מהחניון של הבניין",
        policeReported: true,
        visibility: "public",
        status: "active"
      });
      
      // Found bike
      const [searchBike2] = await db.insert(schema.bikes).values({
        userId: searchUser.id,
        brand: "Giant",
        model: "TCR",
        type: "road",
        year: 2019,
        color: "אדום/לבן",
        frameSize: "S",
        serialNumber: "GI87655432",
        imageUrl: "https://images.unsplash.com/photo-1593764592116-bfb2a97c642a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        status: "found"
      }).returning();
      
      await db.insert(schema.bikeReports).values({
        userId: searchUser.id,
        bikeId: searchBike2.id,
        theftDate: new Date("2023-05-02"),
        theftLocation: "ירושלים, מרכז העיר",
        theftDetails: "נמצאו נטושים בפארק העירוני",
        policeReported: false,
        visibility: "public",
        status: "resolved"
      });
      
      // More search data bikes
      await db.insert(schema.bikes).values([
        {
          userId: searchUser.id,
          brand: "Scott",
          model: "Addict",
          type: "road",
          year: 2021,
          color: "לבן/שחור",
          frameSize: "L",
          serialNumber: "SC12345678",
          status: "stolen"
        },
        {
          userId: searchUser.id,
          brand: "Trek",
          model: "Fuel EX",
          type: "mountain",
          year: 2022,
          color: "כחול/צהוב",
          frameSize: "M",
          serialNumber: "TR98765432",
          status: "stolen"
        },
        {
          userId: searchUser.id,
          brand: "Specialized",
          model: "Diverge",
          type: "gravel",
          year: 2020,
          color: "אפור",
          frameSize: "M/L",
          serialNumber: "SP56781234",
          status: "stolen"
        }
      ]);
    }
    
    console.log("Database seed completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed();
