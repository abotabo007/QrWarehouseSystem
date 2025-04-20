import { pgTable, text, serial, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Authentication schemas (for validation)
export const loginSchema = z.object({
  fiscalCode: z.string().min(1, "Codice fiscale è richiesto"),
  password: z.string().min(1, "Password è richiesta")
});

export const registerSchema = z.object({
  name: z.string().min(1, "Nome è richiesto"),
  surname: z.string().min(1, "Cognome è richiesto"),
  fiscalCode: z.string().min(1, "Codice fiscale è richiesto"),
  password: z.string().min(6, "Password deve essere di almeno 6 caratteri")
});

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  surname: text("surname").notNull(),
  fiscalCode: text("fiscal_code").notNull().unique(),
  isAdmin: boolean("is_admin").default(false),
  isWarehouseManager: boolean("is_warehouse_manager").default(false),
});

export const insertUserSchema = createInsertSchema(users).pick({
  name: true,
  surname: true,
  fiscalCode: true,
  isAdmin: true,
  isWarehouseManager: true,
});

// Vehicles schema
export const vehicles = pgTable("vehicles", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  displayName: text("display_name").notNull(),
});

export const insertVehicleSchema = createInsertSchema(vehicles).pick({
  code: true,
  displayName: true,
});

// Checklist item status enum
export const itemStatusEnum = pgEnum("item_status", ["present", "missing"]);

// Checklist schema
export const checklists = pgTable("checklists", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  vehicleId: integer("vehicle_id").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  oxygenLevel: integer("oxygen_level").notNull(),
});

export const insertChecklistSchema = createInsertSchema(checklists).pick({
  userId: true,
  vehicleId: true,
  oxygenLevel: true,
});

// Checklist items schema
export const checklistItems = pgTable("checklist_items", {
  id: serial("id").primaryKey(),
  checklistId: integer("checklist_id").notNull(),
  name: text("name").notNull(),
  status: itemStatusEnum("status").notNull(),
  takenFromCabinet: boolean("taken_from_cabinet").default(false),
});

export const insertChecklistItemSchema = createInsertSchema(checklistItems).pick({
  checklistId: true,
  name: true,
  status: true,
  takenFromCabinet: true,
});

// Inventory schema
export const inventory = pgTable("inventory", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  quantity: integer("quantity").notNull(),
  expiryDate: text("expiry_date"),
  status: text("status").notNull(),
});

export const insertInventorySchema = createInsertSchema(inventory).pick({
  name: true,
  quantity: true,
  expiryDate: true,
  status: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Vehicle = typeof vehicles.$inferSelect;
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;

export type Checklist = typeof checklists.$inferSelect;
export type InsertChecklist = z.infer<typeof insertChecklistSchema>;

export type ChecklistItem = typeof checklistItems.$inferSelect;
export type InsertChecklistItem = z.infer<typeof insertChecklistItemSchema>;

export type InventoryItem = typeof inventory.$inferSelect;
export type InsertInventoryItem = z.infer<typeof insertInventorySchema>;

// Custom types for frontend
export type ChecklistWithItems = Checklist & {
  items: ChecklistItem[];
  user: User;
  vehicle: Vehicle;
};

export type VehicleInfo = {
  id: number;
  code: string;
  displayName: string;
};

export type ChecklistItemInfo = {
  name: string;
  status: "present" | "missing";
  takenFromCabinet: boolean;
};
