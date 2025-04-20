import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function Header() {
  const { user, logoutMutation } = useAuth();
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <svg className="h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <span className="ml-2 text-xl font-bold text-gray-800">Gestione Magazzino</span>
            </div>
          </div>
          <div className="flex items-center">
            <span className="text-sm text-gray-700 mr-4">{user?.username}</span>
            <Button
              size="sm"
              variant="outline"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
            >
              {logoutMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : "Logout"}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
