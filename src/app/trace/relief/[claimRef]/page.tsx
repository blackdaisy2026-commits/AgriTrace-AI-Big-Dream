"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import Link from "next/link";
import { QRCodeSVG as QRCode } from "qrcode.react";
import {
    ShieldCheck, Hash, ChevronDown, ChevronUp, Clock,
    MapPin, User, Leaf, FileText, Check, X, IndianRupee,
    AlertCircle, ExternalLink
} from "lucide-react";

// ─── Stage Configuration (the full supply chain for relief fund) ──────────────
const STAGE_CONFIG: Record<string, {
    icon: string;
    label: string;
    labelTamil: string;
    color: string;
    gradient: string;
    role: string;
}> = {
    RELIEF_APPLICATION: {
        icon: "🌾",
        label: "Farmer Application",
        labelTamil: "விவசாயி விண்ணப்பம்",
        color: "text-green-400",
        gradient: "from-green-600 to-emerald-700",
        role: "Farmer"
    },
    PROCESSOR_FIELD_INSPECTION: {
        icon: "🔬",
        label: "Agri Officer Field Inspection",
        labelTamil: "வேளாண்மை அதிகாரி கள ஆய்வு",
        color: "text-blue-400",
        gradient: "from-blue-600 to-cyan-700",
        role: "Agri Officer"
    },
    TAHSILDAR_VERIFICATION: {
        icon: "📋",
        label: "Tahsildar Verification",
        labelTamil: "தாசில்தார் சரிபார்ப்பு",
        color: "text-violet-400",
        gradient: "from-violet-600 to-purple-700",
        role: "Tahsildar"
    },
    DNA_SANCTIONED: {
        icon: "🏛️",
        label: "Admin Sanction",
        labelTamil: "Admin இறுதி ஒப்புதல்",
        color: "text-amber-400",
        gradient: "from-amber-600 to-orange-700",
        role: "IAgS / Admin"
    },
    DNA_FUND_DISBURSED: {
        icon: "💰",
        label: "Fund Disbursed",
        labelTamil: "நிதி வழங்கப்பட்டது",
        color: "text-green-400",
        gradient: "from-emerald-600 to-green-700",
        role: "IAgS / Admin"
    },
    DNA_REJECTED: {
        icon: "X",
        label: "Rejected by Admin",
        labelTamil: "Admin நிராகரித்தது",
        color: "text-red-400",
        gradient: "from-red-600 to-rose-700",
        role: "IAgS / Admin"
    },
};

const STATUS_MAP: Record<string, { label: string; color: string; tamil: string }> = {
    pending: { label: "Pending", color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30", tamil: "நிலுவையில் உள்ளது" },
    processor_approved: { label: "Agri Officer Approved", color: "bg-blue-500/20 text-blue-300 border-blue-500/30", tamil: "அதிகாரி அனுமதி" },
    processor_rejected: { label: "Agri Officer Rejected", color: "bg-red-500/20 text-red-300 border-red-500/30", tamil: "அதிகாரி நிராகரிப்பு" },
    tahsildar_approved: { label: "Tahsildar Approved", color: "bg-violet-500/20 text-violet-300 border-violet-500/30", tamil: "தாசில்தார் அனுமதி" },
    tahsildar_rejected: { label: "Tahsildar Rejected", color: "bg-red-500/20 text-red-300 border-red-500/30", tamil: "தாசில்தார் நிராகரிப்பு" },
    approved: { label: "Admin Sanctioned", color: "bg-amber-500/20 text-amber-300 border-amber-500/30", tamil: "Admin அனுமதி" },
    disbursed: { label: "Fund Disbursed ✅", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30", tamil: "நிதி வழங்கப்பட்டது" },
    rejected: { label: "Rejected", color: "bg-red-500/20 text-red-300 border-red-500/30", tamil: "நிராகரிக்கப்பட்டது" },
};

function EventCard({ event, index, total }: { event: any; index: number; total: number }) {
    const [expanded, setExpanded] = useState(index === 0);
    const cfg = STAGE_CONFIG[event.action] || {
        icon: "🔗", label: event.action, labelTamil: "", color: "text-gray-400",
        gradient: "from-gray-600 to-gray-700", role: event.actorRole || "System"
    };
    const isLast = index === total - 1;

    return (
        <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.12 }}
            className="relative flex gap-4"
        >
            {/* Timeline line */}
            <div className="flex flex-col items-center flex-shrink-0">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${cfg.gradient} flex items-center justify-center text-xl shadow-lg z-10 border-2 border-white/10`}>
                    {cfg.icon}
                </div>
                {!isLast && (
                    <div className="w-0.5 flex-1 min-h-[32px] mt-1 rounded-full"
                        style={{ background: "linear-gradient(to bottom, rgba(34,197,94,0.4), rgba(59,130,246,0.2))" }} />
                )}
            </div>

            {/* Card */}
            <div className={`flex-1 mb-4 glass-card p-4 border transition-all ${expanded ? 'border-green-500/30' : 'border-white/5 hover:border-white/10'}`}>
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className={`font-bold text-base ${cfg.color}`}>{cfg.label}</h3>
                            <span className="text-[10px] text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">{cfg.labelTamil}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(event.timestamp).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                            </span>
                            <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {event.actor} <span className="text-gray-600">({cfg.role})</span>
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="flex items-center gap-1 text-[10px] text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-1 rounded-full font-mono">
                            <ShieldCheck className="w-3 h-3" /> On-Chain
                        </span>
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-gray-400"
                        >
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
                            {/* Details Grid */}
                            {event.details && Object.keys(event.details).length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                                    {Object.entries(event.details).map(([k, v]: [string, any]) => (
                                        <div key={k} className="bg-white/5 rounded-xl p-2.5">
                                            <div className="text-[9px] text-gray-500 uppercase tracking-wider mb-0.5">{k.replace(/_/g, ' ')}</div>
                                            <div className="text-xs text-white font-medium break-all">
                                                {typeof v === 'boolean'
                                                    ? (v ? <span className="text-green-400 flex items-center gap-1"><Check className="w-3 h-3" /> Yes</span>
                                                        : <span className="text-red-400 flex items-center gap-1"><X className="w-3 h-3" /> No</span>)
                                                    : String(v)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* TX Hash */}
                            {event.txHash && (
                                <div className="flex items-center gap-2 text-xs bg-blue-950/40 border border-blue-500/10 rounded-xl p-2.5 font-mono">
                                    <Hash className="w-3 h-3 text-blue-400 flex-shrink-0" />
                                    <span className="text-blue-300 truncate">{event.txHash}</span>
                                    <a
                                        href={`https://amoy.polygonscan.com/tx/${event.txHash}`}
                                        target="_blank" rel="noopener noreferrer"
                                        className="ml-auto text-blue-400/60 hover:text-blue-400 flex-shrink-0"
                                    >
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

export default function ReliefTracePage({ params }: { params: { claimRef: string } }) {
    const claimRef = params.claimRef;
    const [claim, setClaim] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '');

    useEffect(() => {
        const fetchTrace = async () => {
            const { apiRequest } = await import("@/lib/api");
            try {
                const res = await apiRequest(`/compensation/trace/${claimRef}`, 'GET');
                if (res.status === 'success') setClaim(res.data);
            } catch (err) {
                console.error("Failed to fetch relief trace:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchTrace();
    }, [claimRef]);

    if (loading) {
        return (
            <div className="min-h-screen circuit-bg flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-white font-medium">Loading Blockchain Audit Trail...</p>
                    <p className="text-gray-500 text-sm mt-1">நிதி தணிக்கை தரவு ஏற்றுகிறது...</p>
                </div>
            </div>
        );
    }

    if (!claim) {
        return (
            <div className="min-h-screen circuit-bg flex flex-col">
                <Header />
                <div className="flex-1 flex flex-col items-center justify-center text-white gap-4">
                    <div className="text-6xl">🔍</div>
                    <h2 className="text-2xl font-bold">Claim Not Found</h2>
                    <p className="text-gray-400">Reference <span className="text-green-400 font-mono">{claimRef}</span> does not exist.</p>
                    <Link href="/scan" className="btn-glow px-8 py-3 rounded-xl text-white mt-4">Try Scanning Again</Link>
                </div>
            </div>
        );
    }

    const statusInfo = STATUS_MAP[claim.status] || { label: claim.status, color: "bg-gray-500/20 text-gray-300 border-gray-500/30", tamil: "" };
    const traceUrl = `${SITE_URL}/trace/relief/${claimRef}`;
    const events: any[] = claim.blockchainEvents || [];

    // Progress steps
    const stages = ['pending', 'processor_approved', 'tahsildar_approved', 'approved', 'disbursed'];
    const currentStageIndex = stages.indexOf(claim.status);

    return (
        <div className="min-h-screen circuit-bg">
            <Header />

            {/* Hero Banner */}
            <div className="relative overflow-hidden bg-gradient-to-b from-green-950/60 to-transparent py-14 px-4">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(34,197,94,0.08),transparent)]" />
                <div className="max-w-5xl mx-auto text-center relative z-10">
                    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-6xl mb-4">
                        🌾
                    </motion.div>
                    <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-black text-white mb-2" style={{ fontFamily: "Outfit, sans-serif" }}>
                        Relief Fund Audit Trail
                    </motion.h1>
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
                        className="text-gray-400 mb-1">உதவித்தொகை தணிக்கை பதிவு</motion.p>
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                        className="text-green-400 font-mono font-bold text-lg mb-6">{claimRef}</motion.p>
                    <div className="flex flex-wrap justify-center gap-3">
                        <span className={`text-xs px-3 py-1.5 rounded-full border font-medium ${statusInfo.color}`}>
                            {statusInfo.label} · {statusInfo.tamil}
                        </span>
                        <span className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border border-green-500/30 text-green-400 bg-green-500/5">
                            <ShieldCheck className="w-3.5 h-3.5" /> {events.length} Blockchain Events
                        </span>
                        {claim.status === 'disbursed' && (
                            <span className="text-xs px-3 py-1.5 rounded-full border border-emerald-500/30 text-emerald-400 bg-emerald-500/5 font-bold">
                                💰 ₹{claim.disbursedAmount?.toLocaleString('en-IN')} Disbursed
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Progress Stepper */}
            <div className="max-w-5xl mx-auto px-4 mb-8">
                <div className="glass-card p-6">
                    <h2 className="text-sm font-bold text-gray-400 mb-5 uppercase tracking-widest">Workflow Progress</h2>
                    <div className="flex items-center justify-between">
                        {[
                            { label: "Farmer\nSubmits", icon: "🌾", key: "pending" },
                            { label: "Agri Officer\nInspects", icon: "🔬", key: "processor_approved" },
                            { label: "Tahsildar\nVerifies", icon: "📋", key: "tahsildar_approved" },
                            { label: "Admin\nSanctions", icon: "🏛️", key: "approved" },
                            { label: "Fund\nReleased", icon: "💰", key: "disbursed" },
                        ].map((step, idx) => {
                            const done = currentStageIndex >= idx;
                            const active = currentStageIndex === idx;
                            const rejected = claim.status.includes('rejected') && idx > currentStageIndex;
                            return (
                                <div key={step.key} className="flex-1 flex flex-col items-center relative">
                                    {idx < 4 && (
                                        <div className={`absolute top-5 left-[50%] w-full h-0.5 z-0 ${done ? 'bg-green-500/60' : 'bg-white/10'}`} />
                                    )}
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg z-10 border-2 transition-all ${done ? 'border-green-500 bg-green-500/20 scale-110' : rejected ? 'border-red-500/30 bg-red-500/10' : 'border-white/10 bg-white/5'}`}>
                                        {step.icon}
                                    </div>
                                    <div className={`text-[10px] text-center mt-2 whitespace-pre-line font-medium ${done ? 'text-green-400' : 'text-gray-600'}`}>
                                        {step.label}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-5xl mx-auto px-4 pb-20">
                <div className="grid lg:grid-cols-3 gap-8">

                    {/* Blockchain Events Timeline */}
                    <div className="lg:col-span-2">
                        <div className="glass-card p-6">
                            <h2 className="font-bold text-white text-xl mb-8 flex items-center gap-2">
                                <span className="text-green-400">⛓️</span> Immutable Blockchain Audit Trail
                                <span className="text-xs text-gray-500 ml-1">· நிரந்தர தணிக்கை பதிவு</span>
                            </h2>
                            {events.length === 0 ? (
                                <div className="text-gray-500 text-center py-8 italic">
                                    <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                    No blockchain events recorded yet.
                                </div>
                            ) : (
                                <div>
                                    {events.map((ev, i) => (
                                        <EventCard key={i} event={ev} index={i} total={events.length} />
                                    ))}
                                    {/* Final seal */}
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: events.length * 0.12 }}
                                        className="flex items-center gap-3 p-4 rounded-2xl bg-green-500/5 border border-green-500/10 mt-2"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-400">
                                            <ShieldCheck className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-green-400">Blockchain Integrity Verified</div>
                                            <div className="text-[10px] text-gray-500">All {events.length} events are cryptographically secured and tamper-proof.</div>
                                        </div>
                                    </motion.div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-5">

                        {/* Claim Summary */}
                        <div className="glass-card p-5">
                            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-green-400" /> Claim Summary
                            </h3>
                            <div className="space-y-2.5 text-sm">
                                {[
                                    ["Farmer", claim.farmerName, "👤"],
                                    ["Crop", claim.cropType, "🌱"],
                                    ["Damage", claim.damageReason?.replace('_', ' '), "⚡"],
                                    ["Damage Date", claim.damageDate ? new Date(claim.damageDate).toLocaleDateString('en-IN') : '—', "📅"],
                                    ["Land Area", claim.landAreaAcres ? `${claim.landAreaAcres} acres` : '—', "🗺️"],
                                    ["Location", [claim.village, claim.taluk, claim.district].filter(Boolean).join(', '), "📍"],
                                ].map(([k, v, icon]) => (
                                    <div key={String(k)} className="flex items-start gap-2 py-1.5 border-b border-white/5">
                                        <span className="text-sm">{icon}</span>
                                        <span className="text-gray-500 w-20 flex-shrink-0 text-xs">{k}</span>
                                        <span className="text-white text-xs font-medium">{v || '—'}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Agri Officer Report */}
                        {claim.processorName && (
                            <div className="glass-card p-5 border-blue-500/10">
                                <h3 className="font-bold text-blue-400 mb-4 flex items-center gap-2">
                                    <Leaf className="w-4 h-4" /> Agri Officer Field Inspection
                                </h3>
                                <div className="space-y-2 text-xs">
                                    {[
                                        ["Agri Officer", claim.processorName],
                                        ["Total Land", claim.totalLandInspectedAcres ? `${claim.totalLandInspectedAcres} acres` : '—'],
                                        ["Damaged", claim.damagedLandAcres ? `${claim.damagedLandAcres} acres` : '—'],
                                        ["Damage %", claim.damageLevelPercent ? `${claim.damageLevelPercent}%` : '—'],
                                        ["Grade", claim.cropDamageGrade || '—'],
                                        ["Quoted", claim.estimatedAmount ? `₹${claim.estimatedAmount?.toLocaleString('en-IN')}` : '—'],
                                    ].map(([k, v]) => (
                                        <div key={String(k)} className="flex justify-between py-1 border-b border-white/5">
                                            <span className="text-gray-500">{k}</span>
                                            <span className="text-white font-medium">{v}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Tahsildar Verification */}
                        {claim.tahsildarName && (
                            <div className="glass-card p-5 border-violet-500/10">
                                <h3 className="font-bold text-violet-400 mb-4 flex items-center gap-2">
                                    <User className="w-4 h-4" /> Tahsildar Verdict
                                </h3>
                                <div className="space-y-2 text-xs">
                                    <div className="flex justify-between py-1 border-b border-white/5">
                                        <span className="text-gray-500">Tahsildar</span>
                                        <span className="text-white font-medium">{claim.tahsildarName}</span>
                                    </div>
                                    <div className="flex justify-between py-1 border-b border-white/5">
                                        <span className="text-gray-500">Decision</span>
                                        <span className={claim.tahsildarApproval ? 'text-green-400' : 'text-red-400'}>
                                            {claim.tahsildarApproval ? '✅ Approved' : '❌ Rejected'}
                                        </span>
                                    </div>
                                    {claim.tahsildarApprovedAmount && (
                                        <div className="flex justify-between py-1 border-b border-white/5">
                                            <span className="text-gray-500">Verified Amount</span>
                                            <span className="text-violet-400 font-bold">₹{claim.tahsildarApprovedAmount?.toLocaleString('en-IN')}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* DNA Final */}
                        {claim.approvedAmount && (
                            <div className="glass-card p-5 border-amber-500/10">
                                <h3 className="font-bold text-amber-400 mb-4 flex items-center gap-2">
                                    <IndianRupee className="w-4 h-4" /> Admin Final Sanction
                                </h3>
                                <div className="text-center py-2">
                                    <div className="text-3xl font-black text-emerald-400">
                                        ₹{(claim.disbursedAmount || claim.approvedAmount)?.toLocaleString('en-IN')}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {claim.status === 'disbursed' ? '✅ Successfully Disbursed' : '🕐 Awaiting Disbursement'}
                                    </div>
                                    {claim.transactionRef && (
                                        <div className="font-mono text-[10px] text-gray-500 mt-2 bg-white/5 p-2 rounded-lg">
                                            Ref: {claim.transactionRef}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* QR Code */}
                        <div className="glass-card p-5 text-center">
                            <h3 className="font-bold text-white mb-4">📱 Scan to Verify</h3>
                            <div className="bg-white p-4 rounded-2xl inline-block mb-3">
                                <QRCode value={traceUrl} size={150} level="H" />
                            </div>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Blockchain Verified · AgriTrace</p>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
