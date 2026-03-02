import type { Metadata } from "next";
import ToastProvider from "@/components/ToastProvider";
import QueryProvider from "../providers/queryProvider";
import { SessionWrapper } from "@/components/SessionWrapper";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Plataforma de Divulgação de Eventos - IFRO EVENTS",
  description: "Divulgue e acompanhe eventos do Instituto Federal de Rondônia",
  icons: {
    icon: "/favicon.ico"
  }
};

// Este é o layout raiz que envolve TUDO.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} antialiased`}>
        <ToastProvider />
        {/* O 'children' aqui será o layout de um dos seus grupos,
            seja o AppLayout ou o AuthLayout. */}

        <SessionWrapper>
          <QueryProvider>
            {children}
          </QueryProvider>
        </SessionWrapper>
      </body>
    </html>
  );
}
