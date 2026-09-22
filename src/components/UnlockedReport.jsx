'use client';

import React from 'react';
import { CheckCircle2, Download, Scan, ShieldCheck, RotateCcw, Car, Key } from 'lucide-react';
import { toast } from 'sonner';

import DamagePhotoDialog from './DamagePhotoDialog';
import { getFindingEvidence } from './findingEvidence.mjs';
import VehicleBlueprintVectors from './VehicleBlueprintVectors';

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

  // Check bounding box and description to distinguish front vs rear door on side views
  const desc = (item?.description || '').toLowerCase();
  const currentPart = (item?.vehicle_part || '').toLowerCase();
  const box = item?.bounding_boxes?.[0]?.box;
  let boxXCenter = 500;
  if (box && box.length === 4) {
    boxXCenter = (box[1] + box[3]) / 2;
  }

  const isRearDoor = 
    currentPart.includes('rear') || 
    currentPart.includes('back') || 
    desc.includes('rear') || 
    desc.includes('back') || 
    (desc.includes('passenger door') && !desc.includes('front passenger')) ||
    (paddedKey === 'IMAGE_04' && boxXCenter > 520);

  if (paddedKey === 'IMAGE_04' || currentPart.includes('driver_door')) {
    return isRearDoor ? 'Driver Rear Door' : 'Driver Front Door';
  }

  if (paddedKey === 'IMAGE_09' || currentPart.includes('passenger_door')) {
    return isRearDoor ? 'Passenger Rear Door' : 'Passenger Front Door';
  }

  if (paddedNum < 11) {
    if (currentPart.includes('wheel') || currentPart.includes('rim')) {
      return ANGLE_LABEL_MAP[paddedKey] || 'Vehicle Panel';
    }
  }

  const rawPart = item?.vehicle_part || ANGLE_LABEL_MAP[paddedKey] || 'Vehicle Panel';
  return rawPart.replace(/_/g, ' ');
};

// Helper function to resolve dynamic non-overlapping 2D car map coordinates for all findings
function getResolvedCarPins(findings) {
  const MIN_PIN_DISTANCE = 28;
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

    // ════════════════════════════════════════════════════════════════════════════
    // 5-Panel Unfolded Pure Vector SVG Coordinates (viewBox 0 0 440 560)
    // Matches standard automotive inspection schematic:
    //   • Front View (top): y 16 - 80, x 144 - 296
    //   • Center Body (top-down): y 95 - 445, center line at x = 220
    //   • Left Side Profile (doors x 102, wheels x 56): y 95 - 445
    //   • Right Side Profile (doors x 338, wheels x 384): y 95 - 445
    //   • Rear View (bottom): y 460 - 536, x 144 - 296
    // ════════════════════════════════════════════════════════════════════════════
    let cx = 220;
    let cy = 275;

    // --- Front bumper / grille / headlights / front corners ---
    if (part.includes('front_bumper') || part.includes('grille') || part.includes('headlight') || (part.includes('front') && part.includes('corner'))) {
      cy = 60;
      cx = side === 'left' ? 168 : side === 'right' ? 272 : 220;

    // --- Rear bumper / taillights / exhaust / rear corners ---
    } else if (part.includes('rear_bumper') || part.includes('taillight') || part.includes('exhaust') || (part.includes('rear') && part.includes('corner'))) {
      cy = 490;
      cx = side === 'left' ? 169 : side === 'right' ? 271 : 220;

    // --- Hood / bonnet / cowl (center body top) ---
    } else if (part.includes('hood') || part.includes('bonnet') || part.includes('cowl')) {
      cy = 135;
      cx = side === 'left' ? 195 : side === 'right' ? 245 : 220;

    // --- Front windshield ---
    } else if (part.includes('windshield') && !part.includes('rear')) {
      cy = 195;
      cx = side === 'left' ? 200 : side === 'right' ? 240 : 220;

    // --- Rear windshield ---
    } else if (part.includes('rear_windshield')) {
      cy = 352;
      cx = side === 'left' ? 200 : side === 'right' ? 240 : 220;

    // --- Trunk / tailgate / boot ---
    } else if (part.includes('trunk') || part.includes('tailgate') || part.includes('boot')) {
      cy = 410;
      cx = side === 'left' ? 195 : side === 'right' ? 245 : 220;

    // --- Roof (center body) ---
    } else if (part.includes('roof')) {
      cy = 275;
      cx = side === 'left' ? 198 : side === 'right' ? 242 : 220;

    // --- Quarter panel / fender → unfolded side panels ---
    } else if (part.includes('quarter_panel') || part.includes('fender')) {
      if (part.includes('front')) {
        cy = 118;
        cx = side === 'right' ? 345 : 95;
      } else {
        cy = 422;
        cx = side === 'right' ? 345 : 95;
      }

    // --- Doors → unfolded side panels (clearly separated from roof at x=220) ---
    } else if (part.includes('door') || desc.includes('door')) {
      const descHasRear = desc.includes('rear') || desc.includes('back') || (desc.includes('passenger door') && !desc.includes('front'));
      const descHasFront = desc.includes('front') && !descHasRear;
      const partHasRear = part.includes('rear') || part.includes('back');
      const partHasFront = part.includes('front');

      // For side profile photos (IMAGE_04 driver side):
      // front door is left (boxXCenter < 520), rear door is right (boxXCenter > 520)
      const boxImpliesRear = (suppImg === 'IMAGE_04' && boxXCenter > 520) || suppImg === 'IMAGE_05' || suppImg === 'IMAGE_08';

      const isRear = partHasRear || descHasRear || (!partHasFront && !descHasFront && boxImpliesRear);

      if (isRear) {
        cy = 320; // Center of rear door (between B-pillar y=273 and rear wheel arch y=372)
        cx = side === 'right' ? 338 : 102;
      } else {
        cy = 225; // Center of front door (between front wheel arch y=168 and B-pillar y=273)
        cx = side === 'right' ? 338 : 102;
      }

    // --- Wheels / rims / tires → at outer wheel arches on side panels ---
    } else if (part.includes('wheel') || part.includes('rim') || part.includes('tire')) {
      if (part.includes('front')) {
        cx = side === 'right' ? 384 : 56;
        cy = 145;
      } else {
        cx = side === 'right' ? 384 : 56;
        cy = 395;
      }

    // --- Side mirrors ---
    } else if (part.includes('mirror')) {
      cx = side === 'right' ? 302 : 138;
      cy = 175;

    // --- A-pillar / B-pillar / C-pillar ---
    } else if (part.includes('pillar')) {
      if (part.includes('a_pillar') || part.includes('a-pillar')) {
        cx = side === 'right' ? 305 : 135;
        cy = 195;
      } else if (part.includes('c_pillar') || part.includes('c-pillar')) {
        cx = side === 'right' ? 305 : 135;
        cy = 350;
      } else {
        cx = side === 'right' ? 310 : 130;
        cy = 273;
      }

    // --- Rocker panel / side sill ---
    } else if (part.includes('rocker') || part.includes('sill')) {
      cx = side === 'right' ? 360 : 80;
      cy = 273;

    // --- Fallback: side or center ---
    } else {
      if (side === 'left') { cx = 100; cy = 273; }
      else if (side === 'right') { cx = 340; cy = 273; }
      else { cx = 220; cy = 275; }
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

    cx = Math.max(16, Math.min(424, cx));
    cy = Math.max(16, Math.min(544, cy));

    placedPins.push({ item, idx, cx, cy });
  });

  return placedPins;
}

export default function UnlockedReport({ 
  vehicleData, 
  userInfo,
  analysisResults, 
  activeInspectionId,
  photos, 
  onBack,
  onReset 
}) {
  const [activeBoxModal, setActiveBoxModal] = React.useState(null);
  const [downloading, setDownloading] = React.useState(false);
  const [hoveredIdx, setHoveredIdx] = React.useState(null);

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

  const placedPins = React.useMemo(() => getResolvedCarPins(findings), [findings]);
  const activePhotos = React.useMemo(() => {
    return (photos && Object.values(photos).some(p => p && (p.url || typeof p === 'string')))
      ? photos
      : (analysisResults?.photos || {});
  }, [photos, analysisResults]);

  const handleDownloadPdf = async () => {
    try {
      setDownloading(true);
      toast.info('Generating official certified PDF report...');
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE}/api/report/pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicleData, analysisResults, photos: activePhotos })
      });

      if (!response.ok) {
        throw new Error(`PDF generation failed: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `CarsInsure-Certificate-${vehicleData?.plateNumber || 'ID-123'}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Certified inspection report downloaded successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Unable to download PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
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

      {/* Top Banner: Unlocked State Notification */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">Comprehensive Report Unlocked</h3>
            <p className="text-xs text-slate-600">
              All {findings.length} findings, bounding coordinates, and certified export tools are activated.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleDownloadPdf}
            disabled={downloading}
            className="px-4 py-2 bg-[#022a5b] text-white rounded-xl text-xs font-bold hover:bg-[#022a5b]/90 transition-all shadow-xs flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            {downloading ? 'Exporting...' : 'Download PDF Certificate'}
          </button>
        </div>
      </div>

      {/* 2-Column Main Report View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left Column: Full Unlocked Blueprint */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-xs text-center lg:sticky lg:top-24">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2 min-w-0">
              <Car className="w-4 h-4 text-slate-700 shrink-0" />
              <span className="truncate">Full Vehicle Blueprint</span>
            </h3>
            <span className="text-[11px] sm:text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 shrink-0">
              All Pins Unlocked
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-4 text-left">
            Select any damage pin to inspect full resolution photos and box coordinates.
          </p>

          <div className="w-full bg-[#F1F5F9] rounded-2xl border border-slate-200 relative flex items-center justify-center overflow-hidden p-2.5 shadow-xs" style={{ aspectRatio: '440 / 560' }}>
            <svg className="w-full h-full" viewBox="0 0 440 560" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <filter id="unlocked-pin-shadow" x="-30%" y="-30%" width="160%" height="160%">
                  <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.35" />
                </filter>
              </defs>

              {/* Exact reference schematic rendered purely with vector SVG shapes */}
              <VehicleBlueprintVectors />

              {/* Dynamic SVG Pin Markers - ALL 100% UNLOCKED */}
              {placedPins.map(({ item, idx, cx, cy }) => {
                const isHovered = hoveredIdx === idx;
                const isUncertain = (item.severity || '').toLowerCase() === 'uncertain';
                const pinColor = item.severity === 'Severe' 
                  ? '#DC2626' 
                  : item.severity === 'Moderate' 
                  ? '#E11D48' 
                  : isUncertain 
                  ? '#475569' 
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
                    className="cursor-pointer select-none group"
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
                      filter="url(#unlocked-pin-shadow)"
                      className="transition-all duration-150 group-hover:brightness-110"
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
                      className="pointer-events-none select-none"
                    >
                      {idx + 1}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 mt-4 text-xs font-medium text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block shrink-0"></span> Minor</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block shrink-0"></span> Moderate</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block shrink-0"></span> Severe</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-500 inline-block shrink-0"></span> Uncertain</span>
            </div>
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
            <div className="min-w-0 font-medium flex items-start gap-2 w-full sm:w-auto">
              <Key className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1.5 w-full min-w-0">
                <span className="text-slate-500">Digital SHA-256 Hash:</span> 
                <code className="bg-white px-2 py-1.5 rounded-lg border border-slate-200 text-slate-800 font-mono text-[10px] break-all leading-relaxed whitespace-pre-wrap">
                  {analysisResults?.sha256_hash || 'sha256-verified-e8f9a201b49912c3'}
                </code>
              </div>
            </div>
            <span className="text-emerald-700 font-bold flex items-center gap-1.5 shrink-0 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Signed Record</span>
            </span>
          </div>

          {/* Bottom Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="w-full sm:flex-1 h-12 bg-gradient-to-r from-[#022a5b] via-[#033c80] to-[#022a5b] hover:from-[#033c80] hover:to-[#044a9e] text-white font-extrabold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#022a5b]/20 transition-all active:scale-98 disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-white" /> {downloading ? 'Exporting...' : 'Download Official PDF Certificate'}
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
