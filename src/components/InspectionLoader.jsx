'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, ShieldCheck, Cpu, CheckCircle2, Car, RefreshCw, FileText } from 'lucide-react';

export default function InspectionLoader({ type = 'ai_inspection', vehicleData = {} }) {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);

  const aiStages = [
    { title: 'Uploading & Preprocessing Angles', desc: 'Validating 14-angle high-resolution captures...', icon: Car },
    { title: 'Gemini 2.5 Flash Vision Scan', desc: 'Analyzing body panels for scratches, dents & paint wear...', icon: Cpu },
    { title: '2D Interactive Blueprint Mapping', desc: 'Positioning damage pins on interactive schematic...', icon: Sparkles },
    { title: 'Generating Preliminary Damage Report', desc: 'Calculating severity scores & estimated costs...', icon: FileText },
  ];

  const paymentStages = [
    { title: 'Contacting iCredit Secure Gateway', desc: 'Validating transaction token & merchant clearance...', icon: ShieldCheck },
    { title: 'Authorizing Full Damage Report', desc: 'Unlocking high-resolution evidence & AI severity scores...', icon: Sparkles },
    { title: 'Generating Official Certificate & PDF', desc: 'Creating timestamped PDF and emailing your receipt...', icon: FileText },
  ];

  const stages = type === 'payment_verification' ? paymentStages : aiStages;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStageIndex((prev) => (prev < stages.length - 1 ? prev + 1 : prev));
    }, 2400);

    return () => clearInterval(interval);
  }, [stages.length]);

  return (
    <div className="w-full max-w-2xl mx-auto my-6 p-6 sm:p-10 bg-white rounded-3xl border border-slate-200 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-300">
      {/* Background glow effects */}
      <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

      {/* Header Icon & Title */}
      <div className="flex flex-col items-center text-center gap-4 relative z-10">
        <div className="relative">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-sky-500 to-indigo-600 p-0.5 shadow-lg shadow-sky-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center text-white">
              {type === 'payment_verification' ? (
                <ShieldCheck className="w-10 h-10 text-emerald-400 animate-pulse" />
              ) : (
                <Sparkles className="w-10 h-10 text-sky-400 animate-pulse" />
              )}
            </div>
          </div>
          {/* Rotating halo ring */}
          <div className="absolute -inset-2 rounded-3xl border-2 border-sky-400/40 border-dashed animate-spin duration-700 pointer-events-none" />
        </div>

        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-bold mb-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-600" />
            {type === 'payment_verification' ? 'iCredit Checkout Verification' : 'Gemini AI Vision Engine'}
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {type === 'payment_verification'
              ? 'Verifying Payment & Unlocking Report'
              : 'Analyzing Vehicle Condition'}
          </h2>
          <p className="text-slate-500 text-sm mt-1.5 max-w-md mx-auto">
            {type === 'payment_verification'
              ? 'Please wait a moment while we confirm your payment and assemble your full inspection certificate.'
              : `Processing ${vehicleData.makeModel || 'vehicle'} photographs with AI multi-angle damage detection.`}
          </p>
        </div>
      </div>

      {/* Dynamic Stage Checklist */}
      <div className="mt-8 space-y-3 relative z-10">
        {stages.map((stage, idx) => {
          const isDone = idx < currentStageIndex;
          const isCurrent = idx === currentStageIndex;
          const isPending = idx > currentStageIndex;
          const IconComp = stage.icon;

          return (
            <div
              key={idx}
              className={`p-3.5 sm:p-4 rounded-2xl border transition-all duration-500 flex items-center gap-3.5 ${
                isDone
                  ? 'bg-emerald-50/60 border-emerald-200 text-slate-900'
                  : isCurrent
                  ? 'bg-sky-50/80 border-sky-300 shadow-sm ring-1 ring-sky-200 text-slate-900'
                  : 'bg-slate-50/60 border-slate-100 text-slate-400 opacity-60'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold transition-all ${
                  isDone
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : isCurrent
                    ? 'bg-sky-600 text-white shadow-md animate-bounce'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-5 h-5 text-white" />
                ) : (
                  <IconComp className="w-5 h-5" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className={`text-xs sm:text-sm font-bold truncate ${isCurrent ? 'text-sky-900' : isDone ? 'text-emerald-950' : 'text-slate-500'}`}>
                    {stage.title}
                  </h4>
                  {isCurrent && (
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-600 bg-sky-100/80 px-2 py-0.5 rounded-full shrink-0 animate-pulse">
                      In Progress
                    </span>
                  )}
                  {isDone && (
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                      Done
                    </span>
                  )}
                </div>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 truncate">
                  {stage.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trust & Security footer */}
      <div className="mt-8 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2 relative z-10">
        <span className="flex items-center gap-1.5 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-500" /> 256-Bit Encrypted Vehicle Analysis
        </span>
        <span className="font-semibold text-slate-500">
          Estimated remaining: ~{Math.max(1, (stages.length - currentStageIndex) * 2)}s
        </span>
      </div>
    </div>
  );
}
