'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { getToken, clearToken, getUserRole } from '../../lib/auth';
import {
  ShieldAlert, ShieldCheck, Mail, Link as LinkIcon,
  RefreshCcw, Loader2, Settings, FileText, TrendingUp, AlertTriangle, Activity,
  Zap, Globe, ScanSearch, Eye, Lock, Sparkles, ArrowRight, CheckCircle2,
  Clock, BarChart3, Users, Target, Shield, Flame, Waves, Crown
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area,
} from 'recharts';

const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const COLORS = {
  primary: '#00F5D4',
  secondary: '#00D4AA',
  accent: '#00F5D4',
  success: '#00F5D4',
  warning: '#FF0055',
  danger: '#FF0055',
  dark: '#080B10',
  light: '#E2E8F0',
};

const GRADIENTS = {
  primary: 'linear-gradient(135deg, #00F5D4 0%, #00D4AA 100%)',
  success: 'linear-gradient(135deg, #00F5D4 0%, #00D4AA 100%)',
  warning: 'linear-gradient(135deg, #FF0055 0%, #CC0044 100%)',
  danger: 'linear-gradient(135deg, #FF0055 0%, #CC0044 100%)',
  dark: 'linear-gradient(135deg, #080B10 0%, #111622 100%)',
  glass: 'linear-gradient(135deg, rgba(0, 245, 212, 0.1) 0%, rgba(0, 245, 212, 0.05) 100%)',
};

function ThreatBadge({ status }) {
  const s = (status || '').toLowerCase();
  const config = {
    safe: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30', icon: ShieldCheck, label: 'Safe', glow: '0 0 10px rgba(0, 245, 212,.3)' },
    suspicious: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30', icon: AlertTriangle, label: 'Suspicious', glow: '0 0 10px rgba(255, 0, 85,.3)' },
    malicious: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30', icon: ShieldAlert, label: 'Malicious', glow: '0 0 10px rgba(255, 0, 85,.3)' },
  };
  const c = config[s] || { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/30', icon: ShieldCheck, label: status || '—', glow: 'none' };
  const Icon = c.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${c.bg} ${c.text} ${c.border}`} style={{ boxShadow: c.glow }}>
      <Icon className="w-3.5 h-3.5" /> {c.label}
    </span>
  );
}

function StatCard({ label, value, icon: Icon, color, gradient, delay }) {
  const isRedCard = color === '#FF0055' || color === COLORS.danger;
  
  return (
    <div 
      className="relative overflow-hidden rounded-2xl transition-all duration-300 group hover:scale-105"
      style={{ 
        background: 'linear-gradient(135deg, rgba(17, 22, 34, 0.95) 0%, rgba(8, 11, 16, 0.98) 100%)', 
        border: `2px solid ${isRedCard ? 'rgba(255, 0, 85,.4)' : 'rgba(0, 245, 212,.3)'}`, 
        boxShadow: isRedCard ? `
          0 0 40px rgba(255, 0, 85,.25),
          0 0 80px rgba(255, 0, 85,.15),
          0 0 120px rgba(255, 0, 85,.08),
          inset 0 0 60px rgba(255, 0, 85,.08)
        ` : `
          0 0 40px rgba(0, 245, 212,.2),
          0 0 80px rgba(0, 245, 212,.1),
          0 0 120px rgba(0, 245, 212,.05),
          inset 0 0 60px rgba(0, 245, 212,.05)
        `,
        animation: `fadeInUp 0.6s ease-out ${delay}s both`
      }}
    >
      {/* Premium Glow Effect */}
      <div 
        className="absolute inset-0 opacity-30 group-hover:opacity-50 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${isRedCard ? 'rgba(255, 0, 85,.5)' : color + '40'} 0%, transparent 50%)`,
          filter: 'blur(20px)'
        }}
      />
      <div 
        className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at 70% 70%, ${isRedCard ? 'rgba(255, 0, 85,.4)' : color + '30'} 0%, transparent 50%)`,
          filter: 'blur(25px)'
        }}
      />
      
      {/* Animated Glow Ring */}
      <div 
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `conic-gradient(from 0deg, transparent, ${isRedCard ? 'rgba(255, 0, 85,.7)' : color + '60'}, transparent)`,
          animation: 'spin 3s linear infinite',
          filter: 'blur(8px)'
        }}
      />
      
      {/* Inner Glow */}
      <div 
        className="absolute inset-0 rounded-2xl opacity-40"
        style={{
          background: `radial-gradient(circle at center, ${isRedCard ? 'rgba(255, 0, 85,.3)' : color + '20'} 0%, transparent 70%)`,
          filter: 'blur(15px)'
        }}
      />
      
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10 group-hover:opacity-30 transition-opacity">
        <Icon className="w-full h-full" style={{ color: color }} />
      </div>
      <div className="relative p-6">
        <div className="flex items-start justify-between mb-4">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
            style={{ 
              background: gradient, 
              boxShadow: isRedCard ? `
                0 0 30px rgba(255, 0, 85,.6),
                0 0 60px rgba(255, 0, 85,.4),
                0 0 90px rgba(255, 0, 85,.25),
                inset 0 0 20px rgba(255, 0, 85,.35)
              ` : `
                0 0 30px rgba(0, 245, 212,.5),
                0 0 60px rgba(0, 245, 212,.3),
                0 0 90px rgba(0, 245, 212,.2),
                inset 0 0 20px rgba(0, 245, 212,.3)
              `
            }}
          >
            <Icon className="w-6 h-6" style={{ color: '#080B10' }} />
          </div>
          <div className="flex items-center gap-1 text-xs font-medium" style={{ color: 'rgba(226, 232, 240,.4)' }}>
            <Clock className="w-3 h-3" />
            <span>Last 7 days</span>
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium" style={{ color: 'rgba(226, 232, 240,.5)' }}>{label}</p>
          <p 
            className="text-3xl font-bold transition-all duration-300 group-hover:scale-110"
            style={{ 
              color: color,
              textShadow: isRedCard ? `0 0 20px rgba(255, 0, 85,.9), 0 0 40px rgba(255, 0, 85,.7)` : `0 0 20px ${color}80, 0 0 40px ${color}60`
            }}
          >
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [token, setTokenState] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [showReports, setShowReports] = useState(false);
  const [activeTab, setActiveTab] = useState('url');
  const [scanInput, setScanInput] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    const t = getToken();
    if (!t) { router.replace('/login'); return; }
    setTokenState(t);
    setUserRole(getUserRole());
  }, [router]);

  async function loadData() {
    if (!token) return;
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };
      const [histRes, statsRes] = await Promise.all([
        axios.get(`${apiBase}/scans/history`, { headers }),
        axios.get(`${apiBase}/scans/stats`, { headers }),
      ]);
      const body = histRes.data || {};
      setHistory((Array.isArray(body.history) && body.history) || (Array.isArray(body.scans) && body.scans) || []);
      setStats(statsRes.data);
    } catch (e) {
      if (e.response?.status === 401) { clearToken(); router.replace('/login'); }
    } finally { setLoading(false); }
  }

  async function loadReports() {
    if (!token) return;
    try {
      const res = await axios.get(`${apiBase}/reports/my-reports`, { headers: { Authorization: `Bearer ${token}` } });
      setReports(res.data.reports || []);
    } catch {}
  }

  async function generateReport(scanId) {
    if (!token) return;
    try {
      const scan = history.find(h => h._id === scanId);
      if (!scan) return;

      // Generate detailed report content
      const reportContent = generateDetailedReport(scan);
      
      // Create and download the report
      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `phishguard-report-${scan.scanType}-${new Date().toISOString().slice(0,10)}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Also save to backend
      await axios.post(`${apiBase}/reports`, {
        reportType: scan.scanType === 'url' ? 'url' : 'email',
        details: { scanId: scan._id, content: scan.content, result: scan.result, flaggedKeywords: scan.flaggedKeywords, createdAt: scan.createdAt }
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      alert('Report downloaded successfully!');
      loadReports();
    } catch { alert('Failed to generate report'); }
  }

  async function generateReportForCurrentScan() {
    if (!token || !scanResult) return;
    try {
      // Create a temporary scan object from current scan result
      const tempScan = {
        _id: `temp-${Date.now()}`,
        scanType: activeTab,
        content: scanInput,
        result: scanResult.result,
        flaggedKeywords: scanResult.flaggedKeywords || [],
        createdAt: new Date().toISOString()
      };

      // Generate detailed report content
      const reportContent = generateDetailedReport(tempScan);
      
      // Create and download the report
      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `phishguard-report-${activeTab}-${new Date().toISOString().slice(0,10)}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Save to backend
      await axios.post(`${apiBase}/reports`, {
        reportType: activeTab === 'url' ? 'url' : 'email',
        details: { 
          scanId: tempScan._id, 
          content: tempScan.content, 
          result: tempScan.result, 
          flaggedKeywords: tempScan.flaggedKeywords, 
          createdAt: tempScan.createdAt 
        }
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      alert('Report downloaded successfully!');
      loadReports();
    } catch { alert('Failed to generate report'); }
  }

  async function downloadReport(report) {
    try {
      // Reconstruct scan object from report details
      const scan = {
        _id: report.details?.scanId || report._id,
        scanType: report.reportType,
        content: report.details?.content || '',
        result: report.details?.result || {},
        flaggedKeywords: report.details?.flaggedKeywords || [],
        createdAt: report.details?.createdAt || report.createdAt
      };

      // Generate detailed report content
      const reportContent = generateDetailedReport(scan);
      
      // Create and download the report
      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `phishguard-report-${report.reportType}-${new Date(report.createdAt).toISOString().slice(0,10)}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch { alert('Failed to download report'); }
  }

  function viewReport(report) {
    // Reconstruct scan object from report details
    const scan = {
      _id: report.details?.scanId || report._id,
      scanType: report.reportType,
      content: report.details?.content || '',
      result: report.details?.result || {},
      flaggedKeywords: report.details?.flaggedKeywords || [],
      createdAt: report.details?.createdAt || report.createdAt
    };
    
    setSelectedReport(scan);
    setShowReportModal(true);
  }

  function viewCurrentReport() {
    if (!scanResult) return;
    const tempScan = {
      _id: `temp-${Date.now()}`,
      scanType: activeTab,
      content: scanInput,
      result: scanResult.result,
      flaggedKeywords: scanResult.flaggedKeywords || [],
      createdAt: new Date().toISOString()
    };
    setSelectedReport(tempScan);
    setShowReportModal(true);
    
    // Also save to backend reports
    axios.post(`${apiBase}/reports`, {
      reportType: activeTab === 'url' ? 'url' : 'email',
      details: { 
        scanId: tempScan._id, 
        content: tempScan.content, 
        result: tempScan.result, 
        flaggedKeywords: tempScan.flaggedKeywords, 
        createdAt: tempScan.createdAt 
      }
    }, { headers: { Authorization: `Bearer ${token}` } }).then(() => {
      loadReports();
    }).catch(() => {});
  }

  function generateDetailedReport(scan) {
    const timestamp = new Date(scan.createdAt).toLocaleString();
    const riskScore = scan.result?.riskPercentage ?? 0;
    const threatStatus = scan.result?.threatStatus ?? 'Unknown';
    const recommendation = scan.result?.recommendation ?? 'No recommendation available';
    const flaggedKeywords = scan.flaggedKeywords || [];
    const content = scan.content || '';
    const scanType = scan.scanType || 'Unknown';
    const keywordCategories = scan.keywordCategories || [];
    const severityCounts = scan.severityCounts || {};
    const externalApiUsed = scan.externalApiUsed || false;
    const primarySource = scan.primarySource || 'keyword-only';
    const usedFallbackKeywords = scan.usedFallbackKeywords;

    let report = `
╔══════════════════════════════════════════════════════════════════════════════╗
║                          PHISHGUARD SECURITY REPORT                              ║
║                         AI-Powered Phishing Detection                             ║
╚══════════════════════════════════════════════════════════════════════════════╝

═════════════════════════════════════════════════════════════════════════════════
                                REPORT SUMMARY
═════════════════════════════════════════════════════════════════════════════════

Report ID: ${scan._id}
Generated: ${timestamp}
Scan Type: ${scanType.toUpperCase()}
Risk Score: ${riskScore}%
Threat Status: ${threatStatus.toUpperCase()}

═════════════════════════════════════════════════════════════════════════════════
                           DETECTION METHODOLOGY
═════════════════════════════════════════════════════════════════════════════════

External APIs Used: ${externalApiUsed ? 'YES' : 'NO (Keyword Analysis Only)'}
Primary Detection Source: ${primarySource === 'virustotal' ? 'VirusTotal (70+ Security Engines)' : primarySource === 'google-safe-browsing' ? 'Google Safe Browsing' : 'Advanced Keyword Analysis'}
Database Keywords: ${usedFallbackKeywords ? 'FALLBACK MODE (Hardcoded)' : 'ACTIVE (Database-Driven)'}

═════════════════════════════════════════════════════════════════════════════════
                              ANALYZED CONTENT
═════════════════════════════════════════════════════════════════════════════════

${content}

═════════════════════════════════════════════════════════════════════════════════
                           THREAT ANALYSIS DETAILS
═════════════════════════════════════════════════════════════════════════════════

RISK ASSESSMENT
───────────────────────────────────────────────────────────────────────────────
Overall Risk Level: ${riskScore >= 70 ? 'HIGH' : riskScore >= 40 ? 'MEDIUM' : 'LOW'}
Confidence Score: ${Math.min(95, riskScore + 5)}%
Analysis Engine: Hybrid AI (Regex Rules + External APIs + Pattern Matching)

═════════════════════════════════════════════════════════════════════════════════
                         THREAT CATEGORIES DETECTED
═════════════════════════════════════════════════════════════════════════════════

${keywordCategories.length > 0 ? keywordCategories.map((cat, i) => `${i + 1}. ${cat.toUpperCase()}`).join('\n') : 'No specific threat categories identified'}

═════════════════════════════════════════════════════════════════════════════════
                            SEVERITY BREAKDOWN
═════════════════════════════════════════════════════════════════════════════════

${severityCounts.critical ? `Critical Severity: ${severityCounts.critical} indicators` : ''}
${severityCounts.high ? `High Severity: ${severityCounts.high} indicators` : ''}
${severityCounts.medium ? `Medium Severity: ${severityCounts.medium} indicators` : ''}
${severityCounts.low ? `Low Severity: ${severityCounts.low} indicators` : ''}
${Object.keys(severityCounts).length === 0 ? 'No severity breakdown available' : ''}

═════════════════════════════════════════════════════════════════════════════════
                            FLAGGED INDICATORS
═════════════════════════════════════════════════════════════════════════════════

${flaggedKeywords.length > 0 ? flaggedKeywords.map((kw, i) => `${i + 1}. ${kw}`).join('\n') : 'No specific keywords flagged'}

═════════════════════════════════════════════════════════════════════════════════
                          ATTACK VECTOR ANALYSIS
═════════════════════════════════════════════════════════════════════════════════

${scanType === 'url' ? `
URL STRUCTURE ANALYSIS
───────────────────────────────────────────────────────────────────────────────
• Domain Length: ${content.length} characters
• Protocol Check: ${content.startsWith('https://') ? '✓ Secure (HTTPS)' : '⚠ Insecure (HTTP)'}
• Subdomain Analysis: ${content.split('.').length > 2 ? 'Complex subdomain structure detected' : 'Standard domain structure'}

POTENTIAL ATTACK VECTORS
───────────────────────────────────────────────────────────────────────────────
${riskScore >= 50 ? '⚠ Suspicious URL patterns detected' : '✓ No obvious URL pattern anomalies'}
${riskScore >= 60 ? '⚠ Possible domain spoofing attempt' : '✓ Domain appears legitimate'}
${riskScore >= 70 ? '⚠ High-risk redirect chain potential' : '✓ No suspicious redirect indicators'}
${flaggedKeywords.length > 0 ? '⚠ Keywords associated with phishing detected' : '✓ No phishing-related keywords found'}

TECHNICAL CHECKS
───────────────────────────────────────────────────────────────────────────────
• SSL Certificate: ${content.startsWith('https://') ? 'Valid' : 'Not applicable'}
• Domain Age: Check performed via external APIs
• Blacklist Status: Checked against threat intelligence feeds
• Reputation Score: Calculated from multiple sources
` : `
EMAIL CONTENT ANALYSIS
───────────────────────────────────────────────────────────────────────────────
• Content Length: ${content.length} characters
• Urgency Indicators: ${content.toLowerCase().includes('urgent') || content.toLowerCase().includes('immediate') ? '⚠ Detected' : '✓ Not detected'}
• Credential Requests: ${content.toLowerCase().includes('password') || content.toLowerCase().includes('login') ? '⚠ Detected' : '✓ Not detected'}
• Personal Information Requests: ${content.toLowerCase().includes('ssn') || content.toLowerCase().includes('social security') ? '⚠ Detected' : '✓ Not detected'}

POTENTIAL ATTACK VECTORS
───────────────────────────────────────────────────────────────────────────────
${riskScore >= 50 ? '⚠ Suspicious email patterns detected' : '✓ No obvious email pattern anomalies'}
${riskScore >= 60 ? '⚠ Possible impersonation attempt' : '✓ Sender appears legitimate'}
${riskScore >= 70 ? '⚠ High-risk social engineering indicators' : '✓ No social engineering red flags'}
${flaggedKeywords.length > 0 ? '⚠ Phishing vocabulary detected' : '✓ No phishing-related vocabulary found'}

TECHNICAL CHECKS
───────────────────────────────────────────────────────────────────────────────
• Sender Verification: Performed via available headers
• URL Extraction: ${content.includes('http') ? 'URLs found and analyzed' : 'No URLs detected'}
• Attachment Analysis: Not available in text-only scan
• Spam Score: Calculated from content patterns
`}

═════════════════════════════════════════════════════════════════════════════════
                           SECURITY RECOMMENDATIONS
═════════════════════════════════════════════════════════════════════════════════

${recommendation}

${riskScore >= 70 ? `
HIGH RISK ACTIONS REQUIRED:
───────────────────────────────────────────────────────────────────────────────
1. DO NOT click any links in this ${scanType}
2. DO NOT download any attachments
3. DO NOT provide any personal information
4. Report this ${scanType} to your IT security team
5. Delete the ${scanType} immediately
6. If you already interacted with it, change your passwords
` : riskScore >= 40 ? `
MEDIUM RISK PRECAUTIONS:
───────────────────────────────────────────────────────────────────────────────
1. Verify the sender/source through alternative channels
2. Do not provide sensitive information without confirmation
3. Check the URL carefully before clicking
4. Contact the supposed sender through known official channels
5. Monitor your accounts for suspicious activity
` : `
LOW RISK BEST PRACTICES:
───────────────────────────────────────────────────────────────────────────────
1. Always verify the source of unexpected communications
2. Use official channels for sensitive transactions
3. Enable two-factor authentication where possible
4. Keep your security software updated
5. Report any suspicious activity to security team
`}

═════════════════════════════════════════════════════════════════════════════════
                              ADDITIONAL RESOURCES
═════════════════════════════════════════════════════════════════════════════════

• For more information about phishing: https://www.cisa.gov/stopransomware
• Report phishing attempts: https://reportphishing.antiphishing.org/
• Security best practices: https://www.nist.gov/cybersecurity

═════════════════════════════════════════════════════════════════════════════════
                           REPORT DISCLAIMER
═════════════════════════════════════════════════════════════════════════════════

This report is generated by PhishGuard AI-powered detection system and is provided
for informational purposes only. While we strive for high accuracy, no security
system is 100% perfect. Always use your judgment and follow your organization's
security protocols. The risk score is based on pattern analysis and should be
considered as one factor in your overall security assessment.

Report generated by PhishGuard v1.0
For questions or support, contact your system administrator.

╔══════════════════════════════════════════════════════════════════════════════╗
║                            END OF REPORT                                         ║
╚══════════════════════════════════════════════════════════════════════════════╝
`;
    return report;
  }

  useEffect(() => { loadData(); }, [token]);

  async function handleScan(e) {
    e.preventDefault();
    if (!scanInput.trim() || !token) return;
    setScanning(true); setScanResult(null); setScanError('');
    try {
      const endpoint = activeTab === 'url' ? '/scans/url' : '/scans/email';
      const payload = activeTab === 'url' ? { url: scanInput } : { content: scanInput };
      const res = await axios.post(`${apiBase}${endpoint}`, payload, { headers: { Authorization: `Bearer ${token}` } });
      setScanResult(res.data);
      loadData();
    } catch (err) {
      setScanError(err?.response?.data?.message || 'Failed to analyze. Please try again.');
    } finally { setScanning(false); }
  }

  if (loading && !history.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur-2xl opacity-30 animate-pulse"></div>
            <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: GRADIENTS.primary }}>
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          </div>
          <p className="text-slate-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const chartData = stats ? [
    { name: 'Safe', value: stats.safeCount ?? 0, color: '#00F5D4' },
    { name: 'Suspicious', value: stats.suspiciousCount ?? 0, color: '#FF0055' },
    { name: 'Malicious', value: stats.maliciousCount ?? 0, color: '#FF0055' },
  ] : [];

  return (
    <div style={{ background: 'transparent' }}>
      <div className="relative container mx-auto px-4 md:px-6 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: GRADIENTS.primary, boxShadow: '0 0 20px rgba(0, 245, 212,.3)' }}>
                <Shield className="w-5 h-5" style={{ color: '#080B10' }} />
              </div>
              <h1 className="text-3xl font-bold" style={{ color: '#E2E8F0' }}>
                Security Dashboard
              </h1>
            </div>
            <p className="text-sm ml-13" style={{ color: 'rgba(226, 232, 240,.5)' }}>
              Advanced phishing detection with AI-powered analysis
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setShowReports(!showReports); if (!showReports) loadReports(); }}
              className="group relative px-4 py-2.5 rounded-xl transition-all duration-300"
              style={{ background: 'rgba(0, 245, 212,.1)', border: '1px solid rgba(0, 245, 212,.3)' }}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 group-hover:scale-110 transition-transform" style={{ color: '#00F5D4' }} />
                <span className="text-sm font-medium" style={{ color: '#00F5D4' }}>{showReports ? 'Hide Reports' : 'My Reports'}</span>
              </div>
            </button>
            {userRole === 'admin' && (
              <button
                onClick={() => router.push('/admin')}
                className="group relative px-4 py-2.5 rounded-xl text-white shadow-lg transition-all duration-300"
                style={{ background: GRADIENTS.primary, boxShadow: '0 0 30px rgba(0, 245, 212,.4)' }}
              >
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 group-hover:scale-110 transition-transform" style={{ color: '#080B10' }} />
                  <span className="text-sm font-semibold" style={{ color: '#080B10' }}>Admin Panel</span>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard 
              label="Total Scans" 
              value={stats.totalScans ?? 0} 
              icon={Activity} 
              color={COLORS.primary}
              gradient={GRADIENTS.primary}
              delay={0}
            />
            <StatCard 
              label="Safe" 
              value={stats.safeCount ?? 0} 
              icon={ShieldCheck} 
              color={COLORS.success}
              gradient={GRADIENTS.success}
              delay={0.1}
            />
            <StatCard 
              label="Suspicious" 
              value={stats.suspiciousCount ?? 0} 
              icon={AlertTriangle} 
              color={COLORS.warning}
              gradient={GRADIENTS.warning}
              delay={0.2}
            />
            <StatCard 
              label="Malicious" 
              value={stats.maliciousCount ?? 0} 
              icon={ShieldAlert} 
              color={COLORS.danger}
              gradient={GRADIENTS.danger}
              delay={0.3}
            />
          </div>
        )}

        {/* Charts Section */}
        {stats && (stats.totalScans ?? 0) > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Pie Chart */}
            <div 
              className="rounded-2xl p-6 hover:scale-105 transition-all duration-300 relative overflow-hidden group"
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
                  background: 'radial-gradient(circle at 70% 70%, rgba(0, 245, 212,.3) 0%, transparent 50%)',
                  filter: 'blur(25px)'
                }}
              />
              <div 
                className="absolute inset-0 rounded-2xl opacity-40"
                style={{
                  background: 'radial-gradient(circle at center, rgba(0, 245, 212,.2) 0%, transparent 70%)',
                  filter: 'blur(15px)'
                }}
              />
              
              <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                    style={{ 
                      background: GRADIENTS.primary, 
                      boxShadow: `
                        0 0 30px rgba(0, 245, 212,.5),
                        0 0 60px rgba(0, 245, 212,.3),
                        0 0 90px rgba(0, 245, 212,.2),
                        inset 0 0 20px rgba(0, 245, 212,.3)
                      `
                    }}
                  >
                    <Target className="w-5 h-5" style={{ color: '#080B10' }} />
                  </div>
                  <div>
                    <h3 className="font-semibold" style={{ color: '#E2E8F0' }}>Threat Distribution</h3>
                    <p className="text-xs" style={{ color: 'rgba(226, 232, 240,.5)' }}>Scan results breakdown</p>
                  </div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {chartData.map((entry, idx) => <Cell key={idx} fill={entry.color} stroke="#111622" strokeWidth={2} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', background: '#111622', color: '#E2E8F0', boxShadow: '0 4px 20px rgba(0, 245, 212,.2)', fontSize: '13px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Bar Chart */}
            <div 
              className="rounded-2xl p-6 hover:scale-105 transition-all duration-300 relative overflow-hidden group"
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
                  background: 'radial-gradient(circle at 70% 70%, rgba(0, 245, 212,.3) 0%, transparent 50%)',
                  filter: 'blur(25px)'
                }}
              />
              <div 
                className="absolute inset-0 rounded-2xl opacity-40"
                style={{
                  background: 'radial-gradient(circle at center, rgba(0, 245, 212,.2) 0%, transparent 70%)',
                  filter: 'blur(15px)'
                }}
              />
              
              <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                    style={{ 
                      background: GRADIENTS.secondary, 
                      boxShadow: `
                        0 0 30px rgba(0, 245, 212,.5),
                        0 0 60px rgba(0, 245, 212,.3),
                        0 0 90px rgba(0, 245, 212,.2),
                        inset 0 0 20px rgba(0, 245, 212,.3)
                      `
                    }}
                  >
                    <BarChart3 className="w-5 h-5" style={{ color: '#080B10' }} />
                  </div>
                  <div>
                    <h3 className="font-semibold" style={{ color: '#E2E8F0' }}>Scan Analytics</h3>
                    <p className="text-xs" style={{ color: 'rgba(226, 232, 240,.5)' }}>Detailed threat statistics</p>
                  </div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={250} className="relative z-10">
                <BarChart data={chartData} barSize={50}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 245, 212,.1)" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'rgba(226, 232, 240,.5)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: 'rgba(226, 232, 240,.5)' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', background: '#111622', color: '#E2E8F0', boxShadow: '0 4px 20px rgba(0, 245, 212,.2)', fontSize: '13px' }} />
                  <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                    {chartData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Reports Panel */}
        {showReports && (
          <div 
            className="rounded-2xl mb-8 overflow-hidden hover:scale-105 transition-all duration-300 relative group"
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
                background: 'radial-gradient(circle at 70% 70%, rgba(0, 245, 212,.3) 0%, transparent 50%)',
                filter: 'blur(25px)'
              }}
            />
            <div 
              className="absolute inset-0 rounded-2xl opacity-40"
              style={{
                background: 'radial-gradient(circle at center, rgba(0, 245, 212,.2) 0%, transparent 70%)',
                filter: 'blur(15px)'
              }}
            />
            
            <div className="flex justify-between items-center px-6 py-5 relative z-10" style={{ borderBottom: '1px solid rgba(0, 245, 212,.1)' }}>
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                  style={{ 
                    background: GRADIENTS.accent, 
                    boxShadow: `
                      0 0 30px rgba(0, 245, 212,.5),
                      0 0 60px rgba(0, 245, 212,.3),
                      0 0 90px rgba(0, 245, 212,.2),
                      inset 0 0 20px rgba(0, 245, 212,.3)
                    `
                  }}
                >
                  <FileText className="w-5 h-5" style={{ color: '#080B10' }} />
                </div>
                <div>
                  <h2 className="font-semibold" style={{ color: '#E2E8F0' }}>My Reports</h2>
                  <p className="text-xs" style={{ color: 'rgba(226, 232, 240,.5)' }}>Reports generated from your scan results</p>
                </div>
              </div>
              <button onClick={loadReports} className="p-2 rounded-lg transition-colors" style={{ background: 'rgba(0, 245, 212,.1)' }}>
                <RefreshCcw className="w-4 h-4" style={{ color: '#00F5D4' }} />
              </button>
            </div>
            <div className="p-6">
              {reports.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b" style={{ borderBottom: '1px solid rgba(0, 245, 212,.1)' }}>
                        {['Type', 'Status', 'Created', 'Actions'].map(h => (
                          <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(226, 232, 240,.5)' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {reports.map(r => (
                        <tr key={r._id} className="border-b hover:bg-slate-50/5 transition-colors" style={{ borderBottom: '1px solid rgba(0, 245, 212,.05)' }}>
                          <td className="px-4 py-3 capitalize font-medium" style={{ color: '#E2E8F0' }}>
                            <div className="flex items-center gap-2">
                              {r.reportType === 'url' ? <LinkIcon className="w-4 h-4" style={{ color: '#00F5D4' }} /> : <Mail className="w-4 h-4" style={{ color: '#00F5D4' }} />}
                              {r.reportType}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                              r.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
                              r.status === 'reviewed' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30' :
                              'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            }`}>
                              {r.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm" style={{ color: 'rgba(226, 232, 240,.5)' }}>{new Date(r.createdAt).toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => viewReport(r)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                                style={{ color: '#00F5D4', background: 'rgba(0, 245, 212,.1)', border: '1px solid rgba(0, 245, 212,.3)' }}
                              >
                                <Eye className="w-3.5 h-3.5" /> View
                              </button>
                              <button
                                onClick={() => downloadReport(r)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                                style={{ color: '#00F5D4', background: 'rgba(0, 245, 212,.1)', border: '1px solid rgba(0, 245, 212,.3)' }}
                              >
                                <FileText className="w-3.5 h-3.5" /> Download
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(0, 245, 212,.1)' }}>
                    <FileText className="w-8 h-8" style={{ color: '#00F5D4' }} />
                  </div>
                  <div>
                    <p className="font-semibold" style={{ color: '#E2E8F0' }}>No reports yet</p>
                    <p className="text-sm mt-1" style={{ color: 'rgba(226, 232, 240,.5)' }}>Generate reports from your scan history below</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Scanner Panel */}
          <div 
            className="lg:col-span-1 rounded-2xl overflow-hidden hover:scale-105 transition-all duration-300 relative group"
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
                background: 'radial-gradient(circle at 70% 70%, rgba(0, 245, 212,.3) 0%, transparent 50%)',
                filter: 'blur(25px)'
              }}
            />
            <div 
              className="absolute inset-0 rounded-2xl opacity-40"
              style={{
                background: 'radial-gradient(circle at center, rgba(0, 245, 212,.2) 0%, transparent 70%)',
                filter: 'blur(15px)'
              }}
            />
            
            <div className="px-6 py-5 relative z-10" style={{ borderBottom: '1px solid rgba(0, 245, 212,.1)' }}>
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                  style={{ 
                    background: GRADIENTS.primary, 
                    boxShadow: `
                      0 0 30px rgba(0, 245, 212,.5),
                      0 0 60px rgba(0, 245, 212,.3),
                      0 0 90px rgba(0, 245, 212,.2),
                      inset 0 0 20px rgba(0, 245, 212,.3)
                    `
                  }}
                >
                  <ScanSearch className="w-5 h-5" style={{ color: '#080B10' }} />
                </div>
                <div>
                  <h2 className="font-semibold" style={{ color: '#E2E8F0' }}>New Scan</h2>
                  <p className="text-xs" style={{ color: 'rgba(226, 232, 240,.5)' }}>Analyze URLs or emails for threats</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-5 relative z-10">
              {/* Tabs */}
              <div className="flex p-1 rounded-xl" style={{ background: 'rgba(0, 245, 212,.1)' }}>
                {[
                  { id: 'url', label: 'URL', icon: LinkIcon },
                  { id: 'email', label: 'Email', icon: Mail },
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => { setActiveTab(t.id); setScanResult(null); setScanInput(''); setScanError(''); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      activeTab === t.id 
                        ? 'text-indigo-600 shadow-md' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                    style={{ background: activeTab === t.id ? 'rgba(0, 245, 212,.2)' : 'transparent', color: activeTab === t.id ? '#00F5D4' : 'rgba(226, 232, 240,.5)' }}
                  >
                    <t.icon className="w-4 h-4" />
                    {t.label}
                  </button>
                ))}
              </div>

              <form onSubmit={handleScan} className="space-y-4">
                {activeTab === 'url' ? (
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold" style={{ color: '#E2E8F0' }}>URL to check</label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(226, 232, 240,.4)' }} />
                      <input
                        type="url"
                        placeholder="https://example.com"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border transition-all text-sm"
                        style={{ background: '#111622', border: '1px solid rgba(0, 245, 212,.2)', color: '#E2E8F0' }}
                        value={scanInput}
                        onChange={e => setScanInput(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold" style={{ color: '#E2E8F0' }}>Email content</label>
                    <textarea
                      placeholder="Paste the email content here..."
                      className="w-full px-4 py-3 rounded-xl border transition-all text-sm resize-none"
                      style={{ background: '#111622', border: '1px solid rgba(0, 245, 212,.2)', color: '#E2E8F0' }}
                      rows={5}
                      value={scanInput}
                      onChange={e => setScanInput(e.target.value)}
                      required
                    />
                  </div>
                )}

                {scanError && (
                  <div className="flex items-start gap-2 p-3 rounded-xl text-sm animate-pulse" style={{ background: 'rgba(255, 0, 85,.1)', border: '1px solid rgba(255, 0, 85,.3)', color: '#FF0055', boxShadow: '0 0 20px rgba(255, 0, 85,.2)' }}>
                    <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
                    {scanError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={scanning}
                  className="w-full py-3 rounded-xl font-semibold shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{ background: GRADIENTS.primary, color: '#080B10', boxShadow: '0 0 30px rgba(0, 245, 212,.4)' }}
                >
                  {scanning ? <><Loader2 className="w-4 h-4 animate-spin" style={{ color: '#080B10' }} /> Analyzing...</> : <><Zap className="w-4 h-4" style={{ color: '#080B10' }} /> Analyze Now</>}
                </button>
              </form>

              {/* Scan Result */}
              {scanResult?.result && (
                <div className="rounded-xl p-4 space-y-3 animate-fade-in" style={{ background: 'rgba(0, 245, 212,.05)', border: '1px solid rgba(0, 245, 212,.2)' }}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'rgba(226, 232, 240,.5)' }}>Analysis Result</span>
                    <ThreatBadge status={scanResult.result.threatStatus} />
                  </div>
                  <div className="flex items-center justify-between py-3" style={{ borderTop: '1px solid rgba(0, 245, 212,.1)', borderBottom: '1px solid rgba(0, 245, 212,.1)' }}>
                    <span className="text-sm font-medium" style={{ color: 'rgba(226, 232, 240,.6)' }}>Risk Score</span>
                    <span className="text-2xl font-bold" style={{ color: '#E2E8F0' }}>{scanResult.result.riskPercentage ?? 0}%</span>
                  </div>
                  {scanResult.result.details && (
                    <p className="text-sm leading-relaxed" style={{ color: 'rgba(226, 232, 240,.6)' }}>{scanResult.result.details}</p>
                  )}
                  
                  {/* Enhanced Analysis Details */}
                  <div className="space-y-2 pt-2" style={{ borderTop: '1px solid rgba(0, 245, 212,.1)' }}>
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'rgba(226, 232, 240,.5)' }}>Detection Details</span>
                    
                    {/* External API Status */}
                    <div className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid rgba(0, 245, 212,.05)' }}>
                      <span className="text-xs" style={{ color: 'rgba(226, 232, 240,.5)' }}>External APIs Used</span>
                      <span className={`text-xs font-semibold ${scanResult.externalApiUsed ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {scanResult.externalApiUsed ? 'Yes' : 'No (Keywords Only)'}
                      </span>
                    </div>
                    
                    {scanResult.primarySource && (
                      <div className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid rgba(0, 245, 212,.05)' }}>
                        <span className="text-xs" style={{ color: 'rgba(226, 232, 240,.5)' }}>Primary Detection Source</span>
                        <span className="text-xs font-semibold" style={{ color: '#00F5D4' }}>
                          {scanResult.primarySource === 'virustotal' ? 'VirusTotal' : scanResult.primarySource === 'google-safe-browsing' ? 'Google Safe Browsing' : 'Keyword Analysis'}
                        </span>
                      </div>
                    )}
                    
                    {scanResult.usedFallbackKeywords !== undefined && (
                      <div className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid rgba(0, 245, 212,.05)' }}>
                        <span className="text-xs" style={{ color: 'rgba(226, 232, 240,.5)' }}>Database Keywords</span>
                        <span className={`text-xs font-semibold ${scanResult.usedFallbackKeywords ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {scanResult.usedFallbackKeywords ? 'Fallback Used' : 'Active'}
                        </span>
                      </div>
                    )}
                    
                    {/* Keyword Categories */}
                    {scanResult.keywordCategories && scanResult.keywordCategories.length > 0 && (
                      <div className="py-2" style={{ borderBottom: '1px solid rgba(0, 245, 212,.05)' }}>
                        <span className="text-xs block mb-2" style={{ color: 'rgba(226, 232, 240,.5)' }}>Threat Categories Detected</span>
                        <div className="flex flex-wrap gap-1.5">
                          {scanResult.keywordCategories.map((cat, idx) => (
                            <span key={idx} className="px-2 py-1 rounded text-xs font-medium" style={{ background: 'rgba(0, 245, 212,.1)', border: '1px solid rgba(0, 245, 212,.3)', color: '#00F5D4' }}>
                              {cat}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Severity Counts */}
                    {scanResult.severityCounts && (
                      <div className="py-2">
                        <span className="text-xs block mb-2" style={{ color: 'rgba(226, 232, 240,.5)' }}>Severity Breakdown</span>
                        <div className="grid grid-cols-2 gap-2">
                          {scanResult.severityCounts.critical > 0 && (
                            <div className="flex items-center justify-between p-2 rounded" style={{ background: 'rgba(255, 0, 85,.1)', border: '1px solid rgba(255, 0, 85,.3)' }}>
                              <span className="text-xs" style={{ color: 'rgba(226, 232, 240,.5)' }}>Critical</span>
                              <span className="text-xs font-bold" style={{ color: '#FF0055' }}>{scanResult.severityCounts.critical}</span>
                            </div>
                          )}
                          {scanResult.severityCounts.high > 0 && (
                            <div className="flex items-center justify-between p-2 rounded" style={{ background: 'rgba(255, 100, 0,.1)', border: '1px solid rgba(255, 100, 0,.3)' }}>
                              <span className="text-xs" style={{ color: 'rgba(226, 232, 240,.5)' }}>High</span>
                              <span className="text-xs font-bold" style={{ color: '#FF6400' }}>{scanResult.severityCounts.high}</span>
                            </div>
                          )}
                          {scanResult.severityCounts.medium > 0 && (
                            <div className="flex items-center justify-between p-2 rounded" style={{ background: 'rgba(255, 200, 0,.1)', border: '1px solid rgba(255, 200, 0,.3)' }}>
                              <span className="text-xs" style={{ color: 'rgba(226, 232, 240,.5)' }}>Medium</span>
                              <span className="text-xs font-bold" style={{ color: '#FFC800' }}>{scanResult.severityCounts.medium}</span>
                            </div>
                          )}
                          {scanResult.severityCounts.low > 0 && (
                            <div className="flex items-center justify-between p-2 rounded" style={{ background: 'rgba(0, 245, 212,.1)', border: '1px solid rgba(0, 245, 212,.3)' }}>
                              <span className="text-xs" style={{ color: 'rgba(226, 232, 240,.5)' }}>Low</span>
                              <span className="text-xs font-bold" style={{ color: '#00F5D4' }}>{scanResult.severityCounts.low}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => viewCurrentReport()}
                    className="w-full py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                    style={{ background: 'linear-gradient(135deg, rgba(0, 245, 212,.15) 0%, rgba(0, 245, 212,.1) 100%)', border: '1px solid rgba(0, 245, 212,.3)', color: '#00F5D4' }}
                  >
                    <FileText className="w-4 h-4" /> View Detailed Report
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* History Panel */}
          <div 
            className="lg:col-span-2 rounded-2xl overflow-hidden hover:scale-105 transition-all duration-300 relative group"
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
                background: 'radial-gradient(circle at 70% 70%, rgba(0, 245, 212,.3) 0%, transparent 50%)',
                filter: 'blur(25px)'
              }}
            />
            <div 
              className="absolute inset-0 rounded-2xl opacity-40"
              style={{
                background: 'radial-gradient(circle at center, rgba(0, 245, 212,.2) 0%, transparent 70%)',
                filter: 'blur(15px)'
              }}
            />
            
            <div className="flex justify-between items-center px-6 py-5 relative z-10" style={{ borderBottom: '1px solid rgba(0, 245, 212,.1)' }}>
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                  style={{ 
                    background: GRADIENTS.secondary, 
                    boxShadow: `
                      0 0 30px rgba(0, 245, 212,.5),
                      0 0 60px rgba(0, 245, 212,.3),
                      0 0 90px rgba(0, 245, 212,.2),
                      inset 0 0 20px rgba(0, 245, 212,.3)
                    `
                  }}
                >
                  <Clock className="w-5 h-5" style={{ color: '#080B10' }} />
                </div>
                <div>
                  <h2 className="font-semibold" style={{ color: '#E2E8F0' }}>Scan History</h2>
                  <p className="text-xs" style={{ color: 'rgba(226, 232, 240,.5)' }}>Your recent scanning activity</p>
                </div>
              </div>
              <button
                onClick={loadData}
                disabled={loading}
                className="p-2 rounded-lg transition-colors disabled:opacity-50"
                style={{ background: 'rgba(0, 245, 212,.1)' }}
              >
                <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} style={{ color: '#00F5D4' }} />
              </button>
            </div>

            <div className="overflow-x-auto relative z-10">
              {history.length ? (
                <table className="w-full">
                  <thead>
                    <tr className="border-b" style={{ borderBottom: '1px solid rgba(0, 245, 212,.1)', background: 'rgba(0, 245, 212,.05)' }}>
                      {['Type', 'Content', 'Risk %', 'Status', 'Source', 'Action'].map(h => (
                        <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(226, 232, 240,.5)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((h, idx) => (
                      <tr
                        key={h._id || idx}
                        className="border-b hover:bg-slate-50/5 transition-colors"
                        style={{ borderBottom: '1px solid rgba(0, 245, 212,.05)' }}
                      >
                        <td className="px-5 py-4">
                          {(h.scanType || '').toLowerCase() === 'url' ? (
                            <span className="flex items-center gap-2 text-xs font-semibold" style={{ color: '#00F5D4' }}>
                              <LinkIcon className="w-4 h-4" /> URL
                            </span>
                          ) : (
                            <span className="flex items-center gap-2 text-xs font-semibold" style={{ color: '#00F5D4' }}>
                              <Mail className="w-4 h-4" /> EMAIL
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 max-w-[200px]">
                          <span className="block truncate text-sm" style={{ color: 'rgba(226, 232, 240,.6)' }} title={h.content}>{h.content}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="font-bold" style={{ color: '#E2E8F0' }}>{h.result?.riskPercentage ?? '—'}{h.result?.riskPercentage != null ? '%' : ''}</span>
                        </td>
                        <td className="px-5 py-4">
                          <ThreatBadge status={h.result?.threatStatus} />
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-xs font-medium" style={{ color: 'rgba(226, 232, 240,.5)' }}>
                            {h.primarySource === 'virustotal' ? (
                              <span className="flex items-center gap-1" style={{ color: '#00F5D4' }}>
                                <Shield className="w-3 h-3" /> VT
                              </span>
                            ) : h.primarySource === 'google-safe-browsing' ? (
                              <span className="flex items-center gap-1" style={{ color: '#00F5D4' }}>
                                <Shield className="w-3 h-3" /> GSB
                              </span>
                            ) : (
                              <span className="flex items-center gap-1" style={{ color: 'rgba(226, 232, 240,.5)' }}>
                                <Shield className="w-3 h-3" /> Key
                              </span>
                            )}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <button
                            onClick={() => generateReport(h._id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                            style={{ color: '#00F5D4', background: 'rgba(0, 245, 212,.1)', border: '1px solid rgba(0, 245, 212,.3)' }}
                          >
                            <FileText className="w-3.5 h-3.5" /> Report
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(0, 245, 212,.1)' }}>
                    <ShieldCheck className="w-10 h-10" style={{ color: '#00F5D4' }} />
                  </div>
                  <div>
                    <p className="font-semibold" style={{ color: '#E2E8F0' }}>No scans yet</p>
                    <p className="text-sm mt-1" style={{ color: 'rgba(226, 232, 240,.5)' }}>Use the scanner to analyze your first URL or email</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Report Modal */}
        {showReportModal && selectedReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0, 0, 0,.8)', backdropFilter: 'blur(8px)' }}>
            <div className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl" style={{ background: '#111622', border: '1px solid rgba(0, 245, 212,.3)', boxShadow: '0 0 60px rgba(0, 245, 212,.2)' }}>
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(0, 245, 212,.2)', background: 'linear-gradient(180deg, rgba(0, 245, 212,.05) 0%, transparent 100%)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: GRADIENTS.primary, boxShadow: '0 0 20px rgba(0, 245, 212,.3)' }}>
                    <FileText className="w-5 h-5" style={{ color: '#080B10' }} />
                  </div>
                  <div>
                    <h2 className="font-semibold" style={{ color: '#E2E8F0' }}>Security Report</h2>
                    <p className="text-xs" style={{ color: 'rgba(226, 232, 240,.5)' }}>{selectedReport.scanType.toUpperCase()} Analysis</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const reportContent = generateDetailedReport(selectedReport);
                      const blob = new Blob([reportContent], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `phishguard-report-${selectedReport.scanType}-${new Date().toISOString().slice(0,10)}.txt`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors"
                    style={{ color: '#00F5D4', background: 'rgba(0, 245, 212,.1)', border: '1px solid rgba(0, 245, 212,.3)' }}
                  >
                    <FileText className="w-3.5 h-3.5" /> Download
                  </button>
                  <button
                    onClick={() => setShowReportModal(false)}
                    className="p-2 rounded-lg transition-colors"
                    style={{ background: 'rgba(255, 0, 85,.1)', border: '1px solid rgba(255, 0, 85,.3)' }}
                  >
                    <span style={{ color: '#FF0055', fontSize: '1.25rem', lineHeight: 1 }}>×</span>
                  </button>
                </div>
              </div>

              {/* Report Content */}
              <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 80px)' }}>
                <pre className="whitespace-pre-wrap text-sm leading-relaxed font-mono" style={{ color: '#E2E8F0', fontFamily: 'Courier New, monospace' }}>
                  {generateDetailedReport(selectedReport)}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
        .delay-100 {
          animation-delay: 0.1s;
        }
      `}</style>
    </div>
  );
}
