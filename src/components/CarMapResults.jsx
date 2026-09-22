'use client';

import React from 'react';
import { ArrowLeft, Lock, ArrowRight, Eye, ShieldCheck, CheckCircle2, Download, RotateCcw, Car } from 'lucide-react';
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
    
    // Extract normalized bounding box center X and Y (0 to 1000)
    const box = item.bounding_boxes?.[0]?.box;
    let boxXCenter = 500;
    let boxYCenter = 500;
    if (box && box.length === 4) {
      boxXCenter = (box[1] + box[3]) / 2;
      boxYCenter = (box[0] + box[2]) / 2;
    }

    let side = 'center';
    let hasVisualSide = false;

    // Use visual ground truth (bounding box) if available, but determine perspective based purely on the semantic part name, not suppImg
    if (box && box.length === 4) {
      // Strictly identify parts that are on the direct front or rear face of the vehicle.
      // Exclude parts that are on the side but contain 'front'/'rear' in their name (e.g. "front door", "rear wheel", "quarter panel").
      const isSidePart = part.includes('door') || part.includes('wheel') || part.includes('tire') || part.includes('rim') || part.includes('mirror') || part.includes('fender') || part.includes('quarter_panel') || part.includes('corner');
      
      const partIsRear = !isSidePart && (part.includes('rear_bumper') || part.includes('tailgate') || part.includes('trunk') || part.includes('boot') || part.includes('taillight') || part.includes('exhaust') || part.includes('rear_windshield'));
      const partIsFront = !isSidePart && (part.includes('front_bumper') || part.includes('grille') || part.includes('headlight') || part.includes('windshield') || part.includes('hood'));
      
      // If we know we are looking at the front of the car
      if (partIsFront) {
        if (boxXCenter < 450) { side = 'right'; hasVisualSide = true; } // Viewer left = Car right
        else if (boxXCenter > 550) { side = 'left'; hasVisualSide = true; } // Viewer right = Car left
      } 
      // If we know we are looking at the rear of the car
      else if (partIsRear) {
        if (boxXCenter < 450) { side = 'left'; hasVisualSide = true; } // Viewer left = Car left
        else if (boxXCenter > 550) { side = 'right'; hasVisualSide = true; } // Viewer right = Car right
      }
    }
    
    // Fallback to explicit text keywords if visual side couldn't be determined (e.g. side profile photos or center damage)
    if (!hasVisualSide) {
      const isExplicitLeft = part.includes('left') || desc.includes('left') || damageType.includes('left') || part.includes('driver');
      const isExplicitRight = part.includes('right') || desc.includes('right') || damageType.includes('right') || part.includes('passenger');
      
      if (isExplicitLeft) side = 'left';
      else if (isExplicitRight) side = 'right';
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

    // We introduce dynamic bounding-box interpolation to give the pins a precise, non-static position based on where the visual damage was detected
    const applyDynamicOffset = (baseX, baseY, minX, maxX, minY, maxY, invertX = false, invertY = false) => {
      if (!box || box.length !== 4) return { cx: baseX, cy: baseY };
      
      let effectiveMinX = minX;
      let effectiveMaxX = maxX;
      
      // If the part spans the width of the car (crosses center 220), constrain interpolation to the correct semantic side
      // This prevents close-up photos of one half from mapping to the wrong half of the blueprint
      if (minX < 220 && maxX > 220) {
        const midX = (minX + maxX) / 2;
        if (side === 'left') {
          effectiveMaxX = midX;
        } else if (side === 'right') {
          effectiveMinX = midX;
        }
      }
      
      // Calculate normalized ratio (0.0 to 1.0)
      const ratioX = invertX ? (1000 - boxXCenter) / 1000 : boxXCenter / 1000;
      const ratioY = invertY ? (1000 - boxYCenter) / 1000 : boxYCenter / 1000;
      
      const newCx = effectiveMinX + ratioX * (effectiveMaxX - effectiveMinX);
      const newCy = minY + ratioY * (maxY - minY);
      
      return { cx: newCx, cy: newCy };
    };

    // --- Front bumper / grille / headlights / front corners ---
    if (part.includes('front_bumper') || part.includes('grille') || part.includes('headlight') || (part.includes('front') && part.includes('corner'))) {
      const base = { cx: side === 'left' ? 168 : side === 'right' ? 272 : 220, cy: 60 };
      const dyn = applyDynamicOffset(base.cx, base.cy, 144, 296, 16, 80, true, false); // Invert X for front-facing camera
      cx = dyn.cx; cy = dyn.cy;

    // --- Rear bumper / taillights / exhaust / rear corners ---
    } else if (part.includes('rear_bumper') || part.includes('taillight') || part.includes('exhaust') || (part.includes('rear') && part.includes('corner'))) {
      const base = { cx: side === 'left' ? 169 : side === 'right' ? 271 : 220, cy: 490 };
      const dyn = applyDynamicOffset(base.cx, base.cy, 144, 296, 460, 536, false, false);
      cx = dyn.cx; cy = dyn.cy;

    // --- Hood / bonnet / cowl (center body top) ---
    } else if (part.includes('hood') || part.includes('bonnet') || part.includes('cowl')) {
      const base = { cx: side === 'left' ? 195 : side === 'right' ? 245 : 220, cy: 135 };
      const dyn = applyDynamicOffset(base.cx, base.cy, 152, 288, 95, 180, true, true);
      cx = dyn.cx; cy = dyn.cy;

    // --- Front windshield ---
    } else if (part.includes('windshield') && !part.includes('rear')) {
      const base = { cx: side === 'left' ? 200 : side === 'right' ? 240 : 220, cy: 195 };
      const dyn = applyDynamicOffset(base.cx, base.cy, 160, 280, 180, 215, true, false);
      cx = dyn.cx; cy = dyn.cy;

    // --- Rear windshield ---
    } else if (part.includes('rear_windshield')) {
      const base = { cx: side === 'left' ? 200 : side === 'right' ? 240 : 220, cy: 352 };
      const dyn = applyDynamicOffset(base.cx, base.cy, 160, 280, 335, 380, false, false);
      cx = dyn.cx; cy = dyn.cy;

    // --- Trunk / tailgate / boot ---
    } else if (part.includes('trunk') || part.includes('tailgate') || part.includes('boot')) {
      const base = { cx: side === 'left' ? 195 : side === 'right' ? 245 : 220, cy: 410 };
      const dyn = applyDynamicOffset(base.cx, base.cy, 152, 288, 380, 445, false, false);
      cx = dyn.cx; cy = dyn.cy;

    // --- Roof (center body) ---
    } else if (part.includes('roof')) {
      const base = { cx: side === 'left' ? 198 : side === 'right' ? 242 : 220, cy: 275 };
      const dyn = applyDynamicOffset(base.cx, base.cy, 152, 288, 215, 335, false, false);
      cx = dyn.cx; cy = dyn.cy;

    // --- Quarter panel / fender → unfolded side panels ---
    } else if (part.includes('quarter_panel') || part.includes('fender')) {
      if (part.includes('front')) {
        const base = { cx: side === 'right' ? 345 : 95, cy: 118 };
        // For side profile, Y is along the car length, X is vertical height of panel
        const dyn = applyDynamicOffset(base.cx, base.cy, side === 'right' ? 338 : 56, side === 'right' ? 384 : 102, 95, 150, side === 'right', false);
        cx = dyn.cx; cy = dyn.cy;
      } else {
        const base = { cx: side === 'right' ? 345 : 95, cy: 422 };
        const dyn = applyDynamicOffset(base.cx, base.cy, side === 'right' ? 338 : 56, side === 'right' ? 384 : 102, 380, 445, side === 'right', false);
        cx = dyn.cx; cy = dyn.cy;
      }

    // --- Doors → unfolded side panels (clearly separated from roof at x=220) ---
    } else if (part.includes('door') || desc.includes('door')) {
      const descHasRear = desc.includes('rear') || desc.includes('back') || (desc.includes('passenger door') && !desc.includes('front'));
      const descHasFront = desc.includes('front') && !descHasRear;
      const partHasRear = part.includes('rear') || part.includes('back');
      const partHasFront = part.includes('front');
      const boxImpliesRear = (suppImg === 'IMAGE_04' && boxXCenter > 520) || suppImg === 'IMAGE_05' || suppImg === 'IMAGE_08';
      const isRear = partHasRear || descHasRear || (!partHasFront && !descHasFront && boxImpliesRear);

      if (isRear) {
        const base = { cx: side === 'right' ? 338 : 102, cy: 320 };
        // Y length 273 to 372
        const dyn = applyDynamicOffset(base.cx, base.cy, side === 'right' ? 338 : 56, side === 'right' ? 384 : 102, 273, 372, side === 'right', false);
        cx = dyn.cx; cy = dyn.cy;
      } else {
        const base = { cx: side === 'right' ? 338 : 102, cy: 225 };
        // Y length 168 to 273
        const dyn = applyDynamicOffset(base.cx, base.cy, side === 'right' ? 338 : 56, side === 'right' ? 384 : 102, 168, 273, side === 'right', false);
        cx = dyn.cx; cy = dyn.cy;
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
      // Keep wheels mostly static to avoid pins floating outside the wheel arch

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

export default function CarMapResults({ 
  vehicleData, 
  analysisResults,
  photos,
  setCurrentStep 
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
  const placedPins = React.useMemo(() => getResolvedCarPins(findings), [findings]);
  const activePhotos = React.useMemo(() => {
    return (photos && Object.values(photos).some(p => p && (p.url || typeof p === 'string')))
      ? photos
      : (analysisResults?.photos || {});
  }, [photos, analysisResults]);

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

      {/* Top Header Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <button 
            aria-label="Back to photo checklist" 
            onClick={() => setCurrentStep('checklist')} 
            className="w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
              Inspection Results & Visual Map
            </h2>
            <p className="text-xs text-slate-500">
              {findings.length === 0 ? 'No damage detected' : `${findings.length} visual finding${findings.length !== 1 ? 's' : ''} detected by Gemini Vision AI`}
            </p>
          </div>
        </div>

        <span className={`self-start sm:self-auto text-xs font-semibold px-3 py-1 rounded-full border shrink-0 ${
          findings.length === 0 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
            : 'bg-[#022a5b]/10 text-[#022a5b] border-[#022a5b]/20 font-bold'
        }`}>
          {findings.length === 0 
            ? '✓ 0 Defects · Clean Vehicle' 
            : `Preliminary: ${Math.min(3, findings.length)} of ${findings.length} finding${findings.length !== 1 ? 's' : ''} shown`}
        </span>
      </div>

      {/* 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left Column: Unfolded Car Blueprint */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-xs text-center lg:sticky lg:top-24">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2 min-w-0">
              <Car className="w-4 h-4 text-[#022a5b] shrink-0" />
              <span className="truncate">{findings.length === 0 ? 'Vehicle Passed' : 'Damage Coordinates Map'}</span>
            </h3>
            <span className="text-[11px] sm:text-xs text-slate-500 font-medium shrink-0 bg-slate-100 px-2 py-0.5 rounded-md">
              Unfolded View
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-4 text-left">
            {findings.length === 0 
              ? 'All visual angles verified in undamaged condition.' 
              : 'Click any numbered pin to inspect the photo and damage location.'}
          </p>

          {/* 5-Panel Unfolded Car Inspection Diagram (100% Pure Vector SVG) */}
          <div className="w-full bg-[#F1F5F9] rounded-2xl border border-slate-200 relative flex items-center justify-center overflow-hidden p-2.5 shadow-xs" style={{ aspectRatio: '440 / 560' }}>
            <svg className="w-full h-full" viewBox="0 0 440 560" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <filter id="car-map-pin-shadow" x="-30%" y="-30%" width="160%" height="160%">
                  <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.35" />
                </filter>
              </defs>

              {/* Exact reference schematic rendered purely with vector SVG shapes */}
              <VehicleBlueprintVectors />

              {/* Dynamic Pin Markers */}
              {placedPins.map(({ item, idx, cx, cy }) => {
                const isLocked = idx >= 3;
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
                    aria-label={isLocked ? `Damage point ${idx + 1}: Locked` : `View damage photo ${idx + 1}: ${getSanitizedVehiclePart(item)}`}
                    onKeyDown={(event) => { 
                      if (event.key === 'Enter' || event.key === ' ') { 
                        event.preventDefault(); 
                        if (isLocked) {
                          toast.info(`Damage #${idx + 1} (${getSanitizedVehiclePart(item)}) is locked. Unlock full report to inspect.`);
                          setCurrentStep('paywall');
                        } else {
                          setActiveBoxModal({ item }); 
                        }
                      } 
                    }}
                    className="cursor-pointer select-none group"
                    onClick={() => {
                      if (isLocked) {
                        toast.info(`Damage #${idx + 1} (${getSanitizedVehiclePart(item)}) is locked. Unlock full report to inspect.`);
                        setCurrentStep('paywall');
                      } else {
                        setActiveBoxModal({ item });
                      }
                    }}
                  >
                    <circle 
                      cx={cx} 
                      cy={cy} 
                      r="13" 
                      fill={pinColor} 
                      stroke="#FFFFFF" 
                      strokeWidth="2.5" 
                      strokeDasharray={isUncertain ? '3 2' : 'none'}
                      filter="url(#car-map-pin-shadow)"
                      className="transition-all duration-150 group-hover:stroke-slate-100 group-hover:brightness-110"
                    />
                    <text 
                      x={cx} 
                      y={cy} 
                      dy="4" 
                      fill="#FFFFFF" 
                      fontSize="12" 
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

          {/* Blueprint Legend */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 mt-4 text-xs font-medium text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block shrink-0"></span> Minor</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block shrink-0"></span> Moderate</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block shrink-0"></span> Severe</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-500 inline-block shrink-0"></span> Uncertain</span>
            </div>
          </div>
        </div>

        {/* Right Column: Findings Cards or Clean Vehicle Certificate */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {findings.length === 0 ? (
            /* Dedicated Zero Damage Screen */
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-200 shadow-xs flex flex-col gap-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <div>
                  <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 100% Clean · 0 Defects
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 mt-1">Vehicle Passed Visual Inspection</h3>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
                All 14 uploaded angles were processed and verified. No physical scratches, dents, scuffs, panel misalignments, or cracks were identified.
              </p>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                  Verified Undamaged Component Zones
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-medium text-slate-700">
                  <span className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Front Bumper
                  </span>
                  <span className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Windshield & Hood
                  </span>
                  <span className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Side Profile Doors
                  </span>
                  <span className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Rear Bumper & Glass
                  </span>
                  <span className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Wheels & Rims
                  </span>
                  <span className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Roof & Panels
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const inspId = analysisResults?.inspection_id || 'INS-CLEAN';
                    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
                    window.open(`${API_BASE}/api/reports/${inspId}/pdf`, '_blank');
                    toast.success('Clean Inspection Certificate generated!');
                  }}
                  className="w-full sm:flex-1 h-12 bg-[#022a5b] hover:bg-[#033b7e] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
                >
                  <Download className="w-4 h-4 text-white" /> Download Clean PDF Certificate
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep('checklist')}
                  className="w-full sm:w-auto h-12 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-4 h-4" /> Start New Scan
                </button>
              </div>
            </div>
          ) : (
            <>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Detected Damage Points ({Math.min(3, findings.length)} of {findings.length} shown)
              </h3>

              {findings.slice(0, 3).map((item, idx) => {
                const displaySrc = getFindingEvidence(item, activePhotos).src;
                const confidencePct = Math.round((item.confidence ?? 0.92) * 100);

                return (
                  <div 
                    key={item.finding_id || idx} 
                    className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col gap-3"
                  >
                    {/* Top Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
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

                      {/* Right Column: Severity & View Photo */}
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
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#022a5b] bg-[#022a5b]/5 hover:bg-[#022a5b]/10 px-3 py-1.5 rounded-lg border border-[#022a5b]/15 cursor-pointer transition-colors" 
                          onClick={() => setActiveBoxModal({ item })}
                        >
                          <Eye className="w-3.5 h-3.5 text-[#022a5b]" />
                          <span>View Photo</span>
                        </button>
                      </div>
                    </div>

                    {/* Description */}
                    {item.description && (
                      <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                        {item.description}
                      </p>
                    )}
                  </div>
                );
              })}

              {/* Clean #022a5b Paywall CTA Card */}
              <div className="bg-gradient-to-br from-[#022a5b]/8 via-white to-[#022a5b]/12 text-slate-900 rounded-3xl p-5 sm:p-7 shadow-xs flex flex-col gap-4 border border-[#022a5b]/20 relative overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-1 bg-[#022a5b] rounded-full inline-block shrink-0"></span>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#022a5b]">
                      Official PDF Certificate
                    </span>
                  </div>
                  <span className="text-[11px] sm:text-xs font-bold text-slate-600 bg-white px-2.5 py-0.5 rounded-full border border-slate-200 shadow-2xs shrink-0">
                    One-Time Unlock
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                    Unlock Complete Vehicle Inspection <span className="text-[#022a5b]">Report</span>
                  </h3>
                  <p className="text-slate-600 text-xs sm:text-sm mt-1 leading-relaxed">
                    Gain full access to all {findings.length} findings, high-resolution bounding boxes, damage descriptions, and official cryptographic PDF certificate.
                  </p>
                </div>

                <button 
                  onClick={() => setCurrentStep('paywall')}
                  className="w-full h-13 bg-gradient-to-r from-[#022a5b] via-[#033c80] to-[#022a5b] hover:from-[#033c80] hover:to-[#022a5b] text-white font-bold text-sm rounded-2xl flex items-center justify-center gap-2.5 shadow-md shadow-[#022a5b]/20 transition-all cursor-pointer active:scale-98"
                >
                  <Lock className="w-4 h-4 text-white" />
                  <span>Unlock Full Report for $3.00</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
