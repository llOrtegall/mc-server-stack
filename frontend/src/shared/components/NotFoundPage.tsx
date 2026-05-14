import { Link } from 'react-router';

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <p className="text-gray-400 mb-6">Pagina no encontrada</p>
      <Link to="/" className="text-green-400 hover:text-green-300 underline">
        Volver al inicio
      </Link>
    </div>
  );
}
