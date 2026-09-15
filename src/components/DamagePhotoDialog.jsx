'use client';

import { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';
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
    <dialog ref={dialogRef} aria-labelledby={titleId} onClose={(event) => { if (!event.currentTarget.open) onClose(); }}
      className="damage-dialog m-auto w-[calc(100%-1.5rem)] max-w-2xl max-h-[calc(100dvh-1.5rem)] rounded-3xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl">
      <div className="flex max-h-[calc(100dvh-1.5rem)] flex-col">
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-100 p-4 sm:px-6">
          <div className="min-w-0">
            <h3 id={titleId} className="text-base font-extrabold capitalize wrap-anywhere">{title} Damage Photo</h3>
            <p className="mt-1 text-xs text-slate-600 capitalize wrap-anywhere">
              {item.damage_type?.replace(/_/g, ' ')}{imageId ? ` · ${imageId}` : ''}
            </p>
          </div>
          <button type="button" autoFocus aria-label="Close damage photo" onClick={onClose}
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </header>
        <div className="min-h-0 overflow-y-auto p-4 sm:px-6">
          {src ? (
            <div className="flex justify-center rounded-xl bg-slate-950 p-2">
              <div className="relative max-w-full self-start">
                <img src={src} alt={`${title}: supporting vehicle photo`} className="block h-auto max-h-[55dvh] w-auto max-w-full" />
                {box && <svg aria-label="Detected damage boundary" className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 1000 1000" preserveAspectRatio="none">
                  <rect x={box[1]} y={box[0]} width={box[3] - box[1]} height={box[2] - box[0]}
                    fill="rgba(239,68,68,0.18)" stroke="#ef4444" strokeWidth="3" vectorEffect="non-scaling-stroke" />
                </svg>}
              </div>
            </div>
          ) : <p className="py-6 text-sm text-slate-600">The supporting photo is unavailable.</p>}
          <p className="mt-3 text-sm text-slate-600 wrap-anywhere">
            {box ? `${item.severity || 'Uncertain'} damage · Box: [${box.join(', ')}]` : 'No verified bounding box is available for this photo.'}
          </p>
        </div>
        <footer className="shrink-0 border-t border-slate-100 p-4 sm:px-6">
          <button type="button" onClick={onClose} className="min-h-11 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white hover:bg-slate-800">Close Overlay</button>
        </footer>
      </div>
    </dialog>
  );
}
