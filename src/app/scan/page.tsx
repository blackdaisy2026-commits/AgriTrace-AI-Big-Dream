"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import Link from "next/link";

type ScanStatus = "idle" | "requesting" | "scanning" | "success" | "error";

const DEMO_BATCHES = [
    { id: "TN-DEMO001", crop: "Tomato 🍅", origin: "Dindigul", color: "#22c55e", desc: "Full journey — Harvest → Retail" },
    { id: "TN-DEMO002", crop: "Banana 🍌", origin: "Theni", color: "#f59e0b", desc: "In Transit — Processing stage" },
];

export default function ScanPage() {
    const router = useRouter();
    const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '');
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const animRef = useRef<number>(0);

    const [status, setStatus] = useState<ScanStatus>("idle");
    const [manualId, setManualId] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [scannedId, setScannedId] = useState("");
    const [scanProgress, setScanProgress] = useState(0);
    const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");

    // ── Stop all camera resources ──
    const stopCamera = useCallback(() => {
        cancelAnimationFrame(animRef.current);
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
        setStatus("idle");
    }, []);

    // ── Cleanup on unmount ──
    useEffect(() => () => stopCamera(), [stopCamera]);

    // ── Scan frame using jsQR ──
    const startScanLoop = useCallback((video: HTMLVideoElement) => {
        let lastScanTime = 0;
        const SCAN_INTERVAL = 300; // Scan every 300ms

        const loop = async (time: number) => {
            if (!video || video.readyState < 2 || !canvasRef.current) {
                animRef.current = requestAnimationFrame(loop);
                return;
            }

            // Update progress bar animation (still smooth @ 60fps)
            setScanProgress(p => p >= 100 ? 0 : p + 0.8);

            // Only scan every 300ms
            if (time - lastScanTime > SCAN_INTERVAL) {
                lastScanTime = time;
                try {
                    const canvas = canvasRef.current;
                    const ctx = canvas.getContext("2d");
                    if (ctx) {
                        // Set canvas dimensions to match video
                        canvas.width = video.videoWidth;
                        canvas.height = video.videoHeight;

                        // Draw current video frame to canvas
                        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                        // Get image data
                        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

                        // Dynamically import jsQR
                        const { default: jsQR } = await import("jsqr");

                        // Scan for QR code
                        const code = jsQR(imageData.data, imageData.width, imageData.height);

                        if (code && code.data) {
                            const raw = code.data;
                            const parts = raw.split("/");
                            const batchId = parts[parts.length - 1] || raw;
                            stopCamera();
                            setScannedId(batchId);
                            setStatus("success");
                            toast.success("✅ QR Code Scanned!", { duration: 2000 });
                            setTimeout(() => router.push(`/trace/${batchId}`), 800);
                            return;
                        }
                    }
                } catch (e) {
                    console.error("QR Scan Error", e);
                }
            }

            animRef.current = requestAnimationFrame(loop);
        };
        animRef.current = requestAnimationFrame(loop);
    }, [router, stopCamera]);

    // ── Attach stream to video element once 'scanning' state is rendered ──
    // This is the key fix for the black screen: we wait for the video element
    // to actually be in the DOM (after status='scanning' renders it), then attach.
    useEffect(() => {
        if (status === "scanning" && streamRef.current && videoRef.current) {
            const video = videoRef.current;
            video.srcObject = streamRef.current;
            video.setAttribute("playsinline", "");   // iOS Safari requirement
            video.muted = true;
            video
                .play()
                .then(() => startScanLoop(video))
                .catch((e) => {
                    console.error("Video play error:", e);
                    setErrorMsg("Could not start video preview. Try a different browser.");
                    setStatus("error");
                });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status]);

    // ── Start Camera ──
    const startCamera = useCallback(async (mode?: "environment" | "user") => {
        const targetMode = mode ?? facingMode;
        setStatus("requesting");
        setErrorMsg("");
        // Stop any previous stream
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop());
            streamRef.current = null;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: { ideal: targetMode },
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                },
                audio: false,
            });
            streamRef.current = stream;
            // Set status to 'scanning' — this renders <video> into the DOM.
            // The useEffect above will then attach srcObject once it's mounted.
            setStatus("scanning");
        } catch (err: any) {
            const msg = err?.message || String(err);
            if (msg.includes("Permission") || msg.includes("NotAllowed")) {
                setErrorMsg("Camera permission denied. Please allow camera access in browser settings.");
            } else if (msg.includes("NotFound") || msg.includes("DevicesNotFound") || msg.includes("ConstraintNotSatisfied")) {
                if (targetMode === "environment") {
                    // Fall back to front camera automatically
                    setFacingMode("user");
                    startCamera("user");
                    return;
                } else {
                    setErrorMsg("No camera found on this device.");
                }
            } else if (msg.includes("NotReadable") || msg.includes("TrackStart")) {
                setErrorMsg("Camera is in use by another app. Close other apps and try again.");
            } else {
                setErrorMsg("Could not start camera: " + msg);
            }
            setStatus("error");
        }
    }, [facingMode]);

    // ── Navigate to batch ──
    const goToBatch = (id: string) => {
        const trimmed = id.trim();
        if (!trimmed) return;
        router.push(`/trace/${trimmed}`);
    };

    return (
        <div className="min-h-screen">
            <Header />

            {/* Hidden canvas for image processing */}
            <canvas ref={canvasRef} style={{ display: "none" }} />

            <div className="max-w-xl mx-auto px-4 py-8">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
                    <div className="text-6xl mb-3">📷</div>
                    <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "Outfit, sans-serif" }}>
                        Scan QR Code
                    </h1>
                    <p className="text-gray-400 text-sm">
                        Point camera at product QR to trace its farm-to-fork journey
                    </p>
                </motion.div>

                {/* ── CAMERA BOX ── */}
                <div className="glass-card p-4 mb-5 overflow-hidden">
                    <AnimatePresence mode="wait">

                        {/* IDLE STATE */}
                        {status === "idle" && (
                            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="text-center py-6"
                            >
                                {/* Animated scan frame */}
                                <div className="relative mx-auto mb-6" style={{ width: 220, height: 220 }}>
                                    <div className="w-full h-full rounded-2xl border-2 border-dashed border-green-500/30 flex items-center justify-center bg-black/20">
                                        <span className="text-6xl">🌾</span>
                                    </div>
                                    {/* Corner brackets */}
                                    {[
                                        "top-0 left-0 border-t-2 border-l-2 rounded-tl-lg",
                                        "top-0 right-0 border-t-2 border-r-2 rounded-tr-lg",
                                        "bottom-0 left-0 border-b-2 border-l-2 rounded-bl-lg",
                                        "bottom-0 right-0 border-b-2 border-r-2 rounded-br-lg",
                                    ].map((cls, i) => (
                                        <div key={i} className={`absolute w-7 h-7 border-green-400 ${cls}`} />
                                    ))}
                                    {/* Scanning line */}
                                    <motion.div
                                        className="absolute left-3 right-3 h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent"
                                        animate={{ top: ["8px", "205px", "8px"] }}
                                        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                                    />
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => startCamera()}
                                    className="w-full btn-glow text-white font-bold py-4 rounded-xl text-lg flex items-center justify-center gap-3"
                                >
                                    <span className="text-2xl">📷</span> Start Camera Scanner
                                </motion.button>
                                <p className="text-xs text-gray-600 mt-3">
                                    Works on Chrome, Edge, Safari · Camera permission required
                                </p>
                            </motion.div>
                        )}

                        {/* REQUESTING PERMISSION */}
                        {status === "requesting" && (
                            <motion.div key="requesting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="text-center py-12"
                            >
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                    className="w-12 h-12 border-2 border-green-500 border-t-transparent rounded-full mx-auto mb-4"
                                />
                                <p className="text-white font-medium">Requesting camera access…</p>
                                <p className="text-gray-500 text-xs mt-1">Please click "Allow" in the browser prompt</p>
                            </motion.div>
                        )}

                        {/* SCANNING — live video feed */}
                        {status === "scanning" && (
                            <motion.div key="scanning" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                                <div className="relative rounded-xl overflow-hidden bg-black" style={{ aspectRatio: "4/3" }}>
                                    <video
                                        ref={videoRef}
                                        className="w-full h-full object-cover"
                                        playsInline
                                        muted
                                    />
                                    {/* Overlay corners */}
                                    <div className="absolute inset-0 pointer-events-none">
                                        {/* Darken edges */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />
                                        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/40" />

                                        {/* Center scan box */}
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="relative" style={{ width: 220, height: 220 }}>
                                                {[
                                                    "top-0 left-0 border-t-[3px] border-l-[3px] rounded-tl-lg",
                                                    "top-0 right-0 border-t-[3px] border-r-[3px] rounded-tr-lg",
                                                    "bottom-0 left-0 border-b-[3px] border-l-[3px] rounded-bl-lg",
                                                    "bottom-0 right-0 border-b-[3px] border-r-[3px] rounded-br-lg",
                                                ].map((cls, i) => (
                                                    <div key={i} className={`absolute w-8 h-8 border-green-400 ${cls}`} />
                                                ))}
                                                {/* Animated scan line */}
                                                <motion.div
                                                    className="absolute left-1 right-1 h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent shadow-lg shadow-green-400/50"
                                                    animate={{ top: ["4px", "216px", "4px"] }}
                                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                                />
                                            </div>
                                        </div>

                                        {/* Status pill */}
                                        <div className="absolute top-3 left-1/2 -translate-x-1/2">
                                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 border border-green-500/40">
                                                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                                <span className="text-xs text-green-400 font-medium">Scanning for QR…</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Progress bar */}
                                <div className="mt-3 h-1 rounded-full bg-white/5 overflow-hidden">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
                                        animate={{ x: ["-100%", "200%"] }}
                                        transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                                    />
                                </div>

                                <div className="mt-3 flex gap-2">
                                    <button
                                        onClick={stopCamera}
                                        className="flex-1 py-3 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-900/20 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                                    >
                                        ✕ Stop
                                    </button>
                                    <button
                                        onClick={() => {
                                            const nextMode = facingMode === "user" ? "environment" : "user";
                                            stopCamera();
                                            setFacingMode(nextMode);
                                            startCamera(nextMode);
                                        }}
                                        className="flex-1 py-3 rounded-xl border border-blue-500/30 text-blue-400 hover:bg-blue-900/20 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                                    >
                                        📸 {facingMode === "user" ? "Switch to Back" : "Switch to Front"}
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* SUCCESS */}
                        {status === "success" && (
                            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-8"
                            >
                                <motion.div
                                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                    className="text-6xl mb-4"
                                >✅</motion.div>
                                <p className="text-white font-bold text-xl mb-1">QR Scanned!</p>
                                <p className="text-green-400 font-mono text-sm mb-4">{scannedId}</p>
                                <p className="text-gray-500 text-xs">Redirecting to trace page…</p>
                            </motion.div>
                        )}

                        {/* ERROR */}
                        {status === "error" && (
                            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="text-center py-8"
                            >
                                <div className="text-5xl mb-4">⚠️</div>
                                <p className="text-red-400 font-semibold mb-2">Camera Error</p>
                                <p className="text-gray-400 text-sm mb-6 max-w-xs mx-auto">{errorMsg}</p>
                                <div className="space-y-2">
                                    <button
                                        onClick={() => setStatus("idle")}
                                        className="w-full btn-glow text-white py-3 rounded-xl font-medium"
                                    >
                                        🔄 Try Again
                                    </button>
                                    <p className="text-xs text-gray-600">
                                        Tip: Use HTTPS or try the manual lookup below
                                    </p>
                                </div>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>

                {/* ── MANUAL LOOKUP ── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-card p-5 mb-5"
                >
                    <h2 className="font-semibold text-white mb-3 flex items-center gap-2">
                        🔍 Manual Batch ID Lookup
                    </h2>
                    <div className="flex gap-2">
                        <input
                            value={manualId}
                            onChange={e => setManualId(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && goToBatch(manualId)}
                            placeholder="Type Batch ID e.g. TN-DEMO001"
                            className="agri-input"
                            autoComplete="off"
                        />
                        <motion.button
                            whileTap={{ scale: 0.96 }}
                            onClick={() => goToBatch(manualId)}
                            disabled={!manualId.trim()}
                            className="px-5 py-2.5 btn-glow text-white rounded-xl text-sm font-bold disabled:opacity-40 whitespace-nowrap"
                        >
                            Go →
                        </motion.button>
                    </div>
                </motion.div>

                {/* ── DEMO BATCHES ── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass-card p-5 mb-5"
                >
                    <h2 className="font-semibold text-white mb-4">🎯 Try Demo Batches</h2>
                    <div className="space-y-3">
                        {DEMO_BATCHES.map((demo, i) => (
                            <motion.button
                                key={demo.id}
                                whileHover={{ scale: 1.02, x: 4 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => goToBatch(demo.id)}
                                className="w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all hover:bg-white/5"
                                style={{ border: `1px solid ${demo.color}30`, background: `${demo.color}08` }}
                            >
                                <span className="text-3xl">{demo.crop.split(" ")[1]}</span>
                                <div className="flex-1">
                                    <div className="font-semibold text-white text-sm">{demo.crop.split(" ")[0]} — {demo.origin}</div>
                                    <div className="text-xs text-gray-500 mt-0.5">{demo.desc}</div>
                                </div>
                                <div>
                                    <div
                                        className="text-xs px-2 py-1 rounded-full font-mono"
                                        style={{ background: `${demo.color}15`, color: demo.color, border: `1px solid ${demo.color}30` }}
                                    >
                                        {demo.id}
                                    </div>
                                </div>
                            </motion.button>
                        ))}
                    </div>
                </motion.div>

                {/* ── QR PREVIEW FOR DEMO ── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="glass-card p-5"
                >
                    <h2 className="font-semibold text-white mb-4">📱 Scan These Demo QR Codes</h2>
                    <div className="grid grid-cols-2 gap-4">
                        {DEMO_BATCHES.map(demo => (
                            <div key={demo.id} className="text-center">
                                <div className="bg-white p-3 rounded-xl inline-block mb-2 cursor-pointer hover:shadow-lg hover:shadow-green-900/30 transition-all"
                                    onClick={() => goToBatch(demo.id)}
                                    title={`Click to trace batch ${demo.id}`}
                                >
                                    <QRCodeSVG
                                        value={`${SITE_URL}/trace/${demo.id}`}
                                        size={110}
                                        level="H"
                                        bgColor="#ffffff"
                                        fgColor="#111111"
                                    />
                                </div>
                                <div className="text-xs font-mono" style={{ color: demo.color }}>{demo.id}</div>
                                <div className="text-xs text-gray-500">{demo.crop.split(" ")[0]}</div>
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-gray-600 text-center mt-3">
                        Open on phone → scan QR above with camera · or click the code to trace directly
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
