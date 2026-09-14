'use client';

import React from 'react';
import { ArrowLeft, Lock, ArrowRight } from 'lucide-react';

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

  // IMAGE_02 is strictly Windshield & Hood
  if (paddedKey === 'IMAGE_02') {
    return 'Windshield & Hood';
  }

  // If slot is non-wheel (1 to 10), but server returned a wheel label, override with exact angle label
  if (paddedNum < 11) {
    const currentPart = (item?.vehicle_part || '').toLowerCase();
    if (currentPart.includes('wheel') || currentPart.includes('rim')) {
      return ANGLE_LABEL_MAP[paddedKey] || 'Vehicle Panel';
    }
  }

  return ANGLE_LABEL_MAP[paddedKey] || item?.vehicle_part?.replace(/_/g, ' ') || 'Vehicle Part';
};

export default function CarMapResults({ 
  vehicleData, 
  analysisResults,
  photos,
  setCurrentStep 
}) {
  const findings = analysisResults?.findings || [];
  const [activeBoxModal, setActiveBoxModal] = React.useState(null);

  return (
    <div className="flex flex-col gap-6">
      {activeBoxModal && <DamagePhotoDialog item={activeBoxModal.item} photos={photos} title={getSanitizedVehiclePart(activeBoxModal.item)} onClose={() => setActiveBoxModal(null)} />}


      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button aria-label="Back to photo checklist" onClick={() => setCurrentStep('checklist')} className="w-11 h-11 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h2 className="text-xl font-bold text-slate-900">Results</h2>
        </div>
        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
          {Math.min(3, findings.length)} of {findings.length} findings shown
        </span>
      </div>

      {/* 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: 2D Top-Down Car Outline Map */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm text-center lg:sticky lg:top-24">
          <h3 className="font-extrabold text-xl text-slate-900 mb-1">Inspection complete</h3>
          <p className="text-xs text-slate-500 mb-5">We found {findings.length} visible areas that may need attention.</p>

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

              {/* Dynamic SVG Pin Markers directly anchored to vector coordinates inside the vehicle silhouette */}
              {findings.map((item, idx) => {
                const part = (item.vehicle_part || '').toLowerCase();
                const desc = (item.description || '').toLowerCase();
                const damageType = (item.damage_type || '').toLowerCase();
                const suppImg = item.supporting_images?.[0] || 'IMAGE_01';
                
                // Extract normalized bounding box center X (0 to 1000)
                const box = item.bounding_boxes?.[0]?.box; // [ymin, xmin, ymax, xmax]
                let boxXCenter = 500;
                if (box && box.length === 4) {
                  boxXCenter = (box[1] + box[3]) / 2;
                }

                // Check explicit side keywords in vehicle_part, description, or damage_type
                const isExplicitLeft = part.includes('left') || desc.includes('left') || damageType.includes('left') || part.includes('driver');
                const isExplicitRight = part.includes('right') || desc.includes('right') || damageType.includes('right') || part.includes('passenger');

                // Determine side (left, right, center)
                let side = 'center';
                if (isExplicitLeft) side = 'left';
                else if (isExplicitRight) side = 'right';
                else {
                  // Infer side from photo angle & AI bounding box X coordinate
                  if (suppImg === 'IMAGE_01' || part.includes('front')) {
                    // Front View: Photo Left (boxXCenter < 480) is Car RIGHT (Passenger side). Photo Right is Car LEFT.
                    if (boxXCenter < 480) side = 'right';
                    else if (boxXCenter > 520) side = 'left';
                  } else if (suppImg === 'IMAGE_02' || suppImg === 'IMAGE_03' || part.includes('rear')) {
                    // Rear View: Photo Left (boxXCenter < 480) is Car LEFT (Driver side). Photo Right is Car RIGHT.
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
                    // Rear quarter panel / fender
                    cy = 320;
                    cx = side === 'right' ? 152 : 68;
                  }
                } else if (part.includes('door')) {
                  if (part.includes('rear')) {
                    cy = 245;
                    cx = side === 'right' ? 154 : 66;
                  } else {
                    cy = 165;
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

                // De-conflict overlapping pin markers if multiple findings map to near-identical spots
                if (idx > 0 && idx % 2 === 1) {
                  cy += (cy > 220 ? -12 : 12);
                }

                const pinColor = item.severity === 'Severe' ? '#DC2626' : item.severity === 'Moderate' ? '#DC2626' : '#D97706';

                return (
                  <g 
                    key={item.finding_id || idx}
                    role="button" tabIndex={0} aria-label={`View damage photo ${idx + 1}: ${getSanitizedVehiclePart(item)}`}
                    onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setActiveBoxModal({ item }); } }}
                    className="cursor-pointer"
                    onClick={() => {
                      const displaySrc = getFindingEvidence(item, photos).src;
                      setActiveBoxModal({ item });
                    }}
                  >
                    <circle 
                      cx={cx} 
                      cy={cy} 
                      r="13" 
                      fill={pinColor} 
                      stroke="#FFFFFF" 
                      strokeWidth="2.5" 
                      className="drop-shadow-md"
                    />
                    <text 
                      x={cx} 
                      y={cy} 
                      dy="4" 
                      fill="#FFFFFF" 
                      fontSize="12" 
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

        {/* Right Column: Dynamic Damage Finding Cards */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
            Detected damage ({Math.min(3, findings.length)} of {findings.length} shown)
          </h3>

          {findings.length === 0 && <p className="rounded-xl bg-white p-4 text-sm text-slate-600">No damage findings were returned for this inspection.</p>}
          {findings.slice(0, 3).map((item, idx) => {
            const displaySrc = getFindingEvidence(item, photos).src;

            return (
              <div key={item.finding_id || idx} className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-300 transition-colors">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="relative shrink-0 w-20 h-20 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
                    {displaySrc ? <img src={displaySrc} alt={item.vehicle_part} className="w-full h-full object-cover" /> : <span className="flex h-full items-center p-2 text-xs">Photo unavailable</span>}
                    <span className="absolute top-1 left-1 w-5 h-5 rounded-full bg-slate-900 text-white font-extrabold text-[10px] flex items-center justify-center shadow-xs">
                      {idx + 1}
                    </span>
                  </div>
                  <div className="min-w-0 wrap-anywhere">
                    <h4 className="font-extrabold text-base text-slate-900 capitalize">{getSanitizedVehiclePart(item)}</h4>
                    <p className="text-xs text-slate-500 mt-0.5 capitalize">{item.damage_type?.replace(/_/g, ' ')}</p>
                    <p className="text-[11px] text-slate-400 font-semibold mt-1">{Math.round((item.confidence ?? 0.92) * 100)}% confidence</p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase ${
                    item.severity === 'Severe' ? 'bg-red-100 text-red-700' : item.severity === 'Moderate' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {(item.severity || 'Minor').toUpperCase()}
                  </span>

                  <button type="button"
                    className="min-h-11 inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 cursor-pointer hover:text-sky-700" 
                    onClick={() => {
                      setActiveBoxModal({ item });
                    }}
                  >
                    🖼️ View photo
                  </button>
                </div>
              </div>
            );
          })}

          {/* Paywall CTA Card */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl flex flex-col gap-4 mt-2 border border-slate-800">
            <span className="bg-sky-500/20 text-sky-300 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full w-fit border border-sky-400/30">
              FULL PDF REPORT
            </span>
            <div>
              <h3 className="text-xl font-extrabold text-white tracking-tight">Unlock your complete inspection report</h3>
              <p className="text-slate-300 text-xs mt-1">All {findings.length} findings, AI descriptions, normalized bounding box coordinates, and official PDF certificate.</p>
            </div>

            <button 
              onClick={() => setCurrentStep('paywall')}
              className="w-full h-13 bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
            >
              <Lock className="w-4 h-4 text-slate-950" /> Unlock Full Report for $3 <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
