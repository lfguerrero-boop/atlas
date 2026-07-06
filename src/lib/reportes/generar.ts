import { renderToBuffer } from "@react-pdf/renderer";
import type { SupabaseClient } from "@supabase/supabase-js";
import { ReportePDF } from "@/components/resultados/ReportePDF";

export class ReporteNoAutorizadoError extends Error {}

/**
 * Reúne los datos más recientes del paciente, genera el PDF y guarda el
 * snapshot en reportes_resultados. Usado tanto por la descarga directa
 * (/api/reportes/[pacienteId]) como por el envío por email.
 */
export async function generarReportePaciente(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any>,
  userId: string,
  pacienteId: string,
) {
  const { data: paciente, error: pacienteError } = await supabase
    .from("pacientes")
    .select("id, nombre_completo, email, profesional_id")
    .eq("id", pacienteId)
    .single();

  if (pacienteError || !paciente || paciente.profesional_id !== userId) {
    throw new ReporteNoAutorizadoError(
      "Paciente no encontrado o no autorizado",
    );
  }

  const { data: profesional } = await supabase
    .from("profesionales")
    .select("nombre_completo")
    .eq("id", userId)
    .single();

  const [
    { data: anamnesis },
    { data: valoracionFisica },
    { data: antropometrica },
    { data: fotos },
  ] = await Promise.all([
    supabase
      .from("anamnesis")
      .select("motivo_consulta, objetivo_paciente")
      .eq("paciente_id", pacienteId)
      .order("fecha", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("valoraciones_fisicas")
      .select(
        "frecuencia_cardiaca_reposo, presion_arterial_sistolica, presion_arterial_diastolica",
      )
      .eq("paciente_id", pacienteId)
      .order("fecha", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("valoraciones_antropometricas")
      .select("peso_kg, talla_cm, imc, porcentaje_grasa, masa_muscular_kg, somatotipo")
      .eq("paciente_id", pacienteId)
      .order("fecha", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("fotos_posturales")
      .select("analisis_posturales(asimetrias_detectadas)")
      .eq("paciente_id", pacienteId)
      .order("fecha", { ascending: false }),
  ]);

  const hallazgosPosturales = (fotos ?? []).flatMap(
    (foto: { analisis_posturales: unknown }) => {
      const analisis = Array.isArray(foto.analisis_posturales)
        ? foto.analisis_posturales[0]
        : foto.analisis_posturales;
      return (
        (analisis as { asimetrias_detectadas?: unknown })
          ?.asimetrias_detectadas ?? []
      );
    },
  ) as { hallazgo: string; severidad: string }[];

  const fechaGeneracion = new Date().toLocaleDateString("es-AR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const resumenJson = {
    anamnesis,
    valoracionFisica,
    antropometrica,
    hallazgosPosturales,
  };

  await supabase.from("reportes_resultados").insert({
    paciente_id: pacienteId,
    resumen_json: resumenJson,
  });

  const buffer = await renderToBuffer(
    ReportePDF({
      paciente: { nombreCompleto: paciente.nombre_completo },
      profesional: { nombreCompleto: profesional?.nombre_completo ?? "" },
      fechaGeneracion,
      anamnesis: anamnesis
        ? {
            motivoConsulta: anamnesis.motivo_consulta,
            objetivoPaciente: anamnesis.objetivo_paciente,
          }
        : null,
      valoracionFisica: valoracionFisica
        ? {
            frecuenciaCardiacaReposo: valoracionFisica.frecuencia_cardiaca_reposo,
            presionArterialSistolica: valoracionFisica.presion_arterial_sistolica,
            presionArterialDiastolica: valoracionFisica.presion_arterial_diastolica,
          }
        : null,
      antropometrica: antropometrica
        ? {
            pesoKg: antropometrica.peso_kg,
            tallaCm: antropometrica.talla_cm,
            imc: antropometrica.imc,
            porcentajeGrasa: antropometrica.porcentaje_grasa,
            masaMuscularKg: antropometrica.masa_muscular_kg,
            somatotipo: antropometrica.somatotipo,
          }
        : null,
      hallazgosPosturales,
    }),
  );

  return { buffer, paciente };
}
