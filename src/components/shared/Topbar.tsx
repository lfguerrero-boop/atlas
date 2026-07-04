import { createClient } from "@/lib/supabase/server";
import { cerrarSesion } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { MobileNav } from "@/components/shared/MobileNav";

export async function Topbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let nombreCompleto = user?.email ?? "";
  if (user) {
    const { data: profesional } = await supabase
      .from("profesionales")
      .select("nombre_completo")
      .eq("id", user.id)
      .single();
    if (profesional?.nombre_completo) {
      nombreCompleto = profesional.nombre_completo;
    }
  }

  return (
    <header className="flex items-center justify-between border-b border-border bg-white px-3 py-3 md:px-6">
      <div className="flex items-center gap-2">
        <MobileNav />
        <span className="text-sm font-medium text-foreground">
          {nombreCompleto}
        </span>
      </div>
      <form action={cerrarSesion}>
        <Button type="submit" variant="ghost" size="sm">
          Cerrar sesión
        </Button>
      </form>
    </header>
  );
}
