'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ShieldCheck, LayoutDashboard, LogOut, ChevronDown } from 'lucide-react';
import { getToken, clearToken, getUserRole } from '../../lib/auth';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!getToken());
    setUserRole(getUserRole());
  }, [pathname]);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  function handleLogout() {
    clearToken(); setIsLoggedIn(false); setUserRole(null);
    router.replace('/login');
  }

  const isAppPage = pathname.startsWith('/dashboard') || pathname.startsWith('/admin');

  return (
    <header
      className="sticky top-0 z-50 w-full transition-all duration-500"
      style={{
        background: scrolled 
          ? 'linear-gradient(180deg, rgba(8, 11, 16,.98) 0%, rgba(8, 11, 16,.95) 100%)' 
          : 'linear-gradient(180deg, rgba(8, 11, 16,.9) 0%, rgba(8, 11, 16,.85) 100%)',
        backdropFilter: 'blur(32px)',
        WebkitBackdropFilter: 'blur(32px)',
        borderBottom: scrolled 
          ? '1px solid rgba(0, 245, 212,.4)' 
          : '1px solid rgba(0, 245, 212,.2)',
        boxShadow: scrolled 
          ? '0 4px 30px rgba(0, 245, 212,.2), 0 0 60px rgba(0, 245, 212,.1), inset 0 1px 0 rgba(255,255,255,.03)' 
          : '0 2px 20px rgba(0, 245, 212,.1), inset 0 1px 0 rgba(255,255,255,.02)',
        overflow: 'hidden',
      }}
    >
      {/* Premium Animated Cloud Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-12 -left-24 w-56 h-56 rounded-full blur-3xl" style={{ 
          background: 'radial-gradient(circle, rgba(0, 245, 212,.15) 0%, transparent 70%)',
          animation: 'premium-float 6s ease-in-out infinite'
        }}></div>
        <div className="absolute -top-10 right-1/4 w-48 h-48 rounded-full blur-3xl" style={{ 
          background: 'radial-gradient(circle, rgba(255, 0, 85,.12) 0%, transparent 70%)',
          animation: 'premium-float 8s ease-in-out infinite',
          animationDelay: '1s'
        }}></div>
        <div className="absolute -top-14 right-8 w-44 h-44 rounded-full blur-3xl" style={{ 
          background: 'radial-gradient(circle, rgba(0, 245, 212,.12) 0%, transparent 70%)',
          animation: 'premium-float 7s ease-in-out infinite',
          animationDelay: '2s'
        }}></div>
        <div className="absolute top-2 left-1/3 w-40 h-40 rounded-full blur-3xl" style={{ 
          background: 'radial-gradient(circle, rgba(0, 245, 212,.1) 0%, transparent 70%)',
          animation: 'premium-float 5s ease-in-out infinite',
          animationDelay: '0.5s'
        }}></div>
        <div className="absolute top-6 right-1/2 w-36 h-36 rounded-full blur-3xl" style={{ 
          background: 'radial-gradient(circle, rgba(255, 0, 85,.08) 0%, transparent 70%)',
          animation: 'premium-float 9s ease-in-out infinite',
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
        background: 'linear-gradient(180deg, rgba(0, 245, 212,.03) 0%, transparent 100%)',
        opacity: scrolled ? 0.5 : 0.3
      }}></div>

      <div className="container mx-auto px-6 h-16 flex items-center justify-between relative" style={{ maxWidth:'80rem' }}>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
            style={{ 
              background:'linear-gradient(135deg,#00F5D4 0%,#00D4AA 50%,#00F5D4 100%)',
              backgroundSize: '200% 200%',
              boxShadow:'0 0 30px rgba(0, 245, 212,.5), 0 0 60px rgba(0, 245, 212,.2), inset 0 1px 0 rgba(255,255,255,.4)',
              animation: 'shimmer-premium 3s linear infinite'
            }}
          >
            <ShieldCheck className="w-4.5 h-4.5" style={{ color:'#080B10' }} strokeWidth={2.5} />
          </div>
          <span className="text-[1.1rem] font-bold tracking-tight transition-all duration-300 group-hover:tracking-wide" style={{ color:'#E2E8F0' }}>
            Phish<span style={{ color:'#00F5D4', textShadow: '0 0 20px rgba(0, 245, 212,.5)' }}>Guard</span>
          </span>
        </Link>

        {/* Center nav — hidden on app pages */}
        {!isAppPage && (
          <nav className="hidden md:flex items-center gap-0.5">
            {[{ href:'/', label:'Home' }].map(({ href, label }) => {
              const active = pathname === href;
              return (
                <Link key={href} href={href}
                  className="btn-ghost"
                  style={{ color: active ? '#00F5D4' : 'rgba(226, 232, 240,.6)', background: active ? 'rgba(0, 245, 212,.15)' : 'transparent', fontWeight: active ? 600 : 500 }}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        )}

        {/* Right controls */}
        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <>
              {!isAppPage && (
                <Link href="/dashboard" id="nav-dashboard" className="btn-ghost hidden sm:inline-flex" style={{ gap:'6px', color:'#00F5D4', fontWeight:600 }}>
                  <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
                </Link>
              )}
              {userRole === 'admin' && !isAppPage && (
                <Link href="/admin" className="btn-ghost hidden sm:inline-flex" style={{ color:'#00F5D4', fontWeight:600 }}>
                  Admin
                </Link>
              )}
              <button
                id="nav-logout"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-105"
                style={{ 
                  background:'linear-gradient(135deg, rgba(255, 0, 85,.15) 0%, rgba(255, 0, 85,.1) 100%)',
                  color:'#FF0055',
                  border:'1.5px solid rgba(255, 0, 85,.4)',
                  boxShadow:'0 0 20px rgba(255, 0, 85,.2), inset 0 1px 0 rgba(255,255,255,.05)'
                }}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link href="/login" id="nav-login" className="btn-ghost" style={{ color:'rgba(226, 232, 240,.6)' }}>
                Sign in
              </Link>
              <Link
                href="/signup"
                id="nav-signup"
                className="btn-primary"
                style={{ 
                  height:'38px', 
                  padding:'0 1.1rem', 
                  borderRadius:'10px', 
                  fontSize:'.84rem',
                  background:'linear-gradient(135deg, #00F5D4 0%, #00D4AA 50%, #00F5D4 100%)',
                  backgroundSize: '200% 200%',
                  color:'#080B10', 
                  boxShadow:'0 0 40px rgba(0, 245, 212,.5), 0 0 80px rgba(0, 245, 212,.2), inset 0 1px 0 rgba(255,255,255,.4)',
                  animation: 'shimmer-premium 3s linear infinite'
                }}
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
