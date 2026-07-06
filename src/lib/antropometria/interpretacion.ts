import type { Somatotipo } from "@/lib/antropometria/formulas";

export type Genero = "masculino" | "femenino" | "otro";

export type Clasificacion = {
  categoria: string;
  descripcion: string;
  nivel: "bajo" | "normal" | "atencion" | "riesgo";
};

/** Clasificación de IMC según la OMS. */
export function clasificarImc(imc: number): Clasificacion {
  if (imc < 18.5)
    return {
      categoria: "Bajo peso",
      descripcion: "IMC por debajo del rango saludable.",
      nivel: "atencion",
    };
  if (imc < 25)
    return {
      categoria: "Peso normal",
      descripcion: "IMC dentro del rango saludable.",
      nivel: "normal",
    };
  if (imc < 30)
    return {
      categoria: "Sobrepeso",
      descripcion: "IMC por encima del rango saludable.",
      nivel: "atencion",
    };
  if (imc < 35)
    return {
      categoria: "Obesidad grado I",
      descripcion: "Riesgo aumentado de complicaciones metabólicas.",
      nivel: "riesgo",
    };
  if (imc < 40)
    return {
      categoria: "Obesidad grado II",
      descripcion: "Riesgo alto de complicaciones metabólicas.",
      nivel: "riesgo",
    };
  return {
    categoria: "Obesidad grado III",
    descripcion: "Riesgo muy alto — se recomienda abordaje multidisciplinario.",
    nivel: "riesgo",
  };
}

/**
 * Clasificación de % de grasa corporal (rangos de referencia ACE, por género).
 * "otro" usa el promedio de ambos rangos como aproximación conservadora.
 */
export function clasificarPorcentajeGrasa(
  porcentajeGrasa: number,
  genero: Genero,
): Clasificacion {
  const rangos =
    genero === "femenino"
      ? { esencial: 13, atletico: 20, fitness: 24, aceptable: 31 }
      : genero === "masculino"
        ? { esencial: 5, atletico: 13, fitness: 17, aceptable: 24 }
        : { esencial: 9, atletico: 16.5, fitness: 20.5, aceptable: 27.5 };

  if (porcentajeGrasa < rangos.esencial)
    return {
      categoria: "Grasa esencial",
      descripcion: "Nivel mínimo necesario para funciones fisiológicas básicas.",
      nivel: "atencion",
    };
  if (porcentajeGrasa < rangos.atletico)
    return {
      categoria: "Rango atlético",
      descripcion: "Típico de deportistas de alto rendimiento.",
      nivel: "normal",
    };
  if (porcentajeGrasa < rangos.fitness)
    return {
      categoria: "Rango fitness",
      descripcion: "Composición corporal saludable y activa.",
      nivel: "normal",
    };
  if (porcentajeGrasa < rangos.aceptable)
    return {
      categoria: "Aceptable",
      descripcion: "Dentro de rangos considerados normales.",
      nivel: "normal",
    };
  return {
    categoria: "Por encima del rango recomendado",
    descripcion: "Se recomienda plan de composición corporal.",
    nivel: "riesgo",
  };
}

/**
 * Interpretación del somatotipo Heath-Carter: identifica el componente
 * dominante y da una descripción orientativa para el plan de entrenamiento.
 */
export function interpretarSomatotipo(somatotipo: Somatotipo): {
  dominante: string;
  descripcion: string;
} {
  const { endomorfia, mesomorfia, ectomorfia } = somatotipo;
  const max = Math.max(endomorfia, mesomorfia, ectomorfia);
  const diferenciaMinima = 0.5;

  const dominantes = [
    { nombre: "endomorfia", valor: endomorfia },
    { nombre: "mesomorfia", valor: mesomorfia },
    { nombre: "ectomorfia", valor: ectomorfia },
  ].filter((c) => max - c.valor < diferenciaMinima);

  if (dominantes.length > 1) {
    return {
      dominante: "Somatotipo mixto/equilibrado",
      descripcion:
        "No hay un componente claramente dominante — combina características de más de un tipo corporal.",
    };
  }

  const componente = dominantes[0].nombre;
  if (componente === "endomorfia") {
    return {
      dominante: "Predominio endomorfo",
      descripcion:
        "Tendencia a mayor adiposidad relativa. Suele responder bien a entrenamiento de fuerza combinado con trabajo cardiovascular y control nutricional.",
    };
  }
  if (componente === "mesomorfia") {
    return {
      dominante: "Predominio mesomorfo",
      descripcion:
        "Estructura muscular y ósea prominente. Buena capacidad de respuesta al entrenamiento de fuerza e hipertrofia.",
    };
  }
  return {
    dominante: "Predominio ectomorfo",
    descripcion:
      "Estructura corporal delgada, menor masa relativa. Suele requerir mayor superávit calórico y volumen progresivo para ganancia de masa muscular.",
  };
}

/** Genera recomendaciones de texto combinando IMC, % grasa y somatotipo. */
export function generarRecomendacionesAntropometricas(params: {
  clasificacionImc: Clasificacion;
  clasificacionGrasa: Clasificacion;
  somatotipo: ReturnType<typeof interpretarSomatotipo>;
}): string[] {
  const { clasificacionImc, clasificacionGrasa, somatotipo } = params;
  const recomendaciones: string[] = [];

  if (clasificacionImc.nivel === "riesgo") {
    recomendaciones.push(
      "El IMC sugiere priorizar un plan de reducción de peso supervisado, combinando entrenamiento y ajuste nutricional.",
    );
  } else if (clasificacionImc.nivel === "atencion" && clasificacionImc.categoria === "Bajo peso") {
    recomendaciones.push(
      "El IMC sugiere evaluar un plan de ganancia de peso saludable con superávit calórico controlado.",
    );
  }

  if (clasificacionGrasa.nivel === "riesgo") {
    recomendaciones.push(
      "El % de grasa corporal está por encima del rango recomendado — priorizar composición corporal en el plan de entrenamiento.",
    );
  }

  recomendaciones.push(somatotipo.descripcion);

  return recomendaciones;
}
