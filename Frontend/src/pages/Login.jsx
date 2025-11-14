import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('admin'); // admin, rider o waiter
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, playSplash } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let loginFn;
      let redirectPath;
      
      if (userType === 'admin') {
        loginFn = api.loginAdmin;
        redirectPath = '/admin';
      } else if (userType === 'rider') {
        loginFn = api.loginRider;
        redirectPath = '/rider';
      } else if (userType === 'waiter') {
        loginFn = api.loginWaiter;
        redirectPath = '/waiter';
      }
      
      const data = await loginFn(email, password);
      
      if (data.error) {
        setError(data.error);
      } else {
        login(data.user, data.token);
        await playSplash();
        navigate(redirectPath, { replace: true });
      }
    } catch (err) {
      setError('Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-app-gradient px-4 animate-page">
      <div className="max-w-md w-full space-y-8 card-animated bg-white/90 rounded-3xl shadow-lg p-8 backdrop-blur">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <img src="/logo.png" alt="Botiva" className="h-28 w-auto drop-shadow-lg" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">Botiva</h2>
          <p className="text-sm text-gray-500">Iniciar sesión</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="userType" className="block text-sm font-medium text-gray-700">
                Tipo de Usuario
              </label>
              <select
                id="userType"
                name="userType"
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="admin">Administrador</option>
                <option value="rider">Repartidor</option>
                <option value="waiter">Mozo</option>
              </select>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-200 placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="tu@email.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-200 placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 p-4 border border-red-100">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

