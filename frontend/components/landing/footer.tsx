import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-cat-black py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Image 
              src="/images/cat-logo.jpg" 
              alt="CAT" 
              width={60} 
              height={24}
              className="h-5 w-auto brightness-0 invert"
            />
            <span className="font-heading font-black text-lg text-white">
              Ready
            </span>
          </div>

          {/* Links */}
          <nav className="flex items-center gap-6">
            <Link
              href="#how-it-works"
              className="text-sm text-white/60 hover:text-white transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="#features"
              className="text-sm text-white/60 hover:text-white transition-colors"
            >
              Features
            </Link>
            <Link
              href="/dashboard"
              className="text-sm text-white/60 hover:text-white transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/admin"
              className="text-sm text-white/60 hover:text-white transition-colors"
            >
              Admin
            </Link>
          </nav>

          {/* Copyright */}
          <p className="text-sm text-white/40">
            Built for Caterpillar Code Jam 2026
          </p>
        </div>
      </div>
    </footer>
  );
}
