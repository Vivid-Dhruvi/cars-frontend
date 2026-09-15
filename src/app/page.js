'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import Header from '@/components/Header';
import PhotoChecklist from '@/components/PhotoChecklist';
import CarMapResults from '@/components/CarMapResults';
import PaywallForm from '@/components/PaywallForm';
import UnlockedReport from '@/components/UnlockedReport';

export default function App() {
  const [currentStep, setCurrentStepState] = useState('checklist'); // checklist, results, paywall, unlocked
  
  // Navigation wrapper that updates state and keeps browser history in sync
  const setCurrentStep = useCallback((newStep, pushHistory = true) => {
    setCurrentStepState(newStep);
    if (typeof window !== 'undefined' && pushHistory) {
      try {
        window.history.pushState({ step: newStep }, '', window.location.pathname);
      } catch (e) {}
    }
  }, []);

  // Listen to browser Back / Forward hardware or browser navigation
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Set initial history state
    try {
      window.history.replaceState({ step: 'checklist' }, '', window.location.pathname);
    } catch (e) {}

    const handlePopState = (e) => {
      if (e.state && e.state.step) {
        setCurrentStepState(e.state.step);
      } else {
        setCurrentStepState('checklist');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Vehicle Details State (Inputted dynamically by user or contract)
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

  // Clear any cached session storage on page load/refresh so every refresh starts completely fresh
  useEffect(() => {
    try {
      sessionStorage.clear();
    } catch (e) {}
  }, []);

  // Helper to compress high-res phone camera photos so Vercel 4.5MB payload limit is never exceeded
  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 900; // Optimal resolution for fast encoding & Gemini Vision
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
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.65);
          resolve(compressedBase64);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  // Instant local photo selection & Base64 encoder (No AI prompt runs until full batch submission)
  const handleFileUpload = async (id, file) => {
    if (!file) return;

    try {
      const base64Data = await compressImage(file);
      setPhotos(prev => ({ 
        ...prev, 
        [id]: { url: base64Data, filename: `IMAGE_${id}` } 
      }));
      toast.success(`IMAGE_${id} captured!`);
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
    toast.info('Gemini AI Engine analyzing vehicle photos...');
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
        setCurrentStep('results');
        toast.success('Gemini Vision AI Analysis Complete!');
      } else {
        toast.error('Analysis error: ' + data.error);
      }
    } catch (err) {
      console.error('API Error:', err);
      toast.error('Failed to communicate with backend server.');
    } finally {
      setIsUploading(false);
    }
  };

  const capturedCount = Object.values(photos).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased flex flex-col items-center justify-start pb-12">
      {/* Top Header */}
      <Header setCurrentStep={setCurrentStep} currentStep={currentStep} />

      {/* Main Content Area */}
      <main className="w-full max-w-6xl px-4 md:px-8 pt-6">
        
        {/* STEP 1: 14-PHOTO CAPTURE CHECKLIST */}
        {currentStep === 'checklist' && (
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
        {currentStep === 'results' && (
          <CarMapResults 
            vehicleData={vehicleData}
            analysisResults={analysisResults}
            photos={photos}
            setCurrentStep={setCurrentStep}
          />
        )}

        {/* STEP 3: PAYWALL FORM */}
        {currentStep === 'paywall' && (
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
        {currentStep === 'unlocked' && (
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
