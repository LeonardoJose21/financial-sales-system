import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStatistics, fetchTotalAmount } from '../../redux/slices/saleSlice';
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { DollarSign, TrendingUp, Package, Users as UsersIcon } from 'lucide-react';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { statistics, totalAmount, loading } = useSelector((state) => state.sales);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchStatistics());
    dispatch(fetchTotalAmount());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Safe checks for statistics data
  if (!statistics) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Cargando estadísticas...</div>
      </div>
    );
  }

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', { 
      style: 'currency', 
      currency: 'COP', 
      minimumFractionDigits: 0 
    }).format(value || 0);
  };

  // Safe data extraction with defaults
  const summary = statistics.summary || { totalSales: 0, totalAmount: 0 };
  const salesByProduct = statistics.salesByProduct || [];
  const salesByStatus = statistics.salesByStatus || [];
  const salesByAdvisor = statistics.salesByAdvisor || [];
  const salesByDate = statistics.salesByDate || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-light">Dashboard</h1>
        <p className="text-gray-300">Bienvenido, {user?.name}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-300">Total Cupos</p>
              <p className="text-2xl font-bold text-light">{formatCurrency(totalAmount)}</p>
            </div>
            <DollarSign className="w-12 h-12 text-accent opacity-30" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-300">Total Ventas</p>
              <p className="text-2xl font-bold text-light">{summary.totalSales}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-green-600 opacity-30" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-300">Productos</p>
              <p className="text-2xl font-bold text-light">{salesByProduct.length}</p>
            </div>
            <Package className="w-12 h-12 text-orange-600 opacity-30" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-300">Asesores</p>
              <p className="text-2xl font-bold text-light">{salesByAdvisor.length || 1}</p>
            </div>
            <UsersIcon className="w-12 h-12 text-purple-600 opacity-30" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales by Product */}
        {salesByProduct.length > 0 && (
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Ventas por Producto</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesByProduct}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="product" tick={{ fontSize: 12, color: "#333333" }} />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="totalAmount" fill="#3b82f6" name="Total" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Sales by Status */}
        {salesByStatus.length > 0 && (
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Distribución por Estado</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie 
                  data={salesByStatus} 
                  dataKey="count" 
                  nameKey="status" 
                  cx="50%" 
                  cy="50%" 
                  outerRadius={100} 
                  label
                >
                  {salesByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Sales by Advisor (Admin only) */}
        {user?.role === 'Administrador' && salesByAdvisor.length > 0 && (
          <div className="card lg:col-span-2">
            <h2 className="text-lg font-semibold mb-4">Ventas por Asesor</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesByAdvisor}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="advisorName" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip formatter={(value, name) => name === 'count' ? value : formatCurrency(value)} />
                <Legend />
                <Bar dataKey="count" fill="#10b981" name="Cantidad" />
                <Bar dataKey="totalAmount" fill="#3b82f6" name="Total" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Sales by Date */}
        {salesByDate.length > 0 && (
          <div className="card lg:col-span-2">
            <h2 className="text-lg font-semibold mb-4">Ventas por Fecha (Últimos 30 días)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesByDate}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} name="Ventas" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Empty State */}
      {salesByProduct.length === 0 && salesByStatus.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-gray-400 text-lg">No hay datos de ventas para mostrar</p>
          <p className="text-gray-300 text-sm mt-2">Crea tu primera venta para ver las estadísticas</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;