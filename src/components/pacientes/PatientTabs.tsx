"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { slug: "anamnesis", label: "Anamnesis" },
  { slug: "valoracion-fisica", label: "Física" },
  { slug: "valoracion-antropometrica", label: "Antropométrica" },
  { slug: "analisis-postural", label: "Postural" },
  { slug: "resultados", label: "Resultados" },
];

export function PatientTabs({ pacienteId }: { pacienteId: string }) {
  const pathname = usePathname();

  return (
    <div className="flex gap-1 border-b border-border">
      {TABS.map((tab) => {
        const href = `/pacientes/${pacienteId}/${tab.slug}`;
        const activo = pathname === href;
        return (
          <Link
            key={tab.slug}
            href={href}
            className={cn(
              "border-b-2 px-4 py-2 text-sm font-medium transition-colors",
              activo
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
