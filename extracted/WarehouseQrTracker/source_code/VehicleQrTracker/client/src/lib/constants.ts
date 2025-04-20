import { ChecklistItemInfo } from "@shared/schema";

// Vehicle list for the application
export const VEHICLES = [
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

// Default checklist items
export const DEFAULT_CHECKLIST_ITEMS: ChecklistItemInfo[] = [
  { name: "Borsa medica", status: "present", takenFromCabinet: false },
  { name: "DAE", status: "present", takenFromCabinet: false },
  { name: "Aspiratore", status: "present", takenFromCabinet: false },
  { name: "Barella", status: "present", takenFromCabinet: false },
  { name: "Collari", status: "present", takenFromCabinet: false },
  { name: "Zaino Trauma", status: "present", takenFromCabinet: false },
  { name: "Guanti", status: "present", takenFromCabinet: false },
  { name: "Mascherine", status: "present", takenFromCabinet: false },
  { name: "Kit ustioni", status: "present", takenFromCabinet: false }
];

// Admin user for development
export const ADMIN_USER = {
  fiscalCode: "ADMIN123456789"
};

// Warehouse manager users for development
export const WAREHOUSE_USERS = [
  { fiscalCode: "MAGAZZINO1234567" },
  { fiscalCode: "MAGAZZINO7654321" }
];

// Inventory status options
export const INVENTORY_STATUS_OPTIONS = [
  "Disponibile",
  "Bassa Scorta",
  "In Scadenza",
  "Esaurito"
];
