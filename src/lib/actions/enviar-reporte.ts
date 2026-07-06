"use server";

import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";
import {
  generarReportePaciente,
  ReporteNoAutorizadoError,
} from "@/lib/reportes/generar";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function enviarReportePorEmail(pacienteId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No autenticado" };
  }

  try {
    const { buffer, paciente } = await generarReportePaciente(
      supabase,
      user.id,
      pacienteId,
    );

    if (!paciente.email) {
      return {
        error:
          "Este paciente no tiene un email registrado. Agregalo en su ficha antes de enviar el reporte.",
      };
    }

    const { data: profesional } = await supabase
      .from("profesionales")
      .select("nombre_completo")
      .eq("id", user.id)
      .single();

    const { error } = await resend.emails.send({
      from: "Atlas <onboarding@resend.dev>",
      to: paciente.email,
      subject: "Tu reporte de valoración — Atlas",
      html: `<p>Hola ${paciente.nombre_completo},</p><p>Adjunto encontrás tu reporte de valoración generado por ${profesional?.nombre_completo ?? "tu profesional"} en Atlas.</p>`,
      attachments: [
        {
          filename: `reporte-${paciente.nombre_completo.replace(/\s+/g, "-")}.pdf`,
          content: buffer.toString("base64"),
        },
      ],
    });

    if (error) {
      return { error: error.message };
    }

    return { success: true, email: paciente.email };
  } catch (e) {
    if (e instanceof ReporteNoAutorizadoError) {
      return { error: e.message };
    }
    return { error: e instanceof Error ? e.message : "Error inesperado" };
  }
}
