const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    batchId: { type: String, required: true, index: true },
    stage: { type: String, required: true },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    actorName: { type: String },
    location: { type: String },
    gps: { type: String },
    timestamp: { type: Date, default: Date.now },
    details: { type: Map, of: String },
    txHash: { type: String },
    blockchainVerified: { type: Boolean, default: false }
});

module.exports = mongoose.model('Event', eventSchema);
