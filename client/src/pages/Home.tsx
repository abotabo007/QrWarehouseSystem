import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import QRScanner from "@/components/QRScanner";
import Layout from "@/components/Layout";
import { Ambulance, QrCode, Shield, Warehouse } from "lucide-react";

export default function Home() {
  const [, setLocation] = useLocation();
  const [showScanner, setShowScanner] = useState(false);
  
  const handleScan = (vehicleCode: string) => {
    // Redirect to scanner page that will show login/register options
    setLocation(`/scanner`);
  };
  
  return (
    <Layout>
      <div className="max-w-md mx-auto">
        <Card className="shadow-md">
          <CardContent className="p-6 text-center">
            <h1 className="text-3xl font-bold text-[#E32719] mb-2">
              CRI Acqui Terme
            </h1>
            <h2 className="text-xl text-gray-700 mb-6">
              Sistema di Gestione Mezzi e Attrezzature
            </h2>
            
            <div className="bg-gray-200 rounded-lg w-full h-48 flex items-center justify-center mb-6">
              <Shield className="text-[#E32719] h-16 w-16" />
            </div>
            
            <div className="flex justify-center items-center mb-6 bg-[#E32719] rounded-full p-3 w-16 h-16 mx-auto">
              <div className="text-white font-bold text-xl">CRI</div>
            </div>
            
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="bg-red-100 p-3 rounded-full">
                <Ambulance className="h-6 w-6 text-[#E32719]" />
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <QrCode className="h-6 w-6 text-[#1976D2]" />
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Warehouse className="h-6 w-6 text-green-600" />
              </div>
            </div>
            
            {showScanner ? (
              <QRScanner onScan={handleScan} />
            ) : (
              <div className="flex flex-col space-y-3">
                <Button 
                  className="bg-[#E32719] hover:bg-[#C42015] py-3"
                  onClick={() => setShowScanner(true)}
                >
                  <QrCode className="mr-2 h-4 w-4" />
                  Scannerizza QR Code Veicolo
                </Button>
                
                <Button 
                  className="bg-[#1976D2] hover:bg-blue-700 py-3"
                  onClick={() => setLocation("/veicoli")}
                >
                  <Ambulance className="mr-2 h-4 w-4" />
                  Seleziona Veicolo
                </Button>
                
                <hr className="my-2 border-gray-200" />
                
                <Button 
                  variant="secondary"
                  className="bg-gray-700 hover:bg-gray-800 text-white py-3"
                  onClick={() => setLocation("/admin-login")}
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Accesso Admin
                </Button>
                
                <Button 
                  variant="secondary"
                  className="bg-gray-700 hover:bg-gray-800 text-white py-3"
                  onClick={() => setLocation("/warehouse-login")}
                >
                  <Warehouse className="mr-2 h-4 w-4" />
                  Gestione Magazzino
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
