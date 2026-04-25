const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Batch = require('../models/Batch');
const blockchain = require('../utils/blockchain');
const { protect } = require('../middleware/auth');

// Log a new milestone event
router.post('/', protect, async (req, res) => {
    try {
        const { batchId, stage, location, gps, details } = req.body;

        // Check if batch exists
        const batch = await Batch.findOne({ batchId });
        if (!batch) return res.status(404).json({ message: 'Batch not found' });

        // Blockchain logging
        const bcResult = await blockchain.logAction('LOG_EVENT', {
            batchId, stage, actor: req.user.name, location
        });

        const event = await Event.create({
            batchId,
            stage,
            actor: req.user._id,
            actorName: req.user.name,
            location,
            gps,
            details,
            txHash: bcResult.txHash,
            blockchainVerified: bcResult.verified
        });

        // Update batch status
        batch.currentStage = stage;
        await batch.save();

        res.status(201).json({ status: 'success', data: event });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
});

// Get all events (system overview for admin)
router.get('/', protect, async (req, res) => {
    try {
        const events = await Event.find().sort('-timestamp');
        res.status(200).json({ status: 'success', results: events.length, data: events });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
});

// Get events for a batch (public for trace)
router.get('/:batchId', async (req, res) => {
    try {
        const events = await Event.find({ batchId: req.params.batchId }).sort('timestamp');
        res.status(200).json({ status: 'success', results: events.length, data: events });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
});

module.exports = router;
