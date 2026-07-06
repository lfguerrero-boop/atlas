import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  generarReportePaciente,
  ReporteNoAutorizadoError,
} from "@/lib/reportes/generar";

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

  try {
    const { buffer, paciente } = await generarReportePaciente(
      supabase,
      user.id,
      pacienteId,
    );

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="reporte-${paciente.nombre_completo.replace(/\s+/g, "-")}.pdf"`,
      },
    });
  } catch (error) {
    if (error instanceof ReporteNoAutorizadoError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    throw error;
  }
}
