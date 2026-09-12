'use client';

import React from 'react';

export default function Header({ setCurrentStep }) {
  return (
    <header className="w-full bg-white border-b border-slate-200 px-4 md:px-8 h-16 flex items-center justify-between sticky top-0 z-40 shadow-xs">
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentStep('checklist')}>
        <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-lg shadow-sm">
          C
        </div>
        <span className="font-extrabold text-slate-900 text-lg sm:text-xl tracking-tight">CarsInsure AI</span>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-[10px] sm:text-xs font-bold text-slate-700 bg-slate-100 px-2.5 sm:px-3.5 py-1.5 rounded-xl border border-slate-200">
          <span className="hidden xs:inline">Zero-Friction </span>AI Inspection
        </span>
      </div>
    </header>
  );
}
