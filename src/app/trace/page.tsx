"use client";
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Search, ArrowRight, QrCode, Scan } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const demos = [
    { id: "TN-DEMO001", crop: "Tomato",  loc: "Dindigul", emoji: "🍅", stage: "Sold" },
    { id: "TN-DEMO002", crop: "Banana",  loc: "Theni",    emoji: "🍌", stage: "Retail" },
];

export default function TraceSearchPage() {
    const [batchId, setBatchId] = useState("");
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (batchId.trim()) {
            router.push(`/trace/${batchId.trim().toUpperCase()}`);
        }
    };

    return (
        <div className="min-h-screen">
            <Header />

            <main className="pt-20 pb-20 px-4" id="main-content">
                <div className="max-w-[800px] mx-auto">

                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-12"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/6 mb-5">
                            <Search className="w-3.5 h-3.5 text-blue-400" />
                            <span className="text-[12px] text-blue-400 font-semibold">Blockchain Trace</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-3 font-outfit">
                            Trace Any Batch
                        </h1>
                        <p className="text-[#64748b] text-[15px]">
                            Enter a Batch ID to verify its complete journey from farm to fork.
                        </p>
                    </motion.div>

                    {/* Search form */}
                    <motion.form
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        onSubmit={handleSearch}
                        className="relative mb-12"
                        role="search"
                    >
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748b] w-5 h-5" />
                            <input
                                type="text"
                                value={batchId}
                                onChange={e => setBatchId(e.target.value)}
                                placeholder="Enter Batch ID (e.g. TN-DEMO001)"
                                aria-label="Batch ID search"
                                className="agri-input pl-12 pr-[120px] py-4 text-[16px] rounded-2xl"
                            />
                            <button
                                type="submit"
                                className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-primary btn-sm px-5"
                            >
                                Search
                            </button>
                        </div>
                    </motion.form>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Demo batches */}
                        <motion.div
                            initial={{ opacity: 0, x: -16 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.15 }}
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-[11px] text-[#64748b] font-semibold uppercase tracking-widest">
                                    Demo Batches
                                </span>
                            </div>
                            <div className="space-y-2.5">
                                {demos.map(d => (
                                    <Link key={d.id} href={`/trace/${d.id}`}>
                                        <div className="card p-4 hover:border-[#cbd5e1] transition-all flex items-center justify-between group cursor-pointer">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-[#e2e8f0] flex items-center justify-center text-xl shrink-0">
                                                    {d.emoji}
                                                </div>
                                                <div>
                                                    <div className="text-[13px] font-semibold text-slate-900 font-mono">{d.id}</div>
                                                    <div className="text-[12px] text-[#64748b]">{d.crop} · {d.loc}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="badge badge-verified text-[10px]">{d.stage}</span>
                                                <ArrowRight className="w-4 h-4 text-[#64748b] group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all" />
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </motion.div>

                        {/* QR Scanner CTA */}
                        <motion.div
                            initial={{ opacity: 0, x: 16 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-[11px] text-[#64748b] font-semibold uppercase tracking-widest">
                                    Physical Product
                                </span>
                            </div>
                            <Link href="/scan">
                                <div className="card p-6 hover:border-amber-500/30 transition-all cursor-pointer h-full group">
                                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4">
                                        <Scan className="w-5 h-5 text-amber-400" />
                                    </div>
                                    <h3 className="text-[15px] font-bold text-slate-900 mb-2">
                                        Scan a QR Code
                                    </h3>
                                    <p className="text-[13px] text-[#64748b] leading-relaxed mb-4">
                                        Have a physical product with an AgriTraceIndia QR code? Use the mobile-friendly scanner for instant blockchain verification.
                                    </p>
                                    <div className="flex items-center gap-1.5 text-[13px] font-semibold text-amber-400 group-hover:gap-2.5 transition-all">
                                        Open Scanner
                                        <ArrowRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

