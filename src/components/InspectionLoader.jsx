'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, ShieldCheck, Cpu, CheckCircle2, Car, RefreshCw, FileText, Check, Scan, Activity } from 'lucide-react';

export default function InspectionLoader({ type = 'ai_inspection', vehicleData = {} }) {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [progressPct, setProgressPct] = useState(15);

  const aiStages = [
    { title: 'Uploading & Preprocessing Angles', desc: 'Validating 14-angle high-resolution captures...', icon: Car },
    { title: 'Gemini Vision AI Surface Scan', desc: 'Analyzing body panels for scratches, dents & paint wear...', icon: Cpu },
    { title: '2D Interactive Blueprint Mapping', desc: 'Positioning damage pins on schematic coordinates...', icon: Sparkles },
    { title: 'Compiling Inspection Report', desc: 'Calculating severity scores & verification record...', icon: FileText },
  ];

  const paymentStages = [
    { title: 'Contacting iCredit Secure Gateway', desc: 'Validating transaction token & merchant clearance...', icon: ShieldCheck },
    { title: 'Authorizing Full Damage Report', desc: 'Unlocking high-resolution evidence & AI severity scores...', icon: Sparkles },
    { title: 'Generating Official Certificate & PDF', desc: 'Creating timestamped PDF and emailing receipt...', icon: FileText },
  ];

  const stages = type === 'payment_verification' ? paymentStages : aiStages;
  const [secondsRemaining, setSecondsRemaining] = useState(stages.length * 2);

  useEffect(() => {
    // Continuous 1-second live countdown
    const countdownTimer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 1 ? prev - 1 : 1));
    }, 1000);

    // Stage progression timer
    const stageTimer = setInterval(() => {
      setCurrentStageIndex((prev) => {
        const next = prev < stages.length - 1 ? prev + 1 : prev;
        setProgressPct(Math.round(((next + 1) / stages.length) * 100));
        return next;
      });
    }, 2200);

    return () => {
      clearInterval(countdownTimer);
      clearInterval(stageTimer);
    };
  }, [stages.length]);

  return (
    <div className="w-full max-w-xl mx-auto my-6 p-6 sm:p-8 bg-white rounded-3xl border border-slate-200/90 shadow-lg relative overflow-hidden isolate animate-in fade-in duration-300">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-[#022a5b]/8 rounded-full blur-2xl pointer-events-none translate-x-1/4 -translate-y-1/4" />
      <div className="absolute bottom-0 left-0 w-36 h-36 bg-blue-400/8 rounded-full blur-2xl pointer-events-none -translate-x-1/4 translate-y-1/4" />

      {/* Unique Futuristic AI Radar Scanner Visual */}
      <div className="relative flex flex-col items-center text-center pb-2">
        <div className="relative w-28 h-28 flex items-center justify-center mb-4">
          {/* Outer Pulsing Rings */}
          <div className="absolute inset-0 rounded-full border-2 border-[#022a5b]/20 animate-ping opacity-25" />
          <div className="absolute -inset-2 rounded-full border border-dashed border-[#022a5b]/30 animate-spin" style={{ animationDuration: '14s' }} />
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-[#022a5b] to-[#04428e] shadow-lg shadow-[#022a5b]/30 flex items-center justify-center text-white">
            {type === 'payment_verification' ? (
              <ShieldCheck className="w-12 h-12 text-emerald-300 animate-pulse" />
            ) : (
              <div className="relative flex items-center justify-center">
                <Car className="w-10 h-10 text-white" />
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-[#022a5b] flex items-center justify-center">
                  <Activity className="w-2.5 h-2.5 text-[#022a5b] animate-pulse" />
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Live Status Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#022a5b]/8 border border-[#022a5b]/20 text-[#022a5b] text-xs font-extrabold tracking-wide mb-2.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{type === 'payment_verification' ? 'Securing Transaction Clearance' : 'AI Multi-Angle Computer Vision'}</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          {type === 'payment_verification'
            ? 'Confirming Payment & Unlocking Report'
            : 'Analyzing Vehicle Photos'}
        </h2>

        <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-md mx-auto">
          {type === 'payment_verification'
            ? 'Please wait a moment while we assemble your official cryptographic certificate.'
            : `Processing ${vehicleData.makeModel || 'vehicle'} photographs with deep-learning damage detection.`}
        </p>

        {/* Progress Bar with Glow */}
        <div className="w-full mt-4 bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/80">
          <div 
            className="h-full bg-gradient-to-r from-[#022a5b] via-[#04428e] to-emerald-500 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* High-Tech Stage Progress Cards */}
      <div className="mt-5 space-y-2.5">
        {stages.map((stage, idx) => {
          const isDone = idx < currentStageIndex;
          const isCurrent = idx === currentStageIndex;
          const IconComp = stage.icon;

          return (
            <div
              key={idx}
              className={`p-3.5 rounded-2xl border transition-all duration-300 flex items-center gap-3.5 ${
                isDone
                  ? 'bg-emerald-50/60 border-emerald-200/90 text-slate-900 shadow-2xs'
                  : isCurrent
                  ? 'bg-gradient-to-r from-[#022a5b]/8 via-[#022a5b]/4 to-white border-[#022a5b]/30 text-slate-900 shadow-sm ring-1 ring-[#022a5b]/15'
                  : 'bg-slate-50/50 border-slate-100 text-slate-400 opacity-50'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-black transition-all ${
                  isDone
                    ? 'bg-emerald-500 text-white shadow-2xs'
                    : isCurrent
                    ? 'bg-gradient-to-br from-[#022a5b] to-[#04428e] text-white shadow-md shadow-[#022a5b]/20 animate-bounce'
                    : 'bg-slate-200 text-slate-400'
                }`}
              >
                {isDone ? (
                  <Check className="w-4 h-4 stroke-[3]" />
                ) : (
                  <IconComp className={`w-4 h-4 ${isCurrent ? 'animate-pulse' : ''}`} />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className={`text-xs sm:text-sm font-bold truncate ${isCurrent ? 'text-[#022a5b]' : isDone ? 'text-emerald-950 font-bold' : 'text-slate-500'}`}>
                    {stage.title}
                  </h4>
                  {isCurrent && (
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#022a5b] bg-[#022a5b]/10 px-2 py-0.5 rounded-md shrink-0 border border-[#022a5b]/20 animate-pulse">
                      In Progress
                    </span>
                  )}
                  {isDone && (
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md shrink-0 border border-emerald-200">
                      Done
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                  {stage.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trust & Security Footer */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
        <span className="flex items-center gap-1.5 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-600" /> 256-Bit Encrypted Protocol
        </span>
        <span className="font-bold text-[#022a5b]">
          Estimated: ~{secondsRemaining}s remaining
        </span>
      </div>
    </div>
  );
}
