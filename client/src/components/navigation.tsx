import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export function Navigation() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <header className="nav-sticky sticky top-0 z-50 w-full">
      <div className="section-container py-0">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <h1 className="text-xl font-bold text-gradient">
              Analogy AI
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link 
              href="/"
              className={`nav-link ${isActive('/') ? 'active' : ''}`}
            >
              Dashboard
            </Link>
            <Link 
              href="/history"
              className={`nav-link ${isActive('/history') ? 'active' : ''}`}
            >
              History
            </Link>
            <Link 
              href="/profile"
              className={`nav-link ${isActive('/profile') ? 'active' : ''}`}
            >
              Profile
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="nav-link ml-4"
              onClick={() => window.location.href = "/api/logout"}
            >
              Logout
            </Button>
          </nav>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="nav-link"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu size={18} />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border py-4">
            <nav className="flex flex-col space-y-1">
              <Link 
                href="/"
                className={`nav-link ${isActive('/') ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link 
                href="/history"
                className={`nav-link ${isActive('/history') ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                History
              </Link>
              <Link 
                href="/profile"
                className={`nav-link ${isActive('/profile') ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Profile
              </Link>
              <Button
                variant="ghost"
                size="sm"
                className="nav-link justify-start px-4"
                onClick={() => window.location.href = "/api/logout"}
              >
                Logout
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}