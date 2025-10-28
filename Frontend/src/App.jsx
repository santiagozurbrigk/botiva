import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import AdminLayout from './components/admin/AdminLayout';
import RiderLayout from './components/rider/RiderLayout';
import Dashboard from './pages/admin/Dashboard';
import Products from './pages/admin/Products';
import Orders from './pages/admin/Orders';
import OrderDetail from './pages/admin/OrderDetail';
import Riders from './pages/admin/Riders';
import DeliveryConfig from './pages/admin/DeliveryConfig';
import RiderDashboard from './pages/rider/Dashboard';

function PrivateRoute({ children, requiredRole }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Cargando...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route
        path="/admin/*"
        element={
          <PrivateRoute requiredRole="admin">
            <AdminLayout>
              <Routes>
                <Route index element={<Dashboard />} />
                <Route path="orders" element={<Orders />} />
                <Route path="orders/:id" element={<OrderDetail />} />
                <Route path="products" element={<Products />} />
                <Route path="riders" element={<Riders />} />
                <Route path="delivery-config" element={<DeliveryConfig />} />
              </Routes>
            </AdminLayout>
          </PrivateRoute>
        }
      />

      <Route
        path="/rider/*"
        element={
          <PrivateRoute requiredRole="rider">
            <RiderLayout>
              <Routes>
                <Route index element={<RiderDashboard />} />
              </Routes>
            </RiderLayout>
          </PrivateRoute>
        }
      />

      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
