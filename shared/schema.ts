import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  role: text("role").default("user"),
  lastLogin: timestamp("last_login"),
  isActive: boolean("is_active").default(true),
});

export const items = pgTable("items", {
  id: serial("id").primaryKey(),
  itemCode: text("item_code").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  location: text("location"),
  quantity: integer("quantity").default(0),
  status: text("status").default("available"),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const qrCodes = pgTable("qr_codes", {
  id: serial("id").primaryKey(),
  itemId: integer("item_id").references(() => items.id),
  url: text("url").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: integer("created_by").references(() => users.id),
});

export const scans = pgTable("scans", {
  id: serial("id").primaryKey(),
  qrCodeId: integer("qr_code_id").references(() => qrCodes.id),
  userId: integer("user_id").references(() => users.id),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Zod schemas for insert operations
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  role: true,
});

export const insertItemSchema = createInsertSchema(items).pick({
  itemCode: true,
  name: true,
  description: true,
  location: true,
  quantity: true,
  status: true,
});

export const insertQrCodeSchema = createInsertSchema(qrCodes).pick({
  itemId: true,
  url: true,
  createdBy: true,
});

export const insertScanSchema = createInsertSchema(scans).pick({
  qrCodeId: true,
  userId: true,
});

// Types for insert operations
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertItem = z.infer<typeof insertItemSchema>;
export type InsertQrCode = z.infer<typeof insertQrCodeSchema>;
export type InsertScan = z.infer<typeof insertScanSchema>;

// Types for select operations
export type User = typeof users.$inferSelect;
export type Item = typeof items.$inferSelect;
export type QrCode = typeof qrCodes.$inferSelect;
export type Scan = typeof scans.$inferSelect;

// Login schema
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type LoginData = z.infer<typeof loginSchema>;

// Registration schema
export const registerSchema = insertUserSchema.extend({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type RegisterData = z.infer<typeof registerSchema>;

// Item creation schema
export const createItemSchema = insertItemSchema.extend({
  quantity: z.number().min(0, "Quantity cannot be negative"),
});

export type CreateItemData = z.infer<typeof createItemSchema>;
