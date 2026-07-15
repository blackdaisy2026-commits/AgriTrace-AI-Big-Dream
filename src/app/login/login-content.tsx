"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useRole } from "@/lib/role-context";
import { toast } from "sonner";
import {
    Leaf, User, Shield, ArrowRight, UserPlus, Fingerprint,
    MapPin, Eye, EyeOff, Loader2, CheckCircle, AlertCircle
} from "lucide-react";
import Link from "next/link";
import { tnDistrictsAndTaluks } from "@/lib/tn-districts";

// ─── Role definitions ─────────────────────────────────────────────────────────
const roles = [
    { role: "farmer"    as const, label: "Farmer",       tamil: "விவசாயி",             icon: "🌾", desc: "Record harvests, get QR codes, voice input" },
    { role: "processor" as const, label: "Agri Officer", tamil: "வேளாண்மை அதிகாரி",   icon: "🔬", desc: "Quality tests, processing events" },
    { role: "retailer"  as const, label: "Retailer",     tamil: "சில்லறை வணிகர்",     icon: "🏪", desc: "Scan QR, view batch details, inventory" },
    { role: "consumer"  as const, label: "Consumer",     tamil: "நுகர்வோர்",           icon: "👤", desc: "Scan product QR, view full journey" },
    { role: "tahsildar" as const, label: "Tahsildar",    tamil: "தாசில்தார்",          icon: "📋", desc: "Verify Agri Officer reports, approve relief" },
    { role: "regulator" as const, label: "IAgS / Admin", tamil: "IAgS / நிர்வாகி",    icon: "🏛️", desc: "Monitor all batches, final fund sanction" },
];

// ─── Field component ──────────────────────────────────────────────────────────
function FormField({
    label,
    error,
    required,
    children,
}: {
    label: string;
    error?: string;
    required?: boolean;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-1.5">
            <label className="form-label">
                {label} {required && <span className="text-red-400">*</span>}
            </label>
            {children}
            {error && (
                <p className="form-error">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {error}
                </p>
            )}
        </div>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function LoginContent() {
    const searchParams = useSearchParams();
    const { login, apiBaseUrl } = useRole();
    const router = useRouter();

    const [mode, setMode] = useState<"login" | "register">("login");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [selectedRole, setSelectedRole] = useState<string>(
        searchParams.get("role") || "farmer"
    );

    // Login fields
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // Register fields
    const [name, setName] = useState("");
    const [uzhavarAttai, setUzhavarAttai] = useState("");
    const [aadhaar, setAadhaar] = useState("");
    const [village, setVillage] = useState("");
    const [mobile, setMobile] = useState("");
    const [landDetails, setLandDetails] = useState("");
    const [district, setDistrict] = useState("");
    const [taluk, setTaluk] = useState("");

    // Validation errors
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Admins cannot self-register
    const isRestrictedRole = selectedRole === "regulator";

    const handleRoleChange = (role: string) => {
        setSelectedRole(role);
        setErrors({});
        if (role === "regulator") setMode("login");
    };

    const availableTaluks = district ? tnDistrictsAndTaluks[district] || [] : [];

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!email.trim()) newErrors.email = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "Invalid email address";

        if (!password.trim()) newErrors.password = "Password is required";
        else if (password.length < 6) newErrors.password = "Password must be at least 6 characters";

        if (mode === "register") {
            if (!name.trim()) newErrors.name = "Full name is required";
            if (!district) newErrors.district = "District is required";
            if (!taluk) newErrors.taluk = "Taluk is required";
            if (!mobile.trim()) newErrors.mobile = "Mobile number is required";
            else if (!/^\d{10}$/.test(mobile.replace(/\D/g, ""))) newErrors.mobile = "Enter a valid 10-digit number";

            if (selectedRole === "farmer") {
                if (!uzhavarAttai.trim()) newErrors.uzhavarAttai = "Uzhavar Attai number is required";
                if (!aadhaar.trim()) newErrors.aadhaar = "Aadhaar number is required";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        if (mode === "register") {
            setLoading(true);
            try {
                const res = await fetch(`${apiBaseUrl}/auth/register`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: name.trim(),
                        email: email.trim().toLowerCase(),
                        password,
                        role: selectedRole,
                        district,
                        taluk,
                        village,
                        location: village || taluk,
                        mobileNo: mobile,
                        aadhaarNumber: aadhaar,
                        uzhavarCardNumber: uzhavarAttai,
                        landDetails,
                    }),
                });
                const data = await res.json();
                if (res.ok && data.status === "success") {
                    toast.success(`Registered! Welcome, ${name.split(" ")[0]}. Please sign in.`);
                    setMode("login");
                    setName(""); setUzhavarAttai(""); setDistrict(""); setTaluk("");
                    setAadhaar(""); setMobile(""); setLandDetails(""); setVillage("");
                } else {
                    toast.error(data.message || "Registration failed. Please try again.");
                }
            } catch {
                toast.error("Could not connect to server. Is the backend running?");
            } finally {
                setLoading(false);
            }
            return;
        }

        // Login
        setLoading(true);
        const success = await login(email, password);
        setLoading(false);
        if (success) {
            router.replace(`/dashboard/${selectedRole}`);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* ── Left Branding Panel (desktop only) ── */}
            <div className="hidden lg:flex lg:w-[420px] xl:w-[480px] flex-col justify-between p-10 border-r border-[#e2e8f0] bg-[#f8fafc] shrink-0">
                <Link href="/" className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center">
                        <Leaf className="w-4 h-4 text-slate-900" />
                    </div>
                    <span className="font-bold text-[15px] text-slate-900 font-outfit">
                        AgriTrace<span className="text-green-400">India</span>
                    </span>
                </Link>

                <div>
                    <div className="mb-10">
                        <div className="text-5xl mb-5">🌿</div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-3 font-outfit">
                            Farm-to-Fork<br />Blockchain Traceability
                        </h2>
                        <p className="text-[14px] text-[#64748b] leading-relaxed">
                            Join Tamil Nadu's most trusted agricultural supply chain platform. Powered by Polygon blockchain for immutable transparency.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {[
                            { icon: "🔗", text: "Immutable blockchain records" },
                            { icon: "🎤", text: "Tamil voice input for farmers" },
                            { icon: "📱", text: "Offline-first PWA" },
                            { icon: "🔍", text: "Real-time supply chain trace" },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <span className="text-lg">{item.icon}</span>
                                <span className="text-[13px] text-[#475569]">{item.text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <p className="text-[11px] text-[#64748b]">
                    © 2026 AgriTraceIndia · TN-Hackathon 2026 · TNI26040
                </p>
            </div>

            {/* ── Right Form Panel ── */}
            <div className="flex-1 flex flex-col">
                {/* Mobile header */}
                <div className="lg:hidden flex items-center justify-between px-5 py-4 border-b border-[#e2e8f0]">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center">
                            <Leaf className="w-3.5 h-3.5 text-slate-900" />
                        </div>
                        <span className="font-bold text-[14px] text-slate-900 font-outfit">
                            AgriTrace<span className="text-green-400">India</span>
                        </span>
                    </Link>
                    <div className="flex items-center gap-1.5 text-[11px] text-[#64748b]">
                        <Shield className="w-3.5 h-3.5" />
                        Blockchain Secured
                    </div>
                </div>

                <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-10">
                    <div className="w-full max-w-[480px]">
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* Header */}
                            <div className="mb-8">
                                <h1 className="text-2xl font-bold text-slate-900 mb-1.5 font-outfit">
                                    {mode === "register" ? "Create Account" : "Welcome back"}
                                </h1>
                                <p className="text-[14px] text-[#64748b]">
                                    {mode === "register"
                                        ? "Register to join the blockchain network"
                                        : "உள்நுழைய உங்கள் விவரங்களை உள்ளிடவும்"}
                                </p>
                            </div>

                            {/* Mode toggle */}
                            <div className="flex bg-[#ffffff] border border-[#e2e8f0] p-1 rounded-xl mb-6">
                                <button
                                    type="button"
                                    onClick={() => { setMode("login"); setErrors({}); }}
                                    className={`flex-1 py-2 text-[13px] font-semibold rounded-lg transition-all ${
                                        mode === "login"
                                            ? "bg-[#e2e8f0] text-slate-900 shadow-sm"
                                            : "text-[#64748b] hover:text-[#475569]"
                                    }`}
                                >
                                    Sign In
                                </button>
                                {!isRestrictedRole && (
                                    <button
                                        type="button"
                                        onClick={() => { setMode("register"); setErrors({}); }}
                                        className={`flex-1 py-2 text-[13px] font-semibold rounded-lg transition-all ${
                                            mode === "register"
                                                ? "bg-[#e2e8f0] text-slate-900 shadow-sm"
                                                : "text-[#64748b] hover:text-[#475569]"
                                        }`}
                                    >
                                        Register
                                    </button>
                                )}
                            </div>

                            {/* Admin restriction notice */}
                            {isRestrictedRole && (
                                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/8 border border-amber-500/20 mb-5">
                                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                                    <p className="text-[12px] text-amber-300 leading-relaxed">
                                        IAgS / Admin accounts are provisioned by the Admin only. Contact your administrator to get access.
                                    </p>
                                </div>
                            )}

                            <form onSubmit={handleAuth} noValidate>
                                <div className="space-y-4">

                                    {/* ── Registration fields ── */}
                                    <AnimatePresence mode="popLayout">
                                        {mode === "register" && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{ duration: 0.25 }}
                                                className="space-y-4 overflow-hidden"
                                            >
                                                <FormField label="Full Name / முழு பெயர்" error={errors.name} required>
                                                    <div className="relative">
                                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b] pointer-events-none" />
                                                        <input
                                                            type="text"
                                                            value={name}
                                                            onChange={e => setName(e.target.value)}
                                                            placeholder="Enter your full name"
                                                            className={`agri-input pl-10 ${errors.name ? "border-red-500/50 focus:border-red-500" : ""}`}
                                                        />
                                                    </div>
                                                </FormField>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <FormField label="Village / ஊர்" error={errors.village}>
                                                        <div className="relative">
                                                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b] pointer-events-none" />
                                                            <input
                                                                type="text"
                                                                value={village}
                                                                onChange={e => setVillage(e.target.value)}
                                                                placeholder="Village / Area"
                                                                className="agri-input pl-10"
                                                            />
                                                        </div>
                                                    </FormField>

                                                    <FormField label="Mobile / தொலைபேசி" error={errors.mobile} required>
                                                        <input
                                                            type="tel"
                                                            value={mobile}
                                                            onChange={e => setMobile(e.target.value)}
                                                            placeholder="10-digit number"
                                                            className={`agri-input ${errors.mobile ? "border-red-500/50" : ""}`}
                                                        />
                                                    </FormField>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <FormField label="District / மாவட்டம்" error={errors.district} required>
                                                        <select
                                                            value={district}
                                                            onChange={e => { setDistrict(e.target.value); setTaluk(""); }}
                                                            className={`agri-select ${errors.district ? "border-red-500/50" : ""}`}
                                                        >
                                                            <option value="" disabled>Select District</option>
                                                            {Object.keys(tnDistrictsAndTaluks).sort().map(d => (
                                                                <option key={d} value={d}>{d}</option>
                                                            ))}
                                                        </select>
                                                    </FormField>

                                                    <FormField label="Taluk / வட்டம்" error={errors.taluk} required>
                                                        <select
                                                            value={taluk}
                                                            onChange={e => setTaluk(e.target.value)}
                                                            className={`agri-select ${errors.taluk ? "border-red-500/50" : ""}`}
                                                            disabled={!district}
                                                        >
                                                            <option value="" disabled>
                                                                {district ? "Select Taluk" : "Select District first"}
                                                            </option>
                                                            {availableTaluks.sort().map(t => (
                                                                <option key={t} value={t}>{t}</option>
                                                            ))}
                                                        </select>
                                                    </FormField>
                                                </div>

                                                {/* Farmer-specific fields */}
                                                <AnimatePresence>
                                                    {selectedRole === "farmer" && (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: -8 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, y: -8 }}
                                                            className="space-y-4 p-4 rounded-xl bg-green-500/4 border border-green-500/15"
                                                        >
                                                            <p className="text-[11px] text-green-400 font-semibold uppercase tracking-wider">
                                                                Farmer Credentials
                                                            </p>
                                                            <div className="grid grid-cols-2 gap-3">
                                                                <FormField label="Uzhavar Attai No." error={errors.uzhavarAttai} required>
                                                                    <div className="relative">
                                                                        <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b] pointer-events-none" />
                                                                        <input
                                                                            type="text"
                                                                            value={uzhavarAttai}
                                                                            onChange={e => setUzhavarAttai(e.target.value)}
                                                                            placeholder="TN-UZ-1234567"
                                                                            className={`agri-input pl-10 ${errors.uzhavarAttai ? "border-red-500/50" : ""}`}
                                                                        />
                                                                    </div>
                                                                </FormField>

                                                                <FormField label="Aadhaar Number" error={errors.aadhaar} required>
                                                                    <div className="relative">
                                                                        <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b] pointer-events-none" />
                                                                        <input
                                                                            type="text"
                                                                            value={aadhaar}
                                                                            onChange={e => setAadhaar(e.target.value)}
                                                                            placeholder="12-digit number"
                                                                            className={`agri-input pl-10 ${errors.aadhaar ? "border-red-500/50" : ""}`}
                                                                        />
                                                                    </div>
                                                                </FormField>
                                                            </div>

                                                            <FormField label="Land Details / நில விவரங்கள்">
                                                                <input
                                                                    type="text"
                                                                    value={landDetails}
                                                                    onChange={e => setLandDetails(e.target.value)}
                                                                    placeholder="Survey No, Area in Acres, etc."
                                                                    className="agri-input"
                                                                />
                                                            </FormField>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* ── Email & Password (always shown) ── */}
                                    <FormField label="Email Address / மின்னஞ்சல்" error={errors.email} required>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b] pointer-events-none" />
                                            <input
                                                id="email"
                                                type="email"
                                                autoComplete="email"
                                                value={email}
                                                onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: "" })); }}
                                                placeholder="your@email.com"
                                                className={`agri-input pl-10 ${errors.email ? "border-red-500/50 focus:border-red-500" : ""}`}
                                            />
                                        </div>
                                    </FormField>

                                    <FormField label="Password / கடவுச்சொல்" error={errors.password} required>
                                        <div className="relative">
                                            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b] pointer-events-none" />
                                            <input
                                                id="password"
                                                type={showPassword ? "text" : "password"}
                                                autoComplete={mode === "login" ? "current-password" : "new-password"}
                                                value={password}
                                                onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: "" })); }}
                                                placeholder="••••••••"
                                                className={`agri-input pl-10 pr-10 ${errors.password ? "border-red-500/50 focus:border-red-500" : ""}`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-[#475569] transition-colors"
                                                aria-label={showPassword ? "Hide password" : "Show password"}
                                            >
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </FormField>

                                    {/* ── Role selector ── */}
                                    <div className="space-y-2">
                                        <label className="form-label">Role / பணிப்பொறுப்பு</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {roles.map(r => (
                                                <button
                                                    key={r.role}
                                                    type="button"
                                                    onClick={() => handleRoleChange(r.role)}
                                                    className={`p-2.5 rounded-xl border text-left transition-all ${
                                                        selectedRole === r.role
                                                            ? "border-green-500/40 bg-green-500/8"
                                                            : "border-[#e2e8f0] bg-[#ffffff] hover:border-[#cbd5e1]"
                                                    }`}
                                                >
                                                    <div className="text-xl mb-1">{r.icon}</div>
                                                    <div className={`text-[10px] font-semibold ${selectedRole === r.role ? "text-green-400" : "text-[#475569]"}`}>
                                                        {r.label}
                                                    </div>
                                                    {r.role === "regulator" && (
                                                        <div className="text-[8px] text-amber-400/70 mt-0.5">Admin Only</div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* ── Submit ── */}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full btn btn-primary btn-lg mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? (
                                            <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
                                        ) : mode === "register" ? (
                                            <><UserPlus className="w-4 h-4" /> Create Account</>
                                        ) : (
                                            <>Sign In <ArrowRight className="w-4 h-4" /></>
                                        )}
                                    </button>
                                </div>
                            </form>

                            {/* Footer */}
                            <div className="mt-6 pt-6 border-t border-[#e2e8f0] flex items-center justify-between gap-4">
                                <div className="flex items-center gap-1.5 text-[11px] text-[#64748b]">
                                    <Shield className="w-3.5 h-3.5 text-blue-400" />
                                    Blockchain Identity Secured
                                </div>
                                <Link href="/contact" className="text-[12px] text-green-600 hover:text-green-700 transition-colors">
                                    Need help?
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}

