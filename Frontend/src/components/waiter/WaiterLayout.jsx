import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ConfirmDialog from '../common/ConfirmDialog';

export default function WaiterLayout({ children, hideHeader = false }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const handleLogoutConfirm = () => {
    logout();
    navigate('/login');
  };

  const handleLogoutCancel = () => {
    setShowLogoutDialog(false);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Header - Oculto cuando hideHeader es true */}
      {!hideHeader && (
        <header className="bg-white shadow flex-shrink-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-gray-900">Ala Burguer</h1>
                <span className="ml-4 px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                  Mozo
                </span>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{user?.waiter?.name}</p>
                  <p className="text-xs text-gray-500">{user?.waiter?.phone}</p>
                </div>
                <button
                  onClick={handleLogoutClick}
                  className="p-2 text-gray-400 hover:text-gray-600"
                  title="Cerrar sesión"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Main content */}
      <main className={`${hideHeader ? 'h-full' : 'flex-1'} overflow-hidden`}>
        {children}
      </main>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showLogoutDialog}
        onClose={handleLogoutCancel}
        onConfirm={handleLogoutConfirm}
        title="Cerrar sesión"
        message="¿Estás seguro que quieres cerrar sesión?"
        confirmText="Cerrar sesión"
        cancelText="Cancelar"
      />
    </div>
  );
}

