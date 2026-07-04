import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="font-heading text-2xl font-bold text-secondary">
        Página no encontrada
      </h1>
      <p className="max-w-md text-muted-foreground">
        La página que buscás no existe o no tenés acceso a ella.
      </p>
      <Button asChild>
        <Link href="/dashboard">Volver al dashboard</Link>
      </Button>
    </div>
  );
}
