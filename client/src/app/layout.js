import './globals.css';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import Navbar from './components/Navbar';

export const metadata = {
  title: 'PhishGuard — AI Phishing Detection Platform',
  description: 'Instantly identify whether a URL, email, or text message is safe or a potential phishing attempt using AI-powered threat detection.',

};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans antialiased flex flex-col" style={{ position: 'relative' }}>

        {/* Glowing Wave Background */}
        <div className="fixed inset-0 pointer-events-none z-0">
          {/* Star Field */}
          <div className="absolute inset-0" style={{ background: '#080B10' }}>
            {[...Array(100)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: Math.random() * 3 + 1 + 'px',
                  height: Math.random() * 3 + 1 + 'px',
                  top: Math.random() * 100 + '%',
                  left: Math.random() * 100 + '%',
                  background: Math.random() > 0.5 ? '#00F5D4' : '#FF0055',
                  opacity: Math.random() * 0.5 + 0.2,
                  animation: `pulse-glow ${Math.random() * 3 + 2}s ease-in-out infinite`,
                  animationDelay: Math.random() * 2 + 's',
                  boxShadow: `0 0 ${Math.random() * 10 + 5}px ${Math.random() > 0.5 ? 'rgba(0, 245, 212,.5)' : 'rgba(255, 0, 85,.5)'}`
                }}
              />
            ))}
          </div>
          
          {/* Red Glow Overlay */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              background: 'radial-gradient(ellipse at 80% 20%, rgba(255, 0, 85,.15) 0%, transparent 50%)',
              filter: 'blur(60px)',
              animation: 'premium-float 8s ease-in-out infinite'
            }}
          />
          <div 
            className="absolute inset-0 opacity-15"
            style={{
              background: 'radial-gradient(ellipse at 20% 80%, rgba(255, 0, 85,.12) 0%, transparent 50%)',
              filter: 'blur(80px)',
              animation: 'premium-float 10s ease-in-out infinite reverse'
            }}
          />
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              background: 'radial-gradient(ellipse at 50% 50%, rgba(255, 0, 85,.08) 0%, transparent 60%)',
              filter: 'blur(100px)',
              animation: 'wave-pulse 6s ease-in-out infinite'
            }}
          />
          
          {/* Wave 1 - Full Screen */}
          <svg className="absolute top-0 left-0 w-full h-full" style={{ opacity: 0.6 }} viewBox="0 0 1440 900" preserveAspectRatio="none">
            <defs>
              <linearGradient id="wave1-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#00F5D4', stopOpacity: 0.4 }} />
                <stop offset="50%" style={{ stopColor: '#00D4AA', stopOpacity: 0.3 }} />
                <stop offset="100%" style={{ stopColor: '#FF0055', stopOpacity: 0.35 }} />
              </linearGradient>
              <filter id="wave1-glow">
                <feGaussianBlur stdDeviation="40" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <path 
              fill="url(#wave1-grad)" 
              filter="url(#wave1-glow)"
              style={{ animation: 'wave-flow 25s ease-in-out infinite, wave-glow 10s ease-in-out infinite' }}
              d="M0,450 C240,350 480,550 720,450 C960,350 1200,550 1440,450 L1440,900 L0,900 Z"
            />
          </svg>

          {/* Wave 2 - Full Screen */}
          <svg className="absolute top-0 left-0 w-full h-full" style={{ opacity: 0.5 }} viewBox="0 0 1440 900" preserveAspectRatio="none">
            <defs>
              <linearGradient id="wave2-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#FF0055', stopOpacity: 0.4 }} />
                <stop offset="50%" style={{ stopColor: '#00F5D4', stopOpacity: 0.3 }} />
                <stop offset="100%" style={{ stopColor: '#FF0055', stopOpacity: 0.35 }} />
              </linearGradient>
              <filter id="wave2-glow">
                <feGaussianBlur stdDeviation="45" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <path 
              fill="url(#wave2-grad)" 
              filter="url(#wave2-glow)"
              style={{ animation: 'wave-flow 30s ease-in-out infinite reverse, wave-glow 12s ease-in-out infinite', animationDelay: '2s' }}
              d="M0,400 C360,300 720,500 1080,400 C1260,350 1380,400 1440,400 L1440,900 L0,900 Z"
            />
          </svg>

          {/* Wave 3 - Full Screen */}
          <svg className="absolute top-0 left-0 w-full h-full" style={{ opacity: 0.55 }} viewBox="0 0 1440 900" preserveAspectRatio="none">
            <defs>
              <linearGradient id="wave3-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#00F5D4', stopOpacity: 0.35 }} />
                <stop offset="50%" style={{ stopColor: '#FF0055', stopOpacity: 0.38 }} />
                <stop offset="100%" style={{ stopColor: '#00F5D4', stopOpacity: 0.25 }} />
              </linearGradient>
              <filter id="wave3-glow">
                <feGaussianBlur stdDeviation="50" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <path 
              fill="url(#wave3-grad)" 
              filter="url(#wave3-glow)"
              style={{ animation: 'wave-flow 35s ease-in-out infinite, wave-glow 14s ease-in-out infinite', animationDelay: '4s' }}
              d="M0,475 C300,375 600,575 900,475 C1200,375 1380,475 1440,475 L1440,900 L0,900 Z"
            />
          </svg>

          {/* Wave 4 - Full Screen */}
          <svg className="absolute top-0 left-0 w-full h-full" style={{ opacity: 0.45 }} viewBox="0 0 1440 900" preserveAspectRatio="none">
            <defs>
              <linearGradient id="wave4-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#FF0055', stopOpacity: 0.4 }} />
                <stop offset="50%" style={{ stopColor: '#00D4AA', stopOpacity: 0.3 }} />
                <stop offset="100%" style={{ stopColor: '#FF0055', stopOpacity: 0.35 }} />
              </linearGradient>
              <filter id="wave4-glow">
                <feGaussianBlur stdDeviation="42" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <path 
              fill="url(#wave4-grad)" 
              filter="url(#wave4-glow)"
              style={{ animation: 'wave-flow 28s ease-in-out infinite, wave-pulse 8s ease-in-out infinite', animationDelay: '1s' }}
              d="M0,425 C240,325 480,525 720,425 C960,325 1200,525 1440,425 L1440,900 L0,900 Z"
            />
          </svg>

          {/* Wave 5 - Full Screen */}
          <svg className="absolute top-0 left-0 w-full h-full" style={{ opacity: 0.4 }} viewBox="0 0 1440 900" preserveAspectRatio="none">
            <defs>
              <linearGradient id="wave5-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#FF0055', stopOpacity: 0.42 }} />
                <stop offset="50%" style={{ stopColor: '#00F5D4', stopOpacity: 0.3 }} />
                <stop offset="100%" style={{ stopColor: '#FF0055', stopOpacity: 0.38 }} />
              </linearGradient>
              <filter id="wave5-glow">
                <feGaussianBlur stdDeviation="48" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <path 
              fill="url(#wave5-grad)" 
              filter="url(#wave5-glow)"
              style={{ animation: 'wave-flow 32s ease-in-out infinite reverse, wave-pulse 9s ease-in-out infinite', animationDelay: '3s' }}
              d="M0,380 C360,280 720,480 1080,380 C1260,330 1380,380 1440,380 L1440,900 L0,900 Z"
            />
          </svg>
        </div>

        <Navbar />

        {/* ── Page Content ──────────────────────────────────────── */}
        <main className="flex-1 relative z-10">
          {children}
        </main>

        {/* ── Footer ────────────────────────────────────────────── */}
        <footer style={{ 
          background: 'linear-gradient(180deg, #111622 0%, #0d111a 100%)', 
          borderTop: '1px solid rgba(0, 245, 212,.3)', 
          overflow: 'hidden', 
          position: 'relative',
          boxShadow: '0 -4px 30px rgba(0, 245, 212,.1), inset 0 1px 0 rgba(255,255,255,.02)'
        }}>
          {/* Premium Animated Cloud Blobs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -bottom-12 -left-24 w-56 h-56 rounded-full blur-3xl" style={{ 
              background: 'radial-gradient(circle, rgba(0, 245, 212,.12) 0%, transparent 70%)',
              animation: 'premium-float 7s ease-in-out infinite'
            }}></div>
            <div className="absolute -bottom-10 right-1/4 w-48 h-48 rounded-full blur-3xl" style={{ 
              background: 'radial-gradient(circle, rgba(255, 0, 85,.1) 0%, transparent 70%)',
              animation: 'premium-float 9s ease-in-out infinite',
              animationDelay: '1s'
            }}></div>
            <div className="absolute -bottom-14 right-8 w-44 h-44 rounded-full blur-3xl" style={{ 
              background: 'radial-gradient(circle, rgba(0, 245, 212,.1) 0%, transparent 70%)',
              animation: 'premium-float 8s ease-in-out infinite',
              animationDelay: '2s'
            }}></div>
            <div className="absolute bottom-2 left-1/3 w-40 h-40 rounded-full blur-3xl" style={{ 
              background: 'radial-gradient(circle, rgba(0, 245, 212,.08) 0%, transparent 70%)',
              animation: 'premium-float 6s ease-in-out infinite',
              animationDelay: '0.5s'
            }}></div>
            <div className="absolute bottom-6 right-1/2 w-36 h-36 rounded-full blur-3xl" style={{ 
              background: 'radial-gradient(circle, rgba(255, 0, 85,.06) 0%, transparent 70%)',
              animation: 'premium-float 10s ease-in-out infinite',
              animationDelay: '1.5s'
            }}></div>
          </div>

          {/* Premium Ribbon Effect */}
          <div className="absolute top-0 left-0 right-0 h-1.5 overflow-hidden">
            <div className="absolute inset-0" style={{
              background: 'linear-gradient(90deg, transparent, #00F5D4, #00D4AA, #FF0055, #00F5D4, transparent)',
              backgroundSize: '300% 100%',
              animation: 'ribbon-flow 4s linear infinite',
              filter: 'blur(0.5px)'
            }}></div>
          </div>

          {/* Subtle inner glow */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'linear-gradient(180deg, rgba(0, 245, 212,.02) 0%, transparent 100%)'
          }}></div>

          <div className="container mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-3 relative" style={{ maxWidth: '80rem' }}>
            <div className="flex items-center gap-2.5 group">
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
                style={{ 
                  background: 'linear-gradient(135deg, #00F5D4 0%, #00D4AA 50%, #00F5D4 100%)',
                  backgroundSize: '200% 200%',
                  boxShadow: '0 0 25px rgba(0, 245, 212,.4), 0 0 50px rgba(0, 245, 212,.15), inset 0 1px 0 rgba(255,255,255,.3)',
                  animation: 'shimmer-premium 3s linear infinite'
                }}
              >
                <ShieldCheck className="w-3.5 h-3.5" style={{ color: '#080B10' }} strokeWidth={2.5} />
              </div>
              <span className="text-sm font-semibold transition-all duration-300 group-hover:tracking-wide" style={{ 
                color: '#E2E8F0',
                textShadow: '0 0 15px rgba(0, 245, 212,.3)'
              }}>PhishGuard</span>
            </div>
            <p className="text-xs" style={{ 
              color: 'rgba(226, 232, 240,.5)',
              textShadow: '0 0 10px rgba(0, 245, 212,.1)'
            }}>
              © 2024 PhishGuard · AI-powered phishing detection platform
            </p>
          </div>
        </footer>

      </body>
    </html>
  );
}
