import { 
  users, User, InsertUser, 
  vehicles, Vehicle, InsertVehicle,
  checklists, Checklist, InsertChecklist,
  checklistItems, ChecklistItem, InsertChecklistItem,
  inventory, InventoryItem, InsertInventoryItem,
  ChecklistWithItems
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByFiscalCode(fiscalCode: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Vehicle methods
  getVehicle(id: number): Promise<Vehicle | undefined>;
  getVehicleByCode(code: string): Promise<Vehicle | undefined>;
  getAllVehicles(): Promise<Vehicle[]>;
  
  // Checklist methods
  createChecklist(checklist: InsertChecklist): Promise<Checklist>;
  getChecklist(id: number): Promise<Checklist | undefined>;
  getChecklistsByVehicle(vehicleId: number): Promise<Checklist[]>;
  getAllChecklists(): Promise<Checklist[]>;
  getChecklistWithItems(id: number): Promise<ChecklistWithItems | undefined>;
  
  // Checklist item methods
  createChecklistItem(item: InsertChecklistItem): Promise<ChecklistItem>;
  getChecklistItemsByChecklist(checklistId: number): Promise<ChecklistItem[]>;
  
  // Inventory methods
  createInventoryItem(item: InsertInventoryItem): Promise<InventoryItem>;
  updateInventoryItem(id: number, item: Partial<InsertInventoryItem>): Promise<InventoryItem | undefined>;
  deleteInventoryItem(id: number): Promise<boolean>;
  getInventoryItem(id: number): Promise<InventoryItem | undefined>;
  getAllInventoryItems(): Promise<InventoryItem[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private vehicles: Map<number, Vehicle>;
  private checklists: Map<number, Checklist>;
  private checklistItems: Map<number, ChecklistItem>;
  private inventoryItems: Map<number, InventoryItem>;
  
  private userIdCounter: number;
  private vehicleIdCounter: number;
  private checklistIdCounter: number;
  private checklistItemIdCounter: number;
  private inventoryIdCounter: number;

  constructor() {
    this.users = new Map();
    this.vehicles = new Map();
    this.checklists = new Map();
    this.checklistItems = new Map();
    this.inventoryItems = new Map();
    
    this.userIdCounter = 1;
    this.vehicleIdCounter = 1;
    this.checklistIdCounter = 1;
    this.checklistItemIdCounter = 1;
    this.inventoryIdCounter = 1;
    
    // Initialize with default vehicles
    this.initializeVehicles();
    // Initialize with admin and warehouse manager users
    this.initializeAdminUsers();
    // Initialize with sample inventory items
    this.initializeInventory();
  }

  // Initialize vehicles
  private initializeVehicles() {
    const vehicleData = [
      { code: "CRI 433 AF 151201", displayName: "CRI 433 AF" },
      { code: "CRI 990 AE 151203", displayName: "CRI 990 AE" },
      { code: "CRI 454 AC 151205", displayName: "CRI 454 AC" },
      { code: "CRI 434 AF 151206", displayName: "CRI 434 AF" },
      { code: "CRI 704 AF 151208", displayName: "CRI 704 AF" },
      { code: "CRI 033 AH 151209", displayName: "CRI 033 AH" },
      { code: "CRI 363 AA 151210", displayName: "CRI 363 AA" },
      { code: "CRI 197 AH 151211", displayName: "CRI 197 AH" },
      { code: "CRI 499 AB 151212", displayName: "CRI 499 AB" },
      { code: "CRI 281 AE 151217", displayName: "CRI 281 AE" }
    ];

    vehicleData.forEach(vehicle => {
      this.createVehicle({
        code: vehicle.code,
        displayName: vehicle.displayName
      });
    });
  }

  // Initialize admin users
  private initializeAdminUsers() {
    // Create an admin user
    this.users.set(this.userIdCounter++, {
      id: 1,
      name: "Admin",
      surname: "User",
      fiscalCode: "ADMIN123456789",
      isAdmin: true,
      isWarehouseManager: false
    });
    
    // Create warehouse managers
    this.users.set(this.userIdCounter++, {
      id: 2,
      name: "Magazzino",
      surname: "User1",
      fiscalCode: "MAGAZZINO1234567",
      isAdmin: false,
      isWarehouseManager: true
    });
    
    this.users.set(this.userIdCounter++, {
      id: 3,
      name: "Magazzino",
      surname: "User2",
      fiscalCode: "MAGAZZINO7654321",
      isAdmin: false,
      isWarehouseManager: true
    });
  }

  // Initialize inventory
  private initializeInventory() {
    const inventoryData = [
      { name: "Guanti monouso (M)", quantity: 125, expiryDate: "12/2024", status: "Disponibile" },
      { name: "Disinfettante", quantity: 8, expiryDate: "05/2024", status: "Disponibile" },
      { name: "Bombole Ossigeno", quantity: 3, expiryDate: "", status: "Bassa Scorta" },
      { name: "Elettrodi DAE", quantity: 5, expiryDate: "01/2024", status: "In Scadenza" }
    ];

    inventoryData.forEach(item => {
      this.createInventoryItem({
        name: item.name,
        quantity: item.quantity,
        expiryDate: item.expiryDate,
        status: item.status
      });
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByFiscalCode(fiscalCode: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.fiscalCode === fiscalCode
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Vehicle methods
  async getVehicle(id: number): Promise<Vehicle | undefined> {
    return this.vehicles.get(id);
  }

  async getVehicleByCode(code: string): Promise<Vehicle | undefined> {
    return Array.from(this.vehicles.values()).find(
      (vehicle) => vehicle.code === code
    );
  }

  async getAllVehicles(): Promise<Vehicle[]> {
    return Array.from(this.vehicles.values());
  }

  async createVehicle(insertVehicle: InsertVehicle): Promise<Vehicle> {
    const id = this.vehicleIdCounter++;
    const vehicle = { ...insertVehicle, id };
    this.vehicles.set(id, vehicle);
    return vehicle;
  }
  
  // Checklist methods
  async createChecklist(insertChecklist: InsertChecklist): Promise<Checklist> {
    const id = this.checklistIdCounter++;
    const timestamp = new Date();
    const checklist = { ...insertChecklist, id, timestamp };
    this.checklists.set(id, checklist);
    return checklist;
  }

  async getChecklist(id: number): Promise<Checklist | undefined> {
    return this.checklists.get(id);
  }

  async getChecklistsByVehicle(vehicleId: number): Promise<Checklist[]> {
    return Array.from(this.checklists.values()).filter(
      (checklist) => checklist.vehicleId === vehicleId
    );
  }

  async getAllChecklists(): Promise<Checklist[]> {
    return Array.from(this.checklists.values());
  }

  async getChecklistWithItems(id: number): Promise<ChecklistWithItems | undefined> {
    const checklist = await this.getChecklist(id);
    if (!checklist) return undefined;
    
    const items = await this.getChecklistItemsByChecklist(id);
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
  
  // Checklist item methods
  async createChecklistItem(insertItem: InsertChecklistItem): Promise<ChecklistItem> {
    const id = this.checklistItemIdCounter++;
    const item = { ...insertItem, id };
    this.checklistItems.set(id, item);
    return item;
  }

  async getChecklistItemsByChecklist(checklistId: number): Promise<ChecklistItem[]> {
    return Array.from(this.checklistItems.values()).filter(
      (item) => item.checklistId === checklistId
    );
  }
  
  // Inventory methods
  async createInventoryItem(insertItem: InsertInventoryItem): Promise<InventoryItem> {
    const id = this.inventoryIdCounter++;
    const item = { ...insertItem, id };
    this.inventoryItems.set(id, item);
    return item;
  }

  async updateInventoryItem(id: number, itemUpdate: Partial<InsertInventoryItem>): Promise<InventoryItem | undefined> {
    const existingItem = await this.getInventoryItem(id);
    if (!existingItem) return undefined;
    
    const updatedItem = { ...existingItem, ...itemUpdate };
    this.inventoryItems.set(id, updatedItem);
    return updatedItem;
  }

  async deleteInventoryItem(id: number): Promise<boolean> {
    return this.inventoryItems.delete(id);
  }

  async getInventoryItem(id: number): Promise<InventoryItem | undefined> {
    return this.inventoryItems.get(id);
  }

  async getAllInventoryItems(): Promise<InventoryItem[]> {
    return Array.from(this.inventoryItems.values());
  }
}

export const storage = new MemStorage();
