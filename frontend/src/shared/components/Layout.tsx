import { Boxes, LogOut } from 'lucide-react';
import { Link, Outlet } from 'react-router';
import { useAuth } from '../../modules/auth/context/AuthContext.js';

export function Layout() {
  const { admin, logout } = useAuth();

  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-40 border-b border-white/10 bg-zinc-950/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="group flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-900/40">
              <Boxes className="h-5 w-5 text-white" />
            </span>
            <span className="text-lg font-bold tracking-tight text-white">
              MC{' '}
              <span className="text-emerald-400 transition-colors group-hover:text-emerald-300">
                Panel
              </span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-zinc-400 sm:inline">
              {admin?.getEmail()}
            </span>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Cerrar sesion</span>
            </button>
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
