"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Leaf, Home, ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function NotFound() {
    return (
        <div className="min-h-screen">
            <Header />

            <main className="pt-32 pb-20 px-4 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md mx-auto"
                >
                    <div className="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-8 border border-red-500/20">
                        <Leaf className="w-12 h-12 text-red-400 rotate-180" />
                    </div>

                    <h1 className="text-8xl font-black text-white mb-4 font-outfit">404</h1>
                    <h2 className="text-2xl font-bold text-gray-300 mb-6 font-outfit">Page Lost in the Fields</h2>
                    <p className="text-gray-500 mb-10 leading-relaxed">
                        The batch or page you are looking for has either been harvested or never existed. Let's get you back to the main trail.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/">
                            <button className="w-full sm:w-auto btn-glow text-white px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                                <Home className="w-5 h-5" />
                                Return Home
                            </button>
                        </Link>
                        <button
                            onClick={() => window.history.back()}
                            className="w-full sm:w-auto px-8 py-3 rounded-xl border border-white/10 text-gray-400 font-bold hover:bg-white/5 flex items-center justify-center gap-2 transition-all"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Go Back
                        </button>
                    </div>
                </motion.div>
            </main>

            <Footer />
        </div>
    );
}
