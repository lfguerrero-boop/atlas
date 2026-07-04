import { PosturalSlot } from "@/components/postural/PosturalSlot";

export default async function AnalisisPosturalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: pacienteId } = await params;

  return (
    <div>
      <p className="mb-4 text-sm text-muted-foreground">
        Subí las 4 fotos del paciente. El análisis de postura se calcula
        automáticamente en tu navegador y se recalcula en el servidor al
        guardar.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <PosturalSlot pacienteId={pacienteId} vista="anterior" />
        <PosturalSlot pacienteId={pacienteId} vista="posterior" />
        <PosturalSlot pacienteId={pacienteId} vista="lateral_derecha" />
        <PosturalSlot pacienteId={pacienteId} vista="lateral_izquierda" />
      </div>
    </div>
  );
}
