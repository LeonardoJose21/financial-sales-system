import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import { LayoutDashboard, Users, FileText, LogOut } from 'lucide-react';

export const Layout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role === 'Administrador';

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const getLinkClass = (path) => {
    const isActive = window.location.pathname === path;
    return `flex items-center px-3 py-2 text-sm font-medium rounded-md ${
      isActive
        ? 'text-accent font-semibold'
        : 'text-light hover:text-accent hover:text-primary-600'
    }`;
  };

  return (
    <div className="min-h-screen bg-primary text-light">
      <nav className="bg-secondary text-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl text-accent font-bold text-primary-600">Sistema Bancario</h1>
              </div>
              <div className="ml-10 flex items-center space-x-4">
                <Link to="/dashboard" className={getLinkClass('/dashboard')}>
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Dashboard
                </Link>
                <Link to="/sales" className={getLinkClass('/sales')}>
                  <FileText className="w-4 h-4 mr-2" />
                  Radicar Venta
                </Link>
                {isAdmin && (
                  <Link to="/users" className={getLinkClass('/users')}>
                    <Users className="w-4 h-4 mr-2" />
                    Usuarios
                  </Link>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm">
                <p className="font-medium text-gray-300">{user?.name}</p>
                <p className="text-gray-400 text-xs">{user?.role}</p>
              </div>
              <button onClick={handleLogout} className="flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md">
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
};
