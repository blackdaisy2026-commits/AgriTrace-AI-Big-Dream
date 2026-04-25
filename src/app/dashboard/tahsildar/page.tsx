"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRole } from "@/lib/role-context";
import Header from "@/components/Header";
import toast from "react-hot-toast";
import { apiRequest } from "@/lib/api";
import Link from "next/link";
import {
    CheckCircle, XCircle, Loader2, Eye, MapPin, User, FileText,
    AlertCircle, ClipboardCheck, IndianRupee, Leaf, TrendingUp,
    ArrowRight, ShieldCheck, BarChart3, Clock, QrCode
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

const STATUS_COLORS: Record<string, string> = {
    processor_approved: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    tahsildar_review: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    tahsildar_approved: "bg-green-500/20 text-green-300 border-green-500/30",
    tahsildar_rejected: "bg-red-500/20 text-red-300 border-red-500/30",
    dna_review: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    dna_approved: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
};

const STATUS_LABELS: Record<string, string> = {
    processor_approved: "⏳ Awaiting Your Review",
    tahsildar_review: "🔍 Under Review",
    tahsildar_approved: "✅ Approved → Sent to TNAS",
    tahsildar_rejected: "❌ Rejected by You",
    dna_review: "📋 At Admin / IAgS",
    dna_approved: "🎉 IAgS Approved",
};

// ─── Workflow Step Banner ──────────────────────────────────────────────────────
function WorkflowBanner() {
    const steps = [
        { icon: "🌾", label: "Farmer", sub: "Submits Claim" },
        { icon: "🔬", label: "Agri Officer", sub: "Field Inspection" },
        { icon: "📋", label: "Tahsildar", sub: "Verify & Approve", active: true },
        { icon: "🏛️", label: "IAgS / Admin", sub: "Final Sanction" },
        { icon: "💰", label: "Fund", sub: "Disbursed" },
    ];
    return (
        <div className="glass-card p-4 mb-6 overflow-x-auto">
            <div className="flex items-center gap-2 min-w-max">
                {steps.map((s, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <div className={`flex flex-col items-center px-3 py-2 rounded-xl transition-all ${s.active ? 'bg-purple-500/20 border border-purple-500/40' : 'opacity-50'}`}>
                            <span className="text-xl">{s.icon}</span>
                            <span className={`text-[11px] font-bold ${s.active ? 'text-purple-300' : 'text-gray-500'}`}>{s.label}</span>
                            <span className="text-[9px] text-gray-600">{s.sub}</span>
                        </div>
                        {i < steps.length - 1 && <ArrowRight className={`w-4 h-4 ${s.active ? 'text-purple-400' : 'text-gray-700'}`} />}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function TahsildarDashboard() {
    const { user, token, isAuthenticated } = useRole();
    const [claims, setClaims] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedClaim, setSelectedClaim] = useState<any>(null);
    const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '');
    const [detailLoading, setDetailLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState<'pending' | 'decided'>('pending');

    // Decision form
    const [decision, setDecision] = useState<"approve" | "reject" | null>(null);
    const [notes, setNotes] = useState("");
    const [revisedAmount, setRevisedAmount] = useState("");
    const [amountError, setAmountError] = useState("");

    useEffect(() => { fetchClaims(); }, [token]);

    const fetchClaims = async () => {
        if (!token) return;
        setLoading(true);
        const res = await apiRequest('/compensation/for-tahsildar', 'GET', null, token);
        if (res.status === 'success') setClaims(res.data);
        setLoading(false);
    };

    const openClaim = async (c: any) => {
        setDetailLoading(true);
        setSelectedClaim(null);
        setDecision(null);
        setNotes("");
        setRevisedAmount("");
        setAmountError("");
        const res = await apiRequest(`/compensation/${c._id}/details`, 'GET', null, token);
        if (res.status === 'success') setSelectedClaim(res.data);
        else toast.error("Failed to load claim details");
        setDetailLoading(false);
    };

    const handleAmountChange = (val: string) => {
        setRevisedAmount(val);
        if (!val) { setAmountError(""); return; }
        const n = parseFloat(val);
        const base = selectedClaim?.estimatedAmount || 0;
        if (n < base) {
            setAmountError(`❌ Amount cannot be less than ₹${base.toLocaleString('en-IN')} (Agri Officer's quote). You can only INCREASE.`);
        } else {
            setAmountError("");
        }
    };

    const handleDecision = async () => {
        if (!selectedClaim || !decision) return;
        if (!notes.trim()) { toast.error("Please add verification notes."); return; }
        if (amountError) { toast.error("Fix the amount error first."); return; }

        const base = selectedClaim.estimatedAmount || 0;
        const amt = revisedAmount ? parseFloat(revisedAmount) : base;

        if (amt < base) {
            toast.error(`❌ Cannot decrease amount. Enter ₹${base.toLocaleString('en-IN')} or higher.`);
            return;
        }

        setSubmitting(true);
        const res = await apiRequest(`/compensation/${selectedClaim._id}/tahsildar-decision`, 'PATCH', {
            approved: decision === 'approve',
            tahsildarNotes: notes,
            tahsildarApprovedAmount: amt
        }, token);
        setSubmitting(false);

        if (res.status === 'success') {
            toast.success(res.message);
            setSelectedClaim(null);
            fetchClaims();
        } else {
            toast.error(res.message);
        }
    };

    if (!isAuthenticated || user?.role !== 'tahsildar') {
        return (
            <div className="min-h-screen circuit-bg flex flex-col">
                <Header />
                <div className="flex-1 flex items-center justify-center">
                    <div className="glass-card p-8 text-center">
                        <div className="text-4xl mb-4">🔒</div>
                        <h2 className="text-xl font-bold text-white mb-2">Tahsildar Access Required</h2>
                        <Link href="/login?role=tahsildar">
                            <button className="btn-glow text-white mt-4 px-6 py-2 rounded-xl">Login as Tahsildar</button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const pending = claims.filter(c => ['processor_approved', 'tahsildar_review'].includes(c.status));
    const decided = claims.filter(c => ['tahsildar_approved', 'tahsildar_rejected', 'dna_review', 'dna_approved'].includes(c.status));

    return (
        <div className="min-h-screen circuit-bg flex flex-col">
            <Header />
            <div className="max-w-7xl mx-auto w-full px-4 py-8 space-y-5">

                {/* Header Card */}
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 border-purple-500/20">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-3xl">📋</div>
                        <div>
                            <h1 className="text-2xl font-black text-white">Tahsildar Dashboard</h1>
                            <p className="text-purple-400 text-sm">{user?.name} · {user?.district} District · Relief Fund Verification Officer</p>
                        </div>
                        <div className="ml-auto flex gap-6">
                            {[
                                { value: pending.length, label: "Awaiting Review", color: "text-amber-400" },
                                { value: decided.filter(d => d.status === 'tahsildar_approved').length, label: "Approved", color: "text-green-400" },
                                { value: decided.filter(d => d.status === 'tahsildar_rejected').length, label: "Rejected", color: "text-red-400" },
                            ].map((s, i) => (
                                <div key={i} className="text-center">
                                    <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
                                    <div className="text-[10px] text-gray-500">{s.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Workflow Banner */}
                <WorkflowBanner />

                {/* Important Rule Banner */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
                    className="glass-card p-4 border-amber-500/20 bg-amber-500/5 flex items-start gap-3">
                    <TrendingUp className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                        <span className="text-amber-400 font-bold">Tahsildar Rule: </span>
                        <span className="text-gray-300">You may <b className="text-green-400">INCREASE</b> the Agri Officer's quoted relief amount based on your field assessment. You <b className="text-red-400">CANNOT DECREASE</b> it. If the Agri Officer-quoted amount is acceptable, leave the amount field blank to confirm it. After approval, the claim is forwarded to <b className="text-purple-400">IAgS / Admin</b> for final sanction and payment disbursement.</span>
                    </div>
                </motion.div>

                {/* Tab Strip */}
                <div className="flex gap-2">
                    <button onClick={() => setActiveTab('pending')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${activeTab === 'pending' ? 'bg-amber-500 text-black shadow-lg' : 'bg-white/5 text-gray-400 hover:text-white'}`}>
                        <Clock className="w-4 h-4" /> Pending Review
                        {pending.length > 0 && <span className="ml-1 px-1.5 py-0.5 rounded-full bg-black/30 text-[10px] font-black">{pending.length}</span>}
                    </button>
                    <button onClick={() => setActiveTab('decided')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${activeTab === 'decided' ? 'bg-purple-600 text-white shadow-lg' : 'bg-white/5 text-gray-400 hover:text-white'}`}>
                        <BarChart3 className="w-4 h-4" /> My Decisions
                        {decided.length > 0 && <span className="ml-1 px-1.5 py-0.5 rounded-full bg-black/30 text-[10px] font-black">{decided.length}</span>}
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* ── LEFT: Claims List ── */}
                    <div className="space-y-3">
                        {loading ? (
                            <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-purple-400" /></div>
                        ) : (activeTab === 'pending' ? pending : decided).length === 0 ? (
                            <div className="glass-card p-10 text-center text-gray-500">
                                <ClipboardCheck className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p>{activeTab === 'pending' ? 'No pending claims. All caught up! ✅' : 'No decisions made yet.'}</p>
                            </div>
                        ) : (
                            (activeTab === 'pending' ? pending : decided).map((c) => (
                                <motion.div
                                    key={c._id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    onClick={() => openClaim(c)}
                                    className={`glass-card p-4 cursor-pointer transition-all hover:border-purple-500/40 ${selectedClaim?._id === c._id ? 'border-purple-500/60 bg-purple-500/5' : 'border-white/5'}`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-xl flex-shrink-0">🌾</div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                                <span className="font-bold text-white">{c.farmerName}</span>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${STATUS_COLORS[c.status] || 'bg-gray-500/20 text-gray-300 border-gray-500/30'}`}>
                                                    {STATUS_LABELS[c.status] || c.status}
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-400 font-mono">{c.claimRefNo}</div>
                                            <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                                <MapPin className="w-3 h-3" /> {c.village}, {c.taluk}
                                            </div>
                                            <div className="flex items-center gap-3 mt-2 flex-wrap">
                                                <span className="text-xs text-blue-400">🌿 {c.cropType} · {c.damageReason}</span>
                                                {c.estimatedAmount && (
                                                    <span className="text-xs font-bold text-green-400">
                                                        Agri Officer: ₹{c.estimatedAmount?.toLocaleString('en-IN')}
                                                    </span>
                                                )}
                                                {c.tahsildarApprovedAmount && c.tahsildarApprovedAmount !== c.estimatedAmount && (
                                                    <span className="text-xs font-bold text-purple-400">
                                                        You: ₹{c.tahsildarApprovedAmount?.toLocaleString('en-IN')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <button className="p-2 rounded-lg bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 flex-shrink-0">
                                            <Eye className="w-4 h-4" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>

                    {/* ── RIGHT: Detail Panel ── */}
                    <div>
                        {detailLoading && (
                            <div className="glass-card p-16 flex items-center justify-center">
                                <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
                            </div>
                        )}

                        {!detailLoading && !selectedClaim && (
                            <div className="glass-card p-10 text-center text-gray-500 border-dashed border-white/10">
                                <Eye className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p>Click a claim on the left to review</p>
                            </div>
                        )}

                        {!detailLoading && selectedClaim && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">

                                {/* Claim Ref Header */}
                                <div className="glass-card p-4 flex items-center justify-between gap-3 flex-wrap">
                                    <div>
                                        <div className="text-xs text-gray-500">Claim Reference</div>
                                        <div className="font-black text-white font-mono text-lg">{selectedClaim.claimRefNo}</div>
                                    </div>
                                    <span className={`text-sm px-3 py-1.5 rounded-full border font-medium ${STATUS_COLORS[selectedClaim.status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
                                        {STATUS_LABELS[selectedClaim.status] || selectedClaim.status}
                                    </span>
                                </div>

                                {/* Farmer Details */}
                                <div className="glass-card p-5 border-green-500/10">
                                    <h3 className="font-bold text-green-400 mb-3 flex items-center gap-2 text-sm">
                                        <User className="w-4 h-4" /> Farmer / Claim Details
                                    </h3>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        {[
                                            { label: "Farmer Name", value: selectedClaim.farmerName },
                                            { label: "Aadhaar No", value: selectedClaim.aadhaarNo },
                                            { label: "Uzhavar Attai", value: selectedClaim.uzhavarAttaiNo },
                                            { label: "Mobile", value: selectedClaim.mobileNo },
                                            { label: "Village", value: selectedClaim.village },
                                            { label: "Taluk / District", value: `${selectedClaim.taluk}, ${selectedClaim.district}` },
                                            { label: "Land (Acres)", value: selectedClaim.landAreaAcres },
                                            { label: "Crop / Season", value: `${selectedClaim.cropType} · ${selectedClaim.cropSeason || '—'}` },
                                        ].map((item, i) => (
                                            <div key={i} className="bg-white/5 p-2 rounded-lg">
                                                <div className="text-[9px] text-gray-500 uppercase">{item.label}</div>
                                                <div className="text-white text-xs font-medium truncate">{item.value || '—'}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-2 p-2 rounded-lg bg-red-500/5 border border-red-500/10 text-xs">
                                        <span className="text-red-400 font-bold">Damage: </span>
                                        <span className="text-gray-300">{selectedClaim.damageReason} — {selectedClaim.damageDescription}</span>
                                    </div>
                                    {selectedClaim.photoUrls?.length > 0 && (
                                        <div className="mt-2">
                                            <div className="text-[10px] text-gray-500 mb-1">📍 Geo-tagged Photos ({selectedClaim.photoUrls.length})</div>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedClaim.photoUrls.slice(0, 4).map((url: string, i: number) => (
                                                    <img key={i} src={url} alt={`Photo ${i + 1}`}
                                                        className="w-16 h-16 object-cover rounded-lg border border-white/10 cursor-pointer hover:scale-105 transition-transform" />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Processor Report */}
                                <div className="glass-card p-5 border-blue-500/10">
                                    <h3 className="font-bold text-blue-400 mb-3 flex items-center gap-2 text-sm">
                                        <Leaf className="w-4 h-4" /> Agri Officer Field Inspection Report
                                    </h3>
                                    <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                                        {[
                                            { label: "Agri Officer", value: selectedClaim.processorName },
                                            { label: "Inspection Date", value: selectedClaim.inspectionDate ? new Date(selectedClaim.inspectionDate).toLocaleDateString('en-IN') : '—' },
                                            { label: "Total Land (Acres)", value: selectedClaim.totalLandInspectedAcres },
                                            { label: "Damaged (Acres)", value: selectedClaim.damagedLandAcres },
                                            { label: "Damage %", value: selectedClaim.damageLevelPercent ? `${selectedClaim.damageLevelPercent}%` : '—' },
                                            { label: "Damage Grade", value: selectedClaim.cropDamageGrade },
                                        ].map((item, i) => (
                                            <div key={i} className="bg-white/5 p-2 rounded-lg">
                                                <div className="text-[9px] text-gray-500 uppercase">{item.label}</div>
                                                <div className="text-white text-xs font-medium">{item.value || '—'}</div>
                                            </div>
                                        ))}
                                    </div>
                                    {selectedClaim.inspectionNotes && (
                                        <div className="p-2 rounded-lg bg-blue-500/5 border border-blue-500/10 text-xs text-gray-300 mb-3">
                                            <span className="text-blue-400 font-bold">Notes: </span>{selectedClaim.inspectionNotes}
                                        </div>
                                    )}
                                    {/* Processor Amount Box */}
                                    <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-between">
                                        <div>
                                            <div className="text-[10px] text-gray-400 uppercase font-bold">Agri Officer Quoted Relief</div>
                                            <div className="text-3xl font-black text-blue-400">₹{selectedClaim.estimatedAmount?.toLocaleString('en-IN') || '—'}</div>
                                        </div>
                                        <ArrowRight className="w-6 h-6 text-gray-600" />
                                        <div className="text-right">
                                            <div className="text-[10px] text-gray-400 uppercase font-bold">Your Decision Amount</div>
                                            <div className="text-3xl font-black text-purple-400">
                                                ₹{(revisedAmount ? parseFloat(revisedAmount) : selectedClaim.tahsildarApprovedAmount || selectedClaim.estimatedAmount)?.toLocaleString('en-IN') || '—'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* ── Decision Panel — only for pending claims ── */}
                                {['processor_approved', 'tahsildar_review'].includes(selectedClaim.status) && (
                                    <div className="glass-card p-5 border-amber-500/10">
                                        <h3 className="font-bold text-amber-400 mb-4 flex items-center gap-2 text-sm">
                                            <ClipboardCheck className="w-4 h-4" /> Your Verification Decision
                                        </h3>

                                        {/* Amount Input with increase-only hint */}
                                        <div className="mb-4">
                                            <label className="flex items-center gap-2 text-sm text-gray-300 mb-1 font-medium">
                                                <TrendingUp className="w-4 h-4 text-green-400" />
                                                Revised Amount (₹) — <span className="text-green-400 font-bold">Increase only, or leave blank</span>
                                            </label>
                                            <div className="relative">
                                                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 text-green-300 z-20" />
                                                <input
                                                    type="number"
                                                    value={revisedAmount}
                                                    onChange={e => handleAmountChange(e.target.value)}
                                                    placeholder={selectedClaim.estimatedAmount?.toString()}
                                                    min={selectedClaim.estimatedAmount}
                                                    className={`agri-input !pl-24 ${amountError ? 'border-red-500/50' : ''}`}
                                                />
                                            </div>
                                            {amountError ? (
                                                <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                                                    <AlertCircle className="w-3 h-3" /> {amountError}
                                                </p>
                                            ) : (
                                                <p className="text-[11px] text-gray-500 mt-1">
                                                    Min: ₹{selectedClaim.estimatedAmount?.toLocaleString('en-IN')} (Agri Officer's quote). Leave blank to confirm as-is.
                                                </p>
                                            )}
                                            {revisedAmount && parseFloat(revisedAmount) > (selectedClaim.estimatedAmount || 0) && !amountError && (
                                                <p className="text-xs text-green-400 mt-1">
                                                    ✅ Increase of ₹{(parseFloat(revisedAmount) - selectedClaim.estimatedAmount).toLocaleString('en-IN')} applied.
                                                </p>
                                            )}
                                        </div>

                                        {/* Notes */}
                                        <div className="mb-4">
                                            <label className="block text-sm text-gray-300 mb-1 font-medium">
                                                Verification Notes <span className="text-red-400">*</span>
                                            </label>
                                            <textarea
                                                value={notes}
                                                onChange={e => setNotes(e.target.value)}
                                                rows={3}
                                                placeholder="Write your field verification observations, reasons for approval or rejection..."
                                                className="agri-input resize-none"
                                            />
                                        </div>

                                        {/* Approve / Reject Buttons */}
                                        <div className="flex gap-3 mb-3">
                                            <button
                                                onClick={() => setDecision('approve')}
                                                className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 border transition-all text-sm ${decision === 'approve' ? 'bg-green-600 text-white border-green-500 shadow-lg shadow-green-900/30' : 'bg-green-500/10 text-green-400 border-green-500/30 hover:bg-green-500/20'}`}
                                            >
                                                <CheckCircle className="w-4 h-4" /> Approve & Forward to TNAS
                                            </button>
                                            <button
                                                onClick={() => setDecision('reject')}
                                                className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 border transition-all text-sm ${decision === 'reject' ? 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-900/30' : 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20'}`}
                                            >
                                                <XCircle className="w-4 h-4" /> Reject Claim
                                            </button>
                                        </div>

                                        <AnimatePresence>
                                            {decision && (
                                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                                                    {/* Summary before submit */}
                                                    <div className={`p-3 rounded-xl mb-3 text-sm border ${decision === 'approve' ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                                                        <div className="font-bold text-white mb-1">
                                                            {decision === 'approve' ? '✅ Confirm Approval' : '❌ Confirm Rejection'}
                                                        </div>
                                                        {decision === 'approve' && (
                                                            <div className="text-xs text-gray-400 space-y-1">
                                                                <div>Agri Officer Amount: <span className="text-blue-400">₹{selectedClaim.estimatedAmount?.toLocaleString('en-IN')}</span></div>
                                                                <div>Your Approved Amount: <span className="text-green-400 font-bold">₹{(revisedAmount ? parseFloat(revisedAmount) : selectedClaim.estimatedAmount)?.toLocaleString('en-IN')}</span></div>
                                                                <div className="text-purple-300 font-medium">→ Will be forwarded to IAgS / Admin for final payment sanction.</div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={handleDecision}
                                                        disabled={submitting || !!amountError}
                                                        className={`w-full py-4 rounded-xl font-black text-white flex items-center justify-center gap-2 transition-colors disabled:opacity-50 ${decision === 'approve' ? 'bg-green-600 hover:bg-green-500' : 'bg-red-600 hover:bg-red-500'}`}
                                                    >
                                                        {submitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</> :
                                                            decision === 'approve'
                                                                ? `✅ Approve & Send to TNAS — ₹${(revisedAmount ? parseFloat(revisedAmount) : selectedClaim.estimatedAmount)?.toLocaleString('en-IN')}`
                                                                : '❌ Confirm Rejection'
                                                        }
                                                    </button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )}

                                {/* Already Decided View */}
                                {['tahsildar_approved', 'tahsildar_rejected', 'dna_review', 'dna_approved'].includes(selectedClaim.status) && (
                                    <div className={`glass-card p-5 ${selectedClaim.status === 'tahsildar_approved' || selectedClaim.status === 'dna_review' || selectedClaim.status === 'dna_approved' ? 'border-green-500/20' : 'border-red-500/20'}`}>
                                        <div className="font-bold text-white mb-2 flex items-center gap-2">
                                            {selectedClaim.status !== 'tahsildar_rejected'
                                                ? <><CheckCircle className="w-5 h-5 text-green-400" /> You Approved This Claim</>
                                                : <><XCircle className="w-5 h-5 text-red-400" /> You Rejected This Claim</>
                                            }
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                                            <div className="bg-white/5 p-2 rounded-lg">
                                                <div className="text-gray-500">Agri Officer Quoted</div>
                                                <div className="text-blue-400 font-bold">₹{selectedClaim.estimatedAmount?.toLocaleString('en-IN')}</div>
                                            </div>
                                            {selectedClaim.tahsildarApprovedAmount && (
                                                <div className="bg-white/5 p-2 rounded-lg">
                                                    <div className="text-gray-500">Your Approved Amount</div>
                                                    <div className="text-green-400 font-bold">₹{selectedClaim.tahsildarApprovedAmount?.toLocaleString('en-IN')}</div>
                                                </div>
                                            )}
                                        </div>
                                        {selectedClaim.tahsildarNotes && (
                                            <div className="text-xs text-gray-400 bg-white/5 p-2 rounded-lg mb-3">{selectedClaim.tahsildarNotes}</div>
                                        )}
                                        {/* Next stage status */}
                                        {selectedClaim.status === 'tahsildar_approved' && (
                                            <div className="flex items-center gap-2 text-xs text-purple-300 bg-purple-500/5 border border-purple-500/20 p-2 rounded-lg">
                                                <ArrowRight className="w-3 h-3" /> Forwarded to IAgS / Admin for final sanction
                                            </div>
                                        )}
                                        {selectedClaim.status === 'dna_approved' && (
                                            <div className="flex items-center gap-2 text-xs text-green-300 bg-green-500/5 border border-green-500/20 p-2 rounded-lg">
                                                <ShieldCheck className="w-3 h-3" /> IAgS / Admin has sanctioned this claim 🎉
                                            </div>
                                        )}
                                        {/* QR Code for trace */}
                                        {selectedClaim.claimRefNo && (
                                            <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-3">
                                                <div className="bg-white p-2 rounded-lg">
                                                    <QRCodeSVG
                                                        value={`${SITE_URL}/trace/relief/${selectedClaim.claimRefNo}`}
                                                        size={64} level="M" bgColor="#ffffff" fgColor="#111111"
                                                    />
                                                </div>
                                                <div>
                                                    <div className="text-xs text-gray-500">Blockchain Trace QR</div>
                                                    <div className="text-[10px] text-purple-400 font-mono">{selectedClaim.claimRefNo}</div>
                                                    <Link href={`/trace/relief/${selectedClaim.claimRefNo}`} target="_blank">
                                                        <button className="text-xs text-blue-400 hover:underline flex items-center gap-1 mt-1">
                                                            <QrCode className="w-3 h-3" /> View Full Audit Trail →
                                                        </button>
                                                    </Link>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
