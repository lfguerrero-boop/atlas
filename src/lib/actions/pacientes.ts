"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function crearPaciente(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const nombreCompleto = formData.get("nombreCompleto") as string;
  const fechaNacimiento = (formData.get("fechaNacimiento") as string) || null;
  const genero = (formData.get("genero") as string) || null;
  const email = (formData.get("email") as string) || null;
  const telefono = (formData.get("telefono") as string) || null;

  const { data, error } = await supabase
    .from("pacientes")
    .insert({
      profesional_id: user.id,
      nombre_completo: nombreCompleto,
      fecha_nacimiento: fechaNacimiento,
      genero,
      email,
      telefono,
    })
    .select("id")
    .single();

  if (error || !data) {
    redirect(
      `/pacientes/nuevo?error=${encodeURIComponent(error?.message ?? "No se pudo crear el paciente")}`,
    );
  }

  revalidatePath("/dashboard");
  redirect(`/pacientes/${data.id}/anamnesis?creado=1`);
}
