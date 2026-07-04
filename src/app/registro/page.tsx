import Link from "next/link";
import { registrarse } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default async function RegistroPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F1F5F4] px-4 py-12">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Crear cuenta</CardTitle>
          <CardDescription>
            Registrate como profesional en Atlas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={registrarse} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="nombreCompleto">Nombre completo</Label>
              <Input id="nombreCompleto" name="nombreCompleto" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="profesion">Profesión</Label>
              <Select name="profesion" required>
                <SelectTrigger id="profesion" className="w-full">
                  <SelectValue placeholder="Seleccioná tu profesión" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entrenador">Entrenador</SelectItem>
                  <SelectItem value="fisioterapeuta">
                    Fisioterapeuta
                  </SelectItem>
                  <SelectItem value="nutricionista">
                    Nutricionista deportivo
                  </SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                name="password"
                type="password"
                minLength={6}
                required
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="mt-2 w-full">
              Crear cuenta
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            ¿Ya tenés cuenta?{" "}
            <Link href="/login" className="font-medium text-primary">
              Iniciá sesión
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
