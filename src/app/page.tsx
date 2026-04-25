"use client";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useRole } from "@/lib/role-context";
import { useRouter } from "next/navigation";
import { Shield, Mic, QrCode, Wifi, Users, Brain, Leaf, X, LogOut } from "lucide-react";
import { useState, useRef, useCallback, useEffect } from "react";
import toast from "react-hot-toast";

const features = [
  {
    icon: <Mic className="w-7 h-7" />,
    title: "Tamil Voice Input",
    tamil: "குரல் உள்ளீடு",
    desc: "Speak in Tamil to record your harvest details hands-free",
    color: "from-green-500 to-emerald-400",
    glow: "rgba(34,197,94,0.3)",
    bg: "rgba(34,197,94,0.08)",
    border: "rgba(34,197,94,0.25)",
  },
  {
    icon: <QrCode className="w-7 h-7" />,
    title: "QR Scan & Trace",
    tamil: "QR ஸ்கேன்",
    desc: "Scan any product QR to see the complete supply chain journey",
    color: "from-blue-500 to-cyan-400",
    glow: "rgba(59,130,246,0.3)",
    bg: "rgba(59,130,246,0.08)",
    border: "rgba(59,130,246,0.25)",
  },
  {
    icon: <Shield className="w-7 h-7" />,
    title: "Blockchain Verified",
    tamil: "பிளாக்செயின்",
    desc: "Every event is recorded immutably on Polygon Mumbai blockchain",
    color: "from-purple-500 to-violet-400",
    glow: "rgba(168,85,247,0.3)",
    bg: "rgba(168,85,247,0.08)",
    border: "rgba(168,85,247,0.25)",
  },
  {
    icon: <Wifi className="w-7 h-7" />,
    title: "Offline PWA",
    tamil: "ஆஃப்லைன்",
    desc: "Works without internet — events sync automatically when connected",
    color: "from-amber-500 to-orange-400",
    glow: "rgba(245,158,11,0.3)",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.25)",
  },
  {
    icon: <Users className="w-7 h-7" />,
    title: "5-Role Dashboards",
    tamil: "5 பாத்திரங்கள்",
    desc: "Farmer, Agri Officer, Retailer, Consumer & IAgS panels",
    color: "from-pink-500 to-rose-400",
    glow: "rgba(236,72,153,0.3)",
    bg: "rgba(236,72,153,0.08)",
    border: "rgba(236,72,153,0.25)",
  },
  {
    icon: <Brain className="w-7 h-7" />,
    title: "AI Fraud Detection",
    tamil: "AI முறைகேடு",
    desc: "Real-time integrity scoring detects anomalies across the chain",
    color: "from-teal-500 to-cyan-400",
    glow: "rgba(20,184,166,0.3)",
    bg: "rgba(20,184,166,0.08)",
    border: "rgba(20,184,166,0.25)",
  },
];

const chain = [
  { icon: "🌾", label: "Farm", sub: "Harvest & GPS", color: "#22c55e" },
  { icon: "🔬", label: "Quality", sub: "Lab Tests", color: "#3b82f6" },
  { icon: "🏭", label: "Process", sub: "Cold Chain", color: "#a855f7" },
  { icon: "🚛", label: "Transport", sub: "Real-time Track", color: "#f59e0b" },
  { icon: "🏪", label: "Retail", sub: "QR Display", color: "#ec4899" },
  { icon: "🍽️", label: "Consumer", sub: "Scan & Trust", color: "#06b6d4" },
];

const stats = [
  { value: "1,247+", label: "Farmers Onboarded", color: "#22c55e", icon: "👨‍🌾" },
  { value: "< 2s", label: "Trace Time", color: "#3b82f6", icon: "⚡" },
  { value: "100%", label: "Tamper Proof", color: "#a855f7", icon: "🔒" },
  { value: "38", label: "TN Districts", color: "#f59e0b", icon: "🗺️" },
];

const roles = [
  { role: "farmer", label: "Farmer", tamil: "விவசாயி", icon: "🌾", color: "#22c55e", glow: "rgba(34,197,94,0.35)" },
  { role: "processor", label: "Agri Officer", tamil: "வேளாண்மை அதிகாரி", icon: "🔬", color: "#3b82f6", glow: "rgba(59,130,246,0.35)" },
  { role: "retailer", label: "Retailer", tamil: "சில்லறை வணிகர்", icon: "🏪", color: "#a855f7", glow: "rgba(168,85,247,0.35)" },
  { role: "consumer", label: "Consumer", tamil: "நுகர்வோர்", icon: "👤", color: "#f59e0b", glow: "rgba(245,158,11,0.35)" },
  { role: "regulator", label: "IAgS / Admin", tamil: "IAgS / நிர்வாகி", icon: "🏛️", color: "#ec4899", glow: "rgba(236,72,153,0.35)" },
];

export default function LandingPage() {
  const { isAuthenticated, user } = useRole();
  const router = useRouter();
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animRef = useRef<number>(0);

  // ── SCANNER LOGIC ──
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

            if (code && code.data) {
              const raw = code.data;
              const batchId = raw.split("/").pop() || raw;
              stopCamera();
              setIsScanning(false);
              toast.success("✅ QR Scanned!");
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
        } catch (err) {
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
    <div className="min-h-screen relative overflow-x-hidden">
      <Header />

      {/* ─── HERO ─── */}
      <section className="relative pt-24 pb-20 px-4 text-center overflow-hidden">
        {/* Colorful radial backdrop */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20"
            style={{ background: "radial-gradient(circle, #22c55e, transparent)" }} />
          <div className="absolute top-40 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-15"
            style={{ background: "radial-gradient(circle, #f59e0b, transparent)" }} />
          <div className="absolute bottom-0 left-1/2 w-96 h-64 rounded-full blur-3xl opacity-10"
            style={{ background: "radial-gradient(circle, #a855f7, transparent)" }} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10 max-w-5xl mx-auto"
        >
          {/* Main Title */}
          <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-6" style={{ fontFamily: "Outfit, sans-serif" }}>
            <span className="gradient-text-vibrant">AgriTrace</span>
            <span className="text-white">India</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-4 max-w-3xl mx-auto leading-relaxed">
            Blockchain-powered <span className="text-green-400 font-semibold">Farm-to-Fork</span> supply chain traceability <br className="hidden md:block" />
            for Tamil Nadu agriculture
          </p>
          <p className="text-base text-gray-500 mb-10 tamil-text">
            உணவு பாதுகாப்பு · விவசாய வெளிப்படைத்தன்மை · பிளாக்செயின் நம்பகத்தன்மை
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-10">
            <Link href={isAuthenticated ? `/dashboard/${user?.role || "farmer"}` : "/login"}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="btn-glow text-white font-bold px-12 py-5 rounded-2xl text-xl flex items-center gap-3 shadow-lg shadow-green-500/20"
              >
                {isAuthenticated ? (
                  <>🚀 Back to Dashboard</>
                ) : (
                  <>🔑 Access Platform Login / தமிழ் உள்நுழைவு</>
                )}
              </motion.button>
            </Link>
          </div>

          {/* Social Proof / Trust */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-gray-500 text-sm italic"
          >
            "Verifying thousands of tons of produce across Tamil Nadu daily"
          </motion.p>
        </motion.div>
      </section>

      {/* ─── SUPPLY CHAIN FLOW ─── */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-center text-white mb-12"
            style={{ fontFamily: "Outfit, sans-serif" }}
          >
            🌾 <span className="gradient-text">Farm to Fork</span> Journey
          </motion.h2>

          <div className="flex flex-wrap justify-center items-center gap-2 md:gap-0">
            {chain.map((step, i) => (
              <motion.div
                key={step.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="flex items-center"
              >
                <div
                  className="text-center p-5 rounded-2xl transition-all hover:scale-105 cursor-default"
                  style={{
                    background: `rgba(${step.color === "#22c55e" ? "34,197,94" : step.color === "#3b82f6" ? "59,130,246" : step.color === "#a855f7" ? "168,85,247" : step.color === "#f59e0b" ? "245,158,11" : step.color === "#ec4899" ? "236,72,153" : "6,182,212"},0.10)`,
                    border: `1px solid ${step.color}40`,
                    boxShadow: `0 0 20px ${step.color}20`,
                    minWidth: "90px",
                  }}
                >
                  <div className="text-4xl mb-2">{step.icon}</div>
                  <div className="font-bold text-sm text-white">{step.label}</div>
                  <div className="text-xs mt-0.5" style={{ color: step.color }}>{step.sub}</div>
                </div>
                {i < chain.length - 1 && (
                  <div className="hidden md:flex items-center mx-1">
                    <div className="w-6 h-0.5 bg-gradient-to-r from-gray-600 to-gray-500 relative">
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-gray-400" />
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS (DETAILED) ─── */}
      <section className="py-20 px-4 bg-black/20">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-white mb-6 font-outfit">
                How <span className="gradient-text-vibrant">AgriTraceIndia</span> Works
              </h2>
              <p className="text-gray-400 mb-8 leading-relaxed">
                Utilizing state-of-the-art blockchain technology combined with intuitive Tamil voice interfaces, we ensure that every vegetable and grain is tracked from the moment it leaves the soil until it reaches your plate.
              </p>

              <div className="space-y-6">
                {[
                  { title: "Voice Logging", desc: "Farmers use Tamil speech-to-text to log harvest data instantly without typing." },
                  { title: "Smart Contracts", desc: "Data is hashed and recorded on Polygon, making it impossible to tamper with." },
                  { title: "Dynamic QR", desc: "Each batch gets a unique QR code that links to the live blockchain record." }
                ].map((item, id) => (
                  <div key={id} className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center text-green-400 font-bold">
                      {id + 1}
                    </div>
                    <div>
                      <h4 className="text-white font-bold">{item.title}</h4>
                      <p className="text-gray-500 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-square rounded-3xl overflow-hidden glass-card border-green-500/20 flex items-center justify-center">
                <div className="text-9xl">🌿</div>
                {/* Floating particles or circles */}
                <div className="absolute top-10 right-10 w-20 h-20 bg-blue-500/20 rounded-full blur-2xl animate-pulse" />
                <div className="absolute bottom-10 left-10 w-32 h-32 bg-green-500/10 rounded-full blur-3xl animate-pulse" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES GRID ─── */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-center text-white mb-4"
            style={{ fontFamily: "Outfit, sans-serif" }}
          >
            ✨ Platform <span className="gradient-text">Features</span>
          </motion.h2>
          <p className="text-center text-gray-500 mb-12">Cutting-edge innovations for Tamil Nadu agriculture</p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ scale: 1.03, y: -4 }}
                className="p-6 rounded-2xl transition-all cursor-default"
                style={{
                  background: f.bg,
                  border: `1px solid ${f.border}`,
                  boxShadow: `0 0 30px ${f.glow}20`,
                }}
              >
                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br ${f.color} text-white shadow-lg`}
                  style={{ boxShadow: `0 0 20px ${f.glow}` }}
                >
                  {f.icon}
                </div>
                <h3 className="font-bold text-white text-lg mb-1">{f.title}</h3>
                <p className="text-xs tamil-text mb-2" style={{ color: f.glow.replace("0.3", "0.9").replace("rgba(", "rgb(").split(",").slice(0, 3).join(",") + ")" }}>
                  {f.tamil}
                </p>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── IMPACT SECTION ─── */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <span className="text-green-400 text-sm font-bold tracking-widest uppercase">Our Impact</span>
          <h2 className="text-4xl font-bold text-white mt-2 mb-12 font-outfit">Empowering 20M+ TN Stakeholders</h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="glass-card p-8 text-left border-green-500/20">
              <div className="text-3xl mb-4">📈</div>
              <h4 className="text-xl font-bold text-white mb-2">Farmer Fair-Pricing</h4>
              <p className="text-gray-400 text-sm">Eliminating middlemen and ensuring farmers get 30% more value for their organic produce through direct traceability.</p>
            </div>
            <div className="glass-card p-8 text-left border-blue-500/20">
              <div className="text-3xl mb-4">🛡️</div>
              <h4 className="text-xl font-bold text-white mb-2">Food Safety Compliance</h4>
              <p className="text-gray-400 text-sm">Reducing food-borne illness risks by 90% with instant recall capabilities across the state.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, type: "spring", stiffness: 200 }}
                className="glass-card p-6 text-center"
                style={{ borderColor: `${s.color}30` }}
              >
                <div className="text-3xl mb-2">{s.icon}</div>
                <div className="text-3xl font-black mb-1" style={{ color: s.color }}>{s.value}</div>
                <div className="text-xs text-gray-400">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ROLE CARDS ─── */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-center text-white mb-4"
            style={{ fontFamily: "Outfit, sans-serif" }}
          >
            🎭 Try <span className="gradient-text">Your Role</span>
          </motion.h2>
          <p className="text-center text-gray-500 mb-10">Jump into any stakeholder dashboard instantly</p>

          <div className="flex flex-wrap justify-center gap-4">
            {roles.map((r, i) => (
              <motion.button
                key={r.role}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ scale: 1.06, y: -4 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  if (isAuthenticated && user?.role === r.role) {
                    router.push(`/dashboard/${r.role}`);
                  } else {
                    router.push(`/login?role=${r.role}`);
                  }
                }}
                className="flex flex-col items-center p-5 rounded-2xl w-36 transition-all"
                style={{
                  background: `${r.color}12`,
                  border: `1px solid ${r.color}35`,
                  boxShadow: `0 0 20px ${r.glow}`,
                }}
              >
                <div
                  className="text-4xl mb-3 w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ background: `${r.color}20`, boxShadow: `0 0 15px ${r.glow}` }}
                >
                  {r.icon}
                </div>
                <div className="font-bold text-white text-sm">{r.label}</div>
                <div className="text-xs mt-0.5 tamil-text" style={{ color: r.color }}>{r.tamil}</div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TECH STACK ─── */}
      <section className="py-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-gray-600 text-sm mb-4">Powered by</p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { label: "Next.js 14", color: "#fff" },
              { label: "Polygon Amoy", color: "#8247e5" },
              { label: "Tamil Voice API", color: "#22c55e" },
              { label: "Three.js", color: "#f59e0b" },
              { label: "IndexedDB Offline", color: "#3b82f6" },
              { label: "wagmi + viem", color: "#a855f7" },
              { label: "TailwindCSS", color: "#06b6d4" },
            ].map((t) => (
              <span
                key={t.label}
                className="text-xs px-3 py-1.5 rounded-full border"
                style={{ borderColor: `${t.color}30`, color: t.color, background: `${t.color}10` }}
              >
                {t.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ SECTION ─── */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-white mb-10 font-outfit font-black uppercase tracking-tight">Frequently Asked <span className="gradient-text">Questions</span></h2>
          <div className="space-y-4">
            {[
              { q: "Is this app accessible offline?", a: "Yes! AgriTraceIndia is an offline-first PWA. Farmers can log data without internet; it syncs automatically to the blockchain once a connection is restored." },
              { q: "How do I know the data isn't faked?", a: "Every entry is cryptographically signed and stored on the Polygon blockchain. Any anomaly is flagged by our AI Integrity score in real-time." },
              { q: "Is there a Tamil version?", a: "The entire interface supports Tamil, and we offer hands-free voice input specifically optimized for Tamil dialects (ta-IN)." }
            ].map((faq, i) => (
              <details key={i} className="glass-card p-5 group cursor-pointer border-white/5">
                <summary className="font-bold text-white list-none flex justify-between items-center outline-none">
                  {faq.q}
                  <span className="text-green-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="text-gray-400 mt-3 text-sm leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      {/* ── SCANNER MODAL OVERLAY ── */}
      <AnimatePresence>
        {isScanning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
          >
            <div
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
              onClick={() => setIsScanning(false)}
            />
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative w-full max-w-md glass-card p-6 border-green-500/20 shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center border border-green-500/30">
                    <QrCode className="w-5 h-5 text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white font-outfit">AgriTraceIndia Scanner</h3>
                </div>
                <button
                  onClick={() => setIsScanning(false)}
                  className="p-2 rounded-xl bg-white/5 text-gray-400 hover:text-white transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="relative rounded-2xl overflow-hidden bg-black aspect-square border border-white/10 group shadow-inner">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover scale-x-1"
                  playsInline
                  muted
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Scanning HUD Overlay */}
                <div className="absolute inset-0 pointer-events-none p-8 flex items-center justify-center">
                  <div className="relative w-full h-full">
                    {/* Corners */}
                    <div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-green-400 rounded-tl-2xl shadow-[0_0_15px_rgba(34,197,94,0.4)]" />
                    <div className="absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2 border-green-400 rounded-tr-2xl shadow-[0_0_15px_rgba(34,197,94,0.4)]" />
                    <div className="absolute bottom-0 left-0 w-10 h-10 border-b-2 border-l-2 border-green-400 rounded-bl-2xl shadow-[0_0_15px_rgba(34,197,94,0.4)]" />
                    <div className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-green-400 rounded-br-2xl shadow-[0_0_15px_rgba(34,197,94,0.4)]" />

                    {/* Laser line animation */}
                    <motion.div
                      className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent shadow-[0_0_15px_rgba(34,197,94,0.6)]"
                      animate={{ top: ["2%", "98%", "2%"] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </div>
                </div>

                {/* Status pill */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2">
                  <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-green-500/40 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-[10px] uppercase font-black tracking-widest text-green-400">Scanning</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-4">
                <p className="text-gray-500 text-xs text-center px-4 leading-relaxed">
                  Focus on product QR code for instant blockchain verification
                </p>
                <button
                  onClick={() => setIsScanning(false)}
                  className="w-full py-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> Cancel Scanner
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
