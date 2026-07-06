import { LANDMARK, type Landmark, type Vista } from "@/lib/postural/angulos";

export type Hallazgo = {
  zona: string;
  hallazgo: string;
  severidad: "leve" | "moderada" | "alta";
};

/**
 * Umbrales de cribado (screening), no diagnósticos. Están pensados para
 * marcar patrones que ameritan revisión del profesional — no reemplazan
 * evaluación clínica, radiografía ni palpación.
 */
const UMBRAL_OFFSET_LEVE = 6; // % de la altura torso-tobillo
const UMBRAL_OFFSET_MODERADO = 10;
const UMBRAL_OFFSET_ALTO = 15;

const UMBRAL_RODILLA_LEVE = 5; // grados de desviación respecto a 180°
const UMBRAL_RODILLA_MODERADO = 10;
const UMBRAL_RODILLA_ALTO = 15;

function redondear(valor: number): number {
  return Math.round(valor * 10) / 10;
}

function severidadPorMagnitud(
  magnitud: number,
  leve: number,
  moderado: number,
  alto: number,
): Hallazgo["severidad"] | null {
  if (magnitud > alto) return "alta";
  if (magnitud > moderado) return "moderada";
  if (magnitud > leve) return "leve";
  return null;
}

/**
 * Hallazgos de cribado postural para vista frontal (anterior/posterior):
 * asimetría de hombros y cadera (compatibles con desequilibrio muscular o
 * escoliosis) y valgo/varo de rodillas — siempre "a confirmar clínicamente".
 */
function hallazgosFrontales(params: {
  anguloHombros: number;
  anguloCadera: number;
  valgoIzq: number;
  valgoDer: number;
}): Hallazgo[] {
  const { anguloHombros, anguloCadera, valgoIzq, valgoDer } = params;
  const hallazgos: Hallazgo[] = [];

  const severidadHombros = severidadPorMagnitud(Math.abs(anguloHombros), 2, 5, 8);
  if (severidadHombros) {
    const lado = anguloHombros > 0 ? "derecho" : "izquierdo";
    hallazgos.push({
      zona: "hombros",
      hallazgo: `Hombro ${lado} más bajo (${Math.abs(anguloHombros)}°) — hallazgo compatible con desequilibrio muscular o escoliosis; requiere confirmación clínica.`,
      severidad: severidadHombros,
    });
  }

  const severidadCadera = severidadPorMagnitud(Math.abs(anguloCadera), 2, 5, 8);
  if (severidadCadera) {
    const lado = anguloCadera > 0 ? "derecha" : "izquierda";
    hallazgos.push({
      zona: "cadera",
      hallazgo: `Cadera ${lado} más baja (${Math.abs(anguloCadera)}°) — hallazgo compatible con oblicuidad pélvica o discrepancia de longitud de piernas; requiere confirmación clínica.`,
      severidad: severidadCadera,
    });
  }

  for (const [lado, valor] of [
    ["izquierda", valgoIzq],
    ["derecha", valgoDer],
  ] as const) {
    const severidad = severidadPorMagnitud(
      Math.abs(valor),
      UMBRAL_RODILLA_LEVE,
      UMBRAL_RODILLA_MODERADO,
      UMBRAL_RODILLA_ALTO,
    );
    if (severidad) {
      const tipo = valor > 0 ? "Valgo" : "Varo";
      hallazgos.push({
        zona: `rodilla ${lado}`,
        hallazgo: `${tipo} de rodilla ${lado} (${Math.abs(valor)}°).`,
        severidad,
      });
    }
  }

  return hallazgos;
}

/**
 * Hallazgos de cribado postural para vista lateral: usa nariz + oreja para
 * determinar hacia dónde mira la persona (así "adelante" es consistente sin
 * importar si es lateral derecha o izquierda), y evalúa el eje
 * oreja-hombro-cadera-rodilla-tobillo (método de plomada / plumb line).
 */
function hallazgosLaterales(params: {
  landmarks: Landmark[];
  vista: "lateral_derecha" | "lateral_izquierda";
  anguloRodilla: number;
}): Hallazgo[] {
  const { landmarks, vista, anguloRodilla } = params;
  const hallazgos: Hallazgo[] = [];

  const oreja = vista === "lateral_derecha" ? landmarks[8] : landmarks[7];
  const nariz = landmarks[0];
  const hombro =
    vista === "lateral_derecha"
      ? landmarks[LANDMARK.HOMBRO_DER]
      : landmarks[LANDMARK.HOMBRO_IZQ];
  const cadera =
    vista === "lateral_derecha"
      ? landmarks[LANDMARK.CADERA_DER]
      : landmarks[LANDMARK.CADERA_IZQ];
  const rodilla =
    vista === "lateral_derecha"
      ? landmarks[LANDMARK.RODILLA_DER]
      : landmarks[LANDMARK.RODILLA_IZQ];
  const tobillo =
    vista === "lateral_derecha"
      ? landmarks[LANDMARK.TOBILLO_DER]
      : landmarks[LANDMARK.TOBILLO_IZQ];

  const escala = Math.abs(hombro.y - tobillo.y) || 1;
  const direccionAnterior = Math.sign(nariz.x - oreja.x) || 1;

  const offset = (punto: Landmark) =>
    (((punto.x - tobillo.x) * direccionAnterior) / escala) * 100;

  const offsetOreja = offset(oreja);
  const offsetHombro = offset(hombro);
  const offsetCadera = offset(cadera);
  const offsetRodilla = offset(rodilla);

  const severidadCabeza = severidadPorMagnitud(
    offsetOreja - offsetHombro,
    UMBRAL_OFFSET_LEVE,
    UMBRAL_OFFSET_MODERADO,
    UMBRAL_OFFSET_ALTO,
  );
  if (severidadCabeza) {
    hallazgos.push({
      zona: "cabeza/cuello",
      hallazgo: `Proyección anterior de cabeza respecto al hombro (desvío del ${redondear(offsetOreja - offsetHombro)}% de la altura torso-tobillo) — hallazgo compatible con postura de cabeza adelantada; requiere confirmación clínica.`,
      severidad: severidadCabeza,
    });
  }

  const severidadCifosis = severidadPorMagnitud(
    offsetHombro - offsetCadera,
    UMBRAL_OFFSET_LEVE,
    UMBRAL_OFFSET_MODERADO,
    UMBRAL_OFFSET_ALTO,
  );
  if (severidadCifosis) {
    hallazgos.push({
      zona: "columna torácica",
      hallazgo: `Hombros proyectados hacia adelante respecto a la cadera (desvío del ${redondear(offsetHombro - offsetCadera)}%) — hallazgo compatible con hipercifosis torácica; requiere confirmación clínica.`,
      severidad: severidadCifosis,
    });
  }

  const desviacionPelvica = offsetCadera - offsetRodilla;
  const severidadLordosis = severidadPorMagnitud(
    Math.abs(desviacionPelvica),
    UMBRAL_OFFSET_LEVE,
    UMBRAL_OFFSET_MODERADO,
    UMBRAL_OFFSET_ALTO,
  );
  if (severidadLordosis) {
    if (desviacionPelvica > 0) {
      hallazgos.push({
        zona: "columna lumbar",
        hallazgo: `Cadera proyectada hacia adelante respecto al eje rodilla-tobillo (desvío del ${redondear(desviacionPelvica)}%) — hallazgo compatible con anteversión pélvica / hiperlordosis lumbar; requiere confirmación clínica.`,
        severidad: severidadLordosis,
      });
    } else {
      hallazgos.push({
        zona: "columna lumbar",
        hallazgo: `Cadera retraída respecto al eje rodilla-tobillo (desvío del ${redondear(Math.abs(desviacionPelvica))}%) — hallazgo compatible con retroversión pélvica / rectificación lumbar; requiere confirmación clínica.`,
        severidad: severidadLordosis,
      });
    }
  }

  const severidadRodilla = severidadPorMagnitud(
    Math.abs(anguloRodilla),
    UMBRAL_RODILLA_LEVE,
    UMBRAL_RODILLA_MODERADO,
    UMBRAL_RODILLA_ALTO,
  );
  if (severidadRodilla) {
    if (anguloRodilla > 0) {
      hallazgos.push({
        zona: "rodilla",
        hallazgo: `Hiperextensión de rodilla en bipedestación (genu recurvatum) de ${Math.abs(anguloRodilla)}° respecto a la extensión neutra.`,
        severidad: severidadRodilla,
      });
    } else {
      hallazgos.push({
        zona: "rodilla",
        hallazgo: `Flexión de rodilla en bipedestación de ${Math.abs(anguloRodilla)}° — postura habitual en semi-flexión, a valorar posible compensación o contractura.`,
        severidad: severidadRodilla,
      });
    }
  }

  return hallazgos;
}

/**
 * Genera hallazgos posturales descriptivos según la vista. Son observaciones
 * de cribado para apoyar el criterio del profesional — no constituyen
 * diagnóstico médico (Atlas no está certificado como dispositivo diagnóstico).
 */
export function generarHallazgosPosturales(params: {
  vista: Vista;
  landmarks: Landmark[];
  anguloHombros: number | null;
  anguloCadera: number | null;
  alineacionRodillas: { valgoIzqGrados: number | null; valgoDerGrados: number | null };
}): Hallazgo[] {
  const { vista, landmarks, anguloHombros, anguloCadera, alineacionRodillas } = params;

  if (vista === "anterior" || vista === "posterior") {
    if (anguloHombros === null || anguloCadera === null) return [];
    return hallazgosFrontales({
      anguloHombros,
      anguloCadera,
      valgoIzq: alineacionRodillas.valgoIzqGrados ?? 0,
      valgoDer: alineacionRodillas.valgoDerGrados ?? 0,
    });
  }

  const anguloRodilla =
    vista === "lateral_derecha"
      ? alineacionRodillas.valgoDerGrados
      : alineacionRodillas.valgoIzqGrados;

  if (anguloRodilla === null) return [];

  return hallazgosLaterales({ landmarks, vista, anguloRodilla });
}
