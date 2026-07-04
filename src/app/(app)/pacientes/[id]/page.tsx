import { redirect } from "next/navigation";

export default async function PacienteDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/pacientes/${id}/anamnesis`);
}
