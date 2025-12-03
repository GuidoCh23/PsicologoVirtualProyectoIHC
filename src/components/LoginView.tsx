import { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { useTranslation } from '../TranslationContext';
import logoEmoSense from '../images/LogoEmoSense.png';

export function LoginView() {
  const { t, language } = useTranslation();
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const success = await login(formData.email, formData.password);
        if (!success) {
          setError(language === 'es' ? 'Email o contraseña incorrectos' : 'Incorrect email or password');
        }
      } else {
        if (!formData.nombre.trim()) {
          setError(language === 'es' ? 'Por favor ingresa tu nombre' : 'Please enter your name');
          setLoading(false);
          return;
        }
        if (formData.password.length < 6) {
          setError(language === 'es' ? 'La contraseña debe tener al menos 6 caracteres' : 'Password must be at least 6 characters');
          setLoading(false);
          return;
        }
        const success = await register(formData.nombre, formData.email, formData.password);
        if (!success) {
          setError(language === 'es' ? 'Este email ya está registrado' : 'This email is already registered');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({ nombre: '', email: '', password: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-blue-500 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Welcome */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img
              src={logoEmoSense}
              alt="EmoSense Logo"
              className="w-32 h-auto object-contain drop-shadow-2xl"
            />
          </div>
          <h1 className="text-4xl text-white mb-2">
            {language === 'es' ? 'Bienvenido a' : 'Welcome to'}
          </h1>
          <h2 className="text-5xl text-white mb-3">EmoSense</h2>
          <p className="text-white/90 text-lg">
            {language === 'es'
              ? 'Tu asistente de inteligencia emocional'
              : 'Your emotional intelligence assistant'}
          </p>
        </div>

        {/* Login/Register Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8">
          <div className="flex gap-2 mb-6 bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 rounded-lg transition-all ${
                isLogin
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {language === 'es' ? 'Iniciar Sesión' : 'Login'}
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 rounded-lg transition-all ${
                !isLogin
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {language === 'es' ? 'Registrarse' : 'Sign Up'}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'es' ? 'Nombre completo' : 'Full name'}
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  placeholder={language === 'es' ? 'Ingresa tu nombre' : 'Enter your name'}
                  required={!isLogin}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'es' ? 'Correo electrónico' : 'Email'}
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                placeholder={language === 'es' ? 'tu@email.com' : 'you@email.com'}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'es' ? 'Contraseña' : 'Password'}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  placeholder={language === 'es' ? 'Mínimo 6 caracteres' : 'Minimum 6 characters'}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? (language === 'es' ? 'Cargando...' : 'Loading...')
                : isLogin
                  ? (language === 'es' ? 'Iniciar Sesión' : 'Login')
                  : (language === 'es' ? 'Crear Cuenta' : 'Create Account')
              }
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            {isLogin ? (
              <p>
                {language === 'es' ? '¿No tienes una cuenta?' : "Don't have an account?"}{' '}
                <button onClick={toggleMode} className="text-purple-600 hover:text-purple-700 font-medium">
                  {language === 'es' ? 'Regístrate aquí' : 'Sign up here'}
                </button>
              </p>
            ) : (
              <p>
                {language === 'es' ? '¿Ya tienes una cuenta?' : 'Already have an account?'}{' '}
                <button onClick={toggleMode} className="text-purple-600 hover:text-purple-700 font-medium">
                  {language === 'es' ? 'Inicia sesión' : 'Login'}
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-white/80 text-sm mt-6">
          {language === 'es'
            ? 'Tus datos están seguros y encriptados'
            : 'Your data is safe and encrypted'}
        </p>
      </div>
    </div>
  );
}
