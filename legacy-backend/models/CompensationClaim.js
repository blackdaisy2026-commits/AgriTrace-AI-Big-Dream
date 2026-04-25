const mongoose = require('mongoose');

const compensationClaimSchema = new mongoose.Schema({
    // ── Farmer Details ────────────────────────────────────────────────────
    farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    farmerName: { type: String, required: true },
    aadhaarNo: { type: String, required: true },
    uzhavarAttaiNo: { type: String, required: true },
    mobileNo: { type: String, required: true },
    address: { type: String },
    district: { type: String, required: true },
    taluk: { type: String },
    village: { type: String },

    // ── Land & Crop Details ───────────────────────────────────────────────
    landDetails: { type: String, required: true },
    pattaNo: { type: String },
    surveyNo: { type: String },
    landAreaAcres: { type: Number },
    cropType: { type: String, required: true },
    cropSeason: { type: String },   // Kharif / Rabi / Summer

    // ── Damage Details (Farmer fills these) ───────────────────────────────
    damageReason: {
        type: String,
        enum: ['flood', 'cyclone', 'heavy_rain', 'drought', 'pest', 'hailstorm', 'other'],
        required: true
    },
    damageDate: { type: Date, required: true },
    damageDescription: { type: String },
    cropDamageStage: { type: String },   // seedling / vegetative / flowering / harvest
    estimatedLossAcres: { type: Number },

    // ── Geo-Tagged Photos (mandatory) ─────────────────────────────────────
    photoUrls: [{ type: String }],      // base64 images with geo-tag metadata
    photoGpsCoords: [{ type: String }], // "lat,lon" for each photo

    // ── Workflow Status ───────────────────────────────────────────────────
    status: {
        type: String,
        enum: [
            'pending',              // Farmer submitted, waiting for Processor
            'processor_review',     // Processor started inspection
            'processor_approved',   // Processor completed inspection & quoted amount → goes to Tahsildar
            'processor_rejected',   // Processor rejected
            'tahsildar_review',     // Tahsildar is reviewing
            'tahsildar_approved',   // Tahsildar approved → goes to DNA (Regulator)
            'tahsildar_rejected',   // Tahsildar rejected
            'dna_review',           // Regulator (DNA) is reviewing
            'approved',             // DNA approved, awaiting disbursement
            'disbursed',            // Fund transferred to farmer
            'rejected'              // Finally rejected
        ],
        default: 'pending'
    },

    // ── Processor Inspection Details ──────────────────────────────────────
    processorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    processorName: { type: String },
    processorEmployeeId: { type: String },
    inspectionDate: { type: Date },
    totalLandInspectedAcres: { type: Number },   // Processor measures total land
    damagedLandAcres: { type: Number },           // Processor measures damaged area
    damageLevelPercent: { type: Number },          // Processor estimates % crop loss
    cropDamageGrade: {
        type: String,
        enum: ['Mild (< 25%)', 'Moderate (25–50%)', 'Severe (50–75%)', 'Total Loss (> 75%)', null]
    },
    inspectionNotes: { type: String },
    estimatedAmount: { type: Number },            // Processor quotes the relief amount
    processorApproval: { type: Boolean },
    processorApprovedAt: { type: Date },

    // ── Tahsildar Verification Details ───────────────────────────────────
    tahsildarId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    tahsildarName: { type: String },
    tahsildarVerificationDate: { type: Date },
    tahsildarNotes: { type: String },
    tahsildarApproval: { type: Boolean },
    tahsildarApprovedAt: { type: Date },
    tahsildarApprovedAmount: { type: Number },    // Tahsildar can revise the amount

    // ── DNA (Regulator/Admin) Final Sanction ──────────────────────────────
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    adminNotes: { type: String },
    approvedAmount: { type: Number },
    adminApproval: { type: Boolean },
    adminApprovedAt: { type: Date },

    // ── Fund Disbursement ─────────────────────────────────────────────────
    disbursedAmount: { type: Number },
    disbursedAt: { type: Date },
    transactionRef: { type: String },

    // ── Blockchain Audit Trail ─────────────────────────────────────────────
    blockchainEvents: [{
        action: { type: String },          // RELIEF_APPLICATION, PROCESSOR_FIELD_INSPECTION, etc.
        txHash: { type: String },
        actor: { type: String },
        actorRole: { type: String },
        timestamp: { type: Date, default: Date.now },
        details: { type: mongoose.Schema.Types.Mixed }
    }],

    // ── Reference ─────────────────────────────────────────────────────────
    claimRefNo: { type: String, unique: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Auto-generate claim reference number before saving
compensationClaimSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    if (!this.claimRefNo) {
        const timestamp = Date.now().toString(36).toUpperCase();
        this.claimRefNo = `RF-TN-${timestamp}`;
    }
    next();
});

module.exports = mongoose.model('CompensationClaim', compensationClaimSchema);
