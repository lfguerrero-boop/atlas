export function Footer() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="mx-auto max-w-6xl px-6 py-8 text-sm text-muted-foreground">
        © {new Date().getFullYear()} Atlas. Todos los derechos reservados.
      </div>
    </footer>
  );
}
