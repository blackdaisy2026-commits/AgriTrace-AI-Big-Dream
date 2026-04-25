"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRole } from "@/lib/role-context";
import Header from "@/components/Header";
import toast from "react-hot-toast";
import Link from "next/link";
import { apiRequest } from "@/lib/api";
import {
    QrCode, ShieldCheck, ShoppingCart, Loader2,
    Sprout, Award, CheckCircle, Minus, Plus, TrendingDown
} from "lucide-react";

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

function QtySelector({ available, value, onChange }: { available: number; value: number; onChange: (v: number) => void }) {
    const step = available >= 100 ? 10 : available >= 10 ? 5 : 1;
    return (
        <div className="flex items-center gap-2">
            <button onClick={() => onChange(Math.max(1, value - step))} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"><Minus className="w-3.5 h-3.5" /></button>
            <input type="number" value={value} min={1} max={available}
                onChange={e => { const v = Math.min(available, Math.max(1, Number(e.target.value))); onChange(isNaN(v) ? 1 : v); }}
                className="w-20 text-center bg-black/30 border border-white/10 rounded-lg text-white text-sm py-1.5 focus:outline-none focus:border-green-500/50" />
            <button onClick={() => onChange(Math.min(available, value + step))} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"><Plus className="w-3.5 h-3.5" /></button>
            <span className="text-xs text-gray-500">/ {available} kg</span>
        </div>
    );
}

export default function ConsumerDashboard() {
    const { user, token, isAuthenticated } = useRole();
    const [scanInput, setScanInput] = useState("");
    const [marketplace, setMarketplace] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [purchaseLoading, setPurchaseLoading] = useState<string | null>(null);
    const [purchaseSuccess, setPurchaseSuccess] = useState<any>(null);
    const [quantities, setQuantities] = useState<Record<string, number>>({});

    const getAvailable = (item: any) => {
        const total = item.batchRecordedWeight || item.quantityKg || 0;
        const sold = item.soldQuantityKg || 0;
        if (item.remainingQuantityKg !== undefined) return item.remainingQuantityKg;
        return Math.max(0, total - sold);
    };
    const getTotalWeight = (item: any) => item.batchRecordedWeight || item.quantityKg || 0;

    useEffect(() => {
        const fetchMarketplace = async () => {
            setLoading(true);
            try {
                const res = await apiRequest('/harvest/marketplace', 'GET');
                if (res.status === 'success') {
                    setMarketplace(res.data);
                    const init: Record<string, number> = {};
                    res.data.forEach((item: any) => {
                        const available = item.remainingQuantityKg ?? (item.batchRecordedWeight || item.quantityKg) - (item.soldQuantityKg || 0);
                        init[item._id] = Math.max(1, Math.min(available, 5));
                    });
                    setQuantities(init);
                }
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchMarketplace();
    }, []);

    const handlePurchase = async (item: any) => {
        const qty = quantities[item._id] || 1;
        const available = getAvailable(item);
        if (qty > available) { toast.error(`Only ${available}kg available!`); return; }
        const confirmed = window.confirm(
            `Buy ${qty}kg of ${item.cropType} from ${item.farmerName}?\n\nPrice: ₹${item.finalPricePerKg}/kg (Fixed)\nTotal: ₹${(item.finalPricePerKg * qty).toLocaleString('en-IN')}\nRemaining after: ${available - qty}kg`
        );
        if (!confirmed) return;
        setPurchaseLoading(item._id);
        try {
            const res = await apiRequest(`/harvest/${item._id}/purchase`, 'POST', { quantityKg: qty }, token);
            if (res.status === 'success') {
                const summary = res.data?.summary;
                toast.success(summary?.isSoldOut ? `✅ Bought ${qty}kg! Stock now SOLD OUT.` : `✅ Bought ${qty}kg! ${summary?.remainingStock}kg still available.`);
                setPurchaseSuccess({ ...res.data.purchase, _boughtQty: qty, _totalPaid: item.finalPricePerKg * qty });
                if (summary?.isSoldOut) {
                    setMarketplace(prev => prev.filter(m => m._id !== item._id));
                } else {
                    setMarketplace(prev => prev.map(m => {
                        if (m._id !== item._id) return m;
                        const newSold = (m.soldQuantityKg || 0) + qty;
                        const newRemaining = Math.max(0, getTotalWeight(m) - newSold);
                        return { ...m, soldQuantityKg: newSold, remainingQuantityKg: newRemaining, status: 'partially_sold' };
                    }));
                    setQuantities(prev => ({ ...prev, [item._id]: Math.min(summary?.remainingStock ?? 1, 5) }));
                }
            } else {
                toast.error(res.message || "Purchase failed");
            }
        } catch { toast.error("Network error"); }
        finally { setPurchaseLoading(null); }
    };

    if (!isAuthenticated || user?.role !== "consumer") {
        return (
            <div className="min-h-screen circuit-bg flex flex-col">
                <Header />
                <div className="flex-1 flex items-center justify-center">
                    <div className="glass-card p-8 text-center">
                        <h2 className="text-xl font-bold text-white mb-2">Consumer Access Required</h2>
                        <Link href="/login?role=consumer"><button className="btn-glow text-white mt-4 px-6 py-2 rounded-xl">Login as Consumer</button></Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen circuit-bg">
            <Header />
            <div className="max-w-4xl mx-auto px-4 py-8">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8 text-center">
                    <div className="text-6xl mb-4">👤</div>
                    <h1 className="text-3xl font-bold text-white mb-1">Know & Buy Your Food</h1>
                    <p className="text-gray-400">Verified crops from Tamil Nadu farmers · Fixed fair prices</p>
                </motion.div>

                {/* Scan Box */}
                <div className="glass-card p-6 mb-6">
                    <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                        <QrCode className="w-5 h-5 text-amber-400" /> Scan Product QR Code
                    </h2>
                    <Link href="/scan">
                        <motion.button whileTap={{ scale: 0.97 }} className="w-full py-6 rounded-2xl border-2 border-dashed border-amber-500/40 text-center hover:border-amber-500/80 transition-all mb-4 group">
                            <div className="text-5xl mb-2 group-hover:scale-110 transition-transform">📷</div>
                            <div className="text-white font-medium">Open Camera Scanner</div>
                            <div className="text-xs text-gray-500 mt-1">Point at product QR code</div>
                        </motion.button>
                    </Link>
                    <div className="flex gap-2">
                        <input value={scanInput} onChange={e => setScanInput(e.target.value)} placeholder="Or type batch ID..." className="agri-input" />
                        <Link href={`/trace/${scanInput || "TN-DEMO001"}`}>
                            <button className="px-4 py-2.5 btn-glow text-white rounded-xl text-sm">Go →</button>
                        </Link>
                    </div>
                </div>

                {/* Purchase Success */}
                {purchaseSuccess && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-6 mb-6 border-green-500/20 bg-green-500/5">
                        <div className="flex items-center gap-3 mb-4">
                            <CheckCircle className="w-8 h-8 text-green-400" />
                            <div>
                                <h3 className="font-bold text-green-400 text-lg">Purchase Confirmed!</h3>
                                <p className="text-xs text-gray-400 font-mono">{purchaseSuccess.purchaseRef}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                            <div className="bg-white/5 p-3 rounded-xl"><span className="text-gray-500">Crop:</span> <span className="text-white capitalize">{purchaseSuccess.cropType}</span></div>
                            <div className="bg-white/5 p-3 rounded-xl"><span className="text-gray-500">Qty:</span> <span className="text-white">{purchaseSuccess.purchaseQuantityKg}kg</span></div>
                            <div className="bg-white/5 p-3 rounded-xl"><span className="text-gray-500">Price:</span> <span className="text-white">₹{purchaseSuccess.finalPricePerKg}/kg</span></div>
                            <div className="bg-white/5 p-3 rounded-xl"><span className="text-gray-500">Total:</span> <span className="text-green-400 font-bold">₹{purchaseSuccess.purchaseTotalAmount?.toLocaleString('en-IN')}</span></div>
                        </div>
                        <button onClick={() => setPurchaseSuccess(null)} className="text-xs text-gray-500 hover:text-white transition-colors">Dismiss ×</button>
                    </motion.div>
                )}

                {/* Marketplace */}
                <div className="glass-card p-6 mb-6">
                    <h2 className="font-semibold text-white mb-2 flex items-center gap-2">
                        <Sprout className="w-5 h-5 text-green-400" /> Verified Fresh Produce
                    </h2>
                    <p className="text-xs text-gray-500 mb-4">
                        Every item is Agri Officer-certified and blockchain-verified. Prices are <b className="text-green-400">FIXED</b> to protect farmer income.
                    </p>

                    {loading ? (
                        <div className="text-center py-12">
                            <Loader2 className="w-8 h-8 text-gray-500 animate-spin mx-auto mb-2" />
                            <p className="text-gray-500">Loading marketplace...</p>
                        </div>
                    ) : marketplace.length === 0 ? (
                        <div className="text-center py-12">
                            <Sprout className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-gray-500">Marketplace empty</h3>
                            <p className="text-sm text-gray-600">New certified crops will appear here</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {marketplace.map((item) => (
                                <motion.div
                                    key={item._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-green-500/20 transition-all"
                                >
                                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h3 className="font-bold text-white text-lg capitalize">{item.cropType}</h3>
                                                {item.organicVerified && <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-900/30 text-green-400 border border-green-500/20">🌿 Organic</span>}
                                            </div>
                                            <div className="text-sm text-gray-400 mb-2">
                                                From <span className="text-white">{item.farmerName}</span> · {item.farmerDistrict}
                                            </div>
                                            <div className="flex flex-wrap gap-x-6 gap-y-3 mb-4 p-3 rounded-xl bg-green-500/5 border border-green-500/10">
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] text-gray-500 uppercase">Farmer & Contact</span>
                                                    <span className="text-white text-sm font-bold">{item.farmerName}</span>
                                                    <span className="text-green-400 text-xs">{item.farmerMobile}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] text-gray-500 uppercase">Origin</span>
                                                    <span className="text-white text-sm">{item.farmerVillage}</span>
                                                    <span className="text-gray-400 text-xs">{item.farmerTaluk}, {item.farmerDistrict}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] text-gray-500 uppercase">Verification</span>
                                                    <div className="text-white text-xs font-mono">ID: {item.farmerUzhavarCard || 'N/A'}</div>
                                                    <div className="text-blue-400 text-xs font-mono line-clamp-1">{item.certificationNo}</div>
                                                </div>
                                            </div>

                                            <div className="text-[10px] text-gray-500 mb-2 px-1">
                                                <span className="text-blue-400/80 uppercase mr-1 font-bold">Land:</span> {item.farmerLandDetails || 'Verified Agricultural Land'}
                                                <span className="mx-2 text-gray-700">|</span>
                                                <span className="text-amber-400/80 uppercase mr-1 font-bold">Crop Context:</span> {item.farmerCropDetails || 'Certified Fresh Produce'}
                                            </div>

                                            <div className="mt-3 mb-2">
                                                <StockBar total={item.batchRecordedWeight || item.quantityKg || 0} sold={item.soldQuantityKg || 0} />
                                            </div>

                                            <div className="flex flex-wrap gap-2 text-[10px]">
                                                <span className="bg-white/5 px-2 py-1 rounded-lg text-gray-200 font-bold border border-white/5">
                                                    📦 {getAvailable(item)}kg available
                                                </span>
                                                <span className="bg-white/5 px-2 py-1 rounded-lg text-green-400 font-bold border border-green-500/20">⭐ Grade {item.qualityGrade}</span>
                                                {item.status === 'partially_sold' && (
                                                    <span className="px-2 py-1 rounded-lg text-amber-400 border border-amber-500/20 bg-amber-500/5">⚡ Partially Available</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex sm:flex-col items-start sm:items-end justify-between gap-3 min-w-[160px]">
                                            <div className="text-right">
                                                <div className="text-[10px] text-gray-500 uppercase font-bold">Fixed Price</div>
                                                <div className="text-2xl font-black text-green-400">₹{item.finalPricePerKg}<span className="text-xs font-normal text-gray-400">/kg</span></div>
                                                <div className="text-[10px] text-gray-500 mt-0.5">
                                                    Total: <span className="text-green-400 font-bold">₹{(item.finalPricePerKg * (quantities[item._id] || 1)).toLocaleString('en-IN')}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] text-gray-500 mb-1">Qty (kg)</div>
                                                <QtySelector
                                                    available={getAvailable(item)}
                                                    value={quantities[item._id] || 1}
                                                    onChange={v => setQuantities(prev => ({ ...prev, [item._id]: v }))}
                                                />
                                            </div>
                                            <button
                                                onClick={() => handlePurchase(item)}
                                                disabled={purchaseLoading === item._id || getAvailable(item) <= 0}
                                                className="bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-2.5 px-5 rounded-xl flex items-center gap-2 transition-colors text-sm w-full justify-center"
                                            >
                                                {purchaseLoading === item._id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <><ShoppingCart className="w-4 h-4" /> Buy {quantities[item._id] || 1}kg</>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Verification Features */}
                <div className="glass-card p-5">
                    <h2 className="font-semibold text-white mb-3">What You Can Verify</h2>
                    <div className="space-y-2">
                        {[
                            { icon: <ShieldCheck className="w-4 h-4 text-green-400" />, text: "Agri Officer-certified quality & organic status" },
                            { icon: <Sprout className="w-4 h-4 text-emerald-400" />, text: "Farm origin, farmer name, GPS location" },
                            { icon: <CheckCircle className="w-4 h-4 text-amber-400" />, text: "Fair fixed price — protects farmer income" },
                            { icon: <Award className="w-4 h-4 text-blue-400" />, text: "Unique certification number per crop" },
                            { icon: "🔗", text: "Blockchain verified, tamper-proof" },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3 text-sm text-gray-300">
                                {typeof item.icon === "string" ? <span>{item.icon}</span> : item.icon}
                                <span>{item.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
