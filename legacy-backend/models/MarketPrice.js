const mongoose = require('mongoose');

const marketPriceSchema = new mongoose.Schema({
    commodity: { type: String, required: true },
    state: { type: String, required: true },
    district: { type: String },
    market: { type: String },
    minPrice: { type: Number, required: true }, // Per Kg
    maxPrice: { type: Number, required: true }, // Per Kg
    modalPrice: { type: Number, required: true }, // Per Kg
    priceUnit: { type: String, default: 'Kg' },
    arrivalDate: { type: String },
    rawApiResponse: { type: mongoose.Schema.Types.Mixed }, // Safe keeping
    updatedAt: { type: Date, default: Date.now }
});

// Index for faster searching
marketPriceSchema.index({ commodity: 1, district: 1, state: 1 });

module.exports = mongoose.model('MarketPrice', marketPriceSchema);
