import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

// Import pages
import Home from "@/pages/Home";
import VehicleSelect from "@/pages/VehicleSelect";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import Checklist from "@/pages/Checklist";
import AdminLogin from "@/pages/AdminLogin";
import AdminPanel from "@/pages/AdminPanel";
import WarehouseLogin from "@/pages/WarehouseLogin";
import Warehouse from "@/pages/Warehouse";
import QRGeneratorPage from "@/pages/QRGeneratorPage";
import Scanner from "@/pages/scanner";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/veicoli" component={VehicleSelect} />
      <Route path="/scanner" component={Scanner} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/veicolo/:vehicleCode" component={LoginPage} />
      <Route path="/checklist/:vehicleCode" component={Checklist} />
      <Route path="/checklist" component={Checklist} />
      <Route path="/admin-login" component={AdminLogin} />
      <Route path="/admin" component={AdminPanel} />
      <Route path="/qr-generator" component={QRGeneratorPage} />
      <Route path="/warehouse-login" component={WarehouseLogin} />
      <Route path="/warehouse" component={Warehouse} />
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
