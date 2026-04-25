"use client";
import Link from "next/link";
import { Leaf } from "lucide-react";

export default function Footer() {
    return (
        <footer className="py-20 border-t border-green-900/20 bg-black/20">
            <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-4 gap-12 text-left">
                <div className="col-span-2">
                    <div className="flex items-center gap-2 mb-6 text-2xl font-black">
                        <Leaf className="w-8 h-8 text-green-400" />
                        <span className="text-white">AgriTraceIndia</span>
                    </div>
                    <p className="text-gray-500 max-w-sm mb-6">
                        Empowering Tamil Nadu's agriculture through immutable transparency and cutting-edge blockchain innovation. Built for TNI26040 Hackathon.
                    </p>
                    <div className="text-xs text-gray-700 bg-white/5 inline-block px-3 py-1 rounded-full uppercase tracking-widest font-bold">
                        TN-Hackathon 2026
                    </div>
                </div>

                <div>
                    <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-widest">Platform</h4>
                    <ul className="space-y-3 text-sm text-gray-500">
                        <li><Link href="/trace" className="hover:text-green-400">🔍 Trace Search</Link></li>
                        <li><Link href="/scan" className="hover:text-green-400">📷 QR Scanner</Link></li>
                        <li><a href="/security-proof.html" className="hover:text-green-400">🛡️ Security Proof</a></li>
                        <li><a href="/db-visualizer.html" className="hover:text-green-400">📊 Data Explorer</a></li>
                        <li><Link href="/how-it-works" className="hover:text-green-400">⚙️ How it Works</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-widest">Support</h4>
                    <ul className="space-y-3 text-sm text-gray-500">
                        <li><Link href="/about" className="hover:text-green-400">📖 Our Story</Link></li>
                        <li><Link href="/contact" className="hover:text-green-400">📧 Contact Helpdesk</Link></li>
                        <li className="flex items-center gap-2">📍 <span className="hover:text-green-400 cursor-pointer">Chennai, TN</span></li>
                        <li className="flex items-center gap-2">📞 <span className="hover:text-green-400 cursor-pointer">1800-AGRI-TN</span></li>
                    </ul>
                </div>
            </div>

            <div className="mt-20 pt-8 border-t border-white/5 text-center px-4">
                <p className="text-gray-600 text-sm">Built with ❤️ for Tamil Nadu farmers</p>
                <p className="text-gray-700 text-xs mt-2 tamil-text">தமிழ்நாடு விவசாயிகளுக்காக</p>
            </div>
        </footer>
    );
}
