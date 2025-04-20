import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertUserSchema, insertChecklistSchema, insertChecklistItemSchema, insertInventorySchema } from "@shared/schema";
import { setupAuth } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);
  
  // Define API routes
  const apiRouter = express.Router();
  
  // VEHICLES ROUTES
  // Get all vehicles
  apiRouter.get("/vehicles", async (req: Request, res: Response) => {
    try {
      const vehicles = await storage.getAllVehicles();
      res.json(vehicles);
    } catch (error) {
      res.status(500).json({ message: "Error fetching vehicles" });
    }
  });
  
  // Get a specific vehicle
  apiRouter.get("/vehicles/:code", async (req: Request, res: Response) => {
    try {
      const vehicleCode = req.params.code;
      const vehicle = await storage.getVehicleByCode(vehicleCode);
      
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      
      res.json(vehicle);
    } catch (error) {
      res.status(500).json({ message: "Error fetching vehicle" });
    }
  });
  
  // USER ROUTES
  // Admin login - using the new authentication system
  apiRouter.post("/users/admin-login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      // Check if user exists
      const user = await storage.getUserByUsername(username);
      
      if (!user || !user.isAdmin) {
        return res.status(401).json({ message: "Unauthorized: Invalid credentials or not an admin user" });
      }
      
      // Authentication will be handled by passport
      // This API is kept for backward compatibility
      res.json({ redirectTo: "/api/login" });
    } catch (error) {
      res.status(500).json({ message: "Error processing admin login" });
    }
  });
  
  // Warehouse manager login - using the new authentication system
  apiRouter.post("/users/warehouse-login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      // Check if user exists
      const user = await storage.getUserByUsername(username);
      
      if (!user || !user.isWarehouseManager) {
        return res.status(401).json({ message: "Unauthorized: Invalid credentials or not a warehouse manager" });
      }
      
      // Authentication will be handled by passport
      // This API is kept for backward compatibility
      res.json({ redirectTo: "/api/login" });
    } catch (error) {
      res.status(500).json({ message: "Error processing warehouse manager login" });
    }
  });
  
  // CHECKLIST ROUTES
  // Create a new checklist
  apiRouter.post("/checklists", async (req: Request, res: Response) => {
    try {
      const checklistData = insertChecklistSchema.parse(req.body);
      const items = z.array(insertChecklistItemSchema.omit({ checklistId: true })).parse(req.body.items);
      
      // Verify user exists
      const user = await storage.getUser(checklistData.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Verify vehicle exists
      const vehicle = await storage.getVehicle(checklistData.vehicleId);
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      
      // Create checklist
      const checklist = await storage.createChecklist(checklistData);
      
      // Create checklist items
      for (const item of items) {
        await storage.createChecklistItem({
          ...item,
          checklistId: checklist.id
        });
      }
      
      // Return the complete checklist with items
      const completeChecklist = await storage.getChecklistWithItems(checklist.id);
      res.status(201).json(completeChecklist);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid checklist data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating checklist" });
    }
  });
  
  // Get all checklists
  apiRouter.get("/checklists", async (req: Request, res: Response) => {
    try {
      const checklists = await storage.getAllChecklists();
      
      // Get detailed checklist data
      const checklistsWithItems = await Promise.all(
        checklists.map(checklist => storage.getChecklistWithItems(checklist.id))
      );
      
      // Filter out undefined values
      const validChecklists = checklistsWithItems.filter(c => c !== undefined);
      
      res.json(validChecklists);
    } catch (error) {
      res.status(500).json({ message: "Error fetching checklists" });
    }
  });
  
  // INVENTORY ROUTES
  // Get all inventory items
  apiRouter.get("/inventory", async (req: Request, res: Response) => {
    try {
      const items = await storage.getAllInventoryItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Error fetching inventory items" });
    }
  });
  
  // Create an inventory item
  apiRouter.post("/inventory", async (req: Request, res: Response) => {
    try {
      const itemData = insertInventorySchema.parse(req.body);
      const item = await storage.createInventoryItem(itemData);
      res.status(201).json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid inventory data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating inventory item" });
    }
  });
  
  // Update an inventory item
  apiRouter.put("/inventory/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      const itemData = insertInventorySchema.partial().parse(req.body);
      const item = await storage.updateInventoryItem(id, itemData);
      
      if (!item) {
        return res.status(404).json({ message: "Inventory item not found" });
      }
      
      res.json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid inventory data", errors: error.errors });
      }
      res.status(500).json({ message: "Error updating inventory item" });
    }
  });
  
  // Delete an inventory item
  apiRouter.delete("/inventory/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      const success = await storage.deleteInventoryItem(id);
      
      if (!success) {
        return res.status(404).json({ message: "Inventory item not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Error deleting inventory item" });
    }
  });

  // Use the API router with /api prefix
  app.use("/api", apiRouter);

  const httpServer = createServer(app);
  return httpServer;
}
