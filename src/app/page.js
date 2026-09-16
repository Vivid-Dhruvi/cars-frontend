'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import Header from '@/components/Header';
import PhotoChecklist from '@/components/PhotoChecklist';
import CarMapResults from '@/components/CarMapResults';
import PaywallForm from '@/components/PaywallForm';
import UnlockedReport from '@/components/UnlockedReport';
import InspectionLoader from '@/components/InspectionLoader';
import { Camera, Cpu, Lock, FileCheck, Check } from 'lucide-react';

const STEPS = [
  { id: 'checklist', label: '1. Photo Capture', shortLabel: '1. Photos', icon: Camera, stepNum: '1' },
  { id: 'results', label: '2. AI Analysis', shortLabel: '2. Analysis', icon: Cpu, stepNum: '2' },
  { id: 'paywall', label: '3. Unlock Report', shortLabel: '3. Unlock', icon: Lock, stepNum: '3' },
  { id: 'unlocked', label: '4. Official Certificate', shortLabel: '4. Certificate', icon: FileCheck, stepNum: '4' },
];

export default function App() {
  const [isMounted, setIsMounted] = useState(false);
  const [currentStep, setCurrentStepState] = useState('checklist');
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const paymentProcessedRef = useRef(false);
  
  // Navigation wrapper that updates state and keeps browser history in sync
  const setCurrentStep = useCallback((newStep, pushHistory = true) => {
    setCurrentStepState(newStep);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('carsinsure_step', newStep);
        if (pushHistory) {
          window.history.pushState({ step: newStep }, '', window.location.pathname);
        }
      } catch (e) {}
    }
  }, []);

  // Vehicle Details State
  const [vehicleData, setVehicleData] = useState({
    company: '',
    makeModel: '',
    plateNumber: '',
    inspectionType: 'pickup'
  });

  // Photo Checklist State (14 angles per protocol IMAGE_01 to IMAGE_14)
  const [photos, setPhotos] = useState({
    '01': null, '02': null, '03': null, '04': null, '05': null, '06': null, '07': null,
    '08': null, '09': null, '10': null, '11': null, '12': null, '13': null, '14': null
  });

  // User info captured at paywall
  const [userInfo, setUserInfo] = useState({ name: '', email: '' });

  // Payment State ($3 iCredit)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [activeInspectionId, setActiveInspectionId] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);

  // Restore state on refresh OR handle return redirect from iCredit Hosted Payment Gateway
  useEffect(() => {
    setIsMounted(true);
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get('payment');
    const statusParam = params.get('Status') || params.get('status');
    const hasPrivateToken = Boolean(params.get('PrivateSaleToken') || params.get('privatesaletoken'));
    const isPaymentSuccess = paymentStatus === 'success' || statusParam === '0' || hasPrivateToken;

    const urlInspectionId = params.get('inspectionId') || params.get('Custom1') || params.get('custom1');
    const savedInspectionId = urlInspectionId || localStorage.getItem('carsinsure_pending_inspection_id') || localStorage.getItem('carsinsure_active_inspection_id');
    const savedName = localStorage.getItem('carsinsure_user_name') || 'Valued Client';
    const savedEmail = localStorage.getItem('carsinsure_user_email') || '';

    if (isPaymentSuccess && savedInspectionId) {
      if (paymentProcessedRef.current) return;
      paymentProcessedRef.current = true;
      setIsVerifyingPayment(true);

      // Clean query params immediately so subsequent re-renders don't re-trigger
      window.history.replaceState({ step: 'unlocked' }, document.title, window.location.pathname);

      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      setActiveInspectionId(savedInspectionId);
      setUserInfo({ name: savedName, email: savedEmail });

      // Confirm checkout record & load inspection data
      fetch(`${API_BASE}/api/payment/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inspectionId: savedInspectionId,
          name: savedName,
          email: savedEmail,
          amount: 3.00,
          privateSaleToken: params.get('PrivateSaleToken') || null
        })
      })
      .then(r => r.json())
      .then(async (checkoutData) => {
        let report = checkoutData.report;
        if (!report) {
          const reportRes = await fetch(`${API_BASE}/api/reports/${savedInspectionId}`);
          const data = await reportRes.json();
          report = data.report;
        }

        if (report) {
          setAnalysisResults(report);
          if (report.user_info?.email) {
            setUserInfo({
              name: report.user_info.name || savedName,
              email: report.user_info.email || savedEmail
            });
          }
          try {
            localStorage.setItem('carsinsure_analysis_results', JSON.stringify(report));
            localStorage.setItem('carsinsure_step', 'unlocked');
            localStorage.setItem('carsinsure_active_inspection_id', savedInspectionId);
          } catch (e) {}
        }
        setIsVerifyingPayment(false);
        setCurrentStepState('unlocked');
        toast.success('Payment Verified! Full Report Unlocked & PDF Dispatched.', { id: 'payment-verified-toast' });
      })
      .catch(err => {
        console.error('Failed loading paid inspection:', err);
        setIsVerifyingPayment(false);
        setCurrentStepState('unlocked');
      });
    } else if (paymentStatus === 'failed' || (statusParam && statusParam !== '0')) {
      if (paymentProcessedRef.current) return;
      paymentProcessedRef.current = true;
      toast.error('Payment was cancelled or not completed. Please try again.', { id: 'payment-failed-toast' });
      try {
        localStorage.setItem('carsinsure_step', 'paywall');
      } catch (e) {}
      setCurrentStepState('paywall');
      window.history.replaceState({ step: 'paywall' }, document.title, window.location.pathname);
    } else {
      // Normal browser refresh: restore active session if available
      try {
        const savedStep = localStorage.getItem('carsinsure_step');
        const savedResultsRaw = localStorage.getItem('carsinsure_analysis_results');
        const savedActiveId = localStorage.getItem('carsinsure_active_inspection_id');
        const savedPhotosRaw = localStorage.getItem('carsinsure_photos');
        const savedVehicleRaw = localStorage.getItem('carsinsure_vehicle_data');
        const savedUserName = localStorage.getItem('carsinsure_user_name');
        const savedUserEmail = localStorage.getItem('carsinsure_user_email');

        if (savedUserEmail) {
          setUserInfo({ name: savedUserName || '', email: savedUserEmail });
        }

        if (savedResultsRaw && (savedStep === 'results' || savedStep === 'paywall' || savedStep === 'unlocked')) {
          const parsedResults = JSON.parse(savedResultsRaw);
          setAnalysisResults(parsedResults);
          if (savedActiveId) setActiveInspectionId(savedActiveId);
          if (savedPhotosRaw) setPhotos(JSON.parse(savedPhotosRaw));
          if (savedVehicleRaw) setVehicleData(JSON.parse(savedVehicleRaw));

          if (savedStep === 'unlocked' && savedActiveId) {
            const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            fetch(`${API_BASE}/api/reports/${savedActiveId}`)
              .then(r => r.json())
              .then(data => {
                if (data.report && data.report.is_paid) {
                  setCurrentStepState('unlocked');
                  window.history.replaceState({ step: 'unlocked' }, '', window.location.pathname);
                } else {
                  setCurrentStepState('results');
                  try {
                    localStorage.setItem('carsinsure_step', 'results');
                  } catch (e) {}
                  window.history.replaceState({ step: 'results' }, '', window.location.pathname);
                }
              })
              .catch(() => {
                setCurrentStepState('results');
              });
          } else {
            setCurrentStepState(savedStep);
            window.history.replaceState({ step: savedStep }, '', window.location.pathname);
          }
        }
      } catch (e) {
        console.warn('Failed restoring cached session:', e);
      }
    }
  }, []);

  // Listen to browser Back / Forward hardware or browser navigation
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handlePopState = (e) => {
      if (e.state && e.state.step) {
        setCurrentStepState(e.state.step);
      } else {
        const savedStep = localStorage.getItem('carsinsure_step') || 'checklist';
        setCurrentStepState(savedStep);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Helper to compress high-res phone camera photos
  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 720;
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.60);
          resolve(compressedBase64);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  // Instant local photo selection & Base64 encoder
  const handleFileUpload = async (id, file) => {
    if (!file) return;

    try {
      const base64Data = await compressImage(file);
      setPhotos(prev => ({ 
        ...prev, 
        [id]: { url: base64Data, filename: `IMAGE_${id}` } 
      }));
      toast.success(`Photo ${id} captured!`);
    } catch (err) {
      console.error('Compress Error:', err);
      toast.error('Failed to process photo.');
    }
  };

  // Real API call to trigger AI inspection
  const handleAnalyzePhotos = async () => {
    const validPhotos = Object.values(photos).filter(p => p && (p.url || typeof p === 'string'));
    if (validPhotos.length === 0) {
      toast.error('Please upload or capture at least one vehicle photo before running AI inspection.');
      return;
    }
    setIsUploading(true);
    toast.info('Analyzing vehicle photos with AI engine...');
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    try {
      const res = await fetch(`${API_BASE}/api/inspection/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicleData, photos })
      });
      const data = await res.json();
      if (data.success) {
        setActiveInspectionId(data.inspectionId);
        setAnalysisResults(data.fullResults);
        setUserInfo({ name: '', email: '' });
        try {
          localStorage.setItem('carsinsure_step', 'results');
          localStorage.setItem('carsinsure_active_inspection_id', data.inspectionId);
          localStorage.setItem('carsinsure_analysis_results', JSON.stringify(data.fullResults));
          localStorage.setItem('carsinsure_photos', JSON.stringify(photos));
          localStorage.setItem('carsinsure_vehicle_data', JSON.stringify(vehicleData));
          localStorage.removeItem('carsinsure_user_name');
          localStorage.removeItem('carsinsure_user_email');
          localStorage.removeItem('carsinsure_pending_inspection_id');
        } catch (e) {}
        setCurrentStep('results');
        toast.success('AI Visual Analysis Complete!');
      } else {
        toast.error('Analysis error: ' + (data.error || 'Server error occurred'));
      }
    } catch (err) {
      console.error('API Error:', err);
      toast.error('Failed to communicate with backend server. Check connection.');
    } finally {
      setIsUploading(false);
    }
  };

  const capturedCount = Object.values(photos).filter(Boolean).length;
  const currentStepIndex = STEPS.findIndex(s => s.id === currentStep);

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-slate-900 font-sans antialiased flex flex-col items-center justify-start pb-16 overflow-x-hidden w-full max-w-full">
      {/* Top Header */}
      <Header setCurrentStep={setCurrentStep} currentStep={currentStep} />

      {/* Stepper Navigation Bar (#022a5b royal midnight gradient) */}
      <div className="w-full max-w-6xl px-4 sm:px-8 pt-6 pb-2">
        <div className="bg-white rounded-2xl p-2 sm:p-2.5 border border-slate-200/90 shadow-xs flex items-center justify-between gap-1 sm:gap-2">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isPassed = currentStepIndex > idx;
            const isCurrent = currentStepIndex === idx;

            return (
              <React.Fragment key={step.id}>
                <div 
                  className={`flex-1 flex items-center justify-center sm:justify-start gap-2.5 py-2 px-3 sm:px-4 rounded-xl transition-all ${
                    isCurrent 
                      ? 'bg-gradient-to-r from-[#022a5b] to-[#04428e] text-white font-extrabold shadow-md shadow-[#022a5b]/20' 
                      : isPassed 
                        ? 'text-[#022a5b] bg-[#022a5b]/10 font-bold' 
                        : 'text-slate-400 bg-transparent opacity-70'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    isCurrent 
                      ? 'bg-white text-[#022a5b]' 
                      : isPassed 
                        ? 'bg-[#022a5b] text-white' 
                        : 'bg-slate-200 text-slate-500'
                  }`}>
                    {isPassed ? <Check className="w-3 h-3 stroke-[3]" /> : step.stepNum}
                  </div>
                  <span className={`text-[11px] md:text-xs truncate hidden sm:inline ${
                    isCurrent ? 'text-white font-bold' : isPassed ? 'text-[#022a5b] font-semibold' : 'text-slate-500 font-medium'
                  }`}>
                    <span className="hidden lg:inline">{step.label}</span>
                    <span className="inline lg:hidden">{step.shortLabel || step.label}</span>
                  </span>
                </div>

                {idx < STEPS.length - 1 && (
                  <div className={`w-3 sm:w-6 h-0.5 rounded-full shrink-0 transition-all ${
                    currentStepIndex > idx ? 'bg-[#022a5b]' : 'bg-slate-200'
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="w-full max-w-6xl px-4 sm:px-8 pt-4">
        
        {/* PAYMENT VERIFICATION IN-FLIGHT LOADER */}
        {isVerifyingPayment && (
          <InspectionLoader type="payment_verification" vehicleData={vehicleData} />
        )}

        {/* AI INSPECTION IN-FLIGHT LOADER */}
        {!isVerifyingPayment && isUploading && (
          <InspectionLoader type="ai_inspection" vehicleData={vehicleData} />
        )}

        {/* STEP 1: 14-PHOTO CAPTURE CHECKLIST */}
        {!isVerifyingPayment && !isUploading && currentStep === 'checklist' && (
          <PhotoChecklist 
            vehicleData={vehicleData}
            setVehicleData={setVehicleData}
            photos={photos}
            capturedCount={capturedCount}
            handleFileUpload={handleFileUpload}
            handleAnalyzePhotos={handleAnalyzePhotos}
            isUploading={isUploading}
          />
        )}

        {/* STEP 2: AI RESULTS & 2D CAR MAP */}
        {!isVerifyingPayment && !isUploading && currentStep === 'results' && (
          <CarMapResults 
            vehicleData={vehicleData}
            analysisResults={analysisResults}
            photos={photos}
            setCurrentStep={setCurrentStep}
          />
        )}

        {/* STEP 3: PAYWALL FORM */}
        {!isVerifyingPayment && !isUploading && currentStep === 'paywall' && (
          <PaywallForm 
            userInfo={userInfo}
            setUserInfo={setUserInfo}
            activeInspectionId={activeInspectionId}
            isProcessingPayment={isProcessingPayment}
            setIsProcessingPayment={setIsProcessingPayment}
            setCurrentStep={setCurrentStep}
          />
        )}

        {/* STEP 4: UNLOCKED REPORT */}
        {!isVerifyingPayment && !isUploading && currentStep === 'unlocked' && (
          <UnlockedReport 
            vehicleData={vehicleData}
            userInfo={userInfo}
            analysisResults={analysisResults}
            activeInspectionId={activeInspectionId}
            photos={photos}
          />
        )}

      </main>
    </div>
  );
}
