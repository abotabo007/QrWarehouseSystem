import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";

export default function HomePage() {
  const { user } = useAuth();
  
  // Redirect to dashboard
  return <Redirect to="/dashboard" />;
}
