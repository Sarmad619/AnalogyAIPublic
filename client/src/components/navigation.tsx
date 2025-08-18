import { Link, useLocation } from "wouter";
import { Brain, History, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function Navigation() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location === path;

  return (
    <header className="fixed top-0 w-full z-50 glassmorphism border-b border-glass-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
              <Brain className="text-white" size={16} />
            </div>
            <span className="text-xl font-semibold gradient-text">Analogy AI</span>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className={`transition-colors ${isActive('/') ? 'text-white' : 'text-gray-300 hover:text-white'}`}>
              Dashboard
            </Link>
            <Link href="/history" className={`transition-colors ${isActive('/history') ? 'text-white' : 'text-gray-300 hover:text-white'}`}>
              History
            </Link>
            <Link href="/profile" className={`transition-colors ${isActive('/profile') ? 'text-white' : 'text-gray-300 hover:text-white'}`}>
              Profile
            </Link>
          </nav>
          
          {/* User Avatar & Mobile Menu */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-300 hover:text-white md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu size={20} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-300 hover:text-white hidden md:block"
              onClick={() => window.location.href = "/api/logout"}
            >
              Logout
            </Button>
            <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center cursor-pointer">
              <User className="text-white" size={16} />
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-glass-border pt-4 pb-4">
            <nav className="flex flex-col space-y-3">
              <Link 
                href="/"
                className={`block px-3 py-2 rounded-md transition-colors ${isActive('/') ? 'text-white bg-glass' : 'text-gray-300 hover:text-white hover:bg-glass'}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link 
                href="/history"
                className={`block px-3 py-2 rounded-md transition-colors ${isActive('/history') ? 'text-white bg-glass' : 'text-gray-300 hover:text-white hover:bg-glass'}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                History
              </Link>
              <Link 
                href="/profile"
                className={`block px-3 py-2 rounded-md transition-colors ${isActive('/profile') ? 'text-white bg-glass' : 'text-gray-300 hover:text-white hover:bg-glass'}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Profile
              </Link>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-300 hover:text-white w-full justify-start px-3 py-2"
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
