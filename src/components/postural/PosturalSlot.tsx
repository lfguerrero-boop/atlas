"use client";

import { useState } from "react";
import type { NormalizedLandmark } from "@mediapipe/tasks-vision";
import { PoseCanvas } from "@/components/postural/PoseCanvas";
import { usePoseLandmarker } from "@/components/postural/usePoseLandmarker";
import {
  calcularAlineacionRodillasParaVista,
  calcularAnguloCadera,
  calcularAnguloHombros,
  detectarAsimetrias,
  type Landmark,
  type Vista,
} from "@/lib/postural/angulos";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ETIQUETAS: Record<Vista, string> = {
  anterior: "Vista anterior",
  posterior: "Vista posterior",
  lateral_derecha: "Lateral derecha",
  lateral_izquierda: "Lateral izquierda",
};

export function PosturalSlot({
  pacienteId,
  vista,
}: {
  pacienteId: string;
  vista: Vista;
}) {
  const { listo, error: errorModelo, detectar } = usePoseLandmarker();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [landmarks, setLandmarks] = useState<NormalizedLandmark[] | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [asimetrias, setAsimetrias] = useState<
    { hallazgo: string; severidad: string }[] | null
  >(null);
  const [angulos, setAngulos] = useState<{
    hombros: number | null;
    cadera: number | null;
    valgoIzq: number | null;
    valgoDer: number | null;
  } | null>(null);

  const esVistaFrontal = vista === "anterior" || vista === "posterior";

  function calcularResumen(lm: Landmark[]) {
    const anguloHombros = esVistaFrontal ? calcularAnguloHombros(lm) : null;
    const anguloCadera = esVistaFrontal ? calcularAnguloCadera(lm) : null;
    const alineacionRodillas = calcularAlineacionRodillasParaVista(lm, vista);
    setAngulos({
      hombros: anguloHombros,
      cadera: anguloCadera,
      valgoIzq: alineacionRodillas.valgoIzqGrados,
      valgoDer: alineacionRodillas.valgoDerGrados,
    });
    setAsimetrias(
      detectarAsimetrias({
        anguloHombros,
        anguloCadera,
        alineacionRodillas,
      }),
    );
  }

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setError(null);
    setGuardado(false);
    setFile(selected);
    const url = URL.createObjectURL(selected);
    setPreviewUrl(url);

    const img = document.createElement("img");
    img.onload = () => {
      const detectados = detectar(img);
      if (!detectados) {
        setError("No se detectó una persona en la foto. Probá con otra imagen.");
        setLandmarks(null);
        return;
      }
      setLandmarks(detectados);
      calcularResumen(detectados as Landmark[]);
    };
    img.src = url;
  }

  async function guardarAnalisis() {
    if (!file || !landmarks) return;
    setGuardando(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("pacienteId", pacienteId);
      formData.append("vista", vista);

      const uploadRes = await fetch("/api/fotos-posturales/upload", {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error ?? "Error al subir la foto");

      const analisisRes = await fetch("/api/analisis-postural", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fotoPosturalId: uploadData.fotoPosturalId,
          landmarks,
        }),
      });
      const analisisData = await analisisRes.json();
      if (!analisisRes.ok)
        throw new Error(analisisData.error ?? "Error al analizar la postura");

      setAngulos({
        hombros: analisisData.angulos.anguloInclinacionHombros,
        cadera: analisisData.angulos.anguloInclinacionCadera,
        valgoIzq: analisisData.angulos.alineacionRodillas.valgoIzqGrados,
        valgoDer: analisisData.angulos.alineacionRodillas.valgoDerGrados,
      });
      setAsimetrias(analisisData.asimetrias);
      setGuardado(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error inesperado");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{ETIQUETAS[vista]}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <input
          type="file"
          accept="image/*"
          onChange={onFileChange}
          disabled={!listo}
          className="text-sm"
        />
        {!listo && !errorModelo && (
          <p className="text-xs text-muted-foreground">Cargando modelo...</p>
        )}
        {errorModelo && (
          <p className="text-xs text-destructive">{errorModelo}</p>
        )}

        {previewUrl && <PoseCanvas imagenUrl={previewUrl} landmarks={landmarks} />}

        {angulos && (
          <div className="flex flex-col gap-1 text-xs">
            <span>
              Ángulo hombros: {angulos.hombros !== null ? `${angulos.hombros}°` : "N/A (vista lateral)"}
            </span>
            <span>
              Ángulo cadera: {angulos.cadera !== null ? `${angulos.cadera}°` : "N/A (vista lateral)"}
            </span>
            <span>
              Rodillas: izq{" "}
              {angulos.valgoIzq !== null ? `${angulos.valgoIzq}°` : "N/A"} / der{" "}
              {angulos.valgoDer !== null ? `${angulos.valgoDer}°` : "N/A"}
            </span>
          </div>
        )}

        {asimetrias && asimetrias.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {asimetrias.map((a, i) => (
              <Badge key={i} variant="destructive" className="text-[10px]">
                {a.hallazgo}
              </Badge>
            ))}
          </div>
        )}

        {error && <p className="text-xs text-destructive">{error}</p>}

        {landmarks && !guardado && (
          <Button size="sm" onClick={guardarAnalisis} disabled={guardando}>
            {guardando ? "Guardando..." : "Guardar análisis"}
          </Button>
        )}
        {guardado && (
          <Badge variant="secondary" className="w-fit">
            Guardado
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}
