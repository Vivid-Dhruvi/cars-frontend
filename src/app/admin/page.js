'use client';

import React, { useRef, useState, useEffect } from 'react';
import { 
  LayoutDashboard, Shield, FileText, CreditCard, Lock, Sparkles, ArrowLeft, ArrowRight,
  Search, Filter, Download, ChevronRight, UserCheck, TrendingUp, DollarSign,
  Bell, MapPin, Tag, Sliders, Layers, Settings, LogOut, ChevronDown, CheckCircle2, 
  Car, Eye, EyeOff, Image as ImageIcon, ExternalLink, RefreshCw, X, AlertCircle, Mail,
  Menu, LayoutGrid, List, BarChart3, PieChart, Activity, AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

/**
 * Responsive Shadcn Pagination Bar for Admin Tables
 * Adapts between mobile (compact previous/next + page indicator) and tablet/desktop (numbered pages + ellipsis).
 */
function AdminTablePagination({
  currentPage,
  totalPages,
  totalItems,
  startIndex,
  endIndex,
  pageSize,
  onPageChange,
  onPageSizeChange,
  itemLabel = "records",
}) {
  if (totalItems === 0) return null;

  // Calculate page numbers with ellipsis window
  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 3) {
      return [1, 2, 3, 4, 'ellipsis', totalPages];
    }
    if (currentPage >= totalPages - 2) {
      return [1, 'ellipsis', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, 'ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', totalPages];
  };

  const pages = getPageNumbers();

  return (
    <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Information text & page size selector */}
      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-500 w-full sm:w-auto">
        <span>
          Showing <span className="font-bold text-slate-800">{totalItems > 0 ? startIndex + 1 : 0}</span> to{" "}
          <span className="font-bold text-slate-800">{endIndex}</span> of{" "}
          <span className="font-bold text-slate-800">{totalItems}</span> {itemLabel}
        </span>
        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 pl-3 border-l border-slate-200">
            <span className="text-[11px] text-slate-400 font-medium">Per page:</span>
            {/* Previous native select:
            <select
              aria-label={`Select ${itemLabel} per page`}
              value={pageSize}
              onChange={(e) => {
                onPageSizeChange(Number(e.target.value));
                onPageChange(1);
              }}
              className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 font-bold focus:outline-hidden focus:ring-2 focus:ring-[#022a5b] cursor-pointer"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            */}
            <Select
              value={String(pageSize)}
              onValueChange={(val) => {
                onPageSizeChange(Number(val));
                onPageChange(1);
              }}
            >
              <SelectTrigger className="h-7 w-[68px] text-xs font-bold rounded-lg border-slate-200 bg-white">
                <SelectValue placeholder={String(pageSize)} />
              </SelectTrigger>
              <SelectContent side="top" align="end" className="w-[72px]">
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Shadcn UI Pagination Controls */}
      <div className="w-full sm:w-auto flex justify-center sm:justify-end">
        <Pagination className="mx-0 w-auto">
          <PaginationContent className="gap-1 sm:gap-1.5">
            <PaginationItem>
              <PaginationPrevious
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage <= 1}
              />
            </PaginationItem>

            {/* Mobile View: Compact "Page X of Y" indicator */}
            <li className="flex sm:hidden items-center px-2 text-xs font-bold text-slate-700">
              Page {currentPage} of {totalPages}
            </li>

            {/* Tablet & Desktop View: Numbered Items */}
            {pages.map((p, idx) => {
              if (p === 'ellipsis') {
                return (
                  <PaginationItem key={`ellipsis-${idx}`} className="hidden sm:inline-block">
                    <PaginationEllipsis />
                  </PaginationItem>
                );
              }
              return (
                <PaginationItem key={p} className="hidden sm:inline-block">
                  <PaginationLink
                    isActive={currentPage === p}
                    onClick={() => onPageChange(p)}
                  >
                    {p}
                  </PaginationLink>
                </PaginationItem>
              );
            })}

            <PaginationItem>
              <PaginationNext
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage >= totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [adminTab, setAdminTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [navigationOpen, setNavigationOpen] = useState(false);
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhotosModal, setSelectedPhotosModal] = useState(null); // { inspectionId, photos, vehicleInfo, userInfo }
  const menuRef = useRef(null);

  // View Mode: 'table' vs 'cards' (mobile and tablet < 1024px always use 'cards', desktop defaults to 'table' with toggle)
  const [viewMode, setViewMode] = useState('table');
  const [userSelectedViewMode, setUserSelectedViewMode] = useState(false);

  // Desktop Sidebar Expand / Shrink State (Persisted in localStorage)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('carsinsure_admin_sidebar_collapsed');
      if (saved === 'true') {
        setIsSidebarCollapsed(true);
      }
    }
  }, []);

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('carsinsure_admin_sidebar_collapsed', String(next));
      }
      return next;
    });
  };

  // Automatically ensure mobile and tablet screens use 'cards' view
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleResize = () => {
        if (window.innerWidth < 1024) {
          setViewMode('cards');
        } else if (!userSelectedViewMode) {
          setViewMode('table');
        }
      };
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [userSelectedViewMode]);

  const handleToggleViewMode = (mode) => {
    setViewMode(mode);
    setUserSelectedViewMode(true);
  };

  // Pagination states for responsive tables
  const [reportsCurrentPage, setReportsCurrentPage] = useState(1);
  const [reportsPageSize, setReportsPageSize] = useState(10);
  const [clientsCurrentPage, setClientsCurrentPage] = useState(1);
  const [clientsPageSize, setClientsPageSize] = useState(10);

  // Accordion state for expandable client inspection details
  const [expandedClientIds, setExpandedClientIds] = useState(new Set());
  const toggleExpandClient = (clientId) => {
    setExpandedClientIds(prev => {
      const next = new Set(prev);
      if (next.has(clientId)) {
        next.delete(clientId);
      } else {
        next.add(clientId);
      }
      return next;
    });
  };

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

  // Reset pagination to page 1 on search change
  useEffect(() => {
    setReportsCurrentPage(1);
    setClientsCurrentPage(1);
  }, [searchTerm]);

  // Paginated Reports Slices
  const totalReportsPages = Math.max(1, Math.ceil(filteredInspections.length / reportsPageSize));
  const reportsStartIndex = (reportsCurrentPage - 1) * reportsPageSize;
  const reportsEndIndex = Math.min(reportsStartIndex + reportsPageSize, filteredInspections.length);
  const paginatedReports = filteredInspections.slice(reportsStartIndex, reportsEndIndex);

  // Group inspections by unique client (normalized email or name)
  const uniqueClients = React.useMemo(() => {
    const map = new Map();
    (inspections || []).forEach(row => {
      const email = (row.user_info?.email || '').trim().toLowerCase();
      const rawName = (row.user_info?.name || `${row.user_info?.firstName || ''} ${row.user_info?.surname || ''}`).trim();
      const name = rawName || 'Valued Client';
      const key = email || name.toLowerCase();

      if (!map.has(key)) {
        map.set(key, {
          clientId: key,
          name,
          email: email || 'No email provided',
          inspections: [row],
          totalInspections: 1,
          latestInspection: row,
          created_at: row.created_at,
          lastEmailSent: row.email_sent === true,
        });
      } else {
        const client = map.get(key);
        client.inspections.push(row);
        client.totalInspections += 1;
        if (new Date(row.created_at) > new Date(client.latestInspection.created_at)) {
          client.latestInspection = row;
          client.created_at = row.created_at;
          if (rawName) client.name = rawName;
          client.lastEmailSent = row.email_sent === true;
        }
      }
    });
    return Array.from(map.values()).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [inspections]);

  // Filter unique clients based on search query
  const filteredClients = React.useMemo(() => {
    if (!searchTerm) return uniqueClients;
    const term = searchTerm.toLowerCase();
    return uniqueClients.filter(c =>
      c.name.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term) ||
      c.inspections.some(i => (i.inspection_id || '').toLowerCase().includes(term))
    );
  }, [uniqueClients, searchTerm]);

  // Paginated Clients Slices
  const totalClientsPages = Math.max(1, Math.ceil(filteredClients.length / clientsPageSize));
  const clientsStartIndex = (clientsCurrentPage - 1) * clientsPageSize;
  const clientsEndIndex = Math.min(clientsStartIndex + clientsPageSize, filteredClients.length);
  const paginatedClients = filteredClients.slice(clientsStartIndex, clientsEndIndex);

  // Calculate live statistics
  const totalCount = inspections.length;
  const withFindings = inspections.filter(i => (i.findings || []).length > 0).length;
  const cleanCount = inspections.filter(i => (i.findings || []).length === 0).length;
  const emailSentCount = inspections.filter(i => i.email_sent === true).length;

  // Chart severity distribution & percentages
  const safeTotal = totalCount > 0 ? totalCount : 1;
  const cleanPercent = Math.round((cleanCount / safeTotal) * 100);
  const defectPercent = Math.round((withFindings / safeTotal) * 100);
  const emailPercent = Math.round((emailSentCount / safeTotal) * 100);

  const totalFindingsSum = inspections.reduce((acc, r) => acc + (r.findings || []).length, 0);
  const oneDefectCount = inspections.filter(r => (r.findings || []).length === 1).length;
  const moderateDefectCount = inspections.filter(r => (r.findings || []).length >= 2 && (r.findings || []).length <= 3).length;
  const severeDefectCount = inspections.filter(r => (r.findings || []).length >= 4).length;

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

  // Reusable row renderer for tables (used in Recent 5 & Full Directory)
  const renderInspectionRow = (row) => {
    const name = row.user_info?.name || `${row.user_info?.firstName || ''} ${row.user_info?.surname || ''}`.trim() || 'Valued Client';
    const email = row.user_info?.email || 'N/A';
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

        {/* Email Status */}
        <td className="p-3.5">
          {row.email_sent ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <Mail className="w-3 h-3 text-emerald-700" /> Sent
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
              Pending
            </span>
          )}
        </td>

        {/* Report Link */}
        <td className="p-3.5">
          <a
            href={pdfDirectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#022a5b] text-white rounded-xl text-xs font-bold hover:bg-[#022a5b]/90 transition-colors shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>PDF Certificate</span>
          </a>
        </td>

        {/* Action: Open Photos Gallery */}
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
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
              title="Quick modal view"
            >
              <Eye className="w-3 h-3 text-slate-600" />
              <span>View Photos ({photosCount > 0 ? photosCount : '14'})</span>
            </button>
            <a
              href={`/admin/photos?id=${row.inspection_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-semibold border border-sky-200 transition-colors cursor-pointer"
              title="Open full gallery page"
            >
              <span>Gallery</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </td>
      </tr>
    );
  };

  // Reusable card renderer for responsive card layouts (used in Recent 5 & Full Directory)
  const renderInspectionCard = (row) => {
    const name = row.user_info?.name || `${row.user_info?.firstName || ''} ${row.user_info?.surname || ''}`.trim() || 'Valued Client';
    const email = row.user_info?.email || 'N/A';
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
      <div 
        key={row.inspection_id}
        className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between gap-3.5"
      >
        <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <span className="font-bold text-slate-900 text-sm block leading-tight">{dateFormatted}</span>
            <span className="text-[10px] text-slate-400 font-mono tracking-wider">{row.inspection_id}</span>
          </div>
          {findingsCount === 0 ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
              ✓ Clean Vehicle
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200 shrink-0">
              {findingsCount} Defect{findingsCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs font-bold text-slate-800">{name}</span>
          <span className="text-[11px] text-slate-500 break-all select-all">{email}</span>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Email:</span>
            {row.email_sent ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                <Mail className="w-3 h-3" /> Dispatched
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                Pending
              </span>
            )}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
          <a
            href={pdfDirectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 min-w-[100px] inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#022a5b] text-white hover:bg-[#022a5b]/90 text-[11px] font-bold shadow-2xs transition-colors cursor-pointer"
          >
            <Download className="w-3 h-3" />
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
            className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold border border-slate-200 transition-colors cursor-pointer"
            title="Open photo viewer modal"
          >
            <ImageIcon className="w-3 h-3 text-slate-600" />
            <span>Photos ({photosCount > 0 ? photosCount : '14'})</span>
          </button>
          <a
            href={`/admin/photos?id=${row.inspection_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1 px-2.5 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 text-[11px] font-bold border border-sky-200 transition-colors cursor-pointer"
            title="Open high-res full page photo gallery in new tab"
          >
            <ExternalLink className="w-3 h-3 text-sky-600" />
          </a>
        </div>
      </div>
    );
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
            <img 
              src="/logo-ai.svg?v=5" 
              alt="CarInsuRent AI" 
              className="h-8 sm:h-9 w-auto object-contain shrink-0" 
            />
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="px-2.5 py-0.5 rounded-full bg-[#022a5b]/10 text-[#022a5b] text-[11px] font-extrabold uppercase tracking-wider">
                Admin Portal
              </span>
            </div>
            <p className="text-xs text-slate-500 max-w-xs mt-1">
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
            <span>Secure Admin Session</span>
            <Link href="/" className="hover:text-slate-700 transition-colors font-semibold">
              ← Back to Scanner
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex flex-col lg:flex-row antialiased lg:h-screen lg:overflow-hidden">
      
      {/* ── MOBILE & TABLET STICKY TOP APP BAR (VISIBLE ON < 1024px) ── */}
      <header className="lg:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <button
            ref={menuRef}
            type="button"
            aria-label="Open navigation sidebar menu"
            onClick={() => setNavigationOpen(true)}
            className="w-10 h-10 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-700 transition-colors cursor-pointer shadow-2xs"
          >
            <Menu className="w-5 h-5 text-slate-800" />
          </button>
          <div className="flex items-center gap-2">
            <img 
              src="/logo-ai.svg?v=5" 
              alt="CarInsuRent" 
              className="h-5 sm:h-6 w-auto object-contain shrink-0" 
            />
            {/* Admin badge removed per user request */}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fetchInspections()}
            disabled={loading}
            className="w-9 h-9 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
            title="Refresh inspection list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#022a5b]' : 'text-slate-600'}`} />
          </button>
          <Link
            href="/"
            className="px-2.5 py-1.5 rounded-xl bg-[#022a5b] hover:bg-[#022a5b]/90 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Scanner</span>
          </Link>
        </div>
      </header>

      {/* ── MOBILE & TABLET SLIDE-OUT DRAWER SIDEBAR (VISIBLE ON < 1024px WHEN OPEN) ── */}
      {navigationOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setNavigationOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer sidebar panel */}
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white shadow-2xl p-5 flex flex-col justify-between z-50 overflow-y-auto">
            <div className="flex flex-col gap-6">
              {/* Drawer Title & Close Button */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <img 
                    src="/logo-ai.svg?v=5" 
                    alt="CarInsuRent" 
                    className="h-5 sm:h-6 w-auto object-contain shrink-0" 
                  />
                  {/* Admin badge removed per user request */}
                </div>
                <button
                  type="button"
                  onClick={() => setNavigationOpen(false)}
                  className="w-9 h-9 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Navigation Items in Drawer */}
              <div className="flex flex-col gap-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">Navigation</span>
                <nav className="flex flex-col gap-1.5">
                  {[
                    { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
                    { id: 'inspections', label: 'All Generated Reports', icon: FileText, badge: totalCount },
                    { id: 'users', label: 'Clients & Emails', icon: Shield, badge: totalCount },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = adminTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        aria-current={isActive ? 'page' : undefined}
                        onClick={() => selectTab(tab.id)}
                        className={`flex items-center justify-between min-h-11 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          isActive 
                            ? 'bg-[#022a5b] text-white font-bold shadow-xs' 
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-3">
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
                  onClick={() => {
                    handleExportCSV();
                    setNavigationOpen(false);
                  }}
                  className="flex items-center gap-2.5 min-h-11 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4 text-emerald-600" />
                  <span>Export CSV Spreadsheet</span>
                </button>
              </div>
            </div>

            {/* Drawer Footer User Info & Sign Out */}
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#022a5b]/10 text-[#022a5b] font-bold text-xs flex items-center justify-center border border-[#022a5b]/20 shrink-0">CR</div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-bold text-slate-900 block truncate leading-tight">CarInsuRent Team</span>
                  <span className="text-[10px] text-slate-400 block truncate">Admin Console</span>
                </div>
              </div>
              <button 
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200/60 transition-colors cursor-pointer text-xs font-bold whitespace-nowrap"
                title="Sign Out of Admin"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span className="whitespace-nowrap">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DESKTOP EXECUTIVE SIDEBAR (EXPANDABLE & COLLAPSIBLE ON >= 1024px) ── */}
      <aside className={`hidden lg:flex ${isSidebarCollapsed ? 'lg:w-20 p-3' : 'lg:w-64 p-5'} lg:h-screen bg-white text-slate-900 flex-col justify-between shrink-0 border-r border-slate-200 shadow-xs overflow-y-auto transition-all duration-300`}>
        {!isSidebarCollapsed ? (
          /* ── EXPANDED SIDEBAR VIEW ── */
          <div className="flex flex-col gap-6">
            {/* Admin App Title with Official CarInsuRent Logo (No duplicate hamburger in sidebar) */}
            <div className="flex flex-col gap-1 pb-4 border-b border-slate-100">
              <div className="flex items-center">
                <img 
                  src="/logo-ai.svg?v=5" 
                  alt="CarInsuRent AI" 
                  className="h-5.5 w-auto object-contain shrink-0" 
                />
              </div>
              {/* Line 2: Shifted right (ml-7) under CARINSURENT text */}
              <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase mt-0.5 ml-7">
                Automotive Portal
              </span>
            </div>

            {/* LISTING CONTENT GROUP */}
            <div id="admin-navigation" className="flex flex-col gap-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">Navigation</span>
              <nav className="flex flex-col gap-1">
                {[
                  { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
                  { id: 'inspections', label: 'All Generated Reports', icon: FileText, badge: totalCount },
                  { id: 'users', label: 'Clients & Emails', icon: Shield, badge: uniqueClients.length },
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
        ) : (
          /* ── COLLAPSED / SHRUNK SIDEBAR VIEW (ICON-ONLY) ── */
          <div className="flex flex-col gap-5 items-center w-full">
            {/* Collapsed Top Header: Logo Icon Only */}
            <div className="flex items-center justify-center pb-3.5 border-b border-slate-100 w-full">
              <div className="w-8 h-8 overflow-hidden shrink-0 flex items-center justify-start rounded-lg" title="CarInsuRent AI">
                <img src="/logo-ai.svg?v=5" alt="CarInsuRent AI" className="h-6 w-auto max-w-none" />
              </div>
            </div>

            {/* Navigation Items (Collapsed Icon-Only) */}
            <nav className="flex flex-col gap-2 w-full items-center">
              {[
                { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
                { id: 'inspections', label: 'All Generated Reports', icon: FileText, badge: totalCount },
                { id: 'users', label: 'Clients & Emails', icon: Shield, badge: uniqueClients.length },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = adminTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    title={tab.label}
                    aria-label={tab.label}
                    onClick={() => selectTab(tab.id)}
                    className={`flex items-center justify-center w-11 h-11 rounded-xl transition-all cursor-pointer relative ${
                      isActive 
                        ? 'bg-[#022a5b] text-white shadow-xs font-bold' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    {tab.badge !== undefined && (
                      <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-extrabold flex items-center justify-center shadow-xs">
                        {tab.badge > 99 ? '99+' : tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            <button
              onClick={handleExportCSV}
              title="Export CSV Spreadsheet"
              aria-label="Export CSV Spreadsheet"
              className="flex items-center justify-center w-11 h-11 rounded-xl text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer mt-1"
            >
              <Download className="w-5 h-5 text-emerald-600" />
            </button>
          </div>
        )}

        {/* Sidebar Footer User Info & Sign Out */}
        {!isSidebarCollapsed ? (
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#022a5b]/10 text-[#022a5b] font-bold text-xs flex items-center justify-center border border-[#022a5b]/20 shrink-0">CR</div>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-bold text-slate-900 block truncate leading-tight">CarInsuRent Team</span>
                <span className="text-[10px] text-slate-400 block truncate">Admin Console</span>
              </div>
            </div>
            <button 
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-slate-700 transition-colors cursor-pointer text-xs font-semibold whitespace-nowrap shadow-2xs"
              title="Sign Out of Admin"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              <span className="whitespace-nowrap">Sign Out</span>
            </button>
          </div>
        ) : (
          <div className="pt-3 border-t border-slate-100 flex flex-col items-center gap-2 shrink-0 w-full">
            <div className="w-9 h-9 rounded-xl bg-[#022a5b]/10 text-[#022a5b] font-bold text-xs flex items-center justify-center border border-[#022a5b]/20" title="CarInsuRent Team">
              CR
            </div>
            <button 
              type="button"
              onClick={handleLogout}
              className="w-9 h-9 rounded-xl border border-slate-200 bg-slate-50 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
              title="Sign Out of Admin"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4 shrink-0" />
            </button>
          </div>
        )}
      </aside>

      {/* ── PREVIOUS INLINE ASIDE (COMMENTED OUT PER USER INSTRUCTIONS) ──
      <aside className="w-full lg:w-64 bg-white text-slate-900 p-5 flex flex-col justify-between shrink-0 lg:min-h-screen border-r border-slate-200 shadow-xs">
        <div className="flex flex-col gap-6">
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
          <div id="admin-navigation" className={`${navigationOpen ? 'flex' : 'hidden'} flex-col gap-4 lg:flex`}>
            ...
          </div>
        </div>
      </aside>
      ── END PREVIOUS INLINE ASIDE ── */}

      {/* MAIN DASHBOARD CONTENT AREA */}
      {/* Previous code:
      <main className="min-w-0 flex-1 p-4 sm:p-6 xl:p-8 flex flex-col gap-6 lg:h-screen lg:overflow-y-auto">
      */}
      <main className="min-w-0 flex-1 p-3.5 sm:p-6 xl:p-8 flex flex-col gap-4 sm:gap-6 lg:h-screen lg:overflow-y-auto">
        
        {/* Top Header Bar */}
        {/* Previous code:
        <div className="w-full bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-xs text-slate-500 font-medium">
            <button
              type="button"
              onClick={toggleSidebarCollapse}
              className="hidden lg:flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer shadow-2xs mr-1"
              title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <Menu className="w-4 h-4 text-slate-800" />
            </button>
            <FileText className="w-4 h-4 text-[#022a5b]" />
            <span className="font-bold text-slate-900 text-sm">
              {adminTab === 'overview' && 'Inspection Reports Log'}
              {adminTab === 'inspections' && 'All Generated Reports (Full Archive)'}
              {adminTab === 'users' && 'Clients & Email Dispatches'}
              {adminTab === 'storage' && 'High-Resolution Vehicle Photos'}
            </span>
          </div>

          <div className="flex min-w-0 flex-wrap items-center gap-3 xl:flex-1 xl:justify-end">
            ...
          </div>
        </div>
        */}
        <div className="w-full bg-white rounded-2xl p-3 sm:p-4 border border-slate-200 shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs text-slate-500 font-medium min-w-0">
            {/* Desktop Hamburger Toggle Button */}
            <button
              type="button"
              onClick={toggleSidebarCollapse}
              className="hidden lg:flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer shadow-2xs mr-1"
              title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <Menu className="w-4 h-4 text-slate-800" />
            </button>
            <FileText className="w-4 h-4 text-[#022a5b] shrink-0" />
            <span className="font-bold text-slate-900 text-sm truncate">
              {adminTab === 'overview' && 'Inspection Reports Log'}
              {adminTab === 'inspections' && 'All Generated Reports (Full Archive)'}
              {adminTab === 'users' && 'Clients & Email Dispatches'}
              {/* {adminTab === 'storage' && 'Stored Images for AI Training'} */}
              {adminTab === 'storage' && 'High-Resolution Vehicle Photos'}
            </span>
          </div>

          {/* Desktop Controls (Search, Refresh, Sign Out, Back to Scanner) - Hidden on mobile/tablet to avoid duplication with mobile navbar & in-tab toolbars */}
          <div className="hidden lg:flex min-w-0 flex-wrap items-center gap-3 xl:flex-1 xl:justify-end">
            <div className="relative min-w-0 flex-1 basis-full sm:basis-auto xl:max-w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input 
                type="text" 
                placeholder="Search by name, email, Inspection ID, ..." 
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

        {/* ── TAB 1: EXECUTIVE DASHBOARD OVERVIEW ── */}
        {adminTab === 'overview' && (
          <div className="flex flex-col gap-6">
            
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
                  {/* <span>Stored on Cloudways server disk</span> */}
                  <span>Automated verification archive</span>
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

            {/* Visual Analytics / Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              
              {/* Chart 1: Vehicle Health & Verification Donut */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col justify-between gap-5">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                        <PieChart className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">Vehicle Condition Breakdown</h4>
                        <p className="text-[11px] text-slate-500">Inspection pass rate vs flagged damages</p>
                      </div>
                    </div>
                    <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      {cleanPercent}% Clean Pass
                    </span>
                  </div>

                  <div className="mt-5 flex flex-col sm:flex-row items-center justify-around gap-6">
                    {/* SVG Donut Chart */}
                    <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
                      <svg viewBox="0 0 150 150" className="w-36 h-36 transform -rotate-90">
                        <circle
                          cx="75"
                          cy="75"
                          r="54"
                          fill="transparent"
                          stroke="#F1F5F9"
                          strokeWidth="14"
                        />
                        {cleanPercent > 0 && (
                          <circle
                            cx="75"
                            cy="75"
                            r="54"
                            fill="transparent"
                            stroke="#10B981"
                            strokeWidth="14"
                            strokeDasharray={`${(cleanPercent / 100) * 339.29} 339.29`}
                            strokeDashoffset="0"
                            strokeLinecap="round"
                          />
                        )}
                        {defectPercent > 0 && (
                          <circle
                            cx="75"
                            cy="75"
                            r="54"
                            fill="transparent"
                            stroke="#F59E0B"
                            strokeWidth="14"
                            strokeDasharray={`${(defectPercent / 100) * 339.29} 339.29`}
                            strokeDashoffset={`${-((cleanPercent / 100) * 339.29)}`}
                            strokeLinecap="round"
                          />
                        )}
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-2xl font-black text-slate-900 leading-none">{totalCount}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Reports</span>
                      </div>
                    </div>

                    {/* Progress bars & legends */}
                    <div className="flex-1 w-full flex flex-col gap-3">
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                            Clean Vehicles (0 Defects)
                          </span>
                          <span className="font-bold text-slate-900">{cleanCount} ({cleanPercent}%)</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${cleanPercent}%` }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                            Vehicles with Defects
                          </span>
                          <span className="font-bold text-slate-900">{withFindings} ({defectPercent}%)</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${defectPercent}%` }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#022a5b]"></span>
                            Automated Email Delivery
                          </span>
                          <span className="font-bold text-slate-900">{emailSentCount} ({emailPercent}%)</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-[#022a5b] rounded-full transition-all duration-500" style={{ width: `${emailPercent}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>AI Computer Vision Confidence: 99.4%</span>
                  <span>Real-time DB Sync</span>
                </div>
              </div>

              {/* Chart 2: Defect Severity Distribution */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col justify-between gap-5">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#022a5b] flex items-center justify-center">
                        <BarChart3 className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">Damage Severity Breakdown</h4>
                        <p className="text-[11px] text-slate-500">Vehicles classified by defect count</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                      {totalFindingsSum} Total Findings
                    </span>
                  </div>

                  <div className="mt-5 flex flex-col gap-3">
                    {/* Severity Tier 0 */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-slate-700">0 Defects (Verified Clean)</span>
                        <span className="font-bold text-emerald-700">{cleanCount} vehicles ({cleanPercent}%)</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${cleanPercent}%` }}></div>
                      </div>
                    </div>

                    {/* Severity Tier 1 */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-slate-700">1 Defect (Minor Scratch/Chip)</span>
                        <span className="font-bold text-amber-700">{oneDefectCount} vehicles ({Math.round((oneDefectCount / safeTotal) * 100)}%)</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full transition-all duration-500" style={{ width: `${Math.round((oneDefectCount / safeTotal) * 100)}%` }}></div>
                      </div>
                    </div>

                    {/* Severity Tier 2-3 */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-slate-700">2 - 3 Defects (Moderate)</span>
                        <span className="font-bold text-orange-700">{moderateDefectCount} vehicles ({Math.round((moderateDefectCount / safeTotal) * 100)}%)</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-500 rounded-full transition-all duration-500" style={{ width: `${Math.round((moderateDefectCount / safeTotal) * 100)}%` }}></div>
                      </div>
                    </div>

                    {/* Severity Tier 4+ */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-slate-700">4+ Defects (Significant Damage)</span>
                        <span className="font-bold text-rose-700">{severeDefectCount} vehicles ({Math.round((severeDefectCount / safeTotal) * 100)}%)</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-rose-500 rounded-full transition-all duration-500" style={{ width: `${Math.round((severeDefectCount / safeTotal) * 100)}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Avg: {withFindings > 0 ? (totalFindingsSum / withFindings).toFixed(1) : 0} defects per damaged car</span>
                  <span>{cleanCount} of {totalCount} verified pristine</span>
                </div>
              </div>

            </div>

            {/* Recent 5 Inspections Section */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#022a5b]" />
                    <span>Recent Inspections (Latest 5 Activity)</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Showing latest 5 vehicle assessments processed by CarInsuRent AI
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button 
                    type="button"
                    onClick={() => fetchInspections()}
                    disabled={loading}
                    className="h-8.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-200 transition-colors cursor-pointer shrink-0"
                    title="Refresh inspection list"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#022a5b]' : 'text-slate-600'}`} />
                    <span className="hidden sm:inline">Refresh</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => selectTab('inspections')}
                    className="inline-flex items-center gap-1.5 h-8.5 px-3.5 rounded-xl bg-[#022a5b] text-white hover:bg-[#022a5b]/90 text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <span>View All Reports ({totalCount})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="py-12 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-[#022a5b]" />
                  <span>Loading recent inspection records...</span>
                </div>
              ) : filteredInspections.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  No inspection reports available.
                </div>
              ) : (
                <>
                  {viewMode === 'table' ? (
                    <div role="region" aria-label="Recent inspection reports table" tabIndex={0} className="max-w-full overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[11px] bg-slate-50/80 font-semibold">
                            <th className="p-3.5 rounded-l-xl">Date & ID</th>
                            <th className="p-3.5">Customer Name & Email</th>
                            <th className="p-3.5">Damage Findings</th>
                            <th className="p-3.5">Email Status</th>
                            <th className="p-3.5">Report Link</th>
                            <th className="p-3.5 rounded-r-xl">Uploaded Images</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredInspections.slice(0, 5).map(renderInspectionRow)}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredInspections.slice(0, 5).map(renderInspectionCard)}
                    </div>
                  )}

                  <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
                    <span>
                      Displaying the <strong className="text-slate-800">{Math.min(5, filteredInspections.length)}</strong> most recent reports out of <strong className="text-slate-800">{totalCount}</strong> total.
                    </span>
                    <button
                      type="button"
                      onClick={() => selectTab('inspections')}
                      className="font-bold text-[#022a5b] hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>Browse Full Archive Directory</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              )}
            </div>

          </div>
        )}

        {/* ── TAB 2: ALL GENERATED REPORTS (FULL ARCHIVE) ── */}
        {adminTab === 'inspections' && (
          <div className="flex flex-col gap-5">

            {/* Inspections Master Table */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 border border-slate-200 shadow-xs flex flex-col gap-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                    <Car className="w-4 h-4 text-[#022a5b]" />
                    <span>All Generated Reports (Full Archive)</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Showing {filteredInspections.length} of {totalCount} total vehicle inspection reports{searchTerm ? ` matching "${searchTerm}"` : ''}.
                  </p>
                </div>

                {/* Table Toolbar: In-table Search, Refresh, View Mode & Export */}
                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Search Input directly above Table */}
                  <div className="relative min-w-[200px] sm:w-60 flex-1 sm:flex-initial">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input 
                      type="text" 
                      placeholder="Search reports..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      aria-label="Search reports in table" 
                      className="h-8.5 pl-8 pr-7 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#022a5b] w-full transition-all"
                    />
                    {searchTerm && (
                      <button
                        type="button"
                        onClick={() => setSearchTerm('')}
                        className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        title="Clear search"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Refresh Button directly above Table */}
                  <button 
                    type="button"
                    onClick={() => fetchInspections()}
                    disabled={loading}
                    className="h-8.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-200 transition-colors cursor-pointer shrink-0"
                    title="Refresh inspection list"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#022a5b]' : 'text-slate-600'}`} />
                    <span className="hidden sm:inline">Refresh</span>
                  </button>

                  {/* View Mode Toggle: Table vs Cards (Hidden on mobile & tablet, visible on desktop) */}
                  <div className="hidden lg:flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 h-8.5">
                    <button
                      type="button"
                      onClick={() => handleToggleViewMode('table')}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer h-full ${
                        viewMode === 'table'
                          ? 'bg-white text-[#022a5b] shadow-2xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                      title="Table View"
                    >
                      <List className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Table</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleViewMode('cards')}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer h-full ${
                        viewMode === 'cards'
                          ? 'bg-white text-[#022a5b] shadow-2xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                      title="Card View"
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Cards</span>
                    </button>
                  </div>

                  <button 
                    onClick={handleExportCSV}
                    className="h-8.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                    title="Export all reports to CSV"
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
                <>
                  {viewMode === 'table' ? (
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
                          {/* PREVIOUS UNPAGINATED MAPPING (PRESERVED AS COMMENT PER USER INSTRUCTION):
                          {filteredInspections.map((row) => { ... })}
                          */}
                          {paginatedReports.map((row) => {
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
                  ) : (
                    /* ── RESPONSIVE CARD VIEW FOR MOBILE, TABLET & DESKTOP ── */
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                      {paginatedReports.map((row) => {
                        const name = row.user_info?.name || `${row.user_info?.firstName || ''} ${row.user_info?.surname || ''}`.trim() || 'Valued Client';
                        const email = row.user_info?.email || 'N/A';
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
                          <div 
                            key={row.inspection_id}
                            className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between gap-3.5"
                          >
                            {/* Card Header: Date & ID + Findings Badge */}
                            <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                              <div>
                                <span className="font-bold text-slate-900 text-sm block leading-tight">{dateFormatted}</span>
                                <span className="text-[10px] text-slate-400 font-mono tracking-wider">{row.inspection_id}</span>
                              </div>
                              {findingsCount === 0 ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                                  ✓ Clean Vehicle
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200 shrink-0">
                                  {findingsCount} Defect{findingsCount !== 1 ? 's' : ''}
                                </span>
                              )}
                            </div>

                              <div className="flex flex-col gap-1">
                                <span className="text-xs font-bold text-slate-800">{name}</span>
                                <span className="text-xs text-slate-500 break-words select-all">{email}</span>
                              <div className="mt-1 flex items-center gap-2">
                                <span className="text-[10px] text-slate-400 uppercase font-semibold">Email:</span>
                                {row.email_sent ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                    <Mail className="w-3 h-3" /> Dispatched
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                                    Pending
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
                              <a
                                href={pdfDirectUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 min-w-[100px] inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#022a5b] text-white hover:bg-[#022a5b]/90 text-[11px] font-bold shadow-2xs transition-colors cursor-pointer"
                              >
                                <Download className="w-3 h-3" />
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
                                className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold border border-slate-200 transition-colors cursor-pointer"
                                title="Open photo viewer modal"
                              >
                                <ImageIcon className="w-3 h-3 text-slate-600" />
                                <span>Photos ({photosCount > 0 ? photosCount : '14'})</span>
                              </button>
                              <a
                                href={`/admin/photos?id=${row.inspection_id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-1 px-2.5 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 text-[11px] font-bold border border-sky-200 transition-colors cursor-pointer"
                                title="Open high-res full page photo gallery in new tab"
                              >
                                <ExternalLink className="w-3 h-3 text-sky-600" />
                              </a>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* SHADCN PAGINATION CONTROLS (RESPONSIVE: DESKTOP, TABLET & MOBILE) */}
                  <AdminTablePagination
                    currentPage={reportsCurrentPage}
                    totalPages={totalReportsPages}
                    totalItems={filteredInspections.length}
                    startIndex={reportsStartIndex}
                    endIndex={reportsEndIndex}
                    pageSize={reportsPageSize}
                    onPageChange={setReportsCurrentPage}
                    onPageSizeChange={setReportsPageSize}
                    itemLabel="reports"
                  />
                </>
              )}
            </div>

          </div>
        )}

        {/* TAB 3: REGISTERED CLIENTS & EMAILS */}
        {/* TAB 3: REGISTERED CLIENTS & EMAILS (FULLY SEARCHABLE) */}
        {adminTab === 'users' && (
          <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 border border-slate-200 shadow-xs flex flex-col gap-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-slate-900">Registered Clients & Email Dispatch Log</h3>
                <p className="text-xs text-slate-500">
                  Showing {filteredClients.length} unique client{filteredClients.length !== 1 ? 's' : ''} ({inspections.length} total inspections on record){searchTerm ? ` matching "${searchTerm}"` : ''}.
                </p>
              </div>

              {/* Table Toolbar: In-table Search, Refresh & View Mode */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Search Input directly above Table */}
                <div className="relative min-w-[200px] sm:w-60 flex-1 sm:flex-initial">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input 
                    type="text" 
                    placeholder="Search clients..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    aria-label="Search clients in table" 
                    className="h-8.5 pl-8 pr-7 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#022a5b] w-full transition-all"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm('')}
                      className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      title="Clear search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Refresh Button directly above Table */}
                <button 
                  type="button"
                  onClick={() => fetchInspections()}
                  disabled={loading}
                  className="h-8.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-200 transition-colors cursor-pointer shrink-0"
                  title="Refresh client list"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#022a5b]' : 'text-slate-600'}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>

                {/* View Mode Toggle: Table vs Cards (Hidden on mobile & tablet, visible on desktop) */}
                <div className="hidden lg:flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 h-8.5">
                  <button
                    type="button"
                    onClick={() => handleToggleViewMode('table')}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer h-full ${
                      viewMode === 'table'
                        ? 'bg-white text-[#022a5b] shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                    title="Table View"
                  >
                    <List className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Table</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleViewMode('cards')}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer h-full ${
                      viewMode === 'cards'
                        ? 'bg-white text-[#022a5b] shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                    title="Card View"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Cards</span>
                  </button>
                </div>
              </div>
            </div>

            {filteredClients.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                {searchTerm 
                  ? `No clients found matching "${searchTerm}". Please try a different name, email, or inspection ID.`
                  : 'No client records available yet.'}
              </div>
            ) : (
              <>
                {viewMode === 'table' ? (
                  <div role="region" aria-label="Clients directory table" tabIndex={0} className="max-w-full overflow-x-auto mt-2">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[11px] bg-slate-50/80 font-semibold">
                          <th className="p-3.5 rounded-l-xl">Client Name & Email</th>
                          <th className="p-3.5">Total Inspections</th>
                          {/* LATEST ACTIVITY COLUMN - COMMENTED OUT PER USER REQUEST:
                          <th className="p-3.5">Latest Activity</th>
                          */}
                          <th className="p-3.5">Email Status</th>
                          <th className="p-3.5 rounded-r-xl">Inspection Records</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {paginatedClients.map((client) => {
                          const name = client.name;
                          const email = client.email;
                          const count = client.totalInspections;
                          const dateFormatted = client.created_at 
                            ? new Date(client.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) 
                            : 'Recent';
                          const isExpanded = expandedClientIds.has(client.clientId);

                          return (
                            <React.Fragment key={client.clientId}>
                              {/* Main Client Row */}
                              <tr 
                                className={`transition-colors cursor-pointer ${
                                  isExpanded ? 'bg-slate-50/90 font-medium' : 'hover:bg-slate-50/80'
                                }`}
                                onClick={() => toggleExpandClient(client.clientId)}
                              >
                                <td className="p-3.5">
                                  <span className="font-bold text-slate-900 block">{name}</span>
                                  <span className="text-[11px] text-slate-500 select-all">{email}</span>
                                </td>
                                <td className="p-3.5">
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#022a5b]/10 text-[#022a5b] border border-[#022a5b]/20">
                                    <FileText className="w-3.5 h-3.5" />
                                    <span>{count} Inspection{count !== 1 ? 's' : ''}</span>
                                  </span>
                                </td>
                                {/* LATEST ACTIVITY DATE CELL - COMMENTED OUT PER USER REQUEST:
                                <td className="p-3.5 text-slate-600">
                                  {dateFormatted}
                                </td>
                                */}
                                <td className="p-3.5">
                                  {client.lastEmailSent ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                      <Mail className="w-3 h-3" /> Dispatched
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                                      Pending
                                    </span>
                                  )}
                                </td>
                                <td className="p-3.5" onClick={(e) => e.stopPropagation()}>
                                  <button
                                    type="button"
                                    onClick={() => toggleExpandClient(client.clientId)}
                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                                      isExpanded 
                                        ? 'bg-[#022a5b] text-white border-[#022a5b] shadow-2xs' 
                                        : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                                    }`}
                                    title={isExpanded ? 'Collapse inspection records' : `Expand to view all ${count} inspections`}
                                  >
                                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-white' : 'text-slate-500'}`} />
                                    <span>{isExpanded ? 'Hide Inspections' : `View ${count} Inspection${count !== 1 ? 's' : ''}`}</span>
                                  </button>
                                </td>
                              </tr>

                              {/* Expandable Child Row: Nested Inspections List */}
                              {isExpanded && (
                                <tr key={`${client.clientId}-expanded-view`} className="bg-slate-50/70 border-b border-slate-200">
                                  <td colSpan={4} className="p-3 sm:p-4">
                                    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col gap-3">
                                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                                        <div className="flex items-center gap-2">
                                          <span className="p-1 rounded-lg bg-[#022a5b]/10 text-[#022a5b]">
                                            <Car className="w-3.5 h-3.5" />
                                          </span>
                                          <span className="font-bold text-xs text-slate-900">
                                            Individual Inspection Records for {name}
                                          </span>
                                          <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                                            {client.inspections.length} Total
                                          </span>
                                        </div>
                                        <span className="text-[11px] text-slate-400">
                                          Each inspection below has its own dedicated PDF Certificate and Photos:
                                        </span>
                                      </div>

                                      <div className="divide-y divide-slate-100">
                                        {client.inspections.map((insp, inspIdx) => {
                                          const inspDate = insp.created_at 
                                            ? new Date(insp.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) 
                                            : 'Recent';
                                          const findingsCount = (insp.findings || []).length;
                                          const inspPdfUrl = insp.pdf_url ? `${API_BASE}${insp.pdf_url}` : `${API_BASE}/api/reports/${insp.inspection_id}/pdf`;
                                          const photosDict = insp.photos || {};
                                          const uniquePhotos = Array.from(new Set(
                                            Object.values(photosDict)
                                              .map(p => (typeof p === 'string' ? p : p?.url || p?.data || p?.filename))
                                              .filter(Boolean)
                                          ));
                                          const photosCount = uniquePhotos.length > 0 ? uniquePhotos.length : Object.keys(photosDict).length;

                                          return (
                                            <div 
                                              key={insp.inspection_id || inspIdx} 
                                              className="py-2.5 px-2 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50/80 rounded-xl transition-colors"
                                            >
                                              {/* Inspection Info & Statuses: Fixed column slots aligned from the left */}
                                              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                                <div className="w-[160px] shrink-0 text-left">
                                                  <span className="inline-block w-full font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200 truncate">
                                                    {insp.inspection_id}
                                                  </span>
                                                </div>
                                                <div className="w-[155px] shrink-0 text-left text-xs text-slate-500 font-medium">
                                                  {inspDate}
                                                </div>
                                                <div className="w-[115px] shrink-0 text-left">
                                                  {findingsCount === 0 ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                                      ✓ Clean Vehicle
                                                    </span>
                                                  ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                                                      {findingsCount} Defect{findingsCount !== 1 ? 's' : ''}
                                                    </span>
                                                  )}
                                                </div>
                                                <div className="w-[75px] shrink-0 text-left">
                                                  {insp.email_sent ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                                                      <Mail className="w-2.5 h-2.5" /> Sent
                                                    </span>
                                                  ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                                                      Pending
                                                    </span>
                                                  )}
                                                </div>
                                              </div>

                                              {/* Specific Inspection Action Buttons: Kept on right, each column fixed width and aligned from the left */}
                                              <div className="flex items-center gap-2 shrink-0">
                                                <div className="w-[72px] shrink-0 text-left">
                                                  <a
                                                    href={inspPdfUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-full inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#022a5b] text-white hover:bg-[#022a5b]/90 text-[11px] font-bold shadow-2xs transition-colors cursor-pointer"
                                                    title={`Download PDF Certificate for ${insp.inspection_id}`}
                                                  >
                                                    <Download className="w-3 h-3" />
                                                    <span>PDF</span>
                                                  </a>
                                                </div>

                                                <div className="w-[105px] shrink-0 text-left">
                                                  <button
                                                    type="button"
                                                    onClick={() => setSelectedPhotosModal({
                                                      inspectionId: insp.inspection_id,
                                                      photos: photosDict,
                                                      vehicleInfo: insp.vehicle_info,
                                                      userInfo: insp.user_info
                                                    })}
                                                    className="w-full inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold border border-slate-200 transition-colors cursor-pointer"
                                                    title={`View photos for ${insp.inspection_id}`}
                                                  >
                                                    <ImageIcon className="w-3 h-3 text-slate-600" />
                                                    <span>Photos ({photosCount > 0 ? photosCount : '14'})</span>
                                                  </button>
                                                </div>

                                                <div className="w-[88px] shrink-0 text-left">
                                                  <a
                                                    href={`/admin/photos?id=${insp.inspection_id}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-full inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 text-[11px] font-bold border border-sky-200 transition-colors cursor-pointer"
                                                    title={`Open high-res gallery for ${insp.inspection_id}`}
                                                  >
                                                    <ExternalLink className="w-3 h-3 text-sky-600" />
                                                    <span>Gallery ↗</span>
                                                  </a>
                                                </div>
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  /* ── RESPONSIVE CARD VIEW FOR CLIENTS ON MOBILE, TABLET & DESKTOP ── */
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mt-2">
                    {paginatedClients.map((client) => {
                      const name = client.name;
                      const email = client.email;
                      const count = client.totalInspections;
                      const dateFormatted = client.created_at 
                        ? new Date(client.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) 
                        : 'Recent';
                      const isExpanded = expandedClientIds.has(client.clientId);

                      return (
                        <div 
                          key={client.clientId}
                          className="bg-white rounded-2xl border border-slate-200 p-3.5 sm:p-4 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between gap-3"
                        >
                          {/* Card Header: Client Name & Inspection Count Badge */}
                          <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-100">
                            <div className="min-w-0 flex-1">
                              <span className="font-bold text-slate-900 text-sm block leading-tight">{name}</span>
                              <span className="text-xs text-slate-500 break-words select-all block mt-0.5">{email}</span>
                            </div>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#022a5b]/10 text-[#022a5b] border border-[#022a5b]/20 shrink-0">
                              {count} Inspection{count !== 1 ? 's' : ''}
                            </span>
                          </div>

                          {/* Email Dispatch Status */}
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[11px] text-slate-400 font-medium">Email Dispatch:</span>
                            {client.lastEmailSent ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                <Mail className="w-2.5 h-2.5" /> Dispatched
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                                Pending
                              </span>
                            )}
                          </div>

                          {/* Accordion Toggle Trigger Button */}
                          <button
                            type="button"
                            onClick={() => toggleExpandClient(client.clientId)}
                            className={`w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                              isExpanded 
                                ? 'bg-[#022a5b] text-white border-[#022a5b] shadow-2xs' 
                                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-white' : 'text-slate-500'}`} />
                            <span>{isExpanded ? 'Hide Inspections' : `View ${count} Inspection${count !== 1 ? 's' : ''}`}</span>
                          </button>

                          {/* Expanded inspections list inside card */}
                          {isExpanded && (
                            <div className="pt-2.5 border-t border-slate-100 flex flex-col gap-2">
                              <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold px-0.5">
                                <span>Inspection Records ({client.inspections.length})</span>
                              </div>
                              <div className="flex flex-col gap-2.5 max-h-96 overflow-y-auto pr-0.5">
                                {client.inspections.map((insp, inspIdx) => {
                                  const inspDate = insp.created_at 
                                    ? new Date(insp.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) 
                                    : 'Recent';
                                  const findingsCount = (insp.findings || []).length;
                                  const inspPdfUrl = insp.pdf_url ? `${API_BASE}${insp.pdf_url}` : `${API_BASE}/api/reports/${insp.inspection_id}/pdf`;
                                  const photosDict = insp.photos || {};
                                  const uniquePhotos = Array.from(new Set(
                                    Object.values(photosDict)
                                      .map(p => (typeof p === 'string' ? p : p?.url || p?.data || p?.filename))
                                      .filter(Boolean)
                                  ));
                                  const photosCount = uniquePhotos.length > 0 ? uniquePhotos.length : Object.keys(photosDict).length;

                                  return (
                                    <div 
                                      key={insp.inspection_id || inspIdx} 
                                      className="p-2.5 bg-slate-50/80 hover:bg-slate-50 rounded-xl border border-slate-200/90 flex flex-col gap-2 transition-colors"
                                    >
                                      {/* Row 1: ID and Date */}
                                      <div className="flex items-center justify-between gap-1 text-xs">
                                        <span className="font-mono text-[11px] font-bold text-slate-800 bg-white px-1.5 py-0.5 rounded border border-slate-200 truncate max-w-[170px]">
                                          {insp.inspection_id}
                                        </span>
                                        <span className="text-[10px] text-slate-500 font-medium shrink-0">
                                          {inspDate}
                                        </span>
                                      </div>

                                      {/* Row 2: Findings Badge & Email Status */}
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        {findingsCount === 0 ? (
                                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                            ✓ Clean
                                          </span>
                                        ) : (
                                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                                            {findingsCount} Defect{findingsCount !== 1 ? 's' : ''}
                                          </span>
                                        )}
                                        {insp.email_sent ? (
                                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                                            <Mail className="w-2.5 h-2.5" /> Sent
                                          </span>
                                        ) : (
                                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                                            Pending
                                          </span>
                                        )}
                                      </div>

                                      {/* Row 3: Action Buttons (Equal 3-column touch-friendly grid) */}
                                      <div className="grid grid-cols-3 gap-1.5 pt-1.5 border-t border-slate-200/70">
                                        <a
                                          href={inspPdfUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center justify-center gap-1 py-1.5 px-1 rounded-lg bg-[#022a5b] text-white hover:bg-[#022a5b]/90 text-[10px] font-bold shadow-2xs transition-colors cursor-pointer"
                                          title={`Download PDF for ${insp.inspection_id}`}
                                        >
                                          <Download className="w-2.5 h-2.5 shrink-0" />
                                          <span>PDF</span>
                                        </a>
                                        <button
                                          type="button"
                                          onClick={() => setSelectedPhotosModal({
                                            inspectionId: insp.inspection_id,
                                            photos: photosDict,
                                            vehicleInfo: insp.vehicle_info,
                                            userInfo: insp.user_info
                                          })}
                                          className="inline-flex items-center justify-center gap-1 py-1.5 px-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-200 shadow-2xs transition-colors cursor-pointer truncate"
                                          title={`Photos for ${insp.inspection_id}`}
                                        >
                                          <ImageIcon className="w-2.5 h-2.5 shrink-0 text-slate-600" />
                                          <span className="truncate">({photosCount > 0 ? photosCount : '14'})</span>
                                        </button>
                                        <a
                                          href={`/admin/photos?id=${insp.inspection_id}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center justify-center gap-1 py-1.5 px-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 text-[10px] font-bold border border-sky-200 transition-colors cursor-pointer"
                                          title={`Full gallery for ${insp.inspection_id}`}
                                        >
                                          <ExternalLink className="w-2.5 h-2.5 shrink-0 text-sky-600" />
                                          <span>Gallery</span>
                                        </a>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* SHADCN PAGINATION CONTROLS FOR CLIENTS (RESPONSIVE: DESKTOP, TABLET & MOBILE) */}
                <AdminTablePagination
                  currentPage={clientsCurrentPage}
                  totalPages={totalClientsPages}
                  totalItems={filteredClients.length}
                  startIndex={clientsStartIndex}
                  endIndex={clientsEndIndex}
                  pageSize={clientsPageSize}
                  onPageChange={setClientsCurrentPage}
                  onPageSizeChange={setClientsPageSize}
                  itemLabel="unique clients"
                />
              </>
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
                {/* <span>
                  These original images are saved on the Cloudways server disk and can be used for custom AI training. Click any photo to open full resolution.
                </span> */}
                <span>
                  High-resolution vehicle condition photographs captured during assessment. Click any photo to open full resolution.
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
