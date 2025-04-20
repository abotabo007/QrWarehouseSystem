import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LogOut, Plus, Minus, RefreshCw, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { INVENTORY_STATUS_OPTIONS } from "@/lib/constants";
import Layout from "@/components/Layout";
import InventoryItem from "@/components/InventoryItem";
import { InventoryItem as InventoryItemType, InsertInventoryItem, User } from "@shared/schema";

export default function Warehouse() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Get warehouse user from session storage
  const warehouseUserJson = sessionStorage.getItem("warehouseUser");
  const warehouseUser: User | null = warehouseUserJson ? JSON.parse(warehouseUserJson) : null;
  
  // Redirect if not logged in as warehouse manager
  useEffect(() => {
    if (!warehouseUserJson) {
      toast({
        title: "Accesso non autorizzato",
        description: "Effettua l'accesso come gestore magazzino",
        variant: "destructive",
      });
      setLocation("/warehouse-login");
    }
  }, [warehouseUserJson, setLocation, toast]);
  
  // State for search and dialogs
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  // New item form state
  const [newItem, setNewItem] = useState<InsertInventoryItem>({
    name: "",
    quantity: 0,
    minimumQuantity: 0,
    expiryDate: "",
    status: "Disponibile"
  });
  
  // Fetch all inventory items
  const { data: inventoryItems, isLoading, error } = useQuery<InventoryItemType[]>({
    queryKey: ['/api/inventory'],
    retry: 1,
    retryDelay: 1000,
    enabled: !!warehouseUser,
  });
  
  // Log any errors
  useEffect(() => {
    if (error) {
      console.error("Error fetching inventory items:", error);
      toast({
        title: "Errore",
        description: "Impossibile caricare gli articoli dell'inventario",
        variant: "destructive",
      });
    }
  }, [error, toast]);
  
  // Create mutation
  const createItemMutation = useMutation({
    mutationFn: async (item: InsertInventoryItem) => {
      const res = await apiRequest("POST", "/api/inventory", item);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
      setIsAddDialogOpen(false);
      resetNewItemForm();
      toast({
        title: "Articolo aggiunto",
        description: "Articolo aggiunto con successo al magazzino",
      });
    },
    onError: (error) => {
      toast({
        title: "Errore",
        description: "Impossibile aggiungere l'articolo: " + error.message,
        variant: "destructive",
      });
    }
  });
  
  // Update mutation
  const updateItemMutation = useMutation({
    mutationFn: async ({ id, item }: { id: number; item: Partial<InsertInventoryItem> }) => {
      const res = await apiRequest("PUT", `/api/inventory/${id}`, item);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
      toast({
        title: "Articolo aggiornato",
        description: "Articolo aggiornato con successo",
      });
    },
    onError: (error) => {
      toast({
        title: "Errore",
        description: "Impossibile aggiornare l'articolo: " + error.message,
        variant: "destructive",
      });
    }
  });
  
  // Delete mutation
  const deleteItemMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/inventory/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
      toast({
        title: "Articolo eliminato",
        description: "Articolo eliminato con successo dal magazzino",
      });
    },
    onError: (error) => {
      toast({
        title: "Errore",
        description: "Impossibile eliminare l'articolo: " + error.message,
        variant: "destructive",
      });
    }
  });
  
  // Handle item operations
  const handleEditItem = (updatedItem: InventoryItemType) => {
    updateItemMutation.mutate({
      id: updatedItem.id,
      item: {
        name: updatedItem.name,
        quantity: updatedItem.quantity,
        minimumQuantity: updatedItem.minimumQuantity,
        expiryDate: updatedItem.expiryDate,
        status: updatedItem.status
      }
    });
  };
  
  const handleDeleteItem = (id: number) => {
    deleteItemMutation.mutate(id);
  };
  
  const handleAddNewItem = () => {
    createItemMutation.mutate(newItem);
  };
  
  const resetNewItemForm = () => {
    setNewItem({
      name: "",
      quantity: 0,
      minimumQuantity: 0,
      expiryDate: "",
      status: "Disponibile"
    });
  };
  
  const handleLogout = () => {
    // Clear warehouse session
    sessionStorage.removeItem("warehouseUser");
    setLocation("/");
  };
  
  // Filter items based on search term
  const filteredItems = inventoryItems?.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  if (!warehouseUser) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E32719]"></div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="w-full">
        <Card className="shadow-md">
          <CardContent className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="text-[#E32719] mr-2">
                <Warehouse className="h-6 w-6" />
              </span>
              Gestione Magazzino
            </h1>
            
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Cerca materiale..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                <div className="absolute left-3 top-2.5 text-gray-400">
                  <Search size={16} />
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Button 
                className="bg-[#1976D2] hover:bg-blue-700" 
                onClick={() => setIsAddDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Aggiungi Materiale
              </Button>
              <Button 
                className="bg-[#E32719] hover:bg-[#C42015]"
              >
                <Minus className="mr-2 h-4 w-4" />
                Rimuovi Materiale
              </Button>
              <Button 
                className="bg-gray-700 hover:bg-gray-800"
                onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/inventory'] })}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Aggiorna Stato
              </Button>
            </div>
            
            {/* Inventory Table */}
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="py-10 text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#E32719] mx-auto"></div>
                  <p className="mt-4 text-gray-600">Caricamento inventario...</p>
                </div>
              ) : filteredItems?.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-gray-600">Nessun articolo trovato</p>
                </div>
              ) : (
                <table className="min-w-full bg-white border border-gray-200">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="py-3 px-4 border-b text-left font-semibold text-gray-700">Materiale</th>
                      <th className="py-3 px-4 border-b text-left font-semibold text-gray-700">Quantità</th>
                      <th className="py-3 px-4 border-b text-left font-semibold text-gray-700">Scadenza</th>
                      <th className="py-3 px-4 border-b text-left font-semibold text-gray-700">Stato</th>
                      <th className="py-3 px-4 border-b text-left font-semibold text-gray-700">Azioni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems?.map((item) => (
                      <InventoryItem
                        key={item.id}
                        item={item}
                        onEdit={handleEditItem}
                        onDelete={handleDeleteItem}
                      />
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            
            <div className="mt-6">
              <Button variant="secondary" className="bg-gray-300 hover:bg-gray-400 text-gray-800" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Add Item Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aggiungi Articolo</DialogTitle>
            <DialogDescription>
              Inserisci i dettagli del nuovo articolo da aggiungere al magazzino.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="item-name" className="text-right">
                Nome
              </Label>
              <Input
                id="item-name"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="item-quantity" className="text-right">
                Quantità
              </Label>
              <Input
                id="item-quantity"
                type="number"
                value={newItem.quantity}
                onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 0 })}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="item-min-quantity" className="text-right">
                Quantità minima
              </Label>
              <Input
                id="item-min-quantity"
                type="number"
                value={newItem.minimumQuantity}
                onChange={(e) => setNewItem({ ...newItem, minimumQuantity: parseInt(e.target.value) || 0 })}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="item-expiry" className="text-right">
                Scadenza
              </Label>
              <Input
                id="item-expiry"
                value={newItem.expiryDate || ''}
                onChange={(e) => setNewItem({ ...newItem, expiryDate: e.target.value })}
                className="col-span-3"
                placeholder="MM/YYYY"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="item-status" className="text-right">
                Stato
              </Label>
              <Select
                value={newItem.status}
                onValueChange={(value) => setNewItem({ ...newItem, status: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleziona stato" />
                </SelectTrigger>
                <SelectContent>
                  {INVENTORY_STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Annulla
            </Button>
            <Button onClick={handleAddNewItem} disabled={createItemMutation.isPending}>
              {createItemMutation.isPending ? 'Salvataggio...' : 'Salva'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
