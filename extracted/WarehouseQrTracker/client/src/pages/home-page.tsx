import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { QrScanner } from "@/components/ui/qr-scanner";
import { useAuth } from "@/hooks/use-auth";
import { Scan, Loader2 } from "lucide-react";

export default function HomePage() {
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [, setLocation] = useLocation();
  const { user, isLoading, logoutMutation } = useAuth();
  
  const handleQrScanned = (code: string) => {
    setShowQrScanner(false);
    localStorage.setItem("vehicleCode", code);
    setLocation("/auth");
  };
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-primary-600 text-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold">Vehicle QR Tracker</h1>
          {user ? (
            <div className="flex items-center gap-2">
              <span className="mr-2">{user.username}</span>
              <Button variant="outline" size="sm" onClick={handleLogout} className="text-primary-600 bg-white hover:bg-gray-100">
                Logout
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setLocation("/auth")} className="text-primary-600 bg-white hover:bg-gray-100">
              Accedi
            </Button>
          )}
        </div>
      </header>
      
      <main className="flex-grow container mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-center h-[80vh]">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Benvenuto in Vehicle QR Tracker
            </h2>
            <p className="text-gray-600">
              Scansiona il QR code del veicolo per iniziare
            </p>
          </div>
          
          <Button 
            size="lg"
            onClick={() => setShowQrScanner(true)}
            className="flex items-center shadow-md"
          >
            <Scan className="mr-2 h-5 w-5" />
            Scansiona QR Code
          </Button>
        </div>
      </main>
      
      {showQrScanner && (
        <QrScanner 
          onClose={() => setShowQrScanner(false)} 
          onScanned={handleQrScanned}
        />
      )}
    </div>
  );
}
