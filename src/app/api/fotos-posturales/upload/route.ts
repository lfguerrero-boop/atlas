import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const pacienteId = formData.get("pacienteId") as string | null;
  const vista = formData.get("vista") as string | null;

  if (!file || !pacienteId || !vista) {
    return NextResponse.json(
      { error: "Faltan file, pacienteId o vista" },
      { status: 400 },
    );
  }

  const { data: paciente, error: pacienteError } = await supabase
    .from("pacientes")
    .select("id")
    .eq("id", pacienteId)
    .single();

  if (pacienteError || !paciente) {
    return NextResponse.json(
      { error: "El paciente no existe o no te pertenece" },
      { status: 403 },
    );
  }

  const extension = file.name.split(".").pop() || "jpg";
  const storagePath = `${user.id}/${pacienteId}/${vista}-${Date.now()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from("fotos-posturales")
    .upload(storagePath, file, { contentType: file.type });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: fotoRow, error: insertError } = await supabase
    .from("fotos_posturales")
    .insert({
      paciente_id: pacienteId,
      vista,
      storage_path: storagePath,
    })
    .select("id")
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  const { data: signedUrlData } = await supabase.storage
    .from("fotos-posturales")
    .createSignedUrl(storagePath, 60 * 10);

  return NextResponse.json({
    fotoPosturalId: fotoRow.id,
    signedUrl: signedUrlData?.signedUrl,
  });
}
