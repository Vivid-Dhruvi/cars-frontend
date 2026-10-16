// Who may embed the admin dashboard in an iframe. Default 'self' = only pages on the same origin
// (the WordPress admin at carinsurent.com). For local testing set e.g. ADMIN_FRAME_ANCESTORS="'self' http://carlive.local"
const adminFrameAncestors = process.env.ADMIN_FRAME_ANCESTORS || "'self'";

const adminSecurityHeaders = [
  { key: 'Content-Security-Policy', value: `frame-ancestors ${adminFrameAncestors}` },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'no-referrer' },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/car-rental-damage-scanner',
  // Applies to /car-rental-damage-scanner/admin and everything under it only; public pages are unchanged.
  async headers() {
    return [
      { source: '/admin', headers: adminSecurityHeaders },
      { source: '/admin/:path*', headers: adminSecurityHeaders },
    ];
  },
};

export default nextConfig;
