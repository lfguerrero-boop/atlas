import { Skeleton } from "@/components/ui/skeleton";

export default function PacienteLoading() {
  return (
    <div>
      <Skeleton className="h-8 w-56" />
      <div className="mt-4 flex gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-6 w-20" />
        ))}
      </div>
      <Skeleton className="mt-6 h-64 w-full" />
    </div>
  );
}
