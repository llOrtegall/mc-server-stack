import { LayoutDashboard, Server, LogOut } from "lucide-react";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-56 bg-card border-r border-border flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🟩</span>
            <span className="font-bold text-sm">MC Panel</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2 space-y-0.5">
          <NavItem href="/dashboard" icon={<LayoutDashboard className="h-4 w-4" />} label="Dashboard" />
          <NavItem href="/servers" icon={<Server className="h-4 w-4" />} label="Servidores" />
        </nav>

        {/* Footer */}
        <div className="p-2 border-t border-border">
          <form action="/auth/logout" method="POST">
            <button className="w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm
                              text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <div className="p-6 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

function NavItem({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm
                 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
    >
      {icon}
      {label}
    </Link>
  );
}
