import { users, items, qrCodes, scans } from "@shared/schema";
import type { User, InsertUser, Item, InsertItem, QrCode, InsertQrCode, Scan, InsertScan } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUserLastLogin(id: number): Promise<User | undefined>;
  
  // Item operations
  getItem(id: number): Promise<Item | undefined>;
  getItemByCode(code: string): Promise<Item | undefined>;
  createItem(item: InsertItem): Promise<Item>;
  updateItem(id: number, item: Partial<InsertItem>): Promise<Item | undefined>;
  getAllItems(): Promise<Item[]>;
  
  // QR Code operations
  getQrCode(id: number): Promise<QrCode | undefined>;
  getQrCodeByUrl(url: string): Promise<QrCode | undefined>;
  getQrCodesByItemId(itemId: number): Promise<QrCode[]>;
  createQrCode(qrCode: InsertQrCode): Promise<QrCode>;
  getRecentQrCodes(limit: number): Promise<QrCode[]>;
  
  // Scan operations
  createScan(scan: InsertScan): Promise<Scan>;
  getRecentScans(limit: number): Promise<Scan[]>;
  
  // Stats
  getItemCount(): Promise<number>;
  getQrCodeCount(): Promise<number>;
  getTodayScansCount(): Promise<number>;
  getLowStockItems(): Promise<Item[]>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private items: Map<number, Item>;
  private qrCodes: Map<number, QrCode>;
  private scans: Map<number, Scan>;
  sessionStore: session.SessionStore;
  
  private userCurrentId: number;
  private itemCurrentId: number;
  private qrCodeCurrentId: number;
  private scanCurrentId: number;

  constructor() {
    this.users = new Map();
    this.items = new Map();
    this.qrCodes = new Map();
    this.scans = new Map();
    
    this.userCurrentId = 1;
    this.itemCurrentId = 1;
    this.qrCodeCurrentId = 1;
    this.scanCurrentId = 1;
    
    // Initialize session store
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours
    });
    
    // Create default admin user
    this.createUser({
      username: "admin",
      password: "$2b$10$mLYF9MZmzM9SEK0.i3TtjuNFJZgS/Tv3eG0xP4cm1g2ABQBGGXu0W", // admin123
      email: "admin@example.com",
      role: "admin"
    });
    
    // Create warehouse user account (for testing)
    this.createUser({
      username: "magazzino1234567",
      password: "$2b$10$0nrZOJqjIbRG1gMTAV8bC.5lVTkd0CKMK9FHulzOWGZKLAYgWLS0u", // password123
      email: "magazzino@example.com",
      role: "warehouse"
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const now = new Date();
    const user: User = { ...insertUser, id, lastLogin: null, isActive: true };
    this.users.set(id, user);
    return user;
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  async updateUserLastLogin(id: number): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser: User = {
      ...user,
      lastLogin: new Date()
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Item operations
  async getItem(id: number): Promise<Item | undefined> {
    return this.items.get(id);
  }
  
  async getItemByCode(code: string): Promise<Item | undefined> {
    return Array.from(this.items.values()).find(item => item.itemCode === code);
  }
  
  async createItem(item: InsertItem): Promise<Item> {
    const id = this.itemCurrentId++;
    const now = new Date();
    const newItem: Item = { ...item, id, lastUpdated: now };
    this.items.set(id, newItem);
    return newItem;
  }
  
  async updateItem(id: number, item: Partial<InsertItem>): Promise<Item | undefined> {
    const existingItem = await this.getItem(id);
    if (!existingItem) return undefined;
    
    const updatedItem: Item = {
      ...existingItem,
      ...item,
      lastUpdated: new Date()
    };
    
    this.items.set(id, updatedItem);
    return updatedItem;
  }
  
  async getAllItems(): Promise<Item[]> {
    return Array.from(this.items.values());
  }
  
  // QR Code operations
  async getQrCode(id: number): Promise<QrCode | undefined> {
    return this.qrCodes.get(id);
  }
  
  async getQrCodeByUrl(url: string): Promise<QrCode | undefined> {
    return Array.from(this.qrCodes.values()).find(qrCode => qrCode.url === url);
  }
  
  async getQrCodesByItemId(itemId: number): Promise<QrCode[]> {
    return Array.from(this.qrCodes.values()).filter(qrCode => qrCode.itemId === itemId);
  }
  
  async createQrCode(qrCode: InsertQrCode): Promise<QrCode> {
    const id = this.qrCodeCurrentId++;
    const now = new Date();
    const newQrCode: QrCode = { ...qrCode, id, createdAt: now };
    this.qrCodes.set(id, newQrCode);
    return newQrCode;
  }
  
  async getRecentQrCodes(limit: number): Promise<QrCode[]> {
    return Array.from(this.qrCodes.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }
  
  // Scan operations
  async createScan(scan: InsertScan): Promise<Scan> {
    const id = this.scanCurrentId++;
    const now = new Date();
    const newScan: Scan = { ...scan, id, timestamp: now };
    this.scans.set(id, newScan);
    return newScan;
  }
  
  async getRecentScans(limit: number): Promise<Scan[]> {
    return Array.from(this.scans.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }
  
  // Stats
  async getItemCount(): Promise<number> {
    return this.items.size;
  }
  
  async getQrCodeCount(): Promise<number> {
    return this.qrCodes.size;
  }
  
  async getTodayScansCount(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return Array.from(this.scans.values())
      .filter(scan => scan.timestamp >= today)
      .length;
  }
  
  async getLowStockItems(): Promise<Item[]> {
    // Consider items with quantity < 15 as low stock
    return Array.from(this.items.values())
      .filter(item => item.quantity !== null && item.quantity < 15);
  }
}

export const storage = new MemStorage();
