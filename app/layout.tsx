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

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://lasvegasdiscobar.netlify.app";

export const viewport: Viewport = {
  themeColor: "#060413",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Las Vegas Discobar | La Mejor Rumba en Sopetrán 🍹🔥",
    template: "%s | Las Vegas Discobar",
  },
  description:
    "Vive la mejor experiencia nocturna en Sopetrán. Escanea el QR de tu mesa, pide canciones en vivo, participa en sorteos, concursos y disfruta la mejor rumba de la región.",
  keywords: [
    "Las Vegas Discobar", "Rumba en Sopetrán", "Discotecas en Sopetrán",
    "Sopetrán Antioquia", "Fiesta Sopetrán", "Bares en Sopetrán",
    "Música en vivo Sopetrán", "Turismo Sopetrán", "Nightlife Sopetrán",
    "Ruleta de premios discoteca",
  ],
  authors: [{ name: "Las Vegas Discobar" }],
  creator: "Las Vegas Discobar",
  publisher: "Las Vegas Discobar",

  // 📱 PWA Manifest
  manifest: "/manifest.json",

  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Las Vegas",
  },

  // 🖼️ Iconos — apuntando a los archivos reales de /public
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png", sizes: "any" },
      { url: "/icon1.png", type: "image/png", sizes: "192x192" },
      { url: "/icon0.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: ["/favicon.png"],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },

  openGraph: {
    type: "website",
    locale: "es_CO",
    url: BASE_URL,
    title: "Las Vegas Discobar | La Mejor Rumba en Sopetrán 🍹🔥",
    description:
      "¡La mejor rumba de Sopetrán está aquí! Interactúa desde tu mesa, pide tus canciones favoritas y gana premios en la ruleta.",
    siteName: "Las Vegas Discobar",
    images: [
      {
        url: "/icon0.png",
        width: 1200,
        height: 630,
        alt: "Las Vegas Discobar Sopetrán - Logo Oficial",
        type: "image/png",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Las Vegas Discobar | La Mejor Rumba en Sopetrán 🍹🔥",
    description:
      "Vive la rumba interactiva en Sopetrán. Pide canciones, participa en ruletas de premios y disfruta la noche.",
    images: ["/icon0.png"],
    creator: "@lasvegasdiscobar",
  },

  robots: {
    index: true,
    follow: true,
  },
  category: "entertainment",
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
            <main className="grow pt-20 flex flex-col">{children}</main>
            <WebSocketListener />
          </PanelControlProvider>
        </MesaProvider>
      </body>
    </html>
  );
}