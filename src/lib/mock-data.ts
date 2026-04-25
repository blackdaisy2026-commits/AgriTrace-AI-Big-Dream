export interface BatchEvent {
    stage: string;
    icon: string;
    timestamp: string;
    actor: string;
    location: string;
    gps?: string;
    details: Record<string, string>;
    txHash?: string;
    verified: boolean;
}

export interface Batch {
    id: string;
    crop: string;
    cropTamil: string;
    farmer: string;
    village: string;
    district: string;
    organic: boolean;
    fairTrade: boolean;
    weight: string;
    currentStage: string;
    events: BatchEvent[];
    tempData: { time: string; temp: number }[];
    photoUrl?: string;
}

export const MOCK_BATCHES: Record<string, Batch> = {
    "TN-DEMO001": {
        id: "TN-DEMO001",
        crop: "Tomato",
        cropTamil: "தக்காளி",
        farmer: "Murugesan Pillai",
        village: "Oddanchatram",
        district: "Dindigul",
        organic: true,
        fairTrade: true,
        weight: "500 kg",
        currentStage: "Sold",
        tempData: [
            { time: "08:00", temp: 26 },
            { time: "10:00", temp: 28 },
            { time: "12:00", temp: 30 },
            { time: "14:00", temp: 29 },
            { time: "16:00", temp: 27 },
            { time: "18:00", temp: 8 },
            { time: "20:00", temp: 6 },
            { time: "22:00", temp: 5 },
        ],
        events: [
            {
                stage: "Harvest",
                icon: "🌾",
                timestamp: "2026-02-25T05:30:00+05:30",
                actor: "Murugesan Pillai",
                location: "Oddanchatram, Dindigul",
                gps: "10.3592,77.7502",
                details: {
                    "Crop Variety": "Hybrid Local Red",
                    Weight: "500 kg",
                    "Harvest Method": "Manual Pick",
                    "Field Area": "2.5 acres",
                    "Soil Type": "Red Loam",
                    "Water Source": "Borewell",
                },
                txHash: "0x1a2b3c4d5e6f7890abcdef1234567890",
                verified: true,
            },
            {
                stage: "Quality Check",
                icon: "🔬",
                timestamp: "2026-02-25T09:00:00+05:30",
                actor: "TN Agri Testing Lab, Dindigul",
                location: "Dindigul Collection Center",
                gps: "10.3637,77.9803",
                details: {
                    "pH Level": "6.2",
                    "Pesticide Residue": "NIL - Organic Certified",
                    "Brix Level": "4.8",
                    "Visual Grade": "A+",
                    Certificate: "APEDA Organic #TN2026-4521",
                },
                txHash: "0x2b3c4d5e6f789012bcdef1234567890ab",
                verified: true,
            },
            {
                stage: "Processing",
                icon: "🏭",
                timestamp: "2026-02-25T11:30:00+05:30",
                actor: "Dindigul APC Processing Unit",
                location: "Dindigul Industrial Area",
                gps: "10.3500,77.9700",
                details: {
                    "Wash Method": "Cold Water Hydro-Cool",
                    Grading: "Machine Sorted A/B",
                    Packaging: "Ventilated Crates 25kg",
                    "Batch Split": "20 crates",
                    "Cool Store Temp": "8°C entry",
                },
                txHash: "0x3c4d5e6f78901234cdef1234567890abc",
                verified: true,
            },
            {
                stage: "Transport",
                icon: "🚚",
                timestamp: "2026-02-25T14:00:00+05:30",
                actor: "Raja Cool Chain Logistics",
                location: "Dindigul → Chennai",
                gps: "13.0827,80.2707",
                details: {
                    Vehicle: "TN45 AX 2456 (Reefer)",
                    Driver: "Selvam K.",
                    "Distance": "420 km",
                    "Temp Range": "6-8°C maintained",
                    "ETA": "2026-02-25 20:00",
                    "GPS Tracking": "Live enabled",
                },
                txHash: "0x4d5e6f78901234abcdef234567890abcd",
                verified: true,
            },
            {
                stage: "Sold",
                icon: "🏪",
                timestamp: "2026-02-25T20:30:00+05:30",
                actor: "Murugan Organic Stores, T.Nagar",
                location: "T.Nagar, Chennai",
                gps: "13.0418,80.2341",
                details: {
                    "Retailer": "Murugan Organic Stores",
                    "Invoice": "#INV-2026-8532",
                    "Price": "₹85/kg",
                    "Consumer Price": "₹95/kg",
                    "Stock": "Available",
                },
                txHash: "0x5e6f78901234abcdef34567890abcde1",
                verified: true,
            },
        ],
    },
    "TN-DEMO002": {
        id: "TN-DEMO002",
        crop: "Banana",
        cropTamil: "வாழை",
        farmer: "Lakshmi Devi",
        village: "Theni",
        district: "Theni",
        organic: false,
        fairTrade: true,
        weight: "800 kg",
        currentStage: "Transport",
        tempData: [
            { time: "06:00", temp: 24 },
            { time: "09:00", temp: 27 },
            { time: "12:00", temp: 14 },
            { time: "15:00", temp: 13 },
            { time: "18:00", temp: 12 },
        ],
        events: [
            {
                stage: "Harvest",
                icon: "🌾",
                timestamp: "2026-02-24T06:00:00+05:30",
                actor: "Lakshmi Devi",
                location: "Theni",
                gps: "10.0104,77.4770",
                details: {
                    "Variety": "Grand Naine",
                    Weight: "800 kg",
                    "Ripeness": "75% - Green",
                },
                txHash: "0xa1b2c3d4e5f678901234567890abcdef",
                verified: true,
            },
            {
                stage: "Transport",
                icon: "🚚",
                timestamp: "2026-02-24T10:00:00+05:30",
                actor: "Kumaran Transports",
                location: "Theni → Madurai",
                gps: "9.9252,78.1198",
                details: {
                    Vehicle: "TN58 BH 3421",
                    "Temp Range": "12-14°C",
                    "Humidity": "85%",
                },
                txHash: "0xb2c3d4e5f6789012345678901bcdef90",
                verified: true,
            },
        ],
    },
};

export const CROPS = [
    // ── Vegetables from data.gov.in API ──────────────────────────────────
    { value: "Beans", label: "Beans / பீன்ஸ் 🟢" },
    { value: "Bitter gourd", label: "Bitter Gourd / பாகற்காய் 🥒" },
    { value: "Bottle gourd", label: "Bottle Gourd / சுரைக்காய் 🫙" },
    { value: "Brinjal", label: "Brinjal / கத்திரிக்காய் 🍆" },
    { value: "Green Avare(W)", label: "Green Avare / பச்சை அவரை 🫘" },
    { value: "Ridgeguard(Tori)", label: "Ridgegourd / பீர்க்கங்காய் 🥗" },
    { value: "Snakeguard", label: "Snake Gourd / புடலங்காய் 🐍" },
    // ── Fruits from API ───────────────────────────────────────────────────
    { value: "Banana", label: "Banana / வாழை 🍌" },
    { value: "Chikoos(Sapota)", label: "Sapota / சப்போட்டா 🟤" },
    // ── Common Crops (existing) ───────────────────────────────────────────
    { value: "Tomato", label: "Tomato / தக்காளி 🍅" },
    { value: "Rice", label: "Rice / அரிசி 🌾" },
    { value: "Mango", label: "Mango / மாம்பழம் 🥭" },
    { value: "Onion", label: "Onion / வெங்காயம் 🧅" },
    { value: "Chili Red", label: "Chilli / மிளகாய் 🌶️" },
    { value: "Potato", label: "Potato / உருளைக்கிழங்கு 🥔" },
    { value: "Coconut", label: "Coconut / தேங்காய் 🥥" },
    { value: "Turmeric", label: "Turmeric / மஞ்சள் 💛" },
    { value: "Sugarcane", label: "Sugarcane / கரும்பு 🍬" },
    { value: "Groundnut", label: "Groundnut / நிலக்கடலை 🥜" },
];

export const TN_DISTRICTS = [
    { value: "Ariyalur", label: "Ariyalur / அரியலூர்" },
    { value: "Chengalpattu", label: "Chengalpattu / செங்கல்பட்டு" },
    { value: "Chennai", label: "Chennai / சென்னை" },
    { value: "Coimbatore", label: "Coimbatore / கோயம்புத்தூர்" },
    { value: "Cuddalore", label: "Cuddalore / கடலூர்" },
    { value: "Dharmapuri", label: "Dharmapuri / தர்மபுரி" },
    { value: "Dindigul", label: "Dindigul / திண்டுக்கல்" },
    { value: "Erode", label: "Erode / ஈரோடு" },
    { value: "Kallakurichi", label: "Kallakurichi / கள்ளக்குறிச்சி" },
    { value: "Kancheepuram", label: "Kancheepuram / காஞ்சிபுரம்" },
    { value: "Kanyakumari", label: "Kanyakumari / கன்னியாகுமரி" },
    { value: "Karur", label: "Karur / கரூர்" },
    { value: "Krishnagiri", label: "Krishnagiri / கிருஷ்ணகிரி" },
    { value: "Madurai", label: "Madurai / மதுரை" },
    { value: "Mayiladuthurai", label: "Mayiladuthurai / மயிலாடுதுறை" },
    { value: "Nagapattinam", label: "Nagapattinam / நாகப்பட்டினம்" },
    { value: "Namakkal", label: "Namakkal / நாமக்கல்" },
    { value: "Nilgiris", label: "Nilgiris / நீலகிரி" },
    { value: "Perambalur", label: "Perambalur / பெரம்பலூர்" },
    { value: "Pudukkottai", label: "Pudukkottai / புதுக்கோட்டை" },
    { value: "Ramanathapuram", label: "Ramanathapuram / இராமநாதபுரம்" },
    { value: "Ranipet", label: "Ranipet / இராணிப்பேட்டை" },
    { value: "Salem", label: "Salem / சேலம்" },
    { value: "Sivaganga", label: "Sivaganga / சிவகங்கை" },
    { value: "Tenkasi", label: "Tenkasi / தென்காசி" },
    { value: "Thanjavur", label: "Thanjavur / தஞ்சாவூர்" },
    { value: "Theni", label: "Theni / தேனி" },
    { value: "Thoothukudi", label: "Thoothukudi / தூத்துக்குடி" },
    { value: "Tiruchirappalli", label: "Tiruchirappalli / திருச்சிராப்பள்ளி" },
    { value: "Tirunelveli", label: "Tirunelveli / திருநெல்வேலி" },
    { value: "Tirupathur", label: "Tirupathur / திருப்பத்தூர்" },
    { value: "Tiruppur", label: "Tiruppur / திருப்பூர்" },
    { value: "Tiruvallur", label: "Tiruvallur / திருவள்ளூர்" },
    { value: "Tiruvannamalai", label: "Tiruvannamalai / திருவண்ணாமலை" },
    { value: "Tiruvarur", label: "Tiruvarur / திருவாரூர்" },
    { value: "Vellore", label: "Vellore / வேலூர்" },
    { value: "Viluppuram", label: "Viluppuram / விழுப்புரம்" },
    { value: "Virudhunagar", label: "Virudhunagar / விருதுநகர்" }
];

export const TN_TALUKS: Record<string, { value: string, label: string }[]> = {
    "Ariyalur": [
        { value: "Ariyalur", label: "Ariyalur / அரியலூர்" },
        { value: "Sendurai", label: "Sendurai / செந்துறை" },
        { value: "Udayarpalayam", label: "Udayarpalayam / உடையார்பாளையம்" },
        { value: "Andimadam", label: "Andimadam / ஆண்டிமடம்" }
    ],
    "Chengalpattu": [
        { value: "Chengalpattu", label: "Chengalpattu / செங்கல்பட்டு" },
        { value: "Cheyyur", label: "Cheyyur / செய்யூர்" },
        { value: "Maduranthakam", label: "Maduranthakam / மதுராந்தகம்" },
        { value: "Pallavaram", label: "Pallavaram / பல்லாவரம்" },
        { value: "Tambaram", label: "Tambaram / தாம்பரம்" },
        { value: "Thiruporur", label: "Thiruporur / திருப்போரூர்" },
        { value: "Vandalur", label: "Vandalur / வண்டலூர்" }
    ],
    "Chennai": [
        { value: "Alandur", label: "Alandur / ஆலந்தூர்" },
        { value: "Ambattur", label: "Ambattur / அம்பத்தூர்" },
        { value: "Aminjikarai", label: "Aminjikarai / அமைந்தகரை" },
        { value: "Ayanavaram", label: "Ayanavaram / அயனாவரம்" },
        { value: "Egmore", label: "Egmore / எழும்பூர்" },
        { value: "Guindy", label: "Guindy / கிண்டி" },
        { value: "Madhavaram", label: "Madhavaram / மாதவரம்" },
        { value: "Maduravoyal", label: "Maduravoyal / மதுரவாயல்" },
        { value: "Mambalam", label: "Mambalam / மாம்பலம்" },
        { value: "Mylapore", label: "Mylapore / மயிலாப்பூர்" },
        { value: "Perambur", label: "Perambur / பெரம்பூர்" },
        { value: "Purasawalkam", label: "Purasawalkam / புரசைவாக்கம்" },
        { value: "Sholinganallur", label: "Sholinganallur / சோழிங்கநல்லூர்" },
        { value: "T Nagar", label: "T Nagar / தியாகராய நகர்" },
        { value: "Tiruvottiyur", label: "Tiruvottiyur / திருவொற்றியூர்" },
        { value: "Velachery", label: "Velachery / வேளச்சேரி" }
    ],
    "Coimbatore": [
        { value: "Coimbatore North", label: "Coimbatore North / வடக்கு கோயம்புத்தூர்" },
        { value: "Coimbatore South", label: "Coimbatore South / தெற்கு கோயம்புத்தூர்" },
        { value: "Coimbatore West", label: "Coimbatore West / மேற்கு கோயம்புத்தூர்" },
        { value: "Perur", label: "Perur / பேரூர்" },
        { value: "Madukkarai", label: "Madukkarai / மதுக்கரை" },
        { value: "Annur", label: "Annur / அன்னூர்" },
        { value: "Mettupalayam", label: "Mettupalayam / மேட்டுப்பாளையம்" },
        { value: "Sulur", label: "Sulur / சூலூர்" },
        { value: "Pollachi", label: "Pollachi / பொள்ளாச்சி" },
        { value: "Valparai", label: "Valparai / வால்பாறை" },
        { value: "Kinathukadavu", label: "Kinathukadavu / கிணத்துக்கடவு" }
    ],
    "Cuddalore": [
        { value: "Cuddalore", label: "Cuddalore / கடலூர்" },
        { value: "Kurinjipadi", label: "Kurinjipadi / குறிஞ்சிப்பாடி" },
        { value: "Panruti", label: "Panruti / பண்ருட்டி" },
        { value: "Chidambaram", label: "Chidambaram / சிதம்பரம்" },
        { value: "Kattumannarkoil", label: "Kattumannarkoil / காட்டுமன்னார்கோயில்" },
        { value: "Bhuvanagiri", label: "Bhuvanagiri / புவனகிரி" },
        { value: "Virudhachalam", label: "Virudhachalam / விருத்தாசலம்" },
        { value: "Tittakudi", label: "Tittakudi / திட்டக்குடி" },
        { value: "Srimushnam", label: "Srimushnam / ஸ்ரீமுஷ்ணம்" },
        { value: "Veppur", label: "Veppur / வேப்பூர்" }
    ],
    "Dharmapuri": [
        { value: "Dharmapuri", label: "Dharmapuri / தர்மபுரி" },
        { value: "Harur", label: "Harur / அரூர்" },
        { value: "Karimangalam", label: "Karimangalam / காரிமங்கலம்" },
        { value: "Nallampalli", label: "Nallampalli / நல்லம்பள்ளி" },
        { value: "Palacode", label: "Palacode / பாலக்கோடு" },
        { value: "Pappireddipatti", label: "Pappireddipatti / பாப்பிரெட்டிப்பட்டி" },
        { value: "Pennagaram", label: "Pennagaram / பென்னாகரம்" }
    ],
    "Dindigul": [
        { value: "Dindigul East", label: "Dindigul East / கிழக்கு திண்டுக்கல்" },
        { value: "Dindigul West", label: "Dindigul West / மேற்கு திண்டுக்கல்" },
        { value: "Oddanchatram", label: "Oddanchatram / ஒட்டன்சத்திரம்" },
        { value: "Palani", label: "Palani / பழனி" },
        { value: "Nilakottai", label: "Nilakottai / நிலக்கோட்டை" },
        { value: "Natham", label: "Natham / நத்தம்" },
        { value: "Kodaikanal", label: "Kodaikanal / கொடைக்கானல்" },
        { value: "Vedasandur", label: "Vedasandur / வேடசந்தூர்" },
        { value: "Gujiliamparai", label: "Gujiliamparai / குஜிலியம்பாறை" }
    ],
    "Erode": [
        { value: "Erode", label: "Erode / ஈரோடு" },
        { value: "Kodumudi", label: "Kodumudi / கொடுமுடி" },
        { value: "Modakkurichi", label: "Modakkurichi / மொடக்குறிச்சி" },
        { value: "Perundurai", label: "Perundurai / பெருந்துறை" },
        { value: "Bhavani", label: "Bhavani / பவானி" },
        { value: "Anthiyur", label: "Anthiyur / அந்தியூர்" },
        { value: "Gobichettipalayam", label: "Gobichettipalayam / கோபிசெட்டிபாளையம்" },
        { value: "Sathyamangalam", label: "Sathyamangalam / சத்தியமங்கலம்" },
        { value: "Thalavadi", label: "Thalavadi / தாளவாடி" },
        { value: "Nambiyur", label: "Nambiyur / நம்பியூர்" }
    ],
    "Kallakurichi": [
        { value: "Kallakurichi", label: "Kallakurichi / கள்ளக்குறிச்சி" },
        { value: "Sankarapuram", label: "Sankarapuram / சங்கராபுரம்" },
        { value: "Chinnasalem", label: "Chinnasalem / சின்னசேலம்" },
        { value: "Tirukkoyilur", label: "Tirukkoyilur / திருக்கோவிலூர்" },
        { value: "Ulundurpet", label: "Ulundurpet / உளுந்தூர்ப்பேட்டை" },
        { value: "Kalvarayan Hills", label: "Kalvarayan Hills / கல்வராயன் மலை" }
    ],
    "Kancheepuram": [
        { value: "Kancheepuram", label: "Kancheepuram / காஞ்சிபுரம்" },
        { value: "Walajabad", label: "Walajabad / வாலாஜாபாத்" },
        { value: "Sriperumbudur", label: "Sriperumbudur / ஸ்ரீபெரும்புதூர்" },
        { value: "Kundrathur", label: "Kundrathur / குன்றத்தூர்" },
        { value: "Uthiramerur", label: "Uthiramerur / உத்திரமேரூர்" }
    ],
    "Kanyakumari": [
        { value: "Agastheeswaram", label: "Agastheeswaram / அகஸ்தீஸ்வரம்" },
        { value: "Thovalai", label: "Thovalai / தோவாளை" },
        { value: "Kalkulam", label: "Kalkulam / கல்குளம்" },
        { value: "Vilavancode", label: "Vilavancode / விளவங்கோடு" },
        { value: "Killiyoor", label: "Killiyoor / கிள்ளியூர்" },
        { value: "Thiruvattar", label: "Thiruvattar / திருவட்டாறு" }
    ],
    "Karur": [
        { value: "Karur", label: "Karur / கரூர்" },
        { value: "Aravakurichi", label: "Aravakurichi / அரவக்குறிச்சி" },
        { value: "Manmangalam", label: "Manmangalam / மண்மங்கலம்" },
        { value: "Pugalur", label: "Pugalur / புகலூர்" },
        { value: "Kulithalai", label: "Kulithalai / குளித்தலை" },
        { value: "Krishnarayapuram", label: "Krishnarayapuram / கிருஷ்ணராயபுரம்" },
        { value: "Kadavur", label: "Kadavur / கடவூர்" }
    ],
    "Krishnagiri": [
        { value: "Krishnagiri", label: "Krishnagiri / கிருஷ்ணகிரி" },
        { value: "Hosur", label: "Hosur / ஓசூர்" },
        { value: "Denkanikottai", label: "Denkanikottai / தேன்கனிக்கோட்டை" },
        { value: "Shoolagiri", label: "Shoolagiri / சூளகிரி" },
        { value: "Bargur", label: "Bargur / பர்கூர்" },
        { value: "Pochampalli", label: "Pochampalli / போச்சம்பள்ளி" },
        { value: "Uthangarai", label: "Uthangarai / ஊத்தங்கரை" },
        { value: "Anchetti", label: "Anchetti / அஞ்செட்டி" }
    ],
    "Madurai": [
        { value: "Madurai East", label: "Madurai East / கிழக்கு மதுரை" },
        { value: "Madurai West", label: "Madurai West / மேற்கு மதுரை" },
        { value: "Madurai North", label: "Madurai North / வடக்கு மதுரை" },
        { value: "Madurai South", label: "Madurai South / தெற்கு மதுரை" },
        { value: "Madurai Central", label: "Madurai Central / மத்திய மதுரை" },
        { value: "Melur", label: "Melur / மேலூர்" },
        { value: "Vadipatti", label: "Vadipatti / வாடிப்பட்டி" },
        { value: "Thirumangalam", label: "Thirumangalam / திருமங்கலம்" },
        { value: "Usilampatti", label: "Usilampatti / உசிலம்பட்டி" },
        { value: "Peraiyur", label: "Peraiyur / பேரையூர்" },
        { value: "Tiruparankundram", label: "Tiruparankundram / திருப்பரங்குன்றம்" }
    ],
    "Mayiladuthurai": [
        { value: "Mayiladuthurai", label: "Mayiladuthurai / மயிலாடுதுறை" },
        { value: "Sirkazhi", label: "Sirkazhi / சீர்காழி" },
        { value: "Tharangambadi", label: "Tharangambadi / தரங்கம்பாடி" },
        { value: "Kuthalam", label: "Kuthalam / குத்தாலம்" }
    ],
    "Nagapattinam": [
        { value: "Nagapattinam", label: "Nagapattinam / நாகப்பட்டினம்" },
        { value: "Kilvelur", label: "Kilvelur / கீழ்வேளூர்" },
        { value: "Thirukkuvalai", label: "Thirukkuvalai / திருக்குவளை" },
        { value: "Vedaranyam", label: "Vedaranyam / வேதாரண்யம்" }
    ],
    "Namakkal": [
        { value: "Namakkal", label: "Namakkal / நாமக்கல்" },
        { value: "Rasipuram", label: "Rasipuram / ராசிபுரம்" },
        { value: "Senthamangalam", label: "Senthamangalam / சேந்தமங்கலம்" },
        { value: "Paramathi Velur", label: "Paramathi Velur / பரமத்தி வேலூர்" },
        { value: "Tiruchengode", label: "Tiruchengode / திருச்செங்கோடு" },
        { value: "Kumarapalayam", label: "Kumarapalayam / குமாரபாளையம்" },
        { value: "Mohanur", label: "Mohanur / மோகனூர்" },
        { value: "Kolli Hills", label: "Kolli Hills / கொல்லி மலை" }
    ],
    "Nilgiris": [
        { value: "Udhagamandalam", label: "Udhagamandalam / உதகமண்டலம்" },
        { value: "Kundah", label: "Kundah / குந்தா" },
        { value: "Coonoor", label: "Coonoor / குன்னூர்" },
        { value: "Kotagiri", label: "Kotagiri / கோத்தகிரி" },
        { value: "Gudalur", label: "Gudalur / கூடலூர்" },
        { value: "Pandalur", label: "Pandalur / பந்தலூர்" }
    ],
    "Perambalur": [
        { value: "Perambalur", label: "Perambalur / பெரம்பலூர்" },
        { value: "Kunnam", label: "Kunnam / குன்னம்" },
        { value: "Alathur", label: "Alathur / ஆலத்தூர்" },
        { value: "Veppanthattai", label: "Veppanthattai / வேப்பந்தட்டை" }
    ],
    "Pudukkottai": [
        { value: "Pudukkottai", label: "Pudukkottai / புதுக்கோட்டை" },
        { value: "Gandarvakottai", label: "Gandarvakottai / கந்தர்வக்கோட்டை" },
        { value: "Kulathur", label: "Kulathur / குளத்தூர்" },
        { value: "Illuppur", label: "Illuppur / இல்லுப்பூர்" },
        { value: "Alangudi", label: "Alangudi / ஆலங்குடி" },
        { value: "Aranthangi", label: "Aranthangi / அறந்தாங்கி" },
        { value: "Ponnamaravathi", label: "Ponnamaravathi / பொன்னமராவதி" },
        { value: "Thirumayam", label: "Thirumayam / திருமயம்" },
        { value: "Avadaiyarkoil", label: "Avadaiyarkoil / ஆவுடையார்கோவில்" },
        { value: "Manamelkudi", label: "Manamelkudi / மணமேல்குடி" },
        { value: "Karambakudi", label: "Karambakudi / கரம்பக்குடி" }
    ],
    "Ramanathapuram": [
        { value: "Ramanathapuram", label: "Ramanathapuram / இராமநாதபுரம்" },
        { value: "Rameswaram", label: "Rameswaram / ராமேஸ்வரம்" },
        { value: "Tiruvadanai", label: "Tiruvadanai / திருவடானை" },
        { value: "Paramakudi", label: "Paramakudi / பரமக்குடி" },
        { value: "Mudukulathur", label: "Mudukulathur / முதுகுளத்தூர்" },
        { value: "Kadaladi", label: "Kadaladi / கடலாடி" },
        { value: "Kamuthi", label: "Kamuthi / கமுதி" },
        { value: "Kilaselvanur", label: "Kilaselvanur / கீழச்செல்வனூர்" }
    ],
    "Ranipet": [
        { value: "Ranipet", label: "Ranipet / இராணிப்பேட்டை" },
        { value: "Walajah", label: "Walajah / வாலாஜா" },
        { value: "Arcot", label: "Arcot / ஆற்காடு" },
        { value: "Nemili", label: "Nemili / நெமிலி" },
        { value: "Arakkonam", label: "Arakkonam / அரக்கோணம்" },
        { value: "Sholinghur", label: "Sholinghur / சோளிங்கர்" },
        { value: "Kalavai", label: "Kalavai / கலவை" }
    ],
    "Salem": [
        { value: "Salem", label: "Salem / சேலம்" },
        { value: "Salem South", label: "Salem South / தெற்கு சேலம்" },
        { value: "Salem West", label: "Salem West / மேற்கு சேலம்" },
        { value: "Omalur", label: "Omalur / ஓமலூர்" },
        { value: "Mettur", label: "Mettur / மேட்டூர்" },
        { value: "Edappadi", label: "Edappadi / எடப்பாடி" },
        { value: "Sankari", label: "Sankari / சங்ககிரி" },
        { value: "Yercaud", label: "Yercaud / ஏற்காடு" },
        { value: "Valapady", label: "Valapady / வாழப்பாடி" },
        { value: "Attur", label: "Attur / ஆத்தூர்" },
        { value: "Gangavalli", label: "Gangavalli / கெங்கவல்லி" },
        { value: "Pethanaickenpalayam", label: "Pethanaickenpalayam / பெத்தநாயக்கன்பாளையம்" },
        { value: "Kadayampatti", label: "Kadayampatti / காடையாம்பட்டி" }
    ],
    "Sivaganga": [
        { value: "Sivaganga", label: "Sivaganga / சிவகங்கை" },
        { value: "Manamadurai", label: "Manamadurai / மானாமதுரை" },
        { value: "Ilayangudi", label: "Ilayangudi / இளையான்குடி" },
        { value: "Thiruppuvanam", label: "Thiruppuvanam / திருப்புவனம்" },
        { value: "Karaikudi", label: "Karaikudi / காரைக்குடி" },
        { value: "Devakottai", label: "Devakottai / தேவகோட்டை" },
        { value: "Tiruppathur", label: "Tiruppathur / திருப்பத்தூர் (சிவகங்கை)" },
        { value: "Singampuneri", label: "Singampuneri / சிங்கம்புணரி" },
        { value: "Kalayarkoil", label: "Kalayarkoil / காளையார்கோவில்" }
    ],
    "Tenkasi": [
        { value: "Tenkasi", label: "Tenkasi / தென்காசி" },
        { value: "Shenkottai", label: "Shenkottai / செங்கோட்டை" },
        { value: "Kadayanallur", label: "Kadayanallur / கடையநல்லூர்" },
        { value: "Sivagiri", label: "Sivagiri / சிவகிரி" },
        { value: "Sankarankovil", label: "Sankarankovil / சங்கரன்கோவில்" },
        { value: "Thiruvengadam", label: "Thiruvengadam / திருவேங்கடம்" },
        { value: "Alangulam", label: "Alangulam / ஆலங்குளம்" },
        { value: "Keelapavoor", label: "Keelapavoor / கீழப்பாவூர்" }
    ],
    "Thanjavur": [
        { value: "Thanjavur", label: "Thanjavur / தஞ்சாவூர்" },
        { value: "Thiruvaiyaru", label: "Thiruvaiyaru / திருவையாறு" },
        { value: "Orathanadu", label: "Orathanadu / ஒரத்தநாடு" },
        { value: "Pattukkottai", label: "Pattukkottai / பட்டுக்கோட்டை" },
        { value: "Peravurani", label: "Peravurani / பேராவூரணி" },
        { value: "Kumbakonam", label: "Kumbakonam / கும்பகோணம்" },
        { value: "Papanasam", label: "Papanasam / பாபநாசம்" },
        { value: "Thiruvidaimarudur", label: "Thiruvidaimarudur / திருவிடைமருதூர்" },
        { value: "Boothalur", label: "Boothalur / பூதலூர்" }
    ],
    "Theni": [
        { value: "Theni", label: "Theni / தேனி" },
        { value: "Periyakulam", label: "Periyakulam / பெரியகுளம்" },
        { value: "Andipatti", label: "Andipatti / ஆண்டிபட்டி" },
        { value: "Uthamapalayam", label: "Uthamapalayam / உத்தமபாளையம்" },
        { value: "Bodinayakanur", label: "Bodinayakanur / போடிநாயக்கனூர்" }
    ],
    "Thoothukudi": [
        { value: "Thoothukudi", label: "Thoothukudi / தூத்துக்குடி" },
        { value: "Srivaikuntam", label: "Srivaikuntam / ஸ்ரீவைகுண்டம்" },
        { value: "Tiruchendur", label: "Tiruchendur / திருச்செந்தூர்" },
        { value: "Sathankulam", label: "Sathankulam / சாத்தான்குளம்" },
        { value: "Eral", label: "Eral / ஏரல்" },
        { value: "Kovilpatti", label: "Kovilpatti / கோவில்பட்டி" },
        { value: "Ottapidaram", label: "Ottapidaram / ஓட்டப்பிடாரம்" },
        { value: "Ettayapuram", label: "Ettayapuram / எட்டயபுரம்" },
        { value: "Vilathikulam", label: "Vilathikulam / விளாத்திகுளம்" },
        { value: "Kayathar", label: "Kayathar / கயத்தாறு" }
    ],
    "Tiruchirappalli": [
        { value: "Tiruchirappalli East", label: "Tiruchirappalli East / கிழக்கு திருச்சி" },
        { value: "Tiruchirappalli West", label: "Tiruchirappalli West / மேற்கு திருச்சி" },
        { value: "Srirangam", label: "Srirangam / ஸ்ரீரங்கம்" },
        { value: "Manachanallur", label: "Manachanallur / மண்ணச்சநல்லூர்" },
        { value: "Lalgudi", label: "Lalgudi / லால்குடி" },
        { value: "Manapparai", label: "Manapparai / மணப்பாறை" },
        { value: "Musiri", label: "Musiri / முசிறி" },
        { value: "Thuraiyur", label: "Thuraiyur / துறையூர்" },
        { value: "Thottiam", label: "Thottiam / தொட்டியம்" },
        { value: "Tiruverumbur", label: "Tiruverumbur / திருவெறும்பூர்" },
        { value: "Marungapuri", label: "Marungapuri / மருங்காபுரி" }
    ],
    "Tirunelveli": [
        { value: "Tirunelveli", label: "Tirunelveli / திருநெல்வேலி" },
        { value: "Palayamkottai", label: "Palayamkottai / பாளையங்கோட்டை" },
        { value: "Ambasamudram", label: "Ambasamudram / அம்பாசமுத்திரம்" },
        { value: "Cheranmahadevi", label: "Cheranmahadevi / சேரன்மகாதேவி" },
        { value: "Radhapuram", label: "Radhapuram / இராதாபுரம்" },
        { value: "Nanguneri", label: "Nanguneri / நாங்குநேரி" },
        { value: "Tisayanvilai", label: "Tisayanvilai / திசையன்விளை" }
    ],
    "Tirupathur": [
        { value: "Tirupathur", label: "Tirupathur / திருப்பத்தூர்" },
        { value: "Vaniyambadi", label: "Vaniyambadi / வாணியம்பாடி" },
        { value: "Ambur", label: "Ambur / ஆம்பூர்" },
        { value: "Natrampalli", label: "Natrampalli / நாட்டறம்பள்ளி" }
    ],
    "Tiruppur": [
        { value: "Tiruppur North", label: "Tiruppur North / வடக்கு திருப்பூர்" },
        { value: "Tiruppur South", label: "Tiruppur South / தெற்கு திருப்பூர்" },
        { value: "Avinashi", label: "Avinashi / அவினாசி" },
        { value: "Palladam", label: "Palladam / பல்லடம்" },
        { value: "Dharapuram", label: "Dharapuram / தாராபுரம்" },
        { value: "Kangeyam", label: "Kangeyam / காங்கேயம்" },
        { value: "Udumalaipettai", label: "Udumalaipettai / உடுமலைப்பேட்டை" },
        { value: "Madathukulam", label: "Madathukulam / மடத்துக்குளம்" },
        { value: "Oothukuli", label: "Oothukuli / ஊத்துக்குளி" }
    ],
    "Tiruvallur": [
        { value: "Tiruvallur", label: "Tiruvallur / திருவள்ளூர்" },
        { value: "Poonamallee", label: "Poonamallee / பூந்தமல்லி" },
        { value: "Avadi", label: "Avadi / ஆவடி" },
        { value: "Tiruttani", label: "Tiruttani / திருத்தணி" },
        { value: "Pallipattu", label: "Pallipattu / பள்ளிப்பட்டு" },
        { value: "Gummidipoondi", label: "Gummidipoondi / கும்மிடிப்பூண்டி" },
        { value: "Ponneri", label: "Ponneri / பொன்னேரி" },
        { value: "Uthukkottai", label: "Uthukkottai / ஊத்துக்கோட்டை" },
        { value: "R K Pet", label: "R K Pet / ஆர்.கே.பேட்டை" }
    ],
    "Tiruvannamalai": [
        { value: "Tiruvannamalai", label: "Tiruvannamalai / திருவண்ணாமலை" },
        { value: "Chengam", label: "Chengam / செங்கம்" },
        { value: "Polur", label: "Polur / போளூர்" },
        { value: "Arni", label: "Arni / ஆரணி" },
        { value: "Vandavasi", label: "Vandavasi / வந்தவாசி" },
        { value: "Cheyyar", label: "Cheyyar / செய்யாறு" },
        { value: "Kalasapakkam", label: "Kalasapakkam / கலசப்பாக்கம்" },
        { value: "Jawadhu Hills", label: "Jawadhu Hills / ஜவ்வாது மலை" },
        { value: "Kilpennathur", label: "Kilpennathur / கீழ்ப்பென்னாத்தூர்" },
        { value: "Chetpet", label: "Chetpet / சேத்துப்பட்டு" },
        { value: "Jamunamarathoor", label: "Jamunamarathoor / ஜமுனாமரத்தூர்" }
    ],
    "Tiruvarur": [
        { value: "Tiruvarur", label: "Tiruvarur / திருவாரூர்" },
        { value: "Nannilam", label: "Nannilam / நன்னிலம்" },
        { value: "Kudavasal", label: "Kudavasal / குடவாசல்" },
        { value: "Valangaiman", label: "Valangaiman / வலங்கைமான்" },
        { value: "Mannargudi", label: "Mannargudi / மன்னார்குடி" },
        { value: "Needamangalam", label: "Needamangalam / நீடாமங்கலம்" },
        { value: "Thiruthuraipoondi", label: "Thiruthuraipoondi / திருத்துறைப்பூண்டி" },
        { value: "Koothanallur", label: "Koothanallur / கூத்தாநல்லூர்" }
    ],
    "Vellore": [
        { value: "Vellore", label: "Vellore / வேலூர்" },
        { value: "Katpadi", label: "Katpadi / காட்பாடி" },
        { value: "Gudiyatham", label: "Gudiyatham / குடியாத்தம்" },
        { value: "Anaicut", label: "Anaicut / ஆனைக்கட்டு" },
        { value: "Pernambut", label: "Pernambut / பேரணாம்பட்டு" },
        { value: "K V Kuppam", label: "K V Kuppam / கே.வி.குப்பம்" }
    ],
    "Viluppuram": [
        { value: "Viluppuram", label: "Viluppuram / விழுப்புரம்" },
        { value: "Vikravandi", label: "Vikravandi / விக்கிரவாண்டி" },
        { value: "Vananur", label: "Vananur / வானூர்" },
        { value: "Gingee", label: "Gingee / செஞ்சி" },
        { value: "Melmalaiyanur", label: "Melmalaiyanur / மேல்மலையனூர்" },
        { value: "Tindivanam", label: "Tindivanam / திண்டிவனம்" },
        { value: "Marakkanam", label: "Marakkanam / மரக்காணம்" },
        { value: "Kandachipuram", label: "Kandachipuram / கண்டாச்சிபுரம்" },
        { value: "Thiruvennainallur", label: "Thiruvennainallur / திருவெண்ணெய்நல்லூர்" }
    ],
    "Virudhunagar": [
        { value: "Virudhunagar", label: "Virudhunagar / விருதுநகர்" },
        { value: "Aruppukkottai", label: "Aruppukkottai / அருப்புக்கோட்டை" },
        { value: "Sariakudi", label: "Sariakudi / காரியாபட்டி" },
        { value: "Sattur", label: "Sattur / சாத்தூர்" },
        { value: "Sivakasi", label: "Sivakasi / சிவகாசி" },
        { value: "Srivilliputhur", label: "Srivilliputhur / ஸ்ரீவில்லிபுத்தூர்" },
        { value: "Rajapalayam", label: "Rajapalayam / ராஜபாளையம்" },
        { value: "Vembakottai", label: "Vembakottai / வெம்பக்கோட்டை" },
        { value: "Watrap", label: "Watrap / வத்திராயிருப்பு" },
        { value: "Tiruchuli", label: "Tiruchuli / திருச்சுழி" }
    ]
};
