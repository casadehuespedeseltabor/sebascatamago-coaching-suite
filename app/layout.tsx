import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sebascatamago Coaching Suite",
  description: "Rueda de la Vida para procesos de coaching y acompañamiento.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
