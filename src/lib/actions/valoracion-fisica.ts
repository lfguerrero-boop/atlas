"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function numOrNull(value: FormDataEntryValue | null) {
  if (!value) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export async function guardarValoracionFisica(
  pacienteId: string,
  formData: FormData,
) {
  const supabase = await createClient();

  const testFlexibilidad = {
    sitAndReachCm: numOrNull(formData.get("sitAndReachCm")) ?? 0,
  };

  const testFuerza = {
    dinamometriaKg: numOrNull(formData.get("dinamometriaKg")) ?? 0,
    sentadillas1min: numOrNull(formData.get("sentadillas1min")) ?? 0,
    flexiones1min: numOrNull(formData.get("flexiones1min")) ?? 0,
  };

  const testCardiovascular = {
    testCooperMetros: numOrNull(formData.get("testCooperMetros")) ?? 0,
    escalaBorgPercibida: numOrNull(formData.get("escalaBorgPercibida")) ?? 0,
  };

  const { error } = await supabase.from("valoraciones_fisicas").insert({
    paciente_id: pacienteId,
    frecuencia_cardiaca_reposo: numOrNull(
      formData.get("frecuenciaCardiacaReposo"),
    ),
    presion_arterial_sistolica: numOrNull(
      formData.get("presionArterialSistolica"),
    ),
    presion_arterial_diastolica: numOrNull(
      formData.get("presionArterialDiastolica"),
    ),
    saturacion_oxigeno: numOrNull(formData.get("saturacionOxigeno")),
    test_flexibilidad: testFlexibilidad,
    test_fuerza: testFuerza,
    test_cardiovascular: testCardiovascular,
    observaciones: formData.get("observaciones") as string,
  });

  if (error) {
    throw new Error(error.message);
  }

  redirect(`/pacientes/${pacienteId}/valoracion-fisica?guardado=1`);
}
