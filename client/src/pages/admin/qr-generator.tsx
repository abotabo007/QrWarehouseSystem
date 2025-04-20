import Header from "@/components/admin/header";
import TabNavigation from "@/components/admin/tab-navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { Loader2, Printer, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import QRCode from "react-qr-code";

const itemFormSchema = z.object({
  itemCode: z.string().min(1, "Codice articolo è obbligatorio"),
  name: z.string().min(1, "Nome articolo è obbligatorio"),
  location: z.string().optional(),
  quantity: z.number().int().min(0, "La quantità non può essere negativa").default(0),
  description: z.string().optional(),
  status: z.string().default("available"),
});

type ItemFormValues = z.infer<typeof itemFormSchema>;

export default function QrGenerator() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [generatedQRUrl, setGeneratedQRUrl] = useState<string | null>(null);
  
  const { data: recentQrCodes, isLoading: isLoadingQrCodes } = useQuery({
    queryKey: ["/api/qrcodes"],
  });
  
  const form = useForm<ItemFormValues>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: {
      itemCode: "",
      name: "",
      location: "",
      quantity: 0,
      description: "",
      status: "available",
    },
  });
  
  const createItemMutation = useMutation({
    mutationFn: async (data: ItemFormValues) => {
      const itemRes = await apiRequest("POST", "/api/items", data);
      const item = await itemRes.json();
      
      // Now create a QR code for this item
      const baseUrl = window.location.origin;
      const qrUrl = `${baseUrl}/scanner?item=${item.id}`;
      
      const qrData = {
        itemId: item.id,
        url: qrUrl,
      };
      
      const qrRes = await apiRequest("POST", "/api/qrcodes", qrData);
      return await qrRes.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/qrcodes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/dashboard"] });
      
      toast({
        title: "QR Code generato con successo",
        description: "Il codice QR è stato creato e associato all'articolo.",
      });
      
      // Set the QR URL for displaying
      setGeneratedQRUrl(data.url);
      
      // Reset the form
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Errore nella generazione del QR code",
        description: (error as Error).message,
        variant: "destructive",
      });
    },
  });
  
  function onSubmit(data: ItemFormValues) {
    createItemMutation.mutate(data);
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <TabNavigation activeTab="qr-generator" />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Generatore QR Code</h1>
          <p className="mt-1 text-sm text-gray-500">Crea QR code per gli articoli del magazzino</p>
        </div>
        
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <FormField
                    control={form.control}
                    name="itemCode"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-3">
                        <FormLabel>Codice Articolo</FormLabel>
                        <FormControl>
                          <Input placeholder="Esempio: ART123456" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-3">
                        <FormLabel>Nome Articolo</FormLabel>
                        <FormControl>
                          <Input placeholder="Esempio: Scatola 30x40" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-3">
                        <FormLabel>Posizione</FormLabel>
                        <FormControl>
                          <Input placeholder="Esempio: Scaffale A, Piano 3" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-3">
                        <FormLabel>Quantità</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="0" 
                            {...field} 
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-6">
                        <FormLabel>Descrizione</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Inserisci una descrizione dell'articolo"
                            rows={3}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="flex justify-end">
                  <Button type="button" variant="outline" onClick={() => form.reset()}>
                    Cancella
                  </Button>
                  <Button type="submit" className="ml-3" disabled={createItemMutation.isPending}>
                    {createItemMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generazione in corso...
                      </>
                    ) : "Genera QR Code"}
                  </Button>
                </div>
                
                {createItemMutation.error && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertDescription>
                      {(createItemMutation.error as Error).message}
                    </AlertDescription>
                  </Alert>
                )}
              </form>
            </Form>
            
            {generatedQRUrl && (
              <div className="mt-6 border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900">QR Code Generato</h3>
                <div className="mt-4 flex flex-col items-center p-4 border border-gray-300 rounded-lg bg-white">
                  <div className="mb-4">
                    <QRCode value={generatedQRUrl} size={200} />
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{generatedQRUrl}</p>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={() => window.print()}>
                      <Printer className="h-4 w-4 mr-2" />
                      Stampa
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setGeneratedQRUrl(null)}>
                      Chiudi
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            <div className="mt-8 border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900">QR Code Generati Recentemente</h3>
              {isLoadingQrCodes ? (
                <div className="flex justify-center my-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : recentQrCodes?.length > 0 ? (
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {recentQrCodes.map((qrCode: any) => (
                    <div key={qrCode.id} className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex flex-col items-center hover:border-gray-400">
                      <div className="flex-shrink-0">
                        <QRCode value={qrCode.url} size={112} className="mb-2" />
                      </div>
                      <div className="text-center">
                        <h4 className="text-sm font-medium text-gray-900">Articolo #{qrCode.itemId}</h4>
                        <p className="text-xs text-gray-500">
                          Generato il {new Date(qrCode.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="mt-2 flex space-x-2">
                        <Button size="sm" variant="secondary" onClick={() => window.print()}>
                          Stampa
                        </Button>
                        <Button size="sm" variant="outline">
                          Dettagli
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 mt-4">Nessun QR code generato recentemente.</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
