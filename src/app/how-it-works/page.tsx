"use client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import Link from "next/link";
import {
    UserPlus, LogIn, FileText, Camera, Cpu, Eye,
    CheckCircle, ChevronRight, Leaf, ArrowRight
} from "lucide-react";

const steps = [
    {
        step: "படி 1",
        icon: <LogIn className="w-8 h-8" />,
        title: "உள்நுழைவு அல்லது புதிய கணக்கு உருவாக்கவும்",
        shortTitle: "உள்நுழைவு / பதிவு",
        color: "text-green-400",
        bg: "bg-green-500/10",
        border: "border-green-500/30",
        glow: "shadow-green-500/10",
        details: [
            "உங்கள் கணினி அல்லது மொபைலில் AgriTraceIndia இணையதளத்தை திறக்கவும்.",
            "நீங்கள் முதல் முறை பயன்படுத்துகிறீர்களா? 'பதிவு செய்க' என்ற பொத்தானை அழுத்தவும்.",
            "ஏற்கனவே கணக்கு இருந்தால் உங்கள் மின்னஞ்சல் மற்றும் கடவுச்சொல்லை உள்ளிட்டு உள்நுழைக.",
            "உங்கள் பணிப்பொறுப்பை தேர்ந்தெடுக்கவும் — விவசாயி (Farmer) என்பதை தேர்வு செய்யவும்.",
        ],
        tip: "💡 உதவிக்குறிப்பு: உங்கள் மின்னஞ்சல் முகவரியை சரியாக உள்ளிடவும். பின்னர் கடவுச்சொல் மறந்தால் அதன் மூலம் மீட்டெடுக்கலாம்.",
        cta: { label: "இப்போதே பதிவு செய்க", href: "/login" },
    },
    {
        step: "படி 2",
        icon: <FileText className="w-8 h-8" />,
        title: "உங்கள் விவரங்களை பதிவு செய்யவும்",
        shortTitle: "விவசாயி விவரம்",
        color: "text-blue-400",
        bg: "bg-blue-500/10",
        border: "border-blue-500/30",
        glow: "shadow-blue-500/10",
        details: [
            "உங்கள் முழு பெயர் மற்றும் உழவர் அட்டை எண்ணை (Uzhavar Attai Number) உள்ளிடவும்.",
            "நீங்கள் வசிக்கும் மாவட்டம் மற்றும் வட்டத்தை (District & Taluk) தேர்ந்தெடுக்கவும்.",
            "உங்கள் நிலம் பற்றிய விவரங்களை பதிவு செய்யுங்கள் — எத்தனை ஏக்கர், நிலத்தின் வகை.",
            "தொலைபேசி எண்ணை உள்ளிட்டு கணக்கை பதிவு செய்யவும்.",
        ],
        tip: "💡 உதவிக்குறிப்பு: உழவர் அட்டை எண் இல்லாமல் விவசாயியின் கணக்கு சரிபார்க்கப்பட மாட்டாது. அரசாங்க திட்டங்களின் பயன் கிடைக்காது.",
    },
    {
        step: "படி 3",
        icon: <Leaf className="w-8 h-8" />,
        title: "பயிர் பற்றிய தகவல்களை பதிவு செய்யவும்",
        shortTitle: "பயிர் விவரம்",
        color: "text-emerald-400",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/30",
        glow: "shadow-emerald-500/10",
        details: [
            "உங்கள் Dashboard-ல் 'புதிய அறுவடை பதிவு செய்' என்ற பொத்தானை அழுத்தவும்.",
            "பயிரின் பெயரை உள்ளிடவும் — உதாரணம்: நெல், கோதுமை, வாழை, தக்காளி.",
            "பயிர் விதைத்த தேதி மற்றும் அறுவடை செய்யும் தேதியை பதிவு செய்யவும்.",
            "தரம் (Grade), எடை (Weight), மற்றும் சேமிக்கப்படும் இடத்தை குறிப்பிடவும்.",
            "தேவைப்பட்டால் குரல் மூலம் (🎤 Voice Input) தமிழிலும் பதிவு செய்யலாம்!",
        ],
        tip: "💡 உதவிக்குறிப்பு: ஒவ்வொரு பயிர் பதிவும் Blockchain-ல் பூட்டப்பட்டு பாதுகாக்கப்படுகிறது. யாரும் மாற்ற முடியாது!",
    },
    {
        step: "படி 4",
        icon: <Camera className="w-8 h-8" />,
        title: "பயிரின் புகைப்படத்தை பதிவேற்றவும்",
        shortTitle: "படம் பதிவேற்று",
        color: "text-amber-400",
        bg: "bg-amber-500/10",
        border: "border-amber-500/30",
        glow: "shadow-amber-500/10",
        details: [
            "'புகைப்படம் பதிவேற்று' என்ற பொத்தானை அழுத்தவும்.",
            "உங்கள் மொபைல் கேமராவை பயிரை நோக்கி திருப்பி தெளிவான படம் எடுக்கவும்.",
            "பயிர் நோய் இருந்தால் அந்த பாதிக்கப்பட்ட இலை அல்லது தண்டின் படத்தை எடுக்கவும்.",
            "படத்தை பதிவேற்றிய பிறகு 'பகுப்பாய்வு செய்' என்ற பொத்தானை அழுத்தவும்.",
        ],
        tip: "💡 உதவிக்குறிப்பு: நல்ல வெளிச்சத்தில் படம் எடுக்கவும். தெளிவான படம் இருந்தால் AI சரியான பகுப்பாய்வு வழங்கும்.",
    },
    {
        step: "படி 5",
        icon: <Cpu className="w-8 h-8" />,
        title: "கணினி தகவல்களை பகுப்பாய்வு செய்யும்",
        shortTitle: "AI பகுப்பாய்வு",
        color: "text-purple-400",
        bg: "bg-purple-500/10",
        border: "border-purple-500/30",
        glow: "shadow-purple-500/10",
        details: [
            "நீங்கள் பதிவேற்றிய படம் மற்றும் தகவல்களை கணினி (AI) பகுப்பாய்வு செய்யும்.",
            "பயிரில் நோய் இருந்தால் கணினி உடனே கண்டறிந்து அறிவிக்கும்.",
            "இந்த தகவல்கள் Blockchain-ல் பதிவு செய்யப்பட்டு ஒரு தனித்துவமான QR Code உருவாக்கப்படும்.",
            "உங்கள் வட்டத்தில் (Taluk) உள்ள அங்கீகரிக்கப்பட்ட வேளாண்மை அதிகாரி (Agri Officer) தரச்சோதனை மேற்கொண்டு சான்றளிப்பார்.",
        ],
        tip: "💡 உதவிக்குறிப்பு: பகுப்பாய்வு சில நிமிடங்கள் ஆகலாம். காத்திருக்கவும் — நெட்ஒர்க் இல்லாத நேரத்திலும் தகவல் சேமிக்கப்படும்!",
    },
    {
        step: "படி 6",
        icon: <Eye className="w-8 h-8" />,
        title: "முடிவுகள் மற்றும் ஆலோசனைகளை பாருங்கள்",
        shortTitle: "முடிவு & ஆலோசனை",
        color: "text-pink-400",
        bg: "bg-pink-500/10",
        border: "border-pink-500/30",
        glow: "shadow-pink-500/10",
        details: [
            "உங்கள் Dashboard-ல் 'என் பயிர்கள்' பிரிவில் பகுப்பாய்வு முடிவுகளை பாருங்கள்.",
            "பயிரின் ஆரோக்கியம், தரம், மற்றும் சேமித்து வைக்கும் ஆலோசனைகள் காட்டப்படும்.",
            "QR Code-ஐ பதிவிறக்கி உங்கள் பொருளில் ஒட்டுங்கள் — வாடிக்கையாளர்கள் scan செய்து அனைத்தையும் காணலாம்.",
            "தேவைப்பட்டால் ஆலோசனைகளை Tamil-ல் குரல் மூலம் கேட்கலாம் (🔊 Text to Speech).",
        ],
        tip: "💡 உதவிக்குறிப்பு: இந்த QR Code-ல் உங்கள் பயிரின் முழு வரலாறும் இருக்கும். விலை நிர்ணயத்தில் இது உதவும்!",
        cta: { label: "Dashboard-ஐ பாருங்கள்", href: "/login" },
    },
];

export default function HowItWorks() {
    return (
        <div className="min-h-screen circuit-bg">
            <Header />

            <main className="pt-24 pb-20 px-4">
                <div className="max-w-5xl mx-auto">

                    {/* Hero */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-16"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-semibold mb-6">
                            <Leaf className="w-4 h-4" />
                            விவசாயிகளுக்கான வழிகாட்டி
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-white mb-4" style={{ fontFamily: "Outfit, sans-serif" }}>
                            எப்படி பயன்படுத்துவது?
                        </h1>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
                            AgriTraceIndia கணினியை பயன்படுத்துவது மிகவும் எளிது!
                            <br />
                            <span className="text-green-400 font-semibold">கீழே உள்ள படிகளை பின்பற்றுங்கள்.</span>
                        </p>

                        {/* Progress dots */}
                        <div className="flex items-center justify-center gap-2 mt-8">
                            {steps.map((_, i) => (
                                <div
                                    key={i}
                                    className="w-2 h-2 rounded-full bg-green-500/40"
                                />
                            ))}
                        </div>
                    </motion.div>

                    {/* Steps — Vertical Timeline */}
                    <div className="relative">
                        {/* Vertical line */}
                        <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-green-500/40 via-green-500/10 to-transparent hidden sm:block" />

                        <div className="space-y-10">
                            {steps.map((step, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.07 }}
                                    className={`relative flex flex-col md:flex-row gap-6 items-start ${i % 2 !== 0 ? "md:flex-row-reverse" : ""}`}
                                >
                                    {/* Step number bubble — center on desktop */}
                                    <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 top-6 z-10 w-10 h-10 rounded-full bg-black border-2 border-green-500/40 items-center justify-center text-green-400 text-xs font-black">
                                        {i + 1}
                                    </div>

                                    {/* Card */}
                                    <div className={`w-full md:w-[calc(50%-2.5rem)] glass-card p-6 md:p-8 border ${step.border} shadow-xl ${step.glow}`}>
                                        {/* Badge */}
                                        <div className="flex items-center gap-3 mb-5">
                                            <div className={`w-14 h-14 rounded-2xl ${step.bg} ${step.color} flex items-center justify-center border border-white/5 shrink-0`}>
                                                {step.icon}
                                            </div>
                                            <div>
                                                <span className={`text-xs font-black uppercase tracking-widest ${step.color} opacity-70`}>{step.step}</span>
                                                <h2 className="text-lg md:text-xl font-black text-white leading-tight mt-0.5" style={{ fontFamily: "Outfit, sans-serif" }}>
                                                    {step.title}
                                                </h2>
                                            </div>
                                        </div>

                                        {/* Detail list */}
                                        <ul className="space-y-3 mb-5">
                                            {step.details.map((d, j) => (
                                                <li key={j} className="flex items-start gap-2.5 text-gray-300 text-sm leading-relaxed">
                                                    <CheckCircle className={`w-4 h-4 mt-0.5 shrink-0 ${step.color}`} />
                                                    {d}
                                                </li>
                                            ))}
                                        </ul>

                                        {/* Tip */}
                                        <div className={`p-3 rounded-xl ${step.bg} border ${step.border} text-xs text-gray-400 leading-relaxed`}>
                                            {step.tip}
                                        </div>

                                        {/* CTA */}
                                        {step.cta && (
                                            <Link href={step.cta.href} className="mt-5 flex items-center gap-2 group w-fit">
                                                <span className={`text-sm font-bold ${step.color} group-hover:underline`}>{step.cta.label}</span>
                                                <ChevronRight className={`w-4 h-4 ${step.color} group-hover:translate-x-1 transition-transform`} />
                                            </Link>
                                        )}
                                    </div>

                                    {/* Spacer for opposite side */}
                                    <div className="hidden md:block w-[calc(50%-2.5rem)]" />
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Bottom CTA Banner */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mt-20 glass-card p-8 md:p-12 text-center border border-green-500/20 bg-gradient-to-br from-green-900/20 to-emerald-900/10"
                    >
                        <div className="text-5xl mb-4">🌾</div>
                        <h2 className="text-3xl font-black text-white mb-3" style={{ fontFamily: "Outfit, sans-serif" }}>
                            தயாரா? இப்போதே தொடங்குங்கள்!
                        </h2>
                        <p className="text-gray-400 max-w-xl mx-auto mb-8 leading-relaxed">
                            உங்கள் விவசாய பொருட்கள் Blockchain-ல் பதிவாகி, வாடிக்கையாளர்கள் நம்பிக்கையுடன் வாங்குவார்கள்.
                            AgriTraceIndia — தமிழக விவசாயிகளுக்காக உருவாக்கப்பட்ட கணினி!
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/login?role=farmer">
                                <button className="btn-glow text-white font-bold py-4 px-8 rounded-2xl flex items-center gap-2 text-lg">
                                    <UserPlus className="w-5 h-5" />
                                    இப்போதே பதிவு செய்க
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </Link>
                            <Link href="/trace/TN-DEMO001">
                                <button className="py-4 px-8 rounded-2xl font-bold text-lg border border-white/10 bg-white/5 hover:bg-white/10 text-gray-300 transition-all flex items-center gap-2">
                                    🔍 Demo பாருங்கள்
                                </button>
                            </Link>
                        </div>

                        {/* Mini feature tags */}
                        <div className="flex flex-wrap justify-center gap-3 mt-8">
                            {["✅ தமிழில் குரல் உள்ளீடு", "🔒 Blockchain பாதுகாப்பு", "📱 மொபைலில் பயன்படுத்தலாம்", "🆓 முற்றிலும் இலவசம்", "🌐 Internet இல்லாமலும் வேலைசெய்யும்"].map((tag, i) => (
                                <span key={i} className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-gray-400">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
