export type Landmark = { x: number; y: number; z: number; visibility: number };

export type Vista =
  | "anterior"
  | "posterior"
  | "lateral_derecha"
  | "lateral_izquierda";

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

/**
 * En una foto lateral, medio cuerpo queda ocluido por el torso — eso es
 * físicamente inevitable, no un problema de encuadre. Por eso la validación
 * de visibilidad depende de la vista: en anterior/posterior se exigen ambos
 * lados (se comparan hombro/cadera izq vs der); en lateral solo se exige el
 * lado que la cámara efectivamente ve.
 */
export function landmarksVisiblesParaVista(
  landmarks: Landmark[],
  vista: Vista,
): boolean {
  const indices =
    vista === "lateral_derecha"
      ? [LANDMARK.HOMBRO_DER, LANDMARK.CADERA_DER, LANDMARK.RODILLA_DER, LANDMARK.TOBILLO_DER]
      : vista === "lateral_izquierda"
        ? [LANDMARK.HOMBRO_IZQ, LANDMARK.CADERA_IZQ, LANDMARK.RODILLA_IZQ, LANDMARK.TOBILLO_IZQ]
        : Object.values(LANDMARK);

  return indices.every(
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
 * En vistas laterales solo se calcula el lado visible; el otro queda null
 * porque no hay dato confiable para compararlo.
 */
export function calcularAlineacionRodillasParaVista(
  landmarks: Landmark[],
  vista: Vista,
): { valgoIzqGrados: number | null; valgoDerGrados: number | null } {
  const calcularLado = (
    cadera: number,
    rodilla: number,
    tobillo: number,
  ): number =>
    redondear(
      180 -
        anguloEntreTresPuntos(
          landmarks[cadera],
          landmarks[rodilla],
          landmarks[tobillo],
        ),
    );

  if (vista === "lateral_derecha") {
    return {
      valgoIzqGrados: null,
      valgoDerGrados: calcularLado(
        LANDMARK.CADERA_DER,
        LANDMARK.RODILLA_DER,
        LANDMARK.TOBILLO_DER,
      ),
    };
  }

  if (vista === "lateral_izquierda") {
    return {
      valgoIzqGrados: calcularLado(
        LANDMARK.CADERA_IZQ,
        LANDMARK.RODILLA_IZQ,
        LANDMARK.TOBILLO_IZQ,
      ),
      valgoDerGrados: null,
    };
  }

  return {
    valgoIzqGrados: calcularLado(
      LANDMARK.CADERA_IZQ,
      LANDMARK.RODILLA_IZQ,
      LANDMARK.TOBILLO_IZQ,
    ),
    valgoDerGrados: calcularLado(
      LANDMARK.CADERA_DER,
      LANDMARK.RODILLA_DER,
      LANDMARK.TOBILLO_DER,
    ),
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

/**
 * Detecta asimetrías relevantes a partir de los ángulos ya calculados.
 * El ángulo de hombros/cadera (comparación bilateral) solo tiene sentido en
 * vistas anterior/posterior; en laterales se pasa null y se omite ese chequeo.
 */
export function detectarAsimetrias(params: {
  anguloHombros: number | null;
  anguloCadera: number | null;
  alineacionRodillas: { valgoIzqGrados: number | null; valgoDerGrados: number | null };
}): Asimetria[] {
  const { anguloHombros, anguloCadera, alineacionRodillas } = params;
  const asimetrias: Asimetria[] = [];

  if (anguloHombros !== null) {
    const severidadHombros = severidadPorMagnitud(Math.abs(anguloHombros));
    if (severidadHombros) {
      const lado = anguloHombros > 0 ? "derecho" : "izquierdo";
      asimetrias.push({
        hallazgo: `Hombro ${lado} más bajo (${Math.abs(anguloHombros)}°)`,
        severidad: severidadHombros,
      });
    }
  }

  if (anguloCadera !== null) {
    const severidadCadera = severidadPorMagnitud(Math.abs(anguloCadera));
    if (severidadCadera) {
      const lado = anguloCadera > 0 ? "derecha" : "izquierda";
      asimetrias.push({
        hallazgo: `Cadera ${lado} más baja (${Math.abs(anguloCadera)}°)`,
        severidad: severidadCadera,
      });
    }
  }

  if (
    alineacionRodillas.valgoIzqGrados !== null &&
    alineacionRodillas.valgoDerGrados !== null
  ) {
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
  }

  return asimetrias;
}
