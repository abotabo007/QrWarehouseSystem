import Header from "@/components/admin/header";
import TabNavigation from "@/components/admin/tab-navigation";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Search, Plus, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Users() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: users, isLoading, error } = useQuery({
    queryKey: ["/api/users"],
  });
  
  // Filter users based on search term
  const filteredUsers = users ? users.filter((user: any) => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.role && user.role.toLowerCase().includes(searchTerm.toLowerCase()))
  ) : [];
  
  const getInitials = (username: string) => {
    return username.substring(0, 2).toUpperCase();
  };
  
  const getAvatarColor = (role: string) => {
    switch(role) {
      case 'admin':
        return 'bg-primary-100 text-primary-700';
      case 'warehouse':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-blue-100 text-blue-700';
    }
  };
  
  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Attivo</Badge>;
    }
    
    return <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">Inattivo</Badge>;
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <TabNavigation activeTab="users" />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Gestione Utenti</h1>
          <p className="mt-1 text-sm text-gray-500">Amministra gli utenti con accesso al sistema</p>
        </div>
        
        <div className="flex justify-between items-center mb-4">
          <div className="max-w-lg w-full lg:max-w-xs">
            <label htmlFor="user-search" className="sr-only">Cerca Utenti</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                id="user-search"
                name="user-search"
                className="block w-full pl-10"
                placeholder="Cerca utenti"
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div>
            <Button>
              <Plus className="-ml-1 mr-2 h-5 w-5" />
              Aggiungi Utente
            </Button>
          </div>
        </div>
        
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {isLoading ? (
            <div className="flex justify-center my-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <Alert variant="destructive" className="m-4">
              <AlertDescription>
                Errore nel caricamento degli utenti: {(error as Error).message}
              </AlertDescription>
            </Alert>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utente
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ruolo
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ultimo Accesso
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stato
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Azioni</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user: any) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <Avatar>
                              <AvatarFallback className={getAvatarColor(user.role)}>
                                {getInitials(user.username)}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.username}</div>
                            <div className="text-sm text-gray-500">{user.role}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.email || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.role === 'admin' ? 'Amministratore' : 
                         user.role === 'warehouse' ? 'Gestore Magazzino' : 'Utente'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Mai'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(user.isActive)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button variant="link" className="text-primary-600 hover:text-primary-900">
                          Modifica
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                      {searchTerm ? (
                        <p>Nessun utente trovato per "{searchTerm}"</p>
                      ) : (
                        <p>Nessun utente disponibile</p>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
