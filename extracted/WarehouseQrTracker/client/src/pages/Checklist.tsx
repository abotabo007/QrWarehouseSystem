import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { DEFAULT_CHECKLIST_ITEMS } from "@/lib/constants";
import Layout from "@/components/Layout";
import VehicleChecklist from "@/components/VehicleChecklist";
import { ChecklistItemInfo, User, Vehicle } from "@shared/schema";

export default function Checklist() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Extract vehicle code from URL
  const urlParts = location.split("/");
  const vehicleCode = decodeURIComponent(urlParts[urlParts.length - 1]);
  
  // Get user from session storage
  const userJson = sessionStorage.getItem("user");
  const user: User | null = userJson ? JSON.parse(userJson) : null;
  
  // Fetch vehicle details
  const { data: vehicle, isLoading: isLoadingVehicle } = useQuery<Vehicle>({
    queryKey: [`/api/vehicles/${encodeURIComponent(vehicleCode)}`],
    enabled: !!vehicleCode,
  });
  
  // Redirect if no user or vehicle in session
  useEffect(() => {
    if (!userJson || !vehicleCode) {
      toast({
        title: "Sessione non valida",
        description: "Effettua nuovamente l'accesso",
        variant: "destructive",
      });
      setLocation("/");
    }
  }, [userJson, vehicleCode, setLocation, toast]);
  
  // State for checklist submission result modal
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // Mutation for submitting checklist
  const submitChecklistMutation = useMutation({
    mutationFn: async (data: { 
      items: ChecklistItemInfo[]; 
      oxygenLevel: number; 
    }) => {
      if (!user || !vehicle) {
        throw new Error("User or vehicle not found");
      }
      
      const payload = {
        userId: user.id,
        vehicleId: vehicle.id,
        oxygenLevel: data.oxygenLevel,
        items: data.items.map(item => ({
          name: item.name,
          status: item.status,
          takenFromCabinet: item.takenFromCabinet
        }))
      };
      
      const res = await apiRequest("POST", "/api/checklists", payload);
      return await res.json();
    },
    onSuccess: () => {
      setShowSuccessModal(true);
      
      // Auto-hide modal after 3 seconds and redirect
      setTimeout(() => {
        setShowSuccessModal(false);
        // Clear session storage and redirect to home
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("vehicleCode");
        setLocation("/");
      }, 3000);
    },
    onError: (error) => {
      toast({
        title: "Errore nell'invio della checklist",
        description: error.message || "Si è verificato un errore durante l'invio",
        variant: "destructive",
      });
    }
  });
  
  if (!user || isLoadingVehicle) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E32719]"></div>
        </div>
      </Layout>
    );
  }
  
  if (!vehicle) {
    return (
      <Layout>
        <div className="max-w-md mx-auto text-center py-8">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-red-600 mb-4">Veicolo non trovato</h2>
              <p className="mb-6">Il veicolo richiesto non è stato trovato nel sistema.</p>
              <button 
                onClick={() => setLocation("/")}
                className="bg-[#E32719] hover:bg-[#C42015] text-white font-medium py-2 px-4 rounded-lg"
              >
                Torna alla Home
              </button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }
  
  const handleSubmit = (data: { items: ChecklistItemInfo[]; oxygenLevel: number }) => {
    submitChecklistMutation.mutate(data);
  };
  
  return (
    <Layout>
      <div className="max-w-md mx-auto">
        <Card className="shadow-md">
          <CardContent className="p-6">
            <VehicleChecklist
              vehicleCode={vehicleCode}
              vehicleName={vehicle.displayName}
              userName={`${user.name} ${user.surname}`}
              defaultItems={DEFAULT_CHECKLIST_ITEMS}
              onSubmit={handleSubmit}
            />
          </CardContent>
        </Card>
        
        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-auto">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mx-auto mb-4">
                  <i className="fas fa-check text-green-600 text-xl"></i>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Checklist Inviata</h3>
                <p className="text-gray-600">La checklist è stata registrata con successo.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
