import React from 'react';

/**
 * 5-Panel Unfolded Automotive Blueprint Vectors
 * 100% Pure SVG implementation matching standard vehicle inspection schematic:
 *   - Front View (top): headlights, grille, bumper, tires
 *   - Center Body (top-down): hood, windshield, panoramic roof, rear window, trunk
 *   - Left Side Profile: front wheel & arch, driver front/rear doors & windows, rear wheel & arch
 *   - Right Side Profile: front wheel & arch, passenger front/rear doors & windows, rear wheel & arch
 *   - Rear View (bottom): taillights, license plate, bumper, exhaust, tires
 *
 * viewBox: 0 0 440 560
 */
export default function VehicleBlueprintVectors() {
  return (
    <>
      <defs>
        <filter id="panel-shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#0F172A" floodOpacity="0.10" />
        </filter>
        <linearGradient id="blueprintGlass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#BAE6FD" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#7DD3FC" stopOpacity="0.95" />
        </linearGradient>
      </defs>

      {/* Blueprint Grid Lines */}
      <g opacity="0.25" stroke="#94A3B8" strokeWidth="0.6">
        <line x1="56" y1="0" x2="56" y2="560" strokeDasharray="4 4" />
        <line x1="152" y1="0" x2="152" y2="560" strokeDasharray="4 4" />
        <line x1="220" y1="0" x2="220" y2="560" strokeDasharray="3 3" strokeWidth="0.8" />
        <line x1="288" y1="0" x2="288" y2="560" strokeDasharray="4 4" />
        <line x1="384" y1="0" x2="384" y2="560" strokeDasharray="4 4" />
        <line x1="0" y1="95" x2="440" y2="95" strokeDasharray="4 4" />
        <line x1="0" y1="215" x2="440" y2="215" strokeDasharray="4 4" />
        <line x1="0" y1="335" x2="440" y2="335" strokeDasharray="4 4" />
        <line x1="0" y1="445" x2="440" y2="445" strokeDasharray="4 4" />
      </g>

      {/* Fold / Projection Hinge Lines */}
      <g stroke="#94A3B8" strokeWidth="1" strokeDasharray="3 3">
        <line x1="175" y1="95" x2="175" y2="82" />
        <line x1="265" y1="95" x2="265" y2="82" />
        <line x1="175" y1="445" x2="175" y2="458" />
        <line x1="265" y1="445" x2="265" y2="458" />
        <line x1="160" y1="215" x2="152" y2="215" />
        <line x1="160" y1="335" x2="152" y2="335" />
        <line x1="280" y1="215" x2="288" y2="215" />
        <line x1="280" y1="335" x2="288" y2="335" />
      </g>

      {/* 1. FRONT VIEW PANEL (Folded Up) */}
      <g id="panel-front" filter="url(#panel-shadow)">
        {/* Front Tires */}
        <rect x="144" y="16" width="16" height="36" rx="4" fill="#334155" stroke="#1E293B" strokeWidth="1.2" />
        <rect x="280" y="16" width="16" height="36" rx="4" fill="#334155" stroke="#1E293B" strokeWidth="1.2" />
        
        {/* Front Body Silhouette */}
        <path d="M 156 80 L 156 46 C 156 36, 170 30, 220 30 C 270 30, 284 36, 284 46 L 284 80 Z" 
              fill="#F1F5F9" stroke="#334155" strokeWidth="1.6" />
        
        {/* Front Windshield from front */}
        <path d="M 172 38 C 185 34, 255 34, 268 38 L 265 52 L 175 52 Z" 
              fill="url(#blueprintGlass)" stroke="#334155" strokeWidth="1.2" />
              
        {/* Headlights */}
        <path d="M 158 58 L 176 58 L 174 68 L 160 68 Z" fill="#FEF08A" stroke="#334155" strokeWidth="1.2" />
        <path d="M 282 58 L 264 58 L 266 68 L 280 68 Z" fill="#FEF08A" stroke="#334155" strokeWidth="1.2" />
        
        {/* Front Grille */}
        <rect x="185" y="58" width="70" height="12" rx="3" fill="#64748B" stroke="#334155" strokeWidth="1" />
        <line x1="190" y1="62" x2="250" y2="62" stroke="#CBD5E1" strokeWidth="0.8" />
        <line x1="190" y1="66" x2="250" y2="66" stroke="#CBD5E1" strokeWidth="0.8" />
        
        {/* Bumper & License Plate */}
        <rect x="156" y="72" width="128" height="8" rx="2" fill="#94A3B8" stroke="#334155" strokeWidth="1" />
        <rect x="205" y="73" width="30" height="6" rx="1" fill="#FFFFFF" stroke="#64748B" strokeWidth="0.6" />
      </g>

      {/* 2. REAR VIEW PANEL (Folded Down) */}
      <g id="panel-rear" filter="url(#panel-shadow)">
        {/* Rear Tires */}
        <rect x="144" y="500" width="16" height="36" rx="4" fill="#334155" stroke="#1E293B" strokeWidth="1.2" />
        <rect x="280" y="500" width="16" height="36" rx="4" fill="#334155" stroke="#1E293B" strokeWidth="1.2" />
        
        {/* Rear Body Silhouette */}
        <path d="M 156 460 L 156 504 C 156 514, 170 520, 220 520 C 270 520, 284 514, 284 504 L 284 460 Z" 
              fill="#F1F5F9" stroke="#334155" strokeWidth="1.6" />
              
        {/* Rear Windshield from behind */}
        <path d="M 174 464 L 266 464 L 263 478 L 177 478 Z" 
              fill="url(#blueprintGlass)" stroke="#334155" strokeWidth="1.2" />
              
        {/* Taillights */}
        <rect x="158" y="482" width="22" height="12" rx="2" fill="#DC2626" stroke="#991B1B" strokeWidth="1" />
        <rect x="260" y="482" width="22" height="12" rx="2" fill="#DC2626" stroke="#991B1B" strokeWidth="1" />
        <rect x="160" y="487" width="8" height="5" rx="1" fill="#F59E0B" />
        <rect x="272" y="487" width="8" height="5" rx="1" fill="#F59E0B" />

        {/* License Plate Recess & Plate */}
        <rect x="198" y="482" width="44" height="14" rx="2" fill="#94A3B8" stroke="#334155" strokeWidth="0.8" />
        <rect x="204" y="485" width="32" height="8" rx="1" fill="#FFFFFF" stroke="#64748B" strokeWidth="0.6" />
        
        {/* Rear Bumper & Reflectors */}
        <rect x="156" y="498" width="128" height="8" rx="2" fill="#94A3B8" stroke="#334155" strokeWidth="1" />
        <rect x="164" y="500" width="10" height="3" rx="1" fill="#EF4444" />
        <rect x="266" y="500" width="10" height="3" rx="1" fill="#EF4444" />
        <circle cx="178" cy="510" r="3" fill="#475569" stroke="#1E293B" strokeWidth="0.8" />
        <circle cx="262" cy="510" r="3" fill="#475569" stroke="#1E293B" strokeWidth="0.8" />
      </g>

      {/* 3. CENTER BODY (Top-Down View) */}
      <g id="panel-center" filter="url(#panel-shadow)">
        <path d="M 170 95 C 170 90, 270 90, 270 95 L 278 175 C 283 220, 283 330, 278 375 L 270 445 C 270 448, 170 448, 170 445 L 162 375 C 157 330, 157 220, 162 175 Z" 
              fill="#F1F5F9" stroke="#334155" strokeWidth="1.8" />

        {/* Hood Crease Lines & Front Bumper Seam */}
        <path d="M 174 105 L 266 105" stroke="#94A3B8" strokeWidth="0.8" />
        <path d="M 188 105 C 188 135, 192 165, 194 175" stroke="#CBD5E1" strokeWidth="1" />
        <path d="M 252 105 C 252 135, 248 165, 246 175" stroke="#CBD5E1" strokeWidth="1" />

        {/* Front Windshield */}
        <path d="M 176 178 C 190 172, 250 172, 264 178 L 260 215 C 248 212, 192 212, 180 215 Z" 
              fill="url(#blueprintGlass)" stroke="#334155" strokeWidth="1.2" />

        {/* Roof Surface */}
        <rect x="178" y="222" width="84" height="106" rx="6" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="0.8" />
        
        {/* Sunroof / Panoramic Glass */}
        <rect x="194" y="236" width="52" height="42" rx="4" fill="url(#blueprintGlass)" stroke="#334155" strokeWidth="1" />
        <line x1="184" y1="226" x2="184" y2="322" stroke="#94A3B8" strokeWidth="1" strokeLinecap="round" />
        <line x1="256" y1="226" x2="256" y2="322" stroke="#94A3B8" strokeWidth="1" strokeLinecap="round" />

        {/* Rear Windshield */}
        <path d="M 180 335 C 192 338, 248 338, 260 335 L 264 372 C 250 376, 190 376, 176 372 Z" 
              fill="url(#blueprintGlass)" stroke="#334155" strokeWidth="1.2" />

        {/* Trunk Seam & Deck */}
        <path d="M 174 380 L 266 380" stroke="#94A3B8" strokeWidth="0.8" />
        <path d="M 188 385 C 190 415, 250 415, 252 385" stroke="#CBD5E1" strokeWidth="0.8" fill="none" />
        <line x1="205" y1="428" x2="235" y2="428" stroke="#94A3B8" strokeWidth="1.2" strokeLinecap="round" />

        {/* Side Mirrors from above */}
        <ellipse cx="157" cy="188" rx="5" ry="3" fill="#64748B" stroke="#334155" strokeWidth="0.8" />
        <ellipse cx="283" cy="188" rx="5" ry="3" fill="#64748B" stroke="#334155" strokeWidth="0.8" />
      </g>

      {/* 4. LEFT SIDE PROFILE (Folded Out to the Left) */}
      <g id="panel-left-side" filter="url(#panel-shadow)">
        {/* Left Side Body Silhouette */}
        <path d="M 125 95 L 98 98 C 92 100, 86 106, 82 116 L 80 122 C 80 122, 54 122, 54 145 C 54 168, 80 168, 80 168 L 80 372 C 80 372, 54 372, 54 395 C 54 418, 80 418, 80 418 L 82 424 C 86 434, 92 440, 98 442 L 125 445 L 132 375 L 152 335 L 152 215 L 132 175 Z" 
              fill="#F1F5F9" stroke="#334155" strokeWidth="1.8" />

        {/* Front Wheel */}
        <circle cx="56" cy="145" r="22" fill="#334155" stroke="#1E293B" strokeWidth="1.5" />
        <circle cx="56" cy="145" r="14" fill="#E2E8F0" stroke="#475569" strokeWidth="1.2" />
        <circle cx="56" cy="145" r="5" fill="#94A3B8" stroke="#334155" strokeWidth="0.8" />
        <line x1="56" y1="131" x2="56" y2="159" stroke="#64748B" strokeWidth="1" />
        <line x1="42" y1="145" x2="70" y2="145" stroke="#64748B" strokeWidth="1" />

        {/* Rear Wheel */}
        <circle cx="56" cy="395" r="22" fill="#334155" stroke="#1E293B" strokeWidth="1.5" />
        <circle cx="56" cy="395" r="14" fill="#E2E8F0" stroke="#475569" strokeWidth="1.2" />
        <circle cx="56" cy="395" r="5" fill="#94A3B8" stroke="#334155" strokeWidth="0.8" />
        <line x1="56" y1="381" x2="56" y2="409" stroke="#64748B" strokeWidth="1" />
        <line x1="42" y1="395" x2="70" y2="395" stroke="#64748B" strokeWidth="1" />

        {/* Window Beltline */}
        <line x1="112" y1="180" x2="112" y2="370" stroke="#334155" strokeWidth="1.5" />

        {/* Front Door Window */}
        <path d="M 116 186 L 146 216 L 146 270 L 116 270 Z" 
              fill="url(#blueprintGlass)" stroke="#334155" strokeWidth="1.2" />

        {/* Rear Door Window */}
        <path d="M 116 276 L 146 276 L 146 332 L 116 364 Z" 
              fill="url(#blueprintGlass)" stroke="#334155" strokeWidth="1.2" />

        {/* B-Pillar Divider */}
        <line x1="112" y1="273" x2="150" y2="273" stroke="#334155" strokeWidth="2.2" strokeLinecap="round" />

        {/* Door Seams */}
        <path d="M 80 170 L 96 174 L 112 180" stroke="#94A3B8" strokeWidth="1.2" />
        <line x1="80" y1="273" x2="112" y2="273" stroke="#94A3B8" strokeWidth="1.2" />
        <path d="M 80 370 L 96 366 L 112 364" stroke="#94A3B8" strokeWidth="1.2" />

        {/* Door Handles */}
        <rect x="94" y="235" width="10" height="3.5" rx="1.5" fill="#64748B" stroke="#334155" strokeWidth="0.6" />
        <rect x="94" y="300" width="10" height="3.5" rx="1.5" fill="#64748B" stroke="#334155" strokeWidth="0.6" />

        {/* Driver Side Mirror */}
        <path d="M 132 178 L 140 172 L 142 178 Z" fill="#64748B" stroke="#334155" strokeWidth="0.8" />
      </g>

      {/* 5. RIGHT SIDE PROFILE (Folded Out to the Right) */}
      <g id="panel-right-side" filter="url(#panel-shadow)">
        {/* Right Side Body Silhouette */}
        <path d="M 315 95 L 342 98 C 348 100, 354 106, 358 116 L 360 122 C 360 122, 386 122, 386 145 C 386 168, 360 168, 360 168 L 360 372 C 360 372, 386 372, 386 395 C 386 418, 360 418, 360 418 L 358 424 C 354 434, 348 440, 342 442 L 315 445 L 308 375 L 288 335 L 288 215 L 308 175 Z" 
              fill="#F1F5F9" stroke="#334155" strokeWidth="1.8" />

        {/* Front Wheel */}
        <circle cx="384" cy="145" r="22" fill="#334155" stroke="#1E293B" strokeWidth="1.5" />
        <circle cx="384" cy="145" r="14" fill="#E2E8F0" stroke="#475569" strokeWidth="1.2" />
        <circle cx="384" cy="145" r="5" fill="#94A3B8" stroke="#334155" strokeWidth="0.8" />
        <line x1="384" y1="131" x2="384" y2="159" stroke="#64748B" strokeWidth="1" />
        <line x1="370" y1="145" x2="398" y2="145" stroke="#64748B" strokeWidth="1" />

        {/* Rear Wheel */}
        <circle cx="384" cy="395" r="22" fill="#334155" stroke="#1E293B" strokeWidth="1.5" />
        <circle cx="384" cy="395" r="14" fill="#E2E8F0" stroke="#475569" strokeWidth="1.2" />
        <circle cx="384" cy="395" r="5" fill="#94A3B8" stroke="#334155" strokeWidth="0.8" />
        <line x1="384" y1="381" x2="384" y2="409" stroke="#64748B" strokeWidth="1" />
        <line x1="370" y1="395" x2="398" y2="395" stroke="#64748B" strokeWidth="1" />

        {/* Window Beltline */}
        <line x1="328" y1="180" x2="328" y2="370" stroke="#334155" strokeWidth="1.5" />

        {/* Passenger Front Door Window */}
        <path d="M 324 186 L 294 216 L 294 270 L 324 270 Z" 
              fill="url(#blueprintGlass)" stroke="#334155" strokeWidth="1.2" />

        {/* Passenger Rear Door Window */}
        <path d="M 324 276 L 294 276 L 294 332 L 324 364 Z" 
              fill="url(#blueprintGlass)" stroke="#334155" strokeWidth="1.2" />

        {/* B-Pillar Divider */}
        <line x1="328" y1="273" x2="290" y2="273" stroke="#334155" strokeWidth="2.2" strokeLinecap="round" />

        {/* Door Seams */}
        <path d="M 360 170 L 344 174 L 328 180" stroke="#94A3B8" strokeWidth="1.2" />
        <line x1="360" y1="273" x2="328" y2="273" stroke="#94A3B8" strokeWidth="1.2" />
        <path d="M 360 370 L 344 366 L 328 364" stroke="#94A3B8" strokeWidth="1.2" />

        {/* Door Handles */}
        <rect x="336" y="235" width="10" height="3.5" rx="1.5" fill="#64748B" stroke="#334155" strokeWidth="0.6" />
        <rect x="336" y="300" width="10" height="3.5" rx="1.5" fill="#64748B" stroke="#334155" strokeWidth="0.6" />

        {/* Passenger Side Mirror */}
        <path d="M 308 178 L 300 172 L 298 178 Z" fill="#64748B" stroke="#334155" strokeWidth="0.8" />
      </g>
    </>
  );
}
