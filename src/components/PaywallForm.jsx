'use client';

import React from 'react';
import { CreditCard, Lock, ArrowRight, Sparkles } from 'lucide-react';

export default function PaywallForm({ 
  userInfo, 
  setUserInfo, 
  activeInspectionId,
  isProcessingPayment, 
  setIsProcessingPayment, 
  setCurrentStep 
}) {
  return (
    <div className="max-w-md mx-auto bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-md flex flex-col gap-5">
      <div className="text-center">
        <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center mx-auto mb-3">
          <CreditCard className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Unlock Full PDF Report</h2>
        <p className="text-xs text-slate-500 mt-1">Enter your details to receive and download your official inspection report.</p>
      </div>

      <form 
        onSubmit={async (e) => {
          e.preventDefault();
          setIsProcessingPayment(true);
          try {
            if (activeInspectionId) {
              const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
              await fetch(`${API_BASE}/api/payment/checkout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  inspectionId: activeInspectionId,
                  name: userInfo.name,
                  email: userInfo.email,
                  amount: 3.00
                })
              });
            }
          } catch (err) {
            console.error('Payment checkout error:', err);
          } finally {
            setIsProcessingPayment(false);
            setCurrentStep('unlocked');
          }
        }} 
        className="flex flex-col gap-4"
      >
        <div>
          <label htmlFor="report-name" className="text-xs font-bold text-slate-700 block mb-1">Your Full Name</label>
          <input 
            id="report-name" autoComplete="name" type="text"
            required
            placeholder="e.g. John Doe"
            value={userInfo.name}
            onChange={(e) => setUserInfo({...userInfo, name: e.target.value})}
            className="w-full h-11 px-3 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 bg-slate-50"
          />
        </div>

        <div>
          <label htmlFor="report-email" className="text-xs font-bold text-slate-700 block mb-1">Email Address (for PDF Delivery)</label>
          <input 
            id="report-email" autoComplete="email" type="email"
            required
            placeholder="e.g. john@example.com"
            value={userInfo.email}
            onChange={(e) => setUserInfo({...userInfo, email: e.target.value})}
            className="w-full h-11 px-3 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 bg-slate-50"
          />
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 my-1">
          <div>
            <span className="font-bold text-xs text-slate-900 block">Inspection Report Unlock</span>
            <span className="text-xs text-slate-500">Includes PDF Download + Verification Link</span>
          </div>
          <span className="font-black text-lg text-slate-900">$3.00</span>
        </div>

        <div className="flex flex-col gap-2.5 my-1">
          <label className="text-xs font-bold text-slate-700 block">Select Payment Gateway</label>
          <div className="grid grid-cols-3 gap-2">
            <button 
              type="button" 
              className="p-3 rounded-xl border border-sky-500 bg-sky-50 text-slate-900 font-bold text-xs flex flex-col items-center gap-1 shadow-2xs"
            >
              <CreditCard className="w-4 h-4 text-sky-600" />
              iCredit
            </button>

            <button 
              type="button" 
              className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-semibold text-xs flex flex-col items-center gap-1 hover:bg-slate-100"
            >
              <span className="font-black italic text-blue-700">P</span>
              PayPal
            </button>

            <button 
              type="button" 
              className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-semibold text-xs flex flex-col items-center gap-1 hover:bg-slate-100"
            >
              <span></span>
              Apple / Google
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 bg-sky-50/50 p-3 rounded-xl border border-sky-100">
          <Lock className="w-4 h-4 text-sky-600 shrink-0" />
          <span>Secured via iCredit (CarInsuRent Gateway), PayPal, Apple Pay, & Cards.</span>
        </div>

        <button 
          type="submit"
          disabled={isProcessingPayment}
          className="w-full h-13 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
        >
          {isProcessingPayment ? (
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 animate-spin text-sky-400" /> Processing iCredit Payment...
            </span>
          ) : (
            <>Pay $3 & Download Report <ArrowRight className="w-4 h-4" /></>
          )}
        </button>
      </form>
    </div>
  );
}
