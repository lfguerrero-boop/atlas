export type Clasificacion = {
  categoria: string;
  descripcion: string;
  nivel: "bajo" | "normal" | "atencion" | "riesgo";
};

/** Clasificación de presión arterial (categorías American Heart Association). */
export function clasificarPresionArterial(
  sistolica: number,
  diastolica: number,
): Clasificacion {
  if (sistolica > 180 || diastolica > 120)
    return {
      categoria: "Crisis hipertensiva",
      descripcion: "Requiere atención médica inmediata.",
      nivel: "riesgo",
    };
  if (sistolica >= 140 || diastolica >= 90)
    return {
      categoria: "Hipertensión etapa 2",
      descripcion: "Presión arterial significativamente elevada.",
      nivel: "riesgo",
    };
  if (sistolica >= 130 || diastolica >= 80)
    return {
      categoria: "Hipertensión etapa 1",
      descripcion: "Presión arterial elevada — se recomienda seguimiento.",
      nivel: "atencion",
    };
  if (sistolica >= 120)
    return {
      categoria: "Elevada",
      descripcion: "Ligeramente por encima de lo óptimo.",
      nivel: "atencion",
    };
  return {
    categoria: "Normal",
    descripcion: "Presión arterial dentro de rangos saludables.",
    nivel: "normal",
  };
}

/** Clasificación de frecuencia cardíaca en reposo. */
export function clasificarFrecuenciaCardiaca(fc: number): Clasificacion {
  if (fc < 60)
    return {
      categoria: "Bradicardia",
      descripcion:
        "Por debajo de 60 lpm — frecuente en deportistas entrenados, pero conviene confirmar que no haya síntomas asociados.",
      nivel: "atencion",
    };
  if (fc <= 100)
    return {
      categoria: "Normal",
      descripcion: "Frecuencia cardíaca en reposo dentro de rango saludable.",
      nivel: "normal",
    };
  return {
    categoria: "Taquicardia",
    descripcion: "Por encima de 100 lpm en reposo — se recomienda evaluación.",
    nivel: "riesgo",
  };
}

/** Clasificación de saturación de oxígeno (SpO2). */
export function clasificarSaturacionOxigeno(spo2: number): Clasificacion {
  if (spo2 >= 95)
    return {
      categoria: "Normal",
      descripcion: "Saturación de oxígeno dentro de rango saludable.",
      nivel: "normal",
    };
  if (spo2 >= 90)
    return {
      categoria: "Hipoxemia leve",
      descripcion: "Por debajo de lo óptimo — se recomienda seguimiento.",
      nivel: "atencion",
    };
  return {
    categoria: "Hipoxemia significativa",
    descripcion: "Requiere evaluación médica.",
    nivel: "riesgo",
  };
}

/** Detecta factores de riesgo combinando las clasificaciones individuales. */
export function detectarFactoresRiesgo(params: {
  presionArterial?: Clasificacion | null;
  frecuenciaCardiaca?: Clasificacion | null;
  saturacionOxigeno?: Clasificacion | null;
}): string[] {
  const { presionArterial, frecuenciaCardiaca, saturacionOxigeno } = params;
  const factores: string[] = [];

  if (presionArterial && presionArterial.nivel === "riesgo") {
    factores.push(
      `Presión arterial en categoría "${presionArterial.categoria}" — factor de riesgo cardiovascular a monitorear.`,
    );
  }

  if (frecuenciaCardiaca?.categoria === "Taquicardia") {
    factores.push(
      "Frecuencia cardíaca en reposo elevada — considerar evaluación cardiovascular antes de intensificar la carga de entrenamiento.",
    );
  }

  if (saturacionOxigeno && saturacionOxigeno.nivel === "riesgo") {
    factores.push(
      "Saturación de oxígeno baja — se recomienda evaluación médica antes de continuar con el plan de entrenamiento.",
    );
  }

  if (
    presionArterial?.nivel === "riesgo" &&
    frecuenciaCardiaca?.categoria === "Taquicardia"
  ) {
    factores.push(
      "Presión arterial y frecuencia cardíaca elevadas simultáneamente — combinación que amerita evaluación cardiovascular prioritaria.",
    );
  }

  return factores;
}
