"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, User } from "lucide-react";
import { cn } from "@/lib/utils";

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Pacientes", icon: Users },
  { href: "/perfil", label: "Perfil", icon: User },
];

export function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 px-3">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const activo = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              activo
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden w-56 flex-col border-r border-border bg-white md:flex">
      <div className="px-6 py-5">
        <Link
          href="/dashboard"
          className="font-heading text-lg font-bold text-secondary"
        >
          Atlas
        </Link>
      </div>
      <NavLinks />
    </aside>
  );
}
