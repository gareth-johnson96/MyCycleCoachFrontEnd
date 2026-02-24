import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { register as registerUser, login } from './authApi';
import { useAuth } from './useAuth';
import type { RegisterRequest } from './types';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login: setAuth } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterRequest>();

  async function onSubmit(data: RegisterRequest) {
    setServerError(null);
    try {
      await registerUser(data);
      const authResponse = await login(data);
      setAuth(authResponse);
      navigate('/questionnaire');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setServerError(
        axiosErr.response?.data?.message ?? 'Registration failed. Email may already be in use.'
      );
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>🚴 MyCycleCoach</h1>
          <p style={styles.subtitle}>Create your account to start training</p>
        </div>

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
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'Minimum 8 characters' },
              })}
            />
            {errors.password && <span style={styles.error}>{errors.password.message}</span>}
          </div>

          {serverError && <div style={styles.serverError}>{serverError}</div>}

          <button style={styles.button} type="submit" disabled={isSubmitting}>
            {isSubmitting ? '⏳ Creating account…' : '✨ Create Account'}
          </button>
        </form>

        <p style={styles.link}>
          Already have an account?{' '}
          <Link to="/login" style={styles.linkText}>Sign in</Link>
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
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '1rem',
  },
  card: {
    background: '#fff',
    padding: '2.5rem',
    borderRadius: '12px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
    width: '100%',
    maxWidth: '450px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  title: { 
    margin: '0 0 0.5rem', 
    color: '#111827', 
    fontSize: '2rem',
    fontWeight: 700,
  },
  subtitle: { 
    margin: 0, 
    fontSize: '1rem', 
    color: '#6b7280',
  },
  field: { 
    marginBottom: '1.5rem' 
  },
  label: { 
    display: 'block', 
    marginBottom: '0.5rem', 
    fontWeight: 600, 
    color: '#374151',
    fontSize: '0.95rem',
  },
  input: {
    width: '100%',
    padding: '0.75rem 1rem',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '1rem',
    boxSizing: 'border-box',
    background: '#f9fafb',
    transition: 'border-color 0.2s, background 0.2s',
  },
  error: { 
    color: '#dc2626', 
    fontSize: '0.85rem', 
    marginTop: '0.5rem', 
    display: 'block',
    fontWeight: 500,
  },
  serverError: {
    background: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#dc2626',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    marginBottom: '1.5rem',
    fontWeight: 500,
  },
  button: {
    width: '100%',
    padding: '0.75rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: '0.5rem',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  link: { 
    textAlign: 'center', 
    marginTop: '1.5rem', 
    color: '#6b7280',
    fontSize: '0.95rem',
  },
  linkText: {
    color: '#667eea',
    fontWeight: 600,
    textDecoration: 'none',
  },
};
