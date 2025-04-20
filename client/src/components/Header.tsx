import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useMediaQuery } from "@/hooks/use-mobile";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Header() {
  const [location] = useLocation();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <header className="bg-[#E32719] text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <img 
            src="https://upload.wikimedia.org/wikipedia/it/thumb/4/4a/Emblema_CRI.svg/800px-Emblema_CRI.svg.png" 
            alt="CRI Logo" 
            className="h-10 mr-2"
          />
          <span className="font-semibold text-xl">CRI Acqui Terme</span>
        </Link>
        
        {isMobile ? (
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:bg-[#C42015] transition md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <Menu size={24} />
          </Button>
        ) : (
          <nav className="flex space-x-4">
            <Link href="/">
              <span className={`py-2 px-3 rounded hover:bg-[#C42015] transition ${location === '/' ? 'bg-[#C42015]' : ''} cursor-pointer`}>
                Home
              </span>
            </Link>
            <Link href="/admin-login">
              <span className={`py-2 px-3 rounded hover:bg-[#C42015] transition ${location === '/admin-login' ? 'bg-[#C42015]' : ''} cursor-pointer`}>
                Admin
              </span>
            </Link>
            <Link href="/warehouse-login">
              <span className={`py-2 px-3 rounded hover:bg-[#C42015] transition ${location === '/warehouse-login' ? 'bg-[#C42015]' : ''} cursor-pointer`}>
                Magazzino
              </span>
            </Link>
          </nav>
        )}
      </div>
      
      {/* Mobile menu */}
      {isMobile && mobileMenuOpen && (
        <div className="bg-[#C42015] md:hidden">
          <div className="container mx-auto px-4 py-2 flex flex-col">
            <Link href="/">
              <span className={`py-2 text-white hover:bg-[#E32719] transition ${location === '/' ? 'bg-[#E32719]' : ''} cursor-pointer block`}>
                Home
              </span>
            </Link>
            <Link href="/admin-login">
              <span className={`py-2 text-white hover:bg-[#E32719] transition ${location === '/admin-login' ? 'bg-[#E32719]' : ''} cursor-pointer block`}>
                Admin
              </span>
            </Link>
            <Link href="/warehouse-login">
              <span className={`py-2 text-white hover:bg-[#E32719] transition ${location === '/warehouse-login' ? 'bg-[#E32719]' : ''} cursor-pointer block`}>
                Magazzino
              </span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
