import session from "express-session";
import { eq } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import { Pool } from "@neondatabase/serverless";
import { 
  User, InsertUser, 
  Vehicle, InsertVehicle,
  Checklist, InsertChecklist,
  ChecklistItem, InsertChecklistItem,
  InventoryItem, InsertInventoryItem,
  ChecklistWithItems
} from "@shared/schema";
import { db } from "./db";
import { users, vehicles, checklists, checklistItems, inventory } from "@shared/schema";

// Setup session store
const PostgresSessionStore = connectPg(session);

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByFiscalCode(fiscalCode: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  
  // Vehicle operations
  getVehicle(id: number): Promise<Vehicle | undefined>;
  getVehicleByCode(code: string): Promise<Vehicle | undefined>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  getAllVehicles(): Promise<Vehicle[]>;
  
  // Checklist operations
  getChecklist(id: number): Promise<Checklist | undefined>;
  createChecklist(checklist: InsertChecklist): Promise<Checklist>;
  getChecklistsByVehicleId(vehicleId: number): Promise<Checklist[]>;
  getChecklistWithItems(id: number): Promise<ChecklistWithItems | undefined>;
  getAllChecklists(): Promise<Checklist[]>;
  
  // Checklist items operations
  getChecklistItem(id: number): Promise<ChecklistItem | undefined>;
  createChecklistItem(item: InsertChecklistItem): Promise<ChecklistItem>;
  getChecklistItemsByChecklistId(checklistId: number): Promise<ChecklistItem[]>;
  
  // Inventory operations
  getInventoryItem(id: number): Promise<InventoryItem | undefined>;
  createInventoryItem(item: InsertInventoryItem): Promise<InventoryItem>;
  updateInventoryItem(id: number, item: Partial<InsertInventoryItem>): Promise<InventoryItem | undefined>;
  getAllInventoryItems(): Promise<InventoryItem[]>;
  
  // Session store
  sessionStore: session.Store;
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;
  
  constructor() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true
    });
    
    // Ensure we have default user data
    this.seedInitialData();
  }
  
  private async seedInitialData() {
    try {
      // Check if admin user exists
      const adminUser = await this.getUserByFiscalCode("ADMIN123456789");
      if (!adminUser) {
        await this.createUser({
          username: "admin",
          password: "admin123",
          name: "Admin",
          surname: "User",
          fiscalCode: "ADMIN123456789",
          isAdmin: true,
          isWarehouseManager: false
        });
      }
      
      // Check if warehouse manager exists
      const warehouseUser = await this.getUserByFiscalCode("MAGAZZINO1234567");
      if (!warehouseUser) {
        await this.createUser({
          username: "magazzino",
          password: "magazzino123",
          name: "Magazzino",
          surname: "Manager",
          fiscalCode: "MAGAZZINO1234567",
          isAdmin: false,
          isWarehouseManager: true
        });
      }
      
      // Check if vehicles exist
      const vehicle1 = await this.getVehicleByCode("CRI 433 AF 151201");
      if (!vehicle1) {
        await this.createVehicle({
          code: "CRI 433 AF 151201",
          displayName: "CRI 433 AF"
        });
      }
      
      const vehicle2 = await this.getVehicleByCode("CRI 522 AF 151202");
      if (!vehicle2) {
        await this.createVehicle({
          code: "CRI 522 AF 151202",
          displayName: "CRI 522 AF"
        });
      }
      
      // Aggiungi altri veicoli
      const vehicle3 = await this.getVehicleByCode("CRI 638 AG 151203");
      if (!vehicle3) {
        await this.createVehicle({
          code: "CRI 638 AG 151203",
          displayName: "CRI 638 AG"
        });
      }
      
      const vehicle4 = await this.getVehicleByCode("CRI 745 AH 151204");
      if (!vehicle4) {
        await this.createVehicle({
          code: "CRI 745 AH 151204",
          displayName: "CRI 745 AH"
        });
      }
      
      const vehicle5 = await this.getVehicleByCode("CRI 856 AJ 151205");
      if (!vehicle5) {
        await this.createVehicle({
          code: "CRI 856 AJ 151205",
          displayName: "CRI 856 AJ"
        });
      }
    } catch (error) {
      console.error("Error seeding initial data:", error);
    }
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }
  
  async getUserByFiscalCode(fiscalCode: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.fiscalCode, fiscalCode));
    return user || undefined;
  }
  
  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }
  
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }
  
  // Vehicle operations
  async getVehicle(id: number): Promise<Vehicle | undefined> {
    const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, id));
    return vehicle || undefined;
  }
  
  async getVehicleByCode(code: string): Promise<Vehicle | undefined> {
    const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.code, code));
    return vehicle || undefined;
  }
  
  async createVehicle(vehicleData: InsertVehicle): Promise<Vehicle> {
    const [vehicle] = await db.insert(vehicles).values(vehicleData).returning();
    return vehicle;
  }
  
  async getAllVehicles(): Promise<Vehicle[]> {
    return await db.select().from(vehicles);
  }
  
  // Checklist operations
  async getChecklist(id: number): Promise<Checklist | undefined> {
    const [checklist] = await db.select().from(checklists).where(eq(checklists.id, id));
    return checklist || undefined;
  }
  
  async createChecklist(checklistData: InsertChecklist): Promise<Checklist> {
    const [checklist] = await db.insert(checklists).values(checklistData).returning();
    return checklist;
  }
  
  async getChecklistsByVehicleId(vehicleId: number): Promise<Checklist[]> {
    return await db.select().from(checklists).where(eq(checklists.vehicleId, vehicleId));
  }
  
  async getChecklistWithItems(id: number): Promise<ChecklistWithItems | undefined> {
    const checklist = await this.getChecklist(id);
    if (!checklist) return undefined;
    
    const items = await this.getChecklistItemsByChecklistId(id);
    const user = await this.getUser(checklist.userId);
    const vehicle = await this.getVehicle(checklist.vehicleId);
    
    if (!user || !vehicle) return undefined;
    
    return {
      ...checklist,
      items,
      user,
      vehicle
    };
  }
  
  async getAllChecklists(): Promise<Checklist[]> {
    return await db.select().from(checklists);
  }
  
  // Checklist items operations
  async getChecklistItem(id: number): Promise<ChecklistItem | undefined> {
    const [item] = await db.select().from(checklistItems).where(eq(checklistItems.id, id));
    return item || undefined;
  }
  
  async createChecklistItem(itemData: InsertChecklistItem): Promise<ChecklistItem> {
    const [item] = await db.insert(checklistItems).values(itemData).returning();
    return item;
  }
  
  async getChecklistItemsByChecklistId(checklistId: number): Promise<ChecklistItem[]> {
    return await db.select().from(checklistItems).where(eq(checklistItems.checklistId, checklistId));
  }
  
  // Inventory operations
  async getInventoryItem(id: number): Promise<InventoryItem | undefined> {
    const [item] = await db.select().from(inventory).where(eq(inventory.id, id));
    return item || undefined;
  }
  
  async createInventoryItem(itemData: InsertInventoryItem): Promise<InventoryItem> {
    const [item] = await db.insert(inventory).values(itemData).returning();
    return item;
  }
  
  async updateInventoryItem(id: number, itemData: Partial<InsertInventoryItem>): Promise<InventoryItem | undefined> {
    const [item] = await db
      .update(inventory)
      .set(itemData)
      .where(eq(inventory.id, id))
      .returning();
    return item || undefined;
  }
  
  async deleteInventoryItem(id: number): Promise<boolean> {
    const result = await db
      .delete(inventory)
      .where(eq(inventory.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }
  
  async getAllInventoryItems(): Promise<InventoryItem[]> {
    return await db.select().from(inventory);
  }
}

// Export a single instance of the storage
export const storage = new DatabaseStorage();