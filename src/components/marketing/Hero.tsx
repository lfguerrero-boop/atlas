import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="bg-gradient-to-b from-[#F1F5F4] to-white px-6 py-24 text-center">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-6">
        <span className="rounded-full bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
          Para entrenadores, fisioterapeutas y nutricionistas deportivos
        </span>
        <h1 className="font-heading text-4xl font-bold leading-tight text-secondary md:text-5xl">
          Toda la valoración de tu paciente, en un solo lugar
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          Reemplazá las planillas de Excel y los PDFs sueltos. Anamnesis,
          valoración física, antropometría ISAK y análisis postural
          automático por foto — todo digital, todo consolidado.
        </p>
        <div className="flex gap-3">
          <Button asChild size="lg">
            <Link href="/registro">Crear cuenta gratis</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/login">Iniciar sesión</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
