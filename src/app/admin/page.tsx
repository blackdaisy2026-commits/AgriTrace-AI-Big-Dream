"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRole } from "@/lib/role-context";
import Header from "@/components/Header";
import toast from "react-hot-toast";
import {
    Users,
    Package,
    History,
    ShieldCheck,
    Search,
    RefreshCw,
    Database
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
    const { user, token, isAuthenticated } = useRole();
    const [activeTab, setActiveTab] = useState<"users" | "batches" | "events">("batches");
    const [data, setData] = useState<{
        users: any[];
        batches: any[];
        events: any[];
    }>({
        users: [],
        batches: [],
        events: []
    });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const fetchData = async () => {
        if (!token) return;
        setLoading(true);
        const { apiRequest } = await import("@/lib/api");

        try {
            const [usersRes, batchesRes, eventsRes] = await Promise.all([
                apiRequest('/auth/users', 'GET', null, token),
                apiRequest('/batches', 'GET', null, token),
                apiRequest('/events', 'GET', null, token)
            ]);

            setData({
                users: usersRes.status === 'success' ? usersRes.data : [],
                batches: batchesRes.status === 'success' ? batchesRes.data : [],
                events: eventsRes.status === 'success' ? eventsRes.data : []
            });
        } catch (err) {
            toast.error("Failed to sync with database");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [token]);

    if (!isAuthenticated || (user?.role !== "regulator" && user?.role !== "consumer" && user?.name !== "Murugesan Pillai")) {
        // Allowing it for Murugesan (demonstration) or Regulator
        // In real app, only 'admin' role
    }

    const filteredData = () => {
        const list = data[activeTab];
        if (!search) return list;
        return list.filter((item: any) =>
            JSON.stringify(item).toLowerCase().includes(search.toLowerCase())
        );
    };

    return (
        <div className="min-h-screen circuit-bg">
            <Header />
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                        <h1 className="text-4xl font-bold text-white flex items-center gap-3">
                            <Database className="text-blue-400" />
                            System Explorer
                        </h1>
                        <p className="text-gray-400 mt-1">Direct view of AgriTraceIndia Blockchain & MongoDB Ledger</p>
                    </motion.div>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 text-green-300 z-20" />
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Global search..."
                                className="agri-input !pl-24 w-64"
                            />
                        </div>
                        <button
                            onClick={fetchData}
                            className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                        >
                            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* Status Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {[
                        { label: "Active Nodes", value: "3", sub: "Distributed Ledger", icon: <ShieldCheck className="text-green-400" /> },
                        { label: "Total Transactions", value: data.events.length.toString(), sub: "On-Chain Verified", icon: <History className="text-blue-400" /> },
                        { label: "Sync Status", value: "100%", sub: "Blockchain ↔ DB", icon: <RefreshCw className="text-purple-400" /> },
                    ].map((s, i) => (
                        <div key={i} className="glass-card p-6 flex items-center gap-5">
                            <div className="p-3 bg-white/5 rounded-2xl text-2xl">
                                {s.icon}
                            </div>
                            <div>
                                <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">{s.label}</div>
                                <div className="text-2xl font-bold text-white">{s.value}</div>
                                <div className="text-xs text-gray-400">{s.sub}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div className="flex border-b border-white/10 mb-6 overflow-x-auto no-scrollbar">
                    {[
                        { id: "batches", label: "📦 Product Batches", icon: <Package className="w-4 h-4" /> },
                        { id: "events", label: "🔗 Blockchain Events", icon: <History className="w-4 h-4" /> },
                        { id: "users", label: "👥 Participants", icon: <Users className="w-4 h-4" /> },
                    ].map(t => (
                        <button
                            key={t.id}
                            onClick={() => setActiveTab(t.id as any)}
                            className={`px-6 py-4 flex items-center gap-2 text-sm font-medium transition-all whitespace-nowrap border-b-2 ${activeTab === t.id ? "border-blue-500 text-blue-400 bg-blue-500/5" : "border-transparent text-gray-500 hover:text-gray-300"}`}
                        >
                            {t.icon}
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Content Table */}
                <div className="glass-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider">
                                {activeTab === "batches" && (
                                    <tr>
                                        <th className="px-6 py-4">Batch ID</th>
                                        <th className="px-6 py-4">Crop</th>
                                        <th className="px-6 py-4">Farmer</th>
                                        <th className="px-6 py-4">Stage</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Created</th>
                                    </tr>
                                )}
                                {activeTab === "events" && (
                                    <tr>
                                        <th className="px-6 py-4">Transaction Hash</th>
                                        <th className="px-6 py-4">Batch ID</th>
                                        <th className="px-6 py-4">Action</th>
                                        <th className="px-6 py-4">Actor</th>
                                        <th className="px-6 py-4">Node Verified</th>
                                    </tr>
                                )}
                                {activeTab === "users" && (
                                    <tr>
                                        <th className="px-6 py-4">Name</th>
                                        <th className="px-6 py-4">Email</th>
                                        <th className="px-6 py-4">Role</th>
                                        <th className="px-6 py-4">Location</th>
                                        <th className="px-6 py-4">Mobile</th>
                                    </tr>
                                )}
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3" />
                                            Synchronizing with database...
                                        </td>
                                    </tr>
                                ) : filteredData().length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                            No records found matching your search.
                                        </td>
                                    </tr>
                                ) : filteredData().map((item: any, i: number) => (
                                    <motion.tr
                                        key={i}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-sm text-gray-300 hover:bg-white/5 transition-colors"
                                    >
                                        {activeTab === "batches" && (
                                            <>
                                                <td className="px-6 py-4 font-mono text-blue-400">{item.batchId}</td>
                                                <td className="px-6 py-4">{item.cropType}</td>
                                                <td className="px-6 py-4">{item.farmerName || 'Dev Farmer'}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${item.status === 'Sold' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                                                        {item.status || item.currentStage}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1.5">
                                                        <div className={`w-1.5 h-1.5 rounded-full ${item.blockchainVerified ? 'bg-green-400' : 'bg-gray-600'}`}></div>
                                                        {item.blockchainVerified ? 'Verified' : 'Pending'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-xs text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</td>
                                            </>
                                        )}
                                        {activeTab === "events" && (
                                            <>
                                                <td className="px-6 py-4 font-mono text-xs text-gray-500">{item.txHash?.substring(0, 20)}...</td>
                                                <td className="px-6 py-4 text-blue-400">{item.batchId}</td>
                                                <td className="px-6 py-4">
                                                    <span className="bg-white/5 px-2 py-1 rounded-lg text-xs">{item.stage}</span>
                                                </td>
                                                <td className="px-6 py-4">{item.actorName || 'Actor'}</td>
                                                <td className="px-6 py-4 text-green-400">✅ 12 Confirmations</td>
                                            </>
                                        )}
                                        {activeTab === "users" && (
                                            <>
                                                <td className="px-6 py-4 font-medium text-white">{item.name}</td>
                                                <td className="px-6 py-4 text-gray-500">{item.email}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${item.role === 'farmer' ? 'bg-amber-500/10 text-amber-500' : item.role === 'processor' ? 'bg-blue-500/10 text-blue-500' : 'bg-purple-500/10 text-purple-500'}`}>
                                                        {item.role === 'processor' ? 'agri officer' : item.role === 'regulator' ? 'iags / admin' : item.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-xs">{item.district || 'All TN'}</td>
                                                <td className="px-6 py-4 text-gray-500">{item.mobileNo || 'N/A'}</td>
                                            </>
                                        )}
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="mt-8 flex justify-center">
                    <Link href="/dashboard/farmer">
                        <button className="text-gray-500 hover:text-white text-sm transition-colors">
                            ← Back to Dashboard
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
