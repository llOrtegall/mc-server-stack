import { Outlet } from 'react-router';
import { useAuth } from '../auth/AuthContext';

export function Layout() {
  const { admin, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-900">
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <a href="/" className="text-xl font-bold text-green-400">
            MC Panel
          </a>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">{admin?.email}</span>
            <button
              type="button"
              onClick={logout}
              className="text-sm text-gray-300 hover:text-white transition-colors"
            >
              Cerrar sesion
            </button>
          </div>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
