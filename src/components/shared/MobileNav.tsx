"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavLinks } from "@/components/shared/Sidebar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function MobileNav() {
  const [abierto, setAbierto] = useState(false);

  return (
    <Sheet open={abierto} onOpenChange={setAbierto}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-56 p-0">
        <SheetHeader>
          <SheetTitle asChild>
            <Link
              href="/dashboard"
              onClick={() => setAbierto(false)}
              className="font-heading text-lg font-bold text-secondary"
            >
              Atlas
            </Link>
          </SheetTitle>
        </SheetHeader>
        <NavLinks onNavigate={() => setAbierto(false)} />
      </SheetContent>
    </Sheet>
  );
}
