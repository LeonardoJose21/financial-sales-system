import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchSales, deleteSale, updateSaleStatus, fetchTotalAmount, clearMessages } from '../../redux/slices/saleSlice';
import { Plus, Edit, Trash2, Eye, DollarSign } from 'lucide-react';

const SalesList = () => {
  const dispatch = useDispatch();
  const { sales, totalAmount, pagination, loading, success, error } = useSelector((state) => state.sales);
  const { user } = useSelector((state) => state.auth);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSale, setSelectedSale] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);

  useEffect(() => {
    dispatch(fetchSales({ page: currentPage }));
    dispatch(fetchTotalAmount());
  }, [dispatch, currentPage]);

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        dispatch(clearMessages());
        if (success) {
          dispatch(fetchSales({ page: currentPage }));
          dispatch(fetchTotalAmount());
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, error, dispatch, currentPage]);

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar esta venta?')) {
      await dispatch(deleteSale(id));
    }
  };

  const handleStatusChange = (sale) => {
    setSelectedSale(sale);
    setShowStatusModal(true);
  };

  const updateStatus = async (newStatus) => {
    await dispatch(updateSaleStatus({ id: selectedSale.id, status: newStatus }));
    setShowStatusModal(false);
    setSelectedSale(null);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Abierto': return 'bg-blue-100 text-blue-800';
      case 'En Proceso': return 'bg-yellow-100 text-yellow-800';
      case 'Finalizado': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-light">Gestión de Ventas</h1>
          <p className="text-gray-400 mt-1">Administra las ventas de productos financieros</p>
        </div>
        <Link to="/sales/new" className="btn btn-primary flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Venta
        </Link>
      </div>

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-600">{success}</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="card">
        <div className="flex items-center justify-between mb-6 pb-4 border-b">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-primary-600 mr-3" />
            <div>
              <p className="text-sm text-gray-400">Total Cupos Solicitados</p>
              <p className="text-2xl font-bold text-light">{formatCurrency(totalAmount)}</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : sales.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No hay ventas registradas</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Producto</th>
                    <th>Cupo Solicitado</th>
                    <th>Estado</th>
                    <th>Creado Por</th>
                    <th>Fecha Creación</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-secondary divide-y divide-gray-200">
                  {sales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-secondary/80">
                      <td className="font-medium">#{sale.id}</td>
                      <td>{sale.product}</td>
                      <td className="font-semibold text-primary-600">{formatCurrency(sale.requestedAmount)}</td>
                      <td>
                        <button onClick={() => handleStatusChange(sale)} className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(sale.status)}`}>
                          {sale.status}
                        </button>
                      </td>
                      <td>{sale.creator.name}</td>
                      <td>{new Date(sale.createdAt).toLocaleDateString('es-CO')}</td>
                      <td>
                        <div className="flex space-x-2">
                          <Link to={`/sales/edit/${sale.id}`} className="p-2 text-blue-600 hover:bg-blue-50 rounded" title="Editar">
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button onClick={() => handleDelete(sale.id)} className="p-2 text-red-600 hover:bg-red-50 rounded" title="Eliminar">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-6">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="btn btn-secondary disabled:opacity-50">
                  Anterior
                </button>
                <span className="text-sm text-gray-600">
                  Página {currentPage} de {pagination.totalPages}
                </span>
                <button onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))} disabled={currentPage === pagination.totalPages} className="btn btn-secondary disabled:opacity-50">
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {showStatusModal && selectedSale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-secondary rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Cambiar Estado</h3>
            <p className="text-gray-300 mb-4">Venta #{selectedSale.id} - Estado actual: <span className="font-medium">{selectedSale.status}</span></p>
            <div className="space-y-2">
              <button onClick={() => updateStatus('Abierto')} className="w-full btn bg-blue-600 text-white hover:bg-blue-700">Abierto</button>
              <button onClick={() => updateStatus('En Proceso')} className="w-full btn bg-yellow-600 text-white hover:bg-yellow-700">En Proceso</button>
              <button onClick={() => updateStatus('Finalizado')} className="w-full btn bg-green-600 text-white hover:bg-green-700">Finalizado</button>
              <button onClick={() => setShowStatusModal(false)} className="w-full btn btn-secondary">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesList;