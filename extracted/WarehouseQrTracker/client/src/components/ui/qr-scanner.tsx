import React, { useEffect, useRef } from "react";
import { useQrScanner } from "@/hooks/use-qr-scanner";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, QrCode, Loader2 } from "lucide-react";

interface QrScannerProps {
  onClose: () => void;
  onScanned: (code: string) => void;
}

export function QrScanner({ onClose, onScanned }: QrScannerProps) {
  const scannerRef = useRef<HTMLDivElement>(null);
  const {
    scannerStatus,
    qrResult,
    setScannerElement,
    startScanner,
    stopScanner,
    mockScan
  } = useQrScanner();
  
  useEffect(() => {
    if (scannerRef.current) {
      setScannerElement(scannerRef.current);
    }
  }, [setScannerElement]);
  
  useEffect(() => {
    if (scannerStatus === "idle" && scannerRef.current) {
      startScanner();
    }
    
    return () => {
      stopScanner();
    };
  }, [startScanner, stopScanner, scannerStatus]);
  
  useEffect(() => {
    if (qrResult) {
      onScanned(qrResult);
    }
  }, [qrResult, onScanned]);
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-lg">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-semibold">Scansiona QR Code</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
            <span className="sr-only">Chiudi</span>
          </Button>
        </CardHeader>
        
        <CardContent>
          <div 
            ref={scannerRef} 
            className="relative bg-gray-100 w-full h-64 rounded-md overflow-hidden flex items-center justify-center"
          >
            {scannerStatus === "scanning" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="w-full h-1 bg-primary absolute top-1/2 animate-pulse"></div>
                <div className="border-2 border-primary absolute inset-10 rounded-lg"></div>
              </div>
            )}
            
            <div className="text-center">
              {scannerStatus === "requesting" && "Accesso alla fotocamera..."}
              {scannerStatus === "scanning" && "Posiziona il QR code all'interno dell'area"}
              {scannerStatus === "error" && "Errore di accesso alla fotocamera"}
              {scannerStatus === "success" && "QR Code rilevato!"}
              
              {(scannerStatus === "requesting" || scannerStatus === "scanning") && (
                <div className="mt-2">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                </div>
              )}
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-center w-full text-muted-foreground">
            {scannerStatus === "requesting" && "Richiesta accesso alla fotocamera..."}
            {scannerStatus === "scanning" && "Scanner attivo"}
            {scannerStatus === "error" && "Impossibile accedere alla fotocamera"}
            {scannerStatus === "success" && `Codice rilevato: ${qrResult}`}
          </div>
          
          <Button 
            className="w-full" 
            onClick={() => mockScan()} 
            disabled={scannerStatus === "success"}
          >
            <QrCode className="mr-2 h-4 w-4" />
            Simula scansione QR (Demo)
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
