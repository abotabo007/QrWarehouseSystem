import { useQuery } from "@tanstack/react-query";
import Header from "@/components/admin/header";
import TabNavigation from "@/components/admin/tab-navigation";
import StatCard from "@/components/admin/stat-card";
import {
  PackageOpen,
  QrCode,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AdminDashboard() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ["/api/stats/dashboard"],
  });
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <TabNavigation activeTab="overview" />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Panoramica Magazzino</h1>
          <p className="mt-1 text-sm text-gray-500">Visualizza le statistiche e lo stato del magazzino</p>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center my-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <Alert variant="destructive" className="my-4">
            <AlertDescription>
              Errore nel caricamento delle statistiche: {(error as Error).message}
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Prodotti Totali"
                value={stats.itemCount}
                icon={<PackageOpen className="h-6 w-6 text-primary-600" />}
                color="primary"
              />
              
              <StatCard
                title="QR Generati"
                value={stats.qrCodeCount}
                icon={<QrCode className="h-6 w-6 text-green-600" />}
                color="green"
              />
              
              <StatCard
                title="Scansioni Oggi"
                value={stats.todayScans}
                icon={<Clock className="h-6 w-6 text-yellow-600" />}
                color="yellow"
              />
              
              <StatCard
                title="Articoli in Esaurimento"
                value={stats.lowStockItemCount}
                icon={<AlertTriangle className="h-6 w-6 text-red-600" />}
                color="red"
              />
            </div>
            
            <div className="mt-8">
              <h2 className="text-lg font-medium text-gray-900">Attività Recenti</h2>
              <div className="mt-3 bg-white shadow overflow-hidden sm:rounded-md">
                <ul role="list" className="divide-y divide-gray-200">
                  <li className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <QrCode className="h-6 w-6 text-primary-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">Sistema avviato con successo</div>
                          <div className="text-sm text-gray-500">Gestione del magazzino attiva</div>
                        </div>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Adesso
                        </span>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
