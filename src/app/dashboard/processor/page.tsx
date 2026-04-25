"use client";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRole } from "@/lib/role-context";
import Header from "@/components/Header";
import toast from "react-hot-toast";
import {
    Loader2, FlaskConical, CheckCircle, Sprout, Clock, ShieldCheck,
    AlertTriangle, IndianRupee, Award, User
} from "lucide-react";
import Link from "next/link";
import { apiRequest } from "@/lib/api";

export default function ProcessorDashboard() {
    const { user, token, isAuthenticated } = useRole();
    const [liveBatches, setLiveBatches] = useState<any[]>([]);
    const [selectedBatch, setSelectedBatch] = useState<string>("");
    const [tests, setTests] = useState({ ph: "", pesticide: "", brix: "", grade: "A", certify: false });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'inspection' | 'quality' | 'relief'>('inspection');

    // Relief fund state
    const [claims, setClaims] = useState<any[]>([]);
    const [selectedClaim, setSelectedClaim] = useState<any>(null);
    const [inspection, setInspection] = useState({ notes: "", amount: "", approved: true });

    // Harvest inspection state
    const [harvestApps, setHarvestApps] = useState<any[]>([]);
    const [selectedApp, setSelectedApp] = useState<any>(null);
    const [cropInspection, setCropInspection] = useState({
        qualityGrade: "A",
        organicVerified: false,
        pesticideResult: "",
        phLevel: "",
        inspectionNotes: "",
        adjustedPrice: "",
        approved: true
    });

    useEffect(() => {
        if (!token) return;

        const fetchAll = async () => {
            const [batchRes, claimRes, harvestRes] = await Promise.all([
                apiRequest('/batches', 'GET', null, token),
                apiRequest('/compensation/for-inspection', 'GET', null, token),
                apiRequest('/harvest/for-inspection', 'GET', null, token)
            ]);
            if (batchRes.status === 'success') {
                setLiveBatches(batchRes.data);
                if (batchRes.data.length > 0) setSelectedBatch(batchRes.data[0].batchId);
            }
            if (claimRes.status === 'success') setClaims(claimRes.data);
            if (harvestRes.status === 'success') setHarvestApps(harvestRes.data);
        };
        fetchAll();
    }, [token]);

    if (!isAuthenticated || user?.role !== "processor") {
        return (
            <div className="min-h-screen circuit-bg flex flex-col">
                <Header />
                <div className="flex-1 flex items-center justify-center">
                    <div className="glass-card p-8 text-center">
                        <div className="text-4xl mb-4">🔬</div>
                        <h2 className="text-xl font-bold text-white mb-2">Agri Officer Access Required</h2>
                        <Link href="/login?role=processor"><button className="btn-glow text-white mt-4 px-6 py-2 rounded-xl">Login as Agri Officer</button></Link>
                    </div>
                </div>
            </div>
        );
    }

    // ── Quality Test Submit ──
    const handleSubmit = async () => {
        if (!tests.ph || !tests.pesticide) { toast.error("Fill pH and pesticide results"); return; }
        if (!selectedBatch) { toast.error("No batch selected"); return; }
        setLoading(true);
        try {
            const res = await apiRequest('/events', 'POST', {
                batchId: selectedBatch,
                stage: "QualityCheck",
                location: "Dindigul APC Unit Lab",
                details: { grade: tests.grade, ph: tests.ph, pesticide: tests.pesticide, brix: tests.brix, certified: tests.certify }
            }, token);
            if (res.status === 'success') {
                toast.success("🧪 Quality test results recorded on blockchain!");
                setSubmitted(true);
            } else {
                toast.error(res.message || "Failed to record test results");
            }
        } catch (err) {
            toast.error("Network error");
        } finally { setLoading(false); }
    };

    // ── Relief Fund Inspection Submit ──
    const handleReliefInspection = async () => {
        if (!inspection.notes || !inspection.amount) { toast.error("Fill field notes and estimated amount"); return; }
        setLoading(true);
        try {
            const res = await apiRequest(`/compensation/${selectedClaim._id}/inspect`, 'PATCH', {
                inspectionNotes: inspection.notes,
                estimatedAmount: Number(inspection.amount),
                approved: inspection.approved
            }, token);
            if (res.status === 'success') {
                toast.success("✅ Inspection report submitted!");
                setClaims(prev => prev.map(c => c._id === selectedClaim._id ? res.data.claim : c));
                setSelectedClaim(null);
                setInspection({ notes: "", amount: "", approved: true });
            }
        } catch (err) { toast.error("Failed to submit inspection"); }
        finally { setLoading(false); }
    };

    // ── Crop Harvest Inspection Submit ──
    const handleCropInspection = async () => {
        if (!cropInspection.inspectionNotes) { toast.error("Please add inspection notes"); return; }
        setLoading(true);
        try {
            const payload: any = {
                qualityGrade: cropInspection.qualityGrade,
                organicVerified: cropInspection.organicVerified,
                pesticideResult: cropInspection.pesticideResult,
                phLevel: cropInspection.phLevel,
                inspectionNotes: cropInspection.inspectionNotes,
                approved: cropInspection.approved
            };
            if (cropInspection.adjustedPrice) {
                payload.adjustedPrice = Number(cropInspection.adjustedPrice);
            }

            const res = await apiRequest(`/harvest/${selectedApp._id}/inspect`, 'PATCH', payload, token);
            if (res.status === 'success') {
                toast.success(res.message || "Inspection submitted!");
                setHarvestApps(prev => prev.map(a => a._id === selectedApp._id ? res.data.application : a).filter(a => ['pending', 'inspecting'].includes(a.status)));
                setSelectedApp(null);
                setCropInspection({
                    qualityGrade: "A", organicVerified: false, pesticideResult: "",
                    phLevel: "", inspectionNotes: "", adjustedPrice: "", approved: true
                });
            } else {
                toast.error(res.message || "Failed");
            }
        } catch (err) { toast.error("Network error"); }
        finally { setLoading(false); }
    };

    // Calculate price adjustment limits
    const getPriceRange = () => {
        if (!selectedApp) return { min: 0, max: 0 };
        const base = selectedApp.farmerPricePerKg;
        const maxChange = base * 0.002;
        return { min: (base - maxChange).toFixed(2), max: (base + maxChange).toFixed(2) };
    };

    const getDeadlineInfo = (app: any) => {
        const now = new Date();
        const deadline = new Date(app.inspectionDeadline);
        const diffMs = deadline.getTime() - now.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);
        if (diffHours <= 0) return { text: 'EXPIRED', color: 'text-red-500', urgent: true };
        if (diffHours <= 24) return { text: `${Math.ceil(diffHours)}h left`, color: 'text-red-400', urgent: true };
        if (diffHours <= 48) return { text: `${Math.ceil(diffHours)}h left`, color: 'text-amber-400', urgent: false };
        return { text: `${Math.ceil(diffHours / 24)}d left`, color: 'text-green-400', urgent: false };
    };

    return (
        <div className="min-h-screen circuit-bg">
            <Header />
            <div className="max-w-4xl mx-auto px-4 py-8">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>🔬 Agri Officer Dashboard</h1>
                        <p className="text-gray-400">Welcome, <span className="text-blue-400">{user?.name}</span></p>
                    </div>
                    <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                        <button onClick={() => setActiveTab('inspection')} className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${activeTab === 'inspection' ? 'bg-green-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>
                            🌾 Crop Inspection
                        </button>
                        <button onClick={() => setActiveTab('quality')} className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${activeTab === 'quality' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>
                            🔬 Quality Tests
                        </button>
                        <button onClick={() => setActiveTab('relief')} className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${activeTab === 'relief' ? 'bg-amber-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>
                            💰 Relief Fund
                        </button>
                    </div>
                </motion.div>

                {/* ═══════════════════════ CROP INSPECTION TAB ═══════════════════════ */}
                {activeTab === 'inspection' && (
                    <div className="space-y-6">
                        {/* Pending Applications */}
                        <div className="glass-card p-5">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <Sprout className="text-green-400 w-5 h-5" />
                                Harvest Applications ({harvestApps.length})
                                <span className="text-xs text-gray-500 font-normal ml-2">District: {user?.district || 'All'}</span>
                            </h2>

                            {harvestApps.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">No pending harvest applications</p>
                            ) : (
                                <div className="space-y-3">
                                    {harvestApps.map((app) => {
                                        const dl = getDeadlineInfo(app);
                                        return (
                                            <div
                                                key={app._id}
                                                onClick={() => {
                                                    setSelectedApp(app);
                                                    setCropInspection(ci => ({ ...ci, adjustedPrice: String(app.farmerPricePerKg) }));
                                                }}
                                                className={`p-4 rounded-2xl border transition-all cursor-pointer ${selectedApp?._id === app._id ? 'border-green-500 bg-green-500/10' : 'border-white/5 bg-white/5 hover:border-white/10'}`}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <div className="font-bold text-white capitalize">{app.cropType} {app.cropVariety ? `(${app.cropVariety})` : ''}</div>
                                                        <div className="text-xs text-gray-500">
                                                            {app.farmerName} · {app.farmerDistrict} · {app.quantityKg}kg · ₹{app.farmerPricePerKg}/kg
                                                        </div>
                                                        <div className="text-[10px] text-gray-600 font-mono mt-1">{app.applicationId}</div>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-1">
                                                        <span className={`text-[10px] px-2 py-1 rounded-full border font-bold flex items-center gap-1 ${dl.urgent ? 'border-red-500/30 bg-red-500/10' : 'border-green-500/30 bg-green-500/10'}`}>
                                                            <Clock className="w-3 h-3" />
                                                            <span className={dl.color}>{dl.text}</span>
                                                        </span>
                                                        {app.isOrganic && <span className="text-[10px] text-green-400">🌿 Claims Organic</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Inspection Form */}
                        {selectedApp && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 border-green-500/20">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center justify-between">
                                    <span className="flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-green-400" /> Inspect: {selectedApp.applicationId}</span>
                                    <span className={`text-xs ${getDeadlineInfo(selectedApp).color}`}>⏰ Deadline: {new Date(selectedApp.inspectionDeadline).toLocaleDateString('en-IN')}</span>
                                </h3>

                                {/* Farmer Profile */}
                                <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20 mb-6">
                                    <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <User className="w-3 h-3" /> Farmer Profile Details
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-gray-500 uppercase">Name & Contact</span>
                                            <span className="text-white text-sm font-bold">{selectedApp.farmerName}</span>
                                            <span className="text-blue-400 text-xs">{selectedApp.farmerMobile}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-gray-500 uppercase">Location</span>
                                            <span className="text-white text-sm capitalize">{selectedApp.farmerVillage}, {selectedApp.farmerTaluk}</span>
                                            <span className="text-gray-400 text-xs">{selectedApp.farmerDistrict}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-gray-500 uppercase">Aadhaar & Uzhavar Card</span>
                                            <span className="text-white text-sm font-mono">{selectedApp.farmerAadhaar || 'N/A'}</span>
                                            <span className="text-green-400 text-xs font-mono">{selectedApp.farmerUzhavarCard || 'N/A'}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-gray-500 uppercase">Land & Crop Context</span>
                                            <span className="text-white text-sm line-clamp-1" title={selectedApp.farmerLandDetails}>L: {selectedApp.farmerLandDetails || 'N/A'}</span>
                                            <span className="text-amber-400 text-xs line-clamp-1" title={selectedApp.farmerCropDetails}>C: {selectedApp.farmerCropDetails || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Application Summary */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                                    {[
                                        { label: 'Crop', value: selectedApp.cropType, icon: '🌾' },
                                        { label: 'Quantity', value: `${selectedApp.quantityKg} kg`, icon: '📦' },
                                        { label: 'Farmer Price', value: `₹${selectedApp.farmerPricePerKg}/kg`, icon: '💰' },
                                        { label: 'Harvest Date', value: new Date(selectedApp.harvestDate).toLocaleDateString('en-IN'), icon: '📅' },
                                    ].map((item, i) => (
                                        <div key={i} className="bg-white/5 p-3 rounded-xl">
                                            <div className="text-[10px] text-gray-500">{item.icon} {item.label}</div>
                                            <div className="text-white text-sm font-bold capitalize">{item.value}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Quality Tests */}
                                <div className="grid md:grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <label className="block text-[10px] text-gray-500 mb-1 uppercase font-bold">Quality Grade</label>
                                        <select value={cropInspection.qualityGrade} onChange={e => setCropInspection(ci => ({ ...ci, qualityGrade: e.target.value }))} className="agri-select">
                                            {["A+", "A", "B+", "B", "C", "Rejected"].map(g => <option key={g}>{g}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-gray-500 mb-1 uppercase font-bold">pH Level</label>
                                        <input value={cropInspection.phLevel} onChange={e => setCropInspection(ci => ({ ...ci, phLevel: e.target.value }))} placeholder="e.g. 6.5" className="agri-input" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-gray-500 mb-1 uppercase font-bold">Pesticide Result</label>
                                        <input value={cropInspection.pesticideResult} onChange={e => setCropInspection(ci => ({ ...ci, pesticideResult: e.target.value }))} placeholder="e.g. NIL / 0.02 ppm" className="agri-input" />
                                    </div>
                                    <div className="flex items-center">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" checked={cropInspection.organicVerified} onChange={e => setCropInspection(ci => ({ ...ci, organicVerified: e.target.checked }))} className="w-4 h-4 accent-green-500" />
                                            <span className="text-sm text-white">🌿 Organic Verified</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Price Adjustment (±0.2%) */}
                                <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 mb-6">
                                    <label className="block text-sm text-amber-400 mb-2 font-bold flex items-center gap-2">
                                        <IndianRupee className="w-4 h-4" /> Price Verification & Adjustment
                                    </label>
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="text-sm text-gray-400">
                                            Farmer Price: <span className="text-white font-bold">₹{selectedApp.farmerPricePerKg}/kg</span>
                                        </div>
                                        <div className="text-[10px] px-2 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono">
                                            Range: ₹{getPriceRange().min} — ₹{getPriceRange().max}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl text-amber-400 font-bold">₹</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={cropInspection.adjustedPrice}
                                            onChange={e => setCropInspection(ci => ({ ...ci, adjustedPrice: e.target.value }))}
                                            className="agri-input text-xl font-bold text-amber-400 max-w-[200px]"
                                        />
                                        <span className="text-gray-400 text-sm">per kg</span>
                                    </div>
                                    <p className="text-[10px] text-gray-500 mt-2">
                                        ⚠️ Maximum adjustment: ±0.2% of farmer's price. This protects farmer income.
                                    </p>
                                    {cropInspection.adjustedPrice && (
                                        <div className="mt-2 text-xs">
                                            {(() => {
                                                const diff = Number(cropInspection.adjustedPrice) - selectedApp.farmerPricePerKg;
                                                const pct = (diff / selectedApp.farmerPricePerKg * 100).toFixed(3);
                                                const maxPct = 0.2;
                                                const isOk = Math.abs(Number(pct)) <= maxPct;
                                                return (
                                                    <span className={isOk ? 'text-green-400' : 'text-red-400'}>
                                                        {isOk ? '✅' : '❌'} Change: {diff > 0 ? '+' : ''}₹{diff.toFixed(2)} ({pct}%)
                                                        {!isOk && ` — Exceeds ±${maxPct}% limit!`}
                                                    </span>
                                                );
                                            })()}
                                        </div>
                                    )}
                                </div>

                                {/* Inspection Notes */}
                                <div className="mb-4">
                                    <label className="block text-[10px] text-gray-500 mb-1.5 uppercase font-bold">Inspection Notes *</label>
                                    <textarea
                                        value={cropInspection.inspectionNotes}
                                        onChange={e => setCropInspection(ci => ({ ...ci, inspectionNotes: e.target.value }))}
                                        className="agri-input h-24"
                                        placeholder="Detailed inspection observations..."
                                    />
                                </div>

                                {/* Approve / Reject */}
                                <div className="flex gap-4 mb-4">
                                    <button
                                        onClick={() => setCropInspection(ci => ({ ...ci, approved: true }))}
                                        className={`flex-1 py-3 rounded-xl border font-bold transition-all flex items-center justify-center gap-2 ${cropInspection.approved ? 'border-green-500 bg-green-500/10 text-green-400' : 'border-white/5 text-gray-500'}`}
                                    >
                                        <Award className="w-4 h-4" /> Certify & Approve
                                    </button>
                                    <button
                                        onClick={() => setCropInspection(ci => ({ ...ci, approved: false }))}
                                        className={`flex-1 py-3 rounded-xl border font-bold transition-all flex items-center justify-center gap-2 ${!cropInspection.approved ? 'border-red-500 bg-red-500/10 text-red-500' : 'border-white/5 text-gray-500'}`}
                                    >
                                        <AlertTriangle className="w-4 h-4" /> Reject
                                    </button>
                                </div>

                                <button
                                    onClick={handleCropInspection}
                                    disabled={loading}
                                    className="w-full bg-green-600 hover:bg-green-500 text-white font-black py-4 rounded-xl text-lg flex items-center justify-center gap-2"
                                >
                                    {loading ? <Loader2 className="animate-spin" /> : "Submit Inspection & Issue Certificate"}
                                </button>
                            </motion.div>
                        )}
                    </div>
                )}

                {/* ═══════════════════════ QUALITY TESTS TAB ═══════════════════════ */}
                {activeTab === 'quality' && (
                    <>
                        <div className="glass-card p-5 mb-6">
                            <h2 className="font-semibold text-white mb-3">📦 Incoming Batches</h2>
                            <div className="space-y-2">
                                {liveBatches.map((b: any) => (
                                    <button
                                        key={b.batchId}
                                        onClick={() => setSelectedBatch(b.batchId)}
                                        className={`w-full flex items-center justify-between p-3 rounded-xl border text-sm transition-all ${selectedBatch === b.batchId ? "border-blue-500/60 bg-blue-900/10" : "border-white/10 bg-white/5 hover:border-white/20"}`}
                                    >
                                        <div className="text-left">
                                            <div className="font-medium text-white">{b.batchId} · {b.cropType}</div>
                                            <div className="text-gray-500 text-xs">{b.farmerName || 'Farmer'}, {b.district} · {b.weightKg} kg</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {!submitted ? (
                            <div className="glass-card p-6">
                                <h2 className="font-semibold text-white mb-4 flex items-center gap-2"><FlaskConical className="w-5 h-5 text-blue-400" /> Quality Test — {selectedBatch}</h2>
                                <div className="grid md:grid-cols-2 gap-4 mb-6">
                                    {[
                                        { label: "pH Level", key: "ph", placeholder: "6.5", type: "number" },
                                        { label: "Pesticide", key: "pesticide", placeholder: "NIL", type: "text" },
                                        { label: "Brix %", key: "brix", placeholder: "4.8", type: "number" },
                                    ].map(f => (
                                        <div key={f.key}><label className="block text-sm text-gray-400 mb-1.5">{f.label}</label><input value={(tests as any)[f.key]} onChange={e => setTests(t => ({ ...t, [f.key]: e.target.value }))} placeholder={f.placeholder} type={f.type} className="agri-input" /></div>
                                    ))}
                                    <div><label className="block text-sm text-gray-400 mb-1.5">Grade</label><select value={tests.grade} onChange={e => setTests(t => ({ ...t, grade: e.target.value }))} className="agri-select">{["A+", "A", "B+", "B", "C"].map(g => <option key={g}>{g}</option>)}</select></div>
                                </div>
                                <button onClick={handleSubmit} disabled={loading} className="w-full btn-blue-glow text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2">
                                    {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Recording...</> : "🔬 Submit Quality Test Results"}
                                </button>
                            </div>
                        ) : (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-8 text-center">
                                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                                <h2 className="text-2xl font-bold text-white mb-2">Quality Test Recorded!</h2>
                                <p className="text-gray-400 mb-6">pH: {tests.ph} · Pesticide: {tests.pesticide} · Grade: {tests.grade}</p>
                                <button onClick={() => setSubmitted(false)} className="border border-white/10 text-gray-400 px-6 py-3 rounded-xl hover:bg-white/5">Next Batch</button>
                            </motion.div>
                        )}
                    </>
                )}

                {/* ═══════════════════════ RELIEF FUND TAB ═══════════════════════ */}
                {activeTab === 'relief' && (
                    <div className="space-y-6">
                        <div className="glass-card p-5">
                            <h2 className="text-xl font-bold text-white mb-4">உதவித்தொகை விண்ணப்பங்கள் (Relief Claims)</h2>
                            <div className="space-y-3">
                                {claims.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8">No relief claims</p>
                                ) : (
                                    claims.map((c) => (
                                        <div key={c._id} className={`p-4 rounded-2xl border transition-all cursor-pointer ${selectedClaim?._id === c._id ? 'border-amber-500 bg-amber-500/10' : 'border-white/5 bg-white/5 hover:border-white/10'}`} onClick={() => setSelectedClaim(c)}>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="font-bold text-white">{c.farmerName} · {c.cropType}</div>
                                                    <div className="text-xs text-gray-500">{c.village}, {c.district} · {c.claimRefNo}</div>
                                                </div>
                                                <span className={`text-[10px] px-2 py-1 rounded-full border ${c.status === 'pending' ? 'border-yellow-500/30 text-yellow-400' : c.status.includes('approved') ? 'border-green-500/30 text-green-400' : 'border-white/10 text-gray-500'}`}>
                                                    {c.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {selectedClaim && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 border-amber-500/20">
                                <h3 className="text-lg font-bold text-white mb-4">Inspection: {selectedClaim.claimRefNo}</h3>
                                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                                    <div className="bg-white/5 p-3 rounded-xl"><div className="text-gray-500">Damage</div><div className="text-white font-medium capitalize">{selectedClaim.damageReason?.replace('_', ' ')}</div></div>
                                    <div className="bg-white/5 p-3 rounded-xl"><div className="text-gray-500">Date</div><div className="text-white font-medium">{selectedClaim.damageDate ? new Date(selectedClaim.damageDate).toLocaleDateString() : 'N/A'}</div></div>
                                </div>
                                <div className="space-y-4">
                                    <div><label className="block text-sm text-gray-400 mb-1.5 font-bold">INSPECTION NOTES</label><textarea value={inspection.notes} onChange={e => setInspection(i => ({ ...i, notes: e.target.value }))} className="agri-input h-24" placeholder="Field inspection notes..." /></div>
                                    <div><label className="block text-sm text-gray-400 mb-1.5 font-bold">ESTIMATED AMOUNT ₹</label><input type="number" value={inspection.amount} onChange={e => setInspection(i => ({ ...i, amount: e.target.value }))} className="agri-input" placeholder="e.g. 25000" /></div>
                                    <div className="flex gap-4">
                                        <button onClick={() => setInspection(i => ({ ...i, approved: true }))} className={`flex-1 py-3 rounded-xl border font-bold transition-all ${inspection.approved ? 'border-green-500 bg-green-500/10 text-green-400' : 'border-white/5 text-gray-500'}`}>✅ Approve</button>
                                        <button onClick={() => setInspection(i => ({ ...i, approved: false }))} className={`flex-1 py-3 rounded-xl border font-bold transition-all ${!inspection.approved ? 'border-red-500 bg-red-500/10 text-red-500' : 'border-white/5 text-gray-500'}`}>❌ Reject</button>
                                    </div>
                                    <button onClick={handleReliefInspection} disabled={loading} className="w-full bg-amber-600 hover:bg-amber-500 text-white font-black py-4 rounded-xl text-lg flex items-center justify-center gap-2 mt-4">
                                        {loading ? <Loader2 className="animate-spin" /> : "Submit Inspection Report"}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
