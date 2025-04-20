import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Download, Printer, QrCode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { Vehicle } from "@shared/schema";
import { generateQRValue } from "@/lib/utils";
import QRCode from "qrcode";

export default function QRGeneratorPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedVehicleCode, setSelectedVehicleCode] = useState<string>("");
  const [qrDataURL, setQrDataURL] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // Verifica accesso admin
  useEffect(() => {
    const adminUserJson = sessionStorage.getItem("adminUser");
    if (adminUserJson) {
      setIsAdmin(true);
    } else {
      toast({
        title: "Accesso non autorizzato",
        description: "Solo gli amministratori possono generare codici QR",
        variant: "destructive",
      });
      setLocation("/admin-login");
    }
  }, [setLocation, toast]);

  // Fetch veicoli
  const { data: vehicles, isLoading } = useQuery<Vehicle[]>({
    queryKey: ['/api/vehicles'],
    enabled: isAdmin,
  });

  // Genera QR code quando viene selezionato un veicolo
  useEffect(() => {
    if (selectedVehicleCode) {
      const qrValue = generateQRValue(selectedVehicleCode);
      
      QRCode.toDataURL(qrValue, {
        width: 300,
        margin: 2,
        color: {
          dark: "#E32719",
          light: "#ffffff"
        }
      })
      .then(url => {
        setQrDataURL(url);
      })
      .catch(err => {
        console.error("Errore nella generazione del QR code:", err);
        toast({
          title: "Errore",
          description: "Impossibile generare il codice QR",
          variant: "destructive",
        });
      });
    }
  }, [selectedVehicleCode, toast]);

  // Funzione per stampare il QR code
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Stampa QR Code - ${selectedVehicleCode}</title>
            <style>
              body { 
                font-family: Arial, sans-serif;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                text-align: center;
                margin: 0;
                padding: 20px;
              }
              img { 
                max-width: 90%;
                height: auto;
                margin: 20px 0;
              }
              h2 { 
                color: #E32719;
                margin-bottom: 5px;
              }
              p { 
                color: #333;
                margin-top: 0;
                font-size: 14px;
              }
              .container {
                border: 1px solid #ccc;
                border-radius: 8px;
                padding: 20px;
                margin: 20px;
                max-width: 400px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h2>CRI Acqui Terme</h2>
              <p>Codice veicolo: ${selectedVehicleCode}</p>
              <img src="${qrDataURL}" alt="QR Code per ${selectedVehicleCode}" />
              <p>Scannerizza questo codice QR per iniziare la checklist del veicolo</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  // Funzione per scaricare il QR code
  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = qrDataURL;
    a.download = `QRCode-${selectedVehicleCode.replace(/\s+/g, "-")}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (!isAdmin) {
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
      <div className="max-w-md mx-auto">
        <Card className="shadow-md">
          <CardContent className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <QrCode className="text-[#E32719] mr-2 h-6 w-6" />
              Generatore QR Code Veicoli
            </h1>
            
            {isLoading ? (
              <div className="py-10 text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#E32719] mx-auto"></div>
                <p className="mt-4 text-gray-600">Caricamento veicoli...</p>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seleziona Veicolo
                  </label>
                  <Select value={selectedVehicleCode} onValueChange={setSelectedVehicleCode}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona un veicolo" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles?.map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.code}>
                          {vehicle.code} - {vehicle.displayName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {qrDataURL && (
                  <div className="bg-white p-6 border border-gray-200 rounded-lg mb-6 text-center">
                    <h2 className="text-lg font-semibold text-gray-800 mb-2">
                      QR Code per {selectedVehicleCode}
                    </h2>
                    <div className="mb-4 flex justify-center">
                      <img
                        src={qrDataURL}
                        alt={`QR code per ${selectedVehicleCode}`}
                        className="max-w-full h-auto"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        className="bg-[#1976D2] hover:bg-blue-700"
                        onClick={handlePrint}
                      >
                        <Printer className="mr-2 h-4 w-4" />
                        Stampa
                      </Button>
                      <Button
                        className="bg-[#E32719] hover:bg-[#C42015]"
                        onClick={handleDownload}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Scarica
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-1 gap-3">
                  <Button
                    variant="secondary"
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800"
                    onClick={() => setLocation("/admin")}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Torna al Pannello Admin
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}