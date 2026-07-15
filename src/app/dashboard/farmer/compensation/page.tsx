"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRole } from "@/lib/role-context";
import Header from "@/components/Header";
import { toast } from "sonner";
import {
    FileText,
    Upload,
    CloudRain,
    Wind,
    Waves,
    AlertCircle,
    CheckCircle,
    ChevronRight,
    ArrowLeft,
    Loader2,
    Calendar,
    MapPin,
    Smartphone,
    User
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { CROPS } from "@/lib/mock-data";

export default function CompensationPage() {
    const { user, token, isAuthenticated, apiBaseUrl } = useRole();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [claimRef, setClaimRef] = useState("");

    const [form, setForm] = useState({
        uzhavarAttaiNo: "",
        aadhaarNo: "",
        mobileNo: user?.mobileNo || "",
        address: user?.location || "",
        village: "",
        district: user?.district || "",
        taluk: user?.taluk || "",
        landDetails: "",
        pattaNo: "",
        surveyNo: "",
        landAreaAcres: "",
        cropType: "",
        damageReason: "",
        damageDate: "",
        damageDescription: "",
        photoPreview: null as string | null,
    });

    const damageReasons = [
        { value: "flood", label: "??????? (Flood)", icon: <Waves className="w-5 h-5" /> },
        { value: "heavy_rain", label: "????? (Heavy Rain)", icon: <CloudRain className="w-5 h-5" /> },
        { value: "cyclone", label: "????? (Cyclone)", icon: <Wind className="w-5 h-5" /> },
        { value: "drought", label: "?????? (Drought)", icon: <AlertCircle className="w-5 h-5" /> },
        { value: "pest", label: "???????? ????????? (Pest)", icon: <AlertCircle className="w-5 h-5" /> },
        { value: "other", label: "??? ????????? (Other)", icon: <AlertCircle className="w-5 h-5" /> },
    ];

    if (!isAuthenticated || user?.role !== "farmer") {
        return (
            <div className="min-h-screen min-h-screen flex flex-col">
                <Header />
                <div className="flex-1 flex items-center justify-center">
                    <div className="card p-8 text-center">
                        <div className="text-4xl mb-4">??</div>
                        <h2 className="text-xl font-bold text-slate-900 mb-2">Farmer Access Required</h2>
                        <Link href="/login?role=farmer">
                            <button className="btn btn-primary text-white mt-4 px-6 py-2 rounded-xl">Login as Farmer</button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Compress image before storing as base64
    const compressImage = (file: File, maxWidth = 800, quality = 0.6): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (ev) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let w = img.width, h = img.height;
                    if (w > maxWidth) { h = (maxWidth / w) * h; w = maxWidth; }
                    canvas.width = w;
                    canvas.height = h;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, w, h);
                    resolve(canvas.toDataURL('image/jpeg', quality));
                };
                img.onerror = reject;
                img.src = ev.target?.result as string;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const compressed = await compressImage(file);
                setForm(f => ({ ...f, photoPreview: compressed }));
                toast.success("?? Photo added!");
            } catch {
                toast.error("Could not process photo");
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.aadhaarNo || !form.uzhavarAttaiNo || !form.damageReason || !form.damageDate) {
            toast.error("Please fill all required fields");
            return;
        }

        setLoading(true);
        try {
            const res = await apiRequest('/compensation', 'POST', {
                ...form,
                landDetails: form.landDetails || `Patta: ${form.pattaNo}, Survey: ${form.surveyNo}`,
                landAreaAcres: Number(form.landAreaAcres),
                photoUrls: form.photoPreview ? [form.photoPreview] : []
            }, token);

            if (res.status === 'success') {
                setClaimRef(res.data.claim.claimRefNo);
                setSubmitted(true);
                toast.success("? ?????????? ???????????????????!");
            } else {
                toast.error(res.message || "Submission failed");
            }
        } catch (err) {
            toast.error("Network error: Could not submit claim");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen min-h-screen">
            <Header />
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <Link href="/dashboard/farmer" className="flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors mb-2 text-sm">
                            <ArrowLeft className="w-4 h-4" /> Dashboard-???? ???????????
                        </Link>
                        <h1 className="text-3xl font-black text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
                            ?????????? ??????????
                        </h1>
                        <p className="text-[#475569]">Compensation / Relief Fund Application</p>
                    </div>
                    <div className="hidden md:block">
                        <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-2xl flex items-center gap-3">
                            <AlertCircle className="text-amber-500 w-5 h-5 shrink-0" />
                            <div className="text-[10px] text-amber-400 font-medium leading-tight">
                                ?????? ??????? ??????? 72 ??? ????????????? <br /> ???????????? ????????.
                            </div>
                        </div>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {!submitted ? (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Section 1: Personal Details */}
                                <div className="card p-6 border-green-500/10">
                                    <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                        <User className="text-green-400 w-5 h-5" />
                                        1. ????????? ????????? (Personal Details)
                                    </h2>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm text-[#475569] ml-1">??????? ????? (Farmer Name)</label>
                                            <input value={user?.name} disabled className="agri-input opacity-70 cursor-not-allowed" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm text-[#475569] ml-1">?????? ??? (Mobile No) *</label>
                                            <div className="relative group">
                                                <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-green-300 z-20" />
                                                <input
                                                    value={form.mobileNo}
                                                    onChange={e => setForm(f => ({ ...f, mobileNo: e.target.value }))}
                                                    type="tel"
                                                    placeholder="10 digit number"
                                                    className="agri-input !pl-24"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm text-[#475569] ml-1">????? ????? ??? (Uzhavar Card No) *</label>
                                            <input
                                                value={form.uzhavarAttaiNo}
                                                onChange={e => setForm(f => ({ ...f, uzhavarAttaiNo: e.target.value }))}
                                                placeholder="e.g. TN-UZ-12345"
                                                className="agri-input border-amber-500/30"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm text-[#475569] ml-1">????? ??? (Aadhaar No) *</label>
                                            <input
                                                value={form.aadhaarNo}
                                                onChange={e => setForm(f => ({ ...f, aadhaarNo: e.target.value }))}
                                                placeholder="1234 5678 9012"
                                                maxLength={12}
                                                className="agri-input"
                                                required
                                            />
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-sm text-[#475569] ml-1">?????? ?????? (Address) *</label>
                                            <textarea
                                                value={form.address}
                                                onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                                                rows={2}
                                                className="agri-input resize-none"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Section 2: Land & Location */}
                                <div className="card p-6 border-blue-500/10">
                                    <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                        <MapPin className="text-blue-400 w-5 h-5" />
                                        2. ????? ??????? ???????? ????????? (Land Details)
                                    </h2>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm text-[#475569] ml-1">??????? (Village) *</label>
                                            <input
                                                value={form.village}
                                                onChange={e => setForm(f => ({ ...f, village: e.target.value }))}
                                                placeholder="Enter your village"
                                                className="agri-input"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm text-[#475569] ml-1">?????? (Taluk) *</label>
                                            <input
                                                value={form.taluk}
                                                onChange={e => setForm(f => ({ ...f, taluk: e.target.value }))}
                                                placeholder="Enter your taluk"
                                                className="agri-input"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm text-[#475569] ml-1">????? ??? (Patta No) *</label>
                                            <input
                                                value={form.pattaNo}
                                                onChange={e => setForm(f => ({ ...f, pattaNo: e.target.value }))}
                                                placeholder="Patta number"
                                                className="agri-input"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm text-[#475569] ml-1">??? ??? (Survey No) *</label>
                                            <input
                                                value={form.surveyNo}
                                                onChange={e => setForm(f => ({ ...f, surveyNo: e.target.value }))}
                                                placeholder="Survey number"
                                                className="agri-input"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm text-[#475569] ml-1">????????? ?????? (Area in Acres) *</label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={form.landAreaAcres}
                                                onChange={e => setForm(f => ({ ...f, landAreaAcres: e.target.value }))}
                                                placeholder="e.g. 2.5"
                                                className="agri-input"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm text-[#475569] ml-1">????? ??? (Crop Type) *</label>
                                            <select
                                                value={form.cropType}
                                                onChange={e => setForm(f => ({ ...f, cropType: e.target.value }))}
                                                className="agri-select"
                                                required
                                            >
                                                <option value="">Select Crop</option>
                                                {CROPS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 3: Damage Details */}
                                <div className="card p-6 border-amber-500/10">
                                    <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                        <AlertCircle className="text-amber-500 w-5 h-5" />
                                        3. ??? ????????? (Damage Details)
                                    </h2>
                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <label className="text-sm text-[#475569] ml-1">????? ??????? ?????? (Reason for Damage) *</label>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                {damageReasons.map((r) => (
                                                    <button
                                                        key={r.value}
                                                        type="button"
                                                        onClick={() => setForm(f => ({ ...f, damageReason: r.value }))}
                                                        className={`p-4 rounded-2xl border text-left transition-all flex flex-col items-center justify-center gap-2 text-center h-28 ${form.damageReason === r.value
                                                            ? "border-amber-500/60 bg-amber-500/10 shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/20"
                                                            : "border-[#e2e8f0] bg-[#ffffff] hover:border-slate-200"
                                                            }`}
                                                    >
                                                        <div className={form.damageReason === r.value ? "text-amber-400" : "text-[#475569]"}>
                                                            {r.icon}
                                                        </div>
                                                        <div className={`text-[10px] font-bold leading-tight ${form.damageReason === r.value ? "text-slate-900" : "text-[#64748b]"}`}>
                                                            {r.label}
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm text-[#475569] ml-1">????? ??????? ???? (Date of Damage) *</label>
                                                <div className="relative group">
                                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-green-300 z-20" />
                                                    <input
                                                        type="date"
                                                        value={form.damageDate}
                                                        onChange={e => setForm(f => ({ ...f, damageDate: e.target.value }))}
                                                        className="agri-input !pl-24"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm text-[#475569] ml-1">????????????? (Photos of Damage) *</label>
                                                <label className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-amber-500/30 cursor-pointer hover:border-amber-500/60 transition-colors h-14">
                                                    <Upload className="w-5 h-5 text-amber-500" />
                                                    <span className="text-xs text-[#475569]">????????? ??????? ???? (Upload)</span>
                                                    <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
                                                </label>
                                            </div>
                                        </div>

                                        {form.photoPreview && (
                                            <div className="relative h-48 w-full rounded-2xl overflow-hidden border border-slate-200">
                                                <img src={form.photoPreview} alt="Damage" className="w-full h-full object-cover" />
                                                <button
                                                    onClick={() => setForm(f => ({ ...f, photoPreview: null }))}
                                                    className="absolute top-2 right-2 bg-slate-200 p-2 rounded-full text-slate-900"
                                                >
                                                    ?
                                                </button>
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            <label className="text-sm text-[#475569] ml-1">???????? (Additional Information)</label>
                                            <textarea
                                                value={form.damageDescription}
                                                onChange={e => setForm(f => ({ ...f, damageDescription: e.target.value }))}
                                                placeholder="????? ????? ??????? ?????????????..."
                                                rows={3}
                                                className="agri-input resize-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                    type="submit"
                                    disabled={loading}
                                    className="w-full btn btn-primary text-white font-black py-5 rounded-2xl text-xl flex items-center justify-center gap-3 shadow-2xl disabled:opacity-50"
                                >
                                    {loading ? (
                                        <><Loader2 className="w-6 h-6 animate-spin" /> ?????????? ????? ???????????????...</>
                                    ) : (
                                        <>???????????? ??????????????? (Submit) <ChevronRight className="w-6 h-6" /></>
                                    )}
                                </motion.button>
                            </form>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="card p-10 text-center"
                        >
                            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="text-green-500 w-12 h-12" />
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 mb-2">?????????? ???????!</h2>
                            <p className="text-[#475569] mb-6">?????? ?????????? ???????? ??????????? ???????????????????.</p>

                            <div className="bg-[#ffffff] border border-slate-200 rounded-2xl p-6 mb-8 max-w-sm mx-auto">
                                <span className="text-xs text-[#64748b] uppercase tracking-widest font-bold">Reference Number</span>
                                <div className="text-2xl font-mono font-black text-green-400 mt-1">{claimRef}</div>
                            </div>

                            <p className="text-sm text-[#475569] mb-10 max-w-md mx-auto leading-relaxed">
                                ?????? ?????????? ??????? <b>Field Officer</b>-???? ??????? ?????????????????. ???? ???????? ?????? ??????? ????? ?????? ??????? ??????????????.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link href="/dashboard/farmer" className="flex-1">
                                    <button className="w-full py-4 rounded-xl bg-green-500 text-black font-bold text-lg">
                                        Dashboard-???? ?????????
                                    </button>
                                </Link>
                                <button
                                    onClick={() => window.print()}
                                    className="flex-1 py-4 rounded-xl border border-slate-200 bg-[#ffffff] text-slate-900 font-bold text-lg flex items-center justify-center gap-2"
                                >
                                    ?? ???????????? ?????????
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="mt-12 text-center">
                    <p className="text-[#64748b] text-xs">
                        AgriTraceIndia Federated Identity Protocol � Tamil Nadu Disaster Management Authority Integrated
                    </p>
                </div>
            </div>
        </div>
    );
}

