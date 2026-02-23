import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { login } from './authApi';
import { useAuth } from './useAuth';
import type { LoginRequest } from './types';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login: setAuth } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginRequest>();

  async function onSubmit(data: LoginRequest) {
    setServerError(null);
    try {
      const response = await login(data);
      setAuth(response);
      navigate('/training');
    } catch {
      setServerError('Invalid email or password.');
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>MyCycleCoach</h1>
        <h2 style={styles.subtitle}>Sign In</h2>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              type="email"
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' },
              })}
            />
            {errors.email && <span style={styles.error}>{errors.email.message}</span>}
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              {...register('password', { required: 'Password is required' })}
            />
            {errors.password && <span style={styles.error}>{errors.password.message}</span>}
          </div>

          {serverError && <div style={styles.serverError}>{serverError}</div>}

          <button style={styles.button} type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p style={styles.link}>
          No account?{' '}
          <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f0f4f8',
  },
  card: {
    background: '#fff',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '400px',
  },
  title: { margin: '0 0 0.25rem', color: '#1a56db', fontSize: '1.5rem' },
  subtitle: { margin: '0 0 1.5rem', fontSize: '1.1rem', color: '#374151' },
  field: { marginBottom: '1rem' },
  label: { display: 'block', marginBottom: '0.25rem', fontWeight: 500, color: '#374151' },
  input: {
    width: '100%',
    padding: '0.5rem 0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '1rem',
    boxSizing: 'border-box',
  },
  error: { color: '#dc2626', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' },
  serverError: {
    background: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#dc2626',
    padding: '0.75rem',
    borderRadius: '4px',
    marginBottom: '1rem',
  },
  button: {
    width: '100%',
    padding: '0.65rem',
    background: '#1a56db',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: 'pointer',
    marginTop: '0.5rem',
  },
  link: { textAlign: 'center', marginTop: '1rem', color: '#6b7280' },
};
