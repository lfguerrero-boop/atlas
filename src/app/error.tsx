"use client";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="font-heading text-2xl font-bold text-secondary">
        Algo salió mal
      </h1>
      <p className="max-w-md text-muted-foreground">
        {error.message || "Ocurrió un error inesperado. Probá de nuevo."}
      </p>
      <Button onClick={reset}>Reintentar</Button>
    </div>
  );
}
