'use client';

import React from 'react';
import { ShieldCheck, FileText } from 'lucide-react';

export default function Header({ setCurrentStep, currentStep }) {
  const handleLogoClick = () => {
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
    setCurrentStep('checklist');
  };

  return (
    <header className="fixed top-0 left-0 right-0 w-full bg-white border-b border-slate-200/90 px-3 sm:px-8 h-14 sm:h-16 flex items-center justify-between z-50 shadow-xs">
      {/* Brand Logo Lockup: Official Vector Logo (with native matching AI font) + Automotive AI Visual Inspection */}
      <button 
        type="button" 
        aria-label="CarInsuRent AI Home" 
        className="flex flex-col items-start cursor-pointer text-left focus:outline-none shrink-0" 
        onClick={handleLogoClick}
      >
        <img 
          src="/logo-ai.svg?v=5" 
          alt="CarInsuRent AI" 
          className="h-5 sm:h-[26px] w-auto object-contain shrink-0" 
        />
        <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium tracking-tight mt-0.5 whitespace-nowrap pl-[27px] sm:pl-[35px]">
          Automotive AI Visual Inspection
        </span>
      </button>

      {/* Right side: Reports Log Link */}
      {/* <div className="flex items-center gap-2">
        <a 
          href="/admin" 
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 shrink-0"
          title="View all generated inspection reports"
        >
          <FileText className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden sm:inline">Reports Log</span>
        </a>
      </div> */}
    </header>
  );
}
