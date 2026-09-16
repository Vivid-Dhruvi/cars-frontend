'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ShieldCheck, Lock, CreditCard, CheckCircle2, ArrowRight, Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

function PaymentGatewayContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const inspectionId = searchParams.get('inspectionId') || 'INS-DEMO';
  const name = searchParams.get('name') || 'Valued Client';
  const email = searchParams.get('email') || 'client@example.com';
  const amount = searchParams.get('amount') || '3.00';

  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8821');
  const [expiry, setExpiry] = useState('08/29');
  const [cvv, setCvv] = useState('•••');
  const [cardName, setCardName] = useState(name);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('card');

  const handlePay = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      // Perform server checkout confirmation
      const res = await fetch(`${API_BASE}/api/payment/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inspectionId,
          name: cardName,
          email,
          amount: parseFloat(amount)
        })
      });

      const data = await res.json();

      if (data.report) {
        try {
          localStorage.setItem('carsinsure_analysis_results', JSON.stringify(data.report));
          localStorage.setItem('carsinsure_active_inspection_id', inspectionId);
          localStorage.setItem('carsinsure_step', 'unlocked');
        } catch (err) {}
      }

      toast.success('Payment authorized successfully!');
      
      // Redirect back to main application with verified payment parameter
      setTimeout(() => {
        window.location.href = `/?inspectionId=${encodeURIComponent(inspectionId)}&payment=success&PrivateSaleToken=tok_${Date.now()}`;
      }, 600);

    } catch (err) {
      console.error('Payment checkout failed:', err);
      toast.error('Payment failed. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
      {/* Top Brand Banner */}
      <div className="w-full max-w-lg mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#022a5b] text-white flex items-center justify-center font-bold text-sm shadow-xs">
            C
          </div>
          <div>
            <span className="font-extrabold text-[#022a5b] text-base tracking-tight leading-none block">
              CarsInsure<span className="text-[#033b7e]">.ai</span>
            </span>
            <span className="text-[10px] text-slate-500 font-medium">iCredit Hosted Payment Page</span>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Verified Secure</span>
        </span>
      </div>

      {/* Main Payment Card */}
      <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md flex flex-col gap-5">
        
        {/* Order Details Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Inspection Order</span>
            <span className="text-sm font-extrabold text-slate-900 font-mono">{inspectionId}</span>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Total Due</span>
            <span className="text-2xl font-black text-[#022a5b]">${amount} <span className="text-xs font-semibold text-slate-500">USD</span></span>
          </div>
        </div>

        {/* Payment Method Selector */}
        <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl">
          <button
            type="button"
            onClick={() => setSelectedMethod('card')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              selectedMethod === 'card' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Credit Card</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedMethod('apple')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              selectedMethod === 'apple' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span> Pay / G Pay</span>
          </button>
        </div>

        {/* Payment Form */}
        <form onSubmit={handlePay} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Cardholder Name</label>
            <input
              type="text"
              required
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              className="w-full h-11 px-3.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#022a5b] bg-slate-50 font-medium"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Card Number</label>
            <div className="relative">
              <input
                type="text"
                required
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                className="w-full h-11 px-3.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#022a5b] bg-slate-50 font-medium tracking-wider"
              />
              <div className="absolute right-3 top-2.5 flex items-center gap-1">
                <span className="font-bold italic text-[#1434CB] text-[10px]">VISA</span>
                <span className="w-2 h-2 rounded-full bg-[#EB001B] inline-block -ml-0.5" />
                <span className="w-2 h-2 rounded-full bg-[#F79E1B] inline-block -ml-1" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Expiration</label>
              <input
                type="text"
                required
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                placeholder="MM/YY"
                className="w-full h-11 px-3.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#022a5b] bg-slate-50 font-medium"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">CVV / CVC</label>
              <input
                type="password"
                required
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
                maxLength={4}
                className="w-full h-11 px-3.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#022a5b] bg-slate-50 font-medium"
              />
            </div>
          </div>

          {/* Trust Banner */}
          <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500">
            <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>256-bit TLS Encryption • PCI DSS Level 1 Certified Gateway</span>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isProcessing}
            className="w-full h-12 bg-[#022a5b] hover:bg-[#033b7e] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm shadow-[#022a5b]/20 transition-all cursor-pointer active:scale-98"
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Authorizing $3.00 with Merchant Gateway...</span>
              </span>
            ) : (
              <>
                <span>Authorize & Pay ${amount} USD</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Cancellation Backlink */}
        <div className="text-center pt-1 border-t border-slate-100">
          <button
            type="button"
            onClick={() => router.push(`/?inspectionId=${encodeURIComponent(inspectionId)}&payment=failed`)}
            className="text-xs text-slate-400 hover:text-slate-700 font-medium inline-flex items-center gap-1 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-3 h-3" /> Cancel and return to CarsInsure
          </button>
        </div>

      </div>
    </div>
  );
}

export default function PaymentGatewayPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="w-8 h-8 animate-spin text-[#022a5b]" />
      </div>
    }>
      <PaymentGatewayContent />
    </Suspense>
  );
}
