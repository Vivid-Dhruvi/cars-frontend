'use client';
import React, { useState, useEffect } from 'react';
import { Camera, Image as ImageIcon, Check, AlertCircle, Loader2, ChevronRight, ShieldCheck } from 'lucide-react';

/**
 * Detects whether the current device has at least one camera (videoinput).
 * Returns false on desktop browsers with no camera hardware.
 */
function useHasCamera() {
  const [hasCamera, setHasCamera] = useState(false);

  useEffect(() => {
    if (!navigator?.mediaDevices?.enumerateDevices) return;
    navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => {
        setHasCamera(devices.some((d) => d.kind === 'videoinput'));
      })
      .catch(() => setHasCamera(false));
  }, []);

  return hasCamera;
}

const getExampleImage = (id) => {
  return `/examples/IMAGE_${id}.png`;
};

const ANGLES = [
  { id: '01', code: 'IMAGE_01', title: 'Direct Front Face',  subtitle: 'Bumper, grille & headlights',    guide: 'Straight-on view' },
  { id: '02', code: 'IMAGE_02', title: 'Windshield & Hood',  subtitle: 'Cowl facing front glass',         guide: 'Avoid sky reflections' },
  { id: '03', code: 'IMAGE_03', title: 'Front-Left Corner',  subtitle: 'Driver 45° diagonal',             guide: 'Stand 3–4 ft back' },
  { id: '04', code: 'IMAGE_04', title: 'Left Profile Side',  subtitle: 'Driver doors & rocker panel',     guide: 'Flat straight-on' },
  { id: '05', code: 'IMAGE_05', title: 'Rear-Left Corner',   subtitle: 'Rear 45° diagonal',               guide: 'Stand 3–4 ft back' },
  { id: '06', code: 'IMAGE_06', title: 'Direct Rear Face',   subtitle: 'Full trunk & rear bumper',        guide: 'Straight-on view' },
  { id: '07', code: 'IMAGE_07', title: 'Rear Windshield',    subtitle: 'Dedicated rear window',           guide: 'Avoid glare lines' },
  { id: '08', code: 'IMAGE_08', title: 'Rear-Right Corner',  subtitle: 'Passenger 45° diagonal',          guide: 'Stand 3–4 ft back' },
  { id: '09', code: 'IMAGE_09', title: 'Right Profile Side', subtitle: 'Passenger doors & rocker',        guide: 'Flat straight-on' },
  { id: '10', code: 'IMAGE_10', title: 'Front-Right Corner', subtitle: 'Bumper corner 45°',              guide: 'Stand 3–4 ft back' },
  { id: '11', code: 'IMAGE_11', title: 'Front-Left Wheel',   subtitle: 'Rim & hubcap close-up',           guide: 'Parallel to wheel', isWheel: true },
  { id: '12', code: 'IMAGE_12', title: 'Rear-Left Wheel',    subtitle: 'Rim & hubcap close-up',           guide: 'Parallel to wheel', isWheel: true },
  { id: '13', code: 'IMAGE_13', title: 'Rear-Right Wheel',   subtitle: 'Rim & hubcap close-up',           guide: 'Parallel to wheel', isWheel: true },
  { id: '14', code: 'IMAGE_14', title: 'Front-Right Wheel',  subtitle: 'Rim & hubcap close-up',           guide: 'Parallel to wheel', isWheel: true },
];

export default function PhotoChecklist({
  vehicleData,
  setVehicleData,
  photos,
  capturedCount,
  handleFileUpload,
  handleAnalyzePhotos,
  isUploading,
}) {
  const hasCamera = useHasCamera();
  const [flippedCard, setFlippedCard] = useState(null);
  const progress = Math.round((capturedCount / 14) * 100);

  return (
    <>
      <div className="flex flex-col gap-5">
      {/* ── Rich Visible #022a5b Midnight Navy Hero Guidance Banner ── */}
      <div className="gradient-navy-hero rounded-3xl p-6 sm:p-8 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden isolate">
        {/* Glow ambient highlight */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none translate-x-1/4 -translate-y-1/4" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-300/15 rounded-full blur-2xl pointer-events-none -translate-x-1/4 translate-y-1/4" />
        
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-blue-100 text-xs font-bold border border-white/20 backdrop-blur-md">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-200" />
            <span>Standardized 14-Angle Protocol</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
            Vehicle Photo Checklist
          </h1>
          <p className="text-blue-100/90 text-xs sm:text-sm max-w-xl leading-relaxed">
            Capture or upload clear photos for each designated angle. Our AI computer vision model inspects panels, bumpers, glass, and wheels.
          </p>
        </div>

        {/* Metric Overview Card */}
        <div className="flex items-center gap-4 shrink-0 bg-white/15 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-white/20 relative z-10">
          <div className="text-left px-2">
            <span className="text-2xl font-black text-white">{capturedCount}</span>
            <span className="text-blue-200 text-xs font-bold"> / 14</span>
            <span className="block text-[10px] text-blue-200 uppercase tracking-wider font-semibold">Completed</span>
          </div>
          <div className="w-px h-8 bg-white/20" />
          <div className="text-left px-2">
            <span className="text-2xl font-black text-white">{progress}%</span>
            <span className="block text-[10px] text-blue-200 uppercase tracking-wider font-semibold">Coverage</span>
          </div>
        </div>
      </div>

      {/* ── Photo Grid Card ── */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-xs flex flex-col gap-5">
        {/* Progress summary row */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-1">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Angle Captures ({capturedCount} of 14 Completed)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {hasCamera
                ? 'Use camera for instant photo capture or select photos from your device gallery.'
                : 'Select photos from your device for each specified angle.'}
            </p>
          </div>

          <div className="flex items-center gap-3 bg-[#022a5b]/5 px-3.5 py-1.5 rounded-xl border border-[#022a5b]/15 shrink-0">
            <div className="w-24 h-2 rounded-full bg-slate-200 overflow-hidden">
              <div 
                className="h-full rounded-full bg-[#022a5b] transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[11px] font-extrabold text-[#022a5b]">{progress}%</span>
          </div>
        </div>

        {/* Remaining notice banner */}
        {capturedCount < 14 && (
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-amber-50 border border-amber-200/90 rounded-xl text-amber-900 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>
              <strong>{14 - capturedCount} angle{14 - capturedCount !== 1 ? 's' : ''} remaining</strong> for complete 360° AI damage detection.
            </span>
          </div>
        )}

        {/* 14-tile grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {ANGLES.map((item) => {
            const img = photos[item.id];
            const captured = Boolean(img);
            return (
              <div
                key={item.id}
                className={`rounded-2xl overflow-hidden border flex flex-col min-h-64 relative transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${
                  captured
                    ? 'border-[#022a5b]/40 bg-white shadow-xs ring-1 ring-[#022a5b]/10 hover:shadow-lg'
                    : item.isWheel
                    ? 'border-indigo-100 bg-indigo-50/20 hover:border-[#022a5b]/40 hover:bg-white hover:shadow-md'
                    : 'border-slate-200 bg-slate-50/70 hover:border-[#022a5b]/40 hover:bg-white hover:shadow-md'
                }`}
              >
                {/* Hidden file inputs */}
                <input
                  id={`cam-input-${item.id}`}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="sr-only"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(item.id, e.target.files[0])}
                />
                <input
                  id={`gal-input-${item.id}`}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(item.id, e.target.files[0])}
                />

                {/* Card header */}
                <div className="p-3 flex items-center justify-between z-10 bg-white border-b border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-6 h-6 rounded-lg text-xs font-extrabold flex items-center justify-center transition-colors ${
                      captured 
                        ? 'bg-[#022a5b] text-white shadow-2xs' 
                        : 'bg-[#022a5b]/10 text-[#022a5b] border border-[#022a5b]/20'
                    }`}>
                      {item.id}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200 font-mono">
                      {item.code}
                    </span>
                  </div>

                  {captured && (
                    <span className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shadow-xs">
                      <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                    </span>
                  )}
                </div>

                {/* Photo preview or guide box */}
                {captured ? (
                  <div className="relative flex-1 min-h-36 bg-slate-100 overflow-hidden">
                    <img
                      src={typeof img === 'object' ? img.url : img}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="relative flex flex-col bg-white overflow-hidden group">
                    {/* Top: Wireframe Sketch Outline using CSS */}
                    <div className="relative h-40 w-full overflow-hidden bg-slate-50 border-b border-slate-100 flex items-center justify-center">
                      <img 
                        src={getExampleImage(item.id)} 
                        alt={`Example ${item.title}`} 
                        className="w-full h-full object-contain scale-[1.15] sm:scale-100 sm:object-cover mix-blend-multiply opacity-25 grayscale contrast-150 brightness-110 group-hover:opacity-40 transition-opacity duration-300" 
                      />
                      {/* Subdued Outline Badge */}
                      <div className="absolute top-2 left-2 bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-500 px-2 py-1 rounded text-[8px] font-bold uppercase tracking-wider">
                        Expected Angle
                      </div>
                    </div>
                    
                    {/* Bottom: Text Content */}
                    <div className="p-3.5 flex flex-col items-center text-center gap-1">
                      <span className="text-xs font-bold text-slate-800">{item.title}</span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {item.guide}
                      </span>
                    </div>
                  </div>
                )}

                {/* Actions (Always at bottom) */}
                <div className="p-2.5 z-10 bg-slate-50 border-t border-slate-100 flex flex-col gap-1.5 mt-auto">
                  <div className={`grid gap-1.5 ${hasCamera ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {hasCamera && (
                      <label
                        htmlFor={`cam-input-${item.id}`}
                        className="min-h-9 py-1.5 px-2 bg-[#022a5b] hover:bg-[#033b7e] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors active:scale-95 shadow-xs"
                      >
                        <Camera className="w-3.5 h-3.5 text-white" />
                        <span>Camera</span>
                      </label>
                    )}
                    <label
                      htmlFor={`gal-input-${item.id}`}
                      className="min-h-9 py-1.5 px-2 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors active:scale-95 border border-slate-200 shadow-sm"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                      <span>{hasCamera ? 'Gallery' : 'Upload'}</span>
                    </label>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="mt-2 pt-4 border-t border-slate-100">
          <button
            onClick={handleAnalyzePhotos}
            disabled={isUploading || capturedCount === 0}
            className={`w-full min-h-13 px-6 py-3 font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 transition-all shadow-md ${
              isUploading 
                ? 'bg-[#022a5b] text-white cursor-wait opacity-90' 
                : capturedCount === 0 
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                  : 'bg-gradient-to-r from-[#022a5b] via-[#033c80] to-[#022a5b] hover:from-[#033c80] hover:to-[#022a5b] text-white cursor-pointer active:scale-98 shadow-[#022a5b]/20'
            }`}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Processing Vehicle Inspection…</span>
              </>
            ) : (
              <>
                <span>Run AI Damage Inspection ({capturedCount}/14 Photos Captured)</span>
                <ChevronRight className="w-4 h-4 text-white" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
    </>
  );
}
