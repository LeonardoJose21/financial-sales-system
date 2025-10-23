import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchUsers, deleteUser, clearMessages } from '../../redux/slices/userSlice';
import { Plus, Edit, Trash2, Search } from 'lucide-react';

const UsersList = () => {
  const dispatch = useDispatch();
  const { users, pagination, loading, success, error } = useSelector((state) => state.users);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');

  useEffect(() => {
    dispatch(fetchUsers({ page: currentPage, search }));
  }, [dispatch, currentPage, search]);

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        dispatch(clearMessages());
        if (success) {
          dispatch(fetchUsers({ page: currentPage, search }));
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, error, dispatch, currentPage, search]);

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este usuario?')) {
      await dispatch(deleteUser(id));
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-light">Gestión de Usuarios</h1>
          <p className="text-gray-400 mt-1">Administra los usuarios del sistema</p>
        </div>
        <Link to="/users/new" className="btn btn-primary flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Usuario
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
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex space-x-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-light" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nombre o correo..." className="input pl-10 bg-secondary text-light" />
            </div>
          </div>
        </form>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No hay usuarios registrados</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Correo</th>
                    <th>Rol</th>
                    <th>Fecha Creación</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-secondary divide-y divide-gray-400">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-secondary/80">
                      <td className="font-medium">#{user.id}</td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.role === 'Administrador' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>{new Date(user.createdAt).toLocaleDateString('es-CO')}</td>
                      <td>
                        <div className="flex space-x-2">
                          <Link to={`/users/edit/${user.id}`} className="p-2 text-blue-600 hover:bg-blue-50 rounded" title="Editar">
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button onClick={() => handleDelete(user.id)} className="p-2 text-red-600 hover:bg-red-50 rounded" title="Eliminar">
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
    </div>
  );
};

export default UsersList;