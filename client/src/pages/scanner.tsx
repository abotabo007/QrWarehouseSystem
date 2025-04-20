import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { QrScanner } from "@/components/qr-scanner";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Info, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

enum ScanState {
  READY,
  SCANNING,
  SUCCESS,
  ERROR
}

export default function Scanner() {
  const [scanState, setScanState] = useState<ScanState>(ScanState.READY);
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleScan = (result: string) => {
    if (result) {
      setScannedResult(result);
      setScanState(ScanState.SUCCESS);
      
      toast({
        title: "QR Code scansionato",
        description: "Reindirizzamento all'autenticazione...",
      });
      
      // Redirect to auth after a short delay
      setTimeout(() => {
        setLocation("/auth");
      }, 1500);
    }
  };

  const handleError = (error: Error) => {
    console.error("QR Scan Error:", error);
    setScanState(ScanState.ERROR);
    
    toast({
      title: "Errore di scansione",
      description: error.message,
      variant: "destructive",
    });
  };
  
  const startScanning = () => {
    setScanState(ScanState.SCANNING);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <svg className="h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <span className="ml-2 text-lg font-bold text-gray-800">Scanner QR Magazzino</span>
              </div>
            </div>
            <div className="flex items-center">
              <Link href="/auth">
                <Button size="sm" variant="primary">
                  Accedi
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col items-center justify-center">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Scansiona Codice QR</h1>
          <p className="mt-1 text-sm text-gray-500">Posiziona il codice QR all'interno dell'area di scansione</p>
        </div>
        
        <div className="relative w-full max-w-md">
          <Card>
            <CardContent className="p-0 overflow-hidden">
              {scanState === ScanState.SCANNING ? (
                <div className="relative aspect-w-4 aspect-h-3">
                  <QrScanner
                    onScan={handleScan}
                    onError={handleError}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="border-2 border-primary w-2/3 h-2/3 rounded-lg"></div>
                  </div>
                </div>
              ) : (
                <div className="aspect-w-4 aspect-h-3 bg-gray-100 flex items-center justify-center">
                  {scanState === ScanState.SUCCESS ? (
                    <div className="text-center p-4">
                      <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-2" />
                      <p className="text-green-600 font-medium">QR scansionato con successo!</p>
                      <p className="text-sm text-gray-500 mt-1">Reindirizzamento...</p>
                    </div>
                  ) : scanState === ScanState.ERROR ? (
                    <div className="text-center p-4">
                      <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-2" />
                      <p className="text-red-600 font-medium">Errore di scansione</p>
                      <p className="text-sm text-gray-500 mt-1">Per favore, riprova</p>
                    </div>
                  ) : (
                    <div className="text-center p-4">
                      <Info className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="mt-2 text-sm text-gray-500">
                        Camera non attiva
                      </p>
                    </div>
                  )}
                </div>
              )}
              <div className="p-4 bg-white">
                <Button
                  className="w-full"
                  onClick={startScanning}
                  disabled={scanState === ScanState.SCANNING}
                >
                  {scanState === ScanState.SCANNING ? "Scansione in corso..." : "Avvia Scansione"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-8 w-full max-w-md">
          <Card>
            <CardContent className="p-4">
              <h2 className="text-lg font-medium text-gray-900">Istruzioni</h2>
              <ul className="mt-2 text-sm text-gray-600 space-y-1">
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                  <span>Consenti l'accesso alla fotocamera quando richiesto</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                  <span>Posiziona il QR code all'interno del riquadro</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                  <span>Mantieni il dispositivo fermo durante la scansione</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                  <span>Assicurati che ci sia sufficiente illuminazione</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
