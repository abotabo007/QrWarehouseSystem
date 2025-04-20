import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// QR code generation
export function generateQRValue(vehicleCode: string): string {
  // Create URL for QR code
  const baseUrl = window.location.origin;
  return `${baseUrl}/veicolo/${encodeURIComponent(vehicleCode)}`;
}

// Format fiscal code to uppercase and validate basic format
export function formatFiscalCode(code: string): string {
  return code.toUpperCase().trim();
}

// Basic validation of Italian fiscal code format
export function isValidFiscalCode(code: string): boolean {
  const regex = /^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/i;
  return regex.test(code);
}
