const mongoose = require('mongoose');

const harvestApplicationSchema = new mongoose.Schema({
    // Auto-generated reference
    applicationId: { type: String, unique: true, required: true },

    // ─── Farmer Details ─────────────────────────────────────
    farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    farmerName: { type: String, required: true },
    farmerDistrict: { type: String, required: true },
    farmerTaluk: { type: String },
    farmerVillage: { type: String },
    farmerMobile: { type: String },
    farmerAadhaar: { type: String },
    farmerUzhavarCard: { type: String },
    farmerLandDetails: { type: String },
    farmerCropDetails: { type: String },

    // ─── Crop Details ────────────────────────────────────────
    cropType: { type: String, required: true },
    cropVariety: { type: String },
    quantityKg: { type: Number, required: true, min: 1 },
    harvestDate: { type: Date, required: true },        // Must be ≥ 2 days from submission
    fieldAreaAcres: { type: Number },
    gpsLocation: { type: String },
    isOrganic: { type: Boolean, default: false },
    isFairTrade: { type: Boolean, default: false },
    notes: { type: String },
    photoUrls: [{ type: String }],                      // Compressed base64 photos

    // ─── Pricing ─────────────────────────────────────────────
    farmerPricePerKg: { type: Number, required: true, min: 0.01 },   // Farmer's initial price
    processorAdjustedPrice: { type: Number },                          // Processor's adjusted price (±0.2% max)
    finalPricePerKg: { type: Number },                                 // Locked after approval
    totalValue: { type: Number },                                      // finalPrice × quantity

    // ─── Workflow Status ─────────────────────────────────────
    status: {
        type: String,
        enum: [
            'pending',          // Farmer submitted, awaiting inspection
            'inspecting',       // Processor started inspection
            'approved',         // Processor certified & approved → farmer records batch
            'rejected',         // Processor rejected
            'batch_recorded',   // Farmer recorded batch (weight, QR) → ready for marketplace
            'listed',           // Listed on marketplace
            'partially_sold',   // Some quantity purchased, remaining still for sale
            'sold',             // Entire quantity purchased → Sold Out
            'expired'           // Inspection deadline passed without action
        ],
        default: 'pending'
    },

    // ─── Inspection Details ──────────────────────────────────
    inspectionDeadline: { type: Date },                 // Auto-set: submissionDate + 3 days
    processorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    processorName: { type: String },
    inspectionDate: { type: Date },
    inspectionNotes: { type: String },
    qualityGrade: { type: String, enum: ['A+', 'A', 'B+', 'B', 'C', 'Rejected'] },
    organicVerified: { type: Boolean },
    pesticideResult: { type: String },
    phLevel: { type: String },
    certificationNo: { type: String },                  // Issued on approval
    processorApproval: { type: Boolean },

    // ─── Purchase Details (partial purchase support) ───────────────────────
    // Aggregate tracking
    soldQuantityKg: { type: Number, default: 0 },       // Total sold so far (累計)
    remainingQuantityKg: { type: Number },               // Auto-calculated in pre-validate
    purchaseTotalAmount: { type: Number, default: 0 },  // Running total revenue

    // Individual purchase records — one entry per transaction
    purchases: [{
        purchaseRef: { type: String },
        buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        buyerName: { type: String },
        buyerRole: { type: String, enum: ['retailer', 'consumer'] },
        purchaseDate: { type: Date, default: Date.now },
        quantityKg: { type: Number },
        pricePerKg: { type: Number },
        totalAmount: { type: Number },
        txHash: { type: String }
    }],

    // Legacy fields kept for backward compatibility
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    buyerName: { type: String },
    buyerRole: { type: String, enum: ['retailer', 'consumer'] },
    purchaseDate: { type: Date },
    purchaseQuantityKg: { type: Number },
    purchaseRef: { type: String },

    // ─── Batch Recording (after processor approval) ─────────
    batchId: { type: String },
    batchQrUrl: { type: String },
    batchRecordedWeight: { type: Number },         // Farmer can adjust weight during batch recording
    batchNotes: { type: String },
    batchRecordedAt: { type: Date },

    // ─── Blockchain ──────────────────────────────────────────
    txHash: { type: String },
    blockchainVerified: { type: Boolean, default: false },
    // Full blockchain event trail for TNAS monitoring
    blockchainEvents: [{
        action: { type: String },           // HARVEST_APPLICATION, CROP_INSPECTION, BATCH_RECORDED, CROP_PURCHASE
        txHash: { type: String },
        timestamp: { type: Date, default: Date.now },
        actor: { type: String },
        details: { type: mongoose.Schema.Types.Mixed }
    }],

    // ─── Timestamps ──────────────────────────────────────────
    submittedAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Auto-generate application ID and set inspection deadline BEFORE validation
harvestApplicationSchema.pre('validate', function (next) {
    this.updatedAt = new Date();

    if (!this.applicationId) {
        const ts = Date.now().toString(36).toUpperCase();
        this.applicationId = `HAR-TN-${ts}`;
    }

    // Auto-set inspection deadline: 3 days from submission
    if (!this.inspectionDeadline && this.submittedAt) {
        const deadline = new Date(this.submittedAt);
        deadline.setDate(deadline.getDate() + 3);
        this.inspectionDeadline = deadline;
    }

    // Calculate total value when final price is set
    if (this.finalPricePerKg && this.quantityKg) {
        this.totalValue = this.finalPricePerKg * this.quantityKg;
    }

    // Auto-calculate remainingQuantityKg
    const totalWeight = this.batchRecordedWeight || this.quantityKg || 0;
    const sold = this.soldQuantityKg || 0;
    this.remainingQuantityKg = Math.max(0, totalWeight - sold);

    next();
});

module.exports = mongoose.model('HarvestApplication', harvestApplicationSchema);
