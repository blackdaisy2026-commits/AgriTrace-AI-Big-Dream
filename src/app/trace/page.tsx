"use client";
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Search, ArrowRight, QrCode } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function TraceSearchPage() {
    const [batchId, setBatchId] = useState("");
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (batchId.trim()) {
            router.push(`/trace/${batchId.trim().toUpperCase()}`);
        }
    };

    const demos = [
        { id: "TN-DEMO001", crop: "Tomato", loc: "Dindigul" },
        { id: "TN-DEMO002", crop: "Banana", loc: "Theni" },
    ];

    return (
        <div className="min-h-screen">
            <Header />

            <main className="pt-24 pb-20 px-4">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-12"
                    >
                        <h1 className="text-5xl font-black text-white mb-4 font-outfit">
                            Trace <span className="gradient-text">Anything</span>
                        </h1>
                        <p className="text-gray-400">Enter a Batch ID to verify its journey from farm to fork.</p>
                    </motion.div>

                    <motion.form
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        onSubmit={handleSearch}
                        className="relative max-w-2xl mx-auto mb-16"
                    >
                        <div className="relative">
                            <input
                                type="text"
                                value={batchId}
                                onChange={(e) => setBatchId(e.target.value)}
                                placeholder="Enter Batch ID (e.g. TN-DEMO001)"
                                className="w-full bg-black/40 border-2 border-green-500/20 rounded-3xl py-6 px-14 text-white font-bold text-xl focus:border-green-500/60 transition-all outline-none"
                            />
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 w-6 h-6" />
                            <button
                                type="submit"
                                className="absolute right-3 top-1/2 -translate-y-1/2 bg-green-500 text-white p-3 rounded-2xl hover:bg-green-400 transition-colors"
                            >
                                <ArrowRight className="w-6 h-6" />
                            </button>
                        </div>
                    </motion.form>

                    <div className="grid md:grid-cols-2 gap-12">
                        {/* Demo Batches */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                                <span className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 text-xs">DEMOS</span>
                                Try a Demo Batch
                            </h3>
                            <div className="space-y-3">
                                {demos.map((d) => (
                                    <Link key={d.id} href={`/trace/${d.id}`}>
                                        <div className="glass-card p-5 border-white/5 hover:border-blue-500/30 transition-all flex justify-between items-center group mb-3">
                                            <div>
                                                <div className="text-white font-bold group-hover:text-blue-400 transition-colors">{d.id}</div>
                                                <div className="text-xs text-gray-500">{d.crop} • {d.loc}</div>
                                            </div>
                                            <ArrowRight className="text-gray-700 group-hover:text-blue-400 transition-colors w-5 h-5" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </motion.div>

                        {/* QR Scanner CTA */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="glass-card p-8 border-amber-500/10 flex flex-col justify-between"
                        >
                            <div>
                                <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-6">
                                    <QrCode className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2 font-outfit">Have a Product?</h3>
                                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                                    If you have a physical package with an AgriTraceIndia QR code, use our mobile-friendly scanner for instant verification.
                                </p>
                            </div>
                            <Link href="/scan">
                                <button className="w-full py-3 rounded-xl border border-amber-500/40 text-amber-400 font-bold hover:bg-amber-500/5 transition-colors">
                                    Open Scanner
                                </button>
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
