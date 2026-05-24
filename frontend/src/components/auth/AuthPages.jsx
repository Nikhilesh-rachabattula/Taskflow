import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button, FormField } from '../UI';
import styles from './Auth.module.css';

function AuthLayout({ title, subtitle, children }) {
  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        <div className={styles.authBrand}>
          <span className={styles.authBrandIcon}>⬡</span>
          <span className={styles.authBrandName}>TaskFlow</span>
        </div>
        <h1 className={styles.authTitle}>{title}</h1>
        <p className={styles.authSubtitle}>{subtitle}</p>
        {children}
      </div>
    </div>
  );
}

export function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your workspace">
      <form className={styles.authForm} onSubmit={handleSubmit}>
        {error && <div className={styles.authError}>{error}</div>}
        <FormField label="Email">
          <input
            type="email" placeholder="you@example.com" required
            value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          />
        </FormField>
        <FormField label="Password">
          <input
            type="password" placeholder="••••••••" required
            value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
          />
        </FormField>
        <Button type="submit" size="lg" loading={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
          Sign In
        </Button>
        <p className={styles.authSwitch}>
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signup(form.name, form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create account" subtitle="Start managing tasks with your team">
      <form className={styles.authForm} onSubmit={handleSubmit}>
        {error && <div className={styles.authError}>{error}</div>}
        <FormField label="Full Name">
          <input
            type="text" placeholder="Your name" required
            value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          />
        </FormField>
        <FormField label="Email">
          <input
            type="email" placeholder="you@example.com" required
            value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          />
        </FormField>
        <FormField label="Password">
          <input
            type="password" placeholder="Min. 6 characters" required minLength={6}
            value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
          />
        </FormField>
        <Button type="submit" size="lg" loading={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
          Create Account
        </Button>
        <p className={styles.authSwitch}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
