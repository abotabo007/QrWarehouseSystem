import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Loader2 } from "lucide-react";

interface QrScannerProps {
  onScan: (result: string) => void;
  onError: (error: Error) => void;
  className?: string;
}

export function QrScanner({ onScan, onError, className }: QrScannerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerDivId = "qr-scanner";
  
  useEffect(() => {
    const startScanner = async () => {
      try {
        setIsLoading(true);
        
        // Initialize the scanner
        scannerRef.current = new Html5Qrcode(scannerDivId);
        
        // Request camera permissions and start scanning
        const cameras = await Html5Qrcode.getCameras();
        
        if (cameras && cameras.length > 0) {
          const cameraId = cameras[0].id;
          
          await scannerRef.current.start(
            cameraId,
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
            },
            (decodedText) => {
              // Success callback
              onScan(decodedText);
              if (scannerRef.current) {
                scannerRef.current.stop().catch(console.error);
              }
            },
            (errorMessage) => {
              // Error callback (this is for QR detection errors, not critical)
              console.warn(errorMessage);
            }
          );
        } else {
          throw new Error("No cameras found");
        }
        
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        onError(error instanceof Error ? error : new Error("Failed to start camera"));
      }
    };
    
    startScanner();
    
    // Cleanup on unmount
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, [onScan, onError]);
  
  return (
    <div className={className}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      <div id={scannerDivId} className="w-full h-full"></div>
    </div>
  );
}
