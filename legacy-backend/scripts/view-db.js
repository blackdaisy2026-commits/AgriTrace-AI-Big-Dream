require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Batch = require('../models/Batch');
const Event = require('../models/Event');

const viewDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/agritrace');
        console.log('\n--- 📊 AgriTraceTN Database Snapshot ---\n');

        const userCount = await User.countDocuments();
        console.log(`👥 Users (${userCount}):`);
        const users = await User.find({}, 'name email role district');
        console.table(users.map(u => ({ Name: u.name, Email: u.email, Role: u.role, District: u.district })));

        const batchCount = await Batch.countDocuments();
        console.log(`\n📦 Batches (${batchCount}):`);
        const batches = await Batch.find({});
        console.table(batches.map(b => ({
            ID: b.batchId,
            Crop: b.cropType,
            Weight: b.weightKg + 'kg',
            Stage: b.currentStage,
            Verified: b.blockchainVerified ? '✅' : '❌'
        })));

        const eventCount = await Event.countDocuments();
        console.log(`\n🔗 Timeline Events (${eventCount}):`);
        const events = await Event.find({}).sort('-timestamp').limit(10);
        console.table(events.map(e => ({
            Batch: e.batchId,
            Stage: e.stage,
            Actor: e.actorName,
            Location: e.location,
            TxHash: e.txHash.substring(0, 10) + '...'
        })));

        console.log('\n----------------------------------------');
        process.exit(0);
    } catch (err) {
        console.error('Error viewing DB:', err);
        process.exit(1);
    }
};

viewDb();
