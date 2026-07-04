import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PatientTabs } from "@/components/pacientes/PatientTabs";

export default async function PacienteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: paciente } = await supabase
    .from("pacientes")
    .select("id, nombre_completo")
    .eq("id", id)
    .single();

  if (!paciente) notFound();

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-foreground">
        {paciente.nombre_completo}
      </h1>
      <div className="mt-4">
        <PatientTabs pacienteId={paciente.id} />
      </div>
      <div className="mt-6">{children}</div>
    </div>
  );
}
