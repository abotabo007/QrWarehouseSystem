import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, QrCode, Camera } from 'lucide-react';

// Mock component for QR code scanning
// In a real implementation, you would use a library like 'react-qr-reader'
export default function QRScanner({ onScan }: { onScan: (data: string) => void }) {
  const [loading, setLoading] = useState(false);
  const [scanStarted, setScanStarted] = useState(false);
  const { toast } = useToast();

  const startScan = () => {
    setScanStarted(true);
    setLoading(true);
    
    // This would be where a real QR scanner would initialize
    // For demonstration, we'll simulate scanning after a delay
    setTimeout(() => {
      setLoading(false);
      
      // In a real app, this would come from the scanner
      toast({
        title: "QR Code scansionato",
        description: "Veicolo rilevato, in elaborazione...",
      });
      
      // Simulate redirect to vehicle page
      onScan("CRI 433 AF 151201");
    }, 2000);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6">
        {!scanStarted ? (
          <div className="flex flex-col items-center space-y-4">
            <QrCode className="h-16 w-16 text-[#E32719] mb-2" />
            <h2 className="text-xl font-bold text-center">Scannerizza QR Code</h2>
            <p className="text-gray-600 text-center mb-4">
              Posiziona il QR code del veicolo all'interno dell'area di scansione
            </p>
            <Button 
              onClick={startScan} 
              className="w-full bg-[#E32719] hover:bg-[#C42015]"
            >
              <Camera className="mr-2 h-4 w-4" />
              Avvia Scansione
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-4">
            {loading ? (
              <>
                <Loader2 className="h-16 w-16 text-[#E32719] animate-spin" />
                <p className="text-gray-600 text-center">Attendere, scansione in corso...</p>
              </>
            ) : (
              <div className="bg-black w-full aspect-video relative rounded-lg overflow-hidden">
                {/* This would be the camera view in a real implementation */}
                <div className="absolute inset-0 border-2 border-[#E32719] opacity-50"></div>
              </div>
            )}
            
            <Button
              variant="outline"
              onClick={() => setScanStarted(false)}
              className="mt-4"
            >
              Annulla
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
