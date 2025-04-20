import Header from "@/components/admin/header";
import TabNavigation from "@/components/admin/tab-navigation";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

export default function Inventory() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: items, isLoading, error } = useQuery({
    queryKey: ["/api/items"],
  });
  
  // Filter items based on search term
  const filteredItems = items ? items.filter((item: any) => 
    item.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.location && item.location.toLowerCase().includes(searchTerm.toLowerCase()))
  ) : [];
  
  const getStatusBadge = (status: string, quantity: number) => {
    if (quantity < 15) {
      return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">In Esaurimento</Badge>;
    }
    
    return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Disponibile</Badge>;
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <TabNavigation activeTab="inventory" />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Inventario Magazzino</h1>
          <p className="mt-1 text-sm text-gray-500">Gestisci e monitora gli articoli in magazzino</p>
        </div>
        
        <div className="flex justify-between items-center mb-4">
          <div className="max-w-lg w-full lg:max-w-xs">
            <label htmlFor="search" className="sr-only">Cerca</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                id="search"
                name="search"
                className="block w-full pl-10"
                placeholder="Cerca articoli"
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div>
            <Button>
              <Plus className="-ml-1 mr-2 h-5 w-5" />
              Aggiungi Articolo
            </Button>
          </div>
        </div>
        
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {isLoading ? (
            <div className="flex justify-center my-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="p-4 text-red-500">
              Errore nel caricamento degli articoli: {(error as Error).message}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Codice
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nome Articolo
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Posizione
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantità
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stato
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ultimo Aggiornamento
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Azioni</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredItems.length > 0 ? (
                    filteredItems.map((item: any) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.itemCode}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.location || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(item.status, item.quantity)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(item.lastUpdated).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Button variant="link" className="text-primary-600 hover:text-primary-900">
                            Modifica
                          </Button>
                          <Button variant="link" className="ml-2 text-primary-600 hover:text-primary-900">
                            QR
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                        {searchTerm ? (
                          <p>Nessun articolo trovato per "{searchTerm}"</p>
                        ) : (
                          <p>Nessun articolo disponibile</p>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          
          {filteredItems.length > 0 && (
            <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-700">
                    Visualizzazione <span className="font-medium">1</span> a <span className="font-medium">{filteredItems.length}</span> di <span className="font-medium">{filteredItems.length}</span> risultati
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
