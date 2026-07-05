import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/server";
import { ReportePDF } from "@/components/resultados/ReportePDF";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ pacienteId: string }> },
) {
  const { pacienteId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { data: paciente, error: pacienteError } = await supabase
    .from("pacientes")
    .select("id, nombre_completo, profesional_id")
    .eq("id", pacienteId)
    .single();

  if (pacienteError || !paciente || paciente.profesional_id !== user.id) {
    return NextResponse.json(
      { error: "Paciente no encontrado o no autorizado" },
      { status: 403 },
    );
  }

  const { data: profesional } = await supabase
    .from("profesionales")
    .select("nombre_completo")
    .eq("id", user.id)
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

  const hallazgosPosturales = (fotos ?? [])
    .flatMap((foto) => {
      const analisis = Array.isArray(foto.analisis_posturales)
        ? foto.analisis_posturales[0]
        : foto.analisis_posturales;
      return analisis?.asimetrias_detectadas ?? [];
    }) as { hallazgo: string; severidad: string }[];

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

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="reporte-${paciente.nombre_completo.replace(/\s+/g, "-")}.pdf"`,
    },
  });
}
