const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
    batchId: { type: String, required: true, unique: true }, // e.g., TN-2026-X
    cropType: { type: String, required: true },
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    farmerName: { type: String },
    village: { type: String },
    district: { type: String },
    weightKg: { type: Number, required: true },
    isOrganic: { type: Boolean, default: false },
    isFairTrade: { type: Boolean, default: false },
    currentStage: {
        type: String,
        enum: ['Harvest', 'QualityCheck', 'Processing', 'Transport', 'Retail', 'Sold'],
        default: 'Harvest'
    },
    txHash: { type: String }, // Initial creation transaction
    blockchainVerified: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Batch', batchSchema);
