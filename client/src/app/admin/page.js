'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { getToken, clearToken } from '../../lib/auth';
import { 
  LogOut, Users, ShieldAlert, ShieldCheck, Activity, 
  Search, Filter, Plus, Edit, Trash2, RefreshCcw, Loader2,
  BarChart3, FileText, Key
} from 'lucide-react';

const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function AdminDashboard() {
  const router = useRouter();
  const [token, setTokenState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Admin data states
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [detectionLogs, setDetectionLogs] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [reports, setReports] = useState([]);
  
  // UI states
  const [activeSection, setActiveSection] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 10 });

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

  function renderThreatBadge(status) {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower === 'safe') return <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 border border-green-200"><ShieldCheck className="w-3 h-3 mr-1" /> Safe</span>;
    if (statusLower === 'suspicious') return <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800 border border-yellow-200"><ShieldAlert className="w-3 h-3 mr-1" /> Suspicious</span>;
    if (statusLower === 'malicious') return <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 border border-red-200"><ShieldAlert className="w-3 h-3 mr-1" /> Malicious</span>;
    return <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">{status}</span>;
  }

  function renderStatusBadge(status) {
    const colors = {
      pending: 'bg-blue-100 text-blue-800 border-blue-200',
      reviewed: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      resolved: 'bg-green-100 text-green-800 border-green-200',
    };
    const colorClass = colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
    return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${colorClass}`}>{status}</span>;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 font-medium">Loading admin dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => router.replace('/dashboard')}
            className="mt-4 inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage users, view analytics, and monitor platform activity.</p>
        </div>
        <button
          onClick={() => {
            clearToken();
            router.replace('/login');
          }}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 border"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b pb-4">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'users', label: 'Users', icon: Users },
          { id: 'logs', label: 'Detection Logs', icon: Activity },
          { id: 'keywords', label: 'Keywords', icon: Key },
          { id: 'reports', label: 'Reports', icon: FileText },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id)}
            className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeSection === tab.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80'
            }`}
          >
            <tab.icon className="w-4 h-4 mr-2" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Section */}
      {activeSection === 'overview' && analytics && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-muted-foreground">Total Users</div>
                <Users className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="text-3xl font-bold mt-2">{analytics.users.total}</div>
              <div className="text-xs text-muted-foreground mt-1">{analytics.users.recent} new this week</div>
            </div>
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-muted-foreground">Total Scans</div>
                <Activity className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="text-3xl font-bold mt-2">{analytics.scans.total}</div>
              <div className="text-xs text-muted-foreground mt-1">{analytics.scans.recent} this week</div>
            </div>
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-muted-foreground">Threats Detected</div>
                <ShieldAlert className="w-5 h-5 text-red-500" />
              </div>
              <div className="text-3xl font-bold mt-2 text-red-600">{analytics.scans.suspicious + analytics.scans.malicious}</div>
              <div className="text-xs text-muted-foreground mt-1">{analytics.scans.maliciousRatio.toFixed(1)}% malicious</div>
            </div>
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-muted-foreground">Reports</div>
                <FileText className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="text-3xl font-bold mt-2">{analytics.reports.total}</div>
              <div className="text-xs text-muted-foreground mt-1">{analytics.reports.pending} pending</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Scan Distribution</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">URL Scans</span>
                  <span className="font-semibold">{analytics.scans.urlScans}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Email Scans</span>
                  <span className="font-semibold">{analytics.scans.emailScans}</span>
                </div>
              </div>
            </div>
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Threat Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-600">Safe</span>
                  <span className="font-semibold">{analytics.scans.safe}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-yellow-600">Suspicious</span>
                  <span className="font-semibold">{analytics.scans.suspicious}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-red-600">Malicious</span>
                  <span className="font-semibold">{analytics.scans.malicious}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Section */}
      {activeSection === 'users' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">User Management</h2>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-md text-sm"
                />
              </div>
            </div>
          </div>
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Role</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Created</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users
                  .filter(user => 
                    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    user.email.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((user) => (
                    <tr key={user._id} className="border-t">
                      <td className="px-4 py-3 text-sm">{user.name}</td>
                      <td className="px-4 py-3 text-sm">{user.email}</td>
                      <td className="px-4 py-3 text-sm">
                        <select
                          value={user.role}
                          onChange={(e) => handleUpdateUserRole(user._id, e.target.value)}
                          className="px-2 py-1 border rounded text-sm"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-sm">{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-sm">
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="text-red-600 hover:text-red-700"
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
      )}

      {/* Detection Logs Section */}
      {activeSection === 'logs' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Detection Logs</h2>
            <button
              onClick={loadAdminData}
              className="inline-flex items-center px-4 py-2 border rounded-md text-sm hover:bg-accent"
            >
              <RefreshCcw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Content</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">User</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {detectionLogs.map((log) => (
                  <tr key={log._id} className="border-t">
                    <td className="px-4 py-3 text-sm capitalize">{log.scanType}</td>
                    <td className="px-4 py-3 text-sm max-w-xs truncate">{log.content}</td>
                    <td className="px-4 py-3 text-sm">{renderThreatBadge(log.result.threatStatus)}</td>
                    <td className="px-4 py-3 text-sm">{log.userId?.name || 'Unknown'}</td>
                    <td className="px-4 py-3 text-sm">{new Date(log.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Keywords Section */}
      {activeSection === 'keywords' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Keyword Management</h2>
            <button className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Keyword
            </button>
          </div>
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">Keyword</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Category</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Points</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {keywords.map((keyword) => (
                  <tr key={keyword._id} className="border-t">
                    <td className="px-4 py-3 text-sm font-medium">{keyword.keyword}</td>
                    <td className="px-4 py-3 text-sm capitalize">{keyword.category}</td>
                    <td className="px-4 py-3 text-sm">{keyword.points}</td>
                    <td className="px-4 py-3 text-sm">
                      {keyword.isActive ? (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">Active</span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">Inactive</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => handleDeleteKeyword(keyword._id)}
                        className="text-red-600 hover:text-red-700"
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
      )}

      {/* Reports Section */}
      {activeSection === 'reports' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Reports Management</h2>
          </div>
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">User</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Created</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report._id} className="border-t">
                    <td className="px-4 py-3 text-sm capitalize">{report.reportType}</td>
                    <td className="px-4 py-3 text-sm">
                      <select
                        value={report.status}
                        onChange={(e) => handleUpdateReportStatus(report._id, e.target.value)}
                        className="px-2 py-1 border rounded text-sm"
                      >
                        <option value="pending">Pending</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-sm">{report.userId?.name || 'System'}</td>
                    <td className="px-4 py-3 text-sm">{new Date(report.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm">
                      <button className="text-blue-600 hover:text-blue-700 mr-2">
                        <Edit className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
