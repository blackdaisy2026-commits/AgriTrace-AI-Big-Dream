"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRole } from "@/lib/role-context";
import { motion, AnimatePresence } from "framer-motion";
import {
    Wifi, WifiOff, Menu, X, Leaf, LogOut, User, Wallet,
    LayoutDashboard, Search, Scan, BookOpen, Info,
    ChevronDown, Settings
} from "lucide-react";
import { toast } from "sonner";
import { getPendingEvents } from "@/lib/offline-queue";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";

// ─── Role Config ──────────────────────────────────────────────────────────────
const ROLE_CONFIG: Record<string, {
    label: string;
    color: string;
    bgClass: string;
    icon: string;
}> = {
    farmer:     { label: "Farmer",       color: "text-green-400",  bgClass: "bg-green-400/10 border-green-400/20",  icon: "🌾" },
    processor:  { label: "Agri Officer", color: "text-blue-400",   bgClass: "bg-blue-400/10 border-blue-400/20",    icon: "🔬" },
    retailer:   { label: "Retailer",     color: "text-purple-400", bgClass: "bg-purple-400/10 border-purple-400/20",icon: "🏪" },
    consumer:   { label: "Consumer",     color: "text-amber-400",  bgClass: "bg-amber-400/10 border-amber-400/20",  icon: "👤" },
    regulator:  { label: "IAgS",         color: "text-red-400",    bgClass: "bg-red-400/10 border-red-400/20",      icon: "🏛️" },
    tahsildar:  { label: "Tahsildar",    color: "text-violet-400", bgClass: "bg-violet-400/10 border-violet-400/20",icon: "📋" },
};

export default function Header() {
    const { user, logout, isAuthenticated } = useRole();
    const { address, isConnected } = useAccount();
    const { connect } = useConnect();
    const { disconnect } = useDisconnect();
    const pathname = usePathname();

    const [isOnline, setIsOnline] = useState(true);
    const [pendingCount, setPendingCount] = useState(0);
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    // Scroll detection for blur effect
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 8);
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setMenuOpen(false);
        setUserMenuOpen(false);
    }, [pathname]);

    // Online/offline detection
    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            toast.success("Back online — syncing events…");
        };
        const handleOffline = () => {
            setIsOnline(false);
            toast.warning("Offline mode — events will be queued");
        };
        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);
        setIsOnline(navigator.onLine);

        const checkQueue = async () => {
            const events = await getPendingEvents();
            setPendingCount(events.length);
        };
        const t = setTimeout(checkQueue, 2000);
        const i = setInterval(checkQueue, 30_000);
        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
            clearTimeout(t);
            clearInterval(i);
        };
    }, []);

    const roleConfig = user?.role ? ROLE_CONFIG[user.role] : null;

    const navLinks = [
        { href: "/how-it-works", label: "How It Works", icon: <BookOpen className="w-4 h-4" /> },
        { href: "/about",        label: "About",         icon: <Info className="w-4 h-4" /> },
        { href: "/trace",        label: "Trace",         icon: <Search className="w-4 h-4" /> },
    ];

    const isActive = (href: string) =>
        pathname === href || pathname.startsWith(href + "/");

    return (
        <header
            className={`sticky top-0 z-50 transition-all duration-200 ${
                scrolled
                    ? "bg-[#f8fafc]/90 backdrop-blur-xl border-b border-[#e2e8f0]"
                    : "bg-transparent border-b border-transparent"
            }`}
            role="banner"
        >
            <div className="max-w-[1280px] mx-auto px-4 md:px-6 h-14 flex items-center justify-between gap-4">

                {/* ── Logo ── */}
                <Link
                    href="/"
                    className="flex items-center gap-2.5 shrink-0"
                    aria-label="AgriTraceIndia home"
                >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center shadow-sm">
                        <Leaf className="w-4 h-4 text-slate-900" />
                    </div>
                    <div className="hidden sm:block">
                        <span className="font-bold text-[15px] text-slate-900 font-outfit leading-none">
                            AgriTrace
                        </span>
                        <span className="text-green-400 font-bold text-[15px] font-outfit">India</span>
                        <div className="text-[10px] text-[#64748b] leading-none mt-0.5 font-inter">
                            TNI26040 · Blockchain
                        </div>
                    </div>
                </Link>

                {/* ── Desktop Navigation ── */}
                <nav
                    className="hidden md:flex items-center gap-1"
                    aria-label="Main navigation"
                >
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`nav-link flex items-center gap-1.5 text-[13px] ${
                                isActive(link.href) ? "nav-link-active" : ""
                            }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                    {isAuthenticated && (
                        <Link
                            href={`/dashboard/${user?.role}`}
                            className={`nav-link flex items-center gap-1.5 text-[13px] ${
                                isActive("/dashboard") ? "nav-link-active" : ""
                            }`}
                        >
                            <LayoutDashboard className="w-3.5 h-3.5" />
                            Dashboard
                        </Link>
                    )}
                    {isAuthenticated && (
                        <Link
                            href="/admin"
                            className={`nav-link flex items-center gap-1.5 text-[13px] ${
                                isActive("/admin") ? "nav-link-active" : ""
                            }`}
                        >
                            <Settings className="w-3.5 h-3.5" />
                            Explorer
                        </Link>
                    )}
                </nav>

                {/* ── Right Controls ── */}
                <div className="flex items-center gap-2">

                    {/* Online / Offline indicator */}
                    <div
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-[11px] font-medium ${
                            isOnline
                                ? "bg-green-500/5 border-green-500/15 text-green-400"
                                : "bg-red-500/10 border-red-500/20 text-red-400"
                        }`}
                        title={isOnline ? "Connected" : "Offline mode"}
                    >
                        {isOnline ? (
                            <><div className="status-online" /><span className="hidden sm:inline">Online</span></>
                        ) : (
                            <><div className="status-offline" /><span className="hidden sm:inline">Offline</span></>
                        )}
                    </div>

                    {/* Pending queue badge */}
                    {pendingCount > 0 && (
                        <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-400 font-medium">
                            {pendingCount} queued
                        </div>
                    )}

                    {/* Wallet button */}
                    <button
                        onClick={() => isConnected ? disconnect() : connect({ connector: injected() })}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-medium transition-all ${
                            isConnected
                                ? "bg-green-500/8 border-green-500/20 text-green-400 hover:bg-green-500/12"
                                : "bg-[#ffffff] border-[#e2e8f0] text-[#475569] hover:text-slate-900 hover:border-[#cbd5e1]"
                        }`}
                        aria-label={isConnected ? "Disconnect wallet" : "Connect wallet"}
                    >
                        <Wallet className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline font-mono">
                            {isConnected
                                ? `${address?.slice(0, 6)}…${address?.slice(-4)}`
                                : "Wallet"
                            }
                        </span>
                    </button>

                    {/* Authenticated user menu */}
                    {isAuthenticated && roleConfig ? (
                        <div className="relative hidden sm:block">
                            <button
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[12px] font-medium transition-all ${roleConfig.bgClass} ${roleConfig.color}`}
                                aria-expanded={userMenuOpen}
                                aria-haspopup="true"
                            >
                                <span>{roleConfig.icon}</span>
                                <span className="max-w-[80px] truncate">{user?.name?.split(" ")[0]}</span>
                                <ChevronDown className={`w-3 h-3 transition-transform duration-150 ${userMenuOpen ? "rotate-180" : ""}`} />
                            </button>

                            <AnimatePresence>
                                {userMenuOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-10"
                                            onClick={() => setUserMenuOpen(false)}
                                        />
                                        <motion.div
                                            initial={{ opacity: 0, y: 4, scale: 0.97 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 4, scale: 0.97 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute right-0 top-full mt-2 w-52 card border-[#e2e8f0] z-20 overflow-hidden"
                                        >
                                            <div className="p-3 border-b border-[#e2e8f0]">
                                                <p className="text-[11px] text-[#64748b] uppercase tracking-wider font-semibold">
                                                    {roleConfig.label}
                                                </p>
                                                <p className="text-[14px] text-slate-900 font-medium mt-0.5 truncate">
                                                    {user?.name}
                                                </p>
                                                <p className="text-[12px] text-[#64748b] truncate">
                                                    {user?.email}
                                                </p>
                                            </div>
                                            <div className="p-1.5">
                                                <Link
                                                    href="/dashboard/profile"
                                                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-[#475569] hover:text-slate-900 hover:bg-slate-50 transition-all"
                                                >
                                                    <User className="w-4 h-4" />
                                                    My Profile
                                                </Link>
                                                <Link
                                                    href={`/dashboard/${user?.role}`}
                                                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-[#475569] hover:text-slate-900 hover:bg-slate-50 transition-all"
                                                >
                                                    <LayoutDashboard className="w-4 h-4" />
                                                    Dashboard
                                                </Link>
                                                <div className="h-px bg-[#e2e8f0] my-1" />
                                                <button
                                                    onClick={() => { setUserMenuOpen(false); logout(); }}
                                                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-red-400 hover:bg-red-500/8 w-full transition-all"
                                                >
                                                    <LogOut className="w-4 h-4" />
                                                    Sign Out
                                                </button>
                                            </div>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : !isAuthenticated ? (
                        <Link
                            href="/login"
                            className="hidden sm:flex btn btn-primary btn-sm"
                        >
                            Sign In
                        </Link>
                    ) : null}

                    {/* Mobile menu toggle */}
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg bg-slate-50 hover:bg-white/8 transition-colors"
                        aria-label={menuOpen ? "Close menu" : "Open menu"}
                        aria-expanded={menuOpen}
                    >
                        {menuOpen ? <X className="w-4.5 h-4.5" /> : <Menu className="w-4.5 h-4.5" />}
                    </button>
                </div>
            </div>

            {/* ── Mobile Menu Drawer ── */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="md:hidden overflow-hidden border-t border-[#e2e8f0] bg-[#f8fafc]/95 backdrop-blur-xl"
                    >
                        <nav className="px-4 py-4 flex flex-col gap-1" aria-label="Mobile navigation">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] transition-all ${
                                        isActive(link.href)
                                            ? "text-slate-900 bg-white/6"
                                            : "text-[#475569] hover:text-slate-900 hover:bg-white/4"
                                    }`}
                                >
                                    {link.icon}
                                    {link.label}
                                </Link>
                            ))}
                            <Link
                                href="/scan"
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] text-[#475569] hover:text-slate-900 hover:bg-white/4 transition-all"
                            >
                                <Scan className="w-4 h-4" />
                                Scan QR
                            </Link>
                            {isAuthenticated && (
                                <>
                                    <div className="h-px bg-[#e2e8f0] my-1" />
                                    <Link
                                        href={`/dashboard/${user?.role}`}
                                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] text-[#475569] hover:text-slate-900 hover:bg-white/4 transition-all"
                                    >
                                        <LayoutDashboard className="w-4 h-4" />
                                        Dashboard
                                    </Link>
                                    <Link
                                        href="/dashboard/profile"
                                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] text-[#475569] hover:text-slate-900 hover:bg-white/4 transition-all"
                                    >
                                        <User className="w-4 h-4" />
                                        Profile
                                    </Link>
                                    <button
                                        onClick={() => logout()}
                                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] text-red-400 hover:bg-red-500/8 w-full transition-all"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Sign Out
                                    </button>
                                </>
                            )}
                            {!isAuthenticated && (
                                <Link
                                    href="/login"
                                    className="mt-2 btn btn-primary w-full text-center"
                                >
                                    Sign In
                                </Link>
                            )}
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}

