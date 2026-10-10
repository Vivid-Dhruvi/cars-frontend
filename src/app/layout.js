import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL("https://carinsurent.com"),
  title: {
    default: "Car Rental Damage Scanner | AI Pre-Rental Vehicle Inspection - CarInsuRent",
    template: "%s | CarInsuRent",
  },
  description:
    "Scan and inspect rental vehicles for pre-existing scratches, dents, and damages in seconds with CarInsuRent AI vision scanner. Protect yourself from unfair damage fees.",
  alternates: {
    canonical: "/car-rental-damage-scanner/",
  },
  openGraph: {
    title: "Car Rental Damage Scanner | AI Pre-Rental Vehicle Inspection",
    description:
      "Detect pre-existing rental car damage in seconds using CarInsuRent AI visual inspection. Avoid wrongful damage claims.",
    url: "https://carinsurent.com/car-rental-damage-scanner/",
    siteName: "CarInsuRent",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Car Rental Damage Scanner | AI Vehicle Inspection",
    description:
      "Instant AI damage detection for rental cars. Document vehicle condition before leaving the rental lot.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Car Rental Damage Scanner",
  url: "https://carinsurent.com/car-rental-damage-scanner/",
  applicationCategory: "BusinessApplication",
  operatingSystem: "All",
  description:
    "AI-driven car rental physical damage visual inspection protocol by CarInsuRent.",
  publisher: {
    "@type": "Organization",
    name: "CarInsuRent",
    url: "https://carinsurent.com",
    logo: "https://carinsurent.com/wp-content/uploads/2021/04/logo.png",
  },
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
