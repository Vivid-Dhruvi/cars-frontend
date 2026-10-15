'use client';

import React, { useState, useEffect, useRef } from 'react';

/* ─── Menu data extracted from live WordPress (carinsurent.com) ─── */
/* Note: As per requirements, Login and Country Selection are excluded. */
const MENU_ITEMS = [
  {
    label: 'Car Rental Insurance',
    href: 'https://carinsurent.com/car-rental-insurance/',
    children: [
      { label: 'Australia Car Rental Insurance', href: 'https://carinsurent.com/car-hire-excess-insurance/rental-car-insurance-in-australia/' },
      { label: 'Car Rental Insurance Spain', href: 'https://carinsurent.com/car-rental-insurance/car-rental-insurance-spain-what-is-it-how-does-it-work/' },
      { label: 'Rental Car Insurance Ireland', href: 'https://carinsurent.com/car-rental-insurance/car-rental-insurance-for-ireland-do-you-need-one-and-how-does-it-work/' },
      { label: 'International Car Rental Insurance', href: 'https://carinsurent.com/guides/car-rental-insurance-guides/essential-guide-to-international-car-rental-insurance-coverage-and-costs/' },
      { label: 'What is Rental Car Insurance? How does it Work?', href: 'https://carinsurent.com/car-rental-insurance/rental-car-insurance-what-is-it-how-does-it-work/' },
    ],
  },
  {
    label: 'Car Hire Excess Insurance',
    href: 'https://carinsurent.com/car-hire-excess-insurance/',
    children: [
      { label: 'Annual Car Hire Excess Insurance', href: 'https://carinsurent.com/guides/car-hire-excess/annual-car-hire-excess-insurance/' },
      { label: 'Car Hire Excess Insurance Europe', href: 'https://carinsurent.com/car-hire-excess-insurance/car-hire-insurance-in-europe/' },
      { label: 'Car Hire Excess Insurance Worldwide', href: 'https://carinsurent.com/car-hire-excess-insurance/worldwide-car-hire-excess-insurance/' },
      { label: 'Car Hire Excess Insurance UK', href: 'https://carinsurent.com/car-rental-insurance/car-hire-excess-insurance-uk-what-is-it-how-does-it-work/' },
      { label: 'Car Hire Excess Insurance USA & Canada (Essential Guide)', href: 'https://carinsurent.com/car-hire-excess-insurance/your-guide-to-usa-and-canada-car-rental-excess-insurance/' },
      { label: 'Motorhome/Campervan Hire Excess Insurance', href: 'https://carinsurent.com/guides/car-hire-excess/motorhome-hire-excess-insurance/' },
    ],
  },
  {
    label: 'Car Rental',
    href: 'https://carinsurent.com/car-rental/',
    children: null,
  },
  {
    label: 'Policy & Claims',
    href: '#',
    children: [
      { label: 'Policy Wording', href: 'https://carinsurent.com/policy-wording/' },
      { label: 'Claims', href: 'https://carinsurent.com/claims/' },
    ],
  },
  {
    label: 'About Us',
    href: 'https://carinsurent.com/about-us/',
    children: null,
  },
];

/* ─── Desktop Dropdown Menu Item ─── */
function DesktopMenuItem({ item }) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef(null);
  const hasChildren = item.children && item.children.length > 0;

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 120);
  };

  return (
    <li
      className="relative list-none m-0 h-full flex items-center shrink-0"
      onMouseEnter={hasChildren ? handleMouseEnter : undefined}
      onMouseLeave={hasChildren ? handleMouseLeave : undefined}
    >
      <a
        href={item.href}
        className="px-3 h-full text-[14px] font-normal leading-4 text-[#00244F] uppercase text-center inline-flex items-center whitespace-nowrap font-['Roboto',sans-serif] hover:text-[#00244F] transition-colors"
        onClick={item.href === '#' ? (e) => e.preventDefault() : undefined}
      >
        <span>{item.label}</span>
        {hasChildren && (
          <svg
            width="13"
            height="8"
            viewBox="0 0 13 8"
            fill="none"
            className="ml-2.25 shrink-0 pointer-events-none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1 1.5L6.5 6.5L12 1.5"
              stroke="#00244F"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </a>

      {/* Dropdown Menu matching exact WordPress word wrap and parent width */}
      {hasChildren && open && (
        <ul
          className="max-w-56 absolute top-full left-0 mt-2.5 py-2.5 px-0 bg-[#183B56] z-50 text-left list-none shadow-none rounded-none border-0 before:content-[''] before:absolute before:-top-2.5 before:left-0 before:w-full before:h-2.5"
        >
          {item.children.map((child) => (
            <li key={child.href} className="m-0 list-none">
              <a
                href={child.href}
                className="block px-3.75 py-2.5 text-[14px] leading-4 text-white uppercase text-left font-normal font-['Roboto',sans-serif] hover:bg-[#2D9CDB] transition-colors"
              >
                {child.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

/* ─── Mobile Accordion Menu Item ─── */
function MobileMenuItem({ item, onClose }) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  return (
    <li className="list-none m-0 border-b border-slate-100 last:border-b-0">
      <div className="flex items-center justify-between">
        <a
          href={item.href}
          className="flex-1 px-7.5 py-2.5 text-base leading-6 font-medium text-[#00244F] uppercase text-left font-['Roboto',sans-serif]"
          onClick={(e) => {
            if (item.href === '#') {
              e.preventDefault();
              if (hasChildren) setExpanded(!expanded);
            } else {
              onClose();
            }
          }}
        >
          {item.label}
        </a>
        {hasChildren && (
          <button
            type="button"
            className="px-6.25 py-3 text-[#00244F] cursor-pointer"
            onClick={() => setExpanded(!expanded)}
            aria-label={expanded ? 'Collapse submenu' : 'Expand submenu'}
          >
            <svg
              width="13"
              height="8"
              viewBox="0 0 13 8"
              fill="none"
              className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1 1.5L6.5 6.5L12 1.5"
                stroke="#00244F"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Mobile Submenu matching WordPress dark blue */}
      {hasChildren && expanded && (
        <ul className="w-[calc(100%-60px)] mx-auto my-1.25 py-2.5 px-0 bg-[#183B56] list-none">
          {item.children.map((child) => (
            <li key={child.href} className="m-0 list-none">
              <a
                href={child.href}
                className="block px-6.25 py-2.5 text-[14px] leading-5 text-white uppercase text-left font-normal font-['Roboto',sans-serif] hover:bg-[#2D9CDB] transition-colors"
                onClick={onClose}
              >
                {child.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN HEADER — Exact CarInsuRent WordPress replication
   - Dimensions: 1440 × 59.16px on desktop (Padding 17px 0px, content 25.16px)
   - Mobile: 60px height (Padding 10px 0px, content 40px)
   - Background: #FFFFFF
   - Container: 90% width, max-width: 1370px, px: 15px
   - Logo: width: 160px, height: 25.16px
   - Nav: 14px uppercase #00244F, 12px horizontal padding
   - Dropdown: #183B56 dark navy background, white text with word wrap
   - Mobile hamburger: 30×2px bars, transforms to X
   - Excludes Login & Country Selector as instructed
   ═══════════════════════════════════════════════════════════════════ */
export default function Header({ setCurrentStep, currentStep }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on resize to desktop (breakpoint: 1280px)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1280 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileMenuOpen]);

  const handleLogoClick = () => {
    try {
      localStorage.removeItem('carsinsure_step');
      localStorage.removeItem('carsinsure_active_inspection_id');
      localStorage.removeItem('carsinsure_analysis_results');
      localStorage.removeItem('carsinsure_photos');
      localStorage.removeItem('carsinsure_vehicle_data');
      localStorage.removeItem('carsinsure_pending_inspection_id');
      localStorage.removeItem('carsinsure_user_name');
      localStorage.removeItem('carsinsure_user_email');
    } catch (e) {}
    if (typeof setCurrentStep === 'function') {
      setCurrentStep('checklist');
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 w-full bg-white z-50 h-15 xl:h-[59.16px] py-2.5 xl:py-4.25 box-border">
        {/* Inner Container: 90% width, max-width 1370px, 15px padding, height 25.16px */}
        <div className="w-full xl:w-[90%] max-w-342.5 mx-auto px-3.75 h-10 xl:h-[25.16px] flex items-center justify-between relative box-border">
          
          {/* Logo (.header-logo: 160px width, 25.16px height) */}
          <div className="header-logo shrink-0 flex items-center">
            <a
              href="https://carinsurent.com/"
              className="block cursor-pointer"
              aria-label="CarInsuRent"
            >
              <img
                src="/car-rental-damage-scanner/logo-ai.svg?v=5" 
                alt="CarInsurent"
                className="block w-40 h-[25.16px]"
                width="160"
                height="25.16"
              />
            </a>
          </div>

          {/* Desktop Navigation (.main-menu, visible at > 1280px i.e. xl:) */}
          <div className="main-menu hidden xl:flex items-center ml-6.25 h-full">
            <nav aria-label="Main menu" className="h-full">
              <ul className="flex items-center m-0 p-0 list-none h-full">
                {MENU_ITEMS.map((item) => (
                  <DesktopMenuItem key={item.label} item={item} />
                ))}
              </ul>
            </nav>
          </div>

          {/* Mobile Hamburger (.nav-moblie, visible at <= 1280px) */}
          <button
            type="button"
            className={`nav-moblie xl:hidden relative w-10 h-10 flex items-center justify-center cursor-pointer ml-auto z-50 bg-transparent border-0 p-0 focus:outline-none ${
              mobileMenuOpen ? 'close-btn' : ''
            }`}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={mobileMenuOpen}
          >
            <div className="w-9 h-10 flex flex-col items-center justify-center pointer-events-none">
              <div
                className={`w-[50%] h-0.5 bg-black rounded-sm transition-all duration-300 origin-left translate-y-[0.45rem] ${
                  mobileMenuOpen ? '-rotate-45' : ''
                }`}
              />
              <div
                className={`w-[50%] h-0.5 bg-black rounded-md transition-all duration-300 origin-center ${
                  mobileMenuOpen ? 'hidden opacity-0' : ''
                }`}
              />
              <div
                className={`w-[50%] h-0.5 bg-black rounded-md transition-all duration-300 origin-left translate-y-[-0.45rem] ${
                  mobileMenuOpen ? 'rotate-45' : ''
                }`}
              />
            </div>
          </button>
        </div>

        {/* Mobile Dropdown Menu (slides down across full width beneath header) */}
        {mobileMenuOpen && (
          <div className="main-menu xl:hidden absolute top-full left-0 w-full bg-white z-40 border-t border-slate-100 shadow-[0_10px_25px_rgba(0,0,0,0.08)] max-h-[calc(100vh-60px)] overflow-y-auto">
            <nav className="w-full bg-white py-5.5" aria-label="Mobile menu">
              <ul className="flex flex-col m-0 p-0 list-none">
                {MENU_ITEMS.map((item) => (
                  <MobileMenuItem
                    key={item.label}
                    item={item}
                    onClose={() => setMobileMenuOpen(false)}
                  />
                ))}
              </ul>
            </nav>
          </div>
        )}
      </header>

      {/* Backdrop overlay for mobile menu */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 xl:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
