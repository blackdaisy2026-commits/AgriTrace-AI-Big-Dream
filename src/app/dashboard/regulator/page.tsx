"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRole } from "@/lib/role-context";
import Header from "@/components/Header";
import toast from "react-hot-toast";
import Link from "next/link";
import { apiRequest } from "@/lib/api";
import {
    Search, AlertTriangle, TrendingUp, Package, Loader2, CreditCard,
    ShieldCheck, Activity, MapPin, CheckCircle, Clock
} from "lucide-react";

export default function RegulatorDashboard() {
    const { user, token, isAuthenticated } = useRole();
    const [search, setSearch] = useState("");
    const [stats, setStats] = useState<any>(null);
    const [applications, setApplications] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'monitor' | 'relief'>('monitor');
    const [claims, setClaims] = useState<any[]>([]);
    const [selectedClaim, setSelectedClaim] = useState<any>(null);
    const [decision, setDecision] = useState({ approved: true, amount: "", notes: "", txRef: "" });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchMonitor = async () => {
            if (!token) return;
            setLoading(true);
            try {
                const res = await apiRequest('/harvest/tnas-monitor', 'GET', null, token);
                if (res.status === 'success') {
                    setApplications(res.data);
                    setStats(res.stats);
                }
            } catch (err) {
                console.error("Failed to fetch monitor data", err);
            } finally {
                setLoading(false);
            }
        };

        const fetchClaims = async () => {
            if (!token) return;
            // Fetch tahsildar_approved claims (ready for TNAS final sanction) and already disbursed
            const [tahsildarApproved, disbursed] = await Promise.all([
                apiRequest('/compensation?status=tahsildar_approved', 'GET', null, token),
                apiRequest('/compensation?status=disbursed', 'GET', null, token)
            ]);
            const allClaims = [
                ...(tahsildarApproved.status === 'success' ? tahsildarApproved.data : []),
                ...(disbursed.status === 'success' ? disbursed.data : [])
            ];
            setClaims(allClaims);
        };

        if (activeTab === 'monitor') fetchMonitor();
        else fetchClaims();
    }, [token, activeTab]);

    const handleDecisionSubmit = async () => {
        if (decision.approved && !decision.amount) { toast.error("Please specify approved amount"); return; }
        setLoading(true);
        try {
            const res = await apiRequest(`/compensation/${selectedClaim._id}/admin-decision`, 'PATCH', {
                approved: decision.approved,
                approvedAmount: Number(decision.amount),
                adminNotes: decision.notes,
                transactionRef: decision.txRef || `TX-TN-${Date.now().toString(36).toUpperCase()}`
            }, token);

            if (res.status === 'success') {
                toast.success(decision.approved ? "✅ Funds approved for disbursement!" : "❌ Claim rejected");
                setClaims(prev => prev.map(c => c._id === selectedClaim._id ? res.data.claim : c));
                setSelectedClaim(null);
            }
        } catch (err) {
            toast.error("Failed to submit decision");
        } finally {
            setLoading(false);
        }
    };

    const filteredApps = applications.filter(app =>
        app.applicationId?.toLowerCase().includes(search.toLowerCase()) ||
        app.batchId?.toLowerCase().includes(search.toLowerCase()) ||
        app.cropType?.toLowerCase().includes(search.toLowerCase()) ||
        app.farmerDistrict?.toLowerCase().includes(search.toLowerCase()) ||
        app.farmerName?.toLowerCase().includes(search.toLowerCase())
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
            case 'approved': return 'text-green-400 bg-green-400/10 border-green-400/20';
            case 'batch_recorded': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
            case 'listed': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
            case 'sold': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
            case 'rejected': return 'text-red-400 bg-red-400/10 border-red-400/20';
            default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
        }
    };

    const getStatusLabel = (status: string) => {
        if (status === 'sold') return 'STOCK CLOSED';
        return status.replace('_', ' ');
    };

    if (!isAuthenticated || user?.role !== "regulator") {
        return (
            <div className="min-h-screen circuit-bg flex flex-col">
                <Header />
                <div className="flex-1 flex items-center justify-center">
                    <div className="glass-card p-8 text-center">
                        <h2 className="text-xl font-bold text-white mb-2">IAgS Access Required</h2>
                        <Link href="/login?role=regulator"><button className="btn-glow text-white mt-4 px-6 py-2 rounded-xl">Login as IAgS / Admin</button></Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen circuit-bg">
            <Header />
            <div className="max-w-7xl mx-auto px-4 py-8">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>🏛️ IAgS Admin Panel (TNAS)</h1>
                        <p className="text-gray-400">Welcome, <span className="text-red-400">{user?.name}</span> · Monitoring Agriculture Supply Chain 🔗</p>
                    </div>
                    <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                        <button
                            onClick={() => setActiveTab('monitor')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'monitor' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            <Activity className="w-4 h-4" /> Chain Monitor
                        </button>
                        <button
                            onClick={() => setActiveTab('relief')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'relief' ? 'bg-green-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            <CreditCard className="w-4 h-4" /> Disaster Relief
                        </button>
                    </div>
                </motion.div>

                {activeTab === 'monitor' ? (
                    <>
                        {/* Stats Dashboard */}
                        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                            {[
                                { label: "Total Apps", value: stats?.total || 0, icon: <Package />, col: "text-white" },
                                { label: "On-Chain Events", value: stats?.totalBlockchainEvents || 0, icon: <ShieldCheck />, col: "text-blue-400" },
                                { label: "Value Traded", value: `₹${(stats?.totalValueTraded || 0).toLocaleString()}`, icon: <TrendingUp />, col: "text-green-400" },
                                { label: "Active Listings", value: (stats?.listed || 0) + (stats?.batchRecorded || 0), icon: <Package />, col: "text-blue-400" },
                                { label: "Pending", value: stats?.pending || 0, icon: <Clock />, col: "text-yellow-400" },
                            ].map((s, i) => (
                                <div key={i} className="glass-card p-4 text-center border-white/5 bg-white/5">
                                    <div className={`flex justify-center mb-1 ${s.col}`}>
                                        <span className="w-5 h-5">{s.icon}</span>
                                    </div>
                                    <div className={`text-xl font-bold ${s.col}`}>{s.value}</div>
                                    <div className="text-[10px] text-gray-500 uppercase tracking-tighter mt-1">{s.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Search and Filters */}
                        <div className="flex flex-col md:flex-row gap-4 mb-6">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-green-300 z-20" />
                                <input
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Search by ID, Crop, Farmer or District..."
                                    className="agri-input !pl-24 w-full py-4 bg-white/5"
                                />
                            </div>
                        </div>

                        {/* Monitor Registry */}
                        <div className="glass-card overflow-hidden border-white/10">
                            <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
                                <h3 className="font-bold text-white flex items-center gap-2 text-sm uppercase">
                                    <ShieldCheck className="w-4 h-4 text-blue-400" /> Unified Supply Chain Registry
                                </h3>
                                <div className="text-[10px] text-gray-500">Live Blockchain Monitoring · Tamil Nadu Agriculture</div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-white/5 text-[10px] text-gray-400 uppercase font-bold">
                                            <th className="p-4 border-b border-white/10">Ref ID / Batch</th>
                                            <th className="p-4 border-b border-white/10">Farmer & Location</th>
                                            <th className="p-4 border-b border-white/10">Crop & Qty</th>
                                            <th className="p-4 border-b border-white/10">Status</th>
                                            <th className="p-4 border-b border-white/10 text-center">Events</th>
                                            <th className="p-4 border-b border-white/10 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {filteredApps.map((app) => (
                                            <tr key={app._id} className="hover:bg-white/5 transition-colors group">
                                                <td className="p-4 min-w-[150px]">
                                                    <div className="text-white font-mono text-xs font-bold">{app.applicationId}</div>
                                                    {app.batchId && (
                                                        <div className="text-[10px] text-purple-400 font-mono mt-1 group-hover:block transition-all">
                                                            📦 {app.batchId}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="p-4">
                                                    <div className="text-sm font-medium text-white flex items-center gap-2">
                                                        {app.farmerName}
                                                        <span className="text-[10px] text-blue-400 font-normal">({app.farmerMobile})</span>
                                                    </div>
                                                    <div className="text-[9px] text-gray-500 font-mono mt-0.5">
                                                        A: {app.farmerAadhaar || 'N/A'} | U: {app.farmerUzhavarCard || 'N/A'}
                                                    </div>
                                                    <div className="text-[10px] text-gray-400 flex items-center gap-1 mt-1">
                                                        <MapPin className="w-3 h-3 text-red-400/60" /> {app.farmerVillage}, {app.farmerTaluk}, {app.farmerDistrict}
                                                    </div>
                                                    <div className="text-[9px] text-amber-500/60 mt-1 italic line-clamp-1">
                                                        L: {app.farmerLandDetails || '...'} | C: {app.farmerCropDetails || '...'}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="text-sm text-gray-200 capitalize font-bold">{app.cropType}</div>
                                                    <div className="text-[10px] text-gray-500">
                                                        {app.batchRecordedWeight || app.quantityKg} kg · ₹{app.finalPricePerKg || app.farmerPricePerKg}/kg
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`text-[10px] px-2.5 py-1 rounded-full border font-black uppercase ${getStatusColor(app.status)}`}>
                                                        {getStatusLabel(app.status)}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <div className="flex flex-col items-center">
                                                        <div className="text-sm font-bold text-blue-400">{app.blockchainEvents?.length || 0}</div>
                                                        <div className="text-[8px] text-gray-600 uppercase">Steps</div>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <Link href={`/trace/${app.batchId || app.applicationId}`}>
                                                        <button className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 justify-end ml-auto">
                                                            Audit Trail <ChevronRight className="w-3 h-3" />
                                                        </button>
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredApps.length === 0 && (
                                            <tr>
                                                <td colSpan={6} className="p-12 text-center text-gray-500 italic">No applications found in monitor</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="grid lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1 space-y-4">
                            <div className="glass-card p-5">
                                <h2 className="text-xl font-bold text-white mb-4">நிவாரண விண்ணப்பங்கள் (Relief Claims)</h2>
                                <div className="space-y-3">
                                    {claims.length === 0 ? (
                                        <p className="text-gray-500 text-center py-8">விண்ணப்பங்கள் எதுவும் இல்லை</p>
                                    ) : (
                                        claims.map((c) => (
                                            <div
                                                key={c._id}
                                                className={`p-4 rounded-xl border transition-all cursor-pointer ${selectedClaim?._id === c._id ? 'border-green-500 bg-green-500/10' : 'border-white/5 bg-white/5 hover:border-white/10'}`}
                                                onClick={() => {
                                                    setSelectedClaim(c);
                                                    setDecision(d => ({ ...d, amount: (c.tahsildarApprovedAmount || c.estimatedAmount || "").toString() }));
                                                }}
                                            >
                                                <div className="font-bold text-white text-sm">{c.farmerName}</div>
                                                <div className="text-[10px] text-gray-500 mb-2">{c.claimRefNo} · {c.district}</div>
                                                <div className="flex items-center justify-between">
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${c.status === 'tahsildar_approved' ? 'border-blue-500/30 text-blue-400' :
                                                        c.status === 'disbursed' ? 'border-green-500/30 text-green-400' : 'border-white/10 text-gray-500'
                                                        }`}>
                                                        {c.status.replace('_', ' ')}
                                                    </span>
                                                    {c.estimatedAmount && <span className="text-[10px] font-bold text-green-400">₹{c.estimatedAmount}</span>}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-2">
                            {selectedClaim ? (
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-6 border-green-500/20 h-full">
                                    <h3 className="text-xl font-bold text-white mb-6 flex items-center justify-between">
                                        <span>Claim Approval: {selectedClaim.claimRefNo}</span>
                                        <span className="text-xs bg-white/5 px-3 py-1 rounded-full font-normal">Farmer ID: {selectedClaim.uzhavarAttaiNo}</span>
                                    </h3>

                                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                            <div className="text-xs text-gray-500 mb-1 uppercase font-bold tracking-wider">Farmer Info</div>
                                            <div className="text-white font-medium">{selectedClaim.farmerName}</div>
                                            <div className="text-xs text-gray-400">{selectedClaim.mobileNo} · Aadhaar: {selectedClaim.aadhaarNo}</div>
                                        </div>
                                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                            <div className="text-xs text-gray-500 mb-1 uppercase font-bold tracking-wider">Land & Crop</div>
                                            <div className="text-white font-medium">{selectedClaim.cropType} · {selectedClaim.landAreaAcres} Acres</div>
                                            <div className="text-xs text-gray-400">Patta: {selectedClaim.pattaNo} · Survey: {selectedClaim.surveyNo}</div>
                                        </div>
                                    </div>

                                    <div className="mb-6 p-4 rounded-2xl bg-blue-900/10 border border-blue-500/20">
                                        <div className="text-xs text-blue-400 mb-2 uppercase font-bold tracking-wider flex items-center gap-2">
                                            🛡️ Agri Officer Inspection Report
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 mb-3">
                                            <div>
                                                <div className="text-[10px] text-gray-500">Inspector</div>
                                                <div className="text-white text-sm font-medium">{selectedClaim.processorName || 'Pending Review'}</div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] text-gray-500">Est. Loss Amount</div>
                                                <div className="text-green-400 text-sm font-black">{selectedClaim.estimatedAmount ? `₹${selectedClaim.estimatedAmount}` : 'Not yet assessed'}</div>
                                            </div>
                                        </div>
                                        <div className="text-[10px] text-gray-500 mb-1">Observation Notes</div>
                                        <div className="text-white text-xs italic">"{selectedClaim.inspectionNotes || 'No notes provided by officer'}"</div>
                                    </div>

                                    {selectedClaim.status === 'disbursed' ? (
                                        <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-2xl text-center">
                                            <div className="text-4xl mb-2">✅</div>
                                            <h4 className="text-xl font-bold text-green-400">Funds Disbursed</h4>
                                            <div className="text-white text-lg font-black mt-2">₹{selectedClaim.approvedAmount}</div>
                                            <div className="text-xs text-gray-500 mt-1 font-mono">{selectedClaim.transactionRef}</div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="text-gray-400 text-sm mb-4">
                                                Reviewing claim validated by <span className="text-purple-400 font-bold">{selectedClaim.tahsildarName || 'Tahsildar'}</span>.
                                                The Tahsildar approved <span className="text-green-400 font-bold">₹{selectedClaim.tahsildarApprovedAmount?.toLocaleString('en-IN')}</span>.
                                            </div>
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-[10px] text-gray-500 mb-1.5 uppercase font-bold">APPROVED AMOUNT (ஒதுக்கப்பட்ட நிதி) ₹</label>
                                                    <input
                                                        type="number"
                                                        value={decision.amount}
                                                        onChange={e => setDecision(d => ({ ...d, amount: e.target.value }))}
                                                        className="agri-input"
                                                        placeholder={selectedClaim.tahsildarApprovedAmount?.toString() || selectedClaim.estimatedAmount?.toString()}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] text-gray-500 mb-1.5 uppercase font-bold">TRANSACTION REF / CHEQUE NO</label>
                                                    <input
                                                        type="text"
                                                        value={decision.txRef}
                                                        onChange={e => setDecision(d => ({ ...d, txRef: e.target.value }))}
                                                        className="agri-input font-mono"
                                                        placeholder="Optional: Auto-generated"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] text-gray-500 mb-1.5 uppercase font-bold">ADMIN APPROVAL NOTES</label>
                                                <textarea
                                                    value={decision.notes}
                                                    onChange={e => setDecision(d => ({ ...d, notes: e.target.value }))}
                                                    className="agri-input h-20"
                                                    placeholder="Final remarks..."
                                                />
                                            </div>
                                            <div className="flex gap-4">
                                                <button
                                                    onClick={() => setDecision(d => ({ ...d, approved: false }))}
                                                    className={`px-6 py-4 rounded-xl border font-bold ${!decision.approved ? 'bg-red-500/10 border-red-500 text-red-500' : 'border-white/5 text-gray-500'}`}
                                                >
                                                    Reject
                                                </button>
                                                <button
                                                    onClick={handleDecisionSubmit}
                                                    disabled={loading}
                                                    className="flex-1 bg-green-600 hover:bg-green-500 text-white font-black py-4 rounded-xl text-lg flex items-center justify-center gap-2"
                                                >
                                                    {loading ? <Loader2 className="animate-spin" /> : "Approve & Disburse Funds"}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            ) : (
                                <div className="glass-card p-12 text-center h-full flex flex-col items-center justify-center border-dashed border-white/5">
                                    <CreditCard className="w-16 h-16 text-gray-700 mb-4" />
                                    <h3 className="text-xl font-bold text-gray-500">Select a claim to review details</h3>
                                    <p className="text-sm text-gray-600">Pending applications from disaster zones</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function ChevronRight(props: any) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
}
