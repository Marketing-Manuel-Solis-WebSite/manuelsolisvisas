import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GoogleAnalytics } from '@next/third-parties/google'; // Importamos el componente optimizado
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ID de medición de GA4
const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX';

export const metadata: Metadata = {
  metadataBase: new URL('https://manuelsolisvisas.vercel.app'),
  
  title: {
    default: "Manuel Solis Training Center | Videos de Capacitación",
    template: "%s | Manuel Solis Visas"
  },
  description: "Plataforma exclusiva de capacitación y dramatizaciones de casos de inmigración (Visa U, VAWA, Visa T). Oficina San Luis Potosí.",
  keywords: ["Manuel Solis", "Visas", "Capacitación", "Visa U", "VAWA", "Inmigración", "Training Center", "Abogados"],
  authors: [{ name: "Manuel Solis Law Firm" }],
  
  openGraph: {
    title: "Manuel Solis Training Center",
    description: "Acceso exclusivo a material de capacitación y dramatizaciones de casos reales.",
    url: "https://manuelsolisvisas.vercel.app",
    siteName: "Manuel Solis Training Center",
    images: [
      {
        url: "/images/og-image.jpg", 
        width: 1200,
        height: 630,
        alt: "Manuel Solis Training Center",
      },
    ],
    locale: "es_MX",
    type: "website",
  },
  
  twitter: {
    card: "summary_large_image",
    title: "Manuel Solis Training Center",
    description: "Plataforma de capacitación legal y visas.",
    images: ["/images/og-image.jpg"], 
  },
  
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "32x32" }, 
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" }, 
    ],
  },
  
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Analytics />
        <SpeedInsights />
        {/* Google Analytics optimizado, no bloquea el hilo principal */}
        <GoogleAnalytics gaId={GA_MEASUREMENT_ID} />
      </body>
    </html>
  );
}