import type { Metadata, Viewport } from "next";
import { Orbitron, Space_Grotesk } from "next/font/google";
import "./globals.css";

import Navbar from "@/app/components/Navbar"; 
import { MesaProvider } from "@/lib/context/MesaContext";
import { PanelControlProvider } from "@/lib/context/PanelControlContext";
import { WebSocketListener } from "@/app/components/WebSocketListener";

const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['700', '900'],
  variable: '--font-orbitron',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-space',
});

// Configuración del Viewport para móviles y PWA
export const viewport: Viewport = {
  themeColor: "#060413",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

// SEO Potente y Optimizado
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://lasvegasdiscobar.com"),
  title: {
    default: "Las Vegas Discobar | La Mejor Rumba en Sopetrán 🍹🔥",
    template: "%s | Las Vegas Discobar",
  },
  description: "Vive la mejor experiencia nocturna en Sopetrán. Escanea el QR de tu mesa, pide canciones en vivo, participa en sorteos, concursos y disfruta la mejor rumba de la región.",
  keywords: [
    "Las Vegas Discobar",
    "Rumba en Sopetrán",
    "Discotecas en Sopetrán",
    "Sopetrán Antioquia",
    "Fiesta Sopetrán",
    "Bares en Sopetrán",
    "Música en vivo Sopetrán",
    "Turismo Sopetrán",
    "Nightlife Sopetrán",
    "Ruleta de premios discoteca"
  ],
  authors: [{ name: "Las Vegas Discobar" }],
  creator: "Las Vegas Discobar",
  publisher: "Las Vegas Discobar",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  
  // Íconos y Logo de la App
  icons: {
    icon: [
      { url: "/lasvesgas-logo.PNG" },
      { url: "/lasvesgas-logo.PNG", type: "image/png" },
    ],
    shortcut: ["/lasvesgas-logo.PNG"],
    apple: [
      { url: "/lasvesgas-logo.PNG", sizes: "180x180", type: "image/png" },
    ],
  },

  // Open Graph (WhatsApp, Facebook, LinkedIn)
  openGraph: {
    type: "website",
    locale: "es_CO",
    url: "https://lasvegasdiscobar.com",
    title: "Las Vegas Discobar | La Mejor Rumba en Sopetrán 🍹🔥",
    description: "¡La mejor rumba de Sopetrán está aquí! Interactúa desde tu mesa, pide tus canciones favoritas y gana premios en la ruleta.",
    siteName: "Las Vegas Discobar",
    images: [
      {
        url: "/lasvesgas-logo.PNG",
        width: 1200,
        height: 630,
        alt: "Las Vegas Discobar Sopetrán - Logo Oficial",
      },
    ],
  },

  // Twitter Cards
  twitter: {
    card: "summary_large_image",
    title: "Las Vegas Discobar | La Mejor Rumba en Sopetrán 🍹🔥",
    description: "Vive la rumba interactiva en Sopetrán. Pide canciones, participa en ruletas de premios y disfruta la noche.",
    images: ["/lasvesgas-logo.PNG"],
  },

  // Indexación para buscadores
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${orbitron.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#060413] text-white selection:bg-[#ff00a0] selection:text-white">
        <MesaProvider>
          <PanelControlProvider>
            <Navbar />
            <main className="grow pt-20 flex flex-col">
              {children}
            </main>
            {/* ✅ Escucha eventos de WebSocket en TODA la app */}
            <WebSocketListener />
          </PanelControlProvider>
        </MesaProvider>
      </body>
    </html>
  );
}