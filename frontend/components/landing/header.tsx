"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-cat-black/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/images/cat-logo.jpg"
              alt="CAT"
              width={40}
              height={40}
              className="h-8 w-auto"
            />
            <div>
              <span className="text-cat-yellow font-bold text-lg">CAT</span>
              <span className="text-cat-black font-bold text-lg ml-1">Ready</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="#how-it-works"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="#features"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </Link>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/admin"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Admin
            </Link>
            <Link
              href="/inspect"
              className="btn-primary text-sm px-4 py-2"
            >
              Start Inspection
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2"
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Nav */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col gap-4">
              <Link
                href="#how-it-works"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                How It Works
              </Link>
              <Link
                href="#features"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                href="/admin"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Admin
              </Link>
              <Link
                href="/inspect"
                className="btn-primary text-sm px-4 py-2 text-center"
                onClick={() => setMenuOpen(false)}
              >
                Start Inspection
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
