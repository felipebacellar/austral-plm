import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Austral PLM",
  description: "Sistema de gestão do ciclo de vida de produto — Austral",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-white text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
