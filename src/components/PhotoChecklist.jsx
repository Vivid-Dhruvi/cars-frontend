'use client';
import React, { useState, useEffect, useRef } from 'react';
import * as yup from 'yup';
import { Camera, Image as ImageIcon, Check, AlertCircle, Loader2, ChevronRight, ShieldCheck, User, Mail, AlertTriangle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

export const leadFormSchema = yup.object().shape({
  firstName: yup
    .string()
    .trim()
    .required('First name is required')
    .min(2, 'Must be at least 2 characters'),
  surname: yup
    .string()
    .trim()
    .required('Last name / Surname is required')
    .min(2, 'Must be at least 2 characters'),
  email: yup
    .string()
    .trim()
    .required('Email address is required')
    .email('Please enter a valid email address')
    .matches(
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Please enter a valid email address (e.g. name@domain.com)'
    ),
});

/**
 * Detects whether the current device has at least one camera (videoinput).
 * Returns false on desktop browsers with no camera hardware.
 */
function useHasCamera() {
  const [hasCamera, setHasCamera] = useState(false);

  useEffect(() => {
    if (!navigator?.mediaDevices?.enumerateDevices) return;
    navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => {
        setHasCamera(devices.some((d) => d.kind === 'videoinput'));
      })
      .catch(() => setHasCamera(false));
  }, []);

  return hasCamera;
}

const getExampleImage = (id) => {
  return `/examples/IMAGE_${id}.png`;
};

const ANGLES = [
  { id: '01', code: 'IMAGE_01', title: 'Direct Front Face',  subtitle: 'Bumper, grille & headlights',    guide: 'Straight-on view' },
  { id: '02', code: 'IMAGE_02', title: 'Windshield & Hood',  subtitle: 'Cowl facing front glass',         guide: 'Avoid sky reflections' },
  { id: '03', code: 'IMAGE_03', title: 'Front-Left Corner',  subtitle: 'Driver 45° diagonal',             guide: 'Stand 3–4 ft back' },
  { id: '04', code: 'IMAGE_04', title: 'Front-Left Wheel',   subtitle: 'Rim & hubcap close-up',           guide: 'Parallel to wheel', isWheel: true },
  { id: '05', code: 'IMAGE_05', title: 'Left Profile Side',  subtitle: 'Driver doors & rocker panel',     guide: 'Flat straight-on' },
  { id: '06', code: 'IMAGE_06', title: 'Rear-Left Wheel',    subtitle: 'Rim & hubcap close-up',           guide: 'Parallel to wheel', isWheel: true },
  { id: '07', code: 'IMAGE_07', title: 'Rear-Left Corner',   subtitle: 'Rear 45° diagonal',               guide: 'Stand 3–4 ft back' },
  { id: '08', code: 'IMAGE_08', title: 'Direct Rear Face',   subtitle: 'Full trunk & rear bumper',        guide: 'Straight-on view' },
  { id: '09', code: 'IMAGE_09', title: 'Rear Windshield',    subtitle: 'Dedicated rear window',           guide: 'Avoid glare lines' },
  { id: '10', code: 'IMAGE_10', title: 'Rear-Right Corner',  subtitle: 'Passenger 45° diagonal',          guide: 'Stand 3–4 ft back' },
  { id: '11', code: 'IMAGE_11', title: 'Rear-Right Wheel',   subtitle: 'Rim & hubcap close-up',           guide: 'Parallel to wheel', isWheel: true },
  { id: '12', code: 'IMAGE_12', title: 'Right Profile Side', subtitle: 'Passenger doors & rocker',        guide: 'Flat straight-on' },
  { id: '13', code: 'IMAGE_13', title: 'Front-Right Wheel',  subtitle: 'Rim & hubcap close-up',           guide: 'Parallel to wheel', isWheel: true },
  { id: '14', code: 'IMAGE_14', title: 'Front-Right Corner', subtitle: 'Bumper corner 45°',              guide: 'Stand 3–4 ft back' },
];

export default function PhotoChecklist({
  vehicleData,
  setVehicleData,
  photos,
  capturedCount,
  handleFileUpload,
  handleAnalyzePhotos,
  isUploading,
  userInfo = { firstName: '', surname: '', email: '' },
  setUserInfo,
  termsAccepted = false,
  setTermsAccepted,
}) {
  const hasCamera = useHasCamera();
  const [flippedCard, setFlippedCard] = useState(null);
  const progress = Math.round((capturedCount / 14) * 100);

  const [touched, setTouched] = useState({
    firstName: false,
    surname: false,
    email: false,
  });

  const [errors, setErrors] = useState({
    firstName: '',
    surname: '',
    email: '',
  });

  const [termsTouched, setTermsTouched] = useState(false);
  const [termsError, setTermsError] = useState('');
  const termsRef = useRef(null);

  const validateField = async (fieldName, value) => {
    try {
      await leadFormSchema.validateAt(fieldName, { [fieldName]: value });
      setErrors((prev) => ({ ...prev, [fieldName]: '' }));
    } catch (err) {
      setErrors((prev) => ({ ...prev, [fieldName]: err.message }));
    }
  };

  const handleInputChange = (field, value) => {
    if (setUserInfo) {
      setUserInfo((prev) => {
        const updated = { ...prev, [field]: value };
        if (field === 'firstName' || field === 'surname') {
          const fn = field === 'firstName' ? value : prev?.firstName || '';
          const sn = field === 'surname' ? value : prev?.surname || '';
          updated.name = `${fn} ${sn}`.trim();
        }
        return updated;
      });
    }
    if (touched[field]) {
      validateField(field, value);
    }
  };

  const handleInputBlur = (field, value) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field, value);
  };

  const isFirstNameValid = Boolean(
    userInfo?.firstName?.trim() && userInfo.firstName.trim().length >= 2
  );
  const isSurnameValid = Boolean(
    userInfo?.surname?.trim() && userInfo.surname.trim().length >= 2
  );
  const isEmailValid = Boolean(
    userInfo?.email?.trim() &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userInfo.email.trim())
  );

  // Button should NOT be visible if any of the 3 fields (First Name, Last Name, Email) is pending or invalid
  const isFormValid = leadFormSchema.isValidSync({
    firstName: userInfo?.firstName || '',
    surname: userInfo?.surname || '',
    email: userInfo?.email || '',
  });

  const handleRunInspection = () => {
    if (!termsAccepted) {
      setTermsTouched(true);
      setTermsError('Please accept the CarInsuRent Terms and Conditions to proceed.');
      termsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      return;
    }
    setTermsError('');
    if (handleAnalyzePhotos) {
      handleAnalyzePhotos();
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4 sm:gap-5">
      {/* ── Rich Visible #022a5b Midnight Navy Hero Guidance Banner ── */}
      <div className="gradient-navy-hero rounded-2xl sm:rounded-3xl p-4 sm:p-8 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 relative overflow-hidden isolate">
        {/* Glow ambient highlight */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none translate-x-1/4 -translate-y-1/4" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-300/15 rounded-full blur-2xl pointer-events-none -translate-x-1/4 translate-y-1/4" />
        
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-blue-100 text-xs font-bold border border-white/20 backdrop-blur-md">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-200" />
            <span>Standardized 14-Angle Protocol</span>
          </div>

          <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
            Vehicle Photo Checklist
          </h1>
          <p className="text-blue-100/90 text-xs sm:text-sm max-w-xl leading-relaxed">
            Capture or upload clear photos for each designated angle. Our AI computer vision model inspects panels, bumpers, glass, and wheels.
          </p>
        </div>

        {/* Metric Overview Card */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0 bg-white/15 backdrop-blur-md p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-white/20 relative z-10 self-start sm:self-auto">
          <div className="text-left px-1.5 sm:px-2">
            <span className="text-xl sm:text-2xl font-black text-white">{capturedCount}</span>
            <span className="text-blue-200 text-xs font-bold"> / 14</span>
            <span className="block text-[10px] text-blue-200 uppercase tracking-wider font-semibold">Completed</span>
          </div>
          <div className="w-px h-8 bg-white/20" />
          <div className="text-left px-1.5 sm:px-2">
            <span className="text-xl sm:text-2xl font-black text-white">{progress}%</span>
            <span className="block text-[10px] text-blue-200 uppercase tracking-wider font-semibold">Coverage</span>
          </div>
        </div>
      </div>

      {/* ── Photo Grid Card ── */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-7 border border-slate-200/90 shadow-xs flex flex-col gap-4 sm:gap-5">
        {/* Progress summary row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-1">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Angle Captures ({capturedCount} of 14 Completed)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {hasCamera
                ? 'Use camera for instant photo capture or select photos from your device gallery.'
                : 'Select photos from your device for each specified angle.'}
            </p>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 bg-[#022a5b]/5 px-3 sm:px-3.5 py-1.5 rounded-xl border border-[#022a5b]/15 self-start sm:self-auto shrink-0">
            <div className="w-20 sm:w-24 h-2 rounded-full bg-slate-200 overflow-hidden">
              <div 
                className="h-full rounded-full bg-[#022a5b] transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[11px] font-extrabold text-[#022a5b]">{progress}%</span>
          </div>
        </div>

        {/* Remaining notice banner */}
        {capturedCount < 14 && (
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-amber-50 border border-amber-200/90 rounded-xl text-amber-900 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>
              <strong>{14 - capturedCount} angle{14 - capturedCount !== 1 ? 's' : ''} remaining</strong> for complete 360° AI damage detection.
            </span>
          </div>
        )}

        {/* 14-tile grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {ANGLES.map((item) => {
            const img = photos[item.id];
            const captured = Boolean(img);
            return (
              <div
                key={item.id}
                className={`rounded-2xl overflow-hidden border flex flex-col min-h-64 relative transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${
                  captured
                    ? 'border-[#022a5b]/40 bg-white shadow-xs ring-1 ring-[#022a5b]/10 hover:shadow-lg'
                    : item.isWheel
                    ? 'border-indigo-100 bg-indigo-50/20 hover:border-[#022a5b]/40 hover:bg-white hover:shadow-md'
                    : 'border-slate-200 bg-slate-50/70 hover:border-[#022a5b]/40 hover:bg-white hover:shadow-md'
                }`}
              >
                {/* Hidden file inputs */}
                <input
                  id={`cam-input-${item.id}`}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="sr-only"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(item.id, e.target.files[0])}
                />
                <input
                  id={`gal-input-${item.id}`}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(item.id, e.target.files[0])}
                />

                {/* Card header */}
                <div className="p-3 flex items-center justify-between z-10 bg-white border-b border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-6 h-6 rounded-lg text-xs font-extrabold flex items-center justify-center transition-colors ${
                      captured 
                        ? 'bg-[#022a5b] text-white shadow-2xs' 
                        : 'bg-[#022a5b]/10 text-[#022a5b] border border-[#022a5b]/20'
                    }`}>
                      {item.id}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200 font-mono">
                      {item.code}
                    </span>
                  </div>

                  {captured && (
                    <span className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shadow-xs">
                      <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                    </span>
                  )}
                </div>

                {/* Photo preview or guide box */}
                {captured ? (
                  <div className="relative flex-1 min-h-36 bg-slate-100 overflow-hidden">
                    <img
                      src={typeof img === 'object' ? img.url : img}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="relative flex flex-col bg-white overflow-hidden group">
                    {/* Top: Wireframe Sketch Outline using CSS */}
                    <div className="relative h-40 w-full overflow-hidden bg-slate-50 border-b border-slate-100 flex items-center justify-center">
                      <img 
                        src={getExampleImage(item.id)} 
                        alt={`Example ${item.title}`} 
                        className="w-full h-full object-contain scale-[1.15] sm:scale-100 sm:object-cover mix-blend-multiply opacity-25 grayscale contrast-150 brightness-110 group-hover:opacity-40 transition-opacity duration-300" 
                      />
                      {/* Subdued Outline Badge */}
                      <div className="absolute top-2 left-2 bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-500 px-2 py-1 rounded text-[8px] font-bold uppercase tracking-wider">
                        Expected Angle
                      </div>
                    </div>
                    
                    {/* Bottom: Text Content */}
                    <div className="p-3.5 flex flex-col items-center text-center gap-1">
                      <span className="text-xs font-bold text-slate-800">{item.title}</span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {item.guide}
                      </span>
                    </div>
                  </div>
                )}

                {/* Actions (Always at bottom) */}
                <div className="p-2.5 z-10 bg-slate-50 border-t border-slate-100 flex flex-col gap-1.5 mt-auto">
                  <div className={`grid gap-1.5 ${hasCamera ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {hasCamera && (
                      <label
                        htmlFor={`cam-input-${item.id}`}
                        className="min-h-9 py-1.5 px-2 bg-[#022a5b] hover:bg-[#033b7e] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors active:scale-95 shadow-xs"
                      >
                        <Camera className="w-3.5 h-3.5 text-white" />
                        <span>Camera</span>
                      </label>
                    )}
                    <label
                      htmlFor={`gal-input-${item.id}`}
                      className="min-h-9 py-1.5 px-2 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors active:scale-95 border border-slate-200 shadow-sm"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                      <span>{hasCamera ? 'Gallery' : 'Upload'}</span>
                    </label>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Driver Details & Terms Consent (Free Tool Lead-Gen Protocol) */}
        <div className="mt-2 pt-5 border-t border-slate-200/80 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <User className="w-4 h-4 text-[#022a5b]" />
                <span>Driver & Inspection Details</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Enter your details to receive your official certified inspection report directly via email.
              </p>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 self-start sm:self-auto">
              100% Free · No Payment Required
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* First Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                First Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. John"
                  value={userInfo.firstName || ''}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  onBlur={(e) => handleInputBlur('firstName', e.target.value)}
                  className={`w-full h-11 px-3.5 pr-8 bg-slate-50 border rounded-xl text-xs sm:text-sm text-slate-800 transition-all focus:bg-white focus:outline-none focus:ring-2 ${
                    touched.firstName && errors.firstName
                      ? 'border-red-400 bg-red-50/20 focus:ring-red-400'
                      : isFirstNameValid
                      ? 'border-emerald-300 focus:ring-emerald-500'
                      : 'border-slate-200 focus:ring-[#022a5b]'
                  }`}
                />
                {isFirstNameValid && (
                  <Check className="w-4 h-4 text-emerald-600 absolute right-3 top-3.5 pointer-events-none stroke-[2.5]" />
                )}
              </div>
              {touched.firstName && errors.firstName && (
                <p className="text-[11px] text-red-600 font-medium mt-1">
                  {errors.firstName}
                </p>
              )}
            </div>

            {/* Last Name / Surname */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Last Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Doe"
                  value={userInfo.surname || ''}
                  onChange={(e) => handleInputChange('surname', e.target.value)}
                  onBlur={(e) => handleInputBlur('surname', e.target.value)}
                  className={`w-full h-11 px-3.5 pr-8 bg-slate-50 border rounded-xl text-xs sm:text-sm text-slate-800 transition-all focus:bg-white focus:outline-none focus:ring-2 ${
                    touched.surname && errors.surname
                      ? 'border-red-400 bg-red-50/20 focus:ring-red-400'
                      : isSurnameValid
                      ? 'border-emerald-300 focus:ring-emerald-500'
                      : 'border-slate-200 focus:ring-[#022a5b]'
                  }`}
                />
                {isSurnameValid && (
                  <Check className="w-4 h-4 text-emerald-600 absolute right-3 top-3.5 pointer-events-none stroke-[2.5]" />
                )}
              </div>
              {touched.surname && errors.surname && (
                <p className="text-[11px] text-red-600 font-medium mt-1">
                  {errors.surname}
                </p>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="e.g. john.doe@example.com"
                  value={userInfo.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  onBlur={(e) => handleInputBlur('email', e.target.value)}
                  className={`w-full h-11 px-3.5 pr-8 bg-slate-50 border rounded-xl text-xs sm:text-sm text-slate-800 transition-all focus:bg-white focus:outline-none focus:ring-2 ${
                    touched.email && errors.email
                      ? 'border-red-400 bg-red-50/20 focus:ring-red-400'
                      : isEmailValid
                      ? 'border-emerald-300 focus:ring-emerald-500'
                      : 'border-slate-200 focus:ring-[#022a5b]'
                  }`}
                />
                {isEmailValid && (
                  <Check className="w-4 h-4 text-emerald-600 absolute right-3 top-3.5 pointer-events-none stroke-[2.5]" />
                )}
              </div>
              {touched.email && errors.email && (
                <p className="text-[11px] text-red-600 font-medium mt-1">
                  {errors.email}
                </p>
              )}
            </div>
          </div>

          {/* Terms & Conditions Checkbox */}
          <div 
            ref={termsRef}
            className={`p-3 sm:p-3.5 rounded-xl border transition-all ${
              termsError
                ? 'bg-red-50/40 border-red-300 ring-1 ring-red-300/50'
                : 'bg-slate-50 border-slate-200/80'
            }`}
          >
            <label htmlFor="terms-checkbox" className="flex items-start gap-2.5 sm:gap-3 cursor-pointer text-[11px] sm:text-xs text-slate-700 select-none">
              <Checkbox
                id="terms-checkbox"
                checked={termsAccepted}
                onCheckedChange={(checked) => {
                  const val = Boolean(checked);
                  if (setTermsAccepted) {
                    setTermsAccepted(val);
                  }
                  if (val) {
                    setTermsError('');
                  } else if (termsTouched) {
                    setTermsError('Please accept the CarInsuRent Terms and Conditions to proceed.');
                  }
                }}
                className={`mt-0.5 ${termsError ? 'border-red-400' : ''}`}
              />
              <span className="leading-relaxed">
                I have read & accept the{' '}
                <a
                  href="https://carinsurent.com/rental-car-damage-scanner-terms-and-conditions/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#022a5b] font-bold underline hover:text-[#033c80]"
                  onClick={(e) => e.stopPropagation()}
                >
                  CarInsuRent Car Rental Damage Scanner Terms and Conditions
                </a>
                . By clicking the button you accept the Terms and{' '}
                <a
                  href="https://carinsurent.com/privacy-policy/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#022a5b] font-bold underline hover:text-[#033c80]"
                  onClick={(e) => e.stopPropagation()}
                >
                  Privacy Policy
                </a>
                .
              </span>
            </label>
            {termsError && (
              <p className="text-[11px] text-red-600 font-medium mt-2 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{termsError}</span>
              </p>
            )}
          </div>
        </div>

        {/* Footer Actions: Button is always visible, disabled until form fields are filled & photos selected */}
        <div className="pt-2 flex flex-col gap-2">
          <button
            onClick={handleRunInspection}
            disabled={!isFormValid || capturedCount === 0 || isUploading}
            className={`w-full min-h-12 sm:min-h-13 px-4 sm:px-6 py-3 font-extrabold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 transition-all shadow-md ${
              isUploading 
                ? 'bg-[#022a5b] text-white cursor-wait opacity-90' 
                : (!isFormValid || capturedCount === 0)
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none border border-slate-300/60' 
                  : 'bg-gradient-to-r from-[#022a5b] via-[#033c80] to-[#022a5b] hover:from-[#033c80] hover:to-[#022a5b] text-white cursor-pointer active:scale-98 shadow-[#022a5b]/20'
            }`}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white shrink-0" />
                <span>Processing Vehicle Inspection…</span>
              </>
            ) : (
              <>
                <span className="hidden sm:inline">Run AI Damage Inspection ({capturedCount}/14 Photos Captured)</span>
                <span className="inline sm:hidden">Run AI Damage Inspection ({capturedCount}/14)</span>
                <ChevronRight className={`w-4 h-4 shrink-0 ${(!isFormValid || capturedCount === 0) ? 'text-slate-400' : 'text-white'}`} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
    </>
  );
}
