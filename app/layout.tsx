import type { Metadata } from "next";
import { Geist, Geist_Mono, Orbitron, Space_Grotesk } from "next/font/google";
import "./globals.css";

import Navbar from "@/app/components/Navbar"; 
import { MesaProvider } from "@/lib/context/MesaContext";
import { PanelControlProvider } from "@/lib/context/PanelControlContext";

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

export const metadata: Metadata = {
  title: "Las Vegas Discobar",
  description: "App interactiva para Las Vegas Discobar - Música, Juegos y Diversión",
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
          </PanelControlProvider>
        </MesaProvider>
      </body>
    </html>
  );
}