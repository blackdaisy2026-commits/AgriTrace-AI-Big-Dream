"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useRole } from "@/lib/role-context";
import { generateBatchId } from "@/lib/utils";
import { CROPS, TN_DISTRICTS, TN_TALUKS } from "@/lib/mock-data";
import VoiceInput from "@/components/VoiceInput";
import Header from "@/components/Header";
import toast from "react-hot-toast";
import { QRCodeSVG as QRCode } from "qrcode.react";
import {
    MapPin, Upload, CheckCircle, Loader2, Download, AlertCircle, Clock,
    CreditCard, ChevronRight, Sprout, ShoppingCart, FileText, IndianRupee,
    Calendar, Award, Eye, Package
} from "lucide-react";
import Link from "next/link";
import { apiRequest } from "@/lib/api";

export default function FarmerDashboard() {
    const { user, token, isAuthenticated } = useRole();
    const [activeTab, setActiveTab] = useState<'harvest' | 'batches'>('harvest');
    const [loading, setLoading] = useState(false);

    // Site URL for QR codes (prioritize network IP for mobile scanning)
    const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '');

    // Harvest application state
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

    useEffect(() => {
        const fetchApps = async () => {
            if (!token) return;
            const res = await apiRequest('/harvest/my-applications', 'GET', null, token);
            if (res.status === 'success') {
                setMyApplications(res.data);
            }
        };
        fetchApps();
    }, [token]);

    useEffect(() => {
        const fetchMarketPrice = async () => {
            if (!harvestForm.cropType || !token) {
                setMarketRange(null);
                return;
            }

            // Clear previous range while fetching to show loading state
            setMarketRange(null);

            try {
                const encodedComm = encodeURIComponent(harvestForm.cropType);
                const encodedDist = encodeURIComponent(harvestForm.district || user?.district || '');

                const res = await apiRequest(`/harvest/market-price?commodity=${encodedComm}&district=${encodedDist}`, 'GET', null, token);
                if (res.status === 'success') {
                    setMarketRange(res.data);
                } else {
                    setMarketRange(null);
                }
            } catch (err) {
                setMarketRange(null);
            }
        };
        fetchMarketPrice();
    }, [harvestForm.cropType, harvestForm.district, token, user?.district]);

    if (!isAuthenticated || user?.role !== "farmer") {
        return (
            <div className="min-h-screen circuit-bg flex flex-col">
                <Header />
                <div className="flex-1 flex items-center justify-center text-center">
                    <div className="glass-card p-8">
                        <div className="text-4xl mb-4">🔒</div>
                        <h2 className="text-xl font-bold text-white mb-2">Farmer Access Required</h2>
                        <Link href="/login?role=farmer"><button className="btn-glow text-white mt-4 px-6 py-2 rounded-xl">Login as Farmer</button></Link>
                    </div>
                </div>
            </div>
        );
    }

    const getGPS = () => {
        if (!navigator.geolocation) { toast.error("GPS not available"); return; }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const gps = `${pos.coords.latitude.toFixed(4)},${pos.coords.longitude.toFixed(4)}`;
                setHarvestForm(f => ({ ...f, gpsLocation: gps }));
                toast.success("📍 GPS captured!");
            },
            () => {
                const mockGps = "10.3592,77.7502";
                setHarvestForm(f => ({ ...f, gpsLocation: mockGps }));
                toast("Using demo GPS (Oddanchatram)", { icon: "📍" });
            }
        );
    };

    const getMinDate = () => {
        const d = new Date();
        d.setDate(d.getDate() + 2);
        return d.toISOString().split('T')[0];
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
                toast.success(`🌾 Crop detected: ${val}`);
            }
        }
        const district = TN_DISTRICTS.find(d => lower.includes(d.value.toLowerCase()));
        if (district) {
            setHarvestForm(f => ({ ...f, district: district.value, taluk: "" }));
            toast.success(`📍 District: ${district.label}`);
        }

        // Try to parse weight numbers and units
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
            toast.success(`📦 Weight: ${num} ${unit}`);
        }

        // Try to parse price
        const priceMatch = lower.match(/(\d+)\s*(rupee|ரூபாய்|per|விலை)/);
        if (priceMatch) {
            setHarvestForm(f => ({ ...f, farmerPrice: priceMatch[1] }));
            toast.success(`💰 Price: ₹${priceMatch[1]} per ${harvestForm.unit}`);
        }

        setHarvestForm(f => ({ ...f, notes: (f.notes + " " + text).trim() }));
    };

    // ── Submit Harvest Application ──
    const handleHarvestSubmit = async () => {
        if (!harvestForm.cropType || !harvestForm.quantity || !harvestForm.harvestDate || !harvestForm.farmerPrice) {
            toast.error("Please fill crop, quantity, unit, harvest date & price");
            return;
        }

        // Convert quantity/price to KG for validation and backend
        let multiplier = 1;
        if (harvestForm.unit === "ton") multiplier = 1000;
        else if (harvestForm.unit === "quintal") multiplier = 100;
        else if (harvestForm.unit === "bag") multiplier = 50;

        const pricePerKg = Number(harvestForm.farmerPrice) / multiplier;

        // ── Rule: Market Range Validation ──
        if (marketRange) {
            if (pricePerKg < marketRange.min || pricePerKg > marketRange.max) {
                toast.error(`விதிமுறைமீறல்: இன்றைய சந்தை விலை ₹${marketRange.min} முதல் ₹${marketRange.max} (per kg) வரை மட்டுமே. (Price must be within the market range)`);
                return;
            }
        }

        setLoading(true);
        try {
            const res = await apiRequest('/harvest', 'POST', {
                cropType: harvestForm.cropType,
                cropVariety: harvestForm.cropVariety,
                quantityKg: Number(harvestForm.quantity) * multiplier,
                harvestDate: harvestForm.harvestDate,
                fieldAreaAcres: harvestForm.fieldAreaAcres ? Number(harvestForm.fieldAreaAcres) : undefined,
                gpsLocation: harvestForm.gpsLocation,
                isOrganic: harvestForm.isOrganic,
                isFairTrade: harvestForm.isFairTrade,
                notes: harvestForm.notes + (harvestForm.unit !== 'kg' ? ` (Original Unit: ${harvestForm.quantity} ${harvestForm.unit})` : ''),
                farmerPricePerKg: pricePerKg,
                district: harvestForm.district,
                taluk: harvestForm.taluk,
                village: harvestForm.village
            }, token);

            if (res.status === 'success') {
                setHarvestRef(res.data.applicationId);
                setHarvestSubmitted(true);
                setMyApplications(prev => [res.data, ...prev]);
                toast.success("✅ " + res.message);
            } else {
                toast.error(res.message || "Failed to submit");
            }
        } catch (err) {
            toast.error("Network error");
        } finally {
            setLoading(false);
        }
    };

    // ── Record Batch (after processor approved) ──
    const handleRecordBatch = async () => {
        if (!selectedBatchApp) return;
        setLoading(true);
        try {
            const res = await apiRequest(`/harvest/${selectedBatchApp._id}/record-batch`, 'PATCH', {
                weightKg: batchWeight ? Number(batchWeight) : selectedBatchApp.quantityKg,
                batchNotes
            }, token);

            if (res.status === 'success') {
                const batch = res.data;
                const qrUrl = `${SITE_URL}/trace/${batch.batchId}`;
                setBatchQrUrl(qrUrl);
                setRecordedBatchId(batch.batchId);
                setBatchRecorded(true);
                setMyApplications(prev => prev.map(a => a._id === selectedBatchApp._id ? batch : a));
                toast.success("✅ " + res.message);
            } else {
                toast.error(res.message || "Failed to record batch");
            }
        } catch (err) {
            toast.error("Network error");
        } finally {
            setLoading(false);
        }
    };

    const downloadQR = () => {
        const canvas = document.querySelector("#qr-canvas canvas") as HTMLCanvasElement;
        if (canvas) {
            const a = document.createElement("a");
            a.download = `${recordedBatchId}-qr.png`;
            a.href = canvas.toDataURL();
            a.click();
        }
        // Also try SVG
        const svg = document.querySelector("#qr-canvas svg");
        if (svg) {
            const svgData = new XMLSerializer().serializeToString(svg);
            const canvas2 = document.createElement("canvas");
            canvas2.width = 200; canvas2.height = 200;
            const ctx = canvas2.getContext("2d");
            const img = new window.Image();
            img.onload = () => { ctx?.drawImage(img, 0, 0); const a = document.createElement("a"); a.download = `${recordedBatchId}-qr.png`; a.href = canvas2.toDataURL(); a.click(); };
            img.src = "data:image/svg+xml;base64," + btoa(svgData);
        }
    };

    const getStatusBadge = (status: string) => {
        const map: Record<string, { color: string; label: string }> = {
            pending: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', label: '⏳ Pending Inspection' },
            inspecting: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', label: '🔬 Under Inspection' },
            approved: { color: 'bg-green-500/20 text-green-400 border-green-500/30', label: '✅ Approved → Record Batch' },
            rejected: { color: 'bg-red-500/20 text-red-400 border-red-500/30', label: '❌ Rejected' },
            batch_recorded: { color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', label: '📦 Batch Recorded' },
            listed: { color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30', label: '🏪 Listed in Marketplace' },
            sold: { color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', label: '💰 Sold' },
            expired: { color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', label: '⌛ Expired' },
        };
        const s = map[status] || { color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', label: status };
        return <span className={`text-[10px] px-2.5 py-1 rounded-full border font-bold ${s.color}`}>{s.label}</span>;
    };

    const approvedApps = myApplications.filter(a => a.status === 'approved');

    return (
        <div className="min-h-screen circuit-bg">
            <Header />
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Welcome */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>
                            🌾 விவசாயி பணிப்பலகை
                        </h1>
                        <p className="text-gray-400">Welcome, <span className="text-green-400">{user?.name}</span></p>
                    </div>
                    <Link href="/dashboard/farmer/compensation">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-6 py-3 rounded-2xl flex items-center gap-2 shadow-xl shadow-amber-900/20"
                        >
                            💰 உதவித்தொகை (Relief Fund)
                        </motion.button>
                    </Link>
                </motion.div>

                {/* Tab Switcher */}
                <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 mb-6">
                    <button
                        onClick={() => setActiveTab('harvest')}
                        className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${activeTab === 'harvest' ? 'bg-green-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                    >
                        <Sprout className="w-4 h-4" /> Harvest Application
                    </button>
                    <button
                        onClick={() => setActiveTab('batches')}
                        className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${activeTab === 'batches' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                    >
                        <Package className="w-4 h-4" /> Record Batch
                        {approvedApps.length > 0 && (
                            <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold animate-pulse">
                                {approvedApps.length}
                            </span>
                        )}
                    </button>
                </div>

                {/* Relief Fund Tracker */}
                <ReliefFundTracker token={token} />

                {activeTab === 'harvest' ? (
                    <>
                        {/* ═══════════════════════ HARVEST APPLICATION TAB ═══════════════════════ */}

                        {/* My Applications List */}
                        {myApplications.length > 0 && (
                            <div className="glass-card p-5 mb-6 border-green-500/10">
                                <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-green-400" /> My Harvest Applications
                                </h2>
                                <div className="space-y-3">
                                    {myApplications
                                        .filter(app => ['pending', 'inspecting', 'rejected', 'expired'].includes(app.status))
                                        .map((app) => (
                                            <div key={app.applicationId || app._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 gap-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center text-green-400">
                                                        <Sprout className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-white capitalize">{app.cropType} — ₹{app.farmerPricePerKg}/kg</div>
                                                        <div className="text-[10px] text-gray-500 font-mono">
                                                            {app.applicationId} · {app.quantityKg}kg · Harvest: {new Date(app.harvestDate).toLocaleDateString('en-IN')}
                                                        </div>
                                                        {app.finalPricePerKg && (
                                                            <div className="text-[10px] text-green-400 font-bold mt-0.5">
                                                                Final Price: ₹{app.finalPricePerKg}/kg · Certificate: {app.certificationNo}
                                                            </div>
                                                        )}
                                                        {app.batchId && (
                                                            <div className="text-[10px] text-purple-400 mt-0.5">
                                                                📦 Batch: {app.batchId} · {app.batchRecordedWeight}kg
                                                            </div>
                                                        )}
                                                        {/* Blockchain Trail */}
                                                        {app.blockchainEvents && app.blockchainEvents.length > 0 && (
                                                            <div className="text-[10px] text-blue-400/60 mt-0.5">
                                                                🔗 {app.blockchainEvents.length} blockchain events
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Link
                                                        href={`/trace/${app.applicationId}`}
                                                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400"
                                                        title="Trace on Blockchain"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Link>
                                                    {getStatusBadge(app.status)}
                                                    {app.status === 'approved' && (
                                                        <button
                                                            onClick={() => { setActiveTab('batches'); setSelectedBatchApp(app); setBatchWeight(String(app.quantityKg)); }}
                                                            className="text-[10px] px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold animate-pulse"
                                                        >
                                                            Record Batch →
                                                        </button>
                                                    )}
                                                    {app.purchaseTotalAmount && (
                                                        <span className="text-sm font-bold text-emerald-400">₹{app.purchaseTotalAmount.toLocaleString('en-IN')}</span>
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
                                <motion.div key="harvest-form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                    <div className="glass-card p-6 space-y-6 border-green-500/10">
                                        <h2 className="font-semibold text-white text-xl flex items-center gap-2">
                                            <Sprout className="text-green-400 w-5 h-5" /> New Harvest Application
                                        </h2>
                                        <p className="text-xs text-gray-500 -mt-4">
                                            ⚠️ Submit at least 2 days before harvest. All steps logged on Blockchain.
                                        </p>

                                        {/* Tamil Voice Input */}
                                        <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20">
                                            <label className="block text-sm text-blue-400 mb-2 font-bold">🎤 Voice Input (Tamil / English)</label>
                                            <p className="text-[10px] text-gray-500 mb-2">
                                                Say crop name, quantity, price in Tamil or English. E.g. "தக்காளி 500 கிலோ 40 ரூபாய்"
                                            </p>
                                            <VoiceInput onTranscript={handleVoice} />
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm text-gray-400 mb-1.5">Crop Type / பயிர் வகை *</label>
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
                                                <label className="block text-sm text-gray-400 mb-1.5">Variety / ரகம்</label>
                                                <input value={harvestForm.cropVariety} onChange={e => setHarvestForm(f => ({ ...f, cropVariety: e.target.value }))} placeholder="e.g. Hybrid Local Red" className="agri-input" />
                                            </div>
                                            <div>
                                                <label className="block text-sm text-gray-400 mb-1.5">Unit / அலகு *</label>
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
                                                <label className="block text-sm text-gray-400 mb-1.5">Quantity ({harvestForm.unit}) / அளவு *</label>
                                                <input type="number" value={harvestForm.quantity} onChange={e => setHarvestForm(f => ({ ...f, quantity: e.target.value }))} placeholder={`e.g. 500`} className="agri-input" />
                                            </div>
                                            <div>
                                                <label className="block text-sm text-gray-400 mb-1.5">Harvest Date / அறுவடை நாள் *</label>
                                                <div className="relative">
                                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-green-300 z-20" />
                                                    <input type="date" min={getMinDate()} value={harvestForm.harvestDate} onChange={e => setHarvestForm(f => ({ ...f, harvestDate: e.target.value }))} className="agri-input !pl-24" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Pricing */}
                                        <div className="p-4 rounded-2xl bg-green-500/5 border border-green-500/20">
                                            <label className="block text-sm text-green-400 mb-2 font-bold flex items-center gap-2">
                                                <IndianRupee className="w-4 h-4" /> Your Price per {harvestForm.unit} *
                                            </label>
                                            <p className="text-[10px] text-gray-500 mb-3">
                                                Agri Officer can only adjust by ±0.2%. Your price is protected.
                                            </p>
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl text-green-400 font-bold">₹</span>
                                                <input type="number" step="0.5" value={harvestForm.farmerPrice} onChange={e => setHarvestForm(f => ({ ...f, farmerPrice: e.target.value }))} placeholder="40.00" className="agri-input text-2xl font-bold text-green-400 max-w-[200px]" />
                                                <span className="text-gray-400 text-sm">per {harvestForm.unit}</span>
                                            </div>

                                            {/* ── Market Price Indicator ── */}
                                            <div className="mt-3">
                                                {marketRange ? (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="flex flex-col gap-2 bg-blue-500/10 border border-blue-500/20 px-4 py-3 rounded-2xl shadow-lg shadow-blue-900/10"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                                                                <span className="text-[11px] text-blue-400 font-bold uppercase tracking-wider">Live Market Rate (Verified)</span>
                                                            </div>
                                                            <span className="text-[10px] text-gray-500">Source: Agmarknet</span>
                                                        </div>
                                                        <div className="text-white text-sm">
                                                            இன்றைய சந்தை விலை: <span className="text-blue-400 font-bold text-lg">₹{marketRange.min} – ₹{marketRange.max}</span> per kg
                                                        </div>
                                                        {harvestForm.unit !== 'kg' && (
                                                            <div className="text-[10px] text-blue-300">
                                                                (Approx. ₹{(marketRange.modal * (harvestForm.unit === 'ton' ? 1000 : harvestForm.unit === 'quintal' ? 100 : harvestForm.unit === 'bag' ? 50 : 1)).toFixed(0)} per {harvestForm.unit})
                                                            </div>
                                                        )}
                                                        <div className="text-[10px] text-gray-400 italic">
                                                            Crop: {marketRange.commodity} · updated for {harvestForm.district || 'Tamil Nadu'}
                                                        </div>
                                                    </motion.div>
                                                ) : harvestForm.cropType ? (
                                                    <div className="flex flex-col gap-2 bg-blue-500/5 border border-blue-500/20 px-4 py-3 rounded-2xl animate-pulse">
                                                        <div className="flex items-center gap-2">
                                                            <Loader2 className="w-3 h-3 text-blue-400 animate-spin" />
                                                            <span className="text-[11px] text-blue-400 font-bold uppercase tracking-wider">Fetching Live Market Data...</span>
                                                        </div>
                                                        <div className="text-gray-400 text-sm">
                                                            சந்தை விலை விவரங்களை தேடுகிறது: <span className="text-white font-medium">{harvestForm.cropType}</span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-[11px] text-gray-600 italic px-1">
                                                        Select a crop type to see live market pricing and price protection range.
                                                    </div>
                                                )}
                                            </div>

                                            {harvestForm.farmerPrice && harvestForm.quantity && (
                                                <div className="mt-4 pt-3 border-t border-green-900/10 flex items-center justify-between">
                                                    <div className="text-xs text-gray-500">Total Projected Value / மொத்த மதிப்பு</div>
                                                    <div className="text-xl font-bold text-green-400">₹{(Number(harvestForm.farmerPrice) * Number(harvestForm.quantity)).toLocaleString('en-IN')}</div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Location */}
                                        <div className="grid md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-sm text-gray-400 mb-1.5">District / மாவட்டம்</label>
                                                <select
                                                    value={harvestForm.district}
                                                    onChange={e => {
                                                        const d = e.target.value;
                                                        setHarvestForm(f => ({ ...f, district: d, taluk: "" }));
                                                    }}
                                                    className="agri-select"
                                                >
                                                    <option value="">Select district...</option>
                                                    {TN_DISTRICTS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm text-gray-400 mb-1.5">Taluk / தாலுக்கா</label>
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
                                                <label className="block text-sm text-gray-400 mb-1.5">Village / கிராமம்</label>
                                                <input value={harvestForm.village} onChange={e => setHarvestForm(f => ({ ...f, village: e.target.value }))} placeholder="e.g. Oddanchatram" className="agri-input" />
                                            </div>
                                        </div>

                                        {/* Extra */}
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm text-gray-400 mb-1.5">Field Area (Acres)</label>
                                                <input type="number" step="0.1" value={harvestForm.fieldAreaAcres} onChange={e => setHarvestForm(f => ({ ...f, fieldAreaAcres: e.target.value }))} placeholder="e.g. 2.5" className="agri-input" />
                                            </div>
                                            <div>
                                                <label className="block text-sm text-gray-400 mb-1.5">GPS Location</label>
                                                <div className="flex gap-2">
                                                    <input value={harvestForm.gpsLocation} onChange={e => setHarvestForm(f => ({ ...f, gpsLocation: e.target.value }))} placeholder="Lat,Lng" className="agri-input" />
                                                    <button type="button" onClick={getGPS} className="px-3 py-2 rounded-xl bg-blue-700 hover:bg-blue-600 text-white text-xs flex items-center gap-1 whitespace-nowrap"><MapPin className="w-3 h-3" /> GPS</button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-6">
                                            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={harvestForm.isOrganic} onChange={e => setHarvestForm(f => ({ ...f, isOrganic: e.target.checked }))} className="w-4 h-4 accent-green-500" /><span className="text-sm text-white">🌿 Organic</span></label>
                                            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={harvestForm.isFairTrade} onChange={e => setHarvestForm(f => ({ ...f, isFairTrade: e.target.checked }))} className="w-4 h-4 accent-amber-500" /><span className="text-sm text-white">⭐ Fair Trade</span></label>
                                        </div>

                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1.5">Notes / குறிப்புகள்</label>
                                            <textarea value={harvestForm.notes} onChange={e => setHarvestForm(f => ({ ...f, notes: e.target.value }))} rows={2} placeholder="Additional notes..." className="agri-input resize-none" />
                                        </div>

                                        <motion.button
                                            whileTap={{ scale: 0.97 }}
                                            onClick={handleHarvestSubmit}
                                            disabled={loading}
                                            className="w-full btn-glow text-white font-semibold py-4 rounded-xl text-lg flex items-center justify-center gap-2 disabled:opacity-60"
                                        >
                                            {loading ? (<><Loader2 className="w-5 h-5 animate-spin" /> Submitting to Blockchain...</>) : (<>🔗 Submit Harvest Application on Blockchain</>)}
                                        </motion.button>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div key="harvest-success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-8 text-center">
                                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <CheckCircle className="text-green-500 w-12 h-12" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-white mb-2">Application on Blockchain! 🔗</h2>
                                    <p className="text-gray-400 mb-4">Logged on blockchain. Awaiting Agri Officer inspection.</p>

                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6 max-w-sm mx-auto">
                                        <div className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-3">Application QR (தடம் பதிவு)</div>
                                        <div className="bg-white p-3 rounded-xl inline-block mb-3">
                                            <QRCode value={`${SITE_URL}/trace/${harvestRef}`} size={160} />
                                        </div>
                                        <div className="text-xl font-mono font-black text-green-400 mt-1">{harvestRef}</div>
                                        <p className="text-[10px] text-gray-500 mt-2 uppercase tracking-tight">On-Chain Traceability Generated</p>
                                    </div>

                                    <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-4 mb-8 max-w-md mx-auto text-sm text-blue-300">
                                        <Award className="w-5 h-5 inline mr-2 text-blue-400" />
                                        Blockchain record created. Agri Officer will inspect within <b>3 days</b>.
                                    </div>

                                    <button
                                        onClick={() => {
                                            setHarvestSubmitted(false);
                                            setHarvestForm({
                                                cropType: "", cropVariety: "", quantity: "", unit: "kg", harvestDate: "",
                                                fieldAreaAcres: "", gpsLocation: "", isOrganic: false, isFairTrade: false,
                                                notes: "", farmerPrice: "", district: user?.district || "",
                                                taluk: user?.taluk || "", village: user?.location || ""
                                            });
                                        }}
                                        className="btn-glow text-white px-6 py-3 rounded-xl"
                                    >
                                        + New Application
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </>
                ) : (
                    <>
                        {/* ═══════════════════════ RECORD BATCH TAB ═══════════════════════ */}

                        {/* Approved Apps Awaiting Batch Recording */}
                        <div className="glass-card p-5 mb-6">
                            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                                <Package className="w-5 h-5 text-blue-400" /> Record Batch
                            </h2>
                            <p className="text-xs text-gray-500 mb-4">
                                Agri Officer-approved crops appear here. Record batch to generate QR and list in marketplace.
                            </p>

                            {approvedApps.length === 0 ? (
                                <div className="text-center py-8">
                                    <Package className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                                    <h3 className="text-lg font-bold text-gray-500">No Approved Applications</h3>
                                    <p className="text-sm text-gray-600">Submit harvest applications and wait for Agri Officer approval.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {approvedApps.map((app) => (
                                        <div
                                            key={app._id}
                                            onClick={() => { setSelectedBatchApp(app); setBatchWeight(String(app.quantityKg)); }}
                                            className={`p-4 rounded-2xl border transition-all cursor-pointer ${selectedBatchApp?._id === app._id ? 'border-blue-500 bg-blue-500/10' : 'border-white/5 bg-white/5 hover:border-white/10'}`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="font-bold text-white capitalize">{app.cropType} {app.cropVariety ? `(${app.cropVariety})` : ''}</div>
                                                    <div className="text-xs text-gray-500">
                                                        {app.applicationId} · ₹{app.finalPricePerKg}/kg · Certified: {app.certificationNo}
                                                    </div>
                                                    <div className="text-xs text-green-400 mt-1">
                                                        ✅ Approved · Original: {app.quantityKg}kg
                                                    </div>
                                                </div>
                                                <span className="text-xs px-3 py-1.5 bg-green-600 text-white rounded-lg font-bold">Select</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Batch Recording Form */}
                        {selectedBatchApp && !batchRecorded && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 space-y-6 border-blue-500/20">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Package className="text-blue-400 w-5 h-5" /> Record Batch: {selectedBatchApp.applicationId}
                                </h3>

                                {/* Tamil Voice Input for Batch */}
                                <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/20">
                                    <label className="block text-sm text-blue-400 mb-2 font-bold">🎤 Voice Notes (Tamil / English)</label>
                                    <VoiceInput onTranscript={(text: string) => setBatchNotes(prev => (prev + " " + text).trim())} />
                                </div>

                                {/* Summary */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {[
                                        { label: 'Crop', value: selectedBatchApp.cropType, icon: '🌾' },
                                        { label: 'Certified Price', value: `₹${selectedBatchApp.finalPricePerKg}/kg`, icon: '💰' },
                                        { label: 'Original Weight', value: `${selectedBatchApp.quantityKg}kg`, icon: '📦' },
                                        { label: 'Certificate', value: selectedBatchApp.certificationNo, icon: '📜' },
                                    ].map((item, i) => (
                                        <div key={i} className="bg-white/5 p-3 rounded-xl">
                                            <div className="text-[10px] text-gray-500">{item.icon} {item.label}</div>
                                            <div className="text-white text-sm font-bold capitalize truncate">{item.value}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Weight Adjustment */}
                                <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20">
                                    <label className="block text-sm text-amber-400 mb-2 font-bold">⚖️ Actual Batch Weight (kg)</label>
                                    <p className="text-[10px] text-gray-500 mb-3">
                                        You can update the weight if it differs from the application. Original: {selectedBatchApp.quantityKg}kg
                                    </p>
                                    <input
                                        type="number"
                                        value={batchWeight}
                                        onChange={e => setBatchWeight(e.target.value)}
                                        className="agri-input text-xl font-bold text-amber-400 max-w-[200px]"
                                    />
                                    {batchWeight && selectedBatchApp.finalPricePerKg && (
                                        <div className="mt-2 text-sm text-gray-400">
                                            New total: <span className="text-green-400 font-bold">₹{(Number(batchWeight) * selectedBatchApp.finalPricePerKg).toLocaleString('en-IN')}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Batch Notes */}
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1.5">Batch Notes / தொகுதி குறிப்புகள்</label>
                                    <textarea value={batchNotes} onChange={e => setBatchNotes(e.target.value)} rows={2} placeholder="Notes about this batch..." className="agri-input resize-none" />
                                </div>

                                <motion.button
                                    whileTap={{ scale: 0.97 }}
                                    onClick={handleRecordBatch}
                                    disabled={loading}
                                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl text-lg flex items-center justify-center gap-2"
                                >
                                    {loading ? (<><Loader2 className="w-5 h-5 animate-spin" /> Recording on Blockchain...</>) : (<>🔗 Record Batch, Generate QR & List in Marketplace</>)}
                                </motion.button>
                            </motion.div>
                        )}

                        {/* Batch Success + QR Code */}
                        {batchRecorded && (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-8 text-center">
                                <div className="text-5xl mb-4">✅</div>
                                <h2 className="text-2xl font-bold text-white mb-2">Batch Recorded on Blockchain!</h2>
                                <p className="text-gray-400 mb-2">Your crop is now listed in the marketplace.</p>
                                <p className="text-green-400 font-mono text-sm mb-6">{recordedBatchId}</p>

                                <div id="qr-canvas" className="flex justify-center mb-6">
                                    <div className="bg-white p-4 rounded-2xl shadow-2xl shadow-green-900/30">
                                        <QRCode value={batchQrUrl} size={200} level="H" />
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mb-6 break-all">{batchQrUrl}</p>

                                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                    <button onClick={downloadQR} className="btn-glow text-white px-6 py-3 rounded-xl flex items-center gap-2 justify-center">
                                        <Download className="w-4 h-4" /> Download QR
                                    </button>
                                    <Link href={`/trace/${recordedBatchId}`}>
                                        <button className="border border-green-500/30 text-green-400 px-6 py-3 rounded-xl hover:bg-green-900/20 transition-colors w-full">
                                            🔍 View Full Blockchain Trail →
                                        </button>
                                    </Link>
                                    <button
                                        onClick={() => { setBatchRecorded(false); setSelectedBatchApp(null); setBatchNotes(""); setBatchWeight(""); }}
                                        className="border border-white/10 text-gray-400 px-6 py-3 rounded-xl hover:bg-white/5 transition-colors"
                                    >
                                        Done
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* Previously Recorded Batches */}
                        {myApplications.filter(a => ['batch_recorded', 'listed', 'sold'].includes(a.status)).length > 0 && (
                            <div className="glass-card p-5 mt-6">
                                <h2 className="font-semibold text-white mb-3 flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-400" /> Recorded Batches
                                </h2>
                                <div className="space-y-3">
                                    {myApplications.filter(a => ['batch_recorded', 'listed', 'sold'].includes(a.status)).map((b) => (
                                        <div key={b._id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                                            <div>
                                                <div className="font-semibold text-white capitalize">{b.cropType} — {b.batchRecordedWeight || b.quantityKg}kg</div>
                                                <div className="text-xs text-gray-500">{b.batchId} · ₹{b.finalPricePerKg}/kg</div>
                                                <div className="text-[10px] text-blue-400/60">🔗 {b.blockchainEvents?.length || 0} blockchain events</div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {getStatusBadge(b.status)}
                                                {b.batchId && (
                                                    <Link href={`/trace/${b.batchId}`}>
                                                        <button className="text-xs text-blue-400 hover:underline">Trace →</button>
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

function ReliefFundTracker({ token }: { token: string | null }) {
    const [claims, setClaims] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchClaims = async () => {
            if (!token) return;
            try {
                const res = await apiRequest('/compensation/my-claims', 'GET', null, token);
                if (res.status === 'success') { setClaims(res.data); }
            } catch (err) { console.error("Failed to fetch claims", err); }
            finally { setLoading(false); }
        };
        fetchClaims();
    }, [token]);

    if (loading || claims.length === 0) return null;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20';
            case 'processor_review': return 'bg-blue-500/20 text-blue-400 border-blue-500/20';
            case 'processor_approved': return 'bg-blue-500/20 text-blue-400 border-blue-500/20';
            case 'tahsildar_review': return 'bg-violet-500/20 text-violet-400 border-violet-500/20';
            case 'tahsildar_approved': return 'bg-violet-500/20 text-violet-400 border-violet-500/20';
            case 'approved': return 'bg-amber-500/20 text-amber-400 border-amber-500/20';
            case 'disbursed': return 'bg-green-500/20 text-green-400 border-green-500/20';
            case 'rejected': case 'processor_rejected': case 'tahsildar_rejected': return 'bg-red-500/20 text-red-400 border-red-500/20';
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/20';
        }
    };

    const getStatusLabel = (status: string) => {
        const map: Record<string, string> = {
            pending: '⏳ Pending Field Visit',
            processor_review: '🔬 Field Inspection Ongoing',
            processor_approved: '✅ Agri Officer Approved → Tahsildar',
            processor_rejected: '❌ Agri Officer Rejected',
            tahsildar_review: '📋 Tahsildar Reviewing',
            tahsildar_approved: '✅ Tahsildar Approved → Admin',
            tahsildar_rejected: '❌ Tahsildar Rejected',
            approved: '🏛️ Admin Sanctioned',
            disbursed: '💰 Fund Disbursed!',
            rejected: '❌ Rejected',
        };
        return map[status] || status;
    };

    return (
        <div className="glass-card p-5 mb-6 border-amber-500/20 bg-amber-500/5">
            <h2 className="font-semibold text-white mb-4 flex items-center gap-2"><AlertCircle className="w-4 h-4 text-amber-500" /> Relief Fund Claims</h2>
            <div className="space-y-3">
                {claims.map((c) => (
                    <div key={c.claimRefNo} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-black/20 border border-white/5 gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                                {c.status === 'disbursed' ? <CreditCard className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                            </div>
                            <div>
                                <div className="font-semibold text-white">{c.cropType} - {c.damageReason}</div>
                                <div className="text-[10px] text-gray-500 font-mono">{c.claimRefNo}</div>
                                <div className={`text-[10px] px-2 py-0.5 rounded-full border mt-1 inline-block ${getStatusColor(c.status)}`}>
                                    {getStatusLabel(c.status)}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {(c.approvedAmount || c.disbursedAmount) && (
                                <span className="text-sm font-bold text-green-400">₹{(c.disbursedAmount || c.approvedAmount).toLocaleString()}</span>
                            )}
                            <Link href={`/trace/relief/${c.claimRefNo}`}>
                                <button className="flex items-center gap-1 text-xs text-blue-400 border border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 px-3 py-1.5 rounded-lg transition-colors">
                                    🔍 Trace
                                </button>
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
