"use client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Send, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";

export default function ContactPage() {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        toast.success("Message sent! We will get back to you shortly.");
    };

    return (
        <div className="min-h-screen">
            <Header />

            <main className="pt-24 pb-20 px-4">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-sm font-bold text-green-400 uppercase tracking-widest mb-3">Support Center</h2>
                        <h1 className="text-5xl font-black text-white mb-6 font-outfit">
                            Get in <span className="gradient-text">Touch</span>
                        </h1>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                            Have questions about onboarding your farm or tracking a batch? Our team is here to help 24/7 across Tamil Nadu.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Contact Info */}
                        <div className="space-y-4">
                            <div className="glass-card p-6 flex items-start gap-4 border-green-500/10">
                                <div className="p-3 rounded-lg bg-green-500/10 text-green-400">
                                    <Phone className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white mb-1">Helpdesk</h4>
                                    <p className="text-sm text-gray-500">1800-AGRI-TN (Toll Free)</p>
                                    <p className="text-xs text-green-400/60 mt-1">Available in Tamil & English</p>
                                </div>
                            </div>

                            <div className="glass-card p-6 flex items-start gap-4 border-blue-500/10">
                                <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white mb-1">Email Us</h4>
                                    <p className="text-sm text-gray-500">support@agritraceindia.in</p>
                                </div>
                            </div>

                            <div className="glass-card p-6 flex items-start gap-4 border-purple-500/10">
                                <div className="p-3 rounded-lg bg-purple-500/10 text-purple-400">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white mb-1">HQ Address</h4>
                                    <p className="text-sm text-gray-500 leading-relaxed">
                                        TNHB Complex, 2nd Floor,<br />
                                        Anna Salai, Chennai,<br />
                                        Tamil Nadu 600002
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="md:col-span-2">
                            <form onSubmit={handleSubmit} className="glass-card p-8 border-white/5 space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Full Name</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Enter your name"
                                            className="agri-input"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Role</label>
                                        <select className="agri-select">
                                            <option>Farmer / விவசாயி</option>
                                            <option>Consumer / நுகர்வோர்</option>
                                            <option>Retailer / சில்லறை வணிகர்</option>
                                            <option>IAgS / Admin / நிர்வாகி</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Subject</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="How can we help?"
                                        className="agri-input"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Message</label>
                                    <textarea
                                        rows={4}
                                        required
                                        placeholder="Describe your query in detail..."
                                        className="agri-input resize-none"
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full btn-glow text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 group"
                                >
                                    <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    Send Message
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="mt-20 glass-card p-10 text-center border-amber-500/10">
                        <MessageSquare className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-white mb-2">Live Support Hubs</h3>
                        <p className="text-gray-400 max-w-xl mx-auto mb-8">
                            We have physical support centers in Coimbatore, Madurai, and Trichy for on-field farmer training.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <span className="text-xs px-4 py-2 rounded-full bg-white/5 border border-white/5 text-gray-500">📍 Madurai APMC</span>
                            <span className="text-xs px-4 py-2 rounded-full bg-white/5 border border-white/5 text-gray-500">📍 Coimbatore Agri Univ</span>
                            <span className="text-xs px-4 py-2 rounded-full bg-white/5 border border-white/5 text-gray-500">📍 Trichy Hub</span>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
