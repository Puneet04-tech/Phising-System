import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="container">
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>AI Phishing Detection Platform 🛡️</h1>
      <p style={{ color: '#4b5563' }}>
        Check whether a URL or message is safe. This is a beginner-friendly platform that uses security
        checks (rule-based + external security APIs) and stores your scan history.
      </p>

      <div style={{ display: 'grid', gap: 12, marginTop: 18, maxWidth: 360 }}>
        <Link href="/login" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ cursor: 'pointer' }}>
            Login
          </div>
        </Link>
        <Link href="/signup" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ cursor: 'pointer' }}>
            Sign up
          </div>
        </Link>
        <Link href="/dashboard" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ cursor: 'pointer' }}>
            Go to Dashboard
          </div>
        </Link>
      </div>
    </main>
  );
}
