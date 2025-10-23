import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { login, getCaptcha, clearError } from '../../redux/slices/authSlice';
import { Lock, Mail, RefreshCw } from 'lucide-react';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, captcha, isAuthenticated } = useSelector((state) => state.auth);
  const [showError, setShowError] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue } = useForm();

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

// catcha
useEffect(() => {
  dispatch(getCaptcha())
    .then(res => console.log('getCaptcha succesful'))
    .catch(err => console.error('dispatch error:', err));
}, [dispatch]);

  // log captcha when it changes (useful while debugging)
  useEffect(() => {
    if (captcha) {
      // console.log("Captcha loaded:", captcha); // remove later
    }
  }, [captcha]);

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
    const result = await dispatch(login({
      email: data.email,
      password: data.password,
      captchaId: captcha.captchaId,
      captchaAnswer: data.captchaAnswer
    }));

    if (login.rejected.match(result)) {
      handleRefreshCaptcha();
    }
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-light mb-2">Sistema Bancario</h1>
          <p className="text-light/90">Gestión de Productos Financieros</p>
        </div>

        <div className="bg-secondary rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-light mb-6 text-center">
            Iniciar Sesión
          </h2>

          {showError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label text-gray-400">
                <Mail className="inline w-4 h-4 mr-1" />
                Correo
              </label>
              <input
                type="email"
                {...register('email', {
                  required: 'El correo electrónico es obligatorio',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Correo electrónico inválido'
                  }
                })}
                className="input ml-2 bg-primary text-light p-1 "
                placeholder="ejemplo@banco.com"
              />
              {errors.email && (
                <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="label text-gray-400">
                <Lock className="inline w-4 h-4 mr-1" />
                Contraseña
              </label>
              <input
                type="password"
                {...register('password', {
                  required: 'La contraseña es obligatoria',
                  minLength: {
                    value: 6,
                    message: 'La contraseña debe tener al menos 6 caracteres'
                  }
                })}
                className="input ml-2 bg-primary text-light p-1"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="label text-gray-400">Verificación de Seguridad</label>
              <div className="flex items-center space-x-2 mb-2">
                <div className="flex-1 bg-primary text-light p-3 rounded-lg text-center font-mono text-lg">
                  {captcha?.question || 'Cargando...'}
                </div>
                <button
                  type="button"
                  onClick={handleRefreshCaptcha}
                  className="p-3 bg-primary hover:bg-gray-500 text-light rounded-lg transition-colors"
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
                className="input ml-2 bg-primary text-light p-1"
                placeholder="Ingrese la respuesta"
              />
              {errors.captchaAnswer && (
                <p className="text-sm text-red-600 mt-1">{errors.captchaAnswer.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !captcha}
              className="w-full bg-accent text-primary py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
            <div className="mt-4">
              <p className="text-light text-center">
                ¿No tienes una cuenta?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/register')}
                  className="text-accent font-semibold hover:underline"
                >
                  Regístrate aquí
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;