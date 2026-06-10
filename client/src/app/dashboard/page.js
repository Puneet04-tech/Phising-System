import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { getToken, clearToken } from '../../lib/auth';

const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function DashboardPage() {
  return <DashboardClient />;
}

function DashboardClient() {
  'use client';

  const router = useRouter();

  const [token, setTokenState] = useState(null);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = getToken();
    if (!t) {
      router.replace('/login');
      return;
    }
    setTokenState(t);
  }, [router]);

  useEffect(() => {
    async function load() {
      if (!token) return;
      try {
        setLoading(true);
        const authHeaders = { Authorization: `Bearer ${token}` };

        const [histRes, statsRes] = await Promise.all([
          axios.get(`${apiBase}/scans/history`, { headers: authHeaders }),
          axios.get(`${apiBase}/scans/stats`, { headers: authHeaders }),
        ]);

        const histBody = histRes.data || {};
        const arr =
          (Array.isArray(histBody.history) && histBody.history) ||
          (Array.isArray(histBody.scans) && histBody.scans) ||
          [];

        setHistory(arr);
        setStats(statsRes.data);
      } catch (e) {
        clearToken();
        router.replace('/login');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [token, router]);

  if (loading) {
    return (
      <main className="container">
        <h1 style={{ fontSize: 24, marginBottom: 12 }}>Dashboard</h1>
        <p>Loading...</p>
      </main>
    );
  }

  return (
    <main className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16 }}>
        <h1 style={{ fontSize: 24, marginBottom: 12 }}>Dashboard</h1>
        <a
          href="/login"
          onClick={(e) => {
            e.preventDefault();
            clearToken();
            router.replace('/login');
          }}
          style={{ color: '#111827', textDecoration: 'underline' }}
        >
          Logout
        </a>
      </div>

      <section className="card" style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, marginBottom: 8 }}>Scan Stats</h2>
        {stats ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 10 }}>
            <div>
              <div style={{ color: '#6b7280', fontSize: 12 }}>Total Scans</div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{stats.totalScans ?? 0}</div>
            </div>
            <div>
              <div style={{ color: '#6b7280', fontSize: 12 }}>Safe</div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{stats.safeCount ?? 0}</div>
            </div>
            <div>
              <div style={{ color: '#6b7280', fontSize: 12 }}>Suspicious</div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{stats.suspiciousCount ?? 0}</div>
            </div>
            <div>
              <div style={{ color: '#6b7280', fontSize: 12 }}>Malicious</div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{stats.maliciousCount ?? 0}</div>
            </div>
          </div>
        ) : (
          <p>No stats yet.</p>
        )}
      </section>

      <section className="card">
        <h2 style={{ fontSize: 18, marginBottom: 8 }}>Scan History</h2>
        {history.length ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left' }}>
                  <th style={{ borderBottom: '1px solid #e5e7eb', padding: '10px 8px' }}>Type</th>
                  <th style={{ borderBottom: '1px solid #e5e7eb', padding: '10px 8px' }}>Content</th>
                  <th style={{ borderBottom: '1px solid #e5e7eb', padding: '10px 8px' }}>Risk %</th>
                  <th style={{ borderBottom: '1px solid #e5e7eb', padding: '10px 8px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h, idx) => (
                  <tr key={h._id || idx}>
                    <td style={{ borderBottom: '1px solid #f3f4f6', padding: '10px 8px' }}>{h.scanType}</td>
                    <td style={{ borderBottom: '1px solid #f3f4f6', padding: '10px 8px' }}>
                      {h.content?.slice(0, 80)}
                    </td>
                    <td style={{ borderBottom: '1px solid #f3f4f6', padding: '10px 8px' }}>
                      {h.result?.riskPercentage ?? '-'}
                    </td>
                    <td style={{ borderBottom: '1px solid #f3f4f6', padding: '10px 8px' }}>
                      {h.result?.threatStatus ?? '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No scan history yet.</p>
        )}
      </section>
    </main>
  );
}
