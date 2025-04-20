import { useState } from "react";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

// Schema di validazione
const registerSchema = z.object({
  name: z.string().min(1, "Il nome è obbligatorio"),
  surname: z.string().min(1, "Il cognome è obbligatorio"),
  username: z.string().min(3, "Il nome utente deve essere di almeno 3 caratteri"),
  fiscalCode: z.string().min(16, "Il codice fiscale deve essere di 16 caratteri").max(16),
  password: z.string().min(6, "La password deve essere di almeno 6 caratteri"),
  confirmPassword: z.string().min(1, "Conferma la password")
}).refine((data) => data.password === data.confirmPassword, {
  message: "Le password non corrispondono",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Register() {
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      surname: "",
      username: "",
      fiscalCode: "",
      password: "",
      confirmPassword: ""
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      setLoading(true);
      
      // Rimuovi la conferma password prima di inviare
      const { confirmPassword, ...registrationData } = data;
      
      // Chiama l'API di registrazione
      const response = await apiRequest("POST", "/api/register", registrationData);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Errore durante la registrazione");
      }

      toast({
        title: "Registrazione completata",
        description: "Sei stato registrato con successo.",
      });

      // Reindirizza alla pagina della checklist
      setTimeout(() => {
        setLocation("/checklist");
      }, 1500);
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Errore di registrazione",
        description: error instanceof Error ? error.message : "Si è verificato un errore durante la registrazione",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Registrazione</CardTitle>
          <CardDescription>
            Crea un nuovo account per accedere al sistema di tracciamento veicoli
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input placeholder="Mario" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="surname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cognome</FormLabel>
                      <FormControl>
                        <Input placeholder="Rossi" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome utente</FormLabel>
                    <FormControl>
                      <Input placeholder="mariorossi" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="fiscalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Codice Fiscale</FormLabel>
                    <FormControl>
                      <Input placeholder="RSSMRA80A01H501R" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conferma Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registrazione in corso...
                  </>
                ) : (
                  "Registrati"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600">
            Hai già un account?{" "}
            <Button variant="link" className="p-0" onClick={() => setLocation("/login")}>
              Accedi
            </Button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}