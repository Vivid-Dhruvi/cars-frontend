'use client';

import React, { useRef, useState, useEffect } from 'react';
import { 
  LayoutDashboard, Shield, FileText, CreditCard, Lock, Sparkles, ArrowLeft, 
  Search, Filter, Download, ChevronRight, UserCheck, TrendingUp, DollarSign,
  Bell, MapPin, Tag, Sliders, Layers, Settings, LogOut, ChevronDown, CheckCircle2, 
  Car, Eye, EyeOff, Image as ImageIcon, ExternalLink, RefreshCw, X, AlertCircle, Mail
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const [adminTab, setAdminTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [navigationOpen, setNavigationOpen] = useState(false);
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhotosModal, setSelectedPhotosModal] = useState(null); // { inspectionId, photos, vehicleInfo, userInfo }
  const menuRef = useRef(null);

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const selectTab = (tab) => { 
    setAdminTab(tab); 
    setNavigationOpen(false); 
    if (navigationOpen) menuRef.current?.focus(); 
  };

  const fetchInspections = async (tokenOverride) => {
    try {
      setLoading(true);
      const token = tokenOverride || (typeof window !== 'undefined' ? (sessionStorage.getItem('carsinsure_admin_token') || localStorage.getItem('carsinsure_admin_token')) : '');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const res = await fetch(`${API_BASE}/api/admin/inspections`, { headers });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.inspections)) {
          setInspections(data.inspections);
        }
      } else if (res.status === 401) {
        setIsAuthenticated(false);
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('carsinsure_admin_token');
          localStorage.removeItem('carsinsure_admin_token');
        }
      }
    } catch (err) {
      console.error('Failed to load inspections:', err);
    } finally {
      setLoading(false);
    }
  };

  // Verify session on mount
  useEffect(() => {
    const savedToken = typeof window !== 'undefined' ? (sessionStorage.getItem('carsinsure_admin_token') || localStorage.getItem('carsinsure_admin_token')) : null;
    if (!savedToken) {
      setCheckingAuth(false);
      setIsAuthenticated(false);
      return;
    }

    fetch(`${API_BASE}/api/admin/check-auth`, {
      headers: { 'Authorization': `Bearer ${savedToken}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.authenticated) {
          setIsAuthenticated(true);
          fetchInspections(savedToken);
        } else {
          setIsAuthenticated(false);
          sessionStorage.removeItem('carsinsure_admin_token');
          localStorage.removeItem('carsinsure_admin_token');
        }
      })
      .catch(() => setIsAuthenticated(false))
      .finally(() => setCheckingAuth(false));
  }, [API_BASE]);

  // Handle Login
  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!adminPassword || !adminPassword.trim()) {
      setLoginError('Please enter the admin password');
      return;
    }
    try {
      setIsLoggingIn(true);
      setLoginError('');
      const res = await fetch(`${API_BASE}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPassword.trim() })
      });
      const data = await res.json();
      if (res.ok && data.success && data.token) {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('carsinsure_admin_token', data.token);
          localStorage.setItem('carsinsure_admin_token', data.token);
        }
        setIsAuthenticated(true);
        setAdminPassword('');
        fetchInspections(data.token);
      } else {
        setLoginError(data.error || 'Incorrect admin password. Please try again.');
      }
    } catch (err) {
      setLoginError('Network error connecting to authentication server.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('carsinsure_admin_token');
      localStorage.removeItem('carsinsure_admin_token');
    }
    setIsAuthenticated(false);
    setInspections([]);
  };

  // Filter inspections based on search query
  const filteredInspections = inspections.filter((item) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const name = (item.user_info?.name || `${item.user_info?.firstName || ''} ${item.user_info?.surname || ''}`).toLowerCase();
    const email = (item.user_info?.email || '').toLowerCase();
    const plate = (item.vehicle_info?.plateNumber || '').toLowerCase();
    const make = (item.vehicle_info?.makeModel || '').toLowerCase();
    const id = (item.inspection_id || '').toLowerCase();
    return name.includes(term) || email.includes(term) || plate.includes(term) || make.includes(term) || id.includes(term);
  });

  // Calculate live statistics
  const totalCount = inspections.length;
  const withFindings = inspections.filter(i => (i.findings || []).length > 0).length;
  const cleanCount = inspections.filter(i => (i.findings || []).length === 0).length;
  const emailSentCount = inspections.filter(i => i.email_sent === true).length;

  // Export to CSV helper
  const handleExportCSV = () => {
    if (inspections.length === 0) {
      alert('No inspection records to export.');
      return;
    }
    const headers = ['Inspection ID', 'Date', 'Customer Name', 'Customer Email', 'Findings Count', 'Email Sent', 'Report PDF URL', 'Uploaded Photos Gallery URL'];
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const rows = inspections.map(i => {
      const name = i.user_info?.name || `${i.user_info?.firstName || ''} ${i.user_info?.surname || ''}`.trim() || 'N/A';
      const email = i.user_info?.email || 'N/A';
      const date = i.created_at ? new Date(i.created_at).toISOString() : 'N/A';
      const findingsCount = (i.findings || []).length;
      const emailSent = i.email_sent ? 'YES' : 'NO';
      const pdfUrl = i.pdf_url ? `${API_BASE}${i.pdf_url}` : `${API_BASE}/api/reports/${i.inspection_id}/pdf`;
      const photosGalleryUrl = `${origin}/admin/photos?id=${i.inspection_id}`;
      return [
        `"${i.inspection_id}"`,
        `"${date}"`,
        `"${name.replace(/"/g, '""')}"`,
        `"${email.replace(/"/g, '""')}"`,
        findingsCount,
        `"${emailSent}"`,
        `"${pdfUrl}"`,
        `"${photosGalleryUrl}"`
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `carinsurent-inspections-report-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ── AUTH CHECKING STATE ──
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-[#022a5b]" />
        <span className="text-xs font-semibold text-slate-500">Verifying administrator credentials...</span>
      </div>
    );
  }

  // ── LOGIN SCREEN GATE ──
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 antialiased">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-slate-200 shadow-xl flex flex-col gap-6">
          <div className="flex flex-col items-center text-center gap-2">
            <div className="w-14 h-14 rounded-2xl bg-[#022a5b] text-white flex items-center justify-center shadow-md">
              <Shield className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-2">CarInsuRent Admin</h1>
            <p className="text-xs text-slate-500 max-w-xs">
              Protected Administrator Portal. Please enter your master password to unlock vehicle inspection records.
            </p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            {loginError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{loginError}</span>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label htmlFor="admin-pass-field" className="text-xs font-bold text-slate-700">
                Admin Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  id="admin-pass-field"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter administrator password..."
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#022a5b] focus:bg-white transition-all text-slate-900"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 bg-[#022a5b] hover:bg-[#022a5b]/90 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-1"
            >
              {isLoggingIn ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Sign In to Dashboard</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Cloudways Secure Host</span>
            <Link href="/" className="hover:text-slate-700 transition-colors font-semibold">
              ← Back to Scanner
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex flex-col lg:flex-row antialiased">
      
      {/* EXECUTIVE LIGHT SIDEBAR */}
      <aside className="w-full lg:w-64 bg-white text-slate-900 p-5 flex flex-col justify-between shrink-0 lg:min-h-screen border-r border-slate-200 shadow-xs">
        <div className="flex flex-col gap-6">
          {/* Admin App Title */}
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-[#022a5b] text-white flex items-center justify-center font-bold shadow-xs">
              <Shield className="w-4.5 h-4.5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 text-base tracking-tight leading-none">CarInsuRent Admin</span>
              <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-0.5">Reports & Storage</span>
            </div>
            <button 
              ref={menuRef} 
              type="button" 
              aria-expanded={navigationOpen} 
              aria-controls="admin-navigation" 
              onClick={() => setNavigationOpen(open => !open)} 
              className="ml-auto min-h-10 rounded-xl border border-slate-200 px-3 text-xs font-bold lg:hidden text-slate-700 bg-slate-50"
            >
              {navigationOpen ? 'Close' : 'Menu'}
            </button>
          </div>

          {/* LISTING CONTENT GROUP */}
          <div id="admin-navigation" className={`${navigationOpen ? 'flex' : 'hidden'} flex-col gap-4 lg:flex`}>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">Navigation</span>
            <nav className="flex flex-col gap-1">
              {[
                { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
                { id: 'inspections', label: 'All Generated Reports', icon: FileText, badge: totalCount },
                { id: 'users', label: 'Clients & Emails', icon: Shield, badge: totalCount },
                /* { id: 'storage', label: 'AI Image Storage', icon: ImageIcon }, */
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = adminTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    aria-current={isActive ? 'page' : undefined}
                    onClick={() => selectTab(tab.id)}
                    className={`flex items-center justify-between min-h-10 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-[#022a5b] text-white font-bold shadow-xs' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </div>
                    {tab.badge !== undefined && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mt-3">Quick Export</span>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2.5 min-h-10 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span>Export CSV Spreadsheet</span>
            </button>
          </div>
        </div>

        {/* Sidebar Footer User Info */}
        <div className="pt-4 border-t border-slate-100 hidden lg:flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#022a5b]/10 text-[#022a5b] font-bold text-xs flex items-center justify-center border border-[#022a5b]/20">CR</div>
            <div>
              <span className="text-xs font-bold text-slate-900 block leading-none">CarInsuRent Team</span>
              <span className="text-[11px] text-slate-400">Cloudways Host</span>
            </div>
          </div>
          <button 
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-xs font-bold"
            title="Sign Out of Admin"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN DASHBOARD CONTENT AREA */}
      <main className="min-w-0 flex-1 p-4 sm:p-6 xl:p-8 flex flex-col gap-6">
        
        {/* Top Header Bar */}
        <div className="w-full bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-xs text-slate-500 font-medium">
            <FileText className="w-4 h-4 text-[#022a5b]" />
            <span className="font-bold text-slate-900 text-sm">
              {adminTab === 'overview' && 'Inspection Reports Log'}
              {adminTab === 'inspections' && 'All Generated Reports (Full Archive)'}
              {adminTab === 'users' && 'Clients & Email Dispatches'}
              {adminTab === 'storage' && 'Stored Images for AI Training'}
            </span>
          </div>

          <div className="flex min-w-0 flex-wrap items-center gap-3 xl:flex-1 xl:justify-end">
            <div className="relative min-w-0 flex-1 basis-full sm:basis-auto xl:max-w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input 
                type="text" 
                placeholder="Search by name, email, plate, ID..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search inspections" 
                className="min-h-11 pl-9 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#022a5b] w-full"
              />
            </div>
            
            <button 
              onClick={() => fetchInspections()}
              disabled={loading}
              className="min-h-11 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2 border border-slate-200 transition-colors cursor-pointer shrink-0"
              title="Refresh inspection list"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <button 
              onClick={handleLogout}
              type="button"
              className="min-h-11 px-3.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-200 transition-colors cursor-pointer shrink-0"
              title="Sign Out of Admin Dashboard"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>

            <Link href="/" className="min-h-11 shrink-0 px-4 bg-[#022a5b] hover:bg-[#022a5b]/90 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer">
              <ArrowLeft className="w-3.5 h-3.5" /> 
              <span>Back to Scanner</span>
            </Link>
          </div>
        </div>

        {/* TAB 1 & TAB 2: OVERVIEW & ALL INSPECTIONS */}
        {(adminTab === 'overview' || adminTab === 'inspections') && (
          <div className="flex flex-col gap-5">
            
            {/* Real Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 mb-1">
                    <span className="font-semibold">Total Reports Generated</span>
                    <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">Live</span>
                  </div>
                  <span className="text-3xl font-extrabold text-slate-900">{totalCount}</span>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col items-start gap-1 text-[11px] text-slate-400">
                  <span>Processed by CarInsuRent AI vision</span>
                  <span>Stored on Cloudways server disk</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 mb-1">
                    <span className="font-semibold">Damages Cataloged</span>
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">Alerts</span>
                  </div>
                  <span className="text-3xl font-extrabold text-slate-900">{withFindings}</span>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col items-start gap-1 text-[11px] text-slate-400">
                  <span>Vehicles with detected defects</span>
                  <span>Mapped to 360° car blueprint</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 mb-1">
                    <span className="font-semibold">Clean Vehicles (0 Defects)</span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">Verified</span>
                  </div>
                  <span className="text-3xl font-extrabold text-slate-900">{cleanCount}</span>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col items-start gap-1 text-[11px] text-slate-400">
                  <span>Clean condition pass certificates</span>
                  <span>Instant peace-of-mind report</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 mb-1">
                    <span className="font-semibold">PDF Reports Emailed</span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">Dispatched</span>
                  </div>
                  <span className="text-3xl font-extrabold text-slate-900">{emailSentCount}</span>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col items-start gap-1 text-[11px] text-slate-400">
                  <span>Certificates sent to client inboxes</span>
                  <span>100% automated delivery</span>
                </div>
              </div>
            </div>

            {/* Inspections Master Table */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                    <Car className="w-4 h-4 text-[#022a5b]" />
                    <span>Inspection Reports Directory</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Showing {filteredInspections.length} of {totalCount} total vehicle inspection reports.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleExportCSV}
                    className="min-h-10 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-600" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-500">
                  <RefreshCw className="w-6 h-6 animate-spin text-[#022a5b]" />
                  <span className="text-xs font-medium">Loading inspection records from server...</span>
                </div>
              ) : filteredInspections.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  No inspection reports match your search criteria.
                </div>
              ) : (
                <div role="region" aria-label="Inspection reports table" tabIndex={0} className="max-w-full overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[11px] bg-slate-50/80 font-semibold">
                        <th className="p-3.5 rounded-l-xl">Date & ID</th>
                        <th className="p-3.5">Customer Name & Email</th>
                        {/* VEHICLE DETAILS - COMMENTED OUT PER USER REQUEST
                        <th className="p-3.5">Vehicle Details</th>
                        */}
                        <th className="p-3.5">Damage Findings</th>
                        <th className="p-3.5">Email Status</th>
                        <th className="p-3.5">Report Link</th>
                        <th className="p-3.5 rounded-r-xl">Uploaded Images</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredInspections.map((row) => {
                        const name = row.user_info?.name || `${row.user_info?.firstName || ''} ${row.user_info?.surname || ''}`.trim() || 'Valued Client';
                        const email = row.user_info?.email || 'N/A';
                        const make = row.vehicle_info?.makeModel || 'Vehicle';
                        const plate = row.vehicle_info?.plateNumber || 'No Plate';
                        const company = row.vehicle_info?.company || '';
                        const dateFormatted = row.created_at 
                          ? new Date(row.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) 
                          : 'Recent';
                        const findingsCount = (row.findings || []).length;
                        const photosDict = row.photos || {};
                        const uniquePhotosList = Array.from(new Set(
                          Object.values(photosDict)
                            .map(p => (typeof p === 'string' ? p : p?.url || p?.data || p?.filename))
                            .filter(Boolean)
                        ));
                        const photosCount = uniquePhotosList.length > 0 ? uniquePhotosList.length : Object.keys(photosDict).length;
                        const pdfDirectUrl = row.pdf_url ? `${API_BASE}${row.pdf_url}` : `${API_BASE}/api/reports/${row.inspection_id}/pdf`;

                        return (
                          <tr key={row.inspection_id} className="hover:bg-slate-50/80 transition-colors">
                            {/* Date & ID */}
                            <td className="p-3.5">
                              <span className="font-semibold text-slate-900 block">{dateFormatted}</span>
                              <span className="text-[10px] text-slate-400 font-mono">{row.inspection_id}</span>
                            </td>

                            {/* Customer Name & Email */}
                            <td className="p-3.5">
                              <span className="font-bold text-slate-900 block">{name}</span>
                              <span className="text-[11px] text-slate-500 select-all">{email}</span>
                            </td>

                            {/* VEHICLE DETAILS - COMMENTED OUT PER USER REQUEST
                            <td className="p-3.5">
                              <span className="font-medium text-slate-800 block">
                                {make} {company ? `(${company})` : ''}
                              </span>
                              <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                {plate}
                              </span>
                            </td>
                            */}

                            {/* Damages Count */}
                            <td className="p-3.5">
                              {findingsCount === 0 ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                  ✓ Clean Vehicle
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                                  {findingsCount} Defect{findingsCount !== 1 ? 's' : ''}
                                </span>
                              )}
                            </td>

                            {/* Email Dispatched */}
                            <td className="p-3.5">
                              {row.email_sent ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                  <Mail className="w-3 h-3" /> Sent
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                                  Pending
                                </span>
                              )}
                            </td>

                            {/* Report PDF Link */}
                            <td className="p-3.5">
                              <a
                                href={pdfDirectUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#022a5b] text-white hover:bg-[#022a5b]/90 text-[11px] font-bold shadow-2xs transition-colors cursor-pointer"
                              >
                                <Download className="w-3 h-3" />
                                <span>PDF Certificate</span>
                              </a>
                            </td>

                            {/* Uploaded Images Link */}
                            <td className="p-3.5">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setSelectedPhotosModal({
                                    inspectionId: row.inspection_id,
                                    photos: photosDict,
                                    vehicleInfo: row.vehicle_info,
                                    userInfo: row.user_info
                                  })}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold border border-slate-200 transition-colors cursor-pointer"
                                  title="Open fast photo viewer popup"
                                >
                                  <ImageIcon className="w-3 h-3 text-slate-600" />
                                  <span>View Photos ({photosCount > 0 ? photosCount : '14'})</span>
                                </button>
                                <a
                                  href={`/admin/photos?id=${row.inspection_id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 text-[11px] font-bold border border-sky-200 transition-colors cursor-pointer"
                                  title="Open high-res full page photo gallery in new tab"
                                >
                                  <ExternalLink className="w-3 h-3 text-sky-600" />
                                  <span>Gallery ↗</span>
                                </a>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 3: REGISTERED CLIENTS & EMAILS */}
        {/* TAB 3: REGISTERED CLIENTS & EMAILS (FULLY SEARCHABLE) */}
        {adminTab === 'users' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">Registered Clients & Email Dispatch Log</h3>
                <p className="text-xs text-slate-500">
                  Showing {filteredInspections.length} of {totalCount} client records{searchTerm ? ` matching "${searchTerm}"` : ''}.
                </p>
              </div>

              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                >
                  Clear Search
                </button>
              )}
            </div>

            {filteredInspections.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                {searchTerm 
                  ? `No clients found matching "${searchTerm}". Please try a different name, email, plate, or reference ID.`
                  : 'No client records available yet.'}
              </div>
            ) : (
              <div role="region" aria-label="Clients directory table" tabIndex={0} className="max-w-full overflow-x-auto mt-2">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[11px] bg-slate-50/80 font-semibold">
                      <th className="p-3.5 rounded-l-xl">Client Name & Email</th>
                      {/* VEHICLE & PLATE - COMMENTED OUT PER USER REQUEST
                      <th className="p-3.5">Vehicle & Plate</th>
                      */}
                      <th className="p-3.5">Inspection Ref</th>
                      <th className="p-3.5">Date & Time</th>
                      <th className="p-3.5">Email Status</th>
                      <th className="p-3.5 rounded-r-xl">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredInspections.map((row) => {
                      const name = row.user_info?.name || `${row.user_info?.firstName || ''} ${row.user_info?.surname || ''}`.trim() || 'Valued Client';
                      const email = row.user_info?.email || 'No email provided';
                      const make = row.vehicle_info?.makeModel || 'Vehicle';
                      const plate = row.vehicle_info?.plateNumber || 'No Plate';
                      const dateFormatted = row.created_at 
                        ? new Date(row.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) 
                        : 'Recent';
                      const pdfDirectUrl = row.pdf_url ? `${API_BASE}${row.pdf_url}` : `${API_BASE}/api/reports/${row.inspection_id}/pdf`;
                      const photosDict = row.photos || {};
                      const uniquePhotosList = Array.from(new Set(
                        Object.values(photosDict)
                          .map(p => (typeof p === 'string' ? p : p?.url || p?.data || p?.filename))
                          .filter(Boolean)
                      ));
                      const photosCount = uniquePhotosList.length > 0 ? uniquePhotosList.length : Object.keys(photosDict).length;

                      return (
                        <tr key={row.inspection_id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3.5">
                            <span className="font-bold text-slate-900 block">{name}</span>
                            <span className="text-[11px] text-slate-500 select-all">{email}</span>
                          </td>
                          {/* VEHICLE & PLATE - COMMENTED OUT PER USER REQUEST
                          <td className="p-3.5">
                            <span className="font-medium text-slate-800 block">{make}</span>
                            <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                              {plate}
                            </span>
                          </td>
                          */}
                          <td className="p-3.5 font-mono text-[11px] text-slate-600 font-semibold">
                            {row.inspection_id}
                          </td>
                          <td className="p-3.5 text-slate-600">
                            {dateFormatted}
                          </td>
                          <td className="p-3.5">
                            {row.email_sent ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                <Mail className="w-3 h-3" /> Dispatched
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                                Pending
                              </span>
                            )}
                          </td>
                          <td className="p-3.5">
                            <div className="flex items-center gap-2">
                              <a
                                href={pdfDirectUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#022a5b] text-white hover:bg-[#022a5b]/90 text-[10px] font-bold shadow-2xs transition-colors cursor-pointer"
                              >
                                <Download className="w-2.5 h-2.5" />
                                <span>PDF</span>
                              </a>
                              <button
                                type="button"
                                onClick={() => setSelectedPhotosModal({
                                  inspectionId: row.inspection_id,
                                  photos: photosDict,
                                  vehicleInfo: row.vehicle_info,
                                  userInfo: row.user_info
                                })}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold border border-slate-200 transition-colors cursor-pointer"
                                title="Open photos popup"
                              >
                                <ImageIcon className="w-2.5 h-2.5 text-slate-600" />
                                <span>Photos ({photosCount})</span>
                              </button>
                              <a
                                href={`/admin/photos?id=${row.inspection_id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 text-[10px] font-bold border border-sky-200 transition-colors cursor-pointer"
                                title="Open full gallery in new tab"
                              >
                                <ExternalLink className="w-2.5 h-2.5 text-sky-600" />
                                <span>Gallery ↗</span>
                              </a>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── PREVIOUS TAB 4: AI IMAGE STORAGE (PRESERVED AS COMMENT) ──
        {adminTab === 'storage' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-[#022a5b]" />
              <h3 className="font-bold text-base text-slate-900">Server Disk Image Storage for AI Training</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              All vehicle photos submitted by clients are permanently stored on the Cloudways server filesystem under /uploads/inspections/[id]/.
            </p>
          </div>
        )}
        ── END PREVIOUS TAB 4: AI IMAGE STORAGE ── */}

      </main>

      {/* UPLOADED IMAGES GALLERY MODAL */}
      {selectedPhotosModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between gap-3 bg-slate-50/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#022a5b] text-white flex items-center justify-center shrink-0">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    Uploaded Photos: {selectedPhotosModal.vehicleInfo?.makeModel || 'Vehicle'} ({selectedPhotosModal.vehicleInfo?.plateNumber || 'Inspection'})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Inspection ID: <span className="font-mono text-slate-700">{selectedPhotosModal.inspectionId}</span> • Client: {selectedPhotosModal.userInfo?.name || selectedPhotosModal.userInfo?.email || 'Client'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPhotosModal(null)}
                className="w-9 h-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body: Grid of Stored Photos */}
            <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-blue-700 shrink-0" />
                <span>
                  These original images are saved on the Cloudways server disk and can be used for custom AI training. Click any photo to open full resolution.
                </span>
              </div>

              {(() => {
                const rawPhotos = selectedPhotosModal.photos || {};
                const seen = new Set();
                const uniqueEntries = [];
                for (const [key, photoData] of Object.entries(rawPhotos)) {
                  const urlOrData = typeof photoData === 'string' ? photoData : photoData?.url || photoData?.data || photoData?.filename;
                  if (urlOrData && !seen.has(urlOrData)) {
                    seen.add(urlOrData);
                    uniqueEntries.push({ key, photoData });
                  }
                }
                const displayList = uniqueEntries.length > 0 
                  ? uniqueEntries 
                  : Object.entries(rawPhotos).map(([key, photoData]) => ({ key, photoData }));

                if (displayList.length === 0) {
                  return (
                    <div className="py-12 text-center text-slate-500 text-xs">
                      No images stored for this inspection record.
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {displayList.map(({ key, photoData }, idx) => {
                      const imgSrc = typeof photoData === 'string'
                        ? photoData
                        : photoData?.url 
                          ? (photoData.url.startsWith('http') ? photoData.url : `${API_BASE}${photoData.url}`)
                          : photoData?.data || '';

                      const angleName = key.replace(/_/g, ' ').toUpperCase();

                      return (
                        <div key={key || idx} className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden flex flex-col group">
                          <div className="relative aspect-4/3 bg-slate-200 overflow-hidden">
                            {imgSrc ? (
                              <img 
                                src={imgSrc} 
                                alt={angleName} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                                No image
                              </div>
                            )}
                            <span className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-black/70 text-white rounded text-[10px] font-mono font-bold">
                              {key}
                            </span>
                          </div>
                          <div className="p-2.5 flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-700 truncate text-[11px]">{angleName}</span>
                            {imgSrc && (
                              <a 
                                href={imgSrc} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 text-[11px] font-bold flex items-center gap-0.5"
                                title="Open original"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Inspection Ref: {selectedPhotosModal.inspectionId}
              </span>
              <button
                type="button"
                onClick={() => setSelectedPhotosModal(null)}
                className="px-4 py-2 bg-[#022a5b] text-white rounded-xl text-xs font-bold hover:bg-[#022a5b]/90 transition-colors cursor-pointer"
              >
                Close Gallery
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
