'use client';

import React, { useState } from 'react';
import { 
  LayoutDashboard, Shield, FileText, CreditCard, Lock, Sparkles, ArrowLeft, 
  Search, Filter, Download, ChevronRight, UserCheck, TrendingUp, DollarSign,
  Bell, MapPin, Tag, Sliders, Layers, Settings, LogOut, ChevronDown
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const [adminTab, setAdminTab] = useState('overview'); // overview, inspections, users, revenue, settings
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex flex-col md:flex-row antialiased">
      
      {/* SHADCN WHITE LIGHT SIDEBAR (MATCHING REFERENCE SCREENSHOT) */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 p-5 flex flex-col justify-between shrink-0 min-h-screen">
        <div className="flex flex-col gap-6">
          {/* Admin App Title */}
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-[#0F172A] text-white flex items-center justify-center font-bold">
              <Shield className="w-4.5 h-4.5" />
            </div>
            <span className="font-extrabold text-slate-900 text-lg tracking-tight">Logo. Admin</span>
          </div>

          {/* LISTING CONTENT GROUP */}
          <div className="flex flex-col gap-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">Listing Content</span>
            <nav className="flex flex-col gap-1">
              {[
                { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
                { id: 'inspections', label: 'Inspections Log', icon: FileText },
                { id: 'users', label: 'Registered Users', icon: Shield },
                { id: 'revenue', label: 'Revenue & Payments', icon: CreditCard },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = adminTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setAdminTab(tab.id)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-[#0F172A] text-white shadow-xs font-bold' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </div>
                  </button>
                );
              })}
            </nav>

            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mt-3">Settings & System</span>
            <nav className="flex flex-col gap-1">
              <button
                onClick={() => setAdminTab('settings')}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  adminTab === 'settings' 
                    ? 'bg-[#0F172A] text-white shadow-xs font-bold' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Settings className="w-4 h-4" />
                  <span>System Settings</span>
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Sidebar Footer User Info */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center border border-slate-200">A</div>
            <div>
              <span className="text-xs font-bold text-slate-900 block leading-none">Admin User</span>
              <span className="text-[10px] text-slate-400">admin@rentscan.ae</span>
            </div>
          </div>
          <Link href="/" className="text-slate-400 hover:text-slate-700">
            <LogOut className="w-4 h-4" />
          </Link>
        </div>
      </aside>

      {/* MAIN DASHBOARD CONTENT AREA */}
      <main className="flex-1 p-6 md:p-8 flex flex-col gap-6 overflow-y-auto">
        
        {/* Top Header Bar */}
        <div className="w-full bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <LayoutDashboard className="w-4 h-4 text-[#0F172A]" />
            <span className="font-bold text-slate-900 text-sm">Logo. Admin Overview</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input 
                type="text" 
                placeholder="Search inspections, plate #..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9 pl-9 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0F172A] w-64"
              />
            </div>
            <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 cursor-pointer relative">
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-2 right-2"></span>
            </div>
            <Link href="/" className="h-9 px-4 bg-[#0F172A] hover:bg-[#0F172A] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Web App
            </Link>
          </div>
        </div>

        {/* TAB 1: OVERVIEW (MATCHING REFERENCE SCREENSHOT) */}
        {adminTab === 'overview' && (
          <div className="flex flex-col gap-6">
            
            {/* Header Title */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#0F172A]" />
                <h2 className="text-xl font-bold text-slate-900">Admin Overview</h2>
              </div>
              <button className="h-9 px-3.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 flex items-center gap-2 hover:bg-slate-50 shadow-xs">
                <Sliders className="w-3.5 h-3.5 text-slate-500" /> Customize Layout
              </button>
            </div>

            {/* Stat Cards Row (Exact Match to Screenshot) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span className="font-semibold">Total Bookings / Inspections</span>
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">↗ +57.1%</span>
                  </div>
                  <span className="text-3xl font-extrabold text-slate-900">3,890</span>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Real-time inspection aggregate</span>
                  <span>Updated just now</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span className="font-semibold">Total Revenue</span>
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">↗ +83.4%</span>
                  </div>
                  <span className="text-3xl font-extrabold text-slate-900">$4,892.41</span>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Verified captured payments</span>
                  <span>iCredit, PayPal, Apple Pay</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span className="font-semibold">Active Travelers</span>
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">↗ +71.4%</span>
                  </div>
                  <span className="text-3xl font-extrabold text-slate-900">1,248</span>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Registered end users</span>
                  <span>Excluding admins</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span className="font-semibold">Paywall Conversion</span>
                    <span className="text-[11px] font-bold text-[#0F172A] bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">68.4%</span>
                  </div>
                  <span className="text-3xl font-extrabold text-slate-900">68.4%</span>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>$3.99 report unlocks</span>
                  <span>Global metric</span>
                </div>
              </div>
            </div>

            {/* Travel Bookings & Inspections Chart Card (Fixed Overflow Bounds) */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-slate-900">Travel & Car Inspection Trends</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Inspection trends for the last 3 months</p>
                </div>
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
                  <button className="px-3 py-1 bg-white text-slate-900 rounded-lg shadow-xs">Last 3 months</button>
                  <button className="px-3 py-1 text-slate-500 hover:text-slate-900">Last 30 days</button>
                  <button className="px-3 py-1 text-slate-500 hover:text-slate-900">Last 7 days</button>
                </div>
              </div>

              {/* Smooth Wave Chart (Padded SVG - No Breaking Line) */}
              <div className="w-full h-44 bg-slate-50/80 rounded-2xl border border-slate-200/80 p-3 flex items-center justify-center">
                <svg className="w-full h-full" viewBox="0 0 1000 200" fill="none" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0F172A" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#0F172A" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Smooth Continuous Wave Line Path */}
                  <path 
                    d="M 0 140 C 100 130, 150 70, 250 70 C 350 70, 400 150, 500 150 C 600 150, 650 30, 750 30 C 850 30, 900 120, 1000 60 L 1000 190 L 0 190 Z" 
                    fill="url(#blueGradient)" 
                  />
                  <path 
                    d="M 0 140 C 100 130, 150 70, 250 70 C 350 70, 400 150, 500 150 C 600 150, 650 30, 750 30 C 850 30, 900 120, 1000 60" 
                    stroke="#0F172A" 
                    strokeWidth="3.5" 
                    strokeLinecap="round"
                    fill="none" 
                  />
                </svg>
              </div>
            </div>

            {/* Inspections Pending Approval / Log Table */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-sky-600" /> Recent Vehicle Inspections
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Overview of customer car scans processed by AI vision engine.</p>
                </div>
                <button className="h-9 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200">
                  Refresh Queue
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px] bg-slate-50">
                      <th className="p-3 font-semibold rounded-l-xl">User Name</th>
                      <th className="p-3 font-semibold">Vehicle & Company</th>
                      <th className="p-3 font-semibold">Plate Number</th>
                      <th className="p-3 font-semibold">Damages</th>
                      <th className="p-3 font-semibold">Payment</th>
                      <th className="p-3 font-semibold rounded-r-xl">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[
                      { name: 'User A', email: 'user@example.com', company: 'Avis / Hyundai i30', plate: 'ABC-123', count: '6 Areas', status: 'PAID', amount: '$3.99' },
                      { name: 'Sarah M.', email: 'sarah@rentscan.ae', company: 'Hertz / Toyota Corolla', plate: 'DXB-9872', count: '2 Areas', status: 'FREE', amount: '$0.00' },
                      { name: 'Mohammed A.', email: 'mohammed@domain.ae', company: 'Europcar / Nissan Patrol', plate: 'AUH-4410', count: '5 Areas', status: 'PAID', amount: '$3.99' },
                    ].map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-3">
                          <span className="font-bold text-slate-900 block">{row.name}</span>
                          <span className="text-[11px] text-slate-400">{row.email}</span>
                        </td>
                        <td className="p-3 text-slate-700 font-medium">{row.company}</td>
                        <td className="p-3 font-mono font-semibold text-slate-800">{row.plate}</td>
                        <td className="p-3 text-slate-700">{row.count}</td>
                        <td className="p-3">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${row.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                            {row.status} ({row.amount})
                          </span>
                        </td>
                        <td className="p-3">
                          <button onClick={() => alert(`Opening PDF Report for ${row.name}...`)} className="text-sky-600 hover:text-sky-800 font-bold text-xs underline">
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
            <h3 className="font-bold text-base text-slate-900">Revenue & Payments ($4,892.41)</h3>
            <p className="text-xs text-slate-500">Transactions processed via iCredit, PayPal, & Apple Pay.</p>
          </div>
        )}

        {/* TAB 5: SETTINGS */}
        {adminTab === 'settings' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col gap-4 max-w-xl">
            <h3 className="font-bold text-base text-slate-900">System Parameters</h3>
            <div className="flex flex-col gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Report Paywall Price ($USD)</label>
                <input type="text" defaultValue="3.99" className="w-full h-10 px-3 border border-slate-200 rounded-xl bg-slate-50 font-semibold" />
              </div>
              <button onClick={() => alert("Settings saved!")} className="w-fit h-10 px-5 bg-slate-900 text-white font-bold rounded-xl mt-2">
                Save Settings
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
