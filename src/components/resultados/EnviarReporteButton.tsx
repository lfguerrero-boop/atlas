"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { enviarReportePorEmail } from "@/lib/actions/enviar-reporte";

export function EnviarReporteButton({
  pacienteId,
  pacienteTieneEmail,
}: {
  pacienteId: string;
  pacienteTieneEmail: boolean;
}) {
  const [enviando, setEnviando] = useState(false);

  async function enviar() {
    setEnviando(true);
    const resultado = await enviarReportePorEmail(pacienteId);
    setEnviando(false);

    if (resultado.error) {
      toast.error(resultado.error);
    } else {
      toast.success(`Reporte enviado a ${resultado.email}`);
    }
  }

  if (!pacienteTieneEmail) {
    return (
      <Button variant="outline" disabled title="El paciente no tiene email registrado">
        <Mail className="size-4" />
        Enviar por email (sin email registrado)
      </Button>
    );
  }

  return (
    <Button variant="outline" onClick={enviar} disabled={enviando}>
      <Mail className="size-4" />
      {enviando ? "Enviando..." : "Enviar por email al paciente"}
    </Button>
  );
}
