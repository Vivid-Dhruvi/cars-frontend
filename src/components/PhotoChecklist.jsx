'use client';
import React, { useState, useEffect } from 'react';
import { Camera, Image, Check, AlertTriangle, Loader2, Sparkles, ChevronRight } from 'lucide-react';

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

const ANGLES = [
  { id: '01', code: 'IMAGE_01', title: 'Direct Front Face',  subtitle: 'Bumper, grille & headlights',    guide: 'Straight-on view' },
  { id: '02', code: 'IMAGE_02', title: 'Windshield & Hood',  subtitle: 'Cowl facing front glass',         guide: 'Avoid sky reflections' },
  { id: '03', code: 'IMAGE_03', title: 'Front-Left Corner',  subtitle: 'Driver 45° diagonal 3/4',         guide: 'Stand 3–4 ft back' },
  { id: '04', code: 'IMAGE_04', title: 'Left Profile Side',  subtitle: 'Driver doors & rocker panel',     guide: 'Flat straight-on' },
  { id: '05', code: 'IMAGE_05', title: 'Rear-Left Corner',   subtitle: 'Rear 45° diagonal 3/4',           guide: 'Stand 3–4 ft back' },
  { id: '06', code: 'IMAGE_06', title: 'Direct Rear Face',   subtitle: 'Full trunk & rear bumper',        guide: 'Straight-on view' },
  { id: '07', code: 'IMAGE_07', title: 'Rear Windshield',    subtitle: 'Dedicated rear window',           guide: 'Avoid glare lines' },
  { id: '08', code: 'IMAGE_08', title: 'Rear-Right Corner',  subtitle: 'Passenger 45° diagonal',          guide: 'Stand 3–4 ft back' },
  { id: '09', code: 'IMAGE_09', title: 'Right Profile Side', subtitle: 'Passenger doors & rocker',        guide: 'Flat straight-on' },
  { id: '10', code: 'IMAGE_10', title: 'Front-Right Corner', subtitle: 'Bumper corner 45° 3/4',           guide: 'Stand 3–4 ft back' },
  { id: '11', code: 'IMAGE_11', title: 'Front-Left Wheel',   subtitle: 'Rim & hubcap close-up',           guide: 'Crouch parallel to hub', isWheel: true },
  { id: '12', code: 'IMAGE_12', title: 'Rear-Left Wheel',    subtitle: 'Rim & hubcap close-up',           guide: 'Crouch parallel to hub', isWheel: true },
  { id: '13', code: 'IMAGE_13', title: 'Rear-Right Wheel',   subtitle: 'Rim & hubcap close-up',           guide: 'Crouch parallel to hub', isWheel: true },
  { id: '14', code: 'IMAGE_14', title: 'Front-Right Wheel',  subtitle: 'Rim & hubcap close-up',           guide: 'Crouch parallel to hub', isWheel: true },
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
  const progress = Math.round((capturedCount / 14) * 100);

  return (
    <div className="flex flex-col gap-5">
      {/* ── Header Guidance Banner ── */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-semibold mb-3 border border-sky-400/30">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              Standardized 14-Angle Protocol
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight">Capture Vehicle Photos</h2>
            <p className="text-slate-400 text-xs mt-1 max-w-md">
              Take 14 clear, well-lit photos from each angle. Wipe your lens and avoid harsh shadows for best AI accuracy.
            </p>
          </div>
        </div>
      </div>

      {/* ── Photo Grid Card ── */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col gap-4">
        {/* progress row */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900">{capturedCount} / 14 photos captured</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {hasCamera
                ? 'Tap a card to use your camera or upload from gallery.'
                : 'Select a card and upload a photo from your device.'}
            </p>
          </div>
          {/* animated progress pill */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-24 h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs font-bold text-slate-600">{progress}%</span>
          </div>
        </div>

        {/* warning banner */}
        {capturedCount < 14 && (
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-xs font-medium">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
            <span>
              {14 - capturedCount} angle{14 - capturedCount !== 1 ? 's' : ''} remaining — complete all 14 for full 360° AI detection.
            </span>
          </div>
        )}

        {/* 14-tile grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-1">
          {ANGLES.map((item) => {
            const img = photos[item.id];
            const captured = Boolean(img);
            return (
              <div
                key={item.id}
                className={`rounded-2xl overflow-hidden border flex flex-col min-h-64 relative group transition-all duration-200 shadow-sm ${
                  captured
                    ? 'border-slate-700 bg-slate-900'
                    : item.isWheel
                    ? 'border-indigo-200 bg-indigo-50/40 hover:border-indigo-400'
                    : 'border-slate-200 bg-slate-50 hover:border-sky-300'
                }`}
              >
                {/* hidden file inputs */}
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

                {/* tile header */}
                <div className="p-2.5 flex items-center justify-between z-10">
                  <div className="flex items-center gap-1.5">
                    <span className="w-6 h-6 rounded-full bg-slate-900/80 text-white text-xs font-bold flex items-center justify-center backdrop-blur-sm">
                      {item.id}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/80 text-slate-600 border border-slate-200 backdrop-blur-sm shadow-sm">
                      {item.code}
                    </span>
                  </div>
                  {captured && (
                    <span className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-sm">
                      <Check className="w-3.5 h-3.5 text-white" />
                    </span>
                  )}
                </div>

                {/* image / placeholder */}
                {captured ? (
                  <div className="absolute inset-0 z-0">
                    <img
                      src={typeof img === 'object' ? img.url : img}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center px-3 gap-1.5 pb-1">
                    <span className="text-sm font-bold text-slate-700">{item.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${
                      item.isWheel ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-500'
                    }`}>
                      {item.guide}
                    </span>
                  </div>
                )}

                {/* action bar
                    Camera button: only rendered when the device actually has a camera.
                    On desktop (no videoinput), the gallery button expands to full width. */}
                <div className="p-2 z-10 bg-white/95 backdrop-blur-sm border-t border-slate-200/80 flex flex-col gap-1.5 mt-auto">
                  <p className="text-xs font-bold text-slate-800 truncate px-0.5">{item.title}</p>
                  <div className={`grid gap-1.5 ${hasCamera ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {hasCamera && (
                      <label
                        htmlFor={`cam-input-${item.id}`}
                        className="min-h-10 py-2 px-2 bg-slate-900 hover:bg-slate-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
                      >
                        <Camera className="w-3.5 h-3.5 text-sky-400" />
                        Camera
                      </label>
                    )}
                    <label
                      htmlFor={`gal-input-${item.id}`}
                      className="min-h-10 py-2 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 border border-slate-200"
                    >
                      <Image className="w-3.5 h-3.5 text-slate-500" />
                      {hasCamera ? 'Gallery' : 'Upload Photo'}
                    </label>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* footer actions */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-3">
          <button
            onClick={handleAnalyzePhotos}
            disabled={isUploading || capturedCount === 0}
            className={`w-full min-h-12 px-6 py-3 font-bold text-sm rounded-2xl flex items-center justify-center gap-2.5 transition-all shadow-md ${
              isUploading 
                ? 'bg-slate-900 text-white cursor-wait opacity-95' 
                : capturedCount === 0 
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                  : 'bg-slate-900 hover:bg-slate-800 text-white cursor-pointer active:scale-98'
            }`}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-sky-400" />
                <span className="font-bold text-white tracking-wide">Uploading & Processing Photos…</span>
              </>
            ) : (
              <>
                <span>Analyse Vehicle ({capturedCount}/14 photos captured)</span>
                <ChevronRight className="w-4 h-4 text-sky-400" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
