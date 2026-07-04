export type Landmark = { x: number; y: number; z: number; visibility: number };

/** Índices de los landmarks relevantes del modelo MediaPipe Pose (33 puntos). */
export const LANDMARK = {
  HOMBRO_IZQ: 11,
  HOMBRO_DER: 12,
  CADERA_IZQ: 23,
  CADERA_DER: 24,
  RODILLA_IZQ: 25,
  RODILLA_DER: 26,
  TOBILLO_IZQ: 27,
  TOBILLO_DER: 28,
} as const;

const VISIBILIDAD_MINIMA = 0.5;

function redondear(valor: number, decimales = 1): number {
  const factor = 10 ** decimales;
  return Math.round(valor * factor) / factor;
}

function anguloRespectoHorizontal(a: Landmark, b: Landmark): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return (Math.atan2(dy, dx) * 180) / Math.PI;
}

function anguloEntreTresPuntos(a: Landmark, vertice: Landmark, c: Landmark): number {
  const v1 = { x: a.x - vertice.x, y: a.y - vertice.y };
  const v2 = { x: c.x - vertice.x, y: c.y - vertice.y };
  const dot = v1.x * v2.x + v1.y * v2.y;
  const mag1 = Math.hypot(v1.x, v1.y);
  const mag2 = Math.hypot(v2.x, v2.y);
  if (mag1 === 0 || mag2 === 0) return 180;
  const cos = dot / (mag1 * mag2);
  return (Math.acos(Math.min(1, Math.max(-1, cos))) * 180) / Math.PI;
}

/** Verifica que los landmarks críticos para el análisis postural tengan suficiente visibilidad. */
export function landmarksCriticosVisibles(landmarks: Landmark[]): boolean {
  const indicesCriticos = Object.values(LANDMARK);
  return indicesCriticos.every(
    (i) => landmarks[i] && landmarks[i].visibility >= VISIBILIDAD_MINIMA,
  );
}

/** Ángulo de inclinación de hombros respecto a la horizontal (0° = nivelados). */
export function calcularAnguloHombros(landmarks: Landmark[]): number {
  return redondear(
    anguloRespectoHorizontal(
      landmarks[LANDMARK.HOMBRO_IZQ],
      landmarks[LANDMARK.HOMBRO_DER],
    ),
  );
}

/** Ángulo de inclinación de cadera respecto a la horizontal (0° = nivelada). */
export function calcularAnguloCadera(landmarks: Landmark[]): number {
  return redondear(
    anguloRespectoHorizontal(
      landmarks[LANDMARK.CADERA_IZQ],
      landmarks[LANDMARK.CADERA_DER],
    ),
  );
}

/**
 * Alineación de rodillas: desviación respecto a los 180° de una pierna recta
 * (cadera-rodilla-tobillo). Positivo indica valgo, negativo indica varo.
 */
export function calcularAlineacionRodillas(landmarks: Landmark[]) {
  const anguloIzq = anguloEntreTresPuntos(
    landmarks[LANDMARK.CADERA_IZQ],
    landmarks[LANDMARK.RODILLA_IZQ],
    landmarks[LANDMARK.TOBILLO_IZQ],
  );
  const anguloDer = anguloEntreTresPuntos(
    landmarks[LANDMARK.CADERA_DER],
    landmarks[LANDMARK.RODILLA_DER],
    landmarks[LANDMARK.TOBILLO_DER],
  );

  return {
    valgoIzqGrados: redondear(180 - anguloIzq),
    valgoDerGrados: redondear(180 - anguloDer),
  };
}

export type Asimetria = {
  hallazgo: string;
  severidad: "leve" | "moderada" | "alta";
};

function severidadPorMagnitud(magnitud: number): Asimetria["severidad"] | null {
  if (magnitud > 8) return "alta";
  if (magnitud > 5) return "moderada";
  if (magnitud > 2) return "leve";
  return null;
}

/** Detecta asimetrías relevantes a partir de los ángulos ya calculados. */
export function detectarAsimetrias(params: {
  anguloHombros: number;
  anguloCadera: number;
  alineacionRodillas: { valgoIzqGrados: number; valgoDerGrados: number };
}): Asimetria[] {
  const { anguloHombros, anguloCadera, alineacionRodillas } = params;
  const asimetrias: Asimetria[] = [];

  const severidadHombros = severidadPorMagnitud(Math.abs(anguloHombros));
  if (severidadHombros) {
    const lado = anguloHombros > 0 ? "derecho" : "izquierdo";
    asimetrias.push({
      hallazgo: `Hombro ${lado} más bajo (${Math.abs(anguloHombros)}°)`,
      severidad: severidadHombros,
    });
  }

  const severidadCadera = severidadPorMagnitud(Math.abs(anguloCadera));
  if (severidadCadera) {
    const lado = anguloCadera > 0 ? "derecha" : "izquierda";
    asimetrias.push({
      hallazgo: `Cadera ${lado} más baja (${Math.abs(anguloCadera)}°)`,
      severidad: severidadCadera,
    });
  }

  const diferenciaRodillas = Math.abs(
    alineacionRodillas.valgoIzqGrados - alineacionRodillas.valgoDerGrados,
  );
  const severidadRodillas = severidadPorMagnitud(diferenciaRodillas);
  if (severidadRodillas) {
    asimetrias.push({
      hallazgo: `Asimetría entre rodillas (diferencia de ${redondear(diferenciaRodillas)}°)`,
      severidad: severidadRodillas,
    });
  }

  return asimetrias;
}
