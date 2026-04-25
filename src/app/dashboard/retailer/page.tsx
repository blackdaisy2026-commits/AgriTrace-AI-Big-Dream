"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRole } from "@/lib/role-context";
import Header from "@/components/Header";
import toast from "react-hot-toast";
import Link from "next/link";
import { apiRequest } from "@/lib/api";
import {
    QrCode, Package, Sprout, Award, ShoppingCart, Loader2,
    ShieldCheck, Minus, Plus, AlertCircle, CheckCircle, TrendingDown
} from "lucide-react";

// ─── Stock Bar Component ───────────────────────────────────────────────────────
function StockBar({ total, sold }: { total: number; sold: number }) {
    const remaining = Math.max(0, total - sold);
    const pct = total > 0 ? Math.round((remaining / total) * 100) : 0;
    const color = pct > 60 ? 'bg-green-500' : pct > 25 ? 'bg-amber-500' : 'bg-red-500';
    return (
        <div className="w-full">
            <div className="flex justify-between text-[10px] mb-1">
                <span className="text-gray-500">Stock remaining</span>
                <span className={`font-bold ${pct > 60 ? 'text-green-400' : pct > 25 ? 'text-amber-400' : 'text-red-400'}`}>{remaining}kg left</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
            </div>
            <div className="text-[9px] text-gray-600 mt-0.5">Total: {total}kg · Sold: {sold}kg</div>
        </div>
    );
}

// ─── Quantity Selector ─────────────────────────────────────────────────────────
function QtySelector({ available, value, onChange }: { available: number; value: number; onChange: (v: number) => void }) {
    const step = available >= 100 ? 10 : available >= 10 ? 5 : 1;
    const dec = () => onChange(Math.max(1, value - step));
    const inc = () => onChange(Math.min(available, value + step));
    return (
        <div className="flex items-center gap-2 mt-2">
            <button onClick={dec} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"><Minus className="w-3.5 h-3.5" /></button>
            <input
                type="number"
                value={value}
                min={1}
                max={available}
                onChange={e => {
                    const v = Math.min(available, Math.max(1, Number(e.target.value)));
                    onChange(isNaN(v) ? 1 : v);
                }}
                className="w-20 text-center bg-black/30 border border-white/10 rounded-lg text-white text-sm py-1.5 focus:outline-none focus:border-green-500/50"
            />
            <button onClick={inc} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"><Plus className="w-3.5 h-3.5" /></button>
            <span className="text-xs text-gray-500">/ {available} kg max</span>
        </div>
    );
}

export default function RetailerDashboard() {
    const { user, token, isAuthenticated } = useRole();
    const [activeTab, setActiveTab] = useState<'marketplace' | 'inventory'>('marketplace');
    const [scanInput, setScanInput] = useState("");
    const [liveInventory, setLiveInventory] = useState<any[]>([]);
    const [marketplace, setMarketplace] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [purchaseLoading, setPurchaseLoading] = useState<string | null>(null);
    // Per-item quantity state
    const [quantities, setQuantities] = useState<Record<string, number>>({});

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            try {
                const mpRes = await apiRequest('/harvest/marketplace', 'GET');
                if (mpRes.status === 'success') {
                    setMarketplace(mpRes.data);
                    // Initialize quantities to 1 for each item
                    const init: Record<string, number> = {};
                    mpRes.data.forEach((item: any) => {
                        const available = item.remainingQuantityKg ?? (item.batchRecordedWeight || item.quantityKg) - (item.soldQuantityKg || 0);
                        init[item._id] = Math.min(available, 10);
                    });
                    setQuantities(init);
                }
                if (token) {
                    const invRes = await apiRequest('/batches', 'GET', null, token);
                    if (invRes.status === 'success') {
                        setLiveInventory(invRes.data.map((b: any) => ({
                            id: b.batchId, crop: b.cropType, qty: `${b.weightKg} kg`,
                            origin: b.district, grade: 'A', organic: b.isOrganic,
                            status: b.currentStage === 'Sold' ? 'Sold' : 'In Stock'
                        })));
                    }
                }
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchAll();
    }, [token]);

    const getAvailable = (item: any) => {
        const total = item.batchRecordedWeight || item.quantityKg || 0;
        const sold = item.soldQuantityKg || 0;
        if (item.remainingQuantityKg !== undefined) return item.remainingQuantityKg;
        return Math.max(0, total - sold);
    };

    const getTotalWeight = (item: any) => item.batchRecordedWeight || item.quantityKg || 0;

    const handlePurchase = async (item: any) => {
        const qty = quantities[item._id] || 1;
        const available = getAvailable(item);
        if (qty > available) {
            toast.error(`Only ${available}kg available!`);
            return;
        }
        const totalAmt = (item.finalPricePerKg * qty).toLocaleString('en-IN');
        const confirmed = window.confirm(
            `Purchase ${qty}kg of ${item.cropType} at ₹${item.finalPricePerKg}/kg?\n\nTotal: ₹${totalAmt}\n\nRemaining after purchase: ${available - qty}kg\n\n(Price is FIXED — cannot be modified)`
        );
        if (!confirmed) return;

        setPurchaseLoading(item._id);
        try {
            const res = await apiRequest(`/harvest/${item._id}/purchase`, 'POST', { quantityKg: qty }, token);
            if (res.status === 'success') {
                const summary = res.data?.summary;
                if (summary?.isSoldOut) {
                    toast.success(`✅ Purchased ${qty}kg! 🔒 This crop is now SOLD OUT.`);
                    // Remove from marketplace
                    setMarketplace(prev => prev.filter(m => m._id !== item._id));
                } else {
                    toast.success(`✅ Purchased ${qty}kg! Remaining stock: ${summary?.remainingStock ?? '?'}kg`);
                    // Update remaining quantity in-place
                    setMarketplace(prev => prev.map(m => {
                        if (m._id !== item._id) return m;
                        const newSold = (m.soldQuantityKg || 0) + qty;
                        const newRemaining = Math.max(0, getTotalWeight(m) - newSold);
                        return { ...m, soldQuantityKg: newSold, remainingQuantityKg: newRemaining, status: 'partially_sold' };
                    }));
                    setQuantities(prev => ({ ...prev, [item._id]: Math.min(summary?.remainingStock ?? 1, 10) }));
                }
            } else {
                toast.error(res.message || "Purchase failed");
            }
        } catch (err) {
            toast.error("Network error");
        } finally {
            setPurchaseLoading(null);
        }
    };

    if (!isAuthenticated || user?.role !== "retailer") {
        return (
            <div className="min-h-screen circuit-bg flex flex-col">
                <Header />
                <div className="flex-1 flex items-center justify-center">
                    <div className="glass-card p-8 text-center">
                        <h2 className="text-xl font-bold text-white mb-2">Retailer Access Required</h2>
                        <Link href="/login?role=retailer"><button className="btn-glow text-white mt-4 px-6 py-2 rounded-xl">Login as Retailer</button></Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen circuit-bg">
            <Header />
            <div className="max-w-5xl mx-auto px-4 py-8">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>🏪 Retailer Dashboard</h1>
                        <p className="text-gray-400">Welcome, <span className="text-purple-400">{user?.name}</span></p>
                    </div>
                    <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                        <button onClick={() => setActiveTab('marketplace')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'marketplace' ? 'bg-green-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>
                            <Sprout className="w-4 h-4" /> Marketplace
                        </button>
                        <button onClick={() => setActiveTab('inventory')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'inventory' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>
                            <Package className="w-4 h-4" /> Inventory
                        </button>
                    </div>
                </motion.div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    {[
                        { label: "For Sale", value: marketplace.length, icon: <Sprout className="w-5 h-5 text-green-400" /> },
                        { label: "Partial Stock", value: marketplace.filter(m => m.status === 'partially_sold').length, icon: <TrendingDown className="w-5 h-5 text-amber-400" /> },
                        { label: "Certified", value: marketplace.filter(m => m.certificationNo).length, icon: <Award className="w-5 h-5 text-blue-400" /> },
                    ].map((s, i) => (
                        <div key={i} className="glass-card p-4 text-center">
                            <div className="flex justify-center mb-1">{s.icon}</div>
                            <div className="text-2xl font-bold text-white">{s.value}</div>
                            <div className="text-xs text-gray-500">{s.label}</div>
                        </div>
                    ))}
                </div>

                {activeTab === 'marketplace' ? (
                    <div className="glass-card p-5 mb-6">
                        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                            <h2 className="font-semibold text-white flex items-center gap-2">
                                <Sprout className="w-5 h-5 text-green-400" /> Verified Crop Marketplace
                            </h2>
                            <span className="text-[10px] text-amber-400 border border-amber-500/20 bg-amber-500/10 px-2 py-1 rounded-full">
                                💰 Fixed Prices — Partial Purchase Allowed
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 mb-5">
                            Purchase any quantity up to the available stock. Remaining stock stays listed until fully sold.
                        </p>

                        {loading ? (
                            <div className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin text-green-400 mx-auto mb-2" /><p className="text-gray-500 text-sm">Loading marketplace...</p></div>
                        ) : marketplace.length === 0 ? (
                            <div className="text-center py-12">
                                <Sprout className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-gray-500">No crops available</h3>
                                <p className="text-sm text-gray-600">Crops appear after farmer records batch.</p>
                            </div>
                        ) : (
                            <div className="space-y-5">
                                {marketplace.map((item) => {
                                    const totalW = getTotalWeight(item);
                                    const available = getAvailable(item);
                                    const qty = quantities[item._id] || 1;
                                    const isPartial = item.status === 'partially_sold';
                                    const totalForThis = item.finalPricePerKg * qty;

                                    return (
                                        <motion.div
                                            key={item._id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`p-5 rounded-2xl border transition-all ${isPartial ? 'bg-amber-500/5 border-amber-500/20' : 'bg-white/5 border-white/10 hover:border-green-500/30'}`}
                                        >
                                            {/* Header row */}
                                            <div className="flex flex-wrap items-start gap-2 mb-3">
                                                <h3 className="font-black text-white text-xl capitalize">{item.cropType}</h3>
                                                {item.cropVariety && <span className="text-xs text-gray-400 mt-1">({item.cropVariety})</span>}
                                                {item.organicVerified && <span className="badge-organic text-[10px]">🌿 Organic</span>}
                                                {item.isFairTrade && <span className="badge-verified text-[10px]">⭐ Fair Trade</span>}
                                                {isPartial && (
                                                    <span className="ml-auto text-[10px] px-2 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                                        ⚡ Partially Sold — {available}kg remaining
                                                    </span>
                                                )}
                                            </div>

                                            {/* Info grid */}
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] mb-3">
                                                <div className="bg-white/5 px-2 py-1.5 rounded-lg border border-white/5">
                                                    <span className="text-gray-500 block text-[9px] uppercase">Farmer</span>
                                                    <span className="text-white font-bold">{item.farmerName}</span>
                                                    <div className="text-blue-400">{item.farmerMobile}</div>
                                                </div>
                                                <div className="bg-white/5 px-2 py-1.5 rounded-lg border border-white/5">
                                                    <span className="text-gray-500 block text-[9px] uppercase">Location</span>
                                                    <div className="text-white truncate">{item.farmerVillage}</div>
                                                    <div className="text-gray-400 truncate">{item.farmerDistrict}</div>
                                                </div>
                                                <div className="bg-white/5 px-2 py-1.5 rounded-lg border border-white/5">
                                                    <span className="text-gray-500 block text-[9px] uppercase">Quality</span>
                                                    <div className="text-green-400 font-bold">Grade {item.qualityGrade}</div>
                                                    <div className="text-gray-400">{item.certificationNo}</div>
                                                </div>
                                                <div className="bg-white/5 px-2 py-1.5 rounded-lg border border-white/5">
                                                    <span className="text-gray-500 block text-[9px] uppercase">Batch</span>
                                                    <div className="text-purple-400 font-mono text-[10px]">{item.batchId}</div>
                                                    <div className="text-gray-500">{item.blockchainEvents?.length || 0} chain events</div>
                                                </div>
                                            </div>

                                            {/* Stock bar */}
                                            <div className="mb-4">
                                                <StockBar total={totalW} sold={item.soldQuantityKg || 0} />
                                            </div>

                                            {/* Purchase section */}
                                            <div className="flex flex-wrap md:flex-nowrap items-end justify-between gap-4 pt-3 border-t border-white/10">
                                                <div className="flex-1">
                                                    <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Select Quantity to Purchase</div>
                                                    <QtySelector
                                                        available={available}
                                                        value={qty}
                                                        onChange={v => setQuantities(prev => ({ ...prev, [item._id]: v }))}
                                                    />
                                                    <div className="mt-2 text-[11px] text-gray-400">
                                                        Total: <span className="text-green-400 font-bold text-base">₹{totalForThis.toLocaleString('en-IN')}</span>
                                                        <span className="text-gray-600 ml-1">({qty}kg × ₹{item.finalPricePerKg}/kg)</span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    <div className="text-right">
                                                        <div className="text-[10px] text-gray-500 uppercase">Fixed Price</div>
                                                        <div className="text-3xl font-black text-green-400">₹{item.finalPricePerKg}</div>
                                                        <div className="text-xs text-gray-500">per kg</div>
                                                    </div>
                                                    <button
                                                        onClick={() => handlePurchase(item)}
                                                        disabled={purchaseLoading === item._id || available <= 0}
                                                        className="bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-green-900/30 min-w-[160px] justify-center"
                                                    >
                                                        {purchaseLoading === item._id ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <><ShoppingCart className="w-4 h-4" /> Buy {qty}kg</>
                                                        )}
                                                    </button>
                                                    <Link href={`/trace/${item.batchId || item.applicationId}`}>
                                                        <button className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                                                            🔍 View Blockchain Trail →
                                                        </button>
                                                    </Link>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="glass-card p-5 mb-6">
                            <h2 className="font-semibold text-white mb-2 flex items-center gap-2">
                                <QrCode className="w-5 h-5 text-purple-400" /> QR Lookup
                            </h2>
                            <div className="flex gap-2">
                                <input value={scanInput} onChange={e => setScanInput(e.target.value)} placeholder="Enter batch ID or scan QR..." className="agri-input" />
                                <Link href={`/trace/${scanInput || "TN-DEMO001"}`}>
                                    <button className="px-4 py-2.5 btn-glow text-white rounded-xl text-sm whitespace-nowrap">Search →</button>
                                </Link>
                            </div>
                        </div>
                        <div className="glass-card p-5">
                            <h2 className="font-semibold text-white mb-4">📦 Current Inventory</h2>
                            <div className="space-y-3">
                                {liveInventory.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8">No inventory. Purchase crops from the Marketplace.</p>
                                ) : liveInventory.map((item, i) => (
                                    <motion.div key={item.id || i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                                        className="flex flex-wrap md:flex-nowrap items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 gap-3">
                                        <div>
                                            <div className="font-semibold text-white capitalize">{item.crop}</div>
                                            <div className="text-xs text-gray-400">{item.id} · {item.origin} · {item.qty}</div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {item.organic && <span className="badge-organic text-[10px]">🌿 Organic</span>}
                                            <span className="badge-verified text-[10px]">Grade {item.grade}</span>
                                            <Link href={`/trace/${item.id}`}>
                                                <button className="text-xs text-blue-400 hover:underline">Trace →</button>
                                            </Link>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
