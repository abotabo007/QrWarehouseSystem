import { useState, useEffect, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { ChecklistSection, ChecklistItemData } from "@/components/checklist-section";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import checklistData from "@/data/itemList";

export default function ChecklistPage() {
  const { vehicleCode } = useParams();
  const [, setLocation] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  
  // Local state for checklist items
  const [checklistItems, setChecklistItems] = useState<Record<string, ChecklistItemData[]>>({});
  
  // Initialize checklist from server
  const { data: serverItems, isLoading, isError } = useQuery({
    queryKey: ["/api/checklist-items"],
    queryFn: async () => {
      // First make sure we have initialized checklist items in the database
      await apiRequest("POST", "/api/initialize-checklist");
      
      // Then fetch all checklist items
      const res = await fetch("/api/checklist-items");
      if (!res.ok) throw new Error("Failed to fetch checklist items");
      return await res.json();
    }
  });
  
  // Get vehicle info
  const { data: vehicle, isLoading: isLoadingVehicle } = useQuery({
    queryKey: [`/api/vehicles/${vehicleCode}`],
    queryFn: async () => {
      const res = await fetch(`/api/vehicles/${vehicleCode}`);
      if (!res.ok) throw new Error("Failed to fetch vehicle information");
      return await res.json();
    },
    enabled: !!vehicleCode
  });
  
  // Save checklist mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      // Convert local state to entries array
      const entries = [];
      
      for (const section in checklistItems) {
        for (const item of checklistItems[section]) {
          entries.push({
            userId: user?.id,
            vehicleId: vehicle?.id,
            itemId: parseInt(item.id),
            quantity: item.quantity,
            isChecked: item.isChecked,
            timestamp: new Date().toISOString(),
          });
        }
      }
      
      const res = await apiRequest("POST", "/api/checklist-entries", entries);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Checklist salvata",
        description: "La checklist è stata salvata con successo.",
      });
    },
    onError: (error) => {
      toast({
        title: "Errore",
        description: `Impossibile salvare la checklist: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Initialize local state from server data or fallback to local data
  useEffect(() => {
    if (serverItems && Object.keys(serverItems).length > 0) {
      // Initialize from server data
      const initializedItems: Record<string, ChecklistItemData[]> = {};
      
      for (const section in serverItems) {
        initializedItems[section] = serverItems[section].map((item: any) => ({
          id: item.id.toString(),
          name: item.name,
          quantity: item.minimumQuantity,
          minimumQuantity: item.minimumQuantity,
          isChecked: item.minimumQuantity > 0,
        }));
      }
      
      setChecklistItems(initializedItems);
    } else if (!isLoading && !isError) {
      // Fallback to local data if server data is empty
      const initializedItems: Record<string, ChecklistItemData[]> = {};
      
      for (const section in checklistData) {
        initializedItems[section] = checklistData[section].map((item, index) => ({
          id: `${section}-${index}`,
          name: item.name,
          quantity: item.minimumQuantity,
          minimumQuantity: item.minimumQuantity,
          isChecked: item.minimumQuantity > 0,
        }));
      }
      
      setChecklistItems(initializedItems);
    }
  }, [serverItems, isLoading, isError]);
  
  // Handle item check change
  const handleItemCheckChange = useCallback((id: string, checked: boolean) => {
    setChecklistItems((prevItems) => {
      const newItems = { ...prevItems };
      
      for (const section in newItems) {
        const itemIndex = newItems[section].findIndex(item => item.id === id);
        if (itemIndex !== -1) {
          newItems[section] = [
            ...newItems[section].slice(0, itemIndex),
            { ...newItems[section][itemIndex], isChecked: checked },
            ...newItems[section].slice(itemIndex + 1),
          ];
          break;
        }
      }
      
      return newItems;
    });
  }, []);
  
  // Handle item quantity change
  const handleItemQuantityChange = useCallback((id: string, quantity: number) => {
    setChecklistItems((prevItems) => {
      const newItems = { ...prevItems };
      
      for (const section in newItems) {
        const itemIndex = newItems[section].findIndex(item => item.id === id);
        if (itemIndex !== -1) {
          newItems[section] = [
            ...newItems[section].slice(0, itemIndex),
            { ...newItems[section][itemIndex], quantity },
            ...newItems[section].slice(itemIndex + 1),
          ];
          break;
        }
      }
      
      return newItems;
    });
  }, []);
  
  // Handle logout
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  // If no vehicle code, redirect to home
  useEffect(() => {
    if (!vehicleCode) {
      setLocation("/");
    }
  }, [vehicleCode, setLocation]);
  
  if (isLoading || isLoadingVehicle) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (isError || !vehicle) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Errore</h2>
          <p className="text-gray-600 mb-4">
            Impossibile caricare i dati del veicolo o della checklist.
          </p>
          <Button onClick={() => setLocation("/")}>
            Torna alla Home
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-primary-600 text-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold">Vehicle QR Tracker</h1>
          <div className="flex items-center gap-2">
            <span className="mr-2">{user?.username}</span>
            <Button variant="outline" size="sm" onClick={handleLogout} className="text-primary-600 bg-white hover:bg-gray-100">
              Logout
            </Button>
          </div>
        </div>
      </header>
      
      <main className="flex-grow container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Checklist Veicolo</h2>
          <div className="flex items-center">
            <span className="text-gray-600 mr-4">ID: {vehicleCode}</span>
            <Button 
              onClick={() => saveMutation.mutate()} 
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvataggio...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salva Checklist
                </>
              )}
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(checklistItems).map(([section, items]) => (
            <ChecklistSection
              key={section}
              title={section}
              items={items}
              onItemCheckChange={handleItemCheckChange}
              onItemQuantityChange={handleItemQuantityChange}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
