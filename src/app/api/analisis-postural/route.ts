import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  calcularAlineacionRodillas,
  calcularAnguloCadera,
  calcularAnguloHombros,
  detectarAsimetrias,
  landmarksCriticosVisibles,
  type Landmark,
} from "@/lib/postural/angulos";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = await request.json();
  const fotoPosturalId = body.fotoPosturalId as string;
  const landmarks = body.landmarks as Landmark[];

  if (!fotoPosturalId || !Array.isArray(landmarks) || landmarks.length < 33) {
    return NextResponse.json(
      { error: "Faltan landmarks o fotoPosturalId" },
      { status: 400 },
    );
  }

  if (!landmarksCriticosVisibles(landmarks)) {
    return NextResponse.json(
      {
        error:
          "Landmarks críticos con baja visibilidad (visibility < 0.5). Repetí la foto con mejor encuadre/iluminación.",
      },
      { status: 400 },
    );
  }

  // Verificar que la foto pertenece a un paciente del profesional autenticado (RLS ya lo filtra,
  // pero validamos explícitamente para devolver un 403 claro en vez de un 404 ambiguo).
  const { data: foto, error: fotoError } = await supabase
    .from("fotos_posturales")
    .select("id, paciente_id")
    .eq("id", fotoPosturalId)
    .single();

  if (fotoError || !foto) {
    return NextResponse.json(
      { error: "La foto no existe o no pertenece a un paciente tuyo" },
      { status: 403 },
    );
  }

  const anguloInclinacionHombros = calcularAnguloHombros(landmarks);
  const anguloInclinacionCadera = calcularAnguloCadera(landmarks);
  const alineacionRodillas = calcularAlineacionRodillas(landmarks);
  const asimetrias = detectarAsimetrias({
    anguloHombros: anguloInclinacionHombros,
    anguloCadera: anguloInclinacionCadera,
    alineacionRodillas,
  });

  const { data: analisis, error: insertError } = await supabase
    .from("analisis_posturales")
    .upsert(
      {
        foto_postural_id: fotoPosturalId,
        landmarks,
        angulo_inclinacion_hombros: anguloInclinacionHombros,
        angulo_inclinacion_cadera: anguloInclinacionCadera,
        alineacion_rodillas: alineacionRodillas,
        asimetrias_detectadas: asimetrias,
      },
      { onConflict: "foto_postural_id" },
    )
    .select("id")
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({
    analisisId: analisis.id,
    angulos: {
      anguloInclinacionHombros,
      anguloInclinacionCadera,
      alineacionRodillas,
    },
    asimetrias,
  });
}
