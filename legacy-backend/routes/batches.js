const express = require('express');
const router = express.Router();
const Batch = require('../models/Batch');
const blockchain = require('../utils/blockchain');
const { protect, authorize } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// Create a new batch (Farmers only)
router.post('/', protect, authorize('farmer'), async (req, res) => {
    try {
        const { cropType, weightKg, village, isOrganic, isFairTrade } = req.body;
        const batchId = `TN-${new Date().getFullYear()}-${uuidv4().substring(0, 8).toUpperCase()}`;

        // Initial blockchain logging
        const bcResult = await blockchain.logAction('CREATE_BATCH', {
            batchId, cropType, farmer: req.user.name, weightKg
        });

        const batch = await Batch.create({
            batchId,
            cropType,
            farmer: req.user._id,
            farmerName: req.user.name,
            village: village || req.user.location,
            district: req.user.district,
            weightKg,
            isOrganic,
            isFairTrade,
            txHash: bcResult.txHash,
            blockchainVerified: bcResult.verified
        });

        res.status(201).json({ status: 'success', data: batch });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
});

// Get all batches (with filters)
router.get('/', protect, async (req, res) => {
    try {
        const filter = {};
        if (req.user.role === 'farmer') filter.farmer = req.user._id;
        if (req.query.district) filter.district = req.query.district;

        const batches = await Batch.find(filter).sort('-createdAt');
        res.status(200).json({ status: 'success', results: batches.length, data: batches });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
});

// Get single batch by ID (public for trace)
router.get('/:batchId', async (req, res) => {
    try {
        const batch = await Batch.findOne({ batchId: req.params.batchId });
        if (!batch) return res.status(404).json({ message: 'Batch not found' });
        res.status(200).json({ status: 'success', data: batch });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
});

module.exports = router;
