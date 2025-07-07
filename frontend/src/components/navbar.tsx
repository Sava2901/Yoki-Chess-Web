import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  return (
    <nav className="relative border-b bg-background z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-primary" onClick={closeMenu}>
            Yoki Chess
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className="text-foreground hover:text-primary transition-colors"
              activeProps={{
                className: 'text-primary font-semibold'
              }}
            >
              Home
            </Link>
            <Link
              to="/match"
              className="text-foreground hover:text-primary transition-colors"
              activeProps={{
                className: 'text-primary font-semibold'
              }}
            >
              Match
            </Link>
            <Link
              to="/analysis"
              className="text-foreground hover:text-primary transition-colors"
              activeProps={{
                className: 'text-primary font-semibold'
              }}
            >
              Analysis
            </Link>
            <Link
              to="/profile"
              className="text-foreground hover:text-primary transition-colors"
              activeProps={{
                className: 'text-primary font-semibold'
              }}
            >
              Profile
            </Link>
            <ThemeToggle />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMenu}
              className="p-2"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <>
            {/* Overlay */}
            <div 
              className="fixed top-16 left-0 right-0 bottom-0 bg-black/20 backdrop-blur-sm z-40 md:hidden" 
              onClick={closeMenu}
            />
            {/* Menu */}
            <div className="absolute top-full left-0 right-0 bg-background border-t shadow-lg z-50 md:hidden">
              <div className="container mx-auto px-4 py-4">
                <div className="flex flex-col space-y-3">
              <Link
                to="/"
                className="text-foreground hover:text-primary transition-colors py-2 px-2 rounded-md hover:bg-muted"
                activeProps={{
                  className: 'text-primary font-semibold bg-muted'
                }}
                onClick={closeMenu}
              >
                Home
              </Link>
              <Link
                to="/match"
                className="text-foreground hover:text-primary transition-colors py-2 px-2 rounded-md hover:bg-muted"
                activeProps={{
                  className: 'text-primary font-semibold bg-muted'
                }}
                onClick={closeMenu}
              >
                Match
              </Link>
              <Link
                to="/analysis"
                className="text-foreground hover:text-primary transition-colors py-2 px-2 rounded-md hover:bg-muted"
                activeProps={{
                  className: 'text-primary font-semibold bg-muted'
                }}
                onClick={closeMenu}
              >
                Analysis
              </Link>
              <Link
                to="/profile"
                className="text-foreground hover:text-primary transition-colors py-2 px-2 rounded-md hover:bg-muted"
                activeProps={{
                  className: 'text-primary font-semibold bg-muted'
                }}
                onClick={closeMenu}
              >
                Profile
              </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </nav>
  )
}