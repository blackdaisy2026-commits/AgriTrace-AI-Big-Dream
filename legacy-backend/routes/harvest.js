const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const HarvestApplication = require('../models/HarvestApplication');
const blockchain = require('../utils/blockchain');
const { protect, authorize } = require('../middleware/auth');
const MarketPriceService = require('../services/marketPriceService');

// ══════════════════════════════════════════════════════════════════════════════
// FARMER: Submit harvest application (must be ≥ 2 days before harvest date)
// Blockchain Event: HARVEST_APPLICATION
// ══════════════════════════════════════════════════════════════════════════════
router.post('/', protect, authorize('farmer'), async (req, res) => {
    try {
        const {
            cropType, cropVariety, quantityKg, harvestDate, fieldAreaAcres,
            gpsLocation, isOrganic, isFairTrade, notes, farmerPricePerKg, photoUrls
        } = req.body;

        // ── RULE: Harvest date must be at least 2 days from now ──
        const now = new Date();
        const harvest = new Date(harvestDate);
        const diffMs = harvest.getTime() - now.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);

        if (diffDays < 2) {
            return res.status(400).json({
                status: 'fail',
                message: 'Harvest date must be at least 2 days from today. Please plan your application in advance.'
            });
        }

        if (!farmerPricePerKg || farmerPricePerKg <= 0) {
            return res.status(400).json({
                status: 'fail',
                message: 'Please set a valid price per kg for your crop.'
            });
        }

        // ── RULE: Market Price Range Validation (data.gov.in integration) ──
        try {
            const priceData = await MarketPriceService.getPriceRange(cropType, req.user.district || req.body.district);
            if (priceData) {
                const price = Number(farmerPricePerKg);
                if (price < priceData.min || price > priceData.max) {
                    return res.status(400).json({
                        status: 'fail',
                        message: `விதிமீறல்: இன்றைய சந்தை விலையில் (₹${priceData.min} - ₹${priceData.max}/kg) உங்கள் விலை இல்லை. Rule: Price must be within market range of ₹${priceData.min} - ₹${priceData.max} per kg.`
                    });
                }
            }
        } catch (e) {
            console.error('Market price validation error:', e);
            // Don't block if API/DB service fails, but log it
        }

        // Log on blockchain
        const bcResult = await blockchain.logAction('HARVEST_APPLICATION', {
            farmer: req.user.name, cropType, quantityKg, harvestDate
        });

        const app = await HarvestApplication.create({
            farmerId: req.user._id,
            farmerName: req.user.name,
            farmerDistrict: req.user.district || req.body.district,
            farmerTaluk: req.user.taluk || req.body.taluk,
            farmerVillage: req.user.village || req.user.location || req.body.village,
            farmerMobile: req.user.mobileNo,
            farmerAadhaar: req.user.aadhaarNumber,
            farmerUzhavarCard: req.user.uzhavarCardNumber,
            farmerLandDetails: req.user.landDetails,
            farmerCropDetails: req.user.cropDetails,
            cropType,
            cropVariety,
            quantityKg: Number(quantityKg),
            harvestDate: harvest,
            fieldAreaAcres: fieldAreaAcres ? Number(fieldAreaAcres) : undefined,
            gpsLocation,
            isOrganic: isOrganic || false,
            isFairTrade: isFairTrade || false,
            notes,
            farmerPricePerKg: Number(farmerPricePerKg),
            photoUrls: photoUrls || [],
            txHash: bcResult.txHash,
            blockchainVerified: bcResult.verified,
            blockchainEvents: [{
                action: 'HARVEST_APPLICATION',
                txHash: bcResult.txHash,
                actor: req.user.name,
                details: { cropType, quantityKg: Number(quantityKg), farmerPricePerKg: Number(farmerPricePerKg), district: req.body.district || req.user.district, taluk: req.body.taluk || req.user.taluk }
            }]
        });

        res.status(201).json({
            status: 'success',
            data: { ...app.toObject(), photoUrls: undefined },
            message: `Application submitted! Reference: ${app.applicationId}. Inspection deadline: ${app.inspectionDeadline.toLocaleDateString('en-IN')}`
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
});

// ══════════════════════════════════════════════════════════════════════════════
// FARMER: Get my applications
// ══════════════════════════════════════════════════════════════════════════════
router.get('/my-applications', protect, authorize('farmer'), async (req, res) => {
    try {
        const apps = await HarvestApplication.find({ farmerId: req.user._id })
            .select('-photoUrls')
            .sort({ submittedAt: -1 });
        res.status(200).json({ status: 'success', data: apps });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
});

// ══════════════════════════════════════════════════════════════════════════════
// PUBLIC/CORE: Get market price range for a crop
// ══════════════════════════════════════════════════════════════════════════════
router.get('/market-price', protect, async (req, res) => {
    try {
        const { commodity, district } = req.query;
        if (!commodity) return res.status(400).json({ status: 'fail', message: 'Commodity is required' });

        const priceData = await MarketPriceService.getPriceRange(commodity, district || req.user.district);

        if (!priceData) {
            return res.status(404).json({ status: 'fail', message: 'சந்தை விலை விவரங்கள் கிடைக்கவில்லை (No market data found)' });
        }

        res.status(200).json({ status: 'success', data: priceData });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
});

// ══════════════════════════════════════════════════════════════════════════════
// ADMIN/REGULATOR: Trigger Market Price Sync
// ══════════════════════════════════════════════════════════════════════════════
router.post('/sync-market-prices', protect, authorize('regulator'), async (req, res) => {
    try {
        // Run in background
        MarketPriceService.fetchAndSyncPrices();
        res.status(200).json({ status: 'success', message: 'Market price sync started in background...' });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
});

// ══════════════════════════════════════════════════════════════════════════════
// PUBLIC: Market price (no auth) — for chatbot + consumers
// ══════════════════════════════════════════════════════════════════════════════
router.get('/market-price-public', async (req, res) => {
    try {
        const { commodity, district } = req.query;
        if (!commodity) return res.status(400).json({ status: 'fail', message: 'commodity required' });
        const priceData = await MarketPriceService.getPriceRange(commodity, district || 'Chennai');
        if (!priceData) return res.status(404).json({ status: 'fail', message: 'No market data found' });
        res.status(200).json({ status: 'success', data: priceData });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
});

// ══════════════════════════════════════════════════════════════════════════════
// PROCESSOR: Get applications for inspection
// RULE: Only same district + taluk processor can see applications
// ══════════════════════════════════════════════════════════════════════════════
router.get('/for-inspection', protect, authorize('processor'), async (req, res) => {
    try {
        const filter = {
            status: { $in: ['pending', 'inspecting'] }
        };

        // Processor sees ONLY their district + taluk applications (case-insensitive)
        if (req.user.district) {
            const cleanDistrict = req.user.district.split(' - ')[0].trim();
            filter.farmerDistrict = { $regex: new RegExp('^' + cleanDistrict + '($| -)', 'i') };
        }
        if (req.user.taluk) {
            const cleanTaluk = req.user.taluk.split(' - ')[0].trim();
            filter.$or = [
                { farmerTaluk: { $regex: new RegExp('^' + cleanTaluk + '($| -)', 'i') } },
                { farmerTaluk: { $in: [null, '', undefined] } }
            ];
        }

        // Auto-expire applications past deadline
        await HarvestApplication.updateMany(
            {
                status: { $in: ['pending', 'inspecting'] },
                inspectionDeadline: { $lt: new Date() }
            },
            { $set: { status: 'expired', updatedAt: new Date() } }
        );

        const apps = await HarvestApplication.find(filter)
            .select('-photoUrls')
            .sort({ inspectionDeadline: 1 });

        res.status(200).json({ status: 'success', data: apps });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
});

// ══════════════════════════════════════════════════════════════════════════════
// PROCESSOR: Submit inspection & certification
// Blockchain Event: CROP_INSPECTION
// ══════════════════════════════════════════════════════════════════════════════
router.patch('/:id/inspect', protect, authorize('processor'), async (req, res) => {
    try {
        const {
            qualityGrade, organicVerified, pesticideResult, phLevel,
            inspectionNotes, approved, adjustedPrice
        } = req.body;

        const app = await HarvestApplication.findById(req.params.id);
        if (!app) return res.status(404).json({ status: 'fail', message: 'Application not found' });

        // ── RULE: Check inspection deadline (3 days max) ──
        if (new Date() > new Date(app.inspectionDeadline)) {
            app.status = 'expired';
            await app.save();
            return res.status(400).json({
                status: 'fail',
                message: 'Inspection deadline has passed (3 days). This application has expired.'
            });
        }

        // ── RULE: Price adjustment validation (±0.2% max) ──
        let finalPrice = app.farmerPricePerKg;
        if (adjustedPrice !== undefined && adjustedPrice !== null) {
            const farmerPrice = app.farmerPricePerKg;
            const maxChange = farmerPrice * 0.002;
            const diff = Math.abs(adjustedPrice - farmerPrice);

            if (diff > maxChange + 0.01) {
                return res.status(400).json({
                    status: 'fail',
                    message: `Price adjustment exceeds ±0.2% limit. Farmer price: ₹${farmerPrice}/kg. Max allowed range: ₹${(farmerPrice - maxChange).toFixed(2)} — ₹${(farmerPrice + maxChange).toFixed(2)}. Your price: ₹${adjustedPrice}`
                });
            }
            finalPrice = Number(adjustedPrice);
        }

        const certNo = approved
            ? `CERT-TN-${app.farmerDistrict.substring(0, 3).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`
            : null;

        // Log on blockchain
        const bcResult = await blockchain.logAction('CROP_INSPECTION', {
            applicationId: app.applicationId,
            processor: req.user.name,
            approved,
            qualityGrade,
            finalPrice
        });

        // Update application
        app.processorId = req.user._id;
        app.processorName = req.user.name;
        app.inspectionDate = new Date();
        app.inspectionNotes = inspectionNotes;
        app.qualityGrade = qualityGrade || (approved ? 'A' : 'Rejected');
        app.organicVerified = organicVerified || false;
        app.pesticideResult = pesticideResult;
        app.phLevel = phLevel;
        app.processorAdjustedPrice = adjustedPrice !== undefined ? Number(adjustedPrice) : app.farmerPricePerKg;
        app.finalPricePerKg = approved ? finalPrice : null;
        app.certificationNo = certNo;
        app.processorApproval = approved;
        app.status = approved ? 'approved' : 'rejected';
        app.txHash = bcResult.txHash;
        app.blockchainVerified = bcResult.verified;

        // Add blockchain event trail
        app.blockchainEvents.push({
            action: 'CROP_INSPECTION',
            txHash: bcResult.txHash,
            actor: req.user.name,
            details: { approved, qualityGrade, finalPrice, certNo, inspectionNotes }
        });

        await app.save();

        const result = app.toObject();
        delete result.photoUrls;

        res.status(200).json({
            status: 'success',
            data: { application: result },
            message: approved
                ? `✅ Crop certified! Certificate: ${certNo}. Final price: ₹${finalPrice}/kg. Farmer can now record batch.`
                : `❌ Application rejected. Reason: ${inspectionNotes}`
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
});

// ══════════════════════════════════════════════════════════════════════════════
// FARMER: Record Batch (after processor approval)
// Farmer can adjust weight, add notes, generate QR → then goes to marketplace
// Blockchain Event: BATCH_RECORDED
// ══════════════════════════════════════════════════════════════════════════════
router.patch('/:id/record-batch', protect, authorize('farmer'), async (req, res) => {
    try {
        const { weightKg, batchNotes } = req.body;
        const app = await HarvestApplication.findById(req.params.id);

        if (!app) return res.status(404).json({ status: 'fail', message: 'Application not found' });

        if (app.farmerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ status: 'fail', message: 'You can only record batch for your own applications.' });
        }

        if (app.status !== 'approved') {
            return res.status(400).json({
                status: 'fail',
                message: `Cannot record batch. Application must be in 'approved' status. Current: '${app.status}'`
            });
        }

        const batchWeight = weightKg ? Number(weightKg) : app.quantityKg;
        const batchId = `BATCH-TN-${app.farmerDistrict.substring(0, 3).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

        // Log on blockchain
        const bcResult = await blockchain.logAction('BATCH_RECORDED', {
            applicationId: app.applicationId,
            batchId,
            farmer: req.user.name,
            cropType: app.cropType,
            weightKg: batchWeight,
            finalPricePerKg: app.finalPricePerKg
        });

        app.batchId = batchId;
        app.batchRecordedWeight = batchWeight;
        app.batchNotes = batchNotes || '';
        app.batchRecordedAt = new Date();
        app.status = 'batch_recorded';
        app.txHash = bcResult.txHash;

        // Recalculate total value with new weight
        if (app.finalPricePerKg) {
            app.totalValue = app.finalPricePerKg * batchWeight;
        }

        // Add blockchain event trail
        app.blockchainEvents.push({
            action: 'BATCH_RECORDED',
            txHash: bcResult.txHash,
            actor: req.user.name,
            details: { batchId, weightKg: batchWeight, batchNotes }
        });

        await app.save();

        const result = app.toObject();
        delete result.photoUrls;

        res.status(200).json({
            status: 'success',
            data: result,
            message: `✅ Batch recorded! ID: ${batchId}. Weight: ${batchWeight}kg. Now listed on marketplace!`
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
});

// ══════════════════════════════════════════════════════════════════════════════
// PUBLIC MARKETPLACE: Get all batch_recorded / listed crops
// ONLY visible AFTER farmer completes Record Batch (not just processor approval)
// ══════════════════════════════════════════════════════════════════════════════
router.get('/marketplace', async (req, res) => {
    try {
        const filter = {
            status: { $in: ['batch_recorded', 'listed', 'partially_sold'] }
        };

        if (req.query.crop) filter.cropType = { $regex: req.query.crop, $options: 'i' };
        if (req.query.district) filter.farmerDistrict = { $regex: req.query.district, $options: 'i' };
        if (req.query.organic === 'true') filter.organicVerified = true;

        const listings = await HarvestApplication.find(filter)
            .select('-photoUrls -processorId')
            .sort({ batchRecordedAt: -1 });

        // Auto-list batch_recorded crops (don't touch partially_sold)
        const ids = listings.filter(l => l.status === 'batch_recorded').map(l => l._id);
        if (ids.length > 0) {
            await HarvestApplication.updateMany(
                { _id: { $in: ids } },
                { $set: { status: 'listed', updatedAt: new Date() } }
            );
        }

        res.status(200).json({ status: 'success', data: listings });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
});

// ══════════════════════════════════════════════════════════════════════════════
// RETAILER / CONSUMER: Partial / Full Purchase
// Supports buying any quantity up to remainingQuantityKg.
// Status stays 'listed' or 'partially_sold' until stock hits 0 → then 'sold'.
// Blockchain Event: CROP_PURCHASE  |  STOCK_CLOSED (only when fully sold)
// ══════════════════════════════════════════════════════════════════════════════
router.post('/:id/purchase', protect, authorize('retailer', 'consumer'), async (req, res) => {
    try {
        const { quantityKg } = req.body;
        const app = await HarvestApplication.findById(req.params.id);

        if (!app) return res.status(404).json({ status: 'fail', message: 'Listing not found' });

        // Allow purchase when listed or partially sold
        if (!['batch_recorded', 'listed', 'partially_sold'].includes(app.status)) {
            return res.status(400).json({
                status: 'fail',
                message: app.status === 'sold'
                    ? '❌ This crop is Sold Out. No stock remaining.'
                    : 'This crop is not available for purchase yet.'
            });
        }

        // ── Calculate available stock ──────────────────────────────────────
        const totalWeight = app.batchRecordedWeight || app.quantityKg;
        const alreadySold = app.soldQuantityKg || 0;
        const available = totalWeight - alreadySold;

        if (available <= 0) {
            app.status = 'sold';
            await app.save();
            return res.status(400).json({ status: 'fail', message: '❌ This crop is Sold Out. No stock remaining.' });
        }

        // ── Validate requested quantity ────────────────────────────────────
        if (!quantityKg || Number(quantityKg) <= 0) {
            return res.status(400).json({
                status: 'fail',
                message: `Please specify a valid quantity. Available stock: ${available}kg.`
            });
        }

        const purchaseQty = Number(quantityKg);
        if (purchaseQty > available) {
            return res.status(400).json({
                status: 'fail',
                message: `❌ Requested ${purchaseQty}kg exceeds available stock of ${available}kg. Please enter ≤ ${available}kg.`
            });
        }

        // ── Price & refs ───────────────────────────────────────────────────
        const totalAmount = app.finalPricePerKg * purchaseQty;
        const purchaseRef = `PUR-${Date.now().toString(36).toUpperCase()}`;

        // ── Log on blockchain ──────────────────────────────────────────────
        const bcResult = await blockchain.logAction('CROP_PURCHASE', {
            applicationId: app.applicationId,
            batchId: app.batchId,
            buyer: req.user.name,
            role: req.user.role,
            quantityKg: purchaseQty,
            pricePerKg: app.finalPricePerKg,
            totalAmount,
            remainingAfter: available - purchaseQty
        });

        // ── Update quantities ──────────────────────────────────────────────
        app.soldQuantityKg = alreadySold + purchaseQty;
        app.remainingQuantityKg = totalWeight - app.soldQuantityKg;
        app.purchaseTotalAmount = (app.purchaseTotalAmount || 0) + totalAmount;

        // ── Add to purchases array ─────────────────────────────────────────
        app.purchases.push({
            purchaseRef,
            buyerId: req.user._id,
            buyerName: req.user.name,
            buyerRole: req.user.role,
            purchaseDate: new Date(),
            quantityKg: purchaseQty,
            pricePerKg: app.finalPricePerKg,
            totalAmount,
            txHash: bcResult.txHash
        });

        // ── Determine new status ───────────────────────────────────────────
        const isFullySold = app.remainingQuantityKg <= 0;
        if (isFullySold) {
            app.status = 'sold'; // Sold Out
        } else if (app.soldQuantityKg > 0) {
            app.status = 'partially_sold'; // Still has remaining stock
        }

        // Legacy field update (newest buyer)
        app.buyerId = req.user._id;
        app.buyerName = req.user.name;
        app.buyerRole = req.user.role;
        app.purchaseDate = new Date();
        app.purchaseQuantityKg = purchaseQty;
        app.purchaseRef = purchaseRef;
        app.txHash = bcResult.txHash;

        // ── Blockchain event trail ─────────────────────────────────────────
        app.blockchainEvents.push({
            action: 'CROP_PURCHASE',
            txHash: bcResult.txHash,
            actor: req.user.name,
            details: {
                purchaseRef,
                quantityKg: purchaseQty,
                totalAmount,
                buyerRole: req.user.role,
                soldSoFar: app.soldQuantityKg,
                remainingStock: app.remainingQuantityKg
            }
        });

        // Only emit STOCK_CLOSED when fully sold
        if (isFullySold) {
            app.blockchainEvents.push({
                action: 'STOCK_CLOSED',
                txHash: bcResult.txHash,
                actor: 'System (TNAS)',
                details: {
                    message: 'All stock sold. Product removed from marketplace.',
                    totalSoldKg: app.soldQuantityKg,
                    totalRevenue: app.purchaseTotalAmount,
                    ref: purchaseRef
                }
            });
        }

        await app.save();

        const result = app.toObject();
        delete result.photoUrls;

        res.status(200).json({
            status: 'success',
            data: {
                purchase: result,
                summary: {
                    purchaseRef,
                    quantityBought: purchaseQty,
                    pricePerKg: app.finalPricePerKg,
                    totalPaid: totalAmount,
                    remainingStock: app.remainingQuantityKg,
                    isSoldOut: isFullySold
                }
            },
            message: isFullySold
                ? `✅ Purchase confirmed! ${purchaseQty}kg × ₹${app.finalPricePerKg}/kg = ₹${totalAmount.toLocaleString('en-IN')}. Ref: ${purchaseRef}. 🔒 Stock is now SOLD OUT.`
                : `✅ Purchase confirmed! ${purchaseQty}kg × ₹${app.finalPricePerKg}/kg = ₹${totalAmount.toLocaleString('en-IN')}. Ref: ${purchaseRef}. Remaining stock: ${app.remainingQuantityKg}kg still available.`
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
});

// ══════════════════════════════════════════════════════════════════════════════
// TNAS (REGULATOR): Monitor all applications & blockchain events
// Full visibility into every workflow step
// ══════════════════════════════════════════════════════════════════════════════
router.get('/tnas-monitor', protect, authorize('regulator'), async (req, res) => {
    try {
        const filter = {};
        if (req.query.status) filter.status = req.query.status;
        if (req.query.district) filter.farmerDistrict = { $regex: req.query.district, $options: 'i' };
        if (req.query.cropType) filter.cropType = { $regex: req.query.cropType, $options: 'i' };

        const apps = await HarvestApplication.find(filter)
            .select('-photoUrls')
            .sort({ submittedAt: -1 })
            .limit(100);

        // Aggregate stats
        const stats = {
            total: apps.length,
            pending: apps.filter(a => a.status === 'pending').length,
            inspecting: apps.filter(a => a.status === 'inspecting').length,
            approved: apps.filter(a => a.status === 'approved').length,
            batchRecorded: apps.filter(a => a.status === 'batch_recorded').length,
            listed: apps.filter(a => a.status === 'listed').length,
            partiallySold: apps.filter(a => a.status === 'partially_sold').length,
            sold: apps.filter(a => a.status === 'sold').length,
            rejected: apps.filter(a => a.status === 'rejected').length,
            expired: apps.filter(a => a.status === 'expired').length,
            totalBlockchainEvents: apps.reduce((sum, a) => sum + (a.blockchainEvents?.length || 0), 0),
            totalValueTraded: apps.filter(a => a.status === 'sold').reduce((sum, a) => sum + (a.purchaseTotalAmount || 0), 0)
        };

        res.status(200).json({ status: 'success', data: apps, stats });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
});

// ══════════════════════════════════════════════════════════════════════════════
// Get single application details with full blockchain trail
// ══════════════════════════════════════════════════════════════════════════════
// Public route for tracing
router.get('/:id', async (req, res) => {
    try {
        const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id);
        const app = await HarvestApplication.findOne({
            $or: [
                ...(isObjectId ? [{ _id: req.params.id }] : []),
                { applicationId: req.params.id },
                { batchId: req.params.id }
            ]
        });
        if (!app) return res.status(404).json({ status: 'fail', message: 'Application not found' });
        res.status(200).json({ status: 'success', data: app });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
});

module.exports = router;
