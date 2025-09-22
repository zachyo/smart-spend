import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-primary">SmartSpend</h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <a href="#features" className="text-secondary hover:text-primary transition-colors">
                Features
              </a>
              <a href="#pricing" className="text-secondary hover:text-primary transition-colors">
                Pricing
              </a>
              <a href="#about" className="text-secondary hover:text-primary transition-colors">
                About
              </a>
            </div>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" className="text-secondary hover:text-primary" asChild>
              <Link to="/auth">Sign in</Link>
            </Button>
            <Button className="btn-primary" asChild>
              <Link to="/auth">Get Started</Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-background border-t border-border">
              <a href="#features" className="block px-3 py-2 text-secondary hover:text-primary transition-colors">
                Features
              </a>
              <a href="#pricing" className="block px-3 py-2 text-secondary hover:text-primary transition-colors">
                Pricing
              </a>
              <a href="#about" className="block px-3 py-2 text-secondary hover:text-primary transition-colors">
                About
              </a>
              <div className="pt-4 pb-3 border-t border-border">
                <div className="flex items-center px-3 space-x-3">
                  <Button variant="ghost" className="w-full justify-start text-secondary" asChild>
                    <Link to="/auth">Sign in</Link>
                  </Button>
                </div>
                <div className="mt-3 px-3">
                  <Button className="btn-primary w-full" asChild>
                    <Link to="/auth">Get Started</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;