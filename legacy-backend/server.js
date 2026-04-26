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
app.use(helmet());

// CORS - allow localhost in dev + all Vercel deployments
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://agri-trace-ai-big-dream.vercel.app',
    process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (origin.endsWith('.vercel.app')) return callback(null, true);
        if (allowedOrigins.some(o => origin.startsWith(o))) return callback(null, true);
        callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true
}));

app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500
});
app.use('/api', limiter);

// ─── Serverless MongoDB Connection Cache ───────────────────────────────────
// CRITICAL for Vercel: reuse existing connection across warm function invocations
// Without this, every request would open a new MongoDB connection and leak them.
let cachedConnection = null;

async function connectDB() {
    // Already connected — reuse it (warm serverless function)
    if (cachedConnection && mongoose.connection.readyState === 1) {
        return cachedConnection;
    }
    // First call or cold start — create new connection
    cachedConnection = await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    return cachedConnection;
}

// Connect before handling any request (non-blocking for serverless)
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        console.error('❌ MongoDB connection failed:', err.message);
        res.status(503).json({ status: 'error', message: 'Database unavailable. Please try again shortly.' });
    }
});

// ─── Routes ───
app.get('/', (req, res) => {
    res.json({ message: 'AgriTraceTN API is running', version: '1.0.0' });
});

// Health check — works even before DB connects
app.get('/health', (req, res) => {
    const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    res.json({
        status: 'ok',
        db: states[mongoose.connection.readyState] || 'unknown',
        uptime: process.uptime().toFixed(0) + 's',
        env: process.env.NODE_ENV || 'development'
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

// ─── Error Handling ───
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ status: 'error', message: err.message || 'Something went wrong!' });
});

// ─── Start Server (only when running locally, NOT on Vercel) ─────────────────
// Vercel manages the server lifecycle — module.exports = app is what Vercel uses.
// When running locally with `node server.js` or `nodemon`, the listen() runs.
if (process.env.VERCEL !== '1') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, '0.0.0.0', () => {
        // Sync prices once on startup (only in persistent server mode)
        connectDB().then(() => MarketPriceService.fetchAndSyncPrices());
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
}

// ─── Export for Vercel Serverless ─────────────────────────────────────────────
module.exports = app;
