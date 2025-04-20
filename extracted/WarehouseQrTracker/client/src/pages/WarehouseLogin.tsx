import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, Warehouse, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { WAREHOUSE_USERS } from "@/lib/constants";
import Layout from "@/components/Layout";
import { User } from "@shared/schema";

export default function WarehouseLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [fiscalCode, setFiscalCode] = useState("");
  const [hasTimeoutError, setHasTimeoutError] = useState(false);
  
  // Reset timeout error when fiscalCode changes
  useEffect(() => {
    if (hasTimeoutError) {
      setHasTimeoutError(false);
    }
  }, [fiscalCode]);
  
  // Mutation for warehouse manager login
  const warehouseLoginMutation = useMutation<User, Error, { fiscalCode: string }>({
    mutationFn: async (userData) => {
      try {
        // Create an AbortController to handle timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5-second timeout
        
        const res = await apiRequest("POST", "/api/users/warehouse-login", userData, {
          signal: controller.signal
        });
        
        // Clear the timeout since request completed
        clearTimeout(timeoutId);
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Errore durante l'accesso");
        }
        
        return await res.json();
      } catch (error: any) {
        if (error.name === 'AbortError') {
          setHasTimeoutError(true);
          throw new Error("Richiesta scaduta. Prova di nuovo.");
        }
        throw error;
      }
    },
    onSuccess: (user) => {
      // Save warehouse user data to session storage
      sessionStorage.setItem("warehouseUser", JSON.stringify(user));
      
      // Navigate to warehouse page
      setLocation("/warehouse");
    },
    onError: (error) => {
      console.error("Login error:", error);
      toast({
        title: "Accesso negato",
        description: error.message || "Codice fiscale non valido o utente non autorizzato",
        variant: "destructive",
      });
    }
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fiscalCode.trim()) {
      toast({
        title: "Campo richiesto",
        description: "Inserisci il tuo codice fiscale",
        variant: "destructive",
      });
      return;
    }
    
    // For development, check if this is one of our test users
    if (WAREHOUSE_USERS.some(user => user.fiscalCode === fiscalCode)) {
      console.log("Usando utente magazzino predefinito:", fiscalCode);
    }
    
    warehouseLoginMutation.mutate({ fiscalCode });
  };
  
  return (
    <Layout>
      <div className="max-w-md mx-auto">
        <Card className="shadow-md">
          <CardContent className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <Warehouse className="text-[#E32719] mr-2 h-6 w-6" />
              Accesso Magazzino
            </h1>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fiscal-code">Codice Fiscale</Label>
                <Input
                  id="fiscal-code"
                  value={fiscalCode}
                  onChange={(e) => setFiscalCode(e.target.value.toUpperCase())}
                  required
                  className={hasTimeoutError ? "border-red-500" : ""}
                />
              </div>
              
              {hasTimeoutError && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded p-3 flex items-start">
                  <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Tempo di risposta superato</p>
                    <p className="text-sm">La richiesta ha impiegato troppo tempo. Verifica il codice fiscale e prova di nuovo.</p>
                  </div>
                </div>
              )}
              
              <div className="pt-4 flex space-x-3">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800"
                  onClick={() => setLocation("/")}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Indietro
                </Button>
                
                <Button
                  type="submit"
                  className="flex-1 bg-[#E32719] hover:bg-[#C42015]"
                  disabled={warehouseLoginMutation.isPending}
                >
                  {warehouseLoginMutation.isPending ? (
                    <span className="flex items-center">
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                      Accesso...
                    </span>
                  ) : (
                    <span>Accedi</span>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
