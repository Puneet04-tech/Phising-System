"use client";

import { useRouter } from 'next/navigation';
import { apiPost } from '../../lib/api';
import { setToken, clearToken } from '../../lib/auth';

export default function SignupPage() {
  return <SignupClient />;
}

function SignupClient() {
  'use client';

  const router = useRouter();

  async function onSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const name = form.name.value;
    const email = form.email.value;
    const password = form.password.value;

    clearToken();

    try {
      const data = await apiPost('/auth/signup', { name, email, password });
      if (data?.token) setToken(data.token);
      router.push('/dashboard');
    } catch (err) {
      alert(err?.response?.data?.message || 'Signup failed');
    }
  }

  return (
    <main className="container">
      <h1 style={{ fontSize: 24, marginBottom: 12 }}>Sign up</h1>

      <form onSubmit={onSubmit} style={{ maxWidth: 420 }}>
        <label>
          Name
          <input name="name" type="text" required />
        </label>

        <label style={{ display: 'block', marginTop: 12 }}>
          Email
          <input name="email" type="email" required />
        </label>

        <label style={{ display: 'block', marginTop: 12 }}>
          Password
          <input name="password" type="password" required />
        </label>

        <button type="submit">Create account</button>

        <p style={{ marginTop: 12, color: '#6b7280' }}>
          Already have an account? <a href="/login">Login</a>
        </p>
      </form>
    </main>
  );
}
