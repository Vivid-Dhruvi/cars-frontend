'use client';

import React from 'react';
import { CreditCard, Lock, ArrowRight, ArrowLeft, ShieldCheck, Loader2 } from 'lucide-react';

export default function PaywallForm({ 
  userInfo, 
  setUserInfo, 
  activeInspectionId, 
  isProcessingPayment, 
  setIsProcessingPayment, 
  setCurrentStep 
}) {
  // Reset loader when browser navigates back from iCredit (pageshow/bfcache) or window gains focus
  React.useEffect(() => {
    setIsProcessingPayment(false);

    const resetLoader = () => {
      setIsProcessingPayment(false);
    };

    window.addEventListener('pageshow', resetLoader);
    window.addEventListener('focus', resetLoader);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        setIsProcessingPayment(false);
      }
    });

    return () => {
      window.removeEventListener('pageshow', resetLoader);
      window.removeEventListener('focus', resetLoader);
    };
  }, [setIsProcessingPayment]);

  return (
    <div className="max-w-md mx-auto bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm flex flex-col gap-4">
      {/* Top Back Navigation */}
      <div className="flex items-center justify-between">
        <button 
          type="button" 
          onClick={() => setCurrentStep('results')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 cursor-pointer py-1 px-2.5 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Results</span>
        </button>

        <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Secure Checkout</span>
        </span>
      </div>

      {/* Header */}
      <div className="text-center pt-1">
        <div className="w-12 h-12 rounded-2xl bg-[#022a5b]/10 border border-[#022a5b]/15 text-[#022a5b] flex items-center justify-center mx-auto mb-2.5 shadow-2xs">
          <CreditCard className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900">Unlock Full Inspection Report</h2>
        <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
          Enter your details to receive your official vehicle inspection certificate and unlock all findings.
        </p>
      </div>

      {/* Checkout Form */}
      <form 
        onSubmit={async (e) => {
          e.preventDefault();
          setIsProcessingPayment(true);
          try {
            const inspId = activeInspectionId || (typeof window !== 'undefined' ? (localStorage.getItem('carsinsure_active_inspection_id') || localStorage.getItem('carsinsure_pending_inspection_id')) : null) || `INS-${Date.now()}`;
            const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            
            // Persist current session details
            try {
              localStorage.setItem('carsinsure_pending_inspection_id', inspId);
              localStorage.setItem('carsinsure_active_inspection_id', inspId);
              localStorage.setItem('carsinsure_user_name', userInfo.name);
              localStorage.setItem('carsinsure_user_email', userInfo.email);
              localStorage.setItem('carsinsure_step', 'paywall');
            } catch (e) {}

            const res = await fetch(`${API_BASE}/api/payment/initiate`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                inspectionId: inspId,
                name: userInfo.name,
                email: userInfo.email,
                amount: 3.00,
                originUrl: window.location.origin
              })
            });
            const data = await res.json();

            // If already paid, immediately unlock without charging
            if (data.alreadyPaid) {
              try {
                localStorage.setItem('carsinsure_step', 'unlocked');
              } catch (e) {}
              setIsProcessingPayment(false);
              setCurrentStep('unlocked');
              return;
            }

            if (data.success && data.paymentUrl) {
              // Redirecting to hosted iCredit checkout page (Cards, Apple Pay, Google Pay)
              window.location.href = data.paymentUrl;
              return;
            }

            // Fallback / mock mode: direct checkout confirmation
            const checkoutRes = await fetch(`${API_BASE}/api/payment/checkout`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                inspectionId: inspId,
                name: userInfo.name,
                email: userInfo.email,
                amount: 3.00
              })
            });
            const checkoutData = await checkoutRes.json();
            if (checkoutData.report) {
              try {
                localStorage.setItem('carsinsure_analysis_results', JSON.stringify(checkoutData.report));
              } catch (e) {}
            }

            try {
              localStorage.setItem('carsinsure_step', 'unlocked');
            } catch (e) {}

            setIsProcessingPayment(false);
            setCurrentStep('unlocked');
          } catch (err) {
            console.error('Payment checkout error:', err);
            setIsProcessingPayment(false);
          }
        }} 
        className="flex flex-col gap-3.5"
      >
        <div>
          <label htmlFor="report-name" className="text-xs font-bold text-slate-700 block mb-1">
            Full Name
          </label>
          <input 
            id="report-name" 
            autoComplete="name" 
            type="text"
            required
            placeholder="e.g. John Doe"
            value={userInfo.name}
            onChange={(e) => setUserInfo(prev => ({ ...prev, name: e.target.value }))}
            className="w-full h-11 px-3.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#022a5b] bg-slate-50 transition-all font-medium"
          />
        </div>

        <div>
          <label htmlFor="report-email" className="text-xs font-bold text-slate-700 block mb-1">
            Email Address (for PDF Delivery)
          </label>
          <input 
            id="report-email" 
            autoComplete="email" 
            type="email"
            required
            placeholder="e.g. john@example.com"
            value={userInfo.email}
            onChange={(e) => setUserInfo(prev => ({ ...prev, email: e.target.value }))}
            className="w-full h-11 px-3.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#022a5b] bg-slate-50 transition-all font-medium"
          />
        </div>

        {/* Pricing Summary */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
          <div>
            <span className="font-bold text-xs text-slate-900 block">Report Unlock & Certificate</span>
            <span className="text-[11px] text-slate-500">Includes Official Timestamped PDF</span>
          </div>
          <span className="font-black text-xl text-[#022a5b]">$3.00</span>
        </div>

        {/* Payment Methods */}
        <div className="flex flex-col gap-1.5 my-0.5">
          <label className="text-xs font-bold text-slate-700 block">Payment Methods</label>
          <div className="grid grid-cols-4 gap-2 w-full">
            {/* Apple Pay */}
            <div className="h-10 w-full bg-white border border-slate-200 rounded-xl flex items-center justify-center gap-1 shadow-2xs">
              <svg className="w-3.5 h-3.5 fill-slate-950 shrink-0" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.64-.78 1.08-1.86.96-2.95-1 .04-2.13.67-2.79 1.45-.58.68-1.1 1.77-.96 2.84 1.12.09 2.16-.57 2.79-1.34z"/>
              </svg>
              <span className="font-bold text-slate-900 text-xs tracking-tight">Pay</span>
            </div>

            {/* Google Pay */}
            <div className="h-10 w-full bg-white border border-slate-200 rounded-xl flex items-center justify-center gap-1 shadow-2xs">
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span className="font-bold text-slate-700 text-xs tracking-tight">Pay</span>
            </div>

            {/* Visa */}
            <div className="h-10 w-full bg-white border border-slate-200 rounded-xl flex items-center justify-center shadow-2xs">
              <span className="font-bold italic text-[#1434CB] text-xs tracking-wider">VISA</span>
            </div>

            {/* Mastercard */}
            <div className="h-10 w-full bg-white border border-slate-200 rounded-xl flex items-center justify-center gap-1 shadow-2xs">
              <span className="inline-flex -space-x-1 items-center shrink-0">
                <span className="w-2.5 h-2.5 rounded-full bg-[#EB001B] inline-block"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#F79E1B] inline-block opacity-95"></span>
              </span>
              <span className="font-bold text-slate-800 text-[10px]">Master</span>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200">
          <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Secured 256-bit SSL encrypted checkout via iCredit gateway.</span>
        </div>

        {/* Submit Button */}
        <button 
          type="submit"
          disabled={isProcessingPayment}
          className="w-full h-12 bg-gradient-to-r from-[#022a5b] to-[#033b7e] hover:from-[#033b7e] hover:to-[#022a5b] text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer active:scale-98"
        >
          {isProcessingPayment ? (
            <span className="flex items-center gap-2 font-bold text-white">
              <Loader2 className="w-4 h-4 animate-spin text-white" /> Connecting to Payment Gateway...
            </span>
          ) : (
            <>
              <span>Proceed to Secure Payment ($3.00)</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
