import { pgTable, text, serial, integer, boolean, timestamp, foreignKey, json } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// User table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firebase_uid: text("firebase_uid").unique(),
  email: text("email"),
  phone: text("phone"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  profilePicture: text("profile_picture"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User relations defined below after all tables are created

// Bike table
export const bikes = pgTable("bikes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  brand: text("brand").notNull(),
  model: text("model").notNull(),
  type: text("type").notNull(),
  year: integer("year").notNull(),
  color: text("color").notNull(),
  frameSize: text("frame_size"),
  serialNumber: text("serial_number").notNull(),
  additionalInfo: text("additional_info"),
  imageUrl: text("image_url"),
  status: text("status").default("registered").notNull(), // registered, stolen, found
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const bikesRelations = relations(bikes, ({ one, many }) => ({
  user: one(users, {
    fields: [bikes.userId],
    references: [users.id]
  }),
  reports: many(bikeReports)
}));

// Bike theft report table
export const bikeReports = pgTable("bike_reports", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  bikeId: integer("bike_id").references(() => bikes.id).notNull(),
  theftDate: timestamp("theft_date").notNull(),
  theftLocation: text("theft_location").notNull(),
  theftDetails: text("theft_details"),
  policeReported: boolean("police_reported").default(false),
  policeStation: text("police_station"),
  policeFileNumber: text("police_file_number"),
  useProfileContact: boolean("use_profile_contact").default(true),
  contactName: text("contact_name"),
  contactPhone: text("contact_phone"),
  contactEmail: text("contact_email"),
  visibility: text("visibility").default("public"), // public, private
  status: text("status").default("active"), // active, resolved
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const bikeReportsRelations = relations(bikeReports, ({ one }) => ({
  user: one(users, {
    fields: [bikeReports.userId],
    references: [users.id]
  }),
  bike: one(bikes, {
    fields: [bikeReports.bikeId],
    references: [bikes.id]
  })
}));

// Alerts table
export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // notification, match, update
  relatedEntityType: text("related_entity_type"), // bike, report, other
  relatedEntityId: integer("related_entity_id"),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const alertsRelations = relations(alerts, ({ one }) => ({
  user: one(users, {
    fields: [alerts.userId],
    references: [users.id]
  })
}));

// Schema for user operations
export const insertUserSchema = createInsertSchema(users, {
  username: (schema) => schema.min(3, "שם משתמש חייב להכיל לפחות 3 תווים"),
  password: (schema) => schema.min(6, "סיסמה חייבת להכיל לפחות 6 תווים"),
}).omit({ createdAt: true });

export const updateProfileSchema = createInsertSchema(users, {
  username: (schema) => schema.min(3, "שם משתמש חייב להכיל לפחות 3 תווים"),
  email: (schema) => schema.email("אימייל לא תקין").optional().nullish(),
  phone: (schema) => schema.optional().nullish(),
  firstName: (schema) => schema.optional().nullish(),
  lastName: (schema) => schema.optional().nullish()
}).omit({ password: true, createdAt: true });

// Schema for bike operations
export const insertBikeSchema = createInsertSchema(bikes, {
  brand: (schema) => schema.min(1, "יש לציין את יצרן האופניים"),
  model: (schema) => schema.min(1, "יש לציין את דגם האופניים"),
  serialNumber: (schema) => schema.min(4, "מספר שלדה חייב להכיל לפחות 4 תווים"),
}).omit({ id: true, userId: true, status: true, createdAt: true, updatedAt: true });

// Schema for theft report operations
export const insertReportSchema = createInsertSchema(bikeReports, {
  bikeId: (schema) => schema.min(1, "יש לבחור אופניים"),
  theftLocation: (schema) => schema.min(1, "יש להזין מיקום גניבה"),
}).omit({ id: true, userId: true, status: true, createdAt: true, updatedAt: true });

// Badges table
export const badges = pgTable("badges", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  category: text("category").notNull(), // safety, community, activity, expertise
  level: integer("level").notNull().default(1), // 1=bronze, 2=silver, 3=gold
  requirements: json("requirements").notNull(), // criteria for unlocking
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User achievements table
export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  badgeId: integer("badge_id").references(() => badges.id).notNull(),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
  progress: json("progress"), // optional progress data
});

// Add relations
export const badgesRelations = relations(badges, ({ many }) => ({
  achievements: many(userAchievements)
}));

export const userAchievementsRelations = relations(userAchievements, ({ one }) => ({
  user: one(users, {
    fields: [userAchievements.userId],
    references: [users.id]
  }),
  badge: one(badges, {
    fields: [userAchievements.badgeId],
    references: [badges.id]
  })
}));

// Define user relations with all related entities
export const usersRelations = relations(users, ({ many }) => ({
  bikes: many(bikes),
  reports: many(bikeReports),
  alerts: many(alerts),
  achievements: many(userAchievements)
}));

// Create schemas for badge operations
export const insertBadgeSchema = createInsertSchema(badges, {
  name: (schema) => schema.min(2, "שם התג חייב להכיל לפחות 2 תווים"),
  description: (schema) => schema.min(10, "תיאור התג חייב להכיל לפחות 10 תווים"),
}).omit({ id: true, createdAt: true });

// Create schemas for user achievement operations
export const insertUserAchievementSchema = createInsertSchema(userAchievements).omit({ 
  id: true, 
  completedAt: true 
});

// Type exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type UpdateProfile = z.infer<typeof updateProfileSchema>;

export type InsertBike = z.infer<typeof insertBikeSchema> & {
  userId: number;
  status: string;
};
export type Bike = typeof bikes.$inferSelect;

export type InsertBikeReport = z.infer<typeof insertReportSchema> & {
  userId: number;
  status: string;
};
export type BikeReport = typeof bikeReports.$inferSelect & {
  bike?: Bike;
};

export type Alert = typeof alerts.$inferSelect;

// Badge related types
export type Badge = typeof badges.$inferSelect;
export type InsertBadge = z.infer<typeof insertBadgeSchema>;

export type UserAchievement = typeof userAchievements.$inferSelect & {
  badge?: Badge;
};
export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;

// Search result type
export type BikeSearch = {
  id: number;
  brand: string;
  model: string;
  type: string;
  color: string;
  year: number;
  serialNumber: string;
  status: string;
  imageUrl: string | null;
  reportDate: string | null;
  location: string | null;
  reportId: number | null;
};
