"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useRole } from "@/lib/role-context";
import toast from "react-hot-toast";
import { Leaf, User, Shield, ArrowRight, UserPlus, Fingerprint, MapPin } from "lucide-react";
import Link from "next/link";
import { tnDistrictsAndTaluks } from "@/lib/tn-districts";

const roles = [
    { role: "farmer" as const, label: "Farmer", tamil: "விவசாயி", icon: "🌾", desc: "Record harvests, get QR codes, voice input" },
    { role: "processor" as const, label: "Agri Officer", tamil: "வேளாண்மை அதிகாரி", icon: "🔬", desc: "Add quality tests, processing events" },
    { role: "retailer" as const, label: "Retailer", tamil: "சில்லறை வணிகர்", icon: "🏪", desc: "Scan QR, view batch details, inventory" },
    { role: "consumer" as const, label: "Consumer", tamil: "நுகர்வோர்", icon: "👤", desc: "Scan product QR, view full journey" },
    { role: "tahsildar" as const, label: "Tahsildar", tamil: "தாசில்தார்", icon: "📋", desc: "Verify Agri Officer reports, approve relief funds" },
    { role: "regulator" as const, label: "IAgS / Admin", tamil: "IAgS / நிர்வாகி", icon: "🏛️", desc: "Monitor all batches, final fund sanction" },
];

export default function LoginContent() {
    const searchParams = useSearchParams();
    const { login, apiBaseUrl } = useRole();
    const router = useRouter();

    // Simplified Step
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [selectedRole, setSelectedRole] = useState<string>(searchParams.get("role") || "farmer");
    const [loading, setLoading] = useState(false);

    // Registration State
    const [isRegistering, setIsRegistering] = useState(false);
    const [name, setName] = useState("");
    const [uzhavarAttai, setUzhavarAttai] = useState("");
    const [aadhaar, setAadhaar] = useState("");
    const [village, setVillage] = useState("");
    const [mobile, setMobile] = useState("");
    const [landDetails, setLandDetails] = useState("");

    // Location Data
    const [district, setDistrict] = useState("");
    const [taluk, setTaluk] = useState("");

    // Admins cannot self-register; force login mode. Tahsildars CAN register to see their Taluk reports.
    const isRestrictedRole = selectedRole === "regulator";
    const handleRoleChange = (role: string) => {
        setSelectedRole(role);
        if (role === "regulator") setIsRegistering(false);
    };
    const availableTaluks = district ? tnDistrictsAndTaluks[district] || [] : [];

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isRegistering) {
            if (!name.trim() || !email.trim() || !password.trim()) {
                toast.error("Please fill all required fields");
                return;
            }
            if (!district || !taluk) {
                toast.error("Please select your District and Taluk");
                return;
            }
            if (selectedRole === "farmer" && !uzhavarAttai.trim()) {
                toast.error("Uzhavar Attai Number is required for Farmers");
                return;
            }

            setLoading(true);
            try {
                const res = await fetch(`${apiBaseUrl}/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
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
                    })
                });
                const data = await res.json();
                if (res.ok && data.status === 'success') {
                    toast.success(`✅ Registered successfully! Welcome, ${name.split(' ')[0]}. Please login.`);
                    setIsRegistering(false);
                    // Keep email pre-filled so user can login right away
                    setName("");
                    setUzhavarAttai("");
                    setDistrict("");
                    setTaluk("");
                } else {
                    toast.error(data.message || "Registration failed. Please try again.");
                }
            } catch {
                toast.error("❌ Could not connect to server. Is the backend running?");
            } finally {
                setLoading(false);
            }
            return;
        }

        // ── LOGIN FLOW ──
        if (!email.trim() || !password.trim()) {
            toast.error("Please enter email and password");
            return;
        }

        setLoading(true);
        const success = await login(email, password);
        setLoading(false);

        if (success) {
            // Role comes from the server; use selectedRole as fallback
            router.replace(`/dashboard/${selectedRole}`);
        }
    };

    return (
        <div className="min-h-screen circuit-bg flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-green-900/10">
                <Link href="/" className="flex items-center gap-2">
                    <Leaf className="w-6 h-6 text-green-400" />
                    <span className="font-bold text-white">AgriTraceIndia</span>
                </Link>
                <div className="flex items-center gap-6">
                    <div className="hidden md:flex items-center gap-2 text-xs text-gray-500">
                        <Shield className="w-3.5 h-3.5" /> Blockchain Identity Secured
                    </div>
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center px-4 py-8 bg-gradient-to-b from-transparent to-green-900/5">
                <div className="w-full max-w-3xl">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card p-6 md:p-10"
                    >
                        <div className="text-center mb-8">
                            <div className="inline-flex p-4 rounded-3xl bg-green-900/20 mb-4 border border-green-500/20">
                                {isRegistering ? (
                                    <UserPlus className="w-10 h-10 text-green-400" />
                                ) : (
                                    <Fingerprint className="w-10 h-10 text-green-400" />
                                )}
                            </div>
                            <h1 className="text-3xl font-black text-white mb-2" style={{ fontFamily: "Outfit, sans-serif" }}>
                                {isRegistering ? "Create Account" : "Secure Access"}
                            </h1>
                            <p className="text-gray-400">
                                {isRegistering ? "Register your details to join the blockchain network" : "உள்நுழைய உங்கள் மின்னஞ்சல் மற்றும் கடவுச்சொல்லை உள்ளிடவும்"}
                            </p>

                            <div className="flex flex-col items-center gap-3 mt-6">
                                <div className="flex bg-black/40 border border-white/5 p-1 rounded-2xl max-w-sm w-full">
                                    <button
                                        type="button"
                                        onClick={() => setIsRegistering(false)}
                                        className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${!isRegistering ? "bg-green-500 text-black shadow-lg shadow-green-500/20" : "text-gray-400 hover:text-white"}`}
                                    >
                                        Login
                                    </button>
                                    {!isRestrictedRole && (
                                        <button
                                            type="button"
                                            onClick={() => setIsRegistering(true)}
                                            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${isRegistering ? "bg-green-500 text-black shadow-lg shadow-green-500/20" : "text-gray-400 hover:text-white"}`}
                                        >
                                            Register
                                        </button>
                                    )}
                                </div>
                                {isRestrictedRole && (
                                    <p className="text-xs text-amber-400/80 flex items-center gap-1.5 bg-amber-400/5 border border-amber-400/20 px-4 py-2 rounded-xl">
                                        <span>🏛️</span>
                                        IAgS / Admin accounts are provisioned by the Admin only. Contact your administrator.
                                    </p>
                                )}
                            </div>
                        </div>

                        <form onSubmit={handleAuth} className="space-y-6">

                            {/* REGISTRATION SPECIFIC FIELDS */}
                            <AnimatePresence mode="popLayout">
                                {isRegistering && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="space-y-6 overflow-hidden"
                                    >
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-400 ml-1">Full Name / முழு பெயர்</label>
                                            <div className="relative group">
                                                <div className="absolute inset-0 bg-green-500/5 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-green-300 pointer-events-none z-20" />
                                                <input
                                                    type="text"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    placeholder="Enter your full name"
                                                    className="agri-input !pl-24 py-4 text-lg relative z-10"
                                                    required={isRegistering}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-400 ml-1">Village / ஊர் <span className="text-red-400">*</span></label>
                                                <div className="relative group">
                                                    <div className="absolute inset-0 bg-green-500/5 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
                                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-green-300 pointer-events-none z-20" />
                                                    <input
                                                        type="text"
                                                        value={village}
                                                        onChange={(e) => setVillage(e.target.value)}
                                                        placeholder="Enter your village or area"
                                                        className="agri-input !pl-24 py-4 text-lg relative z-10"
                                                        required={isRegistering}
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-400 ml-1">Contact Number / தொலைபேசி எண் <span className="text-red-400">*</span></label>
                                                <div className="relative group">
                                                    <div className="absolute inset-0 bg-green-500/5 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
                                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-green-300 pointer-events-none z-20" />
                                                    <input
                                                        type="tel"
                                                        value={mobile}
                                                        onChange={(e) => setMobile(e.target.value)}
                                                        placeholder="Enter 10-digit mobile number"
                                                        className="agri-input !pl-24 py-4 text-lg relative z-10"
                                                        required={isRegistering}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-400 ml-1">District / மாவட்டம் <span className="text-red-400">*</span></label>
                                                <div className="relative group">
                                                    <div className="absolute inset-0 bg-green-500/5 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
                                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-green-300 pointer-events-none z-20" />
                                                    <select
                                                        value={district}
                                                        onChange={(e) => {
                                                            setDistrict(e.target.value);
                                                            setTaluk(""); // Reset taluk when district changes
                                                        }}
                                                        className="agri-input !pl-24 py-4 text-lg relative z-10 appearance-none bg-transparent"
                                                        required={isRegistering}
                                                    >
                                                        <option value="" disabled className="bg-gray-900 text-gray-500">Select District</option>
                                                        {Object.keys(tnDistrictsAndTaluks).sort().map(d => (
                                                            <option key={d} value={d} className="bg-gray-900 text-white">{d}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-400 ml-1">Taluk / வட்டம் <span className="text-red-400">*</span></label>
                                                <div className="relative group">
                                                    <div className="absolute inset-0 bg-green-500/5 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
                                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-green-300 pointer-events-none z-20" />
                                                    <select
                                                        value={taluk}
                                                        onChange={(e) => setTaluk(e.target.value)}
                                                        className="agri-input !pl-24 py-4 text-lg relative z-10 appearance-none bg-transparent"
                                                        required={isRegistering}
                                                        disabled={!district}
                                                    >
                                                        <option value="" disabled className="bg-gray-900 text-gray-500">Select Taluk</option>
                                                        {availableTaluks.sort().map(t => (
                                                            <option key={t} value={t} className="bg-gray-900 text-white">{t}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        {selectedRole === "farmer" && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="space-y-6"
                                            >
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <label className="block text-sm font-bold text-green-400 ml-1">Uzhavar Attai Number / உழவர் அட்டை எண் <span className="text-red-400">*</span></label>
                                                        <div className="relative group">
                                                            <div className="absolute inset-0 bg-green-500/5 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
                                                            <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-green-300 pointer-events-none z-20" />
                                                            <input
                                                                type="text"
                                                                value={uzhavarAttai}
                                                                onChange={(e) => setUzhavarAttai(e.target.value)}
                                                                placeholder="e.g. TN-UZ-1234567"
                                                                className="agri-input border-green-500/40 focus:border-green-400 !pl-24 py-4 text-lg relative z-10 text-green-100"
                                                                required={isRegistering && selectedRole === "farmer"}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <label className="block text-sm font-bold text-green-400 ml-1">Aadhaar Number / ஆதார் எண் <span className="text-red-400">*</span></label>
                                                        <div className="relative group">
                                                            <div className="absolute inset-0 bg-green-500/5 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
                                                            <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-green-300 pointer-events-none z-20" />
                                                            <input
                                                                type="text"
                                                                value={aadhaar}
                                                                onChange={(e) => setAadhaar(e.target.value)}
                                                                placeholder="12-digit Aadhaar number"
                                                                className="agri-input border-green-500/40 focus:border-green-400 !pl-24 py-4 text-lg relative z-10 text-green-100"
                                                                required={isRegistering && selectedRole === "farmer"}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="block text-sm font-bold text-green-400 ml-1">Land Details / நில விவரங்கள் <span className="text-red-400">*</span></label>
                                                    <div className="relative group">
                                                        <div className="absolute inset-0 bg-green-500/5 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
                                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-green-300 pointer-events-none z-20" />
                                                        <input
                                                            type="text"
                                                            value={landDetails}
                                                            onChange={(e) => setLandDetails(e.target.value)}
                                                            placeholder="Survey No, Area in Acres, etc."
                                                            className="agri-input border-green-500/40 focus:border-green-400 !pl-24 py-4 text-lg relative z-10 text-green-100"
                                                            required={isRegistering && selectedRole === "farmer"}
                                                        />
                                                    </div>
                                                </div>


                                            </motion.div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-400 ml-1">Email Address / மின்னஞ்சல்</label>
                                    <div className="relative group">
                                        <div className="absolute inset-0 bg-green-500/5 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-green-300 pointer-events-none z-20" />
                                        <input
                                            id="email"
                                            type="email"
                                            autoComplete="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Enter your email address"
                                            className="agri-input !pl-24 py-4 text-lg relative z-10"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-400 ml-1">Password / கடவுச்சொல்</label>
                                    <div className="relative group">
                                        <div className="absolute inset-0 bg-green-500/5 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
                                        <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-green-300 pointer-events-none z-20" />
                                        <input
                                            id="password"
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="agri-input !pl-24 py-4 text-lg relative z-10"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-gray-400 ml-1">Institutional Role / பணிப்பொறுப்பு</label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                                    {roles.map((r) => (
                                        <button
                                            key={r.role}
                                            type="button"
                                            onClick={() => handleRoleChange(r.role)}
                                            className={`p-3 rounded-xl border text-left transition-all ${selectedRole === r.role
                                                ? "border-green-500/60 bg-green-500/10 shadow-lg shadow-green-500/5"
                                                : "border-white/5 bg-white/5 hover:border-white/10"
                                                }`}
                                        >
                                            <div className="text-2xl mb-1">{r.icon}</div>
                                            <div className={`font-bold text-white text-[10px] tracking-tight ${r.role !== 'regulator' ? 'uppercase' : ''}`}>{r.label}</div>
                                            <div className="text-[8px] text-gray-500 leading-tight mt-1 line-clamp-1">{r.tamil}</div>
                                            {r.role === "regulator" && (
                                                <div className="text-[7px] text-amber-400/70 mt-1">Admin Only</div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !email.trim() || !password.trim()}
                                className="w-full btn-glow text-white font-bold py-5 rounded-2xl text-xl flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed group transition-all"
                            >
                                {loading ? (
                                    "Processing..."
                                ) : isRegistering ? (
                                    <>
                                        Register Now <UserPlus className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                                    </>
                                ) : (
                                    <>
                                        Secure Login <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 text-xs">
                            <div className="flex items-center gap-2 text-gray-500">
                                <Shield className="w-4 h-4 text-blue-400" />
                                Secured by Tamil Nadu Federated ID Protocol
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-gray-600">Need help?</span>
                                <Link href="/contact" className="text-green-400 font-semibold hover:underline">Contact Support</Link>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            <footer className="py-8 text-center text-gray-600 text-[10px] uppercase tracking-widest">
                AgriTraceIndia Federated Identity Protocol · TN-Blockchain Network
            </footer>
        </div>
    );
}

