import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { AuthForm } from "@/components/auth-form";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

export default function AuthPage() {
  const [vehicleCode, setVehicleCode] = useState<string>("");
  const [, setLocation] = useLocation();
  const { user, isLoading } = useAuth();
  
  useEffect(() => {
    const code = localStorage.getItem("vehicleCode");
    if (!code) {
      setLocation("/");
      return;
    }
    
    setVehicleCode(code);
  }, [setLocation]);
  
  useEffect(() => {
    // If user is logged in, redirect to checklist
    if (user && vehicleCode) {
      setLocation(`/checklist/${vehicleCode}`);
    }
  }, [user, vehicleCode, setLocation]);
  
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
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-xl font-semibold">Vehicle QR Tracker</h1>
        </div>
      </header>
      
      <main className="flex-grow container mx-auto px-4 py-6 flex items-center justify-center">
        {vehicleCode ? (
          <AuthForm vehicleCode={vehicleCode} />
        ) : (
          <div className="text-center">
            <p className="text-gray-600 mb-4">Nessun veicolo selezionato.</p>
            <button 
              onClick={() => setLocation("/")}
              className="text-primary-600 hover:underline"
            >
              Torna alla home
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
