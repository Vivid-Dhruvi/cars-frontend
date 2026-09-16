'use client';

import { useEffect, useId, useRef } from 'react';
import { X, Crosshair, ShieldAlert } from 'lucide-react';
import { getFindingEvidence } from './findingEvidence.mjs';

export default function DamagePhotoDialog({ item, photos, title, onClose }) {
  const dialogRef = useRef(null);
  const titleId = useId();
  const { src, box, imageId } = getFindingEvidence(item, photos);

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <dialog 
      ref={dialogRef} 
      aria-labelledby={titleId} 
      onClose={(event) => { if (!event.currentTarget.open) onClose(); }}
      className="damage-dialog m-auto w-[calc(100%-2rem)] max-w-2xl max-h-[calc(100dvh-2rem)] rounded-3xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl overflow-hidden"
    >
      <div className="flex max-h-[calc(100dvh-2rem)] flex-col bg-white">
        {/* Clean Light Header */}
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-100 p-4 sm:px-6 bg-white">
          <div className="min-w-0">
            <h3 id={titleId} className="text-base sm:text-lg font-bold capitalize text-slate-900 truncate">
              {title} Evidence Photo
            </h3>
            <p className="text-xs text-slate-500 capitalize truncate flex items-center gap-1.5 mt-0.5">
              <span>{item.damage_type?.replace(/_/g, ' ')}</span>
              {imageId && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="font-mono text-slate-600">{imageId}</span>
                </>
              )}
            </p>
          </div>

          <button 
            type="button" 
            autoFocus 
            aria-label="Close damage photo" 
            onClick={onClose}
            className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 hover:text-slate-900 transition-colors cursor-pointer active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        {/* Clean Light Photo Stage */}
        <div className="min-h-0 overflow-y-auto p-4 sm:p-6 flex flex-col gap-3 bg-white">
          {src ? (
            <div className="flex justify-center rounded-2xl bg-slate-100 p-2 sm:p-3 border border-slate-200">
              <div className="relative max-w-full self-start rounded-xl overflow-hidden shadow-xs">
                <img 
                  src={src} 
                  alt={`${title}: supporting vehicle photo`} 
                  className="block h-auto max-h-[55dvh] w-auto max-w-full object-contain" 
                />

                {/* Precision Bounding Box Overlay */}
                {box && (
                  <svg 
                    aria-label="Detected damage boundary" 
                    className="pointer-events-none absolute inset-0 h-full w-full" 
                    viewBox="0 0 1000 1000" 
                    preserveAspectRatio="none"
                  >
                    <rect 
                      x={box[1]} 
                      y={box[0]} 
                      width={box[3] - box[1]} 
                      height={box[2] - box[0]}
                      fill="rgba(239, 68, 68, 0.2)" 
                      stroke="#DC2626" 
                      strokeWidth="3" 
                      vectorEffect="non-scaling-stroke" 
                    />
                  </svg>
                )}
              </div>
            </div>
          ) : (
            <p className="py-12 text-center text-xs text-slate-500">
              The supporting vehicle photo is currently unavailable.
            </p>
          )}

          {/* Clean Light Metadata Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-600 font-medium flex items-center gap-1.5">
              <Crosshair className="w-4 h-4 text-slate-400" />
              <span>
                {box 
                  ? `Coordinates: [${box.join(', ')}]` 
                  : 'Full angle visual coverage'}
              </span>
            </span>

            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              item.severity === 'Severe' 
                ? 'bg-red-100 text-red-800 border border-red-200' 
                : item.severity === 'Moderate' 
                ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                : (item.severity || '').toLowerCase() === 'uncertain'
                ? 'bg-slate-100 text-slate-800 border border-slate-300'
                : 'bg-amber-100 text-amber-800 border border-amber-200'
            }`}>
              {(item.severity || 'Minor')} Severity
            </span>
          </div>
        </div>

        {/* Clean Light Footer */}
        <footer className="shrink-0 border-t border-slate-100 p-4 sm:px-6 bg-white">
          <button 
            type="button" 
            onClick={onClose} 
            className="min-h-11 w-full rounded-xl bg-[#022a5b] hover:bg-[#033b7e] px-4 py-2.5 text-xs font-bold text-white cursor-pointer transition-colors active:scale-98 shadow-xs"
          >
            Close Photo View
          </button>
        </footer>
      </div>
    </dialog>
  );
}
