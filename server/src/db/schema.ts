import { pgTable, serial, integer, timestamp, text, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  phone: text('phone'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const bikes = pgTable('bikes', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  brand: text('brand').notNull(),
  model: text('model').notNull(),
  type: text('type').notNull(),
  color: text('color').notNull(),
  year: integer('year').notNull(),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const theftReports = pgTable('theft_reports', {
  id: serial('id').primaryKey(),
  bikeId: integer('bike_id').notNull().references(() => bikes.id),
  userId: integer('user_id').notNull().references(() => users.id),
  theftDate: timestamp('theft_date').notNull(),
  theftLocation: text('theft_location').notNull(),
  theftDetails: text('theft_details'),
  policeReported: boolean('police_reported').notNull().default(false),
  policeStation: text('police_station'),
  policeFileNumber: text('police_file_number'),
  contactName: text('contact_name').notNull(),
  contactPhone: text('contact_phone').notNull(),
  contactEmail: text('contact_email'),
  visibility: text('visibility').notNull().default('public'),
  status: text('status').notNull().default('stolen'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  latitude: text('latitude').notNull(),
  longitude: text('longitude').notNull(),
}); 