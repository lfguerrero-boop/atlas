import { createClient } from "@/lib/supabase/server";
import { guardarValoracionFisica } from "@/lib/actions/valoracion-fisica";
import { ToastOnParam } from "@/components/shared/ToastOnParam";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function ValoracionFisicaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: pacienteId } = await params;
  const supabase = await createClient();

  const { data: historial } = await supabase
    .from("valoraciones_fisicas")
    .select("*")
    .eq("paciente_id", pacienteId)
    .order("fecha", { ascending: false });

  const guardar = guardarValoracionFisica.bind(null, pacienteId);

  return (
    <div className="flex flex-col gap-6">
      <ToastOnParam param="guardado" mensaje="Valoración física guardada" />
      {historial && historial.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Historial</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {historial.map((registro, i) => (
              <div key={registro.id}>
                {i > 0 && <Separator className="mb-4" />}
                <p className="text-xs text-muted-foreground">
                  {registro.fecha}
                </p>
                <p className="mt-1 text-sm">
                  FC reposo: {registro.frecuencia_cardiaca_reposo ?? "—"} lpm
                  · PA: {registro.presion_arterial_sistolica ?? "—"}/
                  {registro.presion_arterial_diastolica ?? "—"} mmHg · SpO2:{" "}
                  {registro.saturacion_oxigeno ?? "—"}%
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Nueva valoración física</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={guardar} className="flex flex-col gap-5">
            <div>
              <Label className="mb-2 block">Signos vitales</Label>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="frecuenciaCardiacaReposo" className="text-xs font-normal">
                    FC reposo (lpm)
                  </Label>
                  <Input
                    id="frecuenciaCardiacaReposo"
                    name="frecuenciaCardiacaReposo"
                    type="number"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="presionArterialSistolica" className="text-xs font-normal">
                    PA sistólica
                  </Label>
                  <Input
                    id="presionArterialSistolica"
                    name="presionArterialSistolica"
                    type="number"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="presionArterialDiastolica" className="text-xs font-normal">
                    PA diastólica
                  </Label>
                  <Input
                    id="presionArterialDiastolica"
                    name="presionArterialDiastolica"
                    type="number"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="saturacionOxigeno" className="text-xs font-normal">
                    SpO2 (%)
                  </Label>
                  <Input
                    id="saturacionOxigeno"
                    name="saturacionOxigeno"
                    type="number"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label className="mb-2 block">Test de flexibilidad</Label>
              <div className="w-40">
                <Label htmlFor="sitAndReachCm" className="text-xs font-normal">
                  Sit and reach (cm)
                </Label>
                <Input id="sitAndReachCm" name="sitAndReachCm" type="number" className="mt-2" />
              </div>
            </div>

            <div>
              <Label className="mb-2 block">Test de fuerza</Label>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="dinamometriaKg" className="text-xs font-normal">
                    Dinamometría (kg)
                  </Label>
                  <Input id="dinamometriaKg" name="dinamometriaKg" type="number" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="sentadillas1min" className="text-xs font-normal">
                    Sentadillas (1 min)
                  </Label>
                  <Input id="sentadillas1min" name="sentadillas1min" type="number" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="flexiones1min" className="text-xs font-normal">
                    Flexiones (1 min)
                  </Label>
                  <Input id="flexiones1min" name="flexiones1min" type="number" />
                </div>
              </div>
            </div>

            <div>
              <Label className="mb-2 block">Test cardiovascular</Label>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="testCooperMetros" className="text-xs font-normal">
                    Test de Cooper (metros)
                  </Label>
                  <Input id="testCooperMetros" name="testCooperMetros" type="number" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="escalaBorgPercibida" className="text-xs font-normal">
                    Escala de Borg (0-10)
                  </Label>
                  <Input
                    id="escalaBorgPercibida"
                    name="escalaBorgPercibida"
                    type="number"
                    min={0}
                    max={10}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="observaciones">Observaciones</Label>
              <Textarea id="observaciones" name="observaciones" rows={2} />
            </div>

            <Button type="submit" className="w-fit">
              Guardar valoración física
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
