'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import {
  ShieldCheck, MailWarning, Link as LinkIcon, Settings,
  Zap, Eye, Lock, TrendingUp, ArrowRight, AlertTriangle,
  ShieldAlert, Activity, Sparkles, Globe, ScanSearch,
} from 'lucide-react';
import { getUserRole } from '../lib/auth';

/* ── Animated counter ────────────────────────────────────── */
function Counter({ end, suffix = '', duration = 1800 }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      let start = 0; const step = end / (duration / 16);
      const t = setInterval(() => {
        start += step;
        if (start >= end) { setVal(end); clearInterval(t); }
        else setVal(Math.floor(start));
      }, 16);
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [end, duration]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

/* ── Scan mock terminal ──────────────────────────────────── */
const SCAN_STEPS = [
  { icon: Globe,       text: 'Resolving domain structure…',         status: 'running' },
  { icon: ShieldCheck, text: 'Checking SSL certificate validity…',  status: 'safe' },
  { icon: AlertTriangle,text:'Detecting URL obfuscation patterns…', status: 'warning' },
  { icon: ScanSearch,  text: 'Querying threat intelligence feeds…', status: 'running' },
  { icon: ShieldAlert, text: 'Analyzing redirect chains…',          status: 'safe' },
  { icon: Activity,    text: 'Computing risk score…',               status: 'done' },
];

function ScanTerminal() {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (step >= SCAN_STEPS.length) { setDone(true); return; }
    const t = setTimeout(() => setStep(s => s + 1), 700 + Math.random() * 400);
    return () => clearTimeout(t);
  }, [step]);
  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => { setStep(0); setDone(false); }, 3000);
    return () => clearTimeout(t);
  }, [done]);

  return (
    <div
      className="rounded-2xl overflow-hidden premium-shine"
      style={{
        background: 'linear-gradient(145deg, #0f1120 0%, #0a0d14 100%)',
        border: '1px solid rgba(0, 245, 212,.3)',
        boxShadow: '0 0 0 1px rgba(0, 245, 212,.15), 0 24px 64px rgba(0, 245, 212,.2), 0 0 80px rgba(0, 245, 212,.1), inset 0 1px 0 rgba(255,255,255,.02)',
      }}
    >
      {/* Terminal chrome */}
      <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: '1px solid rgba(0, 245, 212,.15)', background: 'linear-gradient(180deg, rgba(0, 245, 212,.05) 0%, transparent 100%)' }}>
        <div className="w-3 h-3 rounded-full" style={{ background: '#FF0055', boxShadow: '0 0 10px rgba(255, 0, 85,.5)' }} />
        <div className="w-3 h-3 rounded-full" style={{ background: '#FF0055', boxShadow: '0 0 10px rgba(255, 0, 85,.4)', opacity: 0.7 }} />
        <div className="w-3 h-3 rounded-full" style={{ background: '#00F5D4', boxShadow: '0 0 10px rgba(0, 245, 212,.5)' }} />
        <span className="ml-2 text-xs font-mono" style={{ color: 'rgba(0, 245, 212,.5)', textShadow: '0 0 10px rgba(0, 245, 212,.3)' }}>phishguard — scan analysis</span>
      </div>

      {/* Input bar */}
      <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid rgba(0, 245, 212,.1)', background: 'rgba(0, 245, 212,.02)' }}>
        <span style={{ color: '#00F5D4', fontFamily: 'monospace', fontSize: '13px', textShadow: '0 0 10px rgba(0, 245, 212,.5)' }}>$</span>
        <span style={{ color: 'rgba(226, 232, 240,.8)', fontFamily: 'monospace', fontSize: '13px' }}>
          analyze <span style={{ color: '#00F5D4', textShadow: '0 0 10px rgba(0, 245, 212,.5)' }}>https://suspicious-login-verify.com</span>
        </span>
        {!done && <span className="ml-auto text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(0, 245, 212,.15)', color: '#00F5D4', border: '1px solid rgba(0, 245, 212,.3)', boxShadow: '0 0 15px rgba(0, 245, 212,.2)' }}>Scanning…</span>}
        {done && <span className="ml-auto text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(255, 0, 85,.15)', color: '#FF0055', border: '1px solid rgba(255, 0, 85,.3)', boxShadow: '0 0 15px rgba(255, 0, 85,.2)' }}>⚠ PHISHING DETECTED</span>}
      </div>

      {/* Steps */}
      <div className="p-4 space-y-2.5" style={{ minHeight: '220px' }}>
        {SCAN_STEPS.slice(0, step).map((s, i) => (
          <div key={i} className="flex items-center gap-3 anim-fade-up" style={{ animationDuration: '.3s' }}>
            <div className="w-5 h-5 rounded flex items-center justify-center shrink-0"
              style={{ 
                background: s.status === 'safe' ? 'rgba(0, 245, 212,.15)' : s.status === 'warning' ? 'rgba(255, 0, 85,.15)' : 'rgba(0, 245, 212,.1)',
                border: s.status === 'safe' ? '1px solid rgba(0, 245, 212,.3)' : s.status === 'warning' ? '1px solid rgba(255, 0, 85,.3)' : '1px solid rgba(0, 245, 212,.2)',
                boxShadow: s.status === 'safe' ? '0 0 10px rgba(0, 245, 212,.2)' : s.status === 'warning' ? '0 0 10px rgba(255, 0, 85,.2)' : '0 0 10px rgba(0, 245, 212,.1)'
              }}>
              <s.icon className="w-3 h-3" style={{ color: s.status === 'safe' ? '#00F5D4' : s.status === 'warning' ? '#FF0055' : '#00F5D4', textShadow: s.status === 'safe' ? '0 0 10px rgba(0, 245, 212,.5)' : s.status === 'warning' ? '0 0 10px rgba(255, 0, 85,.5)' : '0 0 10px rgba(0, 245, 212,.3)' }} />
            </div>
            <span style={{ fontFamily: 'monospace', fontSize: '12px', color: s.status === 'warning' ? '#FF0055' : 'rgba(226, 232, 240,.7)', textShadow: s.status === 'warning' ? '0 0 10px rgba(255, 0, 85,.3)' : 'none' }}>{s.text}</span>
            <span className="ml-auto" style={{ fontFamily: 'monospace', fontSize: '11px', color: s.status === 'safe' ? '#00F5D4' : s.status === 'warning' ? '#FF0055' : '#00F5D4', textShadow: s.status === 'safe' ? '0 0 10px rgba(0, 245, 212,.5)' : s.status === 'warning' ? '0 0 10px rgba(255, 0, 85,.5)' : '0 0 10px rgba(0, 245, 212,.3)' }}>
              {s.status === 'safe' ? '✓ OK' : s.status === 'warning' ? '⚠ FLAG' : s.status === 'done' ? '94%' : '···'}
            </span>
          </div>
        ))}
        {done && (
          <div className="mt-3 p-3 rounded-xl anim-scale-in" style={{ background: 'linear-gradient(135deg, rgba(255, 0, 85,.12) 0%, rgba(255, 0, 85,.06) 100%)', border: '1px solid rgba(255, 0, 85,.4)', boxShadow: '0 0 30px rgba(255, 0, 85,.25), inset 0 1px 0 rgba(255,255,255,.03)' }}>
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" style={{ color: '#FF0055', textShadow: '0 0 15px rgba(255, 0, 85,.5)' }} />
              <span style={{ color: '#FF0055', fontFamily: 'monospace', fontSize: '12px', fontWeight: 700, textShadow: '0 0 15px rgba(255, 0, 85,.5)' }}>THREAT DETECTED · Risk Score: 94%</span>
            </div>
            <p style={{ color: 'rgba(255, 0, 85,.8)', fontSize: '11px', fontFamily: 'monospace', marginTop: '4px', textShadow: '0 0 10px rgba(255, 0, 85,.3)' }}>
              Credential harvesting site · Impersonating bank portal · DO NOT PROCEED
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function HomePage() {
  const [userRole, setUserRole] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setUserRole(getUserRole()); setMounted(true); }, []);

  const features = [
    {
      icon: LinkIcon, title: 'URL Scanner',
      desc: 'Checks HTTPS validity, structural anomalies, domain age, redirect chains, and real-time blacklist matching.',
      gradient: 'linear-gradient(135deg,#00F5D4,#00D4AA)',
      glow: 'rgb(0 245 212 / .3)',
    },
    {
      icon: MailWarning, title: 'Email Analyzer',
      desc: 'Detects urgency patterns, credential requests, lookalike domains, and phishing vocabulary using hybrid NLP rules.',
      gradient: 'linear-gradient(135deg,#FF0055,#CC0044)',
      glow: 'rgb(255 0 85 / .3)',
    },
    {
      icon: ShieldCheck, title: 'Threat Reports',
      desc: 'Generates detailed risk breakdowns with attack vectors, flagged keywords, and concrete recommendations.',
      gradient: 'linear-gradient(135deg,#00F5D4,#00D4AA)',
      glow: 'rgb(0 245 212 / .3)',
    },
  ];

  const stats = [
    { value: 99.7, suffix: '%', label: 'Detection Accuracy', color: '#00F5D4' },
    { value: 2,    suffix: 's',  label: 'Avg. Scan Time',    color: '#FF0055' },
    { value: 3,    suffix: '',   label: 'Threat Levels',     color: '#00F5D4' },
    { value: 2,    suffix: '',   label: 'Security APIs',     color: '#FF0055' },
  ];

  const steps = [
    { n:'01', title:'Submit',   desc:'Paste a URL or email content — no sign-up needed to try.' },
    { n:'02', title:'Analyze',  desc:'Dual-engine: regex rules + real-time API queries run in parallel.' },
    { n:'03', title:'Score',    desc:'Aggregated risk percentage with Safe / Suspicious / Malicious label.' },
    { n:'04', title:'Report',   desc:'Download a full breakdown of attack vectors and recommendations.' },
  ];

  return (
    <div style={{ background: 'transparent' }}>
      {/* ═══════════════════════════ HERO ═══════════════════════════ */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        {/* Premium Dot grid */}
        <div className="dot-grid absolute inset-0 opacity-30 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, rgba(0, 245, 212,.15) 1px, transparent 1px)' }} />
        
        {/* Red Glow Overlay */}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 85% 15%, rgba(255, 0, 85,.2) 0%, transparent 50%)',
            filter: 'blur(80px)',
            animation: 'premium-float 10s ease-in-out infinite'
          }}
        />
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 15% 85%, rgba(255, 0, 85,.15) 0%, transparent 50%)',
            filter: 'blur(100px)',
            animation: 'premium-float 12s ease-in-out infinite reverse'
          }}
        />

        <div className="container mx-auto px-6 max-w-7xl relative z-10 py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left — Copy */}
            <div className={`space-y-8 ${mounted ? 'anim-fade-up' : 'opacity-0'}`}>
              <div className="section-tag" style={{ background: 'rgba(0, 245, 212,.08)', borderColor: 'rgba(0, 245, 212,.2)', color: 'rgba(226, 232, 240,.6)' }}>
                <Sparkles className="w-3 h-3" style={{ color: '#00F5D4' }} /> AI-Powered Cybersecurity
              </div>

              <div>
                <h1 className="display mb-5" style={{ color: '#E2E8F0' }}>
                  Detect{' '}
                  <span className="grad-text" style={{ color: '#00F5D4' }}>Phishing</span>
                  <br />
                  Before It{' '}
                  <span style={{ position:'relative', display:'inline-block' }}>
                    Strikes
                    <svg viewBox="0 0 200 12" style={{ position:'absolute', bottom:'-6px', left:0, right:0, width:'100%', height:'12px' }}>
                      <path d="M2 8 C50 2, 150 2, 198 8" stroke="url(#u)" strokeWidth="3" fill="none" strokeLinecap="round"/>
                      <defs><linearGradient id="u" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#00F5D4"/><stop offset="100%" stopColor="#00D4AA"/></linearGradient></defs>
                    </svg>
                  </span>
                </h1>
                <p className="text-lg leading-relaxed max-w-lg" style={{ color: 'rgba(226, 232, 240,.65)' }}>
                  Instantly analyze URLs and email content with our hybrid AI engine.
                  Get a risk score, threat classification, and actionable report in seconds.
                </p>
              </div>

              <div className={`flex flex-wrap gap-3 ${mounted ? 'anim-fade-up d-200' : 'opacity-0'}`}>
                <Link href="/signup" id="hero-cta" className="btn-primary" style={{ 
                  height:'48px', 
                  padding:'0 1.75rem', 
                  fontSize:'.9rem', 
                  borderRadius:'14px', 
                  background:'linear-gradient(135deg, #00F5D4 0%, #00D4AA 50%, #00F5D4 100%)',
                  backgroundSize: '200% 200%',
                  color:'#080B10', 
                  boxShadow:'0 0 50px rgba(0, 245, 212,.5), 0 0 100px rgba(0, 245, 212,.2), inset 0 1px 0 rgba(255,255,255,.4)',
                  animation: 'shimmer-premium 3s linear infinite'
                }}>
                  <Zap className="w-4 h-4 mr-2" style={{ color:'#080B10' }} /> Start Scanning Free
                </Link>
                <Link href="/dashboard" id="hero-demo" className="btn-outline" style={{ 
                  height:'48px', 
                  padding:'0 1.5rem', 
                  fontSize:'.9rem', 
                  borderRadius:'14px', 
                  background:'linear-gradient(145deg, rgba(0, 245, 212,.1) 0%, rgba(0, 245, 212,.05) 100%)',
                  border:'1px solid rgba(0, 245, 212,.4)', 
                  color:'#00F5D4',
                  boxShadow:'0 0 30px rgba(0, 245, 212,.15), inset 0 1px 0 rgba(255,255,255,.03)'
                }}>
                  <Eye className="w-4 h-4 mr-2" style={{ color:'#00F5D4' }} /> Try Dashboard
                </Link>
                {userRole === 'admin' && (
                  <Link href="/admin" className="btn-ghost" style={{ 
                    height:'48px', 
                    padding:'0 1.25rem', 
                    background:'linear-gradient(145deg, rgba(0, 245, 212,.1) 0%, rgba(0, 245, 212,.05) 100%)',
                    border:'1px solid rgba(0, 245, 212,.3)', 
                    color:'#00F5D4',
                    boxShadow:'0 0 20px rgba(0, 245, 212,.1)'
                  }}>
                    <Settings className="w-4 h-4 mr-1.5" style={{ color:'#00F5D4' }} /> Admin
                  </Link>
                )}
              </div>

              {/* Mini social proof */}
              <div className={`flex items-center gap-6 ${mounted ? 'anim-fade-up d-400' : 'opacity-0'}`}>
                {[
                  { val: '99.7%', lbl: 'accuracy' },
                  { val: '< 2s',  lbl: 'per scan' },
                  { val: 'SAFE',  lbl: 'to use' },
                ].map(({ val, lbl }) => (
                  <div key={lbl}>
                    <div className="text-base font-bold" style={{ color: '#00F5D4' }}>{val}</div>
                    <div className="text-xs" style={{ color: 'rgba(226, 232, 240,.5)' }}>{lbl}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Scan Terminal */}
            <div className={`${mounted ? 'anim-fade-up d-200' : 'opacity-0'}`}>
              <ScanTerminal />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════ STATS ══════════════════════════ */}
      <section className="relative">
        {/* Red Glow Overlay */}
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 50% 50%, rgba(255, 0, 85,.15) 0%, transparent 60%)',
            filter: 'blur(60px)'
          }}
        />
        <div className="container mx-auto px-6 max-w-5xl py-10 relative z-10">
          <div 
            className="rounded-2xl p-8 relative overflow-hidden"
            style={{ 
              background: 'linear-gradient(135deg, rgba(17, 22, 34, 0.95) 0%, rgba(8, 11, 16, 0.98) 100%)', 
              border: '2px solid rgba(0, 245, 212,.3)', 
              boxShadow: `
                0 0 40px rgba(0, 245, 212,.2),
                0 0 80px rgba(0, 245, 212,.1),
                0 0 120px rgba(0, 245, 212,.05),
                inset 0 0 60px rgba(0, 245, 212,.05)
              `
            }}
          >
            {/* Premium Glow Effect */}
            <div 
              className="absolute inset-0 opacity-30"
              style={{
                background: 'radial-gradient(circle at 30% 30%, rgba(0, 245, 212,.4) 0%, transparent 50%)',
                filter: 'blur(20px)'
              }}
            />
            <div 
              className="absolute inset-0 opacity-20"
              style={{
                background: 'radial-gradient(circle at 70% 70%, rgba(255, 0, 85,.3) 0%, transparent 50%)',
                filter: 'blur(25px)'
              }}
            />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((s, i) => (
                <div key={i} className="flex flex-col items-center text-center">
                  <div className="text-4xl font-black tracking-tight" style={{ color: '#00F5D4' }}>
                    <Counter end={s.value} suffix={s.suffix} />
                  </div>
                  <div className="text-sm mt-1 font-medium" style={{ color: 'rgba(226, 232, 240,.5)' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════ FEATURES ═══════════════════════ */}
      <section className="py-24 md:py-32 relative">
        {/* Red Glow Overlay */}
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 75% 25%, rgba(255, 0, 85,.12) 0%, transparent 50%)',
            filter: 'blur(70px)'
          }}
        />
        <div className="container mx-auto px-6 max-w-6xl relative z-10">
          <div className="text-center mb-16 space-y-4">
            <div className="section-tag mx-auto" style={{ width:'fit-content', background: 'rgba(0, 245, 212,.08)', borderColor: 'rgba(0, 245, 212,.2)', color: 'rgba(226, 232, 240,.6)' }}>
              <Zap className="w-3 h-3" style={{ color: '#00F5D4' }} /> What we detect
            </div>
            <h2 className="display-sm" style={{ color: '#E2E8F0' }}>
              Multi-layer<br/><span className="grad-text" style={{ color: '#00F5D4' }}>threat analysis</span>
            </h2>
            <p className="max-w-md mx-auto text-base leading-relaxed" style={{ color: 'rgba(226, 232, 240,.65)' }}>
              Every scan runs through our dual-engine pipeline — catching what single-check tools miss.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {features.map((f, i) => (
              <div 
                key={i} 
                className="rounded-2xl p-8 hover:scale-105 transition-all duration-300 group cursor-default relative overflow-hidden"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(17, 22, 34, 0.95) 0%, rgba(8, 11, 16, 0.98) 100%)', 
                  border: '2px solid rgba(0, 245, 212,.3)', 
                  boxShadow: `
                    0 0 40px rgba(0, 245, 212,.2),
                    0 0 80px rgba(0, 245, 212,.1),
                    0 0 120px rgba(0, 245, 212,.05),
                    inset 0 0 60px rgba(0, 245, 212,.05)
                  `
                }}
              >
                {/* Premium Glow Effect */}
                <div 
                  className="absolute inset-0 opacity-30 group-hover:opacity-50 transition-opacity duration-500"
                  style={{
                    background: 'radial-gradient(circle at 30% 30%, rgba(0, 245, 212,.4) 0%, transparent 50%)',
                    filter: 'blur(20px)'
                  }}
                />
                <div 
                  className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-500"
                  style={{
                    background: 'radial-gradient(circle at 70% 70%, rgba(255, 0, 85,.3) 0%, transparent 50%)',
                    filter: 'blur(25px)'
                  }}
                />
                
                <div className="relative z-10">
                  <div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110"
                    style={{ 
                      background: 'rgba(0, 245, 212,.15)', 
                      border: '1px solid rgba(0, 245, 212,.3)', 
                      boxShadow: `0 0 30px rgba(0, 245, 212,.2), 0 0 60px rgba(0, 245, 212,.1)` 
                    }}
                  >
                    <f.icon className="w-7 h-7" style={{ color: '#00F5D4' }} />
                  </div>
                  <h3 className="text-xl font-bold mb-3" style={{ color: '#E2E8F0' }}>{f.title}</h3>
                  <p className="text-sm leading-relaxed mb-5" style={{ color: 'rgba(226, 232, 240,.65)' }}>{f.desc}</p>
                  <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm font-semibold transition-all group-hover:gap-2.5" style={{ color: '#00F5D4' }}>
                    Try it <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════ HOW IT WORKS ═══════════════════ */}
      <section className="py-24 md:py-32 relative">
        {/* Red Glow Overlay */}
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 25% 75%, rgba(255, 0, 85,.12) 0%, transparent 50%)',
            filter: 'blur(70px)'
          }}
        />
        <div className="container mx-auto px-6 max-w-5xl relative z-10">
          <div className="text-center mb-16 space-y-4">
            <div className="section-tag mx-auto" style={{ width:'fit-content', background: 'rgba(0, 245, 212,.08)', borderColor: 'rgba(0, 245, 212,.2)', color: 'rgba(226, 232, 240,.6)' }}>
              <TrendingUp className="w-3 h-3" style={{ color: '#00F5D4' }} /> How it works
            </div>
            <h2 className="display-sm" style={{ color: '#E2E8F0' }}>
              Input to report<br/><span className="grad-text" style={{ color: '#00F5D4' }}>in 4 steps</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {steps.map((s, i) => (
              <div 
                key={i} 
                className="relative rounded-2xl p-6 hover:scale-105 transition-all duration-300 group overflow-hidden"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(17, 22, 34, 0.95) 0%, rgba(8, 11, 16, 0.98) 100%)', 
                  border: '2px solid rgba(0, 245, 212,.3)', 
                  boxShadow: `
                    0 0 40px rgba(0, 245, 212,.2),
                    0 0 80px rgba(0, 245, 212,.1),
                    0 0 120px rgba(0, 245, 212,.05),
                    inset 0 0 60px rgba(0, 245, 212,.05)
                  `
                }}
              >
                {/* Premium Glow Effect */}
                <div 
                  className="absolute inset-0 opacity-30 group-hover:opacity-50 transition-opacity duration-500"
                  style={{
                    background: 'radial-gradient(circle at 30% 30%, rgba(0, 245, 212,.4) 0%, transparent 50%)',
                    filter: 'blur(20px)'
                  }}
                />
                <div 
                  className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-500"
                  style={{
                    background: 'radial-gradient(circle at 70% 70%, rgba(255, 0, 85,.3) 0%, transparent 50%)',
                    filter: 'blur(25px)'
                  }}
                />
                
                <div className="relative z-10">
                  <div
                    className="text-5xl font-black mb-4 leading-none"
                    style={{ background: 'linear-gradient(135deg,#00F5D4,#00D4AA)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}
                  >
                    {s.n}
                  </div>
                  <h3 className="font-bold text-base mb-2" style={{ color: '#E2E8F0' }}>{s.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(226, 232, 240,.65)' }}>{s.desc}</p>
                  {i < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-6 z-10" style={{ color: 'rgba(0, 245, 212,.3)' }}>→</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════ CTA ════════════════════════════ */}
      <section className="py-24 md:py-28 relative">
        <div className="container mx-auto px-6 max-w-4xl">
          <div
            className="relative rounded-3xl overflow-hidden p-12 md:p-20 text-center"
            style={{ background: '#111622', border: '1px solid rgba(0, 245, 212,.3)', boxShadow:'0 0 40px rgba(0, 245, 212,.15)' }}
          >
            {/* Grid overlay */}
            <div className="dot-grid absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage:'radial-gradient(circle,rgba(0, 245, 212,.2) 1px,transparent 1px)' }} />

            {/* Floating icons */}
            <div className="absolute top-8 left-8 anim-float" style={{ animationDelay:'.5s' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background:'rgba(0, 245, 212,.15)', border:'1px solid rgba(0, 245, 212,.3)', boxShadow:'0 0 20px rgba(0, 245, 212,.3)' }}>
                <ShieldCheck className="w-5 h-5" style={{ color: '#00F5D4' }} />
              </div>
            </div>
            <div className="absolute top-12 right-12 anim-float" style={{ animationDelay:'1.2s' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background:'rgba(0, 245, 212,.15)', border:'1px solid rgba(0, 245, 212,.3)', boxShadow:'0 0 20px rgba(0, 245, 212,.3)' }}>
                <Lock className="w-4 h-4" style={{ color: '#00F5D4' }} />
              </div>
            </div>
            <div className="absolute bottom-10 left-16 anim-float" style={{ animationDelay:'.8s' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:'rgba(255, 0, 85,.15)', border:'1px solid rgba(255, 0, 85,.3)', boxShadow:'0 0 20px rgba(255, 0, 85,.3)' }}>
                <ShieldAlert className="w-4 h-4" style={{ color: '#FF0055' }} />
              </div>
            </div>

            <div className="relative z-10 space-y-6">
              <div className="section-tag mx-auto" style={{ width:'fit-content', background:'rgba(0, 245, 212,.15)', borderColor:'rgba(0, 245, 212,.3)', color:'#00F5D4' }}>
                <Sparkles className="w-3 h-3" style={{ color: '#00F5D4' }} /> Stay Protected
              </div>
              <h2 className="display-sm" style={{ color: '#E2E8F0' }}>
                Start protecting<br/>yourself today
              </h2>
              <p className="text-base max-w-sm mx-auto leading-relaxed" style={{ color:'rgba(226, 232, 240,.65)' }}>
                Free to use. No credit card. Full phishing detection suite available instantly.
              </p>
              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <Link href="/signup" id="cta-signup" className="btn-primary" style={{ background:'linear-gradient(135deg, #00F5D4 0%, #00D4AA 100%)', color:'#080B10', height:'50px', padding:'0 2rem', fontSize:'.95rem', borderRadius:'14px', boxShadow:'0 0 30px rgba(0, 245, 212,.4)' }}>
                  Create Free Account <ArrowRight className="w-4 h-4 ml-2" style={{ color:'#080B10' }} />
                </Link>
                <Link href="/login" id="cta-login" className="btn-outline" style={{ background:'rgba(0, 245, 212,.1)', borderColor:'rgba(0, 245, 212,.3)', color:'#00F5D4', height:'50px', padding:'0 1.75rem', borderRadius:'14px' }}>
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
