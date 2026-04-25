import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { RoleProvider } from "@/lib/role-context";
import { Toaster } from "react-hot-toast";
import { Web3Provider } from "@/components/Web3Provider";
import dynamic from "next/dynamic";

const inter = Inter({ subsets: ["latin"] });

// Load Three.js background client-side only
const AgriBackground = dynamic(() => import("@/components/AgriBackground"), {
  ssr: false,
});

const AgriAssistant = dynamic(() => import("@/components/AgriAssistant"), {
  ssr: false,
});

export const metadata: Metadata = {
  title: "AgriTraceIndia — Blockchain Farm-to-Fork | TNI26040",
  description:
    "Tamil Nadu's blockchain-powered agri-food supply chain traceability. Tamil voice input, QR scanning, offline-first PWA. Farm to Fork in 2 seconds.",
  keywords: "blockchain, supply chain, agri, Tamil Nadu, traceability, farm to fork",
  manifest: "/manifest.json",
  themeColor: "#16a34a",
  openGraph: {
    title: "AgriTraceIndia — Blockchain Supply Chain",
    description: "Farm to Fork Traceability for Tamil Nadu",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ta-IN">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
        {/* Preload Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className={inter.className}>
        {/* ✨ Full-screen Three.js Agricultural Background */}
        <AgriBackground />

        <Web3Provider>
          <RoleProvider>
            {children}
            <AgriAssistant />
            <Toaster
              position="top-center"
              containerStyle={{ top: 70 }}
              toastOptions={{
                duration: 3500,
                style: {
                  background: "rgba(10, 26, 14, 0.96)",
                  color: "#f0fdf4",
                  border: "1px solid rgba(34,197,94,0.4)",
                  borderRadius: "14px",
                  backdropFilter: "blur(20px)",
                  fontSize: "14px",
                  fontWeight: 500,
                  padding: "12px 18px",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                  maxWidth: "420px",
                },
                success: {
                  duration: 3000,
                  iconTheme: { primary: "#22c55e", secondary: "#0a1a0e" },
                },
                error: {
                  duration: 4000,
                  iconTheme: { primary: "#ef4444", secondary: "#0a1a0e" },
                },
              }}
            />
          </RoleProvider>
        </Web3Provider>
      </body>
    </html>
  );
}
