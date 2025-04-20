import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import Layout from "@/components/Layout";
import { Vehicle } from "@shared/schema";

export default function VehicleSelect() {
  const [, setLocation] = useLocation();
  const [showAllVehicles, setShowAllVehicles] = useState(false);
  
  // Fetch vehicles from API
  const { data: vehicles, isLoading, error } = useQuery<Vehicle[]>({
    queryKey: ['/api/vehicles'],
  });
  
  const handleVehicleSelect = (vehicleCode: string) => {
    setLocation(`/veicolo/${encodeURIComponent(vehicleCode)}`);
  };
  
  // Display only 5 vehicles initially, show all when button clicked
  const displayedVehicles = showAllVehicles 
    ? vehicles 
    : vehicles?.slice(0, 5);
  
  return (
    <Layout>
      <div className="max-w-md mx-auto">
        <Card className="shadow-md">
          <CardContent className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <i className="fas fa-ambulance text-[#E32719] mr-2"></i>
              Seleziona Veicolo
            </h1>
            
            {isLoading ? (
              <div className="py-10 text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#E32719] mx-auto"></div>
                <p className="mt-4 text-gray-600">Caricamento veicoli...</p>
              </div>
            ) : error ? (
              <div className="py-10 text-center">
                <p className="text-red-500">Errore nel caricamento dei veicoli</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => window.location.reload()}
                >
                  Riprova
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-3 mb-6">
                  {displayedVehicles?.map((vehicle) => (
                    <Button
                      key={vehicle.id}
                      variant="outline"
                      className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-800 font-medium py-3 px-4 rounded-lg transition text-left justify-start h-auto"
                      onClick={() => handleVehicleSelect(vehicle.code)}
                    >
                      {vehicle.code}
                    </Button>
                  ))}
                  
                  {vehicles && vehicles.length > 5 && (
                    <Button
                      variant="link"
                      className="text-[#1976D2] hover:text-[#E32719] font-medium py-2 transition text-center"
                      onClick={() => setShowAllVehicles(!showAllVehicles)}
                    >
                      {showAllVehicles ? (
                        <>
                          <ChevronUp className="mr-1 h-4 w-4" />
                          Mostra meno
                        </>
                      ) : (
                        <>
                          <ChevronDown className="mr-1 h-4 w-4" />
                          Mostra tutti i veicoli
                        </>
                      )}
                    </Button>
                  )}
                </div>
                
                <Button
                  variant="secondary"
                  className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800"
                  onClick={() => setLocation("/")}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Indietro
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
