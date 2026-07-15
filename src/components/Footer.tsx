"use client";
import Link from "next/link";
import { Leaf, MapPin, Phone, Mail } from "lucide-react";

const platformLinks = [
    { href: "/trace",            label: "Trace Search" },
    { href: "/scan",             label: "QR Scanner" },
    { href: "/how-it-works",     label: "How It Works" },
    { href: "/security-proof.html", label: "Security Proof", external: true },
    { href: "/db-visualizer.html",  label: "Data Explorer",   external: true },
];

const supportLinks = [
    { href: "/about",   label: "Our Story" },
    { href: "/contact", label: "Contact Helpdesk" },
    { href: "/docs",    label: "Documentation" },
];

export default function Footer() {
    return (
        <footer className="border-t border-[#e2e8f0] bg-[#f8fafc]/80 mt-16">
            <div className="max-w-[1280px] mx-auto px-4 md:px-6 py-16">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-10 lg:gap-16">

                    {/* Brand column */}
                    <div className="col-span-2 md:col-span-1">
                        <Link href="/" className="flex items-center gap-2.5 mb-5" aria-label="AgriTraceIndia">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center">
                                <Leaf className="w-4 h-4 text-slate-900" />
                            </div>
                            <span className="font-bold text-[15px] text-slate-900 font-outfit">
                                AgriTrace<span className="text-green-400">India</span>
                            </span>
                        </Link>
                        <p className="text-[13px] text-[#64748b] leading-relaxed mb-5 max-w-[220px]">
                            Empowering Tamil Nadu's agriculture with immutable blockchain traceability.
                        </p>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/4 border border-[#e2e8f0]">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                            <span className="text-[11px] text-[#64748b] font-semibold tracking-widest uppercase">
                                TN-Hackathon 2026
                            </span>
                        </div>
                    </div>

                    {/* Platform links */}
                    <div>
                        <h3 className="text-[11px] text-[#64748b] font-semibold uppercase tracking-widest mb-4">
                            Platform
                        </h3>
                        <ul className="space-y-2.5">
                            {platformLinks.map((link) => (
                                <li key={link.href}>
                                    {link.external ? (
                                        <a
                                            href={link.href}
                                            className="text-[13px] text-[#64748b] hover:text-slate-900 transition-colors"
                                        >
                                            {link.label}
                                        </a>
                                    ) : (
                                        <Link
                                            href={link.href}
                                            className="text-[13px] text-[#64748b] hover:text-slate-900 transition-colors"
                                        >
                                            {link.label}
                                        </Link>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support links */}
                    <div>
                        <h3 className="text-[11px] text-[#64748b] font-semibold uppercase tracking-widest mb-4">
                            Support
                        </h3>
                        <ul className="space-y-2.5">
                            {supportLinks.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-[13px] text-[#64748b] hover:text-slate-900 transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-[11px] text-[#64748b] font-semibold uppercase tracking-widest mb-4">
                            Contact
                        </h3>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-2.5">
                                <MapPin className="w-3.5 h-3.5 text-[#64748b] mt-0.5 shrink-0" />
                                <span className="text-[13px] text-[#64748b]">Chennai, Tamil Nadu</span>
                            </li>
                            <li className="flex items-start gap-2.5">
                                <Phone className="w-3.5 h-3.5 text-[#64748b] mt-0.5 shrink-0" />
                                <span className="text-[13px] text-[#64748b]">1800-AGRI-TN</span>
                            </li>
                            <li className="flex items-start gap-2.5">
                                <Mail className="w-3.5 h-3.5 text-[#64748b] mt-0.5 shrink-0" />
                                <a
                                    href="/contact"
                                    className="text-[13px] text-[#64748b] hover:text-slate-900 transition-colors"
                                >
                                    Helpdesk Portal
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="mt-12 pt-6 border-t border-[#e2e8f0] flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-[12px] text-[#64748b]">
                        Built with ❤️ for Tamil Nadu farmers ·{" "}
                        <span className="tamil-text">தமிழ்நாடு விவசாயிகளுக்காக</span>
                    </p>
                    <p className="text-[12px] text-[#64748b]">
                        © 2026 AgriTraceIndia · TNI26040
                    </p>
                </div>
            </div>
        </footer>
    );
}

