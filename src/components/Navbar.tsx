import Link from "next/link";
import { Sparkles, Store, Shield, Monitor } from "lucide-react";

export function Navbar() {
  return (
    <nav className="border-b border-mm-neon/10 bg-mm-black/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-mm-neon to-mm-yellow flex items-center justify-center mm-glow-neon">
            <Sparkles className="w-5 h-5 text-black" />
          </div>
          <span className="text-xl font-bold text-white">
            Mark<span className="text-mm-neon">Mall</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/tienda"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-neutral-400 hover:text-mm-neon hover:bg-mm-neon/5 transition"
          >
            <Store className="w-4 h-4" />
            Tienda
          </Link>
          <Link
            href="/admin"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-neutral-400 hover:text-white hover:bg-white/5 transition"
          >
            <Shield className="w-4 h-4" />
            Admin
          </Link>
          <Link
            href="/vitrina"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm bg-mm-neon text-black font-semibold hover:brightness-110 transition mm-glow-neon"
          >
            <Monitor className="w-4 h-4" />
            Vitrina
          </Link>
        </div>
      </div>
    </nav>
  );
}
