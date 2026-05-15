import { Navigate, useNavigate } from 'react-router';
import { LoginForm } from '../components/LoginForm.js';
import { useAuth } from '../context/AuthContext.js';

export function LoginContainer() {
  const { admin, login } = useAuth();
  const navigate = useNavigate();

  if (admin) return <Navigate to="/" replace />;

  async function handleLogin(email: string, password: string) {
    await login(email, password);
    navigate('/');
  }

  return <LoginForm onSubmit={handleLogin} />;
}
