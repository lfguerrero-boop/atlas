import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { EvolucionChart } from "@/components/resultados/EvolucionChart";
import { EnviarReporteButton } from "@/components/resultados/EnviarReporteButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  clasificarImc,
  clasificarPorcentajeGrasa,
  interpretarSomatotipo,
  generarRecomendacionesAntropometricas,
  type Genero,
} from "@/lib/antropometria/interpretacion";
import {
  clasificarPresionArterial,
  clasificarFrecuenciaCardiaca,
  clasificarSaturacionOxigeno,
  detectarFactoresRiesgo,
} from "@/lib/valoracion-fisica/interpretacion";

function varianteBadge(nivel: string) {
  if (nivel === "riesgo") return "destructive" as const;
  return "secondary" as const;
}

export default async function ResultadosPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: pacienteId } = await params;
  const supabase = await createClient();

  const [
    { data: paciente },
    { data: anamnesis },
    { data: valoracionFisica },
    { data: antropometricas },
    { data: fotos },
  ] = await Promise.all([
    supabase
      .from("pacientes")
      .select("email, genero")
      .eq("id", pacienteId)
      .single(),
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

  const genero: Genero = (paciente?.genero as Genero) ?? "otro";

  const clasifImc = ultimaAntropometrica?.imc != null
    ? clasificarImc(ultimaAntropometrica.imc)
    : null;
  const clasifGrasa = ultimaAntropometrica?.porcentaje_grasa != null
    ? clasificarPorcentajeGrasa(ultimaAntropometrica.porcentaje_grasa, genero)
    : null;
  const somatotipoInterpretado = ultimaAntropometrica?.somatotipo
    ? interpretarSomatotipo(ultimaAntropometrica.somatotipo)
    : null;
  const recomendacionesAntropometricas =
    clasifImc && clasifGrasa && somatotipoInterpretado
      ? generarRecomendacionesAntropometricas({
          clasificacionImc: clasifImc,
          clasificacionGrasa: clasifGrasa,
          somatotipo: somatotipoInterpretado,
        })
      : [];

  const clasifPresion =
    valoracionFisica?.presion_arterial_sistolica != null &&
    valoracionFisica?.presion_arterial_diastolica != null
      ? clasificarPresionArterial(
          valoracionFisica.presion_arterial_sistolica,
          valoracionFisica.presion_arterial_diastolica,
        )
      : null;
  const clasifFc =
    valoracionFisica?.frecuencia_cardiaca_reposo != null
      ? clasificarFrecuenciaCardiaca(valoracionFisica.frecuencia_cardiaca_reposo)
      : null;
  const clasifSpo2 =
    valoracionFisica?.saturacion_oxigeno != null
      ? clasificarSaturacionOxigeno(valoracionFisica.saturacion_oxigeno)
      : null;
  const factoresRiesgo = detectarFactoresRiesgo({
    presionArterial: clasifPresion,
    frecuenciaCardiaca: clasifFc,
    saturacionOxigeno: clasifSpo2,
  });

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
          <CardContent className="flex flex-col gap-2">
            {ultimaAntropometrica ? (
              <>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">
                    Peso: {ultimaAntropometrica.peso_kg} kg
                  </Badge>
                  <Badge variant={clasifImc ? varianteBadge(clasifImc.nivel) : "secondary"}>
                    IMC: {ultimaAntropometrica.imc} {clasifImc ? `(${clasifImc.categoria})` : ""}
                  </Badge>
                  <Badge variant={clasifGrasa ? varianteBadge(clasifGrasa.nivel) : "secondary"}>
                    % Grasa: {ultimaAntropometrica.porcentaje_grasa}%{" "}
                    {clasifGrasa ? `(${clasifGrasa.categoria})` : ""}
                  </Badge>
                  {somatotipoInterpretado && (
                    <Badge variant="secondary">{somatotipoInterpretado.dominante}</Badge>
                  )}
                </div>
                {recomendacionesAntropometricas.length > 0 && (
                  <ul className="flex flex-col gap-1">
                    {recomendacionesAntropometricas.map((r, i) => (
                      <li key={i} className="text-xs text-muted-foreground">
                        • {r}
                      </li>
                    ))}
                  </ul>
                )}
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
          <CardContent className="flex flex-col gap-2">
            {valoracionFisica ? (
              <>
                <p className="text-sm">
                  FC {valoracionFisica.frecuencia_cardiaca_reposo ?? "—"} lpm ·
                  PA {valoracionFisica.presion_arterial_sistolica ?? "—"}/
                  {valoracionFisica.presion_arterial_diastolica ?? "—"}
                </p>
                <div className="flex flex-wrap gap-2">
                  {clasifPresion && (
                    <Badge variant={varianteBadge(clasifPresion.nivel)}>
                      PA: {clasifPresion.categoria}
                    </Badge>
                  )}
                  {clasifFc && (
                    <Badge variant={varianteBadge(clasifFc.nivel)}>
                      FC: {clasifFc.categoria}
                    </Badge>
                  )}
                  {clasifSpo2 && (
                    <Badge variant={varianteBadge(clasifSpo2.nivel)}>
                      SpO2: {clasifSpo2.categoria}
                    </Badge>
                  )}
                </div>
                {factoresRiesgo.length > 0 && (
                  <ul className="flex flex-col gap-1">
                    {factoresRiesgo.map((factor, i) => (
                      <li key={i} className="text-xs text-destructive">
                        ⚠ {factor}
                      </li>
                    ))}
                  </ul>
                )}
              </>
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
            <ul className="flex flex-col gap-2">
              {asimetriasRecientes.map((a, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Badge
                    variant={a.severidad === "alta" ? "destructive" : "secondary"}
                    className="mt-0.5 shrink-0"
                  >
                    {a.severidad}
                  </Badge>
                  <span className="text-muted-foreground">{a.hallazgo}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              {fotos && fotos.length > 0
                ? "Sin asimetrías detectadas."
                : "Todavía no se cargó el análisis postural."}
            </p>
          )}
          {asimetriasRecientes.length > 0 && (
            <p className="mt-3 text-xs text-muted-foreground">
              Estos son hallazgos de cribado por IA a partir de puntos
              corporales detectados en la foto — no constituyen diagnóstico
              médico. Requieren confirmación del profesional.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button asChild className="w-fit">
          <Link href={`/api/reportes/${pacienteId}`} target="_blank">
            Exportar reporte PDF
          </Link>
        </Button>
        <EnviarReporteButton
          pacienteId={pacienteId}
          pacienteTieneEmail={!!paciente?.email}
        />
      </div>
    </div>
  );
}
