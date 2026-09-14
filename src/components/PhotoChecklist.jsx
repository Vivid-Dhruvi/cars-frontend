import React from 'react';
import { Camera, Check, AlertTriangle, Sparkles, ArrowRight } from 'lucide-react';
import { DAMAGED_CAR_PHOTO } from './demoPhotoData';

export default function PhotoChecklist({ 
  vehicleData,
  setVehicleData,
  photos, 
  capturedCount, 
  handleFileUpload, 
  handleAnalyzePhotos, 
  setPhotos, 
  isUploading 
}) {
  return (
    <div className="flex flex-col gap-5">
      {/* Header Guidance Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-semibold mb-2 border border-sky-400/30">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" /> Standardized 14-Angle Protocol
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight">Capture Vehicle Photos</h2>
            <p className="text-slate-300 text-xs mt-1 max-w-xl">
              Take 14 clear, well-lit photos. Wipe your camera lens and avoid harsh tree shadows for maximum AI accuracy.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                const DEMO_CAR_PHOTOS = {
                  '01': DAMAGED_CAR_PHOTO,
                  '02': DAMAGED_CAR_PHOTO,
                  '03': DAMAGED_CAR_PHOTO,
                  '04': DAMAGED_CAR_PHOTO,
                  '05': DAMAGED_CAR_PHOTO,
                  '06': DAMAGED_CAR_PHOTO,
                  '07': DAMAGED_CAR_PHOTO,
                  '08': DAMAGED_CAR_PHOTO,
                  '09': DAMAGED_CAR_PHOTO,
                  '10': DAMAGED_CAR_PHOTO,
                  '11': DAMAGED_CAR_PHOTO,
                  '12': DAMAGED_CAR_PHOTO,
                  '13': DAMAGED_CAR_PHOTO,
                  '14': DAMAGED_CAR_PHOTO
                };
                setPhotos(DEMO_CAR_PHOTOS);
              }}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/20 backdrop-blur-xs transition-all cursor-pointer"
            >
              ⚡ Fill Demo Photos
            </button>
          </div>
        </div>
      </div>



      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900">{capturedCount} of 14 photos captured</h3>
            <p className="text-xs text-slate-500 mt-0.5">Tap any card to capture or retake via live camera.</p>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
              Progress: {Math.round((capturedCount / 14) * 100)}%
            </span>
          </div>
        </div>

        {/* Warning Alert Banner */}
        {capturedCount < 14 && (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 text-amber-900 text-xs font-medium">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>{14 - capturedCount} photos remaining. Complete all 14 angles for 360° AI damage detection.</span>
          </div>
        )}

        {/* 14 Photo Tile Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-2">
          {[
            { id: '01', code: 'IMAGE_01', title: 'Direct Front Face', subtitle: 'Bumper, grille & headlights', guide: 'Straight-on view', img: photos['01'] },
            { id: '02', code: 'IMAGE_02', title: 'Windshield & Hood', subtitle: 'Cowl facing front glass', guide: 'Avoid sky reflections', img: photos['02'] },
            { id: '03', code: 'IMAGE_03', title: 'Front-Left Corner', subtitle: 'Driver 45° diagonal 3/4', guide: 'Stand 3-4 ft back', img: photos['03'] },
            { id: '04', code: 'IMAGE_04', title: 'Left Profile Side', subtitle: 'Driver doors & rocker panel', guide: 'Flat straight-on', img: photos['04'] },
            { id: '05', code: 'IMAGE_05', title: 'Rear-Left Corner', subtitle: 'Rear 45° diagonal 3/4', guide: 'Stand 3-4 ft back', img: photos['05'] },
            { id: '06', code: 'IMAGE_06', title: 'Direct Rear Face', subtitle: 'Full trunk & rear bumper', guide: 'Straight-on view', img: photos['06'] },
            { id: '07', code: 'IMAGE_07', title: 'Rear Windshield', subtitle: 'Dedicated rear window', guide: 'Avoid glare lines', img: photos['07'] },
            { id: '08', code: 'IMAGE_08', title: 'Rear-Right Corner', subtitle: 'Passenger 45° diagonal', guide: 'Stand 3-4 ft back', img: photos['08'] },
            { id: '09', code: 'IMAGE_09', title: 'Right Profile Side', subtitle: 'Passenger doors & rocker', guide: 'Flat straight-on', img: photos['09'] },
            { id: '10', code: 'IMAGE_10', title: 'Front-Right Corner', subtitle: 'Bumper corner 45° 3/4', guide: 'Stand 3-4 ft back', img: photos['10'] },
            { id: '11', code: 'IMAGE_11', title: 'Front-Left Wheel', subtitle: 'Rim & hubcap close-up', guide: '📸 Crouch parallel to hub', img: photos['11'], isWheel: true },
            { id: '12', code: 'IMAGE_12', title: 'Rear-Left Wheel', subtitle: 'Rim & hubcap close-up', guide: '📸 Crouch parallel to hub', img: photos['12'], isWheel: true },
            { id: '13', code: 'IMAGE_13', title: 'Rear-Right Wheel', subtitle: 'Rim & hubcap close-up', guide: '📸 Crouch parallel to hub', img: photos['13'], isWheel: true },
            { id: '14', code: 'IMAGE_14', title: 'Front-Right Wheel', subtitle: 'Rim & hubcap close-up', guide: '📸 Crouch parallel to hub', img: photos['14'], isWheel: true },
          ].map((item) => (
            <div 
              key={item.id}
              className={`border rounded-3xl overflow-hidden flex flex-col justify-between h-64 relative group transition-all shadow-xs ${
                item.img 
                  ? 'bg-slate-900 border-slate-800' 
                  : item.isWheel 
                    ? 'bg-indigo-50/50 border-indigo-200 hover:border-indigo-400' 
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Camera Input (forces live camera) */}
              <input 
                id={`cam-input-${item.id}`}
                type="file" 
                accept="image/*" 
                capture="environment"
                className="hidden" 
                onChange={(e) => e.target.files?.[0] && handleFileUpload(item.id, e.target.files[0])} 
              />

              {/* Gallery Input (forces gallery / file picker) */}
              <input 
                id={`gal-input-${item.id}`}
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={(e) => e.target.files?.[0] && handleFileUpload(item.id, e.target.files[0])} 
              />

              {/* Top Tile Header */}
              <div className="p-3 flex items-center justify-between z-10">
                <div className="flex items-center gap-1.5">
                  <span className="w-7 h-7 rounded-full bg-slate-900/80 text-white font-extrabold text-xs flex items-center justify-center backdrop-blur-xs">
                    {item.id}
                  </span>
                  <span className="text-[10px] font-bold text-slate-700 bg-white/80 px-2 py-0.5 rounded-full border border-slate-200 shadow-2xs backdrop-blur-xs">
                    {item.code}
                  </span>
                </div>

                {item.img && (
                  <span className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                    <Check className="w-4 h-4" />
                  </span>
                )}
              </div>

              {/* Thumbnail Image or Empty State */}
              {item.img ? (
                <div className="absolute inset-0 z-0">
                  <img src={typeof item.img === 'object' ? item.img.url : item.img} alt={item.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent"></div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-1 px-3 text-center my-auto">
                  <span className="text-xs font-bold text-slate-700">{item.title}</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                    item.isWheel ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-200/70 text-slate-600'
                  }`}>
                    {item.guide}
                  </span>
                </div>
              )}

              {/* Bottom Action Bar: Explicit Camera & Gallery Buttons */}
              <div className="p-2.5 z-10 bg-white/95 backdrop-blur-xs border-t border-slate-200/80 flex flex-col gap-1.5">
                <div className="font-bold text-xs text-slate-900 truncate">
                  {item.title}
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <label 
                    htmlFor={`cam-input-${item.id}`}
                    className="py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95 shadow-2xs"
                  >
                    <Camera className="w-3.5 h-3.5 text-sky-400" /> Camera
                  </label>
                  <label 
                    htmlFor={`gal-input-${item.id}`}
                    className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95 border border-slate-200"
                  >
                    🖼️ Gallery
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 pt-4 border-t border-slate-100 flex gap-3">
          <button 
            onClick={() => {
              const DEMO_CAR_PHOTOS = {
                '01': DAMAGED_CAR_PHOTO,
                '02': DAMAGED_CAR_PHOTO,
                '03': DAMAGED_CAR_PHOTO,
                '04': DAMAGED_CAR_PHOTO,
                '05': DAMAGED_CAR_PHOTO,
                '06': DAMAGED_CAR_PHOTO,
                '07': DAMAGED_CAR_PHOTO,
                '08': DAMAGED_CAR_PHOTO,
                '09': DAMAGED_CAR_PHOTO,
                '10': DAMAGED_CAR_PHOTO,
                '11': DAMAGED_CAR_PHOTO,
                '12': DAMAGED_CAR_PHOTO,
                '13': DAMAGED_CAR_PHOTO,
                '14': DAMAGED_CAR_PHOTO
              };
              setPhotos(DEMO_CAR_PHOTOS);
            }}
            className="w-1/2 h-12 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-2xl cursor-pointer"
          >
            Demo Fill All 14 Photos
          </button>

          <button 
            onClick={handleAnalyzePhotos}
            disabled={isUploading}
            className="w-1/2 h-12 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:bg-slate-400"
          >
            {isUploading ? (
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 animate-spin text-sky-400" /> Uploading & Processing...
              </span>
            ) : (
              <>Analyse Vehicle <Sparkles className="w-4 h-4 text-sky-400" /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
