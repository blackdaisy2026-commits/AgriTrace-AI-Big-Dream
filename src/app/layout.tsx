import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { RoleProvider } from "@/lib/role-context";
import { Web3Provider } from "@/components/Web3Provider";
import dynamic from "next/dynamic";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
});

const outfit = Outfit({
    subsets: ["latin"],
    variable: "--font-outfit",
    display: "swap",
    weight: ["400", "500", "600", "700", "800", "900"],
});

// CSS-only background — no Three.js
const AnimatedBackground = dynamic(
    () => import("@/components/AnimatedBackground"),
    { ssr: false }
);

// AI assistant — client only (uses speech APIs)
const AgriAssistant = dynamic(
    () => import("@/components/AgriAssistant"),
    { ssr: false }
);

// Toast notifications
const Toaster = dynamic(
    () => import("sonner").then((m) => ({ default: m.Toaster })),
    { ssr: false }
);

export const metadata: Metadata = {
    title: {
        default: "AgriTraceIndia — Blockchain Farm-to-Fork",
        template: "%s | AgriTraceIndia",
    },
    description:
        "Tamil Nadu's blockchain-powered agri-food supply chain traceability. Tamil voice input, QR scanning, offline-first PWA. Farm to Fork in 2 seconds.",
    keywords: [
        "blockchain", "supply chain", "agriculture", "Tamil Nadu",
        "traceability", "farm to fork", "AgriTrace", "food safety",
    ],
    manifest: "/manifest.json",
    openGraph: {
        title: "AgriTraceIndia — Blockchain Supply Chain",
        description: "Farm to Fork Traceability for Tamil Nadu Agriculture",
        type: "website",
        locale: "ta_IN",
    },
    twitter: {
        card: "summary_large_image",
        title: "AgriTraceIndia",
        description: "Farm to Fork Traceability for Tamil Nadu",
    },
    robots: {
        index: true,
        follow: true,
    },
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    themeColor: "#16a34a",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html
            lang="ta-IN"
            className={`${inter.variable} ${outfit.variable}`}
            suppressHydrationWarning
        >
            <head>
                <link rel="icon" href="/favicon.ico" sizes="any" />
                <link rel="apple-touch-icon" href="/icons/icon-192.png" />
                {/* Noto Sans Tamil — not in next/font, loaded manually */}
                <link
                    rel="stylesheet"
                    href="https://fonts.googleapis.com/css2?family=Noto+Sans+Tamil:wght@400;500;600&display=swap"
                />
            </head>
            <body className={`${inter.className} bg-white text-slate-900`}>
                {/* Animated CSS background — replaces Three.js WebGL */}
                <AnimatedBackground />

                <Web3Provider>
                    <RoleProvider>
                        {children}

                        {/* AI Chat Assistant */}
                        <AgriAssistant />

                        {/* Toast Notifications */}
                        <Toaster
                            position="top-center"
                            offset={72}
                            toastOptions={{
                                style: {
                                    background: "#ffffff",
                                    color: "#0f172a",
                                    border: "1px solid #e2e8f0",
                                    borderRadius: "12px",
                                    fontSize: "14px",
                                    fontWeight: 450,
                                    padding: "12px 16px",
                                    boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
                                    maxWidth: "420px",
                                },
                            }}
                            theme="dark"
                        />
                    </RoleProvider>
                </Web3Provider>
            </body>
        </html>
    );
}

