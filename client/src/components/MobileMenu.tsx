import { useState } from "react";
import { Link } from "wouter";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";

interface MobileMenuProps {
  isAuthenticated: boolean;
}

export function MobileMenu({ isAuthenticated }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={toggleMenu}
        className="lg:hidden p-2 text-white hover:text-orange-400 transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeMenu}
        />
      )}

      {/* Slide-out Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-bold text-gray-900">Menu</h2>
            <button
              onClick={closeMenu}
              className="p-2 text-gray-600 hover:text-gray-900"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="flex flex-col gap-2">
              <Link href="/pricing" onClick={closeMenu}>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-700 hover:text-orange-600 hover:bg-orange-50"
                >
                  Pricing
                </Button>
              </Link>

              <Link href="/for-installers" onClick={closeMenu}>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-700 hover:text-orange-600 hover:bg-orange-50"
                >
                  For Installers
                </Button>
              </Link>

              <Link href="/success-stories" onClick={closeMenu}>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-700 hover:text-orange-600 hover:bg-orange-50"
                >
                  Success Stories
                </Button>
              </Link>

              {isAuthenticated ? (
                <Link href="/installer/dashboard" onClick={closeMenu}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-gray-700 hover:text-orange-600 hover:bg-orange-50"
                  >
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <a href={getLoginUrl()}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-gray-700 hover:text-orange-600 hover:bg-orange-50"
                  >
                    Login
                  </Button>
                </a>
              )}

              <Link href="/faq" onClick={closeMenu}>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-700 hover:text-orange-600 hover:bg-orange-50"
                >
                  FAQ
                </Button>
              </Link>
            </div>
          </nav>

          {/* Footer CTA */}
          <div className="p-4 border-t">
            <Link href="/get-quote" onClick={closeMenu}>
              <Button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white">
                Get Free Quote
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
