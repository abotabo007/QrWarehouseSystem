import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatFiscalCode, isValidFiscalCode } from "@/lib/utils";
import Layout from "@/components/Layout";
import { User } from "@shared/schema";

export default function Login() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [fiscalCode, setFiscalCode] = useState("");
  
  // Extract vehicle code from URL
  const urlParts = location.split("/");
  const vehicleCode = urlParts[urlParts.length - 1];
  
  // Mutation for user login
  const loginMutation = useMutation<User, Error, { name: string; surname: string; fiscalCode: string }>({
    mutationFn: async (userData) => {
      const res = await apiRequest("POST", "/api/users/login", userData);
      return await res.json();
    },
    onSuccess: (user) => {
      // Save user data to session storage
      sessionStorage.setItem("user", JSON.stringify(user));
      sessionStorage.setItem("vehicleCode", vehicleCode);
      
      // Navigate to checklist page
      setLocation(`/checklist/${vehicleCode}`);
    },
    onError: (error) => {
      toast({
        title: "Errore di accesso",
        description: error.message || "Si è verificato un errore durante l'accesso",
        variant: "destructive",
      });
    }
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate fiscal code
    const formattedFiscalCode = formatFiscalCode(fiscalCode);
    if (!isValidFiscalCode(formattedFiscalCode)) {
      toast({
        title: "Codice fiscale non valido",
        description: "Inserisci un codice fiscale valido",
        variant: "destructive",
      });
      return;
    }
    
    loginMutation.mutate({
      name,
      surname,
      fiscalCode: formattedFiscalCode
    });
  };
  
  return (
    <Layout>
      <div className="max-w-md mx-auto">
        <Card className="shadow-md">
          <CardContent className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Accedi</h1>
            <p className="text-gray-600 mb-6">
              Veicolo selezionato: <span className="font-semibold">{decodeURIComponent(vehicleCode)}</span>
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="surname">Cognome</Label>
                <Input
                  id="surname"
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fiscal-code">Codice Fiscale</Label>
                <Input
                  id="fiscal-code"
                  value={fiscalCode}
                  onChange={(e) => setFiscalCode(e.target.value.toUpperCase())}
                  placeholder="RSSMRA80A01F205X"
                  required
                />
              </div>
              
              <div className="pt-4 flex space-x-3">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800"
                  onClick={() => setLocation("/veicoli")}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Indietro
                </Button>
                
                <Button
                  type="submit"
                  className="flex-1 bg-[#E32719] hover:bg-[#C42015]"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? (
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
