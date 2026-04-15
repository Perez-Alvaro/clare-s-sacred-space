import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password);
        setMessage('Revisá tu email para confirmar tu cuenta.');
      } else {
        await signIn(email, password);
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'Error de autenticación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'hsl(var(--cream))' }}>
      <div className="w-full max-w-md">
        <Link to="/" className="block text-center text-3xl font-semibold mb-8"
          style={{ fontFamily: 'var(--font-heading)', color: 'hsl(var(--earth))' }}>
          CLARE
        </Link>

        <div className="clare-card">
          <h2 className="text-2xl text-center mb-6" style={{ fontFamily: 'var(--font-heading)', color: 'hsl(var(--earth))' }}>
            {isSignUp ? 'Crear cuenta' : 'Iniciar sesión'}
          </h2>

          {error && <div className="mb-4 p-3 rounded-lg text-sm" style={{ backgroundColor: 'hsla(0,60%,50%,0.1)', color: 'hsl(0,60%,40%)' }}>{error}</div>}
          {message && <div className="mb-4 p-3 rounded-lg text-sm" style={{ backgroundColor: 'hsla(var(--olive),0.1)', color: 'hsl(var(--olive))' }}>{message}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'hsl(var(--earth))' }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full px-4 py-3 rounded-lg border text-sm outline-none"
                style={{ borderColor: 'hsl(var(--sand))', backgroundColor: 'hsl(var(--warm-white))', color: 'hsl(var(--earth))' }} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'hsl(var(--earth))' }}>Contraseña</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6}
                className="w-full px-4 py-3 rounded-lg border text-sm outline-none"
                style={{ borderColor: 'hsl(var(--sand))', backgroundColor: 'hsl(var(--warm-white))', color: 'hsl(var(--earth))' }} />
            </div>
            <button type="submit" disabled={loading} className="clare-btn clare-btn-primary w-full">
              {loading ? 'Cargando...' : isSignUp ? 'Registrarse' : 'Entrar'}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: 'hsl(var(--soft-brown))' }}>
            {isSignUp ? '¿Ya tenés cuenta?' : '¿No tenés cuenta?'}{' '}
            <button onClick={() => { setIsSignUp(!isSignUp); setError(''); setMessage(''); }}
              className="font-medium underline" style={{ color: 'hsl(var(--terracotta))' }}>
              {isSignUp ? 'Iniciar sesión' : 'Registrarse'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
