import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, Warehouse } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { WAREHOUSE_USERS } from "@/lib/constants";
import Layout from "@/components/Layout";
import { User } from "@shared/schema";

export default function WarehouseLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [fiscalCode, setFiscalCode] = useState("");
  
  // Mutation for warehouse manager login
  const warehouseLoginMutation = useMutation<User, Error, { fiscalCode: string }>({
    mutationFn: async (userData) => {
      const res = await apiRequest("POST", "/api/users/warehouse-login", userData);
      return await res.json();
    },
    onSuccess: (user) => {
      // Save warehouse user data to session storage
      sessionStorage.setItem("warehouseUser", JSON.stringify(user));
      
      // Navigate to warehouse page
      setLocation("/warehouse");
    },
    onError: (error) => {
      toast({
        title: "Accesso negato",
        description: "Codice fiscale non valido o utente non autorizzato",
        variant: "destructive",
      });
    }
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // For development, allow access with hardcoded warehouse users
    if (process.env.NODE_ENV === "development" && 
        WAREHOUSE_USERS.some(user => user.fiscalCode === fiscalCode)) {
      warehouseLoginMutation.mutate({ fiscalCode });
      return;
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
                />
              </div>
              
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
