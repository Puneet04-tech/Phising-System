'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { getToken, clearToken } from '../../lib/auth';
import { 
  LogOut, Users, ShieldAlert, ShieldCheck, Activity, 
  Search, Filter, Plus, Edit, Trash2, RefreshCcw, Loader2,
  BarChart3, FileText, Key, Crown, Zap, Target, Globe, 
  Clock, TrendingUp, Shield, Flame, Waves, Eye, Lock,
  CheckCircle2, AlertTriangle, Settings
} from 'lucide-react';

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

function StatusBadge({ status }) {
  const config = {
    pending: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30', label: 'Pending', glow: '0 0 10px rgba(59, 130, 246,.3)' },
    reviewed: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30', label: 'Reviewed', glow: '0 0 10px rgba(245, 158, 11,.3)' },
    resolved: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30', label: 'Resolved', glow: '0 0 10px rgba(0, 245, 212,.3)' },
    active: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30', label: 'Active', glow: '0 0 10px rgba(0, 245, 212,.3)' },
    inactive: { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/30', label: 'Inactive', glow: 'none' },
  };
  const c = config[status?.toLowerCase()] || { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/30', label: status || '—', glow: 'none' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${c.bg} ${c.text} ${c.border}`} style={{ boxShadow: c.glow }}>
      {c.label}
    </span>
  );
}

function StatCard({ label, value, subtext, icon: Icon, color, gradient, delay }) {
  return (
    <div 
      className="relative overflow-hidden rounded-2xl transition-all duration-300 group"
      style={{ background: '#111622', border: '1px solid rgba(0, 245, 212,.2)', boxShadow: '0 0 20px rgba(0, 245, 212,.05)', animation: `fadeInUp 0.6s ease-out ${delay}s both` }}
    >
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10 group-hover:opacity-20 transition-opacity">
        <Icon className="w-full h-full" style={{ color: color }} />
      </div>
      <div className="relative p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: gradient, boxShadow: '0 0 20px rgba(0, 245, 212,.3)' }}>
            <Icon className="w-6 h-6" style={{ color: '#080B10' }} />
          </div>
          <div className="flex items-center gap-1 text-xs font-medium" style={{ color: 'rgba(226, 232, 240,.4)' }}>
            <Clock className="w-3 h-3" />
            <span>Last 7 days</span>
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium" style={{ color: 'rgba(226, 232, 240,.5)' }}>{label}</p>
          <p className="text-3xl font-bold" style={{ color: color }}>{value}</p>
          <p className="text-xs" style={{ color: 'rgba(226, 232, 240,.4)' }}>{subtext}</p>
        </div>
      </div>
    </div>
  );
}

function NavTab({ id, label, icon: Icon, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
        active 
          ? '' 
          : ''
      }`}
      style={{ 
        background: active ? GRADIENTS.primary : 'rgba(0, 245, 212,.1)', 
        color: active ? '#080B10' : 'rgba(226, 232, 240,.6)', 
        boxShadow: active ? '0 0 30px rgba(0, 245, 212,.4)' : 'none' 
      }}
    >
      <Icon className="w-4 h-4" style={{ color: active ? '#080B10' : 'rgba(226, 232, 240,.6)' }} />
      {label}
    </button>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [token, setTokenState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [detectionLogs, setDetectionLogs] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [reports, setReports] = useState([]);
  
  const [activeSection, setActiveSection] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const t = getToken();
    if (!t) {
      router.replace('/login');
      return;
    }
    setTokenState(t);
  }, [router]);

  async function loadAdminData() {
    if (!token) return;
    try {
      setLoading(true);
      const authHeaders = { Authorization: `Bearer ${token}` };

      const [analyticsRes, usersRes, logsRes, keywordsRes, reportsRes] = await Promise.all([
        axios.get(`${apiBase}/admin/analytics`, { headers: authHeaders }),
        axios.get(`${apiBase}/admin/users?page=1&limit=10`, { headers: authHeaders }),
        axios.get(`${apiBase}/admin/detection-logs?page=1&limit=10`, { headers: authHeaders }),
        axios.get(`${apiBase}/keywords`, { headers: authHeaders }),
        axios.get(`${apiBase}/admin/reports?page=1&limit=10`, { headers: authHeaders }),
      ]);

      setAnalytics(analyticsRes.data.analytics);
      setUsers(usersRes.data.users || []);
      setDetectionLogs(logsRes.data.logs || []);
      setKeywords(keywordsRes.data.keywords || []);
      setReports(reportsRes.data.reports || []);
    } catch (e) {
      console.error(e);
      if (e.response?.status === 403) {
        setError('Access denied. Admin privileges required.');
      } else if (e.response?.status === 401) {
        clearToken();
        router.replace('/login');
      } else {
        setError('Failed to load admin data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) loadAdminData();
  }, [token]);

  async function handleDeleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await axios.delete(`${apiBase}/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      loadAdminData();
    } catch (e) {
      console.error(e);
      alert('Failed to delete user');
    }
  }

  async function handleUpdateUserRole(userId, newRole) {
    try {
      await axios.patch(`${apiBase}/admin/users/${userId}/role`, 
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      loadAdminData();
    } catch (e) {
      console.error(e);
      alert('Failed to update user role');
    }
  }

  async function handleDeleteKeyword(keywordId) {
    if (!confirm('Are you sure you want to delete this keyword?')) return;
    
    try {
      await axios.delete(`${apiBase}/keywords/${keywordId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      loadAdminData();
    } catch (e) {
      console.error(e);
      alert('Failed to delete keyword');
    }
  }

  async function handleUpdateReportStatus(reportId, newStatus) {
    try {
      await axios.patch(`${apiBase}/admin/reports/${reportId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      loadAdminData();
    } catch (e) {
      console.error(e);
      alert('Failed to update report status');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur-2xl opacity-30 animate-pulse"></div>
            <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: GRADIENTS.primary }}>
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          </div>
          <p className="text-slate-600 font-medium">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ background: '#080B10' }} className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl p-8 text-center" style={{ background: '#111622', border: '1px solid rgba(255, 0, 85,.3)', boxShadow: '0 0 30px rgba(255, 0, 85,.2)' }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(255, 0, 85,.15)', border: '1px solid rgba(255, 0, 85,.3)', boxShadow: '0 0 20px rgba(255, 0, 85,.3)' }}>
            <ShieldAlert className="w-8 h-8" style={{ color: '#FF0055' }} />
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: '#E2E8F0' }}>Access Denied</h2>
          <p className="mb-6" style={{ color: 'rgba(226, 232, 240,.6)' }}>{error}</p>
          <button
            onClick={() => router.replace('/dashboard')}
            className="w-full py-3 rounded-xl font-semibold shadow-lg transition-all duration-300"
            style={{ background: GRADIENTS.danger, color: '#080B10', boxShadow: '0 0 30px rgba(255, 0, 85,.4)' }}
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: 'transparent' }} className="min-h-screen">
      <div className="relative container mx-auto px-4 md:px-6 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: GRADIENTS.primary, boxShadow: '0 0 20px rgba(0, 245, 212,.3)' }}>
                <Crown className="w-5 h-5" style={{ color: '#080B10' }} />
              </div>
              <h1 className="text-3xl font-bold" style={{ color: '#E2E8F0' }}>
                Admin Dashboard
              </h1>
            </div>
            <p className="text-sm ml-13" style={{ color: 'rgba(226, 232, 240,.5)' }}>
              Manage users, view analytics, and monitor platform activity
            </p>
          </div>
          <button
            onClick={() => {
              clearToken();
              router.replace('/login');
            }}
            className="group relative px-4 py-2.5 rounded-xl transition-all duration-300"
            style={{ background: 'rgba(255, 0, 85,.1)', border: '1px solid rgba(255, 0, 85,.3)' }}
          >
            <div className="flex items-center gap-2">
              <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" style={{ color: '#FF0055' }} />
              <span className="text-sm font-medium" style={{ color: '#FF0055' }}>Logout</span>
            </div>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 p-1 rounded-2xl shadow-sm" style={{ background: 'rgba(0, 245, 212,.1)', border: '1px solid rgba(0, 245, 212,.2)' }}>
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'logs', label: 'Detection Logs', icon: Activity },
            { id: 'keywords', label: 'Keywords', icon: Key },
            { id: 'reports', label: 'Reports', icon: FileText },
          ].map((tab) => (
            <NavTab
              key={tab.id}
              id={tab.id}
              label={tab.label}
              icon={tab.icon}
              active={activeSection === tab.id}
              onClick={() => setActiveSection(tab.id)}
            />
          ))}
        </div>

        {/* Overview Section */}
        {activeSection === 'overview' && analytics && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard 
                label="Total Users" 
                value={analytics.users.total} 
                subtext={`${analytics.users.recent} new this week`}
                icon={Users} 
                color={COLORS.primary}
                gradient={GRADIENTS.primary}
                delay={0}
              />
              <StatCard 
                label="Total Scans" 
                value={analytics.scans.total} 
                subtext={`${analytics.scans.recent} this week`}
                icon={Activity} 
                color={COLORS.secondary}
                gradient={GRADIENTS.secondary}
                delay={0.1}
              />
              <StatCard 
                label="Threats Detected" 
                value={analytics.scans.suspicious + analytics.scans.malicious} 
                subtext={`${analytics.scans.maliciousRatio.toFixed(1)}% malicious`}
                icon={ShieldAlert} 
                color={COLORS.danger}
                gradient={GRADIENTS.danger}
                delay={0.2}
              />
              <StatCard 
                label="Reports" 
                value={analytics.reports.total} 
                subtext={`${analytics.reports.pending} pending`}
                icon={FileText} 
                color={COLORS.accent}
                gradient={GRADIENTS.warning}
                delay={0.3}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-2xl p-6 hover:shadow-xl transition-all duration-300" style={{ background: '#111622', border: '1px solid rgba(0, 245, 212,.2)', boxShadow: '0 0 20px rgba(0, 245, 212,.05)' }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: GRADIENTS.primary, boxShadow: '0 0 20px rgba(0, 245, 212,.3)' }}>
                    <Target className="w-5 h-5" style={{ color: '#080B10' }} />
                  </div>
                  <div>
                    <h3 className="font-semibold" style={{ color: '#E2E8F0' }}>Scan Distribution</h3>
                    <p className="text-xs" style={{ color: 'rgba(226, 232, 240,.5)' }}>Breakdown by scan type</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {[
                    { label: 'URL Scans', value: analytics.scans.urlScans, color: '#00F5D4' },
                    { label: 'Email Scans', value: analytics.scans.emailScans, color: '#FF0055' },
                  ].map((item, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-medium" style={{ color: 'rgba(226, 232, 240,.7)' }}>{item.label}</span>
                        <span className="font-bold" style={{ color: '#E2E8F0' }}>{item.value}</span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(0, 245, 212,.1)' }}>
                        <div 
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${(item.value / analytics.scans.total) * 100}%`, background: item.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl p-6 hover:shadow-xl transition-all duration-300" style={{ background: '#111622', border: '1px solid rgba(0, 245, 212,.2)', boxShadow: '0 0 20px rgba(0, 245, 212,.05)' }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: GRADIENTS.secondary, boxShadow: '0 0 20px rgba(0, 245, 212,.3)' }}>
                    <Shield className="w-5 h-5" style={{ color: '#080B10' }} />
                  </div>
                  <div>
                    <h3 className="font-semibold" style={{ color: '#E2E8F0' }}>Threat Status</h3>
                    <p className="text-xs" style={{ color: 'rgba(226, 232, 240,.5)' }}>Classification breakdown</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {[
                    { label: 'Safe', value: analytics.scans.safe, color: 'bg-emerald-500' },
                    { label: 'Suspicious', value: analytics.scans.suspicious, color: 'bg-amber-500' },
                    { label: 'Malicious', value: analytics.scans.malicious, color: 'bg-red-500' },
                  ].map((item, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-medium" style={{ color: 'rgba(226, 232, 240,.7)' }}>{item.label}</span>
                        <span className="font-bold" style={{ color: '#E2E8F0' }}>{item.value}</span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(0, 245, 212,.1)' }}>
                        <div 
                          className={`h-full rounded-full transition-all duration-500`}
                          style={{ width: `${(item.value / analytics.scans.total) * 100}%`, background: item.label === 'Safe' ? '#00F5D4' : item.label === 'Suspicious' ? '#FF0055' : '#FF0055' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Section */}
        {activeSection === 'users' && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold" style={{ color: '#E2E8F0' }}>User Management</h2>
                <p className="text-sm" style={{ color: 'rgba(226, 232, 240,.5)' }}>Manage user accounts and permissions</p>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(226, 232, 240,.4)' }} />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2.5 rounded-xl border transition-all text-sm w-full md:w-64"
                  style={{ background: '#111622', border: '1px solid rgba(0, 245, 212,.2)', color: '#E2E8F0' }}
                />
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300" style={{ background: '#111622', border: '1px solid rgba(0, 245, 212,.2)', boxShadow: '0 0 20px rgba(0, 245, 212,.05)' }}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b" style={{ borderBottom: '1px solid rgba(0, 245, 212,.1)', background: 'rgba(0, 245, 212,.05)' }}>
                    <tr>
                      {['Name', 'Email', 'Role', 'Created', 'Actions'].map(h => (
                        <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(226, 232, 240,.5)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users
                      .filter(user => 
                        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        user.email.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((user) => (
                        <tr key={user._id} className="border-b hover:bg-slate-50/5 transition-colors" style={{ borderBottom: '1px solid rgba(0, 245, 212,.05)' }}>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: GRADIENTS.primary, color: '#080B10' }}>
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-medium" style={{ color: '#E2E8F0' }}>{user.name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-sm" style={{ color: 'rgba(226, 232, 240,.6)' }}>{user.email}</td>
                          <td className="px-5 py-4">
                            <select
                              value={user.role}
                              onChange={(e) => handleUpdateUserRole(user._id, e.target.value)}
                              className="px-3 py-1.5 rounded-lg border transition-all text-sm font-medium"
                              style={{ background: '#111622', border: '1px solid rgba(0, 245, 212,.2)', color: '#E2E8F0' }}
                            >
                              <option value="user">User</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                          <td className="px-5 py-4 text-sm" style={{ color: 'rgba(226, 232, 240,.5)' }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                          <td className="px-5 py-4">
                            <button
                              onClick={() => handleDeleteUser(user._id)}
                              className="p-2 rounded-lg border border-transparent transition-all"
                              style={{ color: '#FF0055', background: 'rgba(255, 0, 85,.1)' }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Detection Logs Section */}
        {activeSection === 'logs' && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold" style={{ color: '#E2E8F0' }}>Detection Logs</h2>
                <p className="text-sm" style={{ color: 'rgba(226, 232, 240,.5)' }}>View all scan activities across the platform</p>
              </div>
              <button
                onClick={loadAdminData}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 text-sm font-medium"
                style={{ background: 'rgba(0, 245, 212,.1)', border: '1px solid rgba(0, 245, 212,.3)', color: '#00F5D4' }}
              >
                <RefreshCcw className="w-4 h-4" />
                Refresh
              </button>
            </div>
            <div className="rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300" style={{ background: '#111622', border: '1px solid rgba(0, 245, 212,.2)', boxShadow: '0 0 20px rgba(0, 245, 212,.05)' }}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b" style={{ borderBottom: '1px solid rgba(0, 245, 212,.1)', background: 'rgba(0, 245, 212,.05)' }}>
                    <tr>
                      {['Type', 'Content', 'Status', 'User', 'Date'].map(h => (
                        <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(226, 232, 240,.5)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {detectionLogs.map((log) => (
                      <tr key={log._id} className="border-b hover:bg-slate-50/5 transition-colors" style={{ borderBottom: '1px solid rgba(0, 245, 212,.05)' }}>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold" style={{ background: 'rgba(0, 245, 212,.15)', border: '1px solid rgba(0, 245, 212,.3)', color: '#00F5D4' }}>
                            {log.scanType}
                          </span>
                        </td>
                        <td className="px-5 py-4 max-w-xs">
                          <span className="block truncate text-sm" style={{ color: 'rgba(226, 232, 240,.6)' }} title={log.content}>{log.content}</span>
                        </td>
                        <td className="px-5 py-4">
                          <ThreatBadge status={log.result.threatStatus} />
                        </td>
                        <td className="px-5 py-4 text-sm" style={{ color: 'rgba(226, 232, 240,.6)' }}>{log.userId?.name || 'Unknown'}</td>
                        <td className="px-5 py-4 text-sm" style={{ color: 'rgba(226, 232, 240,.5)' }}>{new Date(log.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Keywords Section */}
        {activeSection === 'keywords' && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold" style={{ color: '#E2E8F0' }}>Keyword Management</h2>
                <p className="text-sm" style={{ color: 'rgba(226, 232, 240,.5)' }}>Configure phishing detection keywords</p>
              </div>
              <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold shadow-lg transition-all duration-300" style={{ background: GRADIENTS.primary, color: '#080B10', boxShadow: '0 0 30px rgba(0, 245, 212,.4)' }}>
                <Plus className="w-4 h-4" style={{ color: '#080B10' }} />
                Add Keyword
              </button>
            </div>
            <div className="rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300" style={{ background: '#111622', border: '1px solid rgba(0, 245, 212,.2)', boxShadow: '0 0 20px rgba(0, 245, 212,.05)' }}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b" style={{ borderBottom: '1px solid rgba(0, 245, 212,.1)', background: 'rgba(0, 245, 212,.05)' }}>
                    <tr>
                      {['Keyword', 'Category', 'Points', 'Status', 'Actions'].map(h => (
                        <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(226, 232, 240,.5)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {keywords.map((keyword) => (
                      <tr key={keyword._id} className="border-b hover:bg-slate-50/5 transition-colors" style={{ borderBottom: '1px solid rgba(0, 245, 212,.05)' }}>
                        <td className="px-5 py-4">
                          <span className="font-semibold" style={{ color: '#E2E8F0' }}>{keyword.keyword}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold capitalize" style={{ background: 'rgba(0, 245, 212,.15)', border: '1px solid rgba(0, 245, 212,.3)', color: '#00F5D4' }}>
                            {keyword.category}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold" style={{ background: 'rgba(255, 0, 85,.15)', border: '1px solid rgba(255, 0, 85,.3)', color: '#FF0055' }}>
                            {keyword.points} pts
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={keyword.isActive ? 'active' : 'inactive'} />
                        </td>
                        <td className="px-5 py-4">
                          <button
                            onClick={() => handleDeleteKeyword(keyword._id)}
                            className="p-2 rounded-lg border border-transparent transition-all"
                            style={{ color: '#FF0055', background: 'rgba(255, 0, 85,.1)' }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Reports Section */}
        {activeSection === 'reports' && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold" style={{ color: '#E2E8F0' }}>Reports Management</h2>
              <p className="text-sm" style={{ color: 'rgba(226, 232, 240,.5)' }}>Review and manage user-submitted reports</p>
            </div>
            <div className="rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300" style={{ background: '#111622', border: '1px solid rgba(0, 245, 212,.2)', boxShadow: '0 0 20px rgba(0, 245, 212,.05)' }}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b" style={{ borderBottom: '1px solid rgba(0, 245, 212,.1)', background: 'rgba(0, 245, 212,.05)' }}>
                    <tr>
                      {['Type', 'Status', 'User', 'Created', 'Actions'].map(h => (
                        <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(226, 232, 240,.5)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((report) => (
                      <tr key={report._id} className="border-b hover:bg-slate-50/5 transition-colors" style={{ borderBottom: '1px solid rgba(0, 245, 212,.05)' }}>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold capitalize" style={{ background: 'rgba(0, 245, 212,.15)', border: '1px solid rgba(0, 245, 212,.3)', color: '#00F5D4' }}>
                            {report.reportType}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <select
                            value={report.status}
                            onChange={(e) => handleUpdateReportStatus(report._id, e.target.value)}
                            className="px-3 py-1.5 rounded-lg border transition-all text-sm font-medium"
                            style={{ background: '#111622', border: '1px solid rgba(0, 245, 212,.2)', color: '#E2E8F0' }}
                          >
                            <option value="pending">Pending</option>
                            <option value="reviewed">Reviewed</option>
                            <option value="resolved">Resolved</option>
                          </select>
                        </td>
                        <td className="px-5 py-4 text-sm" style={{ color: 'rgba(226, 232, 240,.6)' }}>{report.userId?.name || 'System'}</td>
                        <td className="px-5 py-4 text-sm" style={{ color: 'rgba(226, 232, 240,.5)' }}>{new Date(report.createdAt).toLocaleString()}</td>
                        <td className="px-5 py-4">
                          <button className="p-2 rounded-lg border border-transparent transition-all" style={{ color: '#00F5D4', background: 'rgba(0, 245, 212,.1)' }}>
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
      `}</style>
    </div>
  );
}
