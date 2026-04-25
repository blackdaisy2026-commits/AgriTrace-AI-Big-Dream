"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRole } from "@/lib/role-context";
import { motion, AnimatePresence } from "framer-motion";
import { Wifi, WifiOff, Menu, X, Leaf, LogOut, User, Wallet } from "lucide-react";
import toast from "react-hot-toast";
import { getPendingEvents } from "@/lib/offline-queue";
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';

export default function Header() {
    const { user, logout, isAuthenticated } = useRole();
    const { address, isConnected } = useAccount();
    const { connect } = useConnect();
    const { disconnect } = useDisconnect();
    const [isOnline, setIsOnline] = useState(true);
    const [pendingCount, setPendingCount] = useState(0);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            toast.success("🌐 Back online! Syncing events...");
        };
        const handleOffline = () => {
            setIsOnline(false);
            toast("📵 Offline mode - events will be queued", { icon: "⚠️" });
        };
        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);
        setIsOnline(navigator.onLine);

        const checkQueue = async () => {
            const events = await getPendingEvents();
            setPendingCount(events.length);
        };
        // Defer initial check so it doesn't block page render
        const initialCheck = setTimeout(checkQueue, 2000);
        const interval = setInterval(checkQueue, 30000);
        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
            clearTimeout(initialCheck);
            clearInterval(interval);
        };
    }, []);

    const roleColors: Record<string, string> = {
        farmer: "text-green-400",
        processor: "text-blue-400",
        retailer: "text-purple-400",
        consumer: "text-amber-400",
        regulator: "text-red-400",
        tahsildar: "text-violet-400",
    };

    const roleIcons: Record<string, string> = {
        farmer: "🌾",
        processor: "🔬",
        retailer: "🏪",
        consumer: "👤",
        regulator: "🏛️",
        tahsildar: "📋",
    };

    return (
        <header className="sticky top-0 z-50 flex items-center justify-between px-4 md:px-8 py-3 glass-card border-b border-green-900/30 rounded-none">
            <Link href="/" className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-green-900/50">
                    <Leaf className="w-5 h-5 text-white" />
                </div>
                <div>
                    <span className="font-bold text-xl text-white font-outfit">AgriTraceIndia</span>
                    <div className="text-xs text-green-400/60 leading-none -mt-0.5">TNI26040 · Blockchain</div>
                </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6">
                <Link href="/how-it-works" className="text-sm text-gray-400 hover:text-green-400 transition-colors">
                    📋 செய்முறை
                </Link>
                <Link href="/about" className="text-sm text-gray-400 hover:text-green-400 transition-colors">
                    📖 About
                </Link>
                <Link href="/trace/TN-DEMO001" className="text-sm text-gray-400 hover:text-green-400 transition-colors">
                    🔍 Demo Trace
                </Link>
                {isAuthenticated && (
                    <Link href={`/dashboard/${user?.role}`} className="text-sm text-gray-400 hover:text-green-400 transition-colors">
                        📊 Dashboard
                    </Link>
                )}
                {isAuthenticated && (
                    <Link href="/dashboard/profile" className="text-sm text-gray-400 hover:text-green-400 transition-colors flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" /> Profile
                    </Link>
                )}
                {isAuthenticated && (
                    <Link href="/admin" className="text-sm text-gray-400 hover:text-green-400 transition-colors">
                        🏛️ System Explorer
                    </Link>
                )}
            </nav>

            <div className="flex items-center gap-3">
                {/* Wallet status */}
                <button
                    onClick={() => isConnected ? disconnect() : connect({ connector: injected() })}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all ${isConnected
                        ? "bg-green-500/10 border-green-500/30 text-green-400"
                        : "bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20"
                        }`}
                >
                    <Wallet className="w-4 h-4" />
                    <span className="text-xs font-bold font-mono">
                        {isConnected ? `${address?.slice(0, 6)}...${address?.slice(-4)}` : "Connect"}
                    </span>
                </button>

                {/* Online status */}
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/30 border border-white/5">
                    {isOnline ? (
                        <><div className="status-online" /><span className="text-xs text-green-400 hidden sm:inline">Online</span></>
                    ) : (
                        <><div className="status-offline" /><span className="text-xs text-red-400 hidden sm:inline">Offline</span></>
                    )}
                    {!isOnline && <WifiOff className="w-3 h-3 text-red-400" />}
                    {isOnline && <Wifi className="w-3 h-3 text-green-400" />}
                </div>

                {/* Pending badge */}
                {pendingCount > 0 && (
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-900/30 border border-amber-500/30">
                        <span className="text-xs text-amber-400">{pendingCount} queued</span>
                    </div>
                )}

                {/* User info */}
                {isAuthenticated && (
                    <div className="flex items-center gap-2">
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-900/20 border border-green-500/20">
                            <span className="text-sm">{roleIcons[user?.role || ""]}</span>
                            <div className="flex flex-col">
                                <span className="text-[10px] text-gray-500 font-bold leading-none uppercase tracking-tighter">{user?.role === 'processor' ? 'Agri Officer' : user?.role === 'regulator' ? 'IAgS' : user?.role}</span>
                                <span className={`text-xs font-bold ${roleColors[user?.role || ""]}`}>
                                    {user?.name}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={() => logout()}
                            className="p-2 rounded-lg bg-red-900/20 border border-red-500/20 text-red-400 hover:bg-red-900/40 transition-colors"
                            title="Logout"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Mobile menu */}
                <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="md:hidden p-2 rounded-lg bg-white/5"
                >
                    {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 right-0 glass-card border-t border-green-900/20 p-4 flex flex-col gap-3"
                    >
                        <Link href="/how-it-works" className="text-sm text-gray-300 hover:text-green-400 py-2 border-b border-white/5">
                            📋 செய்முறை
                        </Link>
                        <Link href="/trace/TN-DEMO001" className="text-sm text-gray-300 hover:text-green-400 py-2 border-b border-white/5">
                            🔍 Demo Trace
                        </Link>
                        {isAuthenticated && (
                            <Link href="/dashboard/profile" className="text-sm text-gray-300 hover:text-green-400 py-2 border-b border-white/5 flex items-center gap-2">
                                <User className="w-4 h-4" /> My Profile / சுயவிவரம்
                            </Link>
                        )}
                        {isAuthenticated && (
                            <Link href={`/dashboard/${user?.role}`} className="text-sm text-gray-300 hover:text-green-400 py-2 border-b border-white/5">
                                📊 My Dashboard
                            </Link>
                        )}
                        <Link href="/scan" className="text-sm text-gray-300 hover:text-green-400 py-2">
                            📷 Scan QR Code
                        </Link>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
