import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { db } from "../db";
import { z } from "zod";
import { bikes, alerts, bikeReports, badges, userAchievements, insertBikeSchema, insertReportSchema, updateProfileSchema, insertBadgeSchema, insertUserAchievementSchema } from "@shared/schema";
import { eq, and, desc, like, or, gte, lte } from "drizzle-orm";

export async function registerRoutes(app: Express): Promise<Server> {
  // Debug middleware for cookies
  app.use((req, res, next) => {
    if (req.url.startsWith('/api/')) {
      const cookies = req.headers.cookie;
      console.log(`Request to ${req.url} - Cookie header: ${cookies || 'none'}`);
    }
    next();
  });

  // Setup authentication routes
  setupAuth(app);

  // Debug middleware to log auth state
  app.use((req, res, next) => {
    if (req.url.startsWith('/api/')) {
      console.log(`Request to ${req.url} - Auth: ${req.isAuthenticated() ? 'yes' : 'no'}, Session ID: ${req.sessionID || 'none'}`);
    }
    next();
  });

  // Middleware to ensure user is authenticated
  const ensureAuthenticated = (req: any, res: Response, next: NextFunction) => {
    console.log(`ensureAuthenticated call for ${req.url} - Auth: ${req.isAuthenticated() ? 'yes' : 'no'}, Session ID: ${req.sessionID || 'none'}`);
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "עליך להתחבר כדי לגשת למשאב זה" });
  };

  // User profile routes
  app.get("/api/profile", ensureAuthenticated, async (req: any, res: any, next: any) => {
    try {
      const profile = await storage.getUserProfile(req.user.id);
      res.json(profile);
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/profile", ensureAuthenticated, async (req: any, res: any, next: any) => {
    try {
      const validatedData = updateProfileSchema.parse(req.body);
      const updatedProfile = await storage.updateUserProfile(req.user.id, validatedData);
      res.json(updatedProfile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      next(error);
    }
  });

  // Bike routes
  app.get("/api/bikes", ensureAuthenticated, async (req: any, res: any, next: any) => {
    try {
      const bikes = await storage.getUserBikes(req.user.id);
      res.json(bikes);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/bikes/available", ensureAuthenticated, async (req: any, res: any, next: any) => {
    try {
      const bikes = await storage.getUserAvailableBikes(req.user.id);
      res.json(bikes);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/bikes/:id", ensureAuthenticated, async (req: any, res: any, next: any) => {
    try {
      const bikeId = parseInt(req.params.id);
      const bike = await storage.getBike(bikeId, req.user.id);
      
      if (!bike) {
        return res.status(404).json({ message: "האופניים לא נמצאו" });
      }
      
      res.json(bike);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/bikes", ensureAuthenticated, async (req: any, res: any, next: any) => {
    try {
      const validatedData = insertBikeSchema.parse(req.body);
      const newBike = await storage.createBike({
        ...validatedData,
        userId: req.user.id,
        status: "registered"
      });
      res.status(201).json(newBike);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      next(error);
    }
  });

  app.patch("/api/bikes/:id", ensureAuthenticated, async (req: any, res: any, next: any) => {
    try {
      const bikeId = parseInt(req.params.id);
      const bike = await storage.getBike(bikeId, req.user.id);
      
      if (!bike) {
        return res.status(404).json({ message: "האופניים לא נמצאו" });
      }
      
      const validatedData = insertBikeSchema.partial().parse(req.body);
      const updatedBike = await storage.updateBike(bikeId, validatedData);
      res.json(updatedBike);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      next(error);
    }
  });

  app.post("/api/bikes/:id/images", ensureAuthenticated, async (req: any, res: any, next: any) => {
    try {
      const bikeId = parseInt(req.params.id);
      const bike = await storage.getBike(bikeId, req.user.id);
      
      if (!bike) {
        return res.status(404).json({ message: "האופניים לא נמצאו" });
      }
      
      // This would handle file uploads via formData
      // For this implementation, we'll just update with URLs if provided
      if (req.body.imageUrls && Array.isArray(req.body.imageUrls)) {
        const primaryImageUrl = req.body.imageUrls[0];
        await storage.updateBike(bikeId, { imageUrl: primaryImageUrl });
      }
      
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  });

  // Theft report routes
  app.get("/api/reports", ensureAuthenticated, async (req, res, next) => {
    try {
      const reports = await storage.getUserReports(req.user!.id);
      res.json(reports);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/reports", ensureAuthenticated, async (req, res, next) => {
    try {
      const validatedData = insertReportSchema.parse(req.body);
      
      // Verify the bike belongs to the user
      const bike = await storage.getBike(validatedData.bikeId, req.user!.id);
      if (!bike) {
        return res.status(404).json({ message: "האופניים לא נמצאו" });
      }
      
      // Create the report and update bike status
      const newReport = await storage.createTheftReport({
        ...validatedData,
        userId: req.user!.id,
        status: "active"
      });
      
      await storage.updateBike(validatedData.bikeId, { status: "stolen" });
      
      res.status(201).json(newReport);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      next(error);
    }
  });

  // Alerts
  app.get("/api/alerts", ensureAuthenticated, async (req, res, next) => {
    try {
      const alerts = await storage.getUserAlerts(req.user!.id);
      res.json(alerts);
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/alerts/:id/read", ensureAuthenticated, async (req, res, next) => {
    try {
      const alertId = parseInt(req.params.id);
      const alert = await storage.getAlert(alertId, req.user!.id);
      
      if (!alert) {
        return res.status(404).json({ message: "ההתראה לא נמצאה" });
      }
      
      await storage.markAlertAsRead(alertId);
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  });

  // Search
  app.get("/api/search", async (req, res, next) => {
    try {
      const {
        searchQuery,
        searchType,
        searchBrand,
        searchColor,
        searchLocationCity,
        searchDateRange,
        searchStatus,
        page = "1",
        limit = "10"
      } = req.query as Record<string, string>;

      const currentPage = parseInt(page);
      const itemsPerPage = parseInt(limit);
      const offset = (currentPage - 1) * itemsPerPage;

      // Build query conditions
      let conditions = [];
      
      // Filter by status
      if (searchStatus && searchStatus !== "all") {
        conditions.push(eq(bikes.status, searchStatus));
      } else {
        // By default, only show public reports (stolen or found)
        conditions.push(or(
          eq(bikes.status, "stolen"),
          eq(bikes.status, "found")
        ));
      }

      // The main search query
      if (searchQuery) {
        conditions.push(or(
          like(bikes.brand, `%${searchQuery}%`),
          like(bikes.model, `%${searchQuery}%`),
          like(bikes.serialNumber, `%${searchQuery}%`),
          like(bikes.color, `%${searchQuery}%`)
        ));
      }

      // Type filter
      if (searchType) {
        conditions.push(eq(bikes.type, searchType));
      }

      // Brand filter
      if (searchBrand) {
        conditions.push(eq(bikes.brand, searchBrand));
      }

      // Color filter
      if (searchColor) {
        conditions.push(like(bikes.color, `%${searchColor}%`));
      }

      // Location filter
      if (searchLocationCity) {
        conditions.push(like(bikeReports.theftLocation, `%${searchLocationCity}%`));
      }

      // Date range filter - temporarily disabled due to type issues
      // We'll implement this in a later version
      if (searchDateRange) {
        console.log(`Search date range: ${searchDateRange} - this filter is currently disabled`);
      }

      const finalCondition = conditions.length > 0 
        ? and(...conditions) 
        : undefined;

      const results = await storage.searchBikes(finalCondition, itemsPerPage, offset);
      const total = await storage.countSearchResults(finalCondition);

      res.json({
        results,
        total,
        page: currentPage,
        limit: itemsPerPage,
        totalPages: Math.ceil(total / itemsPerPage)
      });
    } catch (error) {
      next(error);
    }
  });

  // Badges routes
  app.get("/api/badges", async (req, res, next) => {
    try {
      // Get all badges
      const allBadges = await db.query.badges.findMany({
        orderBy: [desc(badges.level), desc(badges.category)]
      });
      res.json(allBadges);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/badges/:id", async (req, res, next) => {
    try {
      const badgeId = parseInt(req.params.id);
      const badge = await db.query.badges.findFirst({
        where: eq(badges.id, badgeId)
      });
      
      if (!badge) {
        return res.status(404).json({ message: "התג לא נמצא" });
      }
      
      res.json(badge);
    } catch (error) {
      next(error);
    }
  });

  // Admin route - create a new badge (locked down in production)
  app.post("/api/badges", ensureAuthenticated, async (req: any, res, next) => {
    try {
      // In production, add additional admin check
      const isAdmin = req.user.id === 1; // Temporary admin check
      if (!isAdmin) {
        return res.status(403).json({ message: "אין לך הרשאה לבצע פעולה זו" });
      }
      
      const validatedData = insertBadgeSchema.parse(req.body);
      const newBadge = await db.insert(badges).values(validatedData).returning();
      res.status(201).json(newBadge[0]);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      next(error);
    }
  });

  // User achievements routes
  app.get("/api/achievements", ensureAuthenticated, async (req: any, res, next) => {
    try {
      // Get user's achievements with badge details
      const userAchievementsList = await db.query.userAchievements.findMany({
        where: eq(userAchievements.userId, req.user.id),
        with: {
          badge: true
        },
        orderBy: desc(userAchievements.completedAt)
      });
      
      res.json(userAchievementsList);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/achievements/check", ensureAuthenticated, async (req: any, res, next) => {
    try {
      const { action, data } = req.body;
      
      // Find badges that meet the requirements for this action
      const eligibleBadges = await db.query.badges.findMany({
        where: (badgeFields) => {
          // We would parse the requirements JSON and check conditions
          // For this demo, we'll use a simplified check
          if (action === 'bike_registration') {
            return eq(badgeFields.category, 'activity');
          } else if (action === 'guide_completion') {
            return eq(badgeFields.category, 'expertise');
          } else if (action === 'registration') {
            return eq(badgeFields.category, 'community');
          }
          return eq(badgeFields.id, 0); // No match
        }
      });
      
      // Get user's existing achievements
      const existingAchievements = await db.query.userAchievements.findMany({
        where: eq(userAchievements.userId, req.user.id),
        columns: {
          badgeId: true
        }
      });
      
      const existingBadgeIds = new Set(existingAchievements.map(a => a.badgeId));
      
      // Award new badges the user doesn't already have
      const newAchievements = [];
      
      for (const badge of eligibleBadges) {
        if (!existingBadgeIds.has(badge.id)) {
          // Check if requirements are met
          const requirements = badge.requirements as any;
          let requirementsMet = false;
          
          // Simple check for different badge types
          if (action === 'bike_registration' && badge.name === 'רשום אופניים') {
            requirementsMet = true;
          } else if (action === 'guide_completion' && badge.name === 'מומחה מתחיל' && data?.guideId === 'basic_maintenance') {
            requirementsMet = true;
          } else if (action === 'registration' && badge.name === 'חבר קהילה') {
            requirementsMet = true;
          }
          
          if (requirementsMet) {
            // Award the badge
            const newAchievement = await db.insert(userAchievements).values({
              userId: req.user.id,
              badgeId: badge.id,
              progress: JSON.stringify({ actionId: action, data })
            }).returning();
            
            newAchievements.push({
              achievement: newAchievement[0],
              badge
            });
            
            // Create an alert for the user about the new badge
            await storage.createAlert({
              userId: req.user.id,
              title: `קיבלת תג חדש: ${badge.name}`,
              message: `ברכות! קיבלת את התג "${badge.name}": ${badge.description}`,
              type: 'achievement',
              relatedEntityType: 'badge',
              relatedEntityId: badge.id
            });
          }
        }
      }
      
      res.json({
        checked: eligibleBadges.length,
        awarded: newAchievements.length,
        newAchievements
      });
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
