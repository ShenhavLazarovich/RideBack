import { db } from "@db";
import { pool } from "@db";
import connectPg from "connect-pg-simple";
import session from "express-session";
import { 
  users,
  bikes,
  bikeReports,
  alerts,
  User,
  Bike,
  BikeReport, 
  Alert,
  BikeSearch,
  InsertUser,
  InsertBike,
  InsertBikeReport,
  UpdateProfile
} from "@shared/schema";
import { eq, and, desc, SQL } from "drizzle-orm";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(data: InsertUser): Promise<User>;
  updateUserPassword(userId: number, newPassword: string): Promise<void>;
  getUserProfile(userId: number): Promise<any>;
  updateUserProfile(userId: number, data: UpdateProfile): Promise<any>;

  // Bike operations
  getUserBikes(userId: number): Promise<Bike[]>;
  getUserAvailableBikes(userId: number): Promise<Bike[]>;
  getBike(bikeId: number, userId: number): Promise<Bike | undefined>;
  createBike(data: InsertBike): Promise<Bike>;
  updateBike(bikeId: number, data: Partial<InsertBike>): Promise<Bike>;

  // Theft report operations
  getUserReports(userId: number): Promise<BikeReport[]>;
  getReport(reportId: number, userId: number): Promise<BikeReport | undefined>;
  createTheftReport(data: InsertBikeReport): Promise<BikeReport>;

  // Alert operations
  getUserAlerts(userId: number): Promise<Alert[]>;
  getAlert(alertId: number, userId: number): Promise<Alert | undefined>;
  markAlertAsRead(alertId: number): Promise<void>;
  createAlert(data: Omit<Alert, "id" | "createdAt" | "read">): Promise<Alert>;

  // Search operations
  searchBikes(condition: SQL | undefined, limit: number, offset: number): Promise<BikeSearch[]>;
  countSearchResults(condition: SQL | undefined): Promise<number>;

  sessionStore: session.SessionStore;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true,
      tableName: 'sessions' 
    });
  }

  // User operations
  async getUser(id: number): Promise<User> {
    const result = await db.query.users.findFirst({
      where: eq(users.id, id)
    });

    if (!result) {
      throw new Error("User not found");
    }

    return result;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return await db.query.users.findFirst({
      where: eq(users.username, username)
    });
  }

  async createUser(data: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(data).returning();
    return user;
  }

  async updateUserPassword(userId: number, newPassword: string): Promise<void> {
    await db.update(users)
      .set({ password: newPassword })
      .where(eq(users.id, userId));
  }

  async getUserProfile(userId: number): Promise<any> {
    // Get user
    const user = await this.getUser(userId);
    
    // Count bikes and theft reports
    const userBikes = await this.getUserBikes(userId);
    const activeTheftReports = userBikes.filter(bike => bike.status === "stolen");
    
    return {
      ...user,
      bikesCount: userBikes.length,
      activeTheftReportsCount: activeTheftReports.length
    };
  }

  async updateUserProfile(userId: number, data: UpdateProfile): Promise<any> {
    const [updatedUser] = await db.update(users)
      .set(data)
      .where(eq(users.id, userId))
      .returning();
      
    return updatedUser;
  }

  // Bike operations
  async getUserBikes(userId: number): Promise<Bike[]> {
    return await db.query.bikes.findMany({
      where: eq(bikes.userId, userId),
      orderBy: [desc(bikes.createdAt)]
    });
  }

  async getUserAvailableBikes(userId: number): Promise<Bike[]> {
    return await db.query.bikes.findMany({
      where: and(
        eq(bikes.userId, userId),
        eq(bikes.status, "registered")  // Only get bikes that are not stolen/found
      ),
      orderBy: [desc(bikes.createdAt)]
    });
  }

  async getBike(bikeId: number, userId: number): Promise<Bike | undefined> {
    return await db.query.bikes.findFirst({
      where: and(
        eq(bikes.id, bikeId),
        eq(bikes.userId, userId)
      )
    });
  }

  async createBike(data: InsertBike): Promise<Bike> {
    const [bike] = await db.insert(bikes).values(data).returning();
    return bike;
  }

  async updateBike(bikeId: number, data: Partial<InsertBike>): Promise<Bike> {
    const [updatedBike] = await db.update(bikes)
      .set(data)
      .where(eq(bikes.id, bikeId))
      .returning();
      
    return updatedBike;
  }

  // Theft report operations
  async getUserReports(userId: number): Promise<BikeReport[]> {
    return await db.query.bikeReports.findMany({
      where: eq(bikeReports.userId, userId),
      orderBy: [desc(bikeReports.createdAt)],
      with: {
        bike: true
      }
    });
  }

  async getReport(reportId: number, userId: number): Promise<BikeReport | undefined> {
    return await db.query.bikeReports.findFirst({
      where: and(
        eq(bikeReports.id, reportId),
        eq(bikeReports.userId, userId)
      ),
      with: {
        bike: true
      }
    });
  }

  async createTheftReport(data: InsertBikeReport): Promise<BikeReport> {
    const [report] = await db.insert(bikeReports).values(data).returning();
    
    // Get the complete report with bike data
    const fullReport = await this.getReport(report.id, report.userId);
    return fullReport!;
  }

  // Alert operations
  async getUserAlerts(userId: number): Promise<Alert[]> {
    return await db.query.alerts.findMany({
      where: eq(alerts.userId, userId),
      orderBy: [desc(alerts.createdAt)]
    });
  }

  async getAlert(alertId: number, userId: number): Promise<Alert | undefined> {
    return await db.query.alerts.findFirst({
      where: and(
        eq(alerts.id, alertId),
        eq(alerts.userId, userId)
      )
    });
  }

  async markAlertAsRead(alertId: number): Promise<void> {
    await db.update(alerts)
      .set({ read: true })
      .where(eq(alerts.id, alertId));
  }

  async createAlert(data: Omit<Alert, "id" | "createdAt" | "read">): Promise<Alert> {
    const [alert] = await db.insert(alerts).values({
      ...data,
      read: false
    }).returning();
    
    return alert;
  }

  // Search operations
  async searchBikes(condition: SQL | undefined, limit: number, offset: number): Promise<BikeSearch[]> {
    // For this implementation, we'll use a simple query that joins bikes with reports
    // In a real implementation, this would likely use more complex logic to format the search results
    
    const query = db.select({
      id: bikes.id,
      brand: bikes.brand,
      model: bikes.model,
      type: bikes.type,
      color: bikes.color,
      year: bikes.year,
      serialNumber: bikes.serialNumber,
      status: bikes.status,
      imageUrl: bikes.imageUrl,
      reportDate: bikeReports.theftDate,
      location: bikeReports.theftLocation,
      reportId: bikeReports.id
    })
    .from(bikes)
    .leftJoin(bikeReports, eq(bikes.id, bikeReports.bikeId))
    .limit(limit)
    .offset(offset)
    .orderBy(desc(bikeReports.createdAt));
    
    if (condition) {
      query.where(condition);
    }
    
    return await query;
  }

  async countSearchResults(condition: SQL | undefined): Promise<number> {
    const query = db.select({ count: bikes.id })
      .from(bikes)
      .leftJoin(bikeReports, eq(bikes.id, bikeReports.bikeId));
    
    if (condition) {
      query.where(condition);
    }
    
    const result = await query;
    return result.length;
  }
}

export const storage = new DatabaseStorage();
