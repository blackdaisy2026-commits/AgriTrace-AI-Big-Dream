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
            <div className="min-h-screen min-h-screen flex items-center justify-center p-4">
                <div className="glass-card p-8 text-center max-w-sm">
                    <Shield className="w-12 h-12 text-amber-500 mx-auto mb-4 opacity-50" />
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Access Denied</h2>
                    <p className="text-slate-500 text-sm mb-6">Please login to view your secure profile details.</p>
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
                { label: "Full Name", value: user.name, tamil: "???? ?????" },
                { label: "Email ID", value: user.email, tamil: "??????????" },
                { label: "Phone Number", value: user.mobileNo || "Not provided", tamil: "????????" },
                { label: "System Role", value: user.role, tamil: "?????????????", highlight: true },
            ]
        },
        {
            title: "Jurisdiction & Location",
            icon: <MapPin className="w-5 h-5" />,
            fields: [
                { label: "District", value: user.district, tamil: "????????" },
                { label: "Taluk / Block", value: user.taluk, tamil: "??????" },
                { label: "Village / Area", value: user.village || user.location || "Not provided", tamil: "???" },
            ]
        }
    ];

    if (user.role === "farmer") {
        detailGroups.push({
            title: "Agricultural Credentials",
            icon: <Leaf className="w-5 h-5" />,
            fields: [
                { label: "Uzhavar Card (Attai)", value: user.uzhavarCardNumber, tamil: "????? ????? ???", highlight: true },
                { label: "Aadhaar (Last 4)", value: user.aadhaarNumber ? `xxxx-xxxx-${user.aadhaarNumber.slice(-4)}` : "Not provided", tamil: "????? ???" },
                { label: "Land Details", value: user.landDetails, tamil: "??? ?????????" },
                { label: "Primary Crops", value: user.cropDetails || "General Agriculture", tamil: "????????" },
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
                    className="mb-8 flex flex-col items-center md:flex-row gap-6 card p-6"
                >
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center text-3xl font-bold text-slate-900 shrink-0">
                        {user.name.charAt(0)}
                    </div>
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-xs font-bold uppercase tracking-widest mb-2">
                            <Shield className="w-3 h-3" /> Blockchain Identity Verified
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 mb-1 font-outfit">{user.name}</h1>
                        <p className="text-[13px] text-[#64748b] flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5 text-green-400" /> {user.email}
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
                            className="card p-5"
                        >
                            <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-[#e2e8f0]">
                                <div className="text-green-400">{group.icon}</div>
                                <h3 className="text-[11px] font-semibold text-[#64748b] uppercase tracking-widest">{group.title}</h3>
                            </div>

                            <div className="space-y-6">
                                {group.fields.map(field => (
                                    <div key={field.label} className="group">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <span className="text-[10px] uppercase font-black tracking-tighter text-slate-500 group-hover:text-green-500/50 transition-colors">
                                                {field.label}
                                            </span>
                                            <span className="text-[10px] text-slate-600 font-medium tamil-text">
                                                {field.tamil}
                                            </span>
                                        </div>
                                        <div className={`text-[14px] font-medium transition-all ${field.highlight ? 'font-semibold text-green-400' : 'text-slate-900'}`}>
                                            {field.value || "---"}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-8 p-5 card border-blue-500/15 bg-blue-500/4">
                    <div className="flex items-center gap-3 mb-4">
                        <CreditCard className="w-5 h-5 text-blue-400" />
                        <h3 className="text-sm font-bold text-blue-400/80 uppercase tracking-widest">Web3 & Wallet</h3>
                    </div>
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="text-slate-500 text-sm max-w-lg text-center md:text-left">
                            Your identity is cryptographically linked to your Tamil Nadu Federated ID. All actions are signed with your secure key.
                        </div>
                        <div className="font-mono text-[12px] bg-[#f8fafc] px-4 py-2 rounded-lg border border-[#e2e8f0] text-[#475569]">
                            {user.walletAddress || "0x742...f291 (Linked via Federated ID)"}
                        </div>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-slate-600 text-[10px] uppercase tracking-widest">
                        AgriTraceIndia Federated Identity Protocol v2.4 � Secured by Polygon Blockchain
                    </p>
                </div>
            </div>
        </div>
    );
}

