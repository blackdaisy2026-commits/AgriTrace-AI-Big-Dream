"use client";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useRole } from "@/lib/role-context";
import { useRouter } from "next/navigation";
import {
    Shield, Mic, QrCode, Wifi, Users, Brain, Leaf, X, LogOut,
    ArrowRight, CheckCircle, ChevronRight, Star, Zap, Lock,
    TrendingUp, Globe, Sprout
} from "lucide-react";
import { useState, useRef, useCallback, useEffect } from "react";
import { toast } from "sonner";

// ─── Data ──────────────────────────────────────────────────────────────────────

const features = [
    {
        icon: Mic,
        title: "Tamil Voice Input",
        tamil: "குரல் உள்ளீடு",
        desc: "Speak in Tamil to record harvest details hands-free — no typing required.",
        color: "text-green-400",
        bg: "bg-green-400/8",
        border: "border-green-400/15",
    },
    {
        icon: QrCode,
        title: "QR Scan & Trace",
        tamil: "QR ஸ்கேன்",
        desc: "Scan any product QR code to view the complete supply chain journey.",
        color: "text-blue-400",
        bg: "bg-blue-400/8",
        border: "border-blue-400/15",
    },
    {
        icon: Shield,
        title: "Blockchain Verified",
        tamil: "பிளாக்செயின்",
        desc: "Every event is recorded immutably on Polygon blockchain — tamper-proof.",
        color: "text-purple-400",
        bg: "bg-purple-400/8",
        border: "border-purple-400/15",
    },
    {
        icon: Wifi,
        title: "Offline-First PWA",
        tamil: "ஆஃப்லைன்",
        desc: "Works without internet — events sync automatically when reconnected.",
        color: "text-amber-400",
        bg: "bg-amber-400/8",
        border: "border-amber-400/15",
    },
    {
        icon: Users,
        title: "5-Role Dashboards",
        tamil: "5 பாத்திரங்கள்",
        desc: "Farmer, Agri Officer, Retailer, Consumer, and IAgS role-based panels.",
        color: "text-pink-400",
        bg: "bg-pink-400/8",
        border: "border-pink-400/15",
    },
    {
        icon: Brain,
        title: "AI Fraud Detection",
        tamil: "AI முறைகேடு",
        desc: "Real-time integrity scoring detects anomalies across the supply chain.",
        color: "text-teal-400",
        bg: "bg-teal-400/8",
        border: "border-teal-400/15",
    },
];

const chain = [
    { icon: "🌾", label: "Farm",      sub: "Harvest & GPS",     color: "#22c55e" },
    { icon: "🔬", label: "Quality",   sub: "Lab Tests",          color: "#3b82f6" },
    { icon: "🏭", label: "Process",   sub: "Cold Chain",         color: "#a855f7" },
    { icon: "🚛", label: "Transport", sub: "Real-time Track",    color: "#f59e0b" },
    { icon: "🏪", label: "Retail",    sub: "QR Display",         color: "#ec4899" },
    { icon: "🍽️", label: "Consumer",  sub: "Scan & Trust",       color: "#06b6d4" },
];

const stats = [
    { value: "1,247+", label: "Farmers Onboarded", icon: "👨‍🌾", color: "text-green-400" },
    { value: "< 2s",   label: "Trace Time",         icon: "⚡",  color: "text-blue-400" },
    { value: "100%",   label: "Tamper Proof",        icon: "🔒",  color: "text-purple-400" },
    { value: "38",     label: "TN Districts",        icon: "🗺️",  color: "text-amber-400" },
];

const roles = [
    { role: "farmer",    label: "Farmer",       tamil: "விவசாயி",             icon: "🌾", color: "#22c55e" },
    { role: "processor", label: "Agri Officer", tamil: "வேளாண்மை அதிகாரி",   icon: "🔬", color: "#3b82f6" },
    { role: "retailer",  label: "Retailer",     tamil: "சில்லறை வணிகர்",     icon: "🏪", color: "#a855f7" },
    { role: "consumer",  label: "Consumer",     tamil: "நுகர்வோர்",           icon: "👤", color: "#f59e0b" },
    { role: "regulator", label: "IAgS / Admin", tamil: "IAgS / நிர்வாகி",    icon: "🏛️", color: "#ec4899" },
];

const faqs = [
    {
        q: "Is this app accessible offline?",
        a: "Yes! AgriTraceIndia is an offline-first PWA. Farmers can log data without internet; it syncs automatically to the blockchain once a connection is restored."
    },
    {
        q: "How do I know the data isn't faked?",
        a: "Every entry is cryptographically signed and stored on the Polygon blockchain. Any anomaly is flagged by our AI Integrity score in real-time."
    },
    {
        q: "Is there a Tamil version?",
        a: "The entire interface supports Tamil, and we offer hands-free voice input specifically optimized for Tamil dialects (ta-IN)."
    },
];

// ─── Animation variants ────────────────────────────────────────────────────────
const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

const stagger = {
    visible: { transition: { staggerChildren: 0.08 } },
};

// ─── Components ───────────────────────────────────────────────────────────────

function FAQItem({ q, a }: { q: string; a: string }) {
    const [open, setOpen] = useState(false);
    return (
        <motion.div
            className="card border border-[#e2e8f0] overflow-hidden"
            layout
        >
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                aria-expanded={open}
            >
                <span className="text-[14px] font-medium text-slate-900">{q}</span>
                <ChevronRight
                    className={`w-4 h-4 text-[#64748b] shrink-0 transition-transform duration-200 ${open ? "rotate-90" : ""}`}
                />
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                        <p className="px-5 pb-4 text-[13px] text-[#475569] leading-relaxed border-t border-[#e2e8f0] pt-3">
                            {a}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function LandingPage() {
    const { isAuthenticated, user } = useRole();
    const router = useRouter();
    const [isScanning, setIsScanning] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const animRef = useRef<number>(0);

    // ── QR Scanner logic (unchanged) ──
    const stopCamera = useCallback(() => {
        cancelAnimationFrame(animRef.current);
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
    }, []);

    const startScanLoop = useCallback(async (video: HTMLVideoElement) => {
        let lastScanTime = 0;
        const SCAN_INTERVAL = 300;

        const loop = async (time: number) => {
            if (!video || video.readyState < 2 || !canvasRef.current || !isScanning) return;
            if (time - lastScanTime > SCAN_INTERVAL) {
                lastScanTime = time;
                try {
                    const canvas = canvasRef.current;
                    const ctx = canvas.getContext("2d");
                    if (ctx) {
                        canvas.width = video.videoWidth;
                        canvas.height = video.videoHeight;
                        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                        const { default: jsQR } = await import("jsqr");
                        const code = jsQR(imageData.data, imageData.width, imageData.height);
                        if (code?.data) {
                            const batchId = code.data.split("/").pop() || code.data;
                            stopCamera();
                            setIsScanning(false);
                            toast.success("QR Scanned!");
                            router.push(`/trace/${batchId}`);
                            return;
                        }
                    }
                } catch (e) {
                    console.error("QR Loop Scan Error", e);
                }
            }
            animRef.current = requestAnimationFrame(loop);
        };
        animRef.current = requestAnimationFrame(loop);
    }, [isScanning, router, stopCamera]);

    useEffect(() => {
        if (isScanning) {
            const startCamera = async () => {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({
                        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
                        audio: false,
                    });
                    streamRef.current = stream;
                    if (videoRef.current) {
                        const video = videoRef.current;
                        video.srcObject = stream;
                        video.onloadedmetadata = () => {
                            video.play().then(() => startScanLoop(video));
                        };
                    }
                } catch {
                    toast.error("Camera access denied or unavailable.");
                    setIsScanning(false);
                }
            };
            startCamera();
        } else {
            stopCamera();
        }
        return () => stopCamera();
    }, [isScanning, startScanLoop, stopCamera]);

    return (
        <div className="min-h-screen">
            <Header />

            {/* ─── Hero ─── */}
            <section className="relative pt-24 pb-20 px-4 overflow-hidden" aria-label="Hero">
                {/* Ambient glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none" aria-hidden="true">
                    <div className="absolute inset-0 bg-radial-green opacity-60" />
                </div>

                <motion.div
                    variants={stagger}
                    initial="hidden"
                    animate="visible"
                    className="relative z-10 max-w-[800px] mx-auto text-center"
                >
                    {/* Eyebrow badge */}
                    <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-green-500/20 bg-green-500/6 mb-6">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-[12px] text-green-400 font-semibold tracking-wide">
                            Tamil Nadu's Blockchain Agriculture Platform
                        </span>
                    </motion.div>

                    {/* Headline */}
                    <motion.h1
                        variants={fadeUp}
                        className="text-5xl md:text-7xl font-black tracking-tight mb-5 font-outfit"
                    >
                        <span className="gradient-text">AgriTrace</span>
                        <span className="text-slate-900">India</span>
                    </motion.h1>

                    {/* Sub-headline */}
                    <motion.p
                        variants={fadeUp}
                        className="text-[17px] md:text-xl text-[#475569] mb-3 max-w-[560px] mx-auto leading-relaxed"
                    >
                        Blockchain-powered{" "}
                        <span className="text-green-400 font-semibold">Farm-to-Fork</span>{" "}
                        supply chain traceability for Tamil Nadu agriculture.
                    </motion.p>

                    {/* Tamil text */}
                    <motion.p
                        variants={fadeUp}
                        className="text-[13px] text-[#64748b] mb-10 tamil-text"
                    >
                        உணவு பாதுகாப்பு · விவசாய வெளிப்படைத்தன்மை · பிளாக்செயின் நம்பகத்தன்மை
                    </motion.p>

                    {/* CTA buttons */}
                    <motion.div
                        variants={fadeUp}
                        className="flex flex-wrap justify-center gap-3 mb-12"
                    >
                        <Link href={isAuthenticated ? `/dashboard/${user?.role ?? "farmer"}` : "/login"}>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="btn btn-primary btn-lg gap-2"
                            >
                                {isAuthenticated ? "Back to Dashboard" : "Access Platform"}
                                <ArrowRight className="w-4 h-4" />
                            </motion.button>
                        </Link>
                        <Link href="/trace/TN-DEMO001">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="btn btn-secondary btn-lg"
                            >
                                View Demo Trace
                            </motion.button>
                        </Link>
                    </motion.div>

                    {/* Trust line */}
                    <motion.p
                        variants={fadeUp}
                        className="text-[12px] text-[#64748b] flex items-center justify-center gap-2"
                    >
                        <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                        Verifying thousands of tons of produce across Tamil Nadu daily
                    </motion.p>
                </motion.div>
            </section>

            {/* ─── Supply Chain Flow ─── */}
            <section className="py-16 px-4" aria-label="Supply chain flow">
                <div className="max-w-[1280px] mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <p className="text-[12px] text-green-400 font-semibold uppercase tracking-widest mb-3">
                            Supply Chain
                        </p>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
                            Farm to Fork Journey
                        </h2>
                    </motion.div>

                    <div className="flex flex-wrap justify-center items-center gap-2 md:gap-0">
                        {chain.map((step, i) => (
                            <motion.div
                                key={step.label}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="flex items-center"
                            >
                                <motion.div
                                    whileHover={{ y: -3 }}
                                    className="text-center px-5 py-4 rounded-xl border cursor-default transition-all"
                                    style={{
                                        borderColor: `${step.color}20`,
                                        background: `${step.color}06`,
                                        minWidth: "96px",
                                    }}
                                >
                                    <div className="text-3xl mb-2">{step.icon}</div>
                                    <div className="text-[13px] font-semibold text-slate-900">{step.label}</div>
                                    <div className="text-[11px] mt-0.5 font-medium" style={{ color: step.color }}>
                                        {step.sub}
                                    </div>
                                </motion.div>
                                {i < chain.length - 1 && (
                                    <div className="hidden md:flex items-center mx-2">
                                        <div className="w-8 h-px bg-[#e2e8f0]" />
                                        <ChevronRight className="w-3 h-3 text-[#64748b] -ml-1" />
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── How It Works ─── */}
            <section className="py-20 px-4 border-y border-[#e2e8f0] bg-[#f8fafc]" aria-label="How it works">
                <div className="max-w-[1280px] mx-auto">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -24 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <p className="text-[12px] text-green-400 font-semibold uppercase tracking-widest mb-3">
                                How It Works
                            </p>
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                                How AgriTraceIndia Works
                            </h2>
                            <p className="text-[#475569] mb-10 leading-relaxed">
                                Utilizing state-of-the-art blockchain technology combined with intuitive Tamil voice interfaces, we ensure that every vegetable and grain is tracked from the moment it leaves the soil until it reaches your plate.
                            </p>

                            <div className="space-y-6">
                                {[
                                    {
                                        title: "Voice Logging",
                                        desc: "Farmers use Tamil speech-to-text to log harvest data instantly without typing.",
                                        icon: Mic,
                                    },
                                    {
                                        title: "Smart Contracts",
                                        desc: "Data is hashed and recorded on Polygon, making it impossible to tamper with.",
                                        icon: Lock,
                                    },
                                    {
                                        title: "Dynamic QR",
                                        desc: "Each batch gets a unique QR code that links to the live blockchain record.",
                                        icon: QrCode,
                                    },
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0">
                                            <item.icon className="w-4.5 h-4.5 text-green-400" />
                                        </div>
                                        <div>
                                            <h4 className="text-slate-900 font-semibold text-[14px] mb-1">{item.title}</h4>
                                            <p className="text-[#64748b] text-[13px] leading-relaxed">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                        >
                            <div className="relative rounded-2xl overflow-hidden border border-[#e2e8f0] bg-[#ffffff] aspect-square flex items-center justify-center">
                                <div className="text-center">
                                    <div className="text-8xl mb-6">🌿</div>
                                    <p className="text-[#64748b] text-[13px]">Farm-to-Fork Traceability</p>
                                </div>
                                {/* Subtle corner gradients */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-2xl" />
                                <div className="absolute bottom-0 left-0 w-40 h-40 bg-green-500/5 blur-3xl" />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ─── Features Grid ─── */}
            <section className="py-20 px-4" aria-label="Platform features">
                <div className="max-w-[1280px] mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <p className="text-[12px] text-green-400 font-semibold uppercase tracking-widest mb-3">
                            Features
                        </p>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
                            Everything You Need
                        </h2>
                        <p className="text-[#64748b] text-[15px]">
                            Cutting-edge innovations built for Tamil Nadu agriculture
                        </p>
                    </motion.div>

                    <motion.div
                        variants={stagger}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
                    >
                        {features.map((f) => (
                            <motion.div
                                key={f.title}
                                variants={fadeUp}
                                whileHover={{ y: -3 }}
                                className={`p-6 rounded-2xl border cursor-default transition-all ${f.bg} ${f.border}`}
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${f.bg} border ${f.border}`}>
                                    <f.icon className={`w-5 h-5 ${f.color}`} />
                                </div>
                                <h3 className="font-semibold text-slate-900 text-[15px] mb-1">{f.title}</h3>
                                <p className={`text-[11px] font-medium mb-2 tamil-text ${f.color} opacity-80`}>
                                    {f.tamil}
                                </p>
                                <p className="text-[#64748b] text-[13px] leading-relaxed">{f.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ─── Impact Section ─── */}
            <section className="py-20 px-4 border-y border-[#e2e8f0] bg-[#f8fafc]" aria-label="Impact">
                <div className="max-w-[1280px] mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <p className="text-[12px] text-green-400 font-semibold uppercase tracking-widest mb-3">
                            Our Impact
                        </p>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
                            Empowering 20M+ TN Stakeholders
                        </h2>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-4 mb-12">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="card p-8"
                        >
                            <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-4">
                                <TrendingUp className="w-5 h-5 text-green-400" />
                            </div>
                            <h4 className="text-[17px] font-bold text-slate-900 mb-2">Farmer Fair-Pricing</h4>
                            <p className="text-[13px] text-[#64748b] leading-relaxed">
                                Eliminating middlemen and ensuring farmers get 30% more value for their organic produce through direct traceability.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="card p-8"
                        >
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4">
                                <Shield className="w-5 h-5 text-blue-400" />
                            </div>
                            <h4 className="text-[17px] font-bold text-slate-900 mb-2">Food Safety Compliance</h4>
                            <p className="text-[13px] text-[#64748b] leading-relaxed">
                                Reducing food-borne illness risks by 90% with instant recall capabilities across the state.
                            </p>
                        </motion.div>
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {stats.map((s, i) => (
                            <motion.div
                                key={s.label}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.08, type: "spring", stiffness: 200 }}
                                className="card p-6 text-center"
                            >
                                <div className="text-2xl mb-2">{s.icon}</div>
                                <div className={`text-3xl font-black mb-1 ${s.color}`}>{s.value}</div>
                                <div className="text-[12px] text-[#64748b]">{s.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Role Cards ─── */}
            <section className="py-20 px-4" aria-label="Role selection">
                <div className="max-w-[1280px] mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <p className="text-[12px] text-green-400 font-semibold uppercase tracking-widest mb-3">
                            Get Started
                        </p>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
                            Choose Your Role
                        </h2>
                        <p className="text-[#64748b] text-[15px]">
                            Jump into any stakeholder dashboard instantly
                        </p>
                    </motion.div>

                    <div className="flex flex-wrap justify-center gap-4">
                        {roles.map((r, i) => (
                            <motion.button
                                key={r.role}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.07 }}
                                whileHover={{ y: -4 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => {
                                    if (isAuthenticated && user?.role === r.role) {
                                        router.push(`/dashboard/${r.role}`);
                                    } else {
                                        router.push(`/login?role=${r.role}`);
                                    }
                                }}
                                className="flex flex-col items-center p-5 rounded-2xl border w-[140px] transition-all cursor-pointer"
                                style={{
                                    borderColor: `${r.color}20`,
                                    background: `${r.color}06`,
                                }}
                            >
                                <div
                                    className="text-3xl mb-3 w-14 h-14 rounded-xl flex items-center justify-center"
                                    style={{
                                        background: `${r.color}12`,
                                        border: `1px solid ${r.color}20`,
                                    }}
                                >
                                    {r.icon}
                                </div>
                                <div className="font-semibold text-slate-900 text-[13px]">{r.label}</div>
                                <div className="text-[11px] mt-0.5 font-medium tamil-text" style={{ color: r.color }}>
                                    {r.tamil}
                                </div>
                            </motion.button>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Tech Stack ─── */}
            <section className="py-12 px-4 border-y border-[#e2e8f0] bg-[#f8fafc]" aria-label="Technology stack">
                <div className="max-w-[800px] mx-auto text-center">
                    <p className="text-[11px] text-[#64748b] uppercase tracking-widest mb-5 font-semibold">
                        Powered By
                    </p>
                    <div className="flex flex-wrap justify-center gap-2.5">
                        {[
                            { label: "Next.js 14",         color: "#e5e7eb" },
                            { label: "Polygon Amoy",       color: "#8247e5" },
                            { label: "Tamil Voice API",    color: "#22c55e" },
                            { label: "Framer Motion",      color: "#f59e0b" },
                            { label: "IndexedDB Offline",  color: "#3b82f6" },
                            { label: "wagmi + viem",       color: "#a855f7" },
                            { label: "TailwindCSS",        color: "#06b6d4" },
                        ].map((t) => (
                            <span
                                key={t.label}
                                className="text-[12px] px-3 py-1.5 rounded-full border font-medium"
                                style={{
                                    borderColor: `${t.color}20`,
                                    color: t.color,
                                    background: `${t.color}08`,
                                }}
                            >
                                {t.label}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── FAQ ─── */}
            <section className="py-20 px-4" aria-label="Frequently asked questions">
                <div className="max-w-[700px] mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-10"
                    >
                        <p className="text-[12px] text-green-400 font-semibold uppercase tracking-widest mb-3">
                            FAQ
                        </p>
                        <h2 className="text-3xl font-bold text-slate-900">Frequently Asked Questions</h2>
                    </motion.div>

                    <div className="space-y-3">
                        {faqs.map((faq, i) => (
                            <FAQItem key={i} q={faq.q} a={faq.a} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── QR Scanner Modal ─── */}
            <AnimatePresence>
                {isScanning && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
                    >
                        <div
                            className="absolute inset-0 bg-black/75 backdrop-blur-xl"
                            onClick={() => setIsScanning(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.95, y: 12 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 12 }}
                            transition={{ duration: 0.2 }}
                            className="relative w-full max-w-md card border-[#e2e8f0] p-6 shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center border border-green-500/20">
                                        <QrCode className="w-4.5 h-4.5 text-green-400" />
                                    </div>
                                    <h3 className="text-[16px] font-bold text-slate-900">AgriTrace Scanner</h3>
                                </div>
                                <button
                                    onClick={() => setIsScanning(false)}
                                    className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-[#64748b] hover:text-slate-900 transition-all"
                                    aria-label="Close scanner"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="relative rounded-xl overflow-hidden bg-black aspect-square border border-[#e2e8f0]">
                                <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
                                <canvas ref={canvasRef} className="hidden qr-canvas" />

                                {/* Scanning overlay */}
                                <div className="absolute inset-0 pointer-events-none p-10 flex items-center justify-center">
                                    <div className="relative w-full h-full">
                                        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-green-400 rounded-tl-lg" />
                                        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-green-400 rounded-tr-lg" />
                                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-green-400 rounded-bl-lg" />
                                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-green-400 rounded-br-lg" />
                                        <motion.div
                                            className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent"
                                            animate={{ top: ["4%", "96%", "4%"] }}
                                            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                                        />
                                    </div>
                                </div>

                                {/* Status pill */}
                                <div className="absolute top-3 left-1/2 -translate-x-1/2">
                                    <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur px-3 py-1.5 rounded-full border border-green-500/30">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                        <span className="text-[10px] uppercase font-bold tracking-widest text-green-400">
                                            Scanning
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-5 space-y-3">
                                <p className="text-[12px] text-[#64748b] text-center">
                                    Point at any AgriTraceIndia QR code for instant blockchain verification
                                </p>
                                <button
                                    onClick={() => setIsScanning(false)}
                                    className="btn btn-secondary w-full"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Cancel Scanner
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Footer />
        </div>
    );
}

