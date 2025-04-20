import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { insertUserSchema } from "@shared/schema";
import { Loader2 } from "lucide-react";

// Extended schema with validation
const loginSchema = z.object({
  username: z.string().min(3, "Il nome utente deve avere almeno 3 caratteri"),
  password: z.string().min(6, "La password deve avere almeno 6 caratteri"),
});

const registerSchema = insertUserSchema.extend({
  username: z.string().min(3, "Il nome utente deve avere almeno 3 caratteri"),
  password: z.string().min(6, "La password deve avere almeno 6 caratteri"),
  name: z.string().min(2, "Il nome deve avere almeno 2 caratteri"),
  surname: z.string().min(2, "Il cognome deve avere almeno 2 caratteri"),
  fiscalCode: z.string().length(16, "Il codice fiscale deve essere di 16 caratteri"),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

interface AuthFormProps {
  vehicleCode: string;
}

export function AuthForm({ vehicleCode }: AuthFormProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const { loginMutation, registerMutation } = useAuth();
  
  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  
  // Register form - completely separate
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      name: "",
      surname: "",
      fiscalCode: "",
      isAdmin: false,
      isWarehouseManager: false
    },
  });
  
  function onLoginSubmit(data: LoginFormValues) {
    loginMutation.mutate(data);
  }
  
  function onRegisterSubmit(data: RegisterFormValues) {
    registerMutation.mutate(data);
  }
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Accesso Veicolo</h2>
      <p className="text-gray-600 mb-6 pb-2 border-b">ID Veicolo: <span className="font-semibold">{vehicleCode}</span></p>
      
      <div className="flex space-x-4 mb-8">
        <Button
          type="button"
          variant={activeTab === 'login' ? "default" : "outline"}
          className="flex-1 py-6 text-base"
          onClick={() => setActiveTab('login')}
        >
          Accedi
        </Button>
        <Button
          type="button"
          variant={activeTab === 'register' ? "default" : "outline"}
          className="flex-1 py-6 text-base"
          onClick={() => setActiveTab('register')}
        >
          Registrati
        </Button>
      </div>
      
      {activeTab === 'login' ? (
        <div className="rounded-lg border p-6 shadow-sm">
          <h3 className="text-lg font-medium mb-4 text-center">Accedi con le tue credenziali</h3>
          <Form {...loginForm}>
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-5">
              <FormField
                control={loginForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Nome utente</FormLabel>
                    <FormControl>
                      <Input 
                        className="py-6" 
                        placeholder="Inserisci il tuo nome utente" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={loginForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        className="py-6" 
                        placeholder="Inserisci la tua password" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full py-6 mt-4 text-base" 
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Accesso in corso...
                  </>
                ) : (
                  "Accedi"
                )}
              </Button>
            </form>
          </Form>
        </div>
      ) : (
        <div className="rounded-lg border p-6 shadow-sm">
          <h3 className="text-lg font-medium mb-4 text-center">Crea un nuovo account</h3>
          <Form {...registerForm}>
            <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={registerForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Nome</FormLabel>
                      <FormControl>
                        <Input 
                          className="py-5" 
                          placeholder="Nome" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={registerForm.control}
                  name="surname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Cognome</FormLabel>
                      <FormControl>
                        <Input 
                          className="py-5" 
                          placeholder="Cognome" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={registerForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Nome utente</FormLabel>
                    <FormControl>
                      <Input 
                        className="py-5" 
                        placeholder="Scegli un nome utente" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={registerForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        className="py-5" 
                        placeholder="Crea una password" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={registerForm.control}
                name="fiscalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Codice Fiscale</FormLabel>
                    <FormControl>
                      <Input 
                        className="py-5" 
                        placeholder="Inserisci il codice fiscale" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full py-6 mt-4 text-base" 
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Registrazione in corso...
                  </>
                ) : (
                  "Registrati"
                )}
              </Button>
            </form>
          </Form>
        </div>
      )}
    </div>
  );
}
