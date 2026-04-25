"use client";
import { useEffect } from "react";
import { useRole } from "@/lib/role-context";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import { User, Mail, MapPin, Phone, CreditCard, Shield, Leaf, Calendar } from "lucide-react";

interface ProfileField {
    label: string;
    value: string | undefined | null;
    tamil: string;
    highlight?: boolean;
}

interface FieldGroup {
    title: string;
    icon: React.ReactNode;
    fields: ProfileField[];
}

export default function ProfilePage() {
    const { user, refreshProfile, isAuthenticated } = useRole();

    useEffect(() => {
        if (isAuthenticated) {
            refreshProfile();
        }
    }, [isAuthenticated]);

    if (!user) {
        return (
            <div className="min-h-screen circuit-bg flex items-center justify-center p-4">
                <div className="glass-card p-8 text-center max-w-sm">
                    <Shield className="w-12 h-12 text-amber-500 mx-auto mb-4 opacity-50" />
                    <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
                    <p className="text-gray-400 text-sm mb-6">Please login to view your secure profile details.</p>
                    <a href="/login" className="btn-glow text-white px-6 py-2.5 rounded-xl block">Login to AgriTraceIndia</a>
                </div>
            </div>
        );
    }

    const detailGroups: FieldGroup[] = [
        {
            title: "Identity Details",
            icon: <User className="w-5 h-5" />,
            fields: [
                { label: "Full Name", value: user.name, tamil: "முழு பெயர்" },
                { label: "Email ID", value: user.email, tamil: "மின்னஞ்சல்" },
                { label: "Phone Number", value: user.mobileNo || "Not provided", tamil: "தொலைபேசி" },
                { label: "System Role", value: user.role, tamil: "பணிப்பொறுப்பு", highlight: true },
            ]
        },
        {
            title: "Jurisdiction & Location",
            icon: <MapPin className="w-5 h-5" />,
            fields: [
                { label: "District", value: user.district, tamil: "மாவட்டம்" },
                { label: "Taluk / Block", value: user.taluk, tamil: "வட்டம்" },
                { label: "Village / Area", value: user.village || user.location || "Not provided", tamil: "ஊர்" },
            ]
        }
    ];

    if (user.role === "farmer") {
        detailGroups.push({
            title: "Agricultural Credentials",
            icon: <Leaf className="w-5 h-5" />,
            fields: [
                { label: "Uzhavar Card (Attai)", value: user.uzhavarCardNumber, tamil: "உழவர் அட்டை எண்", highlight: true },
                { label: "Aadhaar (Last 4)", value: user.aadhaarNumber ? `xxxx-xxxx-${user.aadhaarNumber.slice(-4)}` : "Not provided", tamil: "ஆதார் எண்" },
                { label: "Land Details", value: user.landDetails, tamil: "நில விவரங்கள்" },
                { label: "Primary Crops", value: user.cropDetails || "General Agriculture", tamil: "பயிர்கள்" },
            ]
        });
    }

    return (
        <div className="min-h-screen relative">
            <Header />

            <div className="max-w-4xl mx-auto px-4 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10 text-center md:text-left md:flex items-center gap-8 bg-green-950/20 p-8 rounded-3xl border border-green-500/10"
                >
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center text-4xl shadow-2xl shadow-green-500/20 mx-auto md:mx-0 mb-4 md:mb-0">
                        {user.name.charAt(0)}
                    </div>
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-xs font-bold uppercase tracking-widest mb-2">
                            <Shield className="w-3 h-3" /> Blockchain Identity Verified
                        </div>
                        <h1 className="text-4xl font-black text-white mb-2 font-outfit uppercase">{user.name}</h1>
                        <p className="text-gray-400 flex items-center justify-center md:justify-start gap-2">
                            <Mail className="w-4 h-4 text-green-400" /> {user.email}
                        </p>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {detailGroups.map((group, idx) => (
                        <motion.div
                            key={group.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="glass-card p-6"
                        >
                            <div className="flex items-center gap-3 mb-6 pb-2 border-b border-white/5">
                                <div className="text-green-400 opacity-60">{group.icon}</div>
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">{group.title}</h3>
                            </div>

                            <div className="space-y-6">
                                {group.fields.map(field => (
                                    <div key={field.label} className="group">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <span className="text-[10px] uppercase font-black tracking-tighter text-gray-500 group-hover:text-green-500/50 transition-colors">
                                                {field.label}
                                            </span>
                                            <span className="text-[10px] text-gray-600 font-medium tamil-text">
                                                {field.tamil}
                                            </span>
                                        </div>
                                        <div className={`text-lg transition-all ${field.highlight ? 'font-bold text-green-400' : 'text-gray-200'}`}>
                                            {field.value || "---"}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-12 p-6 glass-card border-blue-500/10 bg-blue-500/5">
                    <div className="flex items-center gap-3 mb-4">
                        <CreditCard className="w-5 h-5 text-blue-400" />
                        <h3 className="text-sm font-bold text-blue-400/80 uppercase tracking-widest">Web3 & Wallet</h3>
                    </div>
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="text-gray-400 text-sm max-w-lg text-center md:text-left">
                            Your identity is cryptographically linked to your Tamil Nadu Federated ID. All actions are signed with your secure key.
                        </div>
                        <div className="font-mono text-xs bg-black/40 px-4 py-2 rounded-xl border border-white/5 text-gray-300">
                            {user.walletAddress || "0x742...f291 (Linked via Federated ID)"}
                        </div>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-gray-600 text-[10px] uppercase tracking-widest">
                        AgriTraceIndia Federated Identity Protocol v2.4 · Secured by Polygon Blockchain
                    </p>
                </div>
            </div>
        </div>
    );
}
