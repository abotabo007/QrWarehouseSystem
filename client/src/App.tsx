import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import HomePage from "@/pages/home-page";
import AdminDashboard from "@/pages/admin/dashboard";
import QrGenerator from "@/pages/admin/qr-generator";
import Inventory from "@/pages/admin/inventory";
import Users from "@/pages/admin/users";
import Scanner from "@/pages/scanner";
import { ProtectedRoute } from "./lib/protected-route";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <Route path="/scanner" component={Scanner} />
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/dashboard" component={AdminDashboard} />
      <ProtectedRoute path="/qr-generator" component={QrGenerator} />
      <ProtectedRoute path="/inventory" component={Inventory} />
      <ProtectedRoute path="/users" component={Users} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
