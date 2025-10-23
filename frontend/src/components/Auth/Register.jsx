import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser, getCaptcha, clearError } from '../../redux/slices/authSlice';
import { Lock, Mail, User, RefreshCw } from 'lucide-react';

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, captcha, isAuthenticated } = useSelector((state) => state.auth);
  const [showError, setShowError] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    dispatch(getCaptcha());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      setShowError(true);
      const timer = setTimeout(() => {
        setShowError(false);
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const handleRefreshCaptcha = () => {
    dispatch(getCaptcha());
    setValue('captchaAnswer', '');
  };

  const onSubmit = async (data) => {
    if (!captcha) return;

    const result = await dispatch(registerUser({
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role,
      captchaId: captcha.captchaId,
      captchaAnswer: data.captchaAnswer
    }));

    if (registerUser.rejected.match(result)) {
      handleRefreshCaptcha();
    }
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-light mb-2">Crear Cuenta</h1>
          <p className="text-gray-400">Regístrate en el sistema</p>
        </div>

        <div className="bg-secondary text-light rounded-2xl shadow-2xl p-8">
          {showError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <div>
              <label className="label">
                <User className="inline w-4 h-4 mr-1" />
                Nombre
              </label>
              <input
                type="text"
                {...register('name', { 
                  required: 'El nombre es obligatorio',
                  maxLength: { value: 50, message: 'Máximo 50 caracteres' }
                })}
                className="input bg-primary p-1 ml-2 text-light"
                placeholder="Juan Pérez"
              />
              {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="label">
                <Mail className="inline w-4 h-4 mr-1" />
                Correo Electrónico
              </label>
              <input
                type="email"
                {...register('email', {
                  required: 'El correo es obligatorio',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Correo inválido'
                  },
                  maxLength: { value: 50, message: 'Máximo 50 caracteres' }
                })}
                className="input bg-primary p-1 ml-2 text-light"
                placeholder="ejemplo@correo.com"
              />
              {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="label">
                <Lock className="inline w-4 h-4 mr-1" />
                Contraseña
              </label>
              <input
                type="password"
                {...register('password', {
                  required: 'La contraseña es obligatoria',
                  minLength: { value: 6, message: 'Mínimo 6 caracteres' },
                  maxLength: { value: 20, message: 'Máximo 20 caracteres' },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                    message: 'Debe contener mayúscula, minúscula y número'
                  }
                })}
                className="input bg-primary p-1 ml-2 text-light"
                placeholder="••••••••"
              />
              {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>}
              <p className="text-xs text-gray-400 mt-1">Debe contener mayúscula, minúscula y número</p>
            </div>

            {/* Role select, default Asesor */}
            <div className='hidden'>
              <label className="label">Tipo de Usuario</label>
              <select
                {...register('role', { required: 'El tipo de usuario es obligatorio' })}
                className="input bg-primary p-1 ml-2 text-light"
                defaultValue="Asesor"
              >
                <option value="Asesor">Asesor</option>
                <option value="Administrador">Administrador</option>
              </select>
              {errors.role && <p className="text-sm text-red-600 mt-1">{errors.role.message}</p>}
            </div>

            {/* Captcha */}
            <div>
              <label className="label">Verificación de Seguridad</label>
              <div className="flex items-center space-x-2 mb-2">
                <div className="flex-1 bg-primary p-3 rounded-lg text-center font-mono text-lg">
                  {captcha?.question || 'Cargando...'}
                </div>
                <button
                  type="button"
                  onClick={handleRefreshCaptcha}
                  className="p-3 bg-primary hover:bg-primary/80 rounded-lg transition-colors"
                  title="Actualizar captcha"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
              <input
                type="number"
                {...register('captchaAnswer', { 
                  required: 'La respuesta del captcha es obligatoria' 
                })}
                className="input bg-primary p-1 ml-2 text-light"
                placeholder="Ingrese la respuesta"
              />
              {errors.captchaAnswer && <p className="text-sm text-red-600 mt-1">{errors.captchaAnswer.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading || !captcha}
              className="w-full bg-accent text-primary py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Registrando...' : 'Registrarse'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-300">
            ¿Ya tienes una cuenta?{' '}
            <Link to="/login" className="text-accent hover:text-accent/80 font-medium">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;