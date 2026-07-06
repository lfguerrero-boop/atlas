import { createClient } from "@/lib/supabase/server";
import { guardarValoracionAntropometrica } from "@/lib/actions/valoracion-antropometrica";
import { ToastOnParam } from "@/components/shared/ToastOnParam";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
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

const CAMPO_MM = { type: "number", step: "0.1" } as const;
const CAMPO_CM = { type: "number", step: "0.1" } as const;

function varianteBadge(nivel: string) {
  if (nivel === "riesgo") return "destructive" as const;
  return "secondary" as const;
}

export default async function ValoracionAntropometricaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: pacienteId } = await params;
  const supabase = await createClient();

  const [{ data: paciente }, { data: historial }] = await Promise.all([
    supabase.from("pacientes").select("genero").eq("id", pacienteId).single(),
    supabase
      .from("valoraciones_antropometricas")
      .select("*")
      .eq("paciente_id", pacienteId)
      .order("fecha", { ascending: false }),
  ]);

  const genero: Genero = (paciente?.genero as Genero) ?? "otro";

  const guardar = guardarValoracionAntropometrica.bind(null, pacienteId);

  return (
    <div className="flex flex-col gap-6">
      <ToastOnParam
        param="guardado"
        mensaje="Valoración antropométrica guardada"
      />
      {historial && historial.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Historial</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {historial.map((registro, i) => {
              const clasifImc =
                registro.imc != null ? clasificarImc(registro.imc) : null;
              const clasifGrasa =
                registro.porcentaje_grasa != null
                  ? clasificarPorcentajeGrasa(registro.porcentaje_grasa, genero)
                  : null;
              const somatotipoInterpretado = registro.somatotipo
                ? interpretarSomatotipo(registro.somatotipo)
                : null;
              const recomendaciones =
                clasifImc && clasifGrasa && somatotipoInterpretado
                  ? generarRecomendacionesAntropometricas({
                      clasificacionImc: clasifImc,
                      clasificacionGrasa: clasifGrasa,
                      somatotipo: somatotipoInterpretado,
                    })
                  : [];

              return (
                <div key={registro.id}>
                  {i > 0 && <Separator className="mb-4" />}
                  <p className="text-xs text-muted-foreground">
                    {registro.fecha}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    <Badge variant="secondary">
                      Peso: {registro.peso_kg} kg
                    </Badge>
                    <Badge variant={clasifImc ? varianteBadge(clasifImc.nivel) : "secondary"}>
                      IMC: {registro.imc} {clasifImc ? `(${clasifImc.categoria})` : ""}
                    </Badge>
                    <Badge variant={clasifGrasa ? varianteBadge(clasifGrasa.nivel) : "secondary"}>
                      % Grasa: {registro.porcentaje_grasa}%{" "}
                      {clasifGrasa ? `(${clasifGrasa.categoria})` : ""}
                    </Badge>
                    <Badge variant="secondary">
                      Masa muscular: {registro.masa_muscular_kg} kg
                    </Badge>
                    {registro.somatotipo && (
                      <Badge variant="secondary">
                        Somatotipo: {registro.somatotipo.endomorfia}-
                        {registro.somatotipo.mesomorfia}-
                        {registro.somatotipo.ectomorfia}
                        {somatotipoInterpretado
                          ? ` (${somatotipoInterpretado.dominante})`
                          : ""}
                      </Badge>
                    )}
                  </div>
                  {recomendaciones.length > 0 && (
                    <ul className="mt-2 flex flex-col gap-1">
                      {recomendaciones.map((r, j) => (
                        <li key={j} className="text-xs text-muted-foreground">
                          • {r}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Nueva valoración antropométrica (ISAK)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={guardar} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="pesoKg">Peso (kg)</Label>
                <Input id="pesoKg" name="pesoKg" type="number" step="0.1" required />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="tallaCm">Talla (cm)</Label>
                <Input id="tallaCm" name="tallaCm" type="number" step="0.1" required />
              </div>
            </div>

            <div>
              <Label className="mb-2 block">Pliegues cutáneos (mm)</Label>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                  ["tricipital", "Tricipital"],
                  ["subescapular", "Subescapular"],
                  ["bicipital", "Bicipital"],
                  ["supraespinal", "Supraespinal"],
                  ["abdominal", "Abdominal"],
                  ["musloFrontal", "Muslo frontal"],
                  ["piernaMedial", "Pierna medial"],
                ].map(([name, label]) => (
                  <div key={name} className="flex flex-col gap-2">
                    <Label htmlFor={name} className="text-xs font-normal">
                      {label}
                    </Label>
                    <Input id={name} name={name} {...CAMPO_MM} required />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="mb-2 block">Perímetros (cm)</Label>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {[
                  ["brazoRelajado", "Brazo relajado"],
                  ["brazoContraido", "Brazo contraído"],
                  ["cintura", "Cintura"],
                  ["cadera", "Cadera"],
                  ["musloMedio", "Muslo medio"],
                  ["piernaMaxima", "Pierna máxima"],
                ].map(([name, label]) => (
                  <div key={name} className="flex flex-col gap-2">
                    <Label htmlFor={name} className="text-xs font-normal">
                      {label}
                    </Label>
                    <Input id={name} name={name} {...CAMPO_CM} required />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="mb-2 block">Diámetros óseos (cm)</Label>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {[
                  ["biestiloideo", "Biestiloideo"],
                  ["biepicondileoHumeral", "Biepicondíleo humeral"],
                  ["biepicondileoFemoral", "Biepicondíleo femoral"],
                ].map(([name, label]) => (
                  <div key={name} className="flex flex-col gap-2">
                    <Label htmlFor={name} className="text-xs font-normal">
                      {label}
                    </Label>
                    <Input id={name} name={name} {...CAMPO_CM} required />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="observaciones">Observaciones</Label>
              <Textarea id="observaciones" name="observaciones" rows={2} />
            </div>

            <p className="text-xs text-muted-foreground">
              IMC, % de grasa (Faulkner) y somatotipo (Heath-Carter) se
              calculan automáticamente al guardar.
            </p>

            <Button type="submit" className="w-fit">
              Guardar valoración antropométrica
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
