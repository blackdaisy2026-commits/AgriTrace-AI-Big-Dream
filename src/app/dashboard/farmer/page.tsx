"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRole } from "@/lib/role-context";
import { generateBatchId } from "@/lib/utils";
import { CROPS, TN_DISTRICTS, TN_TALUKS } from "@/lib/mock-data";
import VoiceInput from "@/components/VoiceInput";
import Header from "@/components/Header";
import { toast } from "sonner";
import { QRCodeSVG as QRCode } from "qrcode.react";
import {
    MapPin, CheckCircle, Loader2, Download, AlertCircle, Clock,
    CreditCard, ChevronRight, Sprout, Package, FileText, IndianRupee,
    Calendar, Award, Eye, Mic, ArrowRight, Link2, TrendingUp
} from "lucide-react";
import Link from "next/link";
import { apiRequest } from "@/lib/api";

// --- Status Badge Map ----------------------------------------------------------
const STATUS_MAP: Record<string, { label: string; className: string }> = {
    pending:        { label: "Pending Inspection",   className: "badge badge-organic" },
    inspecting:     { label: "Under Inspection",     className: "badge badge-blue" },
    approved:       { label: "Approved",             className: "badge badge-verified" },
    rejected:       { label: "Rejected",             className: "badge badge-red" },
    batch_recorded: { label: "Batch Recorded",       className: "badge badge-purple" },
    listed:         { label: "In Marketplace",       className: "badge badge-blue" },
    sold:           { label: "Sold",                 className: "badge badge-verified" },
    expired:        { label: "Expired",              className: "badge badge-neutral" },
};

function StatusBadge({ status }: { status: string }) {
    const cfg = STATUS_MAP[status] || { label: status, className: "badge badge-neutral" };
    return <span className={cfg.className}>{cfg.label}</span>;
}

// --- Relief Fund Tracker Sub-component ---------------------------------------
function ReliefFundTracker({ token }: { token: string | null }) {
    const [claims, setClaims] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchClaims = async () => {
            if (!token) return;
            try {
                const res = await apiRequest("/compensation/my-claims", "GET", null, token);
                if (res.status === "success") setClaims(res.data);
            } catch { /* silent */ }
            finally { setLoading(false); }
        };
        fetchClaims();
    }, [token]);

    if (loading || claims.length === 0) return null;

    const statusMap: Record<string, { label: string; className: string }> = {
        pending:              { label: "Pending Field Visit",    className: "badge badge-organic" },
        processor_review:     { label: "Field Inspection",       className: "badge badge-blue" },
        processor_approved:   { label: "Agri Officer Approved",  className: "badge badge-blue" },
        processor_rejected:   { label: "Agri Officer Rejected",  className: "badge badge-red" },
        tahsildar_review:     { label: "Tahsildar Reviewing",    className: "badge badge-purple" },
        tahsildar_approved:   { label: "Tahsildar Approved",     className: "badge badge-purple" },
        tahsildar_rejected:   { label: "Tahsildar Rejected",     className: "badge badge-red" },
        approved:             { label: "Admin Sanctioned",       className: "badge badge-organic" },
        disbursed:            { label: "Fund Disbursed",         className: "badge badge-verified" },
        rejected:             { label: "Rejected",               className: "badge badge-red" },
    };

    return (
        <div className="card p-5 mb-6 border-amber-500/15 bg-amber-500/4">
            <h2 className="text-[14px] font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                Relief Fund Claims
            </h2>
            <div className="space-y-3">
                {claims.map(c => {
                    const s = statusMap[c.status] || { label: c.status, className: "badge badge-neutral" };
                    return (
                        <div key={c.claimRefNo} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-[#ffffff] border border-[#e2e8f0] gap-3">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                                    {c.status === "disbursed" ? <CreditCard className="w-4 h-4 text-amber-400" /> : <Clock className="w-4 h-4 text-amber-400" />}
                                </div>
                                <div>
                                    <p className="text-[13px] font-semibold text-slate-900">{c.cropType} � {c.damageReason}</p>
                                    <p className="text-[11px] font-mono text-[#64748b]">{c.claimRefNo}</p>
                                    <span className={s.className + " mt-1"}>{s.label}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                {(c.approvedAmount || c.disbursedAmount) && (
                                    <span className="text-[14px] font-bold text-green-400">
                                        ?{(c.disbursedAmount || c.approvedAmount).toLocaleString("en-IN")}
                                    </span>
                                )}
                                <Link href={`/trace/relief/${c.claimRefNo}`}>
                                    <button className="btn btn-secondary btn-sm gap-1">
                                        <Eye className="w-3.5 h-3.5" /> Trace
                                    </button>
                                </Link>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// --- Main Dashboard -----------------------------------------------------------
export default function FarmerDashboard() {
    const { user, token, isAuthenticated } = useRole();
    const [activeTab, setActiveTab] = useState<"harvest" | "batches">("harvest");
    const [loading, setLoading] = useState(false);

    const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ||
        (typeof window !== "undefined" ? window.location.origin : "");

    // Harvest form state
    const [harvestForm, setHarvestForm] = useState({
        cropType: "", cropVariety: "", quantity: "", unit: "kg",
        harvestDate: "", fieldAreaAcres: "", gpsLocation: "",
        isOrganic: false, isFairTrade: false, notes: "",
        farmerPrice: "", district: user?.district || "",
        taluk: user?.taluk || "", village: user?.location || ""
    });
    const [harvestSubmitted, setHarvestSubmitted] = useState(false);
    const [harvestRef, setHarvestRef] = useState("");
    const [myApplications, setMyApplications] = useState<any[]>([]);
    const [marketRange, setMarketRange] = useState<any>(null);

    // Batch recording state
    const [selectedBatchApp, setSelectedBatchApp] = useState<any>(null);
    const [batchWeight, setBatchWeight] = useState("");
    const [batchNotes, setBatchNotes] = useState("");
    const [batchQrUrl, setBatchQrUrl] = useState("");
    const [batchRecorded, setBatchRecorded] = useState(false);
    const [recordedBatchId, setRecordedBatchId] = useState("");

    // Fetch applications
    useEffect(() => {
        const fetchApps = async () => {
            if (!token) return;
            const res = await apiRequest("/harvest/my-applications", "GET", null, token);
            if (res.status === "success") setMyApplications(res.data);
        };
        fetchApps();
    }, [token]);

    // Fetch market price
    useEffect(() => {
        const fetchMarketPrice = async () => {
            if (!harvestForm.cropType || !token) { setMarketRange(null); return; }
            setMarketRange(null);
            try {
                const enc = encodeURIComponent(harvestForm.cropType);
                const dist = encodeURIComponent(harvestForm.district || user?.district || "");
                const res = await apiRequest(`/harvest/market-price?commodity=${enc}&district=${dist}`, "GET", null, token);
                if (res.status === "success") setMarketRange(res.data);
            } catch { /* silent */ }
        };
        fetchMarketPrice();
    }, [harvestForm.cropType, harvestForm.district, token, user?.district]);

    // Auth guard
    if (!isAuthenticated || user?.role !== "farmer") {
        return (
            <div className="min-h-screen">
                <Header />
                <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-56px)]">
                    <div className="card p-8 text-center max-w-sm">
                        <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="w-7 h-7 text-red-400" />
                        </div>
                        <h2 className="text-[16px] font-bold text-slate-900 mb-2">Farmer Access Required</h2>
                        <p className="text-[13px] text-[#64748b] mb-5">You must be signed in as a Farmer to access this dashboard.</p>
                        <Link href="/login?role=farmer">
                            <button className="btn btn-primary w-full">Sign In as Farmer</button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const getGPS = () => {
        if (!navigator.geolocation) { toast.error("GPS not available"); return; }
        navigator.geolocation.getCurrentPosition(
            pos => {
                const gps = `${pos.coords.latitude.toFixed(4)},${pos.coords.longitude.toFixed(4)}`;
                setHarvestForm(f => ({ ...f, gpsLocation: gps }));
                toast.success("GPS captured!");
            },
            () => {
                setHarvestForm(f => ({ ...f, gpsLocation: "10.3592,77.7502" }));
                toast("Using demo GPS (Oddanchatram)");
            }
        );
    };

    const getMinDate = () => {
        const d = new Date(); d.setDate(d.getDate() + 2);
        return d.toISOString().split("T")[0];
    };

    const handleVoice = (text: string) => {
        const lower = text.toLowerCase();
        const cropMap: Record<string, string> = {
            "tomato": "Tomato", "தக்காளி": "Tomato",
            "banana": "Banana", "வாழை": "Banana",
            "rice": "Rice", "அரிசி": "Rice",
            "mango": "Mango", "மாம்பழம்": "Mango",
            "onion": "Onion", "வெங்காயம்": "Onion",
            "chilli": "Chili Red", "மிளகாய்": "Chili Red",
            "coconut": "Coconut", "தென்னை": "Coconut",
            "sugarcane": "Sugarcane", "கரும்பு": "Sugarcane",
            "turmeric": "Turmeric", "மஞ்சள்": "Turmeric",
            "groundnut": "Groundnut", "நிலக்கடலை": "Groundnut",
        };
        for (const [kw, val] of Object.entries(cropMap)) {
            if (lower.includes(kw)) {
                setHarvestForm(f => ({ ...f, cropType: val }));
                toast.success(`Crop detected: ${val}`);
            }
        }
        const district = TN_DISTRICTS.find(d => lower.includes(d.value.toLowerCase()));
        if (district) {
            setHarvestForm(f => ({ ...f, district: district.value, taluk: "" }));
            toast.success(`District: ${district.label}`);
        }
        const weightMatch = lower.match(/(\d+)\s*(kg|கிலோ|கிராம்|ton|டன்|quintal|குவிண்டால்|bundle|கட்டு|bag|மூட்டை|liter|லிட்டர்)/i);
        if (weightMatch) {
            const num = weightMatch[1];
            const unitText = weightMatch[2].toLowerCase();
            let unit = "kg";
            if (unitText.includes("ton") || unitText.includes("டன்")) unit = "ton";
            else if (unitText.includes("quintal") || unitText.includes("குவிண்டால்")) unit = "quintal";
            else if (unitText.includes("bundle") || unitText.includes("கட்டு")) unit = "bundle";
            else if (unitText.includes("bag") || unitText.includes("மூட்டை")) unit = "bag";
            else if (unitText.includes("liter") || unitText.includes("லிட்டர்")) unit = "liter";
            setHarvestForm(f => ({ ...f, quantity: num, unit }));
            toast.success(`Weight: ${num} ${unit}`);
        }
        const priceMatch = lower.match(/(\d+)\s*(rupee|ரூபாய்|per|விலை)/);
        if (priceMatch) {
            setHarvestForm(f => ({ ...f, farmerPrice: priceMatch[1] }));
            toast.success(`Price: ₹${priceMatch[1]}`);
        }
        setHarvestForm(f => ({ ...f, notes: (f.notes + " " + text).trim() }));
    };

    const handleHarvestSubmit = async () => {
        if (!harvestForm.cropType || !harvestForm.quantity || !harvestForm.harvestDate || !harvestForm.farmerPrice) {
            toast.error("Please fill crop, quantity, harvest date & price");
            return;
        }
        let multiplier = 1;
        if (harvestForm.unit === "ton") multiplier = 1000;
        else if (harvestForm.unit === "quintal") multiplier = 100;
        else if (harvestForm.unit === "bag") multiplier = 50;

        const pricePerKg = Number(harvestForm.farmerPrice) / multiplier;
        if (marketRange && (pricePerKg < marketRange.min || pricePerKg > marketRange.max)) {
            toast.error(`Price out of market range: ₹${marketRange.min} - ₹${marketRange.max}/kg`);
            return;
        }

        setLoading(true);
        try {
            const res = await apiRequest("/harvest", "POST", {
                cropType: harvestForm.cropType, cropVariety: harvestForm.cropVariety,
                quantityKg: Number(harvestForm.quantity) * multiplier,
                harvestDate: harvestForm.harvestDate,
                fieldAreaAcres: harvestForm.fieldAreaAcres ? Number(harvestForm.fieldAreaAcres) : undefined,
                gpsLocation: harvestForm.gpsLocation, isOrganic: harvestForm.isOrganic,
                isFairTrade: harvestForm.isFairTrade,
                notes: harvestForm.notes + (harvestForm.unit !== "kg" ? ` (Original: ${harvestForm.quantity} ${harvestForm.unit})` : ""),
                farmerPricePerKg: pricePerKg, district: harvestForm.district,
                taluk: harvestForm.taluk, village: harvestForm.village
            }, token);
            if (res.status === "success") {
                setHarvestRef(res.data.applicationId);
                setHarvestSubmitted(true);
                setMyApplications(prev => [res.data, ...prev]);
                toast.success(res.message);
            } else {
                toast.error(res.message || "Failed to submit");
            }
        } catch { toast.error("Network error"); }
        finally { setLoading(false); }
    };

    const handleRecordBatch = async () => {
        if (!selectedBatchApp) return;
        setLoading(true);
        try {
            const res = await apiRequest(`/harvest/${selectedBatchApp._id}/record-batch`, "PATCH", {
                weightKg: batchWeight ? Number(batchWeight) : selectedBatchApp.quantityKg,
                batchNotes
            }, token);
            if (res.status === "success") {
                const batch = res.data;
                const qrUrl = `${SITE_URL}/trace/${batch.batchId}`;
                setBatchQrUrl(qrUrl); setRecordedBatchId(batch.batchId); setBatchRecorded(true);
                setMyApplications(prev => prev.map(a => a._id === selectedBatchApp._id ? batch : a));
                toast.success(res.message);
            } else { toast.error(res.message || "Failed to record batch"); }
        } catch { toast.error("Network error"); }
        finally { setLoading(false); }
    };

    const downloadQR = () => {
        const svg = document.querySelector("#qr-canvas svg");
        if (svg) {
            const svgData = new XMLSerializer().serializeToString(svg);
            const canvas = document.createElement("canvas");
            canvas.width = 200; canvas.height = 200;
            const ctx = canvas.getContext("2d");
            const img = new window.Image();
            img.onload = () => {
                ctx?.drawImage(img, 0, 0);
                const a = document.createElement("a");
                a.download = `${recordedBatchId}-qr.png`;
                a.href = canvas.toDataURL(); a.click();
            };
            img.src = "data:image/svg+xml;base64," + btoa(svgData);
        }
    };

    const approvedApps = myApplications.filter(a => a.status === "approved");
    const pendingApps = myApplications.filter(a => ["pending", "inspecting", "rejected", "expired"].includes(a.status));
    const recordedBatches = myApplications.filter(a => ["batch_recorded", "listed", "sold"].includes(a.status));

    return (
        <div className="min-h-screen">
            <Header />

            <div className="max-w-[1280px] mx-auto px-4 py-8">

                {/* -- Page Header -- */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
                >
                    <div>
                        <p className="text-[12px] text-green-400 font-semibold uppercase tracking-widest mb-1">
                            Farmer Dashboard · விவசாயி பணிப்பலகை
                        </p>
                        <h1 className="text-2xl font-bold text-slate-900 font-outfit">
                            Welcome back, {user?.name?.split(" ")[0]} 👋
                        </h1>
                        <p className="text-[13px] text-[#64748b] mt-0.5">
                            {user?.district}, {user?.taluk}
                        </p>
                    </div>
                    <Link href="/dashboard/farmer/compensation">
                        <button className="btn btn-secondary gap-2">
                            <IndianRupee className="w-4 h-4 text-amber-400" />
                            Relief Fund
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </Link>
                </motion.div>

                {/* -- Stats Row -- */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    {[
                        { label: "Total Applications", value: myApplications.length, color: "text-slate-900" },
                        { label: "Awaiting Approval",   value: myApplications.filter(a => a.status === "pending" || a.status === "inspecting").length, color: "text-amber-400" },
                        { label: "Ready to Batch",      value: approvedApps.length, color: "text-blue-400" },
                        { label: "Batches Sold",         value: recordedBatches.filter(b => b.status === "sold").length, color: "text-green-400" },
                    ].map((s, i) => (
                        <div key={i} className="card p-4">
                            <p className="text-[12px] text-[#64748b] mb-1">{s.label}</p>
                            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                        </div>
                    ))}
                </div>

                {/* -- Relief Fund Tracker -- */}
                <ReliefFundTracker token={token} />

                {/* -- Tab Switcher -- */}
                <div className="flex bg-[#ffffff] border border-[#e2e8f0] p-1 rounded-xl mb-6">
                    <button
                        onClick={() => setActiveTab("harvest")}
                        className={`flex-1 px-4 py-2.5 rounded-lg text-[13px] font-medium transition-all flex items-center justify-center gap-2 ${
                            activeTab === "harvest"
                                ? "bg-[#e2e8f0] text-slate-900 shadow-sm"
                                : "text-[#64748b] hover:text-[#475569]"
                        }`}
                    >
                        <Sprout className="w-4 h-4" /> Harvest Application
                    </button>
                    <button
                        onClick={() => setActiveTab("batches")}
                        className={`flex-1 px-4 py-2.5 rounded-lg text-[13px] font-medium transition-all flex items-center justify-center gap-2 ${
                            activeTab === "batches"
                                ? "bg-[#e2e8f0] text-slate-900 shadow-sm"
                                : "text-[#64748b] hover:text-[#475569]"
                        }`}
                    >
                        <Package className="w-4 h-4" /> Record Batch
                        {approvedApps.length > 0 && (
                            <span className="w-5 h-5 bg-blue-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                {approvedApps.length}
                            </span>
                        )}
                    </button>
                </div>

                {/* -------------- HARVEST TAB -------------- */}
                {activeTab === "harvest" ? (
                    <>
                        {/* Applications list */}
                        {pendingApps.length > 0 && (
                            <div className="card p-5 mb-5">
                                <h2 className="text-[13px] font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-green-400" />
                                    My Harvest Applications
                                </h2>
                                <div className="space-y-2.5">
                                    {pendingApps.map(app => (
                                        <div key={app.applicationId || app._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] gap-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0">
                                                    <Sprout className="w-4 h-4 text-green-400" />
                                                </div>
                                                <div>
                                                    <p className="text-[13px] font-semibold text-slate-900 capitalize">
                                                        {app.cropType} � ?{app.farmerPricePerKg}/kg
                                                    </p>
                                                    <p className="text-[11px] font-mono text-[#64748b]">
                                                        {app.applicationId} � {app.quantityKg}kg � {new Date(app.harvestDate).toLocaleDateString("en-IN")}
                                                    </p>
                                                    {app.finalPricePerKg && (
                                                        <p className="text-[11px] text-green-400 font-semibold mt-0.5">
                                                            Final: ?{app.finalPricePerKg}/kg � {app.certificationNo}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <Link href={`/trace/${app.applicationId}`}>
                                                    <button className="btn btn-ghost btn-sm" title="View on blockchain">
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                </Link>
                                                <StatusBadge status={app.status} />
                                                {app.status === "approved" && (
                                                    <button
                                                        onClick={() => {
                                                            setActiveTab("batches");
                                                            setSelectedBatchApp(app);
                                                            setBatchWeight(String(app.quantityKg));
                                                        }}
                                                        className="btn btn-accent btn-sm"
                                                    >
                                                        Record Batch <ArrowRight className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                                {app.purchaseTotalAmount && (
                                                    <span className="text-[14px] font-bold text-green-400">
                                                        ?{app.purchaseTotalAmount.toLocaleString("en-IN")}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Harvest Application Form */}
                        <AnimatePresence mode="wait">
                            {!harvestSubmitted ? (
                                <motion.div
                                    key="harvest-form"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="card p-6 space-y-5"
                                >
                                    <div>
                                        <h2 className="text-[15px] font-semibold text-slate-900 flex items-center gap-2 mb-1">
                                            <Sprout className="w-4 h-4 text-green-400" />
                                            New Harvest Application
                                        </h2>
                                        <p className="text-[12px] text-[#64748b]">
                                            Submit at least 2 days before harvest. All steps are logged on Polygon blockchain.
                                        </p>
                                    </div>

                                    {/* Voice Input */}
                                    <div className="p-4 rounded-xl bg-blue-500/4 border border-blue-500/15">
                                        <label className="form-label text-blue-400 flex items-center gap-1.5 mb-2">
                                            <Mic className="w-3.5 h-3.5" />
                                            Voice Input (Tamil / English)
                                        </label>
                                        <p className="text-[11px] text-[#64748b] mb-3">
                                            Say crop name, quantity, and price in Tamil or English. E.g. "தக்காளி 500 கிலோ 40 ரூபாய்"
                                        </p>
                                        <VoiceInput onTranscript={handleVoice} />
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="form-label">Crop Type / பயிர் வகை <span className="text-red-400">*</span></label>
                                            <select
                                                value={harvestForm.cropType}
                                                onChange={e => setHarvestForm(f => ({ ...f, cropType: e.target.value }))}
                                                className="agri-select"
                                            >
                                                <option value="">Select crop...</option>
                                                {CROPS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="form-label">Variety / ரகம்</label>
                                            <input
                                                value={harvestForm.cropVariety}
                                                onChange={e => setHarvestForm(f => ({ ...f, cropVariety: e.target.value }))}
                                                placeholder="e.g. Hybrid Local Red"
                                                className="agri-input"
                                            />
                                        </div>
                                        <div>
                                            <label className="form-label">Unit / அலகு <span className="text-red-400">*</span></label>
                                            <select
                                                value={harvestForm.unit}
                                                onChange={e => setHarvestForm(f => ({ ...f, unit: e.target.value }))}
                                                className="agri-select"
                                            >
                                                <option value="kg">kg (கிலோ)</option>
                                                <option value="ton">Ton (டன்)</option>
                                                <option value="quintal">Quintal (குவிண்டால்)</option>
                                                <option value="bundle">Bundle (கட்டு)</option>
                                                <option value="bag">Bag (மூட்டை)</option>
                                                <option value="liter">Liter (லிட்டர்)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="form-label">Quantity ({harvestForm.unit}) / அளவு <span className="text-red-400">*</span></label>
                                            <input
                                                type="number"
                                                value={harvestForm.quantity}
                                                onChange={e => setHarvestForm(f => ({ ...f, quantity: e.target.value }))}
                                                placeholder="e.g. 500"
                                                className="agri-input"
                                            />
                                        </div>
                                        <div>
                                            <label className="form-label">Harvest Date / அறுவடை நாள் <span className="text-red-400">*</span></label>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b] pointer-events-none" />
                                                <input
                                                    type="date"
                                                    min={getMinDate()}
                                                    value={harvestForm.harvestDate}
                                                    onChange={e => setHarvestForm(f => ({ ...f, harvestDate: e.target.value }))}
                                                    className="agri-input pl-10"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="form-label">Field Area (Acres)</label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={harvestForm.fieldAreaAcres}
                                                onChange={e => setHarvestForm(f => ({ ...f, fieldAreaAcres: e.target.value }))}
                                                placeholder="e.g. 2.5"
                                                className="agri-input"
                                            />
                                        </div>
                                    </div>

                                    {/* Pricing section */}
                                    <div className="p-4 rounded-xl bg-green-500/4 border border-green-500/15">
                                        <label className="form-label text-green-400 flex items-center gap-1.5 mb-1">
                                            <IndianRupee className="w-3.5 h-3.5" />
                                            Your Price per {harvestForm.unit} <span className="text-red-400">*</span>
                                        </label>
                                        <p className="text-[11px] text-[#64748b] mb-3">
                                            Agri Officer can only adjust by �0.2%. Your price is protected.
                                        </p>
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className="text-xl font-bold text-green-400">?</span>
                                            <input
                                                type="number"
                                                step="0.5"
                                                value={harvestForm.farmerPrice}
                                                onChange={e => setHarvestForm(f => ({ ...f, farmerPrice: e.target.value }))}
                                                placeholder="40.00"
                                                className="agri-input max-w-[160px] font-bold text-[18px]"
                                            />
                                            <span className="text-[#64748b] text-[13px]">per {harvestForm.unit}</span>
                                        </div>

                                        {/* Market range indicator */}
                                        {marketRange ? (
                                            <motion.div
                                                initial={{ opacity: 0, y: 6 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="p-3 rounded-xl bg-blue-500/6 border border-blue-500/15"
                                            >
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                                                    <span className="text-[11px] text-blue-400 font-semibold uppercase tracking-wider">
                                                        Live Market Rate (Agmarknet)
                                                    </span>
                                                </div>
                                                <p className="text-[13px] text-slate-900">
                                                    Range:{" "}
                                                    <span className="font-bold text-blue-400">
                                                        ₹{marketRange.min} - ₹{marketRange.max}
                                                    </span>{" "}
                                                    per kg
                                                </p>
                                                <p className="text-[11px] text-[#64748b] mt-0.5">
                                                    {marketRange.commodity} - {harvestForm.district || "Tamil Nadu"}
                                                </p>
                                            </motion.div>
                                        ) : harvestForm.cropType ? (
                                            <div className="p-3 rounded-xl bg-blue-500/4 border border-blue-500/12 flex items-center gap-2">
                                                <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                                                <span className="text-[12px] text-blue-400">Fetching live market data...</span>
                                            </div>
                                        ) : (
                                            <p className="text-[11px] text-[#64748b] italic">
                                                Select a crop to see live market pricing and price protection range.
                                            </p>
                                        )}

                                        {harvestForm.farmerPrice && harvestForm.quantity && (
                                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-green-500/10">
                                                <span className="text-[12px] text-[#64748b]">Total Projected Value</span>
                                                <span className="text-[16px] font-bold text-green-400">
                                                    ₹{(Number(harvestForm.farmerPrice) * Number(harvestForm.quantity)).toLocaleString("en-IN")}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Location */}
                                    <div className="grid md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="form-label">District / மாவட்டம்</label>
                                            <select
                                                value={harvestForm.district}
                                                onChange={e => setHarvestForm(f => ({ ...f, district: e.target.value, taluk: "" }))}
                                                className="agri-select"
                                            >
                                                <option value="">Select district...</option>
                                                {TN_DISTRICTS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="form-label">Taluk / தாலுக்கா</label>
                                            <select
                                                value={harvestForm.taluk}
                                                onChange={e => setHarvestForm(f => ({ ...f, taluk: e.target.value }))}
                                                className="agri-select"
                                                disabled={!harvestForm.district}
                                            >
                                                <option value="">Select taluk...</option>
                                                {harvestForm.district && TN_TALUKS[harvestForm.district]?.map(t => (
                                                    <option key={t.value} value={t.value}>{t.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="form-label">Village / கிராமம்</label>
                                            <input
                                                value={harvestForm.village}
                                                onChange={e => setHarvestForm(f => ({ ...f, village: e.target.value }))}
                                                placeholder="e.g. Oddanchatram"
                                                className="agri-input"
                                            />
                                        </div>
                                    </div>

                                    {/* GPS */}
                                    <div>
                                        <label className="form-label">GPS Location</label>
                                        <div className="flex gap-2">
                                            <input
                                                value={harvestForm.gpsLocation}
                                                onChange={e => setHarvestForm(f => ({ ...f, gpsLocation: e.target.value }))}
                                                placeholder="Lat,Lng"
                                                className="agri-input"
                                            />
                                            <button
                                                type="button"
                                                onClick={getGPS}
                                                className="btn btn-secondary btn-sm gap-1.5 whitespace-nowrap"
                                            >
                                                <MapPin className="w-3.5 h-3.5" /> Get GPS
                                            </button>
                                        </div>
                                    </div>

                                    {/* Checkboxes */}
                                    <div className="flex gap-5">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={harvestForm.isOrganic}
                                                onChange={e => setHarvestForm(f => ({ ...f, isOrganic: e.target.checked }))}
                                                className="w-4 h-4 accent-green-500 rounded"
                                            />
                                            <span className="text-[13px] text-[#475569]">🌿 Organic</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={harvestForm.isFairTrade}
                                                onChange={e => setHarvestForm(f => ({ ...f, isFairTrade: e.target.checked }))}
                                                className="w-4 h-4 accent-amber-500 rounded"
                                            />
                                            <span className="text-[13px] text-[#475569]">⭐ Fair Trade</span>
                                        </label>
                                    </div>

                                    {/* Notes */}
                                    <div>
                                        <label className="form-label">Notes / குறிப்புகள்</label>
                                        <textarea
                                            value={harvestForm.notes}
                                            onChange={e => setHarvestForm(f => ({ ...f, notes: e.target.value }))}
                                            rows={2}
                                            placeholder="Additional notes�"
                                            className="agri-input resize-none"
                                        />
                                    </div>

                                    <button
                                        onClick={handleHarvestSubmit}
                                        disabled={loading}
                                        className="w-full btn btn-primary btn-lg gap-2 disabled:opacity-50"
                                    >
                                        {loading ? (
                                            <><Loader2 className="w-4 h-4 animate-spin" /> Submitting to Blockchain�</>
                                        ) : (
                                            <><Link2 className="w-4 h-4" /> Submit Harvest Application</>
                                        )}
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="harvest-success"
                                    initial={{ opacity: 0, scale: 0.97 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="card p-8 text-center"
                                >
                                    <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
                                        <CheckCircle className="w-8 h-8 text-green-400" />
                                    </div>
                                    <h2 className="text-[20px] font-bold text-slate-900 mb-2">Application Submitted!</h2>
                                    <p className="text-[13px] text-[#64748b] mb-6">
                                        Logged on blockchain. Awaiting Agri Officer inspection within 3 days.
                                    </p>

                                    <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-5 mb-5 inline-block">
                                        <p className="text-[11px] text-[#64748b] uppercase tracking-widest mb-3">Application QR</p>
                                        <div className="bg-white p-3 rounded-lg inline-block mb-3">
                                            <QRCode value={`${SITE_URL}/trace/${harvestRef}`} size={140} />
                                        </div>
                                        <p className="text-[14px] font-mono font-bold text-green-400">{harvestRef}</p>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                        <button
                                            onClick={() => {
                                                setHarvestSubmitted(false);
                                                setHarvestForm({
                                                    cropType: "", cropVariety: "", quantity: "", unit: "kg",
                                                    harvestDate: "", fieldAreaAcres: "", gpsLocation: "",
                                                    isOrganic: false, isFairTrade: false, notes: "",
                                                    farmerPrice: "", district: user?.district || "",
                                                    taluk: user?.taluk || "", village: user?.location || ""
                                                });
                                            }}
                                            className="btn btn-primary"
                                        >
                                            New Application
                                        </button>
                                        <Link href={`/trace/${harvestRef}`}>
                                            <button className="btn btn-secondary">
                                                <Eye className="w-4 h-4" /> View on Blockchain
                                            </button>
                                        </Link>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </>
                ) : (
                    /* -------------- BATCHES TAB -------------- */
                    <>
                        <div className="card p-5 mb-5">
                            <h2 className="text-[14px] font-semibold text-slate-900 mb-2 flex items-center gap-2">
                                <Package className="w-4 h-4 text-blue-400" />
                                Record Batch
                            </h2>
                            <p className="text-[12px] text-[#64748b] mb-4">
                                Approved crops appear here. Record a batch to generate a QR code and list it in the marketplace.
                            </p>

                            {approvedApps.length === 0 ? (
                                <div className="text-center py-10">
                                    <div className="w-14 h-14 rounded-2xl bg-[#e2e8f0] flex items-center justify-center mx-auto mb-4">
                                        <Package className="w-7 h-7 text-[#64748b]" />
                                    </div>
                                    <p className="text-[14px] font-semibold text-[#64748b]">No Approved Applications</p>
                                    <p className="text-[12px] text-[#64748b] mt-1">
                                        Submit harvest applications and wait for Agri Officer approval.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-2.5">
                                    {approvedApps.map(app => (
                                        <div
                                            key={app._id}
                                            onClick={() => {
                                                setSelectedBatchApp(app);
                                                setBatchWeight(String(app.quantityKg));
                                            }}
                                            className={`p-4 rounded-xl border cursor-pointer transition-all ${
                                                selectedBatchApp?._id === app._id
                                                    ? "border-blue-500/40 bg-blue-500/6"
                                                    : "border-[#e2e8f0] bg-[#f8fafc] hover:border-[#cbd5e1]"
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-[13px] font-semibold text-slate-900 capitalize">
                                                        {app.cropType} {app.cropVariety ? `(${app.cropVariety})` : ""}
                                                    </p>
                                                    <p className="text-[11px] text-[#64748b] font-mono mt-0.5">
                                                        {app.applicationId} � ?{app.finalPricePerKg}/kg � {app.certificationNo}
                                                    </p>
                                                </div>
                                                <span className="badge badge-verified">Approved</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {selectedBatchApp && !batchRecorded && (
                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="card p-6 space-y-4 border-blue-500/15"
                            >
                                <h3 className="text-[14px] font-semibold text-slate-900 flex items-center gap-2">
                                    <Package className="w-4 h-4 text-blue-400" />
                                    Record Batch: <span className="font-mono text-blue-400">{selectedBatchApp.applicationId}</span>
                                </h3>

                                {/* Voice Input */}
                                <div className="p-3 rounded-xl bg-blue-500/4 border border-blue-500/12">
                                    <label className="form-label text-blue-400 flex items-center gap-1.5 mb-2">
                                        <Mic className="w-3.5 h-3.5" /> Voice Notes (Tamil / English)
                                    </label>
                                    <VoiceInput onTranscript={(text: string) => setBatchNotes(prev => (prev + " " + text).trim())} />
                                </div>

                                {/* Summary cards */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {[
                                        { label: "Crop",           value: selectedBatchApp.cropType },
                                        { label: "Certified Price", value: `?${selectedBatchApp.finalPricePerKg}/kg` },
                                        { label: "Original Weight", value: `${selectedBatchApp.quantityKg}kg` },
                                        { label: "Certificate",    value: selectedBatchApp.certificationNo },
                                    ].map((item, i) => (
                                        <div key={i} className="bg-[#f8fafc] border border-[#e2e8f0] p-3 rounded-xl">
                                            <p className="text-[11px] text-[#64748b] mb-0.5">{item.label}</p>
                                            <p className="text-[13px] font-semibold text-slate-900 capitalize truncate">{item.value}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Weight */}
                                <div className="p-4 rounded-xl bg-amber-500/4 border border-amber-500/15">
                                    <label className="form-label text-amber-400 mb-2">
                                        Actual Batch Weight (kg)
                                    </label>
                                    <p className="text-[11px] text-[#64748b] mb-3">
                                        Update if it differs from application. Original: {selectedBatchApp.quantityKg}kg
                                    </p>
                                    <input
                                        type="number"
                                        value={batchWeight}
                                        onChange={e => setBatchWeight(e.target.value)}
                                        className="agri-input max-w-[160px] font-bold text-[16px]"
                                    />
                                    {batchWeight && selectedBatchApp.finalPricePerKg && (
                                        <p className="text-[12px] text-[#64748b] mt-2">
                                            New total:{" "}
                                            <span className="text-green-400 font-bold">
                                                ?{(Number(batchWeight) * selectedBatchApp.finalPricePerKg).toLocaleString("en-IN")}
                                            </span>
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="form-label">Batch Notes</label>
                                    <textarea
                                        value={batchNotes}
                                        onChange={e => setBatchNotes(e.target.value)}
                                        rows={2}
                                        placeholder="Notes about this batch�"
                                        className="agri-input resize-none"
                                    />
                                </div>

                                <button
                                    onClick={handleRecordBatch}
                                    disabled={loading}
                                    className="w-full btn btn-accent btn-lg gap-2 disabled:opacity-50"
                                >
                                    {loading ? (
                                        <><Loader2 className="w-4 h-4 animate-spin" /> Recording on Blockchain�</>
                                    ) : (
                                        <><Link2 className="w-4 h-4" /> Record Batch, Generate QR & List in Marketplace</>
                                    )}
                                </button>
                            </motion.div>
                        )}

                        {/* Batch success + QR */}
                        {batchRecorded && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.97 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="card p-8 text-center"
                            >
                                <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
                                    <CheckCircle className="w-8 h-8 text-green-400" />
                                </div>
                                <h2 className="text-[20px] font-bold text-slate-900 mb-2">Batch Recorded!</h2>
                                <p className="text-[13px] text-[#64748b] mb-1">Your crop is now listed in the marketplace.</p>
                                <p className="text-[13px] font-mono text-green-400 mb-6">{recordedBatchId}</p>

                                <div id="qr-canvas" className="flex justify-center mb-5">
                                    <div className="bg-white p-4 rounded-xl shadow-lg">
                                        <QRCode value={batchQrUrl} size={180} level="H" />
                                    </div>
                                </div>
                                <p className="text-[11px] text-[#64748b] mb-6 break-all">{batchQrUrl}</p>

                                <div className="flex flex-wrap gap-3 justify-center">
                                    <button onClick={downloadQR} className="btn btn-primary gap-2">
                                        <Download className="w-4 h-4" /> Download QR
                                    </button>
                                    <Link href={`/trace/${recordedBatchId}`}>
                                        <button className="btn btn-secondary gap-2">
                                            <Eye className="w-4 h-4" /> View Blockchain Trail
                                        </button>
                                    </Link>
                                    <button
                                        onClick={() => { setBatchRecorded(false); setSelectedBatchApp(null); setBatchNotes(""); setBatchWeight(""); }}
                                        className="btn btn-ghost"
                                    >
                                        Done
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* Previously recorded batches */}
                        {recordedBatches.length > 0 && (
                            <div className="card p-5 mt-5">
                                <h2 className="text-[13px] font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-400" />
                                    Recorded Batches
                                </h2>
                                <div className="space-y-2.5">
                                    {recordedBatches.map(b => (
                                        <div key={b._id} className="flex items-center justify-between p-4 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
                                            <div>
                                                <p className="text-[13px] font-semibold text-slate-900 capitalize">
                                                    {b.cropType} � {b.batchRecordedWeight || b.quantityKg}kg
                                                </p>
                                                <p className="text-[11px] font-mono text-[#64748b]">
                                                    {b.batchId} � ?{b.finalPricePerKg}/kg
                                                </p>
                                                <p className="text-[10px] text-blue-400/60 mt-0.5">
                                                    {b.blockchainEvents?.length || 0} blockchain events
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <StatusBadge status={b.status} />
                                                {b.batchId && (
                                                    <Link href={`/trace/${b.batchId}`}>
                                                        <button className="btn btn-ghost btn-sm gap-1">
                                                            <Eye className="w-3.5 h-3.5" /> Trace
                                                        </button>
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

