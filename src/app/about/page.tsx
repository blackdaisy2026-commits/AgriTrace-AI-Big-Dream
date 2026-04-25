"use client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Award, Globe, Shield } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
    return (
        <div className="min-h-screen">
            <Header />

            <main className="pt-24 pb-20 px-4">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-16"
                    >
                        <h1 className="text-5xl font-black text-white mb-6 font-outfit">
                            Our <span className="gradient-text">Mission</span>
                        </h1>
                        <p className="text-xl text-gray-400 leading-relaxed">
                            AgriTraceIndia was born out of the 2026 Tamil Nadu Hackathon (TNI26040) with a singular goal: to bring radical transparency to the food we eat while empowering the farmers who grow it.
                        </p>
                    </motion.div>

                    <div className="grid gap-12">
                        <motion.section
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="glass-card p-8"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 rounded-xl bg-green-500/20 text-green-400">
                                    <Globe className="w-6 h-6" />
                                </div>
                                <h2 className="text-2xl font-bold text-white font-outfit">The Problem</h2>
                            </div>
                            <p className="text-gray-400 leading-relaxed">
                                In the current agricultural supply chain, consumers have no way of knowing where their vegetables come from, whether they are truly organic, or if the farmer was paid fairly. Data is often lost in paper logs, and fraud is common.
                            </p>
                        </motion.section>

                        <motion.section
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="glass-card p-8 border-blue-500/20"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400">
                                    <Shield className="w-6 h-6" />
                                </div>
                                <h2 className="text-2xl font-bold text-white font-outfit">Our Solution</h2>
                            </div>
                            <p className="text-gray-400 leading-relaxed">
                                We leverage the Polygon blockchain to create an immutable digital ledger for every batch of produce. From harvest to doorstep, every hand it touches is recorded.
                            </p>
                            <ul className="mt-4 space-y-2">
                                <li className="flex items-center gap-2 text-sm text-gray-300">
                                    <span className="text-green-400">✓</span> 100% Tamper-proof records
                                </li>
                                <li className="flex items-center gap-2 text-sm text-gray-300">
                                    <span className="text-green-400">✓</span> Real-time AI Anomaly Detection
                                </li>
                                <li className="flex items-center gap-2 text-sm text-gray-300">
                                    <span className="text-green-400">✓</span> Tamil Voice Input for Rural Accessibility
                                </li>
                            </ul>
                        </motion.section>

                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center py-12"
                        >
                            <Award className="w-16 h-16 text-amber-500 mx-auto mb-6" />
                            <h2 className="text-3xl font-bold text-white mb-4">Hackathon Context</h2>
                            <p className="text-gray-400 max-w-2xl mx-auto mb-8">
                                Developed as part of the TNI26040 team for the Tamil Nadu Blockchain Challenge. Our platform represents a shift towards &quot;Tech for Good&quot; in the agricultural sector of South India.
                            </p>
                            <Link href="/">
                                <button className="btn-glow text-white px-8 py-3 rounded-xl font-bold">
                                    Back to Home
                                </button>
                            </Link>
                        </motion.section>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
