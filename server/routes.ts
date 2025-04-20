import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { InsertItem, insertItemSchema, insertQrCodeSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // sets up /api/register, /api/login, /api/logout, /api/user
  setupAuth(app);

  // Items API
  app.get("/api/items", async (req, res) => {
    try {
      const items = await storage.getAllItems();
      res.status(200).json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch items" });
    }
  });

  app.get("/api/items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const item = await storage.getItem(id);
      
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }
      
      res.status(200).json(item);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch item" });
    }
  });

  app.post("/api/items", async (req, res) => {
    try {
      const itemData = insertItemSchema.parse(req.body);
      const item = await storage.createItem(itemData);
      res.status(201).json(item);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Failed to create item" });
    }
  });

  app.put("/api/items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const itemData = req.body as Partial<InsertItem>;
      const item = await storage.updateItem(id, itemData);
      
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }
      
      res.status(200).json(item);
    } catch (error) {
      res.status(500).json({ message: "Failed to update item" });
    }
  });

  // QR Codes API
  app.get("/api/qrcodes", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const qrCodes = await storage.getRecentQrCodes(limit);
      res.status(200).json(qrCodes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch QR codes" });
    }
  });

  app.get("/api/qrcodes/item/:itemId", async (req, res) => {
    try {
      const itemId = parseInt(req.params.itemId, 10);
      const qrCodes = await storage.getQrCodesByItemId(itemId);
      res.status(200).json(qrCodes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch QR codes" });
    }
  });

  app.post("/api/qrcodes", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const qrCodeData = insertQrCodeSchema.parse({
        ...req.body,
        createdBy: req.user.id
      });
      
      const qrCode = await storage.createQrCode(qrCodeData);
      res.status(201).json(qrCode);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Failed to create QR code" });
    }
  });

  // Dashboard stats API
  app.get("/api/stats/dashboard", async (req, res) => {
    try {
      const [itemCount, qrCodeCount, todayScans, lowStockItems] = await Promise.all([
        storage.getItemCount(),
        storage.getQrCodeCount(),
        storage.getTodayScansCount(),
        storage.getLowStockItems()
      ]);
      
      res.status(200).json({
        itemCount,
        qrCodeCount,
        todayScans,
        lowStockItemCount: lowStockItems.length
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Users API
  app.get("/api/users", async (req, res) => {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: "Forbidden" });
    }
    
    try {
      const users = await storage.getAllUsers();
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}