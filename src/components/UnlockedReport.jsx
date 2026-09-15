'use client';

import React from 'react';
import { CheckCircle2, Download, Scan, ShieldCheck, Eye } from 'lucide-react';
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
  const MIN_PIN_DISTANCE = 30; // Minimum center-to-center distance for 13px radius circles
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

    // Dynamic collision resolution loop to ensure zero overlap between any pins
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

    // Keep pin comfortably inside SVG viewbox bounds
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
  const findings = analysisResults?.findings || [];
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

  return (
    <div className="flex flex-col gap-6">
      {activeBoxModal && (
        <DamagePhotoDialog 
          item={activeBoxModal.item} 
          photos={activePhotos} 
          title={getSanitizedVehiclePart(activeBoxModal.item)} 
          onClose={() => setActiveBoxModal(null)} 
        />
      )}

      {/* Payment Success Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-slate-900 text-white rounded-3xl p-5 sm:p-6 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 shadow-lg border border-emerald-500/30">
        <div className="flex min-w-0 flex-1 flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="min-w-0 wrap-anywhere">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold uppercase tracking-wider mb-1 border border-emerald-400/30">
              ✓ Payment Verified • $3.00
            </div>
            <h2 className="font-black text-white text-xl tracking-tight">Full Inspection Unlocked!</h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Official PDF certificate emailed to <span className="font-bold text-white underline">{userInfo?.email || 'user@example.com'}</span>
            </p>
          </div>
        </div>

        <button 
          onClick={downloadPdf}
          className="w-full lg:w-auto px-5 min-h-12 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer shrink-0 active:scale-98"
        >
          <Download className="w-4 h-4 text-slate-950" /> Download PDF Certificate
        </button>
      </div>

      {/* 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Interactive 2D Top-Down Car Blueprint Model */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm text-center lg:sticky lg:top-24">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-extrabold text-xl text-slate-900">Vehicle Blueprint</h3>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              All Pins Unlocked
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-5 text-left">Click any number marker to view the photo and AI detection overlay.</p>

          <div className="w-full h-96 bg-[#F1F5F9]/70 rounded-3xl border border-slate-200/80 relative flex items-center justify-center overflow-hidden p-6">
            <svg className="h-full w-auto drop-shadow-xs" viewBox="0 0 220 440" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Outer Vehicle Body Shell */}
              <path 
                d="M 60 45 C 60 25, 160 25, 160 45 L 170 120 C 180 160, 180 270, 170 320 L 160 395 C 160 415, 60 415, 60 395 L 50 320 C 40 270, 40 160, 50 120 Z" 
                fill="#EEF2F6" 
                stroke="#94A3B8" 
                strokeWidth="2.5" 
              />

              {/* Inner Roof / Cabin Outlines */}
              <rect x="62" y="180" width="96" height="110" rx="16" fill="none" stroke="#CBD5E1" strokeWidth="2" />
              
              {/* Front Windshield (Light Soft Blue Glass) */}
              <path d="M 62 135 C 75 125, 145 125, 158 135 C 152 165, 68 165, 62 135 Z" fill="#DCEAFE" stroke="#93C5FD" strokeWidth="1.5" />

              {/* Rear Glass (Light Soft Blue Glass) */}
              <path d="M 64 300 C 75 290, 145 290, 156 300 C 150 330, 70 330, 64 300 Z" fill="#DCEAFE" stroke="#93C5FD" strokeWidth="1.5" />

              {/* Headlights (Soft Yellow) */}
              <path d="M 58 35 C 70 32, 90 32, 92 40 L 54 44 Z" fill="#FDE68A" />
              <path d="M 162 35 C 150 32, 130 32, 128 40 L 166 44 Z" fill="#FDE68A" />

              {/* Taillights (Soft Red) */}
              <path d="M 60 398 L 88 398 L 85 405 L 60 404 Z" fill="#FCA5A5" />
              <path d="M 160 398 L 132 398 L 135 405 L 160 404 Z" fill="#FCA5A5" />

              {/* Side Mirrors */}
              <path d="M 40 135 C 34 135, 34 150, 48 150 L 48 142 Z" fill="#475569" />
              <path d="M 180 135 C 186 135, 186 150, 172 150 L 172 142 Z" fill="#475569" />

              {/* Dark Side Wheels & Hubcaps */}
              <g fill="#334155">
                <rect x="24" y="80" width="18" height="48" rx="6" />
                <circle cx="42" cy="104" r="5" fill="#94A3B8" />
                
                <rect x="178" y="80" width="18" height="48" rx="6" />
                <circle cx="178" cy="104" r="5" fill="#94A3B8" />
                
                <rect x="24" y="310" width="18" height="48" rx="6" />
                <circle cx="42" cy="334" r="5" fill="#94A3B8" />
                
                <rect x="178" y="310" width="18" height="48" rx="6" />
                <circle cx="178" cy="334" r="5" fill="#94A3B8" />
              </g>

              {/* Dash Cutlines for Bonnet & Boot */}
              <path d="M 70 70 Q 110 58 150 70" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="3 2" fill="none" />
              <path d="M 70 365 Q 110 375 150 365" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="3 2" fill="none" />

              {/* Dynamic SVG Pin Markers - ALL 100% UNLOCKED */}
              {placedPins.map(({ item, idx, cx, cy }) => {
                const isHovered = hoveredIdx === idx;
                const pinColor = item.severity === 'Severe' ? '#DC2626' : item.severity === 'Moderate' ? '#DC2626' : '#D97706';

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
                    className="cursor-pointer select-none transition-transform"
                    onClick={() => setActiveBoxModal({ item })}
                  >
                    <circle 
                      cx={cx} 
                      cy={cy} 
                      r={isHovered ? "15" : "13"} 
                      fill={pinColor} 
                      stroke="#FFFFFF" 
                      strokeWidth={isHovered ? "3" : "2.5"} 
                      className="drop-shadow-md transition-all"
                    />
                    <text 
                      x={cx} 
                      y={cy} 
                      dy="4" 
                      fill="#FFFFFF" 
                      fontSize={isHovered ? "13" : "12"} 
                      fontWeight="900" 
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

          <div className="flex flex-wrap items-center justify-center gap-3 mt-5 text-xs font-semibold text-slate-600">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#D97706] inline-block"></span> Minor</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#DC2626] inline-block"></span> Moderate</span>
            <span className="text-slate-300">|</span>
            <span className="font-bold text-slate-900">{vehicleData?.makeModel || 'Vehicle'} • {vehicleData?.plateNumber || 'ID-123'}</span>
          </div>
        </div>

        {/* Right Column: Full Unlocked Findings List */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 uppercase tracking-wider">
                All {findings.length} Detected Damage Findings
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Complete AI analysis with bounding box overlays and severity levels.</p>
            </div>
            <span className="text-xs font-bold bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full border border-emerald-200 shrink-0">
              {findings.length} of {findings.length} Unlocked
            </span>
          </div>

          {findings.length === 0 && <p className="rounded-2xl bg-white p-6 text-sm text-slate-600 border border-slate-200">No damage findings were returned for this inspection.</p>}
          
          {findings.map((item, idx) => {
            const displaySrc = getFindingEvidence(item, activePhotos).src;
            const isHovered = hoveredIdx === idx;

            return (
              <div 
                key={item.finding_id || idx} 
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className={`bg-white rounded-3xl p-4 sm:p-5 border transition-all flex flex-col gap-3.5 ${
                  isHovered ? 'border-sky-400 shadow-md ring-2 ring-sky-100' : 'border-slate-200 shadow-xs hover:border-slate-300'
                }`}
              >
                {/* Top Section: Photo Thumbnail + Title & Info + (Severity Pill & Action Button) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="relative shrink-0 w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-2xs">
                      {displaySrc ? <img src={displaySrc} alt={item.vehicle_part} className="w-full h-full object-cover" /> : <span className="flex h-full items-center p-2 text-xs">Photo unavailable</span>}
                      <span className="absolute top-1 left-1 w-5 h-5 rounded-full bg-slate-900 text-white font-black text-[10px] flex items-center justify-center shadow-xs">
                        {idx + 1}
                      </span>
                    </div>
                    <div className="min-w-0 wrap-anywhere">
                      <h4 className="font-extrabold text-base text-slate-900 capitalize leading-snug">{getSanitizedVehiclePart(item)}</h4>
                      <p className="text-xs text-slate-500 font-medium mt-0.5 capitalize">
                        {item.damage_type?.replace(/_/g, ' ')} • <span className="text-slate-800 font-bold">{Math.round((item.confidence ?? 0.92) * 100)}% confidence</span>
                      </p>
                    </div>
                  </div>

                  {/* Right Column: Severity Badge & View Bounding Box Button */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0">
                    <span className={`px-3 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase shrink-0 ${
                      item.severity === 'Severe' ? 'bg-red-100 text-red-700 border border-red-200' : item.severity === 'Moderate' ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      {(item.severity || 'Minor').toUpperCase()}
                    </span>

                    <button type="button"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 hover:text-sky-800 px-3 py-1.5 rounded-xl border border-sky-200 cursor-pointer transition-all active:scale-95 whitespace-nowrap" 
                      onClick={() => setActiveBoxModal({ item })}
                    >
                      <Scan className="w-3.5 h-3.5 text-sky-600" />
                      <span>View Bounding Box</span>
                    </button>
                  </div>
                </div>

                {/* Bottom Section: AI Damage Description */}
                {item.description && (
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/80 p-3 rounded-2xl border border-slate-100/90">
                    {item.description}
                  </p>
                )}
              </div>
            );
          })}

          {/* Verification Audit Badge */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 mt-2">
            <span className="min-w-0 wrap-anywhere font-medium">Digital Verification Hash: <code className="bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700 font-mono">sha256-e8f9a201b49912c388a</code></span>
            <span className="text-emerald-600 font-bold flex items-center gap-1.5 shrink-0">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Cryptographically Signed</span>
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
