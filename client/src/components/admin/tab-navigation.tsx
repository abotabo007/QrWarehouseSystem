import { Link } from "wouter";
import { cn } from "@/lib/utils";

type TabNavigationProps = {
  activeTab: "overview" | "qr-generator" | "inventory" | "users";
};

export default function TabNavigation({ activeTab }: TabNavigationProps) {
  const tabs = [
    { id: "overview", label: "Panoramica", href: "/dashboard" },
    { id: "qr-generator", label: "Generatore QR", href: "/qr-generator" },
    { id: "inventory", label: "Inventario", href: "/inventory" },
    { id: "users", label: "Utenti", href: "/users" },
  ];
  
  return (
    <div className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8">
          {tabs.map((tab) => (
            <Link 
              key={tab.id} 
              href={tab.href}
              className={cn(
                "py-4 px-1 text-sm font-medium border-b-2",
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
