import { Navigate, Outlet } from 'react-router';
import { useAuth } from './AuthContext';

export function ProtectedRoute() {
  const { admin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-600 border-t-green-500" />
      </div>
    );
  }

  if (!admin) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
