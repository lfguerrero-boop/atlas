import { createClient } from "@/lib/supabase/server";
import { guardarAnamnesis } from "@/lib/actions/anamnesis";
import { ToastOnParam } from "@/components/shared/ToastOnParam";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function AnamnesisPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: pacienteId } = await params;
  const supabase = await createClient();

  const { data: historial } = await supabase
    .from("anamnesis")
    .select("*")
    .eq("paciente_id", pacienteId)
    .order("fecha", { ascending: false });

  const guardar = guardarAnamnesis.bind(null, pacienteId);

  return (
    <div className="flex flex-col gap-6">
      <ToastOnParam param="guardado" mensaje="Anamnesis guardada" />
      <ToastOnParam param="creado" mensaje="Paciente creado correctamente" />
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
                <p className="mt-1 text-sm font-medium">
                  {registro.motivo_consulta || "Sin motivo de consulta"}
                </p>
                {registro.objetivo_paciente && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    Objetivo: {registro.objetivo_paciente}
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Nueva anamnesis</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={guardar} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="motivoConsulta">Motivo de consulta</Label>
              <Textarea id="motivoConsulta" name="motivoConsulta" rows={2} />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="antecedentesPersonales">
                  Antecedentes personales
                </Label>
                <Textarea
                  id="antecedentesPersonales"
                  name="antecedentesPersonales"
                  rows={3}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="antecedentesFamiliares">
                  Antecedentes familiares
                </Label>
                <Textarea
                  id="antecedentesFamiliares"
                  name="antecedentesFamiliares"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label>Antecedentes patológicos</Label>
              <div className="flex flex-wrap gap-4">
                {[
                  { name: "hipertension", label: "Hipertensión" },
                  { name: "diabetes", label: "Diabetes" },
                  { name: "cardiopatias", label: "Cardiopatías" },
                  { name: "asma", label: "Asma" },
                ].map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <Checkbox id={item.name} name={item.name} />
                    <Label htmlFor={item.name} className="font-normal">
                      {item.label}
                    </Label>
                  </div>
                ))}
              </div>
              <Input
                name="otrosAntecedentes"
                placeholder="Otros antecedentes patológicos"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="medicamentosActuales">
                  Medicamentos actuales
                </Label>
                <Textarea
                  id="medicamentosActuales"
                  name="medicamentosActuales"
                  rows={2}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="cirugiasPrevias">Cirugías previas</Label>
                <Textarea
                  id="cirugiasPrevias"
                  name="cirugiasPrevias"
                  rows={2}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label>Hábitos</Label>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Checkbox id="fuma" name="fuma" />
                  <Label htmlFor="fuma" className="font-normal">
                    Fuma
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="alcohol" name="alcohol" />
                  <Label htmlFor="alcohol" className="font-normal">
                    Consume alcohol
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="horasSueno" className="font-normal">
                    Horas de sueño
                  </Label>
                  <Input
                    id="horasSueno"
                    name="horasSueno"
                    type="number"
                    min={0}
                    max={24}
                    className="w-20"
                  />
                </div>
              </div>
              <Input
                name="nivelActividadPrevia"
                placeholder="Nivel de actividad física previa"
                className="mt-1"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="objetivoPaciente">Objetivo del paciente</Label>
              <Textarea id="objetivoPaciente" name="objetivoPaciente" rows={2} />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="observaciones">Observaciones</Label>
              <Textarea id="observaciones" name="observaciones" rows={2} />
            </div>

            <Button type="submit" className="w-fit">
              Guardar anamnesis
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
