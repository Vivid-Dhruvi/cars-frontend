'use client';

import React from 'react';
import { ShieldCheck } from 'lucide-react';

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
    <header className="w-full bg-white border-b border-slate-200/90 px-4 sm:px-8 h-16 flex items-center justify-between gap-4 sticky top-0 z-40 shadow-xs">
      {/* Brand Logo */}
      <button 
        type="button" 
        aria-label="CarsInsure AI Home" 
        className="flex items-center gap-3 cursor-pointer text-left group" 
        onClick={handleLogoClick}
      >
        <div className="w-9 h-9 rounded-xl bg-[#022a5b] text-white flex items-center justify-center font-bold text-base shadow-xs group-hover:bg-[#033b7e] transition-colors">
          C
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-[#022a5b] text-lg tracking-tight leading-none">
              CarsInsure<span className="text-[#033b7e]">.ai</span>
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Automotive AI Visual Inspection
          </span>
        </div>
      </button>

      {/* Right side area empty */}
      <div></div>
    </header>
  );
}
