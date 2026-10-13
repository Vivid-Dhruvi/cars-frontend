import Link from 'next/link';
import { ShieldAlert, ArrowLeft, ScanLine } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center antialiased">
      {/* Exact Match App Header */}
      <header className="fixed top-0 left-0 right-0 w-full bg-white border-b border-slate-200/90 px-3 sm:px-8 h-14 sm:h-16 flex items-center justify-between z-50 shadow-xs">
        <Link 
          href="/" 
          aria-label="CarInsuRent AI Home"
          className="flex flex-col items-start cursor-pointer text-left focus:outline-none shrink-0"
        >
          <img 
            src="/car-rental-damage-scanner/logo-ai.svg?v=5" 
            alt="CarInsuRent AI" 
            className="h-5 sm:h-[26px] w-auto object-contain shrink-0" 
          />
          <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium tracking-tight mt-0.5 whitespace-nowrap pl-[27px] sm:pl-[35px]">
            Automotive AI Visual Inspection
          </span>
        </Link>
      </header>

      {/* Main 404 Center Section */}
      <main className="flex flex-col items-center justify-center text-center max-w-lg px-4 pt-16">
        {/* Shield Icon & 404 Badge */}
        <div className="relative mb-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-blue-50 border border-blue-200/60 flex items-center justify-center shadow-inner">
            <ShieldAlert className="w-10 h-10 sm:w-12 sm:h-12 text-[#022A5B]" />
          </div>
          <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 bg-amber-500 text-white text-[11px] font-bold rounded-full shadow-xs">
            404
          </span>
        </div>

        {/* Title & Description */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#022A5B] tracking-tight">
          Page Not Found
        </h1>
        <p className="text-slate-600 text-sm sm:text-base mt-3 leading-relaxed">
          The scanner route, vehicle checklist, or report you are trying to access doesn&apos;t exist or has moved.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full mt-8">
          <Link
            href="/"
            className="w-full sm:w-60 h-12 inline-flex items-center justify-center gap-2 whitespace-nowrap gradient-navy-btn text-white font-semibold text-sm rounded-xl shadow-md hover:opacity-95 transition-all shrink-0"
          >
            <ScanLine className="w-4 h-4 shrink-0" />
            <span>Launch Damage Scanner</span>
          </Link>

          <a
            href="https://carinsurent.com"
            className="w-full sm:w-60 h-12 inline-flex items-center justify-center gap-2 whitespace-nowrap bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold text-sm rounded-xl transition-all shadow-2xs shrink-0"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span>Return to CarInsuRent</span>
          </a>
        </div>
      </main>
    </div>
  );
}
