import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="border-b border-border bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="font-heading text-xl font-bold text-secondary"
        >
          Atlas
        </Link>
        <nav className="flex items-center gap-3">
          <Button asChild variant="ghost">
            <Link href="/login">Iniciar sesión</Link>
          </Button>
          <Button asChild>
            <Link href="/registro">Crear cuenta</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
