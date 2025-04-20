import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { Eye, Filter, LogOut, QrCode, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";
import Layout from "@/components/Layout";
import { ChecklistWithItems, User, Vehicle } from "@shared/schema";

export default function AdminPanel() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Dialog state
  const [checklistDialogOpen, setChecklistDialogOpen] = useState(false);
  const [selectedChecklist, setSelectedChecklist] = useState<ChecklistWithItems | null>(null);
  
  // Get admin user from session storage
  const adminUserJson = sessionStorage.getItem("adminUser");
  const adminUser: User | null = adminUserJson ? JSON.parse(adminUserJson) : null;
  
  // Redirect if not logged in as admin
  useEffect(() => {
    if (!adminUserJson) {
      toast({
        title: "Accesso non autorizzato",
        description: "Effettua l'accesso come amministratore",
        variant: "destructive",
      });
      setLocation("/admin-login");
    }
  }, [adminUserJson, setLocation, toast]);
  
  // Fetch all checklists with details
  const { data: checklists, isLoading } = useQuery<ChecklistWithItems[]>({
    queryKey: ['/api/checklists'],
    enabled: !!adminUser,
  });
  
  // Fetch all vehicles for filter dropdown
  const { data: vehicles } = useQuery<Vehicle[]>({
    queryKey: ['/api/vehicles'],
    enabled: !!adminUser,
  });
  
  // Filter states
  const [dateFilter, setDateFilter] = useState<string>("");
  const [vehicleFilter, setVehicleFilter] = useState<string>("");
  const [volunteerFilter, setVolunteerFilter] = useState<string>("");
  
  // Handler for viewing checklist details
  const handleViewChecklist = (checklist: ChecklistWithItems) => {
    setSelectedChecklist(checklist);
    setChecklistDialogOpen(true);
  };
  
  // Apply filters to checklists
  const filteredChecklists = checklists?.filter(checklist => {
    // Date filter
    if (dateFilter) {
      const checklistDate = new Date(checklist.timestamp).toISOString().split('T')[0];
      if (checklistDate !== dateFilter) return false;
    }
    
    // Vehicle filter
    if (vehicleFilter && vehicleFilter !== "all_vehicles" && checklist.vehicle.code !== vehicleFilter) return false;
    
    // Volunteer filter (case insensitive)
    if (volunteerFilter) {
      const volunteerName = `${checklist.user.name} ${checklist.user.surname}`.toLowerCase();
      if (!volunteerName.includes(volunteerFilter.toLowerCase())) return false;
    }
    
    return true;
  });
  
  const handleLogout = () => {
    // Clear admin session
    sessionStorage.removeItem("adminUser");
    setLocation("/");
  };
  
  if (!adminUser) {
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
              <Shield className="text-[#E32719] mr-2 h-6 w-6" />
              Pannello Admin
            </h1>
            
            {/* Filters */}
            <div className="bg-gray-100 p-4 rounded-lg mb-6">
              <h2 className="font-semibold text-gray-800 mb-3">Filtri</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="filter-date" className="text-sm font-medium mb-1">
                    Data
                  </Label>
                  <Input
                    id="filter-date"
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="filter-vehicle" className="text-sm font-medium mb-1">
                    Veicolo
                  </Label>
                  <Select value={vehicleFilter} onValueChange={setVehicleFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tutti i veicoli" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all_vehicles">Tutti i veicoli</SelectItem>
                      {vehicles?.map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.code}>
                          {vehicle.code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="filter-volunteer" className="text-sm font-medium mb-1">
                    Volontario
                  </Label>
                  <Input
                    id="filter-volunteer"
                    placeholder="Nome volontario"
                    value={volunteerFilter}
                    onChange={(e) => setVolunteerFilter(e.target.value)}
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button className="bg-[#1976D2] hover:bg-blue-700">
                  <Filter className="mr-2 h-4 w-4" />
                  Applica Filtri
                </Button>
              </div>
            </div>
            
            {/* Checklist Table */}
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="py-10 text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#E32719] mx-auto"></div>
                  <p className="mt-4 text-gray-600">Caricamento checklist...</p>
                </div>
              ) : filteredChecklists?.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-gray-600">Nessuna checklist trovata con i filtri selezionati</p>
                </div>
              ) : (
                <table className="min-w-full bg-white border border-gray-200">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="py-3 px-4 border-b text-left font-semibold text-gray-700">Data</th>
                      <th className="py-3 px-4 border-b text-left font-semibold text-gray-700">Veicolo</th>
                      <th className="py-3 px-4 border-b text-left font-semibold text-gray-700">Volontario</th>
                      <th className="py-3 px-4 border-b text-left font-semibold text-gray-700">Ossigeno</th>
                      <th className="py-3 px-4 border-b text-left font-semibold text-gray-700">Stato</th>
                      <th className="py-3 px-4 border-b text-left font-semibold text-gray-700">Azioni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredChecklists?.map((checklist) => {
                      // Calculate if all items are present
                      const allItemsPresent = checklist.items.every(item => item.status === 'present');
                      
                      return (
                        <tr key={checklist.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            {formatDate(new Date(checklist.timestamp))}
                          </td>
                          <td className="py-3 px-4">{checklist.vehicle.code}</td>
                          <td className="py-3 px-4">
                            {checklist.user.name} {checklist.user.surname}
                          </td>
                          <td className="py-3 px-4">{checklist.oxygenLevel}%</td>
                          <td className="py-3 px-4">
                            {allItemsPresent ? (
                              <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                                Completo
                              </span>
                            ) : (
                              <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                                Incompleto
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-[#1976D2] hover:text-[#E32719]"
                              onClick={() => handleViewChecklist(checklist)}
                            >
                              <Eye size={16} />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
            
            <div className="mt-6 flex flex-wrap gap-3">
              <Button 
                className="bg-[#1976D2] hover:bg-blue-700 text-white"
                onClick={() => setLocation("/qr-generator")}
              >
                <QrCode className="mr-2 h-4 w-4" />
                Genera QR Veicoli
              </Button>
              <Button 
                variant="secondary" 
                className="bg-gray-300 hover:bg-gray-400 text-gray-800" 
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Checklist Details Dialog */}
      <Dialog open={checklistDialogOpen} onOpenChange={setChecklistDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-800 mb-2">
              Dettagli Checklist
            </DialogTitle>
            <DialogDescription>
              {selectedChecklist && (
                <div className="text-sm text-gray-500">
                  <span className="font-semibold">Veicolo:</span> {selectedChecklist.vehicle.code} <br />
                  <span className="font-semibold">Data:</span> {formatDate(new Date(selectedChecklist.timestamp))} <br />
                  <span className="font-semibold">Volontario:</span> {selectedChecklist.user.name} {selectedChecklist.user.surname} <br />
                  <span className="font-semibold">Livello Ossigeno:</span> {selectedChecklist.oxygenLevel}%
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {selectedChecklist && (
            <div className="mt-4">
              <h3 className="font-semibold text-gray-800 mb-2">Elementi Checklist:</h3>
              <div className="border rounded-md overflow-hidden">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="py-2 px-4 border-b text-left text-xs font-semibold text-gray-700">Elemento</th>
                      <th className="py-2 px-4 border-b text-left text-xs font-semibold text-gray-700">Stato</th>
                      <th className="py-2 px-4 border-b text-left text-xs font-semibold text-gray-700">Prelevato</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedChecklist.items.map((item, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="py-2 px-4 text-sm">{item.name}</td>
                        <td className="py-2 px-4">
                          {item.status === 'present' ? (
                            <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5 rounded">
                              Presente
                            </span>
                          ) : (
                            <span className="bg-red-100 text-red-800 text-xs font-semibold px-2 py-0.5 rounded">
                              Mancante
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-4">
                          {item.takenFromCabinet ? (
                            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded">
                              Prelevato
                            </span>
                          ) : (
                            <span className="text-gray-500 text-xs">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
