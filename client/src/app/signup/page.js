'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiPost } from '../../lib/api';
import { setToken, clearToken } from '../../lib/auth';
import {
  ShieldCheck, User, Mail, Lock, ArrowRight,
  Loader2, AlertCircle, CheckCircle2, Sparkles, ShieldAlert,
} from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    const { name: { value: name }, email: { value: email }, password: { value: password } } = e.target;
    clearToken();
    try {
      const data = await apiPost('/auth/signup', { name, email, password });
      if (data?.token) setToken(data.token);
      router.push('/dashboard');
    } catch (err) {
      setError(err?.response?.data?.message || 'Signup failed. Please try again.');
    } finally { setLoading(false); }
  }

  const benefits = [
    'Scan unlimited URLs for phishing threats',
    'Email content analysis with keyword detection',
    'Personal scan history & threat reports',
    'Visual analytics dashboard with charts',
  ];

  const fields = [
    { id:'signup-name',     name:'name',     type:'text',     icon:User,  ph:'John Doe',         ac:'name',         label:'Full Name' },
    { id:'signup-email',    name:'email',    type:'email',    icon:Mail,  ph:'you@example.com',  ac:'email',        label:'Email address' },
    { id:'signup-password', name:'password', type:'password', icon:Lock,  ph:'Create a strong password', ac:'new-password', label:'Password' },
  ];

  return (
    <div className="min-h-screen flex" style={{ background: 'transparent' }}>

      {/* ── Left Form Panel ────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[420px]">

          {/* Mobile logo */}
          <div className="lg:hidden mb-8 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background:'rgba(0, 245, 212,.15)', border:'1px solid rgba(0, 245, 212,.3)', boxShadow:'0 0 20px rgba(0, 245, 212,.3)' }}>
              <ShieldCheck className="w-4 h-4" style={{ color: '#00F5D4' }} strokeWidth={2.2} />
            </div>
            <span className="text-lg font-bold" style={{ color:'#E2E8F0' }}>Phish<span style={{ color:'#00F5D4' }}>Guard</span></span>
          </div>

          {/* Header */}
          <div className="mb-8 anim-fade-up">
            <div className="mb-4 w-11 h-11 rounded-2xl flex items-center justify-center"
              style={{ background:'rgba(0, 245, 212,.15)', border:'1px solid rgba(0, 245, 212,.3)', boxShadow:'0 0 30px rgba(0, 245, 212,.2)' }}>
              <ShieldAlert className="w-5 h-5" style={{ color: '#00F5D4' }} />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-2" style={{ color:'#E2E8F0', letterSpacing:'-0.03em' }}>
              Create account
            </h1>
            <p className="text-sm" style={{ color:'rgba(226, 232, 240,.6)' }}>
              Already have one?{' '}
              <Link href="/login" style={{ color:'#00F5D4', fontWeight:600 }}>Sign in →</Link>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-4 anim-fade-up d-100">
            {fields.map(({ id, name, type, icon: Icon, ph, ac, label }) => (
              <div key={id}>
                <label htmlFor={id} className="block text-sm font-semibold mb-1.5" style={{ color:'#E2E8F0' }}>{label}</label>
                <div className="relative">
                  <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors"
                    style={{ color: focused === name ? '#00F5D4' : 'rgba(226, 232, 240,.4)' }} />
                  <input id={id} name={name} type={type} required autoComplete={ac} placeholder={ph}
                    className="inp"
                    style={{ background: '#111622', border: '1px solid rgba(0, 245, 212,.2)', color: '#E2E8F0' }}
                    onFocus={() => setFocused(name)}
                    onBlur={() => setFocused('')}
                  />
                </div>
              </div>
            ))}

            {error && (
              <div className="flex items-start gap-3 rounded-xl p-3.5 text-sm anim-scale-in"
                style={{ background:'rgba(255, 0, 85,.1)', border:'1px solid rgba(255, 0, 85,.3)', color:'#FF0055', boxShadow:'0 0 20px rgba(255, 0, 85,.2)' }}>
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button id="signup-submit" type="submit" disabled={loading}
              className="btn-primary w-full mt-2"
              style={{ height:'50px', borderRadius:'14px', fontSize:'.95rem', fontWeight:700, background:'linear-gradient(135deg, #00F5D4 0%, #00D4AA 100%)', color:'#080B10', boxShadow:'0 0 30px rgba(0, 245, 212,.4)' }}>
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin mr-2" style={{ color:'#080B10' }} /> Creating account…</>
                : <><span>Create Free Account</span><ArrowRight className="w-4 h-4 ml-2" style={{ color:'#080B10' }} /></>
              }
            </button>

            <p className="text-xs text-center" style={{ color:'rgba(226, 232, 240,.5)' }}>
              By signing up you agree to our{' '}
              <span style={{ color:'#00F5D4', cursor:'pointer' }}>Terms</span> &amp;{' '}
              <span style={{ color:'#00F5D4', cursor:'pointer' }}>Privacy Policy</span>.
            </p>
          </form>
        </div>
      </div>

      {/* ── Right Benefits Panel ────────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-[45%] flex-col justify-between p-14 relative overflow-hidden"
        style={{ background: '#111622' }}
      >
        {/* Dot grid */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage:'radial-gradient(circle,rgba(0, 245, 212,.08) 1px,transparent 1px)',
          backgroundSize:'28px 28px', opacity:.4
        }} />

        {/* Animated rings */}
        <div className="absolute" style={{ top:'40%', left:'55%', transform:'translate(-50%,-50%)', pointerEvents:'none' }}>
          {[180,280,380].map((size,i) => (
            <div key={i} className="absolute rounded-full border"
              style={{ width:size, height:size, top:'50%', left:'50%', transform:'translate(-50%,-50%)',
                borderColor:`rgba(0, 245, 212,${.14 - i*.04})`,
                animation:`spin ${18+i*7}s linear infinite ${i%2?'':'reverse'}` }}>
              <div className="absolute w-2 h-2 rounded-full top-0 left-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{ background:`rgba(0, 245, 212,${.6-i*.2})` }} />
            </div>
          ))}
        </div>

        {/* Glow */}
        <div className="absolute pointer-events-none" style={{ bottom:'25%', right:'15%', width:'280px', height:'280px',
          background:'radial-gradient(circle,rgba(0, 245, 212,.15) 0%,transparent 70%)', filter:'blur(35px)' }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background:'rgba(0, 245, 212,.15)', backdropFilter:'blur(8px)', border:'1px solid rgba(0, 245, 212,.3)', boxShadow:'0 0 20px rgba(0, 245, 212,.3)' }}>
            <ShieldCheck className="w-4.5 h-4.5" style={{ color: '#00F5D4' }} strokeWidth={2.2} />
          </div>
          <span className="text-lg font-bold tracking-tight" style={{ color: '#E2E8F0' }}>PhishGuard</span>
        </div>

        {/* Content */}
        <div className="relative z-10 space-y-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight leading-tight mb-3" style={{ color: '#E2E8F0' }}>
              Everything you need<br/>to stay safe online
            </h2>
            <p className="text-base leading-relaxed" style={{ color:'rgba(226, 232, 240,.65)' }}>
              Get free access to our full suite of phishing detection tools.
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-3">
            {benefits.map((b, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background:'rgba(0, 245, 212,.2)', boxShadow:'0 0 10px rgba(0, 245, 212,.3)' }}>
                  <CheckCircle2 className="w-3.5 h-3.5" style={{ color: '#00F5D4' }} />
                </div>
                <span className="text-sm leading-relaxed" style={{ color:'rgba(226, 232, 240,.8)' }}>{b}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 section-tag" style={{ width:'fit-content', background:'rgba(0, 245, 212,.08)', borderColor:'rgba(0, 245, 212,.2)', color:'rgba(226, 232, 240,.6)', fontSize:'.65rem' }}>
          <Sparkles className="w-3 h-3" style={{ color: '#00F5D4' }} /> Free to use · No credit card
        </div>
      </div>
    </div>
  );
}
