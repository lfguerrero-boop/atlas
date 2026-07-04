import { ClipboardList, Activity, Ruler, ScanFace } from "lucide-react";

const BLOQUES = [
  {
    icon: ClipboardList,
    titulo: "Anamnesis",
    descripcion:
      "Motivo de consulta, antecedentes, hábitos y objetivos del paciente en un formulario guiado.",
  },
  {
    icon: Activity,
    titulo: "Valoración física",
    descripcion:
      "Signos vitales, tests de flexibilidad, fuerza y capacidad cardiovascular.",
  },
  {
    icon: Ruler,
    titulo: "Antropometría ISAK",
    descripcion:
      "Pliegues, perímetros y diámetros. IMC, % de grasa y somatotipo calculados automáticamente.",
  },
  {
    icon: ScanFace,
    titulo: "Análisis postural (IA)",
    descripcion:
      "Subí 4 fotos y el sistema detecta automáticamente asimetrías de hombros, cadera y rodillas.",
    destacado: true,
  },
];

export function Bloques() {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center font-heading text-3xl font-bold text-secondary">
          Un flujo, cuatro bloques
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-muted-foreground">
          Cada paciente pasa por los mismos cuatro bloques, y cada evaluación
          queda guardada en su historial.
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {BLOQUES.map(({ icon: Icon, titulo, descripcion, destacado }) => (
            <div
              key={titulo}
              className={`rounded-xl border p-6 ${
                destacado
                  ? "border-accent bg-accent/10"
                  : "border-border bg-white"
              }`}
            >
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="size-5 text-primary" />
              </div>
              <h3 className="mt-4 font-heading text-lg font-semibold text-secondary">
                {titulo}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {descripcion}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
