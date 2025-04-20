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
const loginSchema = z.object({
  username: z.string().min(1, "Il nome utente è obbligatorio"),
  password: z.string().min(1, "La password è obbligatoria"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setLoading(true);
      
      // Chiama l'API di login
      const response = await apiRequest("POST", "/api/login", data);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Credenziali non valide");
      }

      toast({
        title: "Login completato",
        description: "Hai effettuato l'accesso con successo.",
      });

      // Reindirizza alla pagina della checklist
      setTimeout(() => {
        setLocation("/checklist");
      }, 1500);
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Errore di login",
        description: error instanceof Error ? error.message : "Si è verificato un errore durante il login",
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
          <CardTitle className="text-2xl font-bold">Accedi</CardTitle>
          <CardDescription>
            Inserisci le tue credenziali per accedere al sistema
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Accesso in corso...
                  </>
                ) : (
                  "Accedi"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600">
            Non hai un account?{" "}
            <Button variant="link" className="p-0" onClick={() => setLocation("/register")}>
              Registrati
            </Button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}