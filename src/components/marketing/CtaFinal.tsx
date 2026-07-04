import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CtaFinal() {
  return (
    <section className="bg-secondary px-6 py-20 text-center">
      <div className="mx-auto max-w-xl">
        <h2 className="font-heading text-3xl font-bold text-white">
          Empezá a digitalizar tus valoraciones hoy
        </h2>
        <p className="mt-3 text-white/80">
          Gratis para empezar. Sin tarjeta de crédito.
        </p>
        <Button asChild size="lg" className="mt-6 bg-accent text-secondary hover:bg-accent/90">
          <Link href="/registro">Crear cuenta gratis</Link>
        </Button>
      </div>
    </section>
  );
}
