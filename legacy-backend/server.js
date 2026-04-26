require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const batchRoutes = require('./routes/batches');
const eventRoutes = require('./routes/events');
const MarketPriceService = require('./services/marketPriceService');

const Batch = require('./models/Batch');
const Event = require('./models/Event');
const User = require('./models/User');

const app = express();

// ─── Middleware ───
app.use(helmet()); // Security headers

// CORS - allow localhost in dev + Vercel production + any Vercel preview URLs
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://agri-trace-ai-big-dream.vercel.app',  // production Vercel URL
    process.env.FRONTEND_URL,                        // from .env for flexibility
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, Render health checks, Postman)
        if (!origin) return callback(null, true);
        // Allow any Vercel preview deployment (*.vercel.app)
        if (origin.endsWith('.vercel.app')) return callback(null, true);
        // Allow explicitly whitelisted origins
        if (allowedOrigins.some(o => origin.startsWith(o))) return callback(null, true);
        callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true
}));

app.use(morgan('dev')); // Logging
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies (increased for photo uploads)

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500 // Increased for dashboard responsiveness
});
app.use('/api', limiter);

// ─── Routes ───
app.get('/', (req, res) => {
    res.json({ message: 'AgriTraceTN API is running', version: '1.0.0' });
});

// Health check endpoint — used by Render to verify the service is alive
app.get('/health', (req, res) => {
    const dbState = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    res.json({
        status: 'ok',
        db: dbState[require('mongoose').connection.readyState] || 'unknown',
        uptime: process.uptime().toFixed(0) + 's'
    });
});

// Explorer (Public Live View)
app.get('/api/explorer/live', async (req, res) => {
    try {
        const batches = await Batch.find().sort('-createdAt').limit(20);
        const events = await Event.find().sort('-timestamp').limit(20);
        const users = await User.find().select('-password').sort('-createdAt').limit(20);

        res.json({
            status: 'success',
            data: {
                batches: batches.map(b => ({
                    id: b.batchId,
                    crop: b.cropType + (b.cropType.toLowerCase().includes('tomato') ? ' 🍅' : b.cropType.toLowerCase().includes('banana') ? ' 🍌' : ' 📦'),
                    farmer: b.farmerName || 'Unknown',
                    district: b.district || 'TN',
                    weight: b.weightKg + 'kg',
                    mfgPrice: '₹' + Math.max(20, Math.round(b.weightKg * 0.05) + 18),
                    sellPrice: '₹' + Math.max(50, Math.round(b.weightKg * 0.12) + 45),
                    status: b.currentStage,
                    verified: b.blockchainVerified
                })),
                events: events.map(e => ({
                    id: e.txHash ? e.txHash.substring(0, 8) : '0x...',
                    stage: e.stage,
                    batch: e.batchId,
                    actor: e.actorName || 'System',
                    time: new Date(e.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
                    hash: e.txHash || 'Pending...'
                })),
                users: users.map(u => ({
                    name: u.name,
                    role: u.role.charAt(0).toUpperCase() + u.role.slice(1),
                    location: u.location || u.district || 'Tamil Nadu',
                    wallet: u.walletAddress ? u.walletAddress.substring(0, 10) + '...' : '0x...',
                    joined: new Date(u.createdAt).toLocaleString('en-IN', { month: 'short', year: 'numeric' })
                }))
            }
        });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

app.use('/api/auth', authRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/compensation', require('./routes/compensation'));
app.use('/api/harvest', require('./routes/harvest'));

// ─── DB Connection ───
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB');
        // Daily Crop Price Sync from data.gov.in
        MarketPriceService.fetchAndSyncPrices();
    })
    .catch(err => {
        console.error('❌ MongoDB connection error:', err.message);
        console.log('💡 Tip: Check your MONGO_URI environment variable on Render.');
        process.exit(1); // Exit so Render can restart the service
    });

// ─── Error Handling ───
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ status: 'error', message: err.message || 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0'; // Bind to all interfaces for LAN access
app.listen(PORT, HOST, () => {
    console.log(`🚀 Server is running on port ${PORT} in ${process.env.NODE_ENV} mode`);
    console.log(`🔗 Local:   http://localhost:${PORT}`);
    console.log(`🔗 Network: http://${process.env.HOST_IP || '10.117.145.160'}:${PORT}`);
});
