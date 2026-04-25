"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    MessageSquare, Mic, MicOff, Send, X, Bot,
    Volume2, VolumeX, Sparkles, TrendingUp, ChevronRight,
    RefreshCw, Leaf, Shield, IndianRupee, Clock, HelpCircle
} from "lucide-react";
import toast from "react-hot-toast";

// ─── Types ─────────────────────────────────────────────────────────────────────
interface Message {
    id: string;
    text: string;
    sender: 'bot' | 'user';
    timestamp: Date;
    card?: PriceCard | InfoCard;
    typing?: boolean;
}

interface PriceCard {
    type: 'price';
    crop: string;
    emoji: string;
    min: number;
    max: number;
    modal: number;
    district: string;
    market: string;
}

interface InfoCard {
    type: 'info';
    title: string;
    items: { icon: string; label: string; desc: string }[];
}

// ─── Crop Emoji Map ────────────────────────────────────────────────────────────
const CROP_EMOJI: Record<string, string> = {
    tomato: "🍅", "தக்காளி": "🍅",
    banana: "🍌", "வாழை": "🍌", "வாழைப்பழம்": "🍌",
    rice: "🌾", "நெல்": "🌾", "அரிசி": "🌾",
    mango: "🥭", "மாம்பழம்": "🥭", "மாம்": "🥭",
    onion: "🧅", "வெங்காயம்": "🧅",
    garlic: "🧄", "பூண்டு": "🧄",
    potato: "🥔", "உருளைக்கிழங்கு": "🥔",
    brinjal: "🍆", "கத்தரிக்காய்": "🍆",
    chilli: "🌶️", "மிளகாய்": "🌶️",
    coconut: "🥥", "தேங்காய்": "🥥",
    beans: "🫘", "பீன்ஸ்": "🫘",
    "bitter gourd": "🥒", "பாகல்": "🥒",
    "bottle gourd": "🫙", "சுரைக்காய்": "🫙",
    drumstick: "🫁", "முருங்கைக்காய்": "🌿",
    pumpkin: "🎃", "பூசணி": "🎃",
    cucumber: "🥒", "வெள்ளரிக்காய்": "🥒",
    ladyfinger: "🥬", "வெண்டை": "🥬",
    sugarcane: "🎋", "கரும்பு": "🎋",
    turmeric: "🌿", "மஞ்சள்": "🌿",
    groundnut: "🥜", "நிலக்கடலை": "🥜",
    maize: "🌽", "சோளம்": "🌽",
    wheat: "🌾", "கோதுமை": "🌾",
    cotton: "🌿", "பருத்தி": "🌿",
    beetroot: "🫚", "பீட்ரூட்": "🫚",
    carrot: "🥕", "கேரட்": "🥕",
    radish: "🫔", "முள்ளங்கி": "🥬",
};

// ─── Knowledge Base ─────────────────────────────────────────────────────────────
const KNOWLEDGE: Array<{
    keywords: string[];
    response: string;
    card?: 'workflow' | 'relief' | 'blockchain' | 'roles';
}> = [
        // Greetings
        {
            keywords: ["வணக்கம்", "hello", "hi", "hai", "help", "உதவி", "start", "தொடர்", "welcome"],
            response: "வணக்கம்! 🙏 நான் AgriTraceIndia-ன் AI உதவியாளர். நான் உங்களுக்கு:\n• சந்தை விலை கேட்கலாம் (\"தக்காளி விலை எவ்வளவு?\")\n• System அல்லது workflow பற்றி கேட்கலாம்\n• Relief fund, blockchain, QR trace பற்றி கேட்கலாம்\n\nHello! I'm AgriTraceIndia's AI Assistant. Ask me about crop prices, system operations, relief funds, or blockchain tracing!"
        },

        // Price queries
        {
            keywords: ["விலை", "price", "rate", "எவ்வளவு", "சந்தை", "market", "cost", "costs"],
            response: "PRICE_QUERY"
        },

        // Harvest application
        {
            keywords: ["அறுவடை", "harvest", "submit", "விண்ணப்பம்", "apply", "application", "பதிவு", "register"],
            response: "🌾 அறுவடை விண்ணப்பம் செய்வது எப்படி? | How to apply for Harvest?\n\n📋 படிகள் | Steps:\n1️⃣ Farmer Dashboard → 'Submit Harvest' கிளிக் செய்யவும்\n2️⃣ பயிர் வகை, அளவு (kg), அறுவடை தேதி உள்ளிடவும்\n3️⃣ GPS location கேப்ச்சர் செய்யவும் (📍 பொத்தான் அழுத்தவும்)\n4️⃣ data.gov.in சந்தை விலை வரம்பில் உங்கள் விலையை அமைக்கவும்\n5️⃣ விண்ணப்பத்தை சமர்ப்பிக்கவும் — Blockchain-ல் பதிவாகும்!\n\n⚠️ முக்கிய விதி: அறுவடைக்கு குறைந்தது 2 நாட்களுக்கு முன்பே விண்ணப்பிக்க வேண்டும்!\n⚠️ Rule: Apply at least 2 days before harvest date."
        },

        // Agri Officer / inspection
        {
            keywords: ["inspection", "ஆய்வு", "processor", "வேளாண்மை அதிகாரி", "quality", "தரம்", "certif", "சான்று", "field officer", "approve"],
            response: "🔬 Agri Officer (வேளாண்மை அதிகாரி) பணிகள் | Agri Officer Tasks:\n\n✅ காட்டும் பணிகள்:\n1️⃣ Agri Officer Dashboard → 'Applications for Inspection' பார்க்கவும்\n2️⃣ விவசாயியின் நிலத்திற்குச் சென்று ஆய்வு செய்யவும்\n3️⃣ Quality Grade (A/B/C), pH அளவு, பூச்சிக்கொல்லி சரிபார்க்கவும்\n4️⃣ விலையை ±0.2% மட்டும் சரிசெய்யலாம்\n5️⃣ Approve செய்தால் → Certificate Issue → Blockchain-ல் பதிவு\n\n⏱️ 3 நாட்களுக்குள் ஆய்வு முடித்திட வேண்டும். இல்லையெனில் தானாக Expire ஆகும்!\n⏱️ Must complete inspection within 3 days or application expires."
        },

        // Tahsildar
        {
            keywords: ["tahsildar", "தாசில்தார்", "verify", "சரிபார்", "taluk", "taluk officer"],
            response: "📋 Tahsildar (தாசில்தார்) பணிகள்:\n\n🔍 Tahsildar, Agri Officer ஆய்வுக்கு பிறகு Relief Fund claims-ஐ சரிபார்க்கிறார்.\n\nபணி வரம்பு:\n• Agri Officer-ன் ஆய்வு அறிக்கை, புகைப்படங்கள் பார்க்கலாம்\n• சேத விகிதம், நிலப் பரப்பு சரிபார்க்கலாம்\n• Relief அளவை மாற்றலாம் அல்லது உறுதி செய்யலாம்\n• Approve/Reject முடிவெடுக்கலாம்\n• Approve ஆனால் Admin / IAgS-க்கு அனுப்பப்படும்\n\nTahsildar verifies field inspection reports before forwarding to Admin/IAgS for final sanction."
        },

        // Admin/IAgS
        {
            keywords: ["admin", "iaas", "iags", "regulator", "ஒழுங்குமுறை", "sanction", "disburse", "fund release", "government", "அரசு"],
            response: "🏛️ IAgS (Agri Office) / Admin பணிகள்:\n\n💼 இறுதி அதிகாரம்:\n• அனைத்து Relief Fund claims-ஐ இறுதியாக சரிபார்க்கிறார்\n• Tahsildar அனுமதிக்கு பிறகுதான் Admin-க்கு வரும்\n• Admin approve செய்தவுடன் நிதி விவசாயி கணக்கில் செலுத்தப்படும்\n• IAgS Monitor-ல் அனைத்து பயிர் பதிவுகளையும் பார்க்கலாம்\n\nAdmin gives FINAL SANCTION for relief funds after Tahsildar approval, and also monitors all harvest batch transactions."
        },

        // Relief fund
        {
            keywords: ["relief", "உதவி", "compensation", "நிதி", "damage", "சேதம்", "flood", "வெள்ளம்", "drought", "வறட்சி", "cyclone", "rain", "மழை", "pest", "பூச்சி", "apply relief"],
            response: "🆘 Relief Fund (உதவித்தொகை) தொடர்பான தகவல்:\n\n📱 விண்ணப்பம் செய்வது எப்படி:\n1️⃣ Farmer Dashboard → Relief Fund → 'Apply Now'\n2️⃣ Aadhaar, Uzhavar Card, Mobile Number உள்ளிடவும்\n3️⃣ நிலம் மற்றும் பயிர் விவரங்கள் கொடுக்கவும்\n4️⃣ சேத காரணம் (வெள்ளம்/வறட்சி/பூச்சி/சூறாவளி)\n5️⃣ Geo-tagged photos upload செய்யவும் (கட்டாயம்!)\n\n📋 Process:\nFarmer → Field Officer Inspect → Tahsildar Verify → Admin Final Sanction → 💰 Fund Disbursed\n\n🔍 உங்கள் claim status trace செய்ய: Dashboard → My Claims → 🔍 Trace"
        },

        // Blockchain
        {
            keywords: ["blockchain", "பிளாக்ஹைன்", "security", "பாதுகாப்பு", "tamper", "immutable", "transaction", "txhash", "hash"],
            response: "⛓️ Blockchain எப்படி பயன்படுகிறது?\n\nAgriTraceIndia-ல் ஒவ்வொரு செயலும் Blockchain-ல் பாதுகாப்பாக பதிவாகிறது:\n\n🌾 HARVEST_APPLICATION — விவசாயி விண்ணப்பம்\n🔬 CROP_INSPECTION — Agri Officer சான்றிதழ்\n📦 BATCH_RECORDED — தொகுதி பதிவு\n🛒 CROP_PURCHASE — விற்பனை\n🔒 STOCK_CLOSED — IAgS முடிவு\n\n💊 Relief Fund-க்கு:\n📋 RELIEF_APPLICATION → AGRI_OFFICER_FIELD_INSPECTION → TAHSILDAR_VERIFICATION → ADMIN_FUND_DISBURSED\n\nEach step gets a unique txHash — cryptographically secured, tamper-proof forever!"
        },

        // QR & Trace
        {
            keywords: ["qr", "ஸ்கேன்", "scan", "trace", "track", "tracing", "trail", "audit"],
            response: "📱 QR Code மூலம் தடம் காண்பது எப்படி?\n\n🌾 பயிர் விற்பனை QR:\n• /trace/BATCH-TN-XXXX பக்கம் திறக்கும்\n• விவசாயி → வேளாண்மை அதிகாரி → விற்பனை வரை முழு சங்கிலி பார்க்கலாம்\n\n🆘 Relief Fund QR:\n• /trace/relief/RF-TN-XXXX பக்கம் திறக்கும்\n• Farmer → Inspector → Tahsildar → Admin வரை முழு audit trail\n\nQR code scan செய்தவுடன்:\n✅ யார் பயிரிட்டார்? (Farmer details)\n✅ எப்போது ஆய்வு? (Inspection date)\n✅ விலை என்ன? (Certified price)\n✅ Blockchain txHash proof\n\nAnyone can scan to verify authenticity — transparent and trustworthy!"
        },

        // Marketplace
        {
            keywords: ["marketplace", "buy", "purchase", "வாங்க", "கடை", "சந்தை", "list", "listing", "விற்பனை"],
            response: "🏪 Marketplace பற்றிய தகவல்:\n\n🛒 யார் வாங்கலாம்?\n• Retailers (சில்லறை வணிகர்கள்) — batch-ஆக வாங்கலாம்\n• Consumers (நுகர்வோர்கள்) — நேரடியாக வாங்கலாம்\n\n📦 எப்போது பயிர் Marketplace-ல் வருகிறது?\n1. Farmer submits application ✅\n2. Agri Officer inspects & certifies ✅\n3. Farmer 'Record Batch' செய்கிறார் ✅\n4. Then it appears in Marketplace! 🎉\n\n💰 விலை: Blockchain-ல் பதிவான fixed price. பேரம் பேச முடியாது — இது விவசாயிகளை பாதுகாக்கிறது!\n\nPrice is FIXED (Farmer + Market Data validated). Fair for everyone!"
        },

        // Batch recording
        {
            keywords: ["batch", "record", "qr generate", "qr create", "தொகுதி", "பதிவு"],
            response: "📦 Batch Record செய்வது எப்படி?\n\n✅ Agri Officer approve செய்த பிறகு:\n1️⃣ Farmer Dashboard → 'Record Batch' tab\n2️⃣ Approved application தேர்வு செய்யவும்\n3️⃣ உண்மையான எடை (kg) உள்ளிடவும்\n4️⃣ 'Record Batch' கிளிக் செய்யவும்\n5️⃣ Blockchain Event: BATCH_RECORDED ✅\n6️⃣ QR Code தானாக generate ஆகும்!\n7️⃣ Marketplace-ல் பட்டியலிடப்படும்\n\n📥 QR Download செய்து பையில் ஒட்டவும் — நுகர்வோர் scan செய்யலாம்!"
        },

        // Uzhavar card / Aadhaar
        {
            keywords: ["uzhavar", "உழவர்", "aadhaar", "ஆதார்", "card", "attai", "அட்டை", "farmer card"],
            response: "🪪 Uzhavar Attai (உழவர் அட்டை) தகவல்:\n\n• விவசாயிகளுக்கான அரசு அடையாள அட்டை\n• Register செய்யும் போது Uzhavar Card Number கட்டாயம்\n• Relief Fund விண்ணப்பத்திலும் தேவை\n• Aadhaar + Uzhavar Card = உண்தவிக்கப்பட்ட விவசாயி\n\nIf you don't have a Uzhavar Card, contact your nearest Agriculture Office (வேளாண்மை அலுவலகம்) to register."
        },

        // GPS / Location
        {
            keywords: ["gps", "location", "geo", "map", "தகவல்", "இடம்", "நிலை"],
            response: "📍 GPS / Geo-tagging தகவல்:\n\n✈️ Harvest Application-ல்:\n• 📍 Get GPS பொத்தான் அழுத்தவும்\n• தானாக உங்கள் நிலை கேப்ச்சர் ஆகும்\n• Mobile-ல் browser location permission allow செய்யவும்\n\n📸 Relief Fund Photos:\n• Geo-tagged photos (GPS coordinates உள்ள புகைப்படங்கள்) கட்டாயம்\n• Camera -ல் Location access allow செய்யவும்\n• புகைப்படம் எடுத்த இடம் verify ஆகும்\n\nGPS ensures your farm location is authentic and verified on the blockchain."
        },

        // Login / Registration
        {
            keywords: ["login", "register", "sign up", "create account", "account", "பதிவு", "உள்நுழை", "password", "கடவுச்சொல்"],
            response: "🔐 Login மற்றும் Register:\n\n👤 New User - Register:\n1. Login Page → 'Register' தேர்வு\n2. உங்கள் role தேர்வு (Farmer/Agri Officer/Retailer/Consumer)\n3. பெயர், மின்னஞ்சல், கடவுச்சொல் உள்ளிடவும்\n4. District + Taluk கட்டாயம் தேர்வு செய்யவும்\n\n⚠️ குறிப்பு:\n• Tahsildar, IAgS/Admin — Super Admin மட்டுமே create செய்வார்\n• ஒரே மின்னஞ்சல் இரண்டுமுறை register செய்ய முடியாது\n\nForgot password? Contact your local Agriculture Office."
        },

        // Rules
        {
            keywords: ["rule", "விதி", "regulation", "law", "கட்டுப்பாடு", "limit", "வரம்பு"],
            response: "📜 AgriTraceIndia முக்கிய விதிகள் | Key Rules:\n\n🌾 விவசாயி (Farmer):\n• அறுவடை minimum 2 நாட்கள் முன்பே apply\n• விலை = data.gov.in market range-க்குள் மட்டும்\n• Geo-tagged photos கட்டாயம் (Relief Fund)\n\n🔬 Agri Officer:\n• 3 நாட்களுக்குள் inspection கட்டாயம்\n• விலை adjustment = ±0.2% மட்டுமே\n\n💰 விலை நிர்ணயம்:\n• Fixed price — Marketplace-ல் மாற்ற முடியாது\n• Market range data.gov.in இல் இருந்து realtime\n\n⛓️ Blockchain:\n• ஒவ்வொரு செயலும் immutable record"
        },

        // Crops seasons
        {
            keywords: ["season", "பருவம்", "kharif", "rabi", "summer", "crop type", "பயிர் வகை", "which crop", "என்ன பயிர்"],
            response: "🌱 Tamil Nadu பயிர் பருவங்கள் | Crop Seasons:\n\n☀️ Kharif (Samba) - June to November:\n• நெல் (Paddy), கப்பை, கரும்பு, பருத்தி\n\n❄️ Rabi (Navarai) - December to March:\n• நெல், காய்கறிகள், சோளம், கடலை\n\n🌞 Summer (Kuruvai) - March to June:\n• நெல் (குறுவை), தர்பூசணி, வெள்ளரிக்காய்\n\n💡 Best crops for profit (2025-26):\n🍅 தக்காளி, 🧅 வெங்காயம், 🥭 மாம்பழம், 🍌 வாழை\nContact Agriculture Extension Officer for crop planning advice."
        },

        // Organic farming
        {
            keywords: ["organic", "இயற்கை", "natural", "bio", "pesticide", "பூச்சிக்கொல்லி", "fertilizer", "உரம்"],
            response: "🌿 இயற்கை விவசாயம் | Organic Farming:\n\n✅ AgriTraceIndia-ல் Organic certification:\n• Submit harvest-ல் 'Organic' checkbox தேர்வு செய்யவும்\n• வேளாண்மை அதிகாரி organic verification செய்வார்\n• '🌿 Organic Certified' badge கிடைக்கும்\n• Marketplace-ல் special organic listing\n\n📈 Organic பயிர்களுக்கு:\n• அதிக விலை கிடைக்கும்\n• Buyer trust அதிகம்\n• Government schemes தனிப்பட்ட subsidy\n\nOrganic certification boosts your crop value significantly!"
        },

        // Contact / support
        {
            keywords: ["contact", "support", "தொடர்பு", "help center", "officer", "agriculture office", "கட்ட"],
            response: "📞 தொடர்பு கொள்ள | Contact:\n\n🏛️ வேளாண்மை அலுவலகம்:\n• மாவட்ட வேளாண்மை அதிகாரி (DAO)\n• Block Agriculture Extension Officer (BAEO)\n\n📱 System Help:\n• Frontend: AgriTraceIndia சிஸ்டம் support\n• Backend: Field Officer / Agri Officer-ஐ contact செய்யவும்\n\n🌐 Useful Links:\n• data.gov.in — Market prices\n• tn.gov.in — Tamil Nadu Agriculture\n• agri.tn.gov.in — TN Agri Portal\n\nFor technical issues, contact your District Agriculture Office (DAO)."
        },

        // Weather
        {
            keywords: ["weather", "காலநிலை", "rain", "மழை forecast", "temperature", "வெப்பம்"],
            response: "🌤️ காலநிலை மற்றும் விவசாயம்:\n\n⚠️ AgriTraceIndia-ல் direct weather forecast இல்லை.\n\nஆனால் பரிந்துரைகள்:\n📱 Apps: IMD India, Meghdoot (Agriculture Weather App)\n🌐 imdchennai.gov.in — Chennai Weather Center\n📺 TV: DD Kisan, Sun News Weather\n\n🌾 Farming tip:\n• வறட்சி / வெள்ளம் வந்தால் → Relief Fund apply செய்யலாம்\n• 3 நாட்கள் தொடர் மழை → Damage claim eligible\n\nCheck IMD weather alerts before planning harvest dates!"
        },

        // Government schemes
        {
            keywords: ["scheme", "திட்டம்", "subsidy", "மானியம்", "government scheme", "pm kisan", "pm-kisan", "fasal bima"],
            response: "🏛️ அரசு திட்டங்கள் | Government Schemes:\n\n💰 PM-KISAN:\n• ₹6,000/year — 3 installments\n• aadhaar linked bank account கட்டாயம்\n\n🌾 Pradhan Mantri Fasal Bima Yojana (PMFBY):\n• பயிர் காப்பீடு திட்டம்\n• Natural disaster-ல் coverage\n\n🌿 TN Govt Schemes:\n• Uzhavar Sandhai — விவசாயி நேரடி சந்தை\n• Farmer Producer Organizations (FPO)\n• Zero Budget Natural Farming support\n\n📞 More info: அருகிலுள்ள வேளாண்மை அலுவலகம் போகவும்\nVisit your nearest Agriculture Office for scheme registration."
        },

        // Soil
        {
            keywords: ["soil", "மண்", "ph", "nutrient", "மண் பரிசோதனை", "soil test"],
            response: "🪨 மண் பரிசோதனை | Soil Testing:\n\n🔬 AgriOfficer இதைச் செய்கிறார்:\n• pH அளவு (ideal: 6.0 - 7.5)\n• Pesticide residue check\n• Moisture content\n\n📍 Government Soil Testing Centers:\n• மாவட்ட வேளாண்மை அலுவலகம்\n• TANWA (Tamil Nadu Watershed Development)\n\n💡 Tips:\n• pH < 6 → Lime apply செய்யவும்\n• pH > 7.5 → Sulphur apply செய்யவும்\n• 3 years-க்கு ஒருமுறை soil test கட்டாயம்!\n\nSoil health determines crop quality and market price!"
        },

        // Water / irrigation
        {
            keywords: ["irrigation", "நீர்ப்பாசனம்", "water", "நீர்", "drip", "sprinkler", "bore well", "குழாய்"],
            response: "💧 நீர்ப்பாசனம் | Irrigation Tips:\n\n✅ திறமையான முறைகள்:\n🔹 Drip irrigation — குறைந்த தண்ணீரில் அதிக பயன்\n🔹 Sprinkler — மேற்பரப்பு பயன்\n🔹 Flood irrigation — நெல்லுக்கு மட்டும்\n\n💧 அரசு உதவி:\n• TNAU drip irrigation subsidy\n• PM Krishi Sinchai Yojana (PMKSY)\n• 75% subsidy available for drip/sprinkler\n\n📞 Contact: Horticulture Department, TN\n\nDrip irrigation saves 50% water and increases yield by 30%!"
        },

        // Market selling tips
        {
            keywords: ["selling tip", "sell better", "profit", "லாபம்", "income", "வருமானம்", "maximize"],
            response: "💡 அதிக லாபம் பெறுவது எப்படி? | Maximize Profit:\n\n1️⃣ AgriTraceIndia-ல் பதிவு செய்யுங்கள் — direct buyer access\n2️⃣ Organic certification → 20-40% அதிக விலை\n3️⃣ FPC/FPO join ஆகுங்கள் — bulk pricing\n4️⃣ சரியான season-ல் பயிரிடுங்கள்\n5️⃣ Market price monitoring — data.gov.in\n6️⃣ Blockchain QR → Consumer trust → Premium pricing\n\n📈 Key Insight: Blockchain-certified crops sell 15-25% higher than uncertified ones in Tamil Nadu markets!"
        },

        // Fallback
        {
            keywords: ["__fallback__"],
            response: "மன்னிக்கவும், கொஞ்சம் விளக்கமாக கேளுங்கள். 😊\n\nநான் பதில் சொல்லக்கூடியவை:\n• 🌾 எந்த பயிர் விலை வேண்டும்? (\"தக்காளி விலை?\")\n• 📋 அறுவடை விண்ணப்பம் எப்படி?\n• 🆘 Relief Fund எப்படி apply செய்வது?\n• ⛓️ Blockchain trace எப்படி?\n• 📱 QR code scan எப்படி?\n• 🌿 Organic farming tips?\n• 🏛️ Government schemes?\n\nI can help with crop prices, system ops, relief funds, blockchain, QR tracing, and farming tips. Try one!"
        }
    ];

// ─── Quick Actions ─────────────────────────────────────────────────────────────
const QUICK_ACTIONS = [
    { label: "🍅 தக்காளி விலை", query: "தக்காளி விலை எவ்வளவு?" },
    { label: "🧅 வெங்காயம் விலை", query: "வெங்காயம் விலை?" },
    { label: "🥔 உருளை விலை", query: "உருளைக்கிழங்கு விலை?" },
    { label: "🌾 அறுவடை எப்படி?", query: "அறுவடை விண்ணப்பம் எப்படி?" },
    { label: "🆘 Relief Fund", query: "relief fund எப்படி apply செய்வது?" },
    { label: "⛓️ Blockchain?", query: "blockchain எப்படி வேலை செய்கிறது?" },
    { label: "📱 QR trace", query: "qr scan செய்வது எப்படி?" },
    { label: "🏛️ Gov Schemes", query: "government schemes என்ன இருக்கிறது?" },
];

// ─── Crop name extractor ────────────────────────────────────────────────────────
const CROP_NAMES: Record<string, string> = {
    "தக்காளி": "Tomato", "tomato": "Tomato",
    "வெங்காயம்": "Onion", "onion": "Onion",
    "உருளைக்கிழங்கு": "Potato", "potato": "Potato",
    "வாழை": "Banana", "banana": "Banana",
    "மாம்பழம்": "Mango", "mango": "Mango",
    "கத்தரிக்காய்": "Brinjal", "brinjal": "Brinjal", "eggplant": "Brinjal",
    "மிளகாய்": "Chilli", "chilli": "Chilli", "chili": "Chilli",
    "தேங்காய்": "Coconut", "coconut": "Coconut",
    "பீன்ஸ்": "Beans", "beans": "Beans",
    "பாகல்": "Bitter gourd", "bitter gourd": "Bitter gourd",
    "சுரைக்காய்": "Bottle gourd", "bottle gourd": "Bottle gourd",
    "வெண்டை": "Ladyfinger", "ladyfinger": "Ladyfinger", "okra": "Ladyfinger",
    "கத்திரிக்காய்": "Brinjal",
    "முருங்கை": "Drumstick", "drumstick": "Drumstick",
    "நெல்": "Paddy", "paddy": "Paddy", "rice": "Paddy",
    "கோதுமை": "Wheat", "wheat": "Wheat",
    "சோளம்": "Maize", "maize": "Maize", "corn": "Maize",
    "கரும்பு": "Sugarcane", "sugarcane": "Sugarcane",
    "மஞ்சள்": "Turmeric", "turmeric": "Turmeric",
    "நிலக்கடலை": "Groundnut", "groundnut": "Groundnut",
    "பூண்டு": "Garlic", "garlic": "Garlic",
    "கேரட்": "Carrot", "carrot": "Carrot",
    "பூசணி": "Pumpkin", "pumpkin": "Pumpkin",
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// ─── Main Component ─────────────────────────────────────────────────────────────
export default function AgriAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: "வணக்கம்! 🙏 நான் AgriTraceIndia AI-உதவியாளர். சந்தை விலை, அறுவடை, Relief Fund, Blockchain பற்றி கேளுங்கள்!\n\nHello! Ask me crop prices, system operations, or farming guidance!",
            sender: 'bot',
            timestamp: new Date()
        }
    ]);
    const [inputText, setInputText] = useState("");
    const [isListening, setIsListening] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [showQuickActions, setShowQuickActions] = useState(true);

    const scrollRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<any>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    useEffect(() => {
        if (isOpen && messages.length === 1) speak(messages[0].text);
    }, [isOpen]);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SR) return;
        recognitionRef.current = new SR();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = "ta-IN";
        recognitionRef.current.onstart = () => setIsListening(true);
        recognitionRef.current.onend = () => setIsListening(false);
        recognitionRef.current.onerror = () => setIsListening(false);
        recognitionRef.current.onresult = (e: any) => {
            const text = e.results[0][0].transcript;
            if (text) processInput(text);
        };
    }, []);

    const speak = (text: string) => {
        if (isMuted || typeof window === "undefined" || !("speechSynthesis" in window)) return;
        const clean = text.split('\n')[0].split('(')[0].replace(/[🌾🍅🧅🥔🍌🥭🍆🌶️🥥🫘🥒🌿🥕🎃🥜🌽🎋🧄🫁📋⛓️🌱📱💰🏛️🔐🪪⚠️✅1️⃣2️⃣3️⃣4️⃣5️⃣6️⃣7️⃣]/g, '').trim();
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(clean);
        const trySpeak = () => {
            const voices = window.speechSynthesis.getVoices();
            const tamil = voices.find(v => v.lang === 'ta-IN') || voices.find(v => v.lang.startsWith('ta')) || voices.find(v => v.name.toLowerCase().includes('tamil'));
            if (tamil) { utterance.voice = tamil; utterance.lang = tamil.lang; } else { utterance.lang = 'ta-IN'; }
            utterance.rate = 0.88;
            window.speechSynthesis.speak(utterance);
        };
        if (window.speechSynthesis.getVoices().length === 0) window.speechSynthesis.onvoiceschanged = trySpeak;
        else trySpeak();
    };

    const extractCropFromQuery = (text: string): string | null => {
        const lower = text.toLowerCase();
        for (const [key, val] of Object.entries(CROP_NAMES)) {
            if (lower.includes(key.toLowerCase())) return val;
        }
        return null;
    };

    const fetchLivePrice = async (cropName: string): Promise<PriceCard | null> => {
        try {
            const res = await fetch(`${API_BASE}/harvest/market-price-public?commodity=${encodeURIComponent(cropName)}&district=Chennai`);
            const data = await res.json();
            if (data.status === 'success' && data.data) {
                const d = data.data;
                const emoji = CROP_EMOJI[cropName.toLowerCase()] || CROP_EMOJI[cropName] || "🌾";
                return {
                    type: 'price',
                    crop: cropName,
                    emoji,
                    min: d.min,
                    max: d.max,
                    modal: Math.round((d.min + d.max) / 2),
                    district: d.district || 'Tamil Nadu',
                    market: d.market || 'APMC'
                };
            }
        } catch { }
        return null;
    };

    const getBotResponse = async (text: string): Promise<{ text: string; card?: any }> => {
        const lower = text.toLowerCase();

        // Check if it's a price query
        const isPriceQuery = ["விலை", "price", "rate", "எவ்வளவு", "cost", "சந்தை"].some(kw => lower.includes(kw));
        if (isPriceQuery) {
            const crop = extractCropFromQuery(text);
            if (crop) {
                const priceCard = await fetchLivePrice(crop);
                if (priceCard) {
                    const emoji = priceCard.emoji;
                    return {
                        text: `${emoji} ${priceCard.crop} — இன்றைய சந்தை விலை | Today's Market Price\n📍 Source: data.gov.in (Real-time)`,
                        card: priceCard
                    };
                } else {
                    return {
                        text: `மன்னிக்கவும், ${crop} விலை தகவல் இப்போது கிடைக்கவில்லை.\nTry: \"தக்காளி விலை?\" or \"வெங்காயம் விலை?\"\n\nSorry, price data for ${crop} is currently unavailable from the market API. Try again shortly.`
                    };
                }
            } else {
                return {
                    text: "எந்த பயிரின் விலை வேண்டும்? பயிரின் பெயரை சொல்லுங்கள்!\n\nWhich crop price do you need? Examples:\n🍅 \"தக்காளி விலை\" | \"Tomato price\"\n🧅 \"வெங்காயம் விலை\" | \"Onion price\"\n🥔 \"உருளை விலை\" | \"Potato price\"\n🍌 \"வாழை விலை\" | \"Banana price\"\n🥭 \"மாம்பழம் விலை\" | \"Mango price\""
                };
            }
        }

        // Knowledge base lookup
        for (const item of KNOWLEDGE) {
            if (item.keywords[0] === '__fallback__') continue;
            if (item.keywords.some(kw => lower.includes(kw.toLowerCase()))) {
                return { text: item.response };
            }
        }

        // Fallback
        return { text: KNOWLEDGE[KNOWLEDGE.length - 1].response };
    };

    const addBotMessage = (text: string, card?: any) => {
        const msg: Message = {
            id: Date.now().toString(),
            text,
            sender: 'bot',
            timestamp: new Date(),
            card
        };
        setMessages(prev => [...prev, msg]);
        speak(text);
    };

    const processInput = async (text: string) => {
        if (!text.trim()) return;
        setShowQuickActions(false);

        const userMsg: Message = {
            id: Date.now().toString(),
            text,
            sender: 'user',
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMsg]);
        setInputText("");
        setIsTyping(true);

        // Simulate thinking delay for live queries
        const { text: responseText, card } = await getBotResponse(text);

        setTimeout(() => {
            setIsTyping(false);
            addBotMessage(responseText, card);
        }, card ? 200 : 400);
    };

    const toggleVoice = () => {
        if (!recognitionRef.current) { toast.error("Voice not supported in this browser"); return; }
        try {
            if (isListening) { recognitionRef.current.stop(); }
            else {
                recognitionRef.current.start();
                toast("🎤 கேட்கிறேன்... Listening...", { duration: 2000 });
            }
        } catch (err: any) {
            if (err?.name !== 'InvalidStateError') setIsListening(false);
        }
    };

    const handleNewChat = () => {
        setMessages([{
            id: Date.now().toString(),
            text: "வணக்கம்! 🙏 புதிய உரையாடல் தொடங்கியது. என்ன கேட்கணும்?\nNew chat started. What do you need help with?",
            sender: 'bot',
            timestamp: new Date()
        }]);
        setShowQuickActions(true);
    };

    return (
        <div className="fixed bottom-6 right-6 z-[9999]">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="w-[360px] sm:w-[420px] mb-4 flex flex-col shadow-2xl overflow-hidden rounded-2xl border border-white/10"
                        style={{ height: '580px', background: 'rgba(5,15,5,0.96)', backdropFilter: 'blur(20px)' }}
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-green-700 via-emerald-700 to-teal-700 p-4 flex items-center justify-between flex-shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-xl">🤖</div>
                                <div>
                                    <div className="text-white font-black text-sm tracking-wide">AgriTraceIndia AI</div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse" />
                                        <span className="text-[10px] text-green-100 uppercase tracking-widest font-bold">Live · Market Data</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button onClick={handleNewChat} title="New Chat" className="p-2 hover:bg-white/10 rounded-xl text-white/70 hover:text-white transition-all">
                                    <RefreshCw className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => setIsMuted(!isMuted)} className="p-2 hover:bg-white/10 rounded-xl text-white/70 hover:text-white transition-all">
                                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                                </button>
                                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-red-500/20 rounded-xl text-white/70 hover:text-red-300 transition-all">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-3" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>

                            {/* Quick Actions (shown at start) */}
                            {showQuickActions && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-2">
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">அடிக்கடி கேட்கப்படுவை | Popular</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {QUICK_ACTIONS.map(qa => (
                                            <button key={qa.label} onClick={() => processInput(qa.query)}
                                                className="px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[11px] text-gray-300 hover:text-white hover:bg-green-500/20 hover:border-green-500/30 transition-all">
                                                {qa.label}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {messages.map((m) => (
                                <motion.div
                                    key={m.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'} gap-2`}
                                >
                                    {m.sender === 'bot' && (
                                        <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-green-600 to-emerald-700 flex items-center justify-center text-sm flex-shrink-0 mt-1">🤖</div>
                                    )}
                                    <div className="flex flex-col gap-2 max-w-[85%]">
                                        <div className={`p-3 rounded-2xl text-sm whitespace-pre-line leading-relaxed ${m.sender === 'user'
                                            ? 'bg-gradient-to-br from-green-600 to-emerald-700 text-white rounded-tr-none'
                                            : 'bg-white/8 border border-white/10 text-gray-100 rounded-tl-none'}`}>
                                            {m.text}
                                            <div className="text-[9px] opacity-40 mt-1 text-right">
                                                {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>

                                        {/* Price Card */}
                                        {m.card?.type === 'price' && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="bg-gradient-to-br from-green-950/80 to-emerald-950/80 border border-green-500/20 rounded-2xl p-4"
                                            >
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-3xl">{m.card.emoji}</span>
                                                        <div>
                                                            <div className="font-black text-white">{m.card.crop}</div>
                                                            <div className="text-[10px] text-gray-400">{m.card.district} · {m.card.market}</div>
                                                        </div>
                                                    </div>
                                                    <div className="text-[10px] text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-1 rounded-full">Live</div>
                                                </div>
                                                <div className="grid grid-cols-3 gap-2">
                                                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-2 text-center">
                                                        <div className="text-[9px] text-red-400 mb-0.5">Min</div>
                                                        <div className="text-white font-black">₹{m.card.min}</div>
                                                        <div className="text-[9px] text-gray-500">/quintal</div>
                                                    </div>
                                                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-2 text-center">
                                                        <div className="text-[9px] text-green-400 mb-0.5">Modal</div>
                                                        <div className="text-green-400 font-black text-lg">₹{m.card.modal}</div>
                                                        <div className="text-[9px] text-gray-500">/quintal</div>
                                                    </div>
                                                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-2 text-center">
                                                        <div className="text-[9px] text-blue-400 mb-0.5">Max</div>
                                                        <div className="text-white font-black">₹{m.card.max}</div>
                                                        <div className="text-[9px] text-gray-500">/quintal</div>
                                                    </div>
                                                </div>
                                                <div className="mt-2 text-[9px] text-gray-500 flex items-center gap-1">
                                                    <TrendingUp className="w-3 h-3" /> Source: data.gov.in · Updated today
                                                </div>
                                            </motion.div>
                                        )}

                                        {/* Speak again button */}
                                        {m.sender === 'bot' && (
                                            <button onClick={() => speak(m.text)}
                                                className="self-start text-[10px] text-gray-600 hover:text-green-400 flex items-center gap-1 transition-all">
                                                <Volume2 className="w-3 h-3" /> Speak
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            ))}

                            {/* Typing indicator */}
                            {isTyping && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-green-600 to-emerald-700 flex items-center justify-center text-sm">🤖</div>
                                    <div className="bg-white/8 border border-white/10 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Suggestion chips */}
                        {messages.length > 1 && (
                            <div className="px-3 py-2 border-t border-white/5 flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                                {["🍅 தக்காளி விலை?", "🆘 Relief Fund?", "⛓️ Blockchain?", "📱 QR Trace?", "🏛️ Schemes?"].map(s => (
                                    <button key={s} onClick={() => processInput(s)}
                                        className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-gray-400 hover:text-green-400 hover:border-green-500/30 whitespace-nowrap transition-all flex-shrink-0">
                                        {s}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Input */}
                        <div className="p-3 border-t border-white/10 bg-black/30 flex-shrink-0">
                            <div className="flex items-center gap-2">
                                <button onClick={toggleVoice}
                                    className={`p-3 rounded-xl transition-all flex-shrink-0 ${isListening ? 'bg-red-600 text-white animate-pulse shadow-lg shadow-red-900/40' : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'}`}>
                                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                                </button>
                                <input
                                    ref={inputRef}
                                    value={inputText}
                                    onChange={e => setInputText(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && processInput(inputText)}
                                    placeholder="கேளுங்கள்... Ask anything..."
                                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-green-500/50 transition-all"
                                />
                                <button onClick={() => processInput(inputText)}
                                    className="p-3 bg-gradient-to-br from-green-600 to-emerald-700 hover:from-green-500 hover:to-emerald-600 text-white rounded-xl shadow-lg shadow-green-900/30 flex-shrink-0 transition-all">
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                            <p className="text-[9px] text-gray-700 text-center mt-1.5">Tamil / English · Voice supported · Market data: data.gov.in</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle FAB */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(o => !o)}
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 via-emerald-600 to-teal-700 text-white shadow-2xl shadow-green-900/50 flex items-center justify-center relative"
            >
                <div className="absolute inset-0 rounded-2xl bg-green-400 animate-ping opacity-15" />
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                            <X className="w-7 h-7" />
                        </motion.div>
                    ) : (
                        <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                            <Sparkles className="w-7 h-7" />
                        </motion.div>
                    )}
                </AnimatePresence>
                {!isOpen && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-black text-[8px] font-black text-black flex items-center justify-center">AI</div>
                )}
            </motion.button>
        </div>
    );
}
