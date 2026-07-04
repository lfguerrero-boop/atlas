"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  calcularImc,
  calcularMasaMuscularKg,
  calcularPorcentajeGrasaFaulkner,
  calcularSomatotipoHeathCarter,
  esPliegueValido,
  type DiametrosCm,
  type PerimetrosCm,
  type PliegesCutaneosMm,
} from "@/lib/antropometria/formulas";

function num(formData: FormData, key: string): number {
  const value = Number(formData.get(key));
  return Number.isFinite(value) ? value : 0;
}

export async function guardarValoracionAntropometrica(
  pacienteId: string,
  formData: FormData,
) {
  const supabase = await createClient();

  const pesoKg = num(formData, "pesoKg");
  const tallaCm = num(formData, "tallaCm");

  const pliegues: PliegesCutaneosMm = {
    tricipital: num(formData, "tricipital"),
    subescapular: num(formData, "subescapular"),
    bicipital: num(formData, "bicipital"),
    supraespinal: num(formData, "supraespinal"),
    abdominal: num(formData, "abdominal"),
    musloFrontal: num(formData, "musloFrontal"),
    piernaMedial: num(formData, "piernaMedial"),
  };

  for (const valor of Object.values(pliegues)) {
    if (!esPliegueValido(valor)) {
      throw new Error(
        `Uno de los pliegues cutáneos (${valor}mm) está fuera del rango plausible (2-60mm). Revisá los datos.`,
      );
    }
  }

  const perimetros: PerimetrosCm = {
    brazoRelajado: num(formData, "brazoRelajado"),
    brazoContraido: num(formData, "brazoContraido"),
    cintura: num(formData, "cintura"),
    cadera: num(formData, "cadera"),
    musloMedio: num(formData, "musloMedio"),
    piernaMaxima: num(formData, "piernaMaxima"),
  };

  const diametros: DiametrosCm = {
    biestiloideo: num(formData, "biestiloideo"),
    biepicondileoHumeral: num(formData, "biepicondileoHumeral"),
    biepicondileoFemoral: num(formData, "biepicondileoFemoral"),
  };

  const imc = calcularImc(pesoKg, tallaCm);
  const porcentajeGrasa = calcularPorcentajeGrasaFaulkner(pliegues);
  const masaMuscularKg = calcularMasaMuscularKg(pesoKg, porcentajeGrasa);
  const somatotipo = calcularSomatotipoHeathCarter({
    pliegues,
    perimetros,
    diametros,
    tallaCm,
    pesoKg,
  });

  const { error } = await supabase.from("valoraciones_antropometricas").insert({
    paciente_id: pacienteId,
    peso_kg: pesoKg,
    talla_cm: tallaCm,
    pliegues_cutaneos_mm: pliegues,
    perimetros_cm: perimetros,
    diametros_cm: diametros,
    imc,
    porcentaje_grasa: porcentajeGrasa,
    masa_muscular_kg: masaMuscularKg,
    somatotipo,
    observaciones: formData.get("observaciones") as string,
  });

  if (error) {
    throw new Error(error.message);
  }

  redirect(`/pacientes/${pacienteId}/valoracion-antropometrica?guardado=1`);
}
