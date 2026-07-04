"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { toast } from "sonner";

export function ToastOnParam({
  param,
  mensaje,
}: {
  param: string;
  mensaje: string;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (searchParams.get(param)) {
      toast.success(mensaje);
      const params = new URLSearchParams(searchParams);
      params.delete(param);
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, param]);

  return null;
}
