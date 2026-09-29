'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Download, ExternalLink, RefreshCw, Image as ImageIcon, 
  ShieldCheck, AlertCircle, FileText, CheckCircle2, AlertTriangle, Car, Mail
} from 'lucide-react';

function PhotosGalleryContent() {
  const searchParams = useSearchParams();
  const inspectionId = searchParams.get('id');

  const [loading, setLoading] = useState(true);
  const [inspection, setInspection] = useState(null);
  const [activePhoto, setActivePhoto] = useState(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    async function loadInspection() {
      if (!inspectionId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/api/admin/inspections`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.inspections)) {
            const found = data.inspections.find(i => i.inspection_id === inspectionId);
            setInspection(found || null);
          }
        }
      } catch (e) {
        console.error('Error fetching inspection photos:', e);
      } finally {
        setLoading(false);
      }
    }
    loadInspection();
  }, [inspectionId, API_BASE]);

  // Extract unique photos list
  const photosDict = inspection?.photos || {};
  const uniquePhotos = React.useMemo(() => {
    const seen = new Set();
    const result = [];
    for (const [key, photoData] of Object.entries(photosDict)) {
      const src = typeof photoData === 'string'
        ? photoData
        : photoData?.url 
          ? (photoData.url.startsWith('http') ? photoData.url : `${API_BASE}${photoData.url}`)
          : photoData?.data || '';

      if (src && !seen.has(src)) {
        seen.add(src);
        const angle = key.replace(/_/g, ' ').toUpperCase();
        result.push({ key, src, angle, sizeBytes: photoData?.sizeBytes });
      }
    }
    return result;
  }, [photosDict, API_BASE]);

  const clientName = inspection?.user_info?.name || `${inspection?.user_info?.firstName || ''} ${inspection?.user_info?.surname || ''}`.trim() || 'Client';
  const clientEmail = inspection?.user_info?.email || 'N/A';
  const pdfUrl = inspection?.pdf_url ? `${API_BASE}${inspection.pdf_url}` : `${API_BASE}/api/reports/${inspectionId}/pdf`;
  const findings = inspection?.findings || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-[#022a5b]" />
        <p className="text-sm font-semibold text-slate-600">Loading uploaded vehicle photos...</p>
      </div>
    );
  }

  if (!inspection) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <AlertTriangle className="w-12 h-12 text-amber-500 mb-3" />
        <h2 className="text-lg font-bold text-slate-900">Inspection Not Found</h2>
        <p className="text-xs text-slate-500 mt-1 max-w-md">
          Could not find an inspection record matching reference: <span className="font-mono font-bold">{inspectionId || 'None'}</span>
        </p>
        <Link 
          href="/admin" 
          className="mt-5 px-4 py-2 bg-[#022a5b] text-white rounded-xl text-xs font-bold hover:bg-[#022a5b]/90 transition-colors inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Admin Reports
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased p-4 sm:p-8 flex flex-col items-center">
      <div className="w-full max-w-6xl flex flex-col gap-6">
        
        {/* Top Header Navigation */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-colors shrink-0"
              title="Back to Admin Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                  Uploaded Photos Gallery
                </h1>
                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-[10px] font-bold">
                  {uniquePhotos.length} Angles Stored
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Ref: <span className="font-mono text-slate-700 font-semibold">{inspection.inspection_id}</span> • Customer: <strong className="text-slate-800">{clientName}</strong> ({clientEmail})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 bg-[#022a5b] text-white rounded-xl text-xs font-bold hover:bg-[#022a5b]/90 transition-colors flex items-center gap-2 shrink-0 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF Certificate</span>
            </a>
          </div>
        </div>

        {/* Informational Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-xs text-blue-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-blue-700 shrink-0" />
            <span>
              All {uniquePhotos.length} high-resolution photographs are permanently stored on the server disk for future AI training, model fine-tuning, and audit defense. Click any photo to expand.
            </span>
          </div>
          <span className="text-[11px] font-bold text-blue-800 shrink-0">
            {findings.length === 0 ? '✓ 0 Defects (Clean Vehicle)' : `⚠️ ${findings.length} Damage Finding(s)`}
          </span>
        </div>

        {/* Photos Grid */}
        {uniquePhotos.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center text-slate-500 text-xs border border-slate-200">
            No image files found for this inspection session.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {uniquePhotos.map((photo, idx) => (
              <div 
                key={photo.key || idx} 
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group cursor-pointer"
                onClick={() => setActivePhoto(photo)}
              >
                <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
                  <img 
                    src={photo.src} 
                    alt={photo.angle} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    loading="lazy"
                  />
                  <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/75 text-white rounded text-[10px] font-mono font-bold shadow-xs">
                    {photo.key}
                  </span>
                  <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-white/90 text-slate-800 rounded text-[10px] font-bold shadow-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    <ExternalLink className="w-2.5 h-2.5" /> Expand
                  </span>
                </div>

                <div className="p-3 flex items-center justify-between text-xs">
                  <div className="truncate pr-2">
                    <span className="font-bold text-slate-900 block truncate text-xs">{photo.angle}</span>
                    {photo.sizeBytes && (
                      <span className="text-[10px] text-slate-400 font-mono">
                        {(photo.sizeBytes / 1024).toFixed(1)} KB · Disk Stored
                      </span>
                    )}
                  </div>
                  <a
                    href={photo.src}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Open original raw image file"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Expanded Photo Lightbox Modal */}
      {activePhoto && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 sm:p-8"
          onClick={() => setActivePhoto(null)}
        >
          <div 
            className="max-w-5xl max-h-[90vh] bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <span className="font-bold text-slate-900 text-sm">{activePhoto.angle} ({activePhoto.key})</span>
                <span className="text-xs text-slate-500 block font-mono">Ref: {inspection.inspection_id}</span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={activePhoto.src}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Open Full Size</span>
                </a>
                <button
                  type="button"
                  onClick={() => setActivePhoto(null)}
                  className="px-3 py-1.5 bg-[#022a5b] text-white rounded-xl text-xs font-bold hover:bg-[#022a5b]/90 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="p-3 bg-slate-900 flex items-center justify-center max-h-[75vh] overflow-hidden">
              <img 
                src={activePhoto.src} 
                alt={activePhoto.angle} 
                className="max-w-full max-h-[72vh] object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminPhotosPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin text-[#022a5b]" />
      </div>
    }>
      <PhotosGalleryContent />
    </Suspense>
  );
}
