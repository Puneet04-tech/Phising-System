"use client";

import { useRouter } from 'next/navigation';
import { apiPost } from '../../lib/api';
import { setToken, clearToken } from '../../lib/auth';

export default function LoginPage() {
  // Next app router client component
  return <LoginClient />;
}

function LoginClient() {
  'use client';

  const router = useRouter();

  async function onSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const email = form.email.value;
    const password = form.password.value;

    clearToken();

    try {
      const data = await apiPost('/auth/login', { email, password });
      if (data?.token) setToken(data.token);
      router.push('/dashboard');
    } catch (err) {
      alert(err?.response?.data?.message || 'Login failed');
    }
  }

  return (
    <main className="container">
      <h1 style={{ fontSize: 24, marginBottom: 12 }}>Login</h1>

      <form onSubmit={onSubmit} style={{ maxWidth: 420 }}>
        <label>
          Email
          <input name="email" type="email" required />
        </label>

        <label style={{ display: 'block', marginTop: 12 }}>
          Password
          <input name="password" type="password" required />
        </label>

        <button type="submit">Login</button>

        <p style={{ marginTop: 12, color: '#6b7280' }}>
          Don&apos;t have an account? <a href="/signup">Sign up</a>
        </p>
      </form>
    </main>
  );
}
