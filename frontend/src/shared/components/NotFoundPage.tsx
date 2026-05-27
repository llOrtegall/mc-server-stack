import { Boxes } from 'lucide-react';
import { Link } from 'react-router';

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <span className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-900/40">
        <Boxes className="h-7 w-7 text-white" />
      </span>
      <h1 className="bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-7xl font-black text-transparent">
        404
      </h1>
      <p className="mt-2 mb-8 text-zinc-400">Pagina no encontrada</p>
      <Link
        to="/"
        className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-100 transition-colors hover:bg-white/10"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
