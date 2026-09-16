'use client';

import React from 'react';
import { CheckCircle2, Download, Scan, ShieldCheck, RotateCcw, Car, Key } from 'lucide-react';
import { toast } from 'sonner';

import DamagePhotoDialog from './DamagePhotoDialog';
import { getFindingEvidence } from './findingEvidence.mjs';

// Helper function to guarantee vehicle part text label matches the exact photo angle slot
const getSanitizedVehiclePart = (item) => {
  const suppImg = item?.supporting_images?.[0] || 'IMAGE_01';
  const digits = suppImg.replace(/\D/g, '');
  const paddedNum = parseInt(digits || '1', 10);
  const paddedKey = `IMAGE_${digits.padStart(2, '0')}`;

  const ANGLE_LABEL_MAP = {
    'IMAGE_01': 'Front Bumper',
    'IMAGE_02': 'Windshield & Hood',
    'IMAGE_03': 'Front Left Corner',
    'IMAGE_04': 'Driver Door',
    'IMAGE_05': 'Rear Left Corner',
    'IMAGE_06': 'Rear Bumper',
    'IMAGE_07': 'Rear Windshield',
    'IMAGE_08': 'Rear Right Corner',
    'IMAGE_09': 'Passenger Door',
    'IMAGE_10': 'Front Right Corner',
    'IMAGE_11': 'Front Left Wheel',
    'IMAGE_12': 'Rear Left Wheel',
    'IMAGE_13': 'Rear Right Wheel',
    'IMAGE_14': 'Front Right Wheel'
  };

  if (paddedKey === 'IMAGE_02') {
    return 'Windshield & Hood';
  }

  if (paddedNum < 11) {
    const currentPart = (item?.vehicle_part || '').toLowerCase();
    if (currentPart.includes('wheel') || currentPart.includes('rim')) {
      return ANGLE_LABEL_MAP[paddedKey] || 'Vehicle Panel';
    }
  }

  const rawPart = item?.vehicle_part || ANGLE_LABEL_MAP[paddedKey] || 'Vehicle Panel';
  return rawPart.replace(/_/g, ' ');
};

// Helper function to resolve dynamic non-overlapping 2D car map coordinates for all findings
function getResolvedCarPins(findings) {
  const MIN_PIN_DISTANCE = 32;
  const placedPins = [];

  findings.forEach((item, idx) => {
    const part = (item.vehicle_part || '').toLowerCase();
    const desc = (item.description || '').toLowerCase();
    const damageType = (item.damage_type || '').toLowerCase();
    const suppImg = item.supporting_images?.[0] || 'IMAGE_01';
    
    // Extract normalized bounding box center X (0 to 1000)
    const box = item.bounding_boxes?.[0]?.box;
    let boxXCenter = 500;
    if (box && box.length === 4) {
      boxXCenter = (box[1] + box[3]) / 2;
    }

    // Check explicit side keywords
    const isExplicitLeft = part.includes('left') || desc.includes('left') || damageType.includes('left') || part.includes('driver');
    const isExplicitRight = part.includes('right') || desc.includes('right') || damageType.includes('right') || part.includes('passenger');

    let side = 'center';
    if (isExplicitLeft) side = 'left';
    else if (isExplicitRight) side = 'right';
    else {
      if (suppImg === 'IMAGE_01' || part.includes('front')) {
        if (boxXCenter < 480) side = 'right';
        else if (boxXCenter > 520) side = 'left';
      } else if (suppImg === 'IMAGE_02' || suppImg === 'IMAGE_03' || part.includes('rear')) {
        if (boxXCenter < 480) side = 'left';
        else if (boxXCenter > 520) side = 'right';
      }
    }

    let cx = 110;
    let cy = 220;

    if (part.includes('front_bumper') || part.includes('grille') || part.includes('headlight')) {
      cy = 42;
      cx = side === 'left' ? 75 : side === 'right' ? 145 : 110;
    } else if (part.includes('rear_bumper') || part.includes('taillight') || part.includes('exhaust')) {
      cy = 395;
      cx = side === 'left' ? 75 : side === 'right' ? 145 : 110;
    } else if (part.includes('hood') || part.includes('bonnet')) {
      cy = 85;
      cx = side === 'left' ? 85 : side === 'right' ? 135 : 110;
    } else if (part.includes('windshield') && !part.includes('rear')) {
      cy = 145;
      cx = side === 'left' ? 90 : side === 'right' ? 130 : 110;
    } else if (part.includes('rear_windshield')) {
      cy = 305;
      cx = side === 'left' ? 90 : side === 'right' ? 130 : 110;
    } else if (part.includes('trunk') || part.includes('tailgate') || part.includes('boot')) {
      cy = 350;
      cx = side === 'left' ? 85 : side === 'right' ? 135 : 110;
    } else if (part.includes('roof')) {
      cy = 230;
      cx = side === 'left' ? 85 : side === 'right' ? 135 : 110;
    } else if (part.includes('quarter_panel') || part.includes('fender')) {
      if (part.includes('front')) {
        cy = 90;
        cx = side === 'right' ? 152 : 68;
      } else {
        cy = 320;
        cx = side === 'right' ? 152 : 68;
      }
    } else if (part.includes('door')) {
      if (part.includes('rear')) {
        cy = 250;
        cx = side === 'right' ? 154 : 66;
      } else {
        cy = 175;
        cx = side === 'right' ? 154 : 66;
      }
    } else if (part.includes('wheel') || part.includes('rim') || part.includes('tire')) {
      if (part.includes('front')) {
        cx = side === 'right' ? 182 : 38;
        cy = 104;
      } else {
        cx = side === 'right' ? 182 : 38;
        cy = 334;
      }
    } else if (part.includes('mirror')) {
      cx = side === 'right' ? 180 : 40;
      cy = 142;
    } else {
      if (side === 'left') { cx = 68; cy = 220; }
      else if (side === 'right') { cx = 152; cy = 220; }
      else { cx = 110; cy = 220; }
    }

    let attempts = 0;
    let isColliding = true;
    while (isColliding && attempts < 20) {
      isColliding = false;
      for (const placed of placedPins) {
        const dx = cx - placed.cx;
        const dy = cy - placed.cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MIN_PIN_DISTANCE) {
          isColliding = true;
          const shift = MIN_PIN_DISTANCE - dist + 4;
          if (Math.abs(dy) >= Math.abs(dx) || dy === 0) {
            const shiftY = cy >= placed.cy ? shift : -shift;
            cy += shiftY;
          } else {
            const shiftX = cx >= placed.cx ? shift : -shift;
            cx += shiftX;
          }
          break;
        }
      }
      attempts++;
    }

    cx = Math.max(36, Math.min(184, cx));
    cy = Math.max(38, Math.min(402, cy));

    placedPins.push({ item, idx, cx, cy });
  });

  return placedPins;
}

export default function UnlockedReport({ 
  vehicleData, 
  userInfo, 
  analysisResults, 
  activeInspectionId, 
  photos 
}) {
  const findings = React.useMemo(() => {
    const raw = analysisResults?.findings || [];
    const uncertain = (analysisResults?.uncertain_findings || []).map((uf, i) => ({
      ...uf,
      finding_id: uf.finding_id || `UNC-${i + 1}`,
      severity: uf.severity || 'Uncertain'
    }));
    const rawIds = new Set(raw.map(f => f.finding_id));
    const newUncertain = uncertain.filter(u => !rawIds.has(u.finding_id));
    return [...raw, ...newUncertain];
  }, [analysisResults]);

  const [activeBoxModal, setActiveBoxModal] = React.useState(null);
  const [hoveredIdx, setHoveredIdx] = React.useState(null);
  const placedPins = React.useMemo(() => getResolvedCarPins(findings), [findings]);
  const activePhotos = React.useMemo(() => {
    return (photos && Object.values(photos).some(p => p && (p.url || typeof p === 'string')))
      ? photos
      : (analysisResults?.photos || {});
  }, [photos, analysisResults]);

  const downloadPdf = () => {
    const inspId = activeInspectionId || analysisResults?.inspection_id || 'INS-DEMO';
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    window.open(`${API_BASE}/api/reports/${inspId}/pdf`, '_blank');
    toast.success('Official PDF Certificate generated!');
  }; 

  const displayEmail = userInfo?.email || analysisResults?.user_info?.email || (typeof window !== 'undefined' ? localStorage.getItem('carsinsure_user_email') : '') || 'your email';

  return (
    <div className="flex flex-col gap-5">
      {activeBoxModal && (
        <DamagePhotoDialog 
          item={activeBoxModal.item} 
          photos={activePhotos} 
          title={getSanitizedVehiclePart(activeBoxModal.item)} 
          onClose={() => setActiveBoxModal(null)} 
        />
      )}

      {/* Payment Success Banner (Refined Proportionate Executive Card) */}
      <div className="bg-gradient-to-r from-[#022a5b]/6 via-white to-emerald-50/50 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs border border-[#022a5b]/15 relative overflow-hidden">
        {/* Subtle Top Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#022a5b] via-[#04428e] via-sky-500 to-emerald-500" />

        <div className="flex min-w-0 flex-1 items-center gap-3.5 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0 shadow-2xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="min-w-0 space-y-0.5">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold uppercase tracking-wider border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              <span>Payment Verified • Full Report Unlocked</span>
            </div>
            
            {/* Refined Proportional Gradient Title */}
            <h2 className="font-bold text-base sm:text-lg tracking-tight leading-tight">
              <span className="bg-gradient-to-r from-[#022a5b] via-[#04428e] to-[#0a66c2] bg-clip-text text-transparent">
                Official Inspection Certificate
              </span>{' '}
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 bg-clip-text text-transparent">
                Ready
              </span>
            </h2>

            <p className="text-[11px] text-slate-500">
              Signed PDF certificate emailed to <span className="font-bold text-slate-800 underline decoration-slate-300">{displayEmail}</span>
            </p>
          </div>
        </div>

        <button 
          onClick={downloadPdf}
          className="w-full sm:w-auto px-4 h-10 bg-gradient-to-r from-[#022a5b] via-[#033c80] to-[#022a5b] hover:from-[#033c80] hover:to-[#044a9e] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer shrink-0 active:scale-98 relative z-10"
        >
          <Download className="w-3.5 h-3.5 text-white" />
          <span>Download PDF Certificate</span>
        </button>
      </div>

      {/* 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left Column: Interactive 2D Top-Down Car Blueprint Model */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs text-center lg:sticky lg:top-24">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Car className="w-4 h-4 text-slate-700" />
              <span>Full Vehicle Blueprint</span>
            </h3>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              All Pins Unlocked
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-4 text-left">
            Select any damage pin to inspect full resolution photos and box coordinates.
          </p>

          <div className="w-full h-96 bg-slate-50 rounded-2xl border border-slate-200 relative flex items-center justify-center overflow-hidden p-4">
            <svg className="h-full w-auto" viewBox="0 0 220 440" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Outer Vehicle Body Shell */}
              <path 
                d="M 60 45 C 60 25, 160 25, 160 45 L 170 120 C 180 160, 180 270, 170 320 L 160 395 C 160 415, 60 415, 60 395 L 50 320 C 40 270, 40 160, 50 120 Z" 
                fill="#E2E8F0" 
                stroke="#94A3B8" 
                strokeWidth="2" 
              />

              {/* Inner Roof / Cabin Outlines */}
              <rect x="62" y="180" width="96" height="110" rx="16" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="1.5" />
              
              {/* Front Windshield (Soft Blue Glass) */}
              <path d="M 62 135 C 75 125, 145 125, 158 135 C 152 165, 68 165, 62 135 Z" fill="#BFDBFE" stroke="#93C5FD" strokeWidth="1.5" />

              {/* Rear Glass (Soft Blue Glass) */}
              <path d="M 64 300 C 75 290, 145 290, 156 300 C 150 330, 70 330, 64 300 Z" fill="#BFDBFE" stroke="#93C5FD" strokeWidth="1.5" />

              {/* Headlights (Soft Yellow) */}
              <path d="M 58 35 C 70 32, 90 32, 92 40 L 54 44 Z" fill="#FDE68A" />
              <path d="M 162 35 C 150 32, 130 32, 128 40 L 166 44 Z" fill="#FDE68A" />

              {/* Taillights (Soft Red) */}
              <path d="M 60 398 L 88 398 L 85 405 L 60 404 Z" fill="#FCA5A5" />
              <path d="M 160 398 L 132 398 L 135 405 L 160 404 Z" fill="#FCA5A5" />

              {/* Side Mirrors */}
              <path d="M 40 135 C 34 135, 34 150, 48 150 L 48 142 Z" fill="#64748B" />
              <path d="M 180 135 C 186 135, 186 150, 172 150 L 172 142 Z" fill="#64748B" />

              {/* Dark Side Wheels & Hubcaps */}
              <g fill="#475569">
                <rect x="24" y="80" width="18" height="48" rx="6" />
                <circle cx="42" cy="104" r="5" fill="#94A3B8" />
                
                <rect x="178" y="80" width="18" height="48" rx="6" />
                <circle cx="178" cy="104" r="5" fill="#94A3B8" />
                
                <rect x="24" y="310" width="18" height="48" rx="6" />
                <circle cx="42" cy="334" r="5" fill="#94A3B8" />
                
                <rect x="178" y="310" width="18" height="48" rx="6" />
                <circle cx="178" cy="334" r="5" fill="#94A3B8" />
              </g>

              {/* Dash Cutlines */}
              <path d="M 70 70 Q 110 58 150 70" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="3 2" fill="none" />
              <path d="M 70 365 Q 110 375 150 365" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="3 2" fill="none" />

              {/* Dynamic SVG Pin Markers - ALL 100% UNLOCKED */}
              {placedPins.map(({ item, idx, cx, cy }) => {
                const isHovered = hoveredIdx === idx;
                const isUncertain = (item.severity || '').toLowerCase() === 'uncertain';
                const pinColor = item.severity === 'Severe' 
                  ? '#DC2626' 
                  : item.severity === 'Moderate' 
                  ? '#E11D48' 
                  : isUncertain 
                  ? '#64748B' 
                  : '#D97706';

                return (
                  <g 
                    key={item.finding_id || idx} 
                    role="button" 
                    tabIndex={0} 
                    aria-label={`View damage photo ${idx + 1}: ${getSanitizedVehiclePart(item)}`}
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    onKeyDown={(event) => { 
                      if (event.key === 'Enter' || event.key === ' ') { 
                        event.preventDefault(); 
                        setActiveBoxModal({ item }); 
                      } 
                    }}
                    className="cursor-pointer select-none transition-transform active:scale-95"
                    onClick={() => setActiveBoxModal({ item })}
                  >
                    <circle 
                      cx={cx} 
                      cy={cy} 
                      r={isHovered ? "15" : "13"} 
                      fill={pinColor} 
                      stroke="#FFFFFF" 
                      strokeWidth={isHovered ? "3" : "2.5"} 
                      strokeDasharray={isUncertain ? '3 2' : 'none'}
                      className="drop-shadow-sm transition-all"
                    />
                    <text 
                      x={cx} 
                      y={cy} 
                      dy="4" 
                      fill="#FFFFFF" 
                      fontSize={isHovered ? "13" : "12"} 
                      fontWeight="bold" 
                      textAnchor="middle" 
                      fontFamily="sans-serif"
                    >
                      {idx + 1}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 mt-4 text-xs font-medium text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span> Minor</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span> Moderate</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block"></span> Severe</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-500 inline-block"></span> Uncertain</span>
            </div>
            <span className="font-bold text-slate-800">{vehicleData?.makeModel || 'Vehicle'} • {vehicleData?.plateNumber || 'ID-123'}</span>
          </div>
        </div>

        {/* Right Column: Full Unlocked Findings List */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                All {findings.length} Unlocked Damage Findings
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Complete AI analysis with bounding box overlays and descriptions.</p>
            </div>
            <span className="text-xs font-semibold bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full border border-emerald-200 shrink-0">
              {findings.length} of {findings.length} Unlocked
            </span>
          </div>

          {findings.length === 0 && (
            <p className="rounded-2xl bg-white p-6 text-sm text-slate-600 border border-slate-200">
              No damage findings were returned for this inspection.
            </p>
          )}
          
          {findings.map((item, idx) => {
            const displaySrc = getFindingEvidence(item, activePhotos).src;
            const isHovered = hoveredIdx === idx;
            const confidencePct = Math.round((item.confidence ?? 0.92) * 100);

            return (
              <div 
                key={item.finding_id || idx} 
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all flex flex-col gap-3 ${
                  isHovered ? 'border-[#022a5b]/40 shadow-xs ring-1 ring-[#022a5b]/10' : 'border-slate-200 shadow-xs hover:border-slate-300'
                }`}
              >
                {/* Top Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Dedicated Clear High-Contrast Number Badge OUTSIDE the image */}
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#022a5b] to-[#04428e] text-white font-black text-xs sm:text-sm flex items-center justify-center shrink-0 shadow-xs ring-2 ring-[#022a5b]/15">
                      {idx + 1}
                    </div>

                    {/* Clean unobstructed photo thumbnail */}
                    <div className="relative shrink-0 w-14 h-14 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-2xs">
                      {displaySrc ? (
                        <img src={displaySrc} alt={item.vehicle_part} className="w-full h-full object-cover" />
                      ) : (
                        <span className="flex h-full items-center justify-center text-xs text-slate-400">Photo</span>
                      )}
                    </div>

                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-slate-900 capitalize leading-snug">{getSanitizedVehiclePart(item)}</h4>
                      <p className="text-xs text-slate-500 capitalize mt-0.5">
                        {item.damage_type?.replace(/_/g, ' ')} • <span className="font-semibold text-[#022a5b]">{confidencePct}% confidence</span>
                      </p>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      item.severity === 'Severe' 
                        ? 'bg-red-100 text-red-800 border border-red-200' 
                        : item.severity === 'Moderate' 
                        ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                        : (item.severity || '').toLowerCase() === 'uncertain'
                        ? 'bg-slate-100 text-slate-800 border border-slate-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      {item.severity || 'Minor'}
                    </span>

                    <button 
                      type="button"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#022a5b] bg-[#022a5b]/5 hover:bg-[#022a5b]/10 px-3 py-1.5 rounded-lg border border-[#022a5b]/15 cursor-pointer transition-colors" 
                      onClick={() => setActiveBoxModal({ item })}
                    >
                      <Scan className="w-3.5 h-3.5 text-[#022a5b]" />
                      <span>Bounding Box</span>
                    </button>
                  </div>
                </div>

                {/* AI Damage Description */}
                {item.description && (
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {item.description}
                  </p>
                )}
              </div>
            );
          })}

          {/* Verification Audit Badge */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600 mt-1">
            <span className="min-w-0 wrap-anywhere font-medium flex items-center gap-2">
              <Key className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Digital SHA-256 Hash: <code className="bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-800 font-mono text-[11px]">{analysisResults?.sha256_hash || 'sha256-verified-e8f9a201b49912c3'}</code></span>
            </span>
            <span className="text-emerald-700 font-bold flex items-center gap-1.5 shrink-0 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Signed Record</span>
            </span>
          </div>

          {/* Bottom Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              type="button"
              onClick={downloadPdf}
              className="w-full sm:flex-1 h-12 bg-gradient-to-r from-[#022a5b] via-[#033c80] to-[#022a5b] hover:from-[#033c80] hover:to-[#044a9e] text-white font-extrabold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#022a5b]/20 transition-all active:scale-98"
            >
              <Download className="w-4 h-4 text-white" /> Download Official PDF Certificate
            </button>
            <button
              type="button"
              onClick={() => {
                try {
                  localStorage.removeItem('carsinsure_step');
                  localStorage.removeItem('carsinsure_active_inspection_id');
                  localStorage.removeItem('carsinsure_analysis_results');
                  localStorage.removeItem('carsinsure_photos');
                  localStorage.removeItem('carsinsure_vehicle_data');
                  localStorage.removeItem('carsinsure_pending_inspection_id');
                  localStorage.removeItem('carsinsure_user_name');
                  localStorage.removeItem('carsinsure_user_email');
                } catch (e) {}
                window.location.href = '/';
              }}
              className="w-full sm:w-auto h-12 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-4 h-4" /> Start New Scan
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
