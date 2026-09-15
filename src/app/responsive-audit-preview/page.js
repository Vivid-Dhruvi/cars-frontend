'use client';
import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import CarMapResults from '@/components/CarMapResults';
import PaywallForm from '@/components/PaywallForm';
import UnlockedReport from '@/components/UnlockedReport';
const placeholderImg = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><rect width="600" height="400" fill="#cbd5e1"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#64748b" font-size="20" font-family="sans-serif">Vehicle Photo</text></svg>');

export default function Preview() {
  const [mode, setMode] = useState('loading');
  const [variant, setVariant] = useState('normal');
  const [user, setUser] = useState({name:'Responsive Test',email:'responsive.test@example.com'});
  useEffect(()=>{const q=new URLSearchParams(window.location.search);setMode(q.get('mode')||'results');setVariant(q.get('case')||'normal');if(q.get('case')==='long')setUser({name:'Responsive Test',email:'averylongemailaddress.for.responsive.verification@example.com'});},[]);
  const findings = Array.from({length:variant==='empty'?0:variant==='long'?20:4},(_,i)=>({finding_id:`TEST-${i}`,vehicle_part:variant==='long'?'rear_left_quarter_panel_with_extended_description':['front_bumper','rear_left_wheel','driver_door','windshield'][i%4],damage_type:'scratch',severity:i%2?'Minor':'Moderate',confidence:0,supporting_images:['IMAGE_01'],bounding_boxes:[{image_id:'IMAGE_02',box:[150,200,500,600]}],description:'Sample finding for responsive layout review only.'}));
  const portrait='data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="300" height="800"><rect width="300" height="800" fill="#94a3b8"/><rect x="60" y="120" width="120" height="280" fill="#fff"/></svg>');
  const photos={'01':placeholderImg,'02':variant==='portrait'?portrait:placeholderImg};
  return <div data-audit-mode={mode} data-audit-case={variant} className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased flex flex-col items-center justify-start pb-12">
    <Header setCurrentStep={()=>{}} />
    <main className="w-full max-w-6xl px-4 md:px-8 pt-6">
      {mode==='results'&&<CarMapResults vehicleData={{makeModel:'Hyundai i30',plateNumber:'TEST-123'}} analysisResults={{findings}} photos={photos} setCurrentStep={setMode}/>}
      {mode==='paywall'&&<PaywallForm userInfo={user} setUserInfo={setUser} activeInspectionId={null} isProcessingPayment={false} setIsProcessingPayment={()=>{}} setCurrentStep={()=>{}}/>}
      {mode==='unlocked'&&<UnlockedReport userInfo={user} analysisResults={{findings}} activeInspectionId={null} photos={photos}/>}
    </main>
  </div>;
}
