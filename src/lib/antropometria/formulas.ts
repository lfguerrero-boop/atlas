export type PliegesCutaneosMm = {
  tricipital: number;
  subescapular: number;
  bicipital: number;
  supraespinal: number;
  abdominal: number;
  musloFrontal: number;
  piernaMedial: number;
};

export type PerimetrosCm = {
  brazoRelajado: number;
  brazoContraido: number;
  cintura: number;
  cadera: number;
  musloMedio: number;
  piernaMaxima: number;
};

export type DiametrosCm = {
  biestiloideo: number;
  biepicondileoHumeral: number;
  biepicondileoFemoral: number;
};

export type Somatotipo = {
  endomorfia: number;
  mesomorfia: number;
  ectomorfia: number;
};

function redondear(valor: number, decimales = 1): number {
  const factor = 10 ** decimales;
  return Math.round(valor * factor) / factor;
}

/** IMC = peso (kg) / talla (m)^2 */
export function calcularImc(pesoKg: number, tallaCm: number): number {
  const tallaM = tallaCm / 100;
  return redondear(pesoKg / (tallaM * tallaM));
}

/**
 * % grasa corporal — fórmula de Faulkner (4 pliegues: tricipital, subescapular,
 * supraespinal, abdominal). Válida para población general adulta.
 */
export function calcularPorcentajeGrasaFaulkner(
  pliegues: PliegesCutaneosMm,
): number {
  const suma =
    pliegues.tricipital +
    pliegues.subescapular +
    pliegues.supraespinal +
    pliegues.abdominal;
  return redondear(suma * 0.153 + 5.783);
}

/**
 * Somatotipo de Heath-Carter (endomorfia, mesomorfia, ectomorfia).
 * Requiere pliegues, diámetros óseos, perímetros corregidos, talla y peso.
 */
export function calcularSomatotipoHeathCarter(params: {
  pliegues: PliegesCutaneosMm;
  perimetros: PerimetrosCm;
  diametros: DiametrosCm;
  tallaCm: number;
  pesoKg: number;
}): Somatotipo {
  const { pliegues, perimetros, diametros, tallaCm, pesoKg } = params;

  // Endomorfia — suma de 3 pliegues corregida por talla
  const sumaEndomorfia =
    pliegues.tricipital + pliegues.subescapular + pliegues.supraespinal;
  const x = sumaEndomorfia * (170.18 / tallaCm);
  const endomorfia =
    -0.7182 + 0.1451 * x - 0.00068 * x ** 2 + 0.0000014 * x ** 3;

  // Mesomorfia — diámetros óseos + perímetros corregidos por pliegue - talla
  const perimetroBrazoCorregido =
    perimetros.brazoContraido - pliegues.tricipital / 10;
  const perimetroPiernaCorregido =
    perimetros.piernaMaxima - pliegues.piernaMedial / 10;
  const mesomorfia =
    0.858 * diametros.biepicondileoHumeral +
    0.601 * diametros.biepicondileoFemoral +
    0.188 * perimetroBrazoCorregido +
    0.161 * perimetroPiernaCorregido -
    0.131 * tallaCm +
    4.5;

  // Ectomorfia — índice ponderal (talla / raíz cúbica del peso)
  const hwr = tallaCm / Math.cbrt(pesoKg);
  let ectomorfia: number;
  if (hwr >= 40.75) {
    ectomorfia = 0.732 * hwr - 28.58;
  } else if (hwr >= 38.25) {
    ectomorfia = 0.463 * hwr - 17.63;
  } else {
    ectomorfia = 0.1;
  }

  return {
    endomorfia: redondear(Math.max(0, endomorfia)),
    mesomorfia: redondear(Math.max(0, mesomorfia)),
    ectomorfia: redondear(Math.max(0.1, ectomorfia)),
  };
}

/**
 * Estimación de masa muscular (magra) a partir del % de grasa corporal.
 * No sustituye una medición DEXA/BIA — es una aproximación de campo estándar
 * en valoración antropométrica ISAK cuando no se dispone de otro método.
 */
export function calcularMasaMuscularKg(
  pesoKg: number,
  porcentajeGrasa: number,
): number {
  const masaGrasaKg = pesoKg * (porcentajeGrasa / 100);
  return redondear(pesoKg - masaGrasaKg, 2);
}

/** Valida que un pliegue cutáneo esté en un rango fisiológicamente plausible (2-60mm). */
export function esPliegueValido(mm: number): boolean {
  return mm >= 2 && mm <= 60;
}
