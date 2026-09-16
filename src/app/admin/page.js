'use client';

import React, { useRef, useState } from 'react';
import { 
  LayoutDashboard, Shield, FileText, CreditCard, Lock, Sparkles, ArrowLeft, 
  Search, Filter, Download, ChevronRight, UserCheck, TrendingUp, DollarSign,
  Bell, MapPin, Tag, Sliders, Layers, Settings, LogOut, ChevronDown, CheckCircle2, Car
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const [adminTab, setAdminTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [navigationOpen, setNavigationOpen] = useState(false);
  const menuRef = useRef(null);
  const selectTab = (tab) => { setAdminTab(tab); setNavigationOpen(false); if (navigationOpen) menuRef.current?.focus(); };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex flex-col lg:flex-row antialiased">
      
      {/* EXECUTIVE LIGHT SIDEBAR */}
      <aside className="w-full lg:w-64 bg-white text-slate-900 p-5 flex flex-col justify-between shrink-0 lg:min-h-screen border-r border-slate-200 shadow-xs">
        <div className="flex flex-col gap-6">
          {/* Admin App Title */}
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-xs">
              <Shield className="w-4.5 h-4.5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 text-base tracking-tight leading-none">CarsInsure Admin</span>
              <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-0.5">Control Panel</span>
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
                { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
                { id: 'inspections', label: 'Inspections Log', icon: FileText },
                { id: 'users', label: 'Registered Clients', icon: Shield },
                { id: 'revenue', label: 'Revenue & Payments', icon: CreditCard },
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
                        ? 'bg-slate-900 text-white font-bold shadow-xs' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </div>
                  </button>
                );
              })}
            </nav>

            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mt-3">Settings</span>
            <nav className="flex flex-col gap-1">
              <button
                aria-current={adminTab === 'settings' ? 'page' : undefined}
                onClick={() => selectTab('settings')}
                className={`flex items-center justify-between min-h-10 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  adminTab === 'settings' 
                    ? 'bg-slate-900 text-white font-bold shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Settings className="w-4 h-4" />
                  <span>System Parameters</span>
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Sidebar Footer User Info */}
        <div className="pt-4 border-t border-slate-100 hidden lg:flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center border border-slate-200">A</div>
            <div>
              <span className="text-xs font-bold text-slate-900 block leading-none">Admin User</span>
              <span className="text-[11px] text-slate-400">admin@carsinsure.ai</span>
            </div>
          </div>
          <Link href="/" className="text-slate-400 hover:text-slate-700 transition-colors">
            <LogOut className="w-4 h-4" />
          </Link>
        </div>
      </aside>

      {/* MAIN DASHBOARD CONTENT AREA */}
      <main className="min-w-0 flex-1 p-4 sm:p-6 xl:p-8 flex flex-col gap-6">
        
        {/* Top Header Bar */}
        <div className="w-full bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-xs text-slate-500 font-medium">
            <LayoutDashboard className="w-4 h-4 text-slate-900" />
            <span className="font-bold text-slate-900 text-sm">Dashboard Overview</span>
          </div>

          <div className="flex min-w-0 flex-wrap items-center gap-3 xl:flex-1 xl:justify-end">
            <div className="relative min-w-0 flex-1 basis-full sm:basis-auto xl:max-w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input 
                type="text" 
                placeholder="Search inspections, plate #..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search inspections" 
                className="min-h-11 pl-9 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 w-full"
              />
            </div>
            <div className="w-11 h-11 shrink-0 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 cursor-pointer relative">
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-2.5 right-2.5"></span>
            </div>
            <Link href="/" className="min-h-11 shrink-0 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Web App
            </Link>
          </div>
        </div>

        {/* TAB 1: OVERVIEW */}
        {adminTab === 'overview' && (
          <div className="flex flex-col gap-5">
            
            {/* Header Title */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-slate-900" />
                <h2 className="text-xl font-bold text-slate-900">Platform Analytics</h2>
              </div>
              <button className="min-h-10 px-3.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 flex items-center gap-2 hover:bg-slate-50 shadow-xs cursor-pointer">
                <Sliders className="w-3.5 h-3.5 text-slate-500" /> Customize Layout
              </button>
            </div>

            {/* Stat Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 mb-1">
                    <span className="font-semibold">Total Inspections</span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">↗ +57.1%</span>
                  </div>
                  <span className="text-3xl font-extrabold text-slate-900">3,890</span>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col items-start gap-1 text-[11px] text-slate-400">
                  <span>Real-time inspection aggregate</span>
                  <span>Updated just now</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 mb-1">
                    <span className="font-semibold">Total Revenue ($3 Unlock)</span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">↗ +83.4%</span>
                  </div>
                  <span className="text-3xl font-extrabold text-slate-900">$11,670.00</span>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col items-start gap-1 text-[11px] text-slate-400">
                  <span>Verified captured checkouts</span>
                  <span>iCredit, Apple Pay, Google Pay</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 mb-1">
                    <span className="font-semibold">Active Accounts</span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">↗ +71.4%</span>
                  </div>
                  <span className="text-3xl font-extrabold text-slate-900">1,248</span>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col items-start gap-1 text-[11px] text-slate-400">
                  <span>Fleet & rental vehicle accounts</span>
                  <span>Active coverage</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 mb-1">
                    <span className="font-semibold">Paywall Conversion</span>
                    <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">72.6%</span>
                  </div>
                  <span className="text-3xl font-extrabold text-slate-900">72.6%</span>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col items-start gap-1 text-[11px] text-slate-400">
                  <span>Full report unlock rate</span>
                  <span>High commercial conversion</span>
                </div>
              </div>
            </div>

            {/* AI Inspection Trends Chart Card */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-base text-slate-900">Inspection Trends & Volume</h3>
                  <p className="text-xs text-slate-500 mt-0.5">360° photo inspection volume over time</p>
                </div>
                <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
                  <button className="min-h-8 px-3 py-1 bg-white text-slate-900 rounded-lg shadow-xs cursor-pointer">Last 3 months</button>
                  <button className="min-h-8 px-3 py-1 text-slate-500 hover:text-slate-900 cursor-pointer">Last 30 days</button>
                  <button className="min-h-8 px-3 py-1 text-slate-500 hover:text-slate-900 cursor-pointer">Last 7 days</button>
                </div>
              </div>

              <div className="w-full h-44 bg-slate-50/80 rounded-2xl border border-slate-200/80 p-3 flex items-center justify-center">
                <svg className="w-full h-full" viewBox="0 0 1000 200" fill="none" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="slateGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0F172A" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#0F172A" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  <path 
                    d="M 0 140 C 100 130, 150 70, 250 70 C 350 70, 400 150, 500 150 C 600 150, 650 30, 750 30 C 850 30, 900 120, 1000 60 L 1000 190 L 0 190 Z" 
                    fill="url(#slateGradient)" 
                  />
                  <path 
                    d="M 0 140 C 100 130, 150 70, 250 70 C 350 70, 400 150, 500 150 C 600 150, 650 30, 750 30 C 850 30, 900 120, 1000 60" 
                    stroke="#0F172A" 
                    strokeWidth="3" 
                    strokeLinecap="round"
                    fill="none" 
                  />
                </svg>
              </div>
            </div>

            {/* Recent Inspections Table */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                    <Car className="w-4 h-4 text-slate-700" />
                    <span>Recent Vehicle Inspections</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Overview of customer car scans processed by AI vision engine.</p>
                </div>
                <button className="min-h-10 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 cursor-pointer transition-colors">
                  Refresh Queue
                </button>
              </div>

              <div role="region" aria-label="Recent inspections table" tabIndex={0} className="max-w-full overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[11px] bg-slate-50 font-semibold">
                      <th className="p-3 rounded-l-xl">User Name</th>
                      <th className="p-3">Vehicle & Company</th>
                      <th className="p-3">Plate Number</th>
                      <th className="p-3">Damages</th>
                      <th className="p-3">Payment</th>
                      <th className="p-3 rounded-r-xl">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[
                      { name: 'Marcus Vance', email: 'marcus@fleet.ae', company: 'Avis / Hyundai i30', plate: 'ABC-123', count: '4 Findings', status: 'PAID', amount: '$3.00' },
                      { name: 'Sarah Miller', email: 'sarah@rentscan.ae', company: 'Hertz / Toyota Corolla', plate: 'DXB-9872', count: '0 Defects', status: 'CLEAN', amount: '$0.00' },
                      { name: 'Mohammed Al-Hashimi', email: 'mohammed@enterprise.ae', company: 'Europcar / Nissan Patrol', plate: 'AUH-4410', count: '3 Findings', status: 'PAID', amount: '$3.00' },
                    ].map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3">
                          <span className="font-bold text-slate-900 block">{row.name}</span>
                          <span className="text-[11px] text-slate-400">{row.email}</span>
                        </td>
                        <td className="p-3 text-slate-700 font-medium">{row.company}</td>
                        <td className="p-3 font-mono font-bold text-slate-800">{row.plate}</td>
                        <td className="p-3 text-slate-700">{row.count}</td>
                        <td className="p-3">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            row.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {row.status} ({row.amount})
                          </span>
                        </td>
                        <td className="p-3">
                          <button 
                            onClick={() => alert(`Opening PDF Certificate for ${row.name}...`)} 
                            className="text-blue-600 hover:text-blue-800 font-bold text-xs underline cursor-pointer"
                          >
                            View PDF
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

        {/* TAB 2: INSPECTIONS */}
        {adminTab === 'inspections' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col gap-4">
            <h3 className="font-bold text-base text-slate-900">All Completed Inspections (3,890 Total)</h3>
            <p className="text-xs text-slate-500">Full audit log of pickup and return vehicle scans across UAE.</p>
          </div>
        )}

        {/* TAB 3: USERS */}
        {adminTab === 'users' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col gap-4">
            <h3 className="font-bold text-base text-slate-900">Registered Users Directory (1,248 Accounts)</h3>
            <p className="text-xs text-slate-500">Manage user accounts created via Google, Apple, Facebook, & Email.</p>
          </div>
        )}

        {/* TAB 4: REVENUE */}
        {adminTab === 'revenue' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col gap-4">
            <h3 className="font-bold text-base text-slate-900">Revenue & Payments ($11,670.00)</h3>
            <p className="text-xs text-slate-500">Transactions processed via iCredit, Apple Pay, & Google Pay.</p>
          </div>
        )}

        {/* TAB 5: SETTINGS */}
        {adminTab === 'settings' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col gap-4 max-w-xl">
            <h3 className="font-bold text-base text-slate-900">System Parameters</h3>
            <div className="flex flex-col gap-3 text-xs">
              <div>
                <label htmlFor="report-price" className="font-bold text-slate-700 block mb-1">
                  Full Report Paywall Price ($USD)
                </label>
                <input 
                  id="report-price" 
                  type="text" 
                  defaultValue="3.00" 
                  className="w-full min-h-11 px-3.5 border border-slate-200 rounded-xl bg-slate-50 font-semibold" 
                />
              </div>
              <button 
                onClick={() => alert("Settings saved successfully!")} 
                className="w-fit min-h-11 px-5 bg-slate-900 text-white font-bold rounded-xl mt-2 cursor-pointer hover:bg-slate-800 transition-colors"
              >
                Save Settings
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
