"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function guardarAnamnesis(pacienteId: string, formData: FormData) {
  const supabase = await createClient();

  const antecedentesPatologicos = {
    hipertension: formData.get("hipertension") === "on",
    diabetes: formData.get("diabetes") === "on",
    cardiopatias: formData.get("cardiopatias") === "on",
    asma: formData.get("asma") === "on",
    otros: (formData.get("otrosAntecedentes") as string) || "",
  };

  const habitos = {
    fuma: formData.get("fuma") === "on",
    alcohol: formData.get("alcohol") === "on",
    horasSueno: Number(formData.get("horasSueno")) || 0,
    nivelActividadPrevia: (formData.get("nivelActividadPrevia") as string) || "",
  };

  const { error } = await supabase.from("anamnesis").insert({
    paciente_id: pacienteId,
    motivo_consulta: formData.get("motivoConsulta") as string,
    antecedentes_personales: formData.get("antecedentesPersonales") as string,
    antecedentes_familiares: formData.get("antecedentesFamiliares") as string,
    antecedentes_patologicos: antecedentesPatologicos,
    medicamentos_actuales: formData.get("medicamentosActuales") as string,
    cirugias_previas: formData.get("cirugiasPrevias") as string,
    habitos,
    objetivo_paciente: formData.get("objetivoPaciente") as string,
    observaciones: formData.get("observaciones") as string,
  });

  if (error) {
    throw new Error(error.message);
  }

  redirect(`/pacientes/${pacienteId}/anamnesis?guardado=1`);
}
