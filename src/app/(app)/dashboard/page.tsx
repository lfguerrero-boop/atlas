import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("pacientes")
    .select("id, nombre_completo, email, telefono, created_at")
    .order("created_at", { ascending: false });

  if (q) {
    query = query.ilike("nombre_completo", `%${q}%`);
  }

  const { data: pacientes } = await query;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-foreground">
          Pacientes
        </h1>
        <Button asChild>
          <Link href="/pacientes/nuevo">Nuevo paciente</Link>
        </Button>
      </div>

      <form className="mt-4 max-w-sm">
        <Input
          type="search"
          name="q"
          placeholder="Buscar por nombre..."
          defaultValue={q ?? ""}
        />
      </form>

      <div className="mt-6 rounded-xl border border-border bg-white">
        {pacientes && pacientes.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Teléfono</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pacientes.map((paciente) => (
                <TableRow key={paciente.id}>
                  <TableCell>
                    <Link
                      href={`/pacientes/${paciente.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {paciente.nombre_completo}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {paciente.email ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {paciente.telefono ?? "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="p-8 text-center text-muted-foreground">
            {q
              ? "No se encontraron pacientes con ese nombre."
              : "Todavía no tenés pacientes. Creá el primero."}
          </p>
        )}
      </div>
    </div>
  );
}
