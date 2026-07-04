import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { EvolucionChart } from "@/components/resultados/EvolucionChart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function ResultadosPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: pacienteId } = await params;
  const supabase = await createClient();

  const [
    { data: anamnesis },
    { data: valoracionFisica },
    { data: antropometricas },
    { data: fotos },
  ] = await Promise.all([
    supabase
      .from("anamnesis")
      .select("*")
      .eq("paciente_id", pacienteId)
      .order("fecha", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("valoraciones_fisicas")
      .select("*")
      .eq("paciente_id", pacienteId)
      .order("fecha", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("valoraciones_antropometricas")
      .select("*")
      .eq("paciente_id", pacienteId)
      .order("fecha", { ascending: true }),
    supabase
      .from("fotos_posturales")
      .select("id, vista, fecha, analisis_posturales(*)")
      .eq("paciente_id", pacienteId)
      .order("fecha", { ascending: false }),
  ]);

  const ultimaAntropometrica = antropometricas?.[antropometricas.length - 1];
  const datosEvolucion = (antropometricas ?? []).map((registro) => ({
    fecha: registro.fecha,
    peso: registro.peso_kg,
    imc: registro.imc,
    porcentajeGrasa: registro.porcentaje_grasa,
  }));

  const hayDatos =
    anamnesis || valoracionFisica || ultimaAntropometrica || (fotos && fotos.length > 0);

  if (!hayDatos) {
    return (
      <p className="text-muted-foreground">
        Todavía no hay evaluaciones registradas para este paciente.
      </p>
    );
  }

  const asimetriasRecientes = (fotos ?? [])
    .flatMap((foto) => {
      const analisis = Array.isArray(foto.analisis_posturales)
        ? foto.analisis_posturales[0]
        : foto.analisis_posturales;
      return analisis?.asimetrias_detectadas ?? [];
    })
    .slice(0, 10) as { hallazgo: string; severidad: string }[];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Objetivo del paciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              {anamnesis?.objetivo_paciente || "Sin registrar"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Composición corporal actual
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {ultimaAntropometrica ? (
              <>
                <Badge variant="secondary">
                  Peso: {ultimaAntropometrica.peso_kg} kg
                </Badge>
                <Badge variant="secondary">IMC: {ultimaAntropometrica.imc}</Badge>
                <Badge variant="secondary">
                  % Grasa: {ultimaAntropometrica.porcentaje_grasa}%
                </Badge>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Sin registrar</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Signos vitales recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {valoracionFisica ? (
              <p className="text-sm">
                FC {valoracionFisica.frecuencia_cardiaca_reposo ?? "—"} lpm ·
                PA {valoracionFisica.presion_arterial_sistolica ?? "—"}/
                {valoracionFisica.presion_arterial_diastolica ?? "—"}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">Sin registrar</p>
            )}
          </CardContent>
        </Card>
      </div>

      {datosEvolucion.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Evolución (peso, IMC, % grasa)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EvolucionChart datos={datosEvolucion} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Hallazgos posturales</CardTitle>
        </CardHeader>
        <CardContent>
          {asimetriasRecientes.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {asimetriasRecientes.map((a, i) => (
                <Badge
                  key={i}
                  variant={a.severidad === "alta" ? "destructive" : "secondary"}
                >
                  {a.hallazgo}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {fotos && fotos.length > 0
                ? "Sin asimetrías detectadas."
                : "Todavía no se cargó el análisis postural."}
            </p>
          )}
        </CardContent>
      </Card>

      <Button asChild className="w-fit">
        <Link href={`/api/reportes/${pacienteId}`} target="_blank">
          Exportar reporte PDF
        </Link>
      </Button>
    </div>
  );
}
