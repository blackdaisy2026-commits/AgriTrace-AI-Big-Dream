const express = require('express');
const router = express.Router();
const CompensationClaim = require('../models/CompensationClaim');
const blockchain = require('../utils/blockchain');
const { protect, authorize } = require('../middleware/auth');

// ══════════════════════════════════════════════════════════════════════════════
// FARMER: Submit new relief fund claim (no price — farmer only describes damage)
// ══════════════════════════════════════════════════════════════════════════════
router.post('/', protect, authorize('farmer'), async (req, res) => {
    try {
        const {
            uzhavarAttaiNo, aadhaarNo, mobileNo, address,
            district, taluk, village,
            landDetails, pattaNo, surveyNo, landAreaAcres,
            cropType, cropSeason,
            damageReason, damageDate, damageDescription,
            cropDamageStage, estimatedLossAcres,
            photoUrls, photoGpsCoords
        } = req.body;

        if (!photoUrls || photoUrls.length === 0) {
            return res.status(400).json({
                status: 'fail',
                message: 'Geo-tagged photos are mandatory. Please upload at least one photo of the damaged crop.'
            });
        }

        // Log on blockchain
        const bcResult = await blockchain.logAction('RELIEF_APPLICATION', {
            farmerId: req.user._id,
            farmerName: req.user.name,
            cropType,
            damageReason,
            district: district || req.user.district
        });

        const claim = await CompensationClaim.create({
            farmerId: req.user._id,
            farmerName: req.user.name,
            uzhavarAttaiNo, aadhaarNo, mobileNo, address,
            district: district || req.user.district,
            taluk: taluk || req.user.taluk,
            village: village || req.user.location,
            landDetails, pattaNo, surveyNo, landAreaAcres,
            cropType, cropSeason,
            damageReason, damageDate, damageDescription,
            cropDamageStage, estimatedLossAcres,
            photoUrls: photoUrls || [],
            photoGpsCoords: photoGpsCoords || [],
            status: 'pending',
            blockchainEvents: [{
                action: 'RELIEF_APPLICATION',
                txHash: bcResult.txHash,
                actor: req.user.name,
                actorRole: 'farmer',
                timestamp: new Date(),
                details: { cropType, damageReason, district: district || req.user.district, taluk: taluk || req.user.taluk, landDetails, photosUploaded: photoUrls?.length || 0 }
            }]
        });

        res.status(201).json({
            status: 'success',
            data: { claim: { _id: claim._id, claimRefNo: claim.claimRefNo, status: claim.status } },
            message: `✅ Claim submitted successfully! Reference: ${claim.claimRefNo}. Processor (Field Officer) will inspect your land within 3 days.`
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
});

// ══════════════════════════════════════════════════════════════════════════════
// FARMER: My claims (with status tracking)
// ══════════════════════════════════════════════════════════════════════════════
router.get('/my-claims', protect, authorize('farmer'), async (req, res) => {
    try {
        const claims = await CompensationClaim.find({ farmerId: req.user._id })
            .select('-photoUrls')
            .sort({ createdAt: -1 });
        res.status(200).json({ status: 'success', data: claims });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
});

// ══════════════════════════════════════════════════════════════════════════════
// PROCESSOR: Get pending claims for inspection (district-filtered)
// ══════════════════════════════════════════════════════════════════════════════
router.get('/for-inspection', protect, authorize('processor', 'regulator'), async (req, res) => {
    try {
        const filter = {
            status: { $in: ['pending', 'processor_review', 'processor_approved', 'processor_rejected'] }
        };
        if (req.user.role === 'processor' && req.user.district) {
            filter.district = req.user.district;
        }
        const claims = await CompensationClaim.find(filter)
            .select('-photoUrls')
            .sort({ createdAt: -1 });
        res.status(200).json({ status: 'success', data: claims });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
});

// ══════════════════════════════════════════════════════════════════════════════
// PROCESSOR: Get single claim WITH photos (for inspection view)
// ══════════════════════════════════════════════════════════════════════════════
router.get('/:id/details', protect, authorize('processor', 'tahsildar', 'regulator'), async (req, res) => {
    try {
        const claim = await CompensationClaim.findById(req.params.id);
        if (!claim) return res.status(404).json({ status: 'fail', message: 'Claim not found' });
        res.status(200).json({ status: 'success', data: claim });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
});

// ══════════════════════════════════════════════════════════════════════════════
// PROCESSOR: Submit field inspection + damage analysis + relief amount quote
// ══════════════════════════════════════════════════════════════════════════════
router.patch('/:id/inspect', protect, authorize('processor'), async (req, res) => {
    try {
        const {
            inspectionNotes, estimatedAmount, approved,
            totalLandInspectedAcres, damagedLandAcres,
            damageLevelPercent, cropDamageGrade
        } = req.body;

        const claim = await CompensationClaim.findById(req.params.id);
        if (!claim) return res.status(404).json({ status: 'fail', message: 'Claim not found' });
        if (!['pending', 'processor_review'].includes(claim.status)) {
            return res.status(400).json({ status: 'fail', message: 'Claim is not in a state that can be inspected.' });
        }

        if (approved && (!estimatedAmount || estimatedAmount <= 0)) {
            return res.status(400).json({ status: 'fail', message: 'Relief amount must be quoted when approving a claim.' });
        }

        claim.processorId = req.user._id;
        claim.processorName = req.user.name;
        claim.processorEmployeeId = req.user.employeeId;
        claim.inspectionDate = new Date();
        claim.inspectionNotes = inspectionNotes;
        claim.estimatedAmount = estimatedAmount;
        claim.totalLandInspectedAcres = totalLandInspectedAcres;
        claim.damagedLandAcres = damagedLandAcres;
        claim.damageLevelPercent = damageLevelPercent;
        claim.cropDamageGrade = cropDamageGrade;
        claim.processorApproval = approved;
        claim.processorApprovedAt = new Date();
        claim.status = approved ? 'processor_approved' : 'processor_rejected';

        // Blockchain event
        const bcResult = await blockchain.logAction('PROCESSOR_FIELD_INSPECTION', {
            claimId: claim.claimRefNo,
            processor: req.user.name,
            approved,
            estimatedAmount,
            damageLevelPercent
        });
        claim.blockchainEvents.push({
            action: 'PROCESSOR_FIELD_INSPECTION',
            txHash: bcResult.txHash,
            actor: req.user.name,
            actorRole: 'processor',
            timestamp: new Date(),
            details: {
                approved,
                totalLandInspectedAcres,
                damagedLandAcres,
                damageLevelPercent: `${damageLevelPercent}%`,
                cropDamageGrade,
                estimatedAmount: `₹${estimatedAmount}`,
                inspectionNotes
            }
        });

        await claim.save();

        const result = claim.toObject();
        delete result.photoUrls;

        res.status(200).json({
            status: 'success',
            data: { claim: result },
            message: approved
                ? `✅ Inspection complete. Relief amount ₹${estimatedAmount?.toLocaleString('en-IN')} quoted. Forwarded to Tahsildar for verification.`
                : '❌ Claim rejected after field inspection.'
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
});

// ══════════════════════════════════════════════════════════════════════════════
// TAHSILDAR: Get claims pending Tahsildar verification
// District filter uses case-insensitive regex to handle Tamil suffix variations
// ══════════════════════════════════════════════════════════════════════════════
router.get('/for-tahsildar', protect, authorize('tahsildar', 'regulator'), async (req, res) => {
    try {
        const filter = {
            // Include all stages the Tahsildar needs to see:
            // processor_approved → awaiting Tahsildar review
            // tahsildar_review / tahsildar_approved / tahsildar_rejected → already acted
            // dna_review / dna_approved → sent to TNAS (for tracking)
            status: {
                $in: [
                    'processor_approved',
                    'tahsildar_review',
                    'tahsildar_approved',
                    'tahsildar_rejected',
                    'dna_review',
                    'dna_approved',
                    'approved',
                    'disbursed'
                ]
            }
        };

        // Case-insensitive district & taluk filter: "Namakkal" matches "Namakkal - நாமக்கல்"
        if (req.user.role === 'tahsildar') {
            if (req.user.district) {
                // Extract just the first word/city part for matching
                const baseDistrict = req.user.district.split(/[\s-–]/)[0].trim();
                filter.district = { $regex: new RegExp(baseDistrict, 'i') };
            }

            // CRITICAL: Strictly filter by Taluk as requested
            if (req.user.taluk) {
                const baseTaluk = req.user.taluk.split(/[\s-–]/)[0].trim();
                filter.taluk = { $regex: new RegExp(baseTaluk, 'i') };
            }
        }

        const claims = await CompensationClaim.find(filter)
            .select('-photoUrls')
            .sort({ createdAt: -1 });

        res.status(200).json({ status: 'success', data: claims });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
});

// ══════════════════════════════════════════════════════════════════════════════
// TAHSILDAR: Verify and approve/reject
// RULE: Tahsildar can ONLY increase the processor-quoted amount, never decrease.
// ══════════════════════════════════════════════════════════════════════════════
router.patch('/:id/tahsildar-decision', protect, authorize('tahsildar'), async (req, res) => {
    try {
        const { approved, tahsildarNotes, tahsildarApprovedAmount } = req.body;

        const claim = await CompensationClaim.findById(req.params.id);
        if (!claim) return res.status(404).json({ status: 'fail', message: 'Claim not found' });
        if (!['processor_approved', 'tahsildar_review'].includes(claim.status)) {
            return res.status(400).json({ status: 'fail', message: 'Claim is not at Tahsildar verification stage.' });
        }

        // ── Determine final amount ────────────────────────────────────────────
        const processorAmount = claim.estimatedAmount || 0;
        let finalAmount = processorAmount;

        if (tahsildarApprovedAmount !== undefined && tahsildarApprovedAmount !== null && tahsildarApprovedAmount !== '') {
            const newAmt = Number(tahsildarApprovedAmount);
            // ENFORCE INCREASE-ONLY: Tahsildar cannot reduce the processor's quoted amount
            if (newAmt < processorAmount) {
                return res.status(400).json({
                    status: 'fail',
                    message: `❌ Tahsildar can only INCREASE the relief amount. Processor quoted ₹${processorAmount.toLocaleString('en-IN')} — you cannot enter an amount less than this.`
                });
            }
            finalAmount = newAmt;
        }

        claim.tahsildarId = req.user._id;
        claim.tahsildarName = req.user.name;
        claim.tahsildarVerificationDate = new Date();
        claim.tahsildarNotes = tahsildarNotes;
        claim.tahsildarApproval = approved;
        claim.tahsildarApprovedAt = new Date();
        claim.tahsildarApprovedAmount = finalAmount;
        claim.status = approved ? 'tahsildar_approved' : 'tahsildar_rejected';

        // Blockchain event
        const bcResult = await blockchain.logAction('TAHSILDAR_VERIFICATION', {
            claimId: claim.claimRefNo,
            tahsildar: req.user.name,
            approved,
            processorAmount,
            approvedAmount: finalAmount,
            increased: finalAmount > processorAmount
        });
        claim.blockchainEvents.push({
            action: 'TAHSILDAR_VERIFICATION',
            txHash: bcResult.txHash,
            actor: req.user.name,
            actorRole: 'tahsildar',
            timestamp: new Date(),
            details: {
                approved,
                tahsildarNotes,
                processorQuotedAmount: `₹${processorAmount}`,
                tahsildarApprovedAmount: `₹${finalAmount}`,
                amountIncreased: finalAmount > processorAmount,
                increaseBy: finalAmount > processorAmount ? `₹${finalAmount - processorAmount}` : '₹0'
            }
        });

        await claim.save();

        const result = claim.toObject();
        delete result.photoUrls;

        res.status(200).json({
            status: 'success',
            data: { claim: result },
            message: approved
                ? `✅ Tahsildar approved. Final Amount ₹${finalAmount.toLocaleString('en-IN')} forwarded to TNAS/DNA for final sanction and payment.`
                : `❌ Claim rejected by Tahsildar. Reason: ${tahsildarNotes || 'No reason provided.'}`
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
});

// ══════════════════════════════════════════════════════════════════════════════
// DNA (REGULATOR): Get all claims pending final sanction
// ══════════════════════════════════════════════════════════════════════════════
router.get('/', protect, authorize('regulator'), async (req, res) => {
    try {
        const { status } = req.query;
        const filter = status ? { status } : {};
        const claims = await CompensationClaim.find(filter)
            .select('-photoUrls')
            .sort({ createdAt: -1 });
        res.status(200).json({ status: 'success', data: claims });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
});

// ── ADMIN: Get single claim ───────────────────────────────────────────────────
router.get('/:id', protect, async (req, res) => {
    try {
        const claim = await CompensationClaim.findById(req.params.id);
        if (!claim) return res.status(404).json({ status: 'fail', message: 'Claim not found' });
        res.status(200).json({ status: 'success', data: claim });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
});

// ══════════════════════════════════════════════════════════════════════════════
// DNA (REGULATOR): Final sanction + disbursement
// ══════════════════════════════════════════════════════════════════════════════
router.patch('/:id/admin-decision', protect, authorize('regulator'), async (req, res) => {
    try {
        const { approved, approvedAmount, adminNotes, transactionRef } = req.body;
        const claim = await CompensationClaim.findById(req.params.id);
        if (!claim) return res.status(404).json({ status: 'fail', message: 'Claim not found' });
        if (!['tahsildar_approved', 'dna_review'].includes(claim.status)) {
            return res.status(400).json({ status: 'fail', message: 'Claim has not completed Tahsildar verification.' });
        }

        claim.adminId = req.user._id;
        claim.adminNotes = adminNotes;
        claim.approvedAmount = approvedAmount || claim.tahsildarApprovedAmount || claim.estimatedAmount;
        claim.adminApproval = approved;
        claim.adminApprovedAt = new Date();

        if (approved) {
            claim.status = transactionRef ? 'disbursed' : 'approved';
            if (transactionRef) {
                claim.disbursedAmount = claim.approvedAmount;
                claim.disbursedAt = new Date();
                claim.transactionRef = transactionRef;
            }
        } else {
            claim.status = 'rejected';
        }

        // Blockchain event
        const bcResult = await blockchain.logAction('DNA_FINAL_SANCTION', {
            claimId: claim.claimRefNo,
            dna: req.user.name,
            approved,
            finalAmount: claim.approvedAmount,
            transactionRef
        });
        claim.blockchainEvents.push({
            action: approved ? (transactionRef ? 'DNA_FUND_DISBURSED' : 'DNA_SANCTIONED') : 'DNA_REJECTED',
            txHash: bcResult.txHash,
            actor: req.user.name,
            actorRole: 'regulator',
            timestamp: new Date(),
            details: {
                approved,
                finalAmount: `₹${claim.approvedAmount}`,
                adminNotes,
                ...(transactionRef ? { transactionRef, disbursedAt: new Date().toISOString() } : {})
            }
        });

        await claim.save();

        const result = claim.toObject();
        delete result.photoUrls;

        res.status(200).json({
            status: 'success',
            data: { claim: result },
            message: approved
                ? (transactionRef
                    ? `✅ Relief fund ₹${claim.approvedAmount?.toLocaleString('en-IN')} disbursed to farmer! Ref: ${transactionRef}`
                    : '✅ Claim sanctioned by DNA — awaiting disbursement.')
                : '❌ Claim finally rejected by DNA.'
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
});

// ══════════════════════════════════════════════════════════════════════════════
// PUBLIC: QR Trace — Full blockchain audit trail (no auth required)
// Anyone scanning the QR code can see the immutable audit trail
// ══════════════════════════════════════════════════════════════════════════════
router.get('/trace/:claimRef', async (req, res) => {
    try {
        const claim = await CompensationClaim.findOne({ claimRefNo: req.params.claimRef })
            .select('-photoUrls -aadhaarNo -mobileNo'); // Mask sensitive Aadhaar/mobile in public view
        if (!claim) return res.status(404).json({ status: 'fail', message: 'Relief claim not found' });
        res.status(200).json({ status: 'success', data: claim });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
});

module.exports = router;
