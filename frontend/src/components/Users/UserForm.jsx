import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { createUser, updateUser, fetchRoles, clearMessages } from '../../redux/slices/userSlice';
import apiService from '../../services/api';
import { Save, X } from 'lucide-react';

const UserForm = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { roles, loading, success, error } = useSelector((state) => state.users);

  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  useEffect(() => {
    dispatch(fetchRoles());
  }, [dispatch]);

  useEffect(() => {
    if (id) {
      loadUser();
    }
  }, [id]);

  useEffect(() => {
    if (success) {
      setTimeout(() => {
        navigate('/users');
      }, 2000);
    }
  }, [success, navigate]);

  const loadUser = async () => {
    try {
      const response = await apiService.getUserById(id);
      const user = response.data;
      reset({
        name: user.name,
        email: user.email,
        roleId: user.roleId,
        password: ''
      });
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const onSubmit = async (data) => {
    const userData = {
      name: data.name,
      email: data.email,
      roleId: parseInt(data.roleId)
    };

    if (data.password) {
      userData.password = data.password;
    }

    if (id) {
      await dispatch(updateUser({ id, userData }));
    } else {
      userData.password = data.password;
      await dispatch(createUser(userData));
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-light">{id ? 'Editar' : 'Nuevo'} Usuario</h1>
        <p className="text-gray-400 mt-1">Complete los datos del usuario</p>
      </div>

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-600">{success}</p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="card">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Nombre *</label>
            <input type="text" {...register('name', { required: 'El nombre es obligatorio', maxLength: { value: 50, message: 'Máximo 50 caracteres' } })} className="input bg-secondary p-1 ml-2 text-light" placeholder="Juan Pérez" />
            {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="label">Correo Electrónico *</label>
            <input type="email" {...register('email', { required: 'El correo es obligatorio', pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Correo inválido' }, maxLength: { value: 50, message: 'Máximo 50 caracteres' } })} className="input bg-secondary p-1 ml-2 text-light" placeholder="usuario@banco.com" />
            {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="label">Contraseña {!id && '*'}</label>
            <input type="password" {...register('password', { required: !id && 'La contraseña es obligatoria', minLength: { value: 6, message: 'Mínimo 6 caracteres' }, maxLength: { value: 20, message: 'Máximo 20 caracteres' }, pattern: { value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, message: 'Debe contener mayúscula, minúscula y número' } })} className="input bg-secondary p-1 ml-2 text-light" placeholder={id ? 'Dejar en blanco para no cambiar' : '••••••••'} />
            {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>}
            {!id && <p className="text-xs text-gray-500 mt-1">Debe contener al menos una mayúscula, una minúscula y un número</p>}
          </div>

          <div>
            <label className="label">Tipo de Usuario *</label>
            <select {...register('roleId', { required: 'El tipo de usuario es obligatorio' })} className="input bg-secondary p-1 ml-2 text-light">
              <option value="">Seleccione un rol</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </select>
            {errors.roleId && <p className="text-sm text-red-600 mt-1">{errors.roleId.message}</p>}
          </div>

          <div className="flex space-x-4 pt-4">
            <button type="submit" disabled={loading} className="max-w-40 bg-accent text-primary p-1 flex items-center flex-1">
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
            <button type="button" onClick={() => navigate('/users')} className="btn btn-secondary flex items-center">
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;