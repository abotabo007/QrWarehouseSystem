import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { Redirect } from "wouter";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AuthPage() {
  const { user, loginMutation, registerMutation, zodResolver, loginSchema, registerSchema } = useAuth();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  // Redirect if already logged in
  if (user) {
    return <Redirect to="/dashboard" />;
  }

  // Login form setup
  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Register form setup
  const registerForm = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onLoginSubmit = (data: any) => {
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: any) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
        <Card className="w-full">
          <CardContent className="pt-6">
            <div className="flex justify-center mb-6">
              <svg className="h-16 w-16 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            
            <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Sistema di Tracciamento Magazzino</h1>
            
            <Tabs defaultValue="login" value={activeTab} onValueChange={(value) => setActiveTab(value as "login" | "register")} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Accedi</TabsTrigger>
                <TabsTrigger value="register">Registrati</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="Inserisci username" {...field} />
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
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Inserisci password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {loginMutation.error && (
                      <Alert variant="destructive">
                        <AlertDescription>
                          {loginMutation.error.message}
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    <div className="pt-2">
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Accesso in corso...
                          </>
                        ) : "Accedi"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </TabsContent>
              
              <TabsContent value="register">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="Scegli username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="esempio@email.it" {...field} />
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
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Crea password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Conferma Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Conferma password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {registerMutation.error && (
                      <Alert variant="destructive">
                        <AlertDescription>
                          {registerMutation.error.message}
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    <div className="pt-2">
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Registrazione in corso...
                          </>
                        ) : "Registrati"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
            
            <div className="mt-6 text-center text-sm text-gray-500">
              <p>Scansiona il QR code per accedere al sistema</p>
            </div>
          </CardContent>
        </Card>
        
        {/* Hero Section */}
        <div className="hidden md:flex flex-col justify-center rounded-lg bg-gradient-to-br from-primary-100 to-primary-50 p-6 text-center">
          <h2 className="text-3xl font-bold text-primary-800 mb-4">Sistema di Tracciamento Magazzino QR</h2>
          <p className="text-lg text-primary-700 mb-6">Gestisci l'inventario del tuo magazzino con un sistema di tracciamento avanzato basato su QR code.</p>
          
          <div className="grid grid-cols-1 gap-4 mb-6">
            <div className="bg-white rounded p-4 shadow-sm">
              <h3 className="font-medium text-primary-700 mb-2">Generazione QR Code</h3>
              <p className="text-sm text-gray-600">Crea codici QR univoci per tutti gli articoli del tuo magazzino</p>
            </div>
            
            <div className="bg-white rounded p-4 shadow-sm">
              <h3 className="font-medium text-primary-700 mb-2">Scansione Facile</h3>
              <p className="text-sm text-gray-600">Utilizza il tuo smartphone per scansionare i QR code e tracciare gli articoli</p>
            </div>
            
            <div className="bg-white rounded p-4 shadow-sm">
              <h3 className="font-medium text-primary-700 mb-2">Gestione Completa</h3>
              <p className="text-sm text-gray-600">Monitora lo stato del magazzino con report dettagliati e statistiche</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
