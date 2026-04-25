"use client";
import { motion, AnimatePresence } from "framer-motion";
import { MOCK_BATCHES } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";
import Header from "@/components/Header";
import Link from "next/link";
import {
    ShieldCheck, MapPin, Clock,
    ExternalLink, Hash, ChevronDown, ChevronUp, Package,
    User, TrendingUp, Check, X, AlertCircle
} from "lucide-react";
import { useState, useEffect } from "react";
import { QRCodeSVG as QRCode } from "qrcode.react";

const STAGE_CONFIG: Record<string, { icon: string; label: string; labelTamil: string; color: string; gradient: string }> = {
    HARVEST_APPLICATION: { icon: "🌾", label: "Harvest Application", labelTamil: "அறுவடை விண்ணப்பம்", color: "text-green-400", gradient: "from-green-600 to-emerald-700" },
    CROP_INSPECTION: { icon: "🔬", label: "Quality Inspection & Certification", labelTamil: "தர சான்றிதழ்", color: "text-blue-400", gradient: "from-blue-600 to-cyan-700" },
    BATCH_RECORDED: { icon: "📦", label: "Batch Recorded on Blockchain", labelTamil: "தொகுதி பதிவு", color: "text-purple-400", gradient: "from-purple-600 to-violet-700" },
    CROP_PURCHASE: { icon: "🛒", label: "Market Purchase", labelTamil: "வாங்குதல்", color: "text-amber-400", gradient: "from-amber-600 to-orange-700" },
    STOCK_CLOSED: { icon: "🔒", label: "Stock Closed (TNAS)", labelTamil: "TNAS முடிவு", color: "text-gray-400", gradient: "from-gray-600 to-gray-700" },
};

function EventCard({ event, index, total }: { event: any; index: number; total: number }) {
    const [expanded, setExpanded] = useState(index === 0);
    const cfg = STAGE_CONFIG[event.action] || {
        icon: "🔗", label: event.action, labelTamil: "", color: "text-gray-400", gradient: "from-gray-600 to-gray-700"
    };
    const isLast = index === total - 1;

    return (
        <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.12 }}
            className="relative flex gap-4"
        >
            <div className="flex flex-col items-center flex-shrink-0">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${cfg.gradient} flex items-center justify-center text-xl shadow-lg z-10 border-2 border-white/10`}>
                    {cfg.icon}
                </div>
                {!isLast && (
                    <div className="w-0.5 flex-1 min-h-[32px] mt-1 rounded-full"
                        style={{ background: "linear-gradient(to bottom, rgba(34,197,94,0.5), rgba(59,130,246,0.2))" }} />
                )}
            </div>

            <div className={`flex-1 mb-4 glass-card p-4 border transition-all ${expanded ? 'border-green-500/30' : 'border-white/5 hover:border-white/10'}`}>
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className={`font-bold text-base ${cfg.color}`}>{cfg.label}</h3>
                            <span className="text-[10px] text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">{cfg.labelTamil}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400 flex-wrap">
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDate(event.timestamp)}</span>
                            <span className="flex items-center gap-1"><User className="w-3 h-3" />{event.actor}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="flex items-center gap-1 text-[10px] text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-1 rounded-full">
                            <ShieldCheck className="w-3 h-3" /> On-Chain
                        </span>
                        <button onClick={() => setExpanded(!expanded)} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-gray-400">
                            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                    </div>
                </div>

                <AnimatePresence>
                    {expanded && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 pt-3 border-t border-white/10 overflow-hidden"
                        >
                            {event.details && Object.keys(event.details).length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                                    {Object.entries(event.details).map(([k, v]: [string, any]) => (
                                        <div key={k} className="bg-white/5 rounded-xl p-2.5">
                                            <div className="text-[9px] text-gray-500 uppercase tracking-wider mb-0.5">{k.replace(/_/g, ' ')}</div>
                                            <div className="text-xs text-white font-medium break-all">
                                                {typeof v === 'boolean'
                                                    ? (v
                                                        ? <span className="text-green-400 flex items-center gap-1"><Check className="w-3 h-3" /> Yes</span>
                                                        : <span className="text-red-400 flex items-center gap-1"><X className="w-3 h-3" /> No</span>)
                                                    : String(v)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {event.txHash && (
                                <div className="flex items-center gap-2 text-xs bg-blue-950/40 border border-blue-500/10 rounded-xl p-2.5 font-mono">
                                    <Hash className="w-3 h-3 text-blue-400 flex-shrink-0" />
                                    <span className="text-blue-300 truncate">{event.txHash}</span>
                                    <a href={`https://amoy.polygonscan.com/tx/${event.txHash}`} target="_blank" rel="noopener noreferrer"
                                        className="ml-auto text-blue-400/60 hover:text-blue-400 flex-shrink-0">
                                        <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}

export default function TracePage({ params }: { params: { batchId: string } }) {
    const batchId = params.batchId;
    const [app, setApp] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '');

    useEffect(() => {
        const fetchData = async () => {
            const { apiRequest } = await import("@/lib/api");
            try {
                const res = await apiRequest(`/harvest/${batchId}`, 'GET');
                if (res.status === 'success') {
                    setApp(res.data);
                } else if (MOCK_BATCHES[batchId as keyof typeof MOCK_BATCHES]) {
                    const mock = MOCK_BATCHES[batchId as keyof typeof MOCK_BATCHES] as any;
                    setApp({
                        cropType: mock.crop,
                        farmerDistrict: mock.district,
                        farmerName: mock.farmer,
                        farmerVillage: mock.village,
                        blockchainEvents: (mock.history || []).map((h: any) => ({
                            action: h.stage === 'Harvested' ? 'HARVEST_APPLICATION' : h.stage === 'Quality Tested' ? 'CROP_INSPECTION' : 'BATCH_RECORDED',
                            actor: h.actor,
                            timestamp: h.timestamp,
                            details: { Notes: h.notes },
                            txHash: h.txHash
                        }))
                    });
                }
            } catch (err) {
                console.error("Failed to fetch trace data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [batchId]);

    if (loading) {
        return (
            <div className="min-h-screen circuit-bg flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-white font-medium">Loading Blockchain Trail...</p>
                    <p className="text-gray-500 text-sm">தரவு ஏற்றுகிறது...</p>
                </div>
            </div>
        );
    }

    if (!app) {
        return (
            <div className="min-h-screen circuit-bg flex flex-col">
                <Header />
                <div className="flex-1 flex flex-col items-center justify-center gap-4">
                    <div className="text-6xl">🔍</div>
                    <h2 className="text-2xl font-bold text-white">Batch Not Found</h2>
                    <p className="text-gray-400">The ID <span className="text-green-400 font-mono">{batchId}</span> does not exist on our blockchain.</p>
                    <Link href="/scan" className="btn-glow px-8 py-3 rounded-xl text-white mt-4">Try Scanning Again</Link>
                </div>
            </div>
        );
    }

    const traceUrl = `${SITE_URL}/trace/${batchId}`;
    const events: any[] = app.blockchainEvents || [];
    const completedActions = new Set(events.map((e: any) => e.action));

    const CROP_EMOJI: Record<string, string> = {
        tomato: "🍅", banana: "🍌", Banana: "🍌", rice: "🌾", mango: "🥭",
        onion: "🧅", chilli: "🌶️", brinjal: "🍆", potato: "🥔", coconut: "🥥",
        Brinjal: "🍆", Beans: "🫘",
    };
    const cropEmoji = CROP_EMOJI[app.cropType] || "🌾";

    return (
        <div className="min-h-screen circuit-bg">
            <Header />

            {/* Hero */}
            <div className="relative overflow-hidden bg-gradient-to-b from-green-950/60 to-transparent py-14 px-4">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(34,197,94,0.08),transparent)]" />
                <div className="max-w-5xl mx-auto text-center relative z-10">
                    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-6xl mb-4">{cropEmoji}</motion.div>
                    <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-black text-white mb-2" style={{ fontFamily: "Outfit, sans-serif" }}>
                        <span className="gradient-text capitalize">{app.cropType}</span>
                    </motion.h1>
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
                        className="text-gray-400 text-lg mb-1">Supply Chain Blockchain Audit Trail</motion.p>
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                        className="text-green-400 font-mono font-bold mb-6">{app.batchId || app.applicationId}</motion.p>
                    <div className="flex flex-wrap justify-center gap-3">
                        <span className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border border-green-500/30 text-green-400 bg-green-500/5">
                            <ShieldCheck className="w-3.5 h-3.5" /> Blockchain Verified
                        </span>
                        {app.organicVerified && <span className="text-xs px-3 py-1.5 rounded-full border border-emerald-500/30 text-emerald-400 bg-emerald-500/5">🌿 Organic Certified</span>}
                        <span className="text-xs px-3 py-1.5 rounded-full border border-white/10 text-gray-400">{app.batchRecordedWeight || app.quantityKg} kg</span>
                        <span className="text-xs px-3 py-1.5 rounded-full border border-white/10 text-gray-400">{events.length} Events</span>
                    </div>
                </div>
            </div>

            {/* Supply Chain Stepper */}
            <div className="max-w-5xl mx-auto px-4 mb-8">
                <div className="glass-card p-6">
                    <h2 className="text-sm font-bold text-gray-400 mb-5 uppercase tracking-widest">Supply Chain Journey · விநியோக சங்கிலி</h2>
                    <div className="flex items-center justify-between">
                        {[
                            { action: "HARVEST_APPLICATION", label: "Farmer\nHarvests", icon: "🌾" },
                            { action: "CROP_INSPECTION", label: "Agri Officer\nCertifies", icon: "🔬" },
                            { action: "BATCH_RECORDED", label: "Batch\nRecorded", icon: "📦" },
                            { action: "CROP_PURCHASE", label: "Market\nSold", icon: "🛒" },
                            { action: "STOCK_CLOSED", label: "TNAS\nClosed", icon: "🔒" },
                        ].map((step, idx) => {
                            const done = completedActions.has(step.action);
                            return (
                                <div key={step.action} className="flex-1 flex flex-col items-center relative">
                                    {idx < 4 && (
                                        <div className={`absolute top-5 left-[50%] w-full h-0.5 z-0 ${done ? 'bg-green-500/60' : 'bg-white/10'}`} />
                                    )}
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg z-10 border-2 transition-all ${done ? 'border-green-500 bg-green-500/20 scale-110' : 'border-white/10 bg-white/5'}`}>
                                        {step.icon}
                                    </div>
                                    <div className={`text-[10px] text-center mt-2 whitespace-pre-line font-medium ${done ? 'text-green-400' : 'text-gray-600'}`}>{step.label}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-5xl mx-auto px-4 pb-20">
                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <div className="glass-card p-6">
                            <h2 className="font-bold text-white text-xl mb-8 flex items-center gap-2">
                                <span className="text-green-400">⛓️</span> Immutable Audit Trail
                                <span className="text-xs text-gray-500 ml-1">· நிரந்தர தணிக்கை பதிவு</span>
                            </h2>
                            {events.length === 0 ? (
                                <div className="text-gray-500 text-center py-8">
                                    <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                    No events recorded yet.
                                </div>
                            ) : (
                                <div>
                                    {events.map((ev, i) => <EventCard key={i} event={ev} index={i} total={events.length} />)}
                                    <motion.div
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: events.length * 0.12 }}
                                        className="flex items-center gap-3 p-4 rounded-2xl bg-green-500/5 border border-green-500/10 mt-2"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-400">
                                            <ShieldCheck className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-green-400">Blockchain Integrity Verified</div>
                                            <div className="text-[10px] text-gray-500">All {events.length} events cryptographically secured. Powered by AgriTraceIndia / TNAS.</div>
                                        </div>
                                    </motion.div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-5">
                        <div className="glass-card p-5">
                            <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Package className="w-4 h-4 text-green-400" /> Batch Details</h3>
                            <div className="space-y-2.5">
                                {[
                                    ["Farmer", app.farmerName, "👤"],
                                    ["District", app.farmerDistrict, "📍"],
                                    ["Village", app.farmerVillage, "🏘️"],
                                    ["Quality Grade", app.qualityGrade || "Pending", "🏆"],
                                    ["Certificate", app.certificationNo || "N/A", "📜"],
                                    ["Final Price", app.finalPricePerKg ? `₹${app.finalPricePerKg}/kg` : "Pending", "💰"],
                                ].map(([k, v, icon]) => (
                                    <div key={String(k)} className="flex items-start gap-2 py-1.5 border-b border-white/5">
                                        <span className="text-sm">{icon}</span>
                                        <span className="text-gray-500 w-24 flex-shrink-0 text-xs">{k}</span>
                                        <span className="text-white text-xs font-medium">{v || '—'}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {app.buyerName && (
                            <div className="glass-card p-5 border-amber-500/10">
                                <h3 className="font-bold text-amber-400 mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Purchase Info</h3>
                                <div className="space-y-2 text-xs">
                                    <div className="flex justify-between py-1 border-b border-white/5"><span className="text-gray-500">Buyer</span><span className="text-white">{app.buyerName}</span></div>
                                    <div className="flex justify-between py-1 border-b border-white/5"><span className="text-gray-500">Role</span><span className="text-white capitalize">{app.buyerRole}</span></div>
                                    <div className="flex justify-between py-1 border-b border-white/5"><span className="text-gray-500">Quantity</span><span className="text-white">{app.purchaseQuantityKg}kg</span></div>
                                    <div className="flex justify-between py-1"><span className="text-gray-500">Total</span><span className="text-green-400 font-bold">₹{app.purchaseTotalAmount?.toLocaleString('en-IN')}</span></div>
                                </div>
                            </div>
                        )}

                        <div className="glass-card p-5 text-center">
                            <h3 className="font-bold text-white mb-4">📱 Scan to Verify</h3>
                            <div className="bg-white p-4 rounded-2xl inline-block mb-3">
                                <QRCode value={traceUrl} size={150} level="H" />
                            </div>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Digital Twin · AgriTraceIndia</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
