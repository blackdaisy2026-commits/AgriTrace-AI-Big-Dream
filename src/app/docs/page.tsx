"use client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Code, Server, ShieldCheck, Globe, Cpu } from "lucide-react";

export default function DocsPage() {
    const sections = [
        {
            icon: <Server className="w-5 h-5" />,
            title: "Core Architecture",
            content: "AgriTraceIndia uses a Next.js 14 App Router architecture for high performance and SEO. The frontend is fully decoupled, interacting with the Polygon blockchain through the wagmi/viem provider layer."
        },
        {
            icon: <ShieldCheck className="w-5 h-5" />,
            title: "Smart Contracts",
            content: "Our SupplyChain.sol contract (deployed on Polygon Amoy) handles batch creation, stage-locking, and actor verification. It ensures that only authorized wallets can update specific segments of the supply chain."
        },
        {
            icon: <Globe className="w-5 h-5" />,
            title: "Localized Accessibility",
            content: "A custom integration with the Web Speech API provides localized Tamil support. We handle phonetic mapping for Tamil agricultural terms to ensure accurate data logging even without keyboard input."
        },
        {
            icon: <Cpu className="w-5 h-5" />,
            title: "AI Integrity Scoring",
            content: "A lightweight anomaly detection algorithm monitors data inputs (like temperature dips or unrealistic GPS jumps) to provide a real-time 'Integrity Score' for every product."
        }
    ];

    return (
        <div className="min-h-screen">
            <Header />

            <main className="pt-24 pb-20 px-4">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-12"
                    >
                        <h1 className="text-4xl font-black text-white mb-4 font-outfit">
                            Developer <span className="gradient-text">Docs</span>
                        </h1>
                        <p className="text-gray-400">Technical specifications and design patterns of the AgriTraceIndia platform.</p>
                    </motion.div>

                    <div className="space-y-8">
                        {sections.map((sec, i) => (
                            <motion.section
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="glass-card p-8 border-white/5"
                            >
                                <div className="flex items-center gap-3 mb-4 text-green-400">
                                    {sec.icon}
                                    <h2 className="text-xl font-bold text-white font-outfit">{sec.title}</h2>
                                </div>
                                <p className="text-gray-400 leading-relaxed">
                                    {sec.content}
                                </p>
                            </motion.section>
                        ))}

                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="p-8 border-2 border-dashed border-green-500/20 rounded-2xl bg-green-500/5 text-center"
                        >
                            <Code className="w-10 h-10 text-green-500 mx-auto mb-4" />
                            <h3 className="text-white font-bold mb-2">Open Source</h3>
                            <p className="text-gray-500 text-sm mb-6">
                                This project is built for transparency. The full source code and smart contracts are available for audit.
                            </p>
                            <div className="flex justify-center gap-4">
                                <button className="px-6 py-2 rounded-full bg-white/10 text-white text-xs font-bold hover:bg-white/20 transition-all">
                                    GitHub Repository
                                </button>
                                <button className="px-6 py-2 rounded-full bg-green-500/20 text-green-400 text-xs font-bold border border-green-500/20">
                                    Polygonscan Amoy
                                </button>
                            </div>
                        </motion.section>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
