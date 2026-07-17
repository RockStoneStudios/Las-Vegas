import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// 1. IMPORTAMOS EL NAVBAR
// (Ajusta la ruta "@/" si guardaste tu archivo en otro directorio, ej: "./components/Navbar")
import Navbar from "@/app/components/Navbar"; 

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Actualicé el título para que se vea pro en la pestaña del navegador ;)
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      {/* 2. AGREGAMOS EL FONDO OSCURO NEOPUNK AL BODY */}
      <body className="min-h-full flex flex-col bg-[#060413] text-white selection:bg-[#ff00a0] selection:text-white">
        
        {/* 3. COLOCAMOS EL NAVBAR AQUÍ (Se mantendrá visible en todas las subpáginas) */}
        <Navbar />
        
        {/* 4. ENVOLVEMOS EL CONTENIDO EN UN MAIN CON pt-20 (Padding Top de 80px)
            Esto evita que el Navbar fijo tape el contenido de tus páginas */}
        <main className="flex-grow pt-20 flex flex-col">
          {children}
        </main>

      </body>
    </html>
  );
}